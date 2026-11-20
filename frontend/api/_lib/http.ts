/** Request helpers shared by the Vercel functions. */

import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return first?.split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

/**
 * Best-effort sliding-window limiter, per warm instance. It stops casual
 * floods; a distributed attacker needs an edge rule (Vercel Firewall).
 */
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    // Keep memory bounded on long-lived instances.
    if (hits.size > 5000) for (const k of hits.keys()) if (k !== key) hits.delete(k);
    return recent.length > max;
  };
}

/** Parses a JSON body that may arrive as text/plain (navigator.sendBeacon) or already parsed. */
export function jsonBody(req: VercelRequest): Record<string, unknown> {
  const body = req.body as unknown;
  if (body && typeof body === "object" && !Buffer.isBuffer(body)) return body as Record<string, unknown>;
  const text = Buffer.isBuffer(body) ? body.toString("utf8") : typeof body === "string" ? body : "";
  if (!text || text.length > 10_000) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function allowMethods(req: VercelRequest, res: VercelResponse, methods: string[]): boolean {
  if (methods.includes(req.method ?? "")) return true;
  res.setHeader("Allow", methods.join(", "));
  res.status(405).json({ error: "Method not allowed" });
  return false;
}

/** Origins allowed to call the admin endpoints (the CMS). Comma-separated in ADMIN_ORIGINS. */
export function adminOrigins(): string[] {
  return (process.env.ADMIN_ORIGINS ?? "https://admin.saadmaz.com")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

/**
 * CORS for the CMS. Returns true when the request was a handled preflight.
 * Credentials travel as a bearer token, never cookies, so no
 * Access-Control-Allow-Credentials.
 */
export function adminCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = String(req.headers.origin ?? "");
  res.setHeader("Vary", "Origin");
  if (adminOrigins().includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Max-Age", "600");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export const hmac = (secret: string, s: string) => createHmac("sha256", secret).update(s).digest("base64url");

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Common crawler / link-preview user agents, excluded from analytics. */
export const BOT_UA =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|headless|lighthouse/i;
