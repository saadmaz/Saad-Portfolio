/**
 * Newsletter subscription rules shared by api/subscribe.ts and its tests.
 *
 * Subscribers live in `subscribers/{sha256(email)}` (server-only; the
 * Firestore rules deny client writes). Sign-up is double opt-in: the
 * confirm link carries a signed, expiring token; unsubscribe links carry
 * a signed token that never expires.
 */

import { hmac, safeEqual, sha256 } from "./http.js";

/** Same ids as SERIES in src/lib/newsletter.ts (a test keeps them in sync). */
export const SERIES = [
  "building-in-public",
  "ai-and-technology",
  "startups",
  "personal-branding",
  "ai-tutorials",
  "tech-news",
] as const;
export type Series = (typeof SERIES)[number];

/** Topic ids from before the six series, still sent by cached pages. */
const LEGACY: Record<string, Series[]> = {
  founder: ["building-in-public", "startups", "personal-branding"],
  cse: ["ai-and-technology", "ai-tutorials", "tech-news"],
};

export const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const subscriberId = (email: string) => sha256(email.trim().toLowerCase());

export type SubscribeInput = { email: string; topics: Series[] };

export function validateSubscribe(
  body: unknown,
): { ok: true; value: SubscribeInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254)
    return { ok: false, error: "Please enter a valid email address." };
  const raw = (Array.isArray(b.topics) ? b.topics : []).flatMap((t) => LEGACY[String(t)] ?? [t]);
  const topics = SERIES.filter((s) => raw.includes(s));
  return { ok: true, value: { email, topics: topics.length ? topics : [...SERIES] } };
}

export type TokenAction = "confirm" | "unsub";

export function signToken(action: TokenAction, id: string, secret: string, now = Date.now()): string {
  const exp = action === "confirm" ? now + CONFIRM_TTL_MS : 0;
  const payload = Buffer.from(JSON.stringify({ a: action, id, exp })).toString("base64url");
  return `${payload}.${hmac(secret, payload)}`;
}

export function verifyToken(
  token: unknown,
  action: TokenAction,
  secret: string,
  now = Date.now(),
): { ok: true; id: string } | { ok: false; reason: "malformed" | "signature" | "expired" | "action" } {
  const [payload, sig] = String(token ?? "").split(".");
  if (!payload || !sig) return { ok: false, reason: "malformed" };
  if (!safeEqual(sig, hmac(secret, payload))) return { ok: false, reason: "signature" };
  let data: { a?: unknown; id?: unknown; exp?: unknown };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (data.a !== action || typeof data.id !== "string") return { ok: false, reason: "action" };
  if (typeof data.exp !== "number" || (data.exp !== 0 && data.exp < now))
    return { ok: false, reason: "expired" };
  return { ok: true, id: data.id };
}

/** SUBSCRIBE_SECRET, falling back to PREVIEW_SECRET; must be long enough to resist guessing. */
export function subscribeSecret(): string | null {
  const s = process.env.SUBSCRIBE_SECRET || process.env.PREVIEW_SECRET || "";
  return s.length >= 32 ? s : null;
}
