/**
 * Short-lived, signed draft-preview links.
 *
 * Token = base64url(JSON{ id, exp }) + "." + HMAC-SHA256(PREVIEW_SECRET).
 * Minted only by an authenticated admin request; it grants read access to
 * one post (and its autosave) until it expires. Nothing else.
 */

import { hmac, safeEqual } from "./http.js";

export const PREVIEW_TTL_MS = 30 * 60 * 1000;

export function signPreviewToken(
  postId: string,
  secret: string,
  now = Date.now(),
  ttl = PREVIEW_TTL_MS,
): string {
  const payload = Buffer.from(JSON.stringify({ id: postId, exp: now + ttl })).toString("base64url");
  return `${payload}.${hmac(secret, payload)}`;
}

export function verifyPreviewToken(
  token: string,
  postId: string,
  secret: string,
  now = Date.now(),
): { ok: true } | { ok: false; reason: "malformed" | "signature" | "expired" | "post" } {
  const [payload, sig] = String(token).split(".");
  if (!payload || !sig) return { ok: false, reason: "malformed" };
  if (!safeEqual(sig, hmac(secret, payload))) return { ok: false, reason: "signature" };
  let data: { id?: unknown; exp?: unknown };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof data.exp !== "number" || data.exp < now) return { ok: false, reason: "expired" };
  if (data.id !== postId) return { ok: false, reason: "post" };
  return { ok: true };
}

/** PREVIEW_SECRET must be long enough to resist guessing. */
export function previewSecret(): string | null {
  const s = process.env.PREVIEW_SECRET ?? "";
  return s.length >= 32 ? s : null;
}
