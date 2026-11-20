/**
 * POST /api/track  (sent with navigator.sendBeacon, so body may be text/plain)
 *
 *   { t: "view",   postId, ref? }          article page view
 *   { t: "engage", postId, ms, depth }     time engaged + max scroll depth (%)
 *   { t: "404",    path, ref? }            a missing page was requested
 *
 * First-party, privacy-minded analytics:
 *   - stores aggregate counters only (blog_stats/{postId}, …/days/{date});
 *   - unique visitors are counted with a keyed hash of (day, IP, UA) that
 *     changes daily and can't be reversed or linked across days;
 *   - referrers are reduced to a host name; 404 paths drop query strings;
 *   - bots, Do-Not-Track and Global Privacy Control requests are ignored.
 * Env: ANALYTICS_SALT (≥16 chars). Without it nothing is recorded.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { adminDb, hasAdminCredentials } from "./_lib/firebase";
import { allowMethods, BOT_UA, clientIp, createRateLimiter, hmac, jsonBody, sha256 } from "./_lib/http";

const limited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 150 });
const POST_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_ENGAGED_MS = 30 * 60 * 1000;

export type TrackEvent =
  | { t: "view"; postId: string; refHost: string }
  | { t: "engage"; postId: string; ms: number; depth: number }
  | { t: "404"; path: string; refHost: string };

/** Referrer → bare host, or "direct". Same-site referrers count as "internal". */
export function refHostOf(ref: unknown, ownHost = "saadmaz.com"): string {
  if (typeof ref !== "string" || !ref) return "direct";
  try {
    const host = new URL(ref).hostname.toLowerCase().replace(/^www\./, "");
    if (!host) return "direct";
    if (host === ownHost || host.endsWith(`.${ownHost}`)) return "internal";
    return host.slice(0, 60);
  } catch {
    return "direct";
  }
}

/** Firestore map keys can't contain dots when used in update paths. */
export const fieldKey = (host: string) => host.replace(/[^a-z0-9-]/g, "_");

export function parseTrackEvent(body: Record<string, unknown>): TrackEvent | null {
  const t = body.t;
  if (t === "view" || t === "engage") {
    const postId = typeof body.postId === "string" ? body.postId : "";
    if (!POST_ID_RE.test(postId)) return null;
    if (t === "view") return { t, postId, refHost: refHostOf(body.ref) };
    const ms = Number(body.ms);
    const depth = Number(body.depth);
    if (!Number.isFinite(ms) || !Number.isFinite(depth)) return null;
    return {
      t,
      postId,
      ms: Math.min(Math.max(0, Math.round(ms)), MAX_ENGAGED_MS),
      depth: Math.min(Math.max(0, depth), 100),
    };
  }
  if (t === "404") {
    const raw = typeof body.path === "string" ? body.path : "";
    const path = raw.split(/[?#]/)[0].slice(0, 300);
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    return { t, path, refHost: refHostOf(body.ref) };
  }
  return null;
}

/** 25/50/75/100 bucket for a max scroll depth, or null below 25%. */
export function depthBucket(depth: number): "d25" | "d50" | "d75" | "d100" | null {
  if (depth >= 95) return "d100";
  if (depth >= 75) return "d75";
  if (depth >= 50) return "d50";
  if (depth >= 25) return "d25";
  return null;
}

// Published-post check, cached per warm instance so a view costs no extra read.
const liveCache = new Map<string, { live: boolean; at: number }>();
async function isLive(db: Firestore, postId: string) {
  const hit = liveCache.get(postId);
  if (hit && Date.now() - hit.at < 5 * 60 * 1000) return hit.live;
  const snap = await db.collection("blog_posts").doc(postId).get();
  const live = snap.exists && snap.get("published") === true;
  liveCache.set(postId, { live, at: Date.now() });
  return live;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  res.setHeader("Cache-Control", "no-store");
  const ua = String(req.headers["user-agent"] ?? "");
  const optedOut = req.headers.dnt === "1" || req.headers["sec-gpc"] === "1";
  const salt = process.env.ANALYTICS_SALT ?? "";
  if (BOT_UA.test(ua) || optedOut || salt.length < 16 || !hasAdminCredentials()) return res.status(204).end();
  const ip = clientIp(req);
  if (limited(ip)) return res.status(429).end();

  const event = parseTrackEvent(jsonBody(req));
  if (!event) return res.status(400).json({ error: "Invalid event" });

  const db = adminDb();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  try {
    if (event.t === "404") {
      const ref = db.collection("not_found").doc(sha256(event.path).slice(0, 40));
      await db.runTransaction(async (tx) => {
        const exists = (await tx.get(ref)).exists;
        tx.set(
          ref,
          {
            path: event.path,
            count: FieldValue.increment(1),
            lastSeen: now.toISOString(),
            ...(exists ? {} : { firstSeen: now.toISOString() }),
            referrers: { [fieldKey(event.refHost)]: FieldValue.increment(1) },
          },
          { merge: true },
        );
      });
      return res.status(204).end();
    }

    if (!(await isLive(db, event.postId))) return res.status(204).end();
    const stats = db.collection("blog_stats").doc(event.postId);
    const day = stats.collection("days").doc(date);

    if (event.t === "view") {
      const visitor = day.collection("visitors").doc(hmac(salt, `${date}|${ip}|${ua}`));
      let unique = 0;
      try {
        await visitor.create({ at: now.toISOString() });
        unique = 1;
      } catch {
        // Already counted today (ALREADY_EXISTS).
      }
      const inc = { views: FieldValue.increment(1), uniques: FieldValue.increment(unique) };
      const batch = db.batch();
      batch.set(
        stats,
        {
          ...inc,
          lastViewAt: now.toISOString(),
          referrers: { [fieldKey(event.refHost)]: FieldValue.increment(1) },
        },
        { merge: true },
      );
      batch.set(day, { ...inc, date }, { merge: true });
      await batch.commit();
    } else {
      const bucket = depthBucket(event.depth);
      const inc = {
        engagedMs: FieldValue.increment(event.ms),
        engagedSamples: FieldValue.increment(1),
        ...(bucket ? { depth: { [bucket]: FieldValue.increment(1) } } : {}),
      };
      const batch = db.batch();
      batch.set(stats, inc, { merge: true });
      batch.set(day, { ...inc, date }, { merge: true });
      await batch.commit();
    }
    return res.status(204).end();
  } catch (err) {
    console.error("[track] failed:", err);
    return res.status(500).end();
  }
}
