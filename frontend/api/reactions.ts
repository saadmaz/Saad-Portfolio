/**
 * POST /api/reactions { postId, reaction }  → { counts, reacted }
 *
 * Toggles one anonymous reaction. No accounts: a voter is identified by a
 * keyed hash of (IP, user agent, post, reaction), so the raw IP is never
 * stored and the hash can't be reversed without REACTIONS_SALT. Abuse
 * controls: per-IP rate limit, one vote per voter/reaction, reactions only
 * on live posts that allow them, and a site-wide switch in blog settings.
 *
 * Counts live in blog_reactions/{postId} (public read, server write only).
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, hasAdminCredentials } from "./_lib/firebase";
import { allowMethods, BOT_UA, clientIp, createRateLimiter, hmac, jsonBody } from "./_lib/http";
import { REACTION_IDS } from "../src/lib/article-core.js";

const limited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 30 });
const POST_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export function validateReaction(
  body: Record<string, unknown>,
): { ok: true; postId: string; reaction: string } | { ok: false; error: string } {
  const postId = typeof body.postId === "string" ? body.postId : "";
  const reaction = typeof body.reaction === "string" ? body.reaction : "";
  if (!POST_ID_RE.test(postId)) return { ok: false, error: "Invalid post" };
  if (!REACTION_IDS.includes(reaction)) return { ok: false, error: "Invalid reaction" };
  return { ok: true, postId, reaction };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  res.setHeader("Cache-Control", "no-store");
  const ua = String(req.headers["user-agent"] ?? "");
  if (BOT_UA.test(ua)) return res.status(403).json({ error: "Not allowed" });
  const ip = clientIp(req);
  if (limited(ip)) return res.status(429).json({ error: "Too many reactions. Try again later." });

  const input = validateReaction(jsonBody(req));
  if (!input.ok) return res.status(400).json({ error: input.error });
  const salt = process.env.REACTIONS_SALT || process.env.ANALYTICS_SALT;
  if (!salt || !hasAdminCredentials()) return res.status(500).json({ error: "Reactions are not configured" });

  const db = adminDb();
  try {
    const [post, settings] = await Promise.all([
      db.collection("blog_posts").doc(input.postId).get(),
      db.collection("blog_settings").doc("config").get(),
    ]);
    if (!post.exists || post.get("published") !== true)
      return res.status(404).json({ error: "Post not found" });
    if (post.get("reactionsEnabled") === false || settings.get("reactionsEnabled") === false)
      return res.status(403).json({ error: "Reactions are turned off for this article" });

    const voteRef = db
      .collection("reaction_votes")
      .doc(hmac(salt, `${ip}|${ua}|${input.postId}|${input.reaction}`));
    const countsRef = db.collection("blog_reactions").doc(input.postId);
    const reacted = await db.runTransaction(async (tx) => {
      const vote = await tx.get(voteRef);
      if (vote.exists) {
        tx.delete(voteRef);
        tx.set(countsRef, { [input.reaction]: FieldValue.increment(-1) }, { merge: true });
        return false;
      }
      tx.create(voteRef, { postId: input.postId, reaction: input.reaction, at: new Date().toISOString() });
      tx.set(countsRef, { [input.reaction]: FieldValue.increment(1) }, { merge: true });
      return true;
    });
    const counts = (await countsRef.get()).data() ?? {};
    return res.status(200).json({ counts, reacted, reaction: input.reaction });
  } catch (err) {
    console.error("[reactions] failed:", err);
    return res.status(500).json({ error: "Could not save your reaction" });
  }
}
