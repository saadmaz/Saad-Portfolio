/**
 * GET /api/preview?id=<postId>&token=<signed token>
 *
 * Returns one post - draft, scheduled or live - for the /preview/:id page,
 * with any pending autosave (unpublished edits to a live post) merged in.
 * Requires a valid, unexpired token minted by /api/admin?action=preview-token.
 * Responses are never cached and never indexed.
 */

import type { ApiRequest, ApiResponse } from "./_lib/adapter.js";
import { adminDb, hasAdminCredentials } from "./_lib/firebase.js";
import { allowMethods, clientIp, createRateLimiter } from "./_lib/http.js";
import { previewSecret, verifyPreviewToken } from "./_lib/preview-token.js";

const limited = createRateLimiter({ windowMs: 60_000, max: 60 });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["GET"])) return;
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (limited(clientIp(req))) return res.status(429).json({ error: "Too many requests" });

  const secret = previewSecret();
  if (!secret || !hasAdminCredentials()) return res.status(500).json({ error: "Preview is not configured" });

  const id = String(req.query.id ?? "");
  const check = verifyPreviewToken(String(req.query.token ?? ""), id, secret);
  if (!check.ok) {
    return res.status(check.reason === "expired" ? 410 : 403).json({
      error:
        check.reason === "expired"
          ? "This preview link has expired. Open a new preview from the CMS."
          : "Invalid preview link",
    });
  }

  try {
    const db = adminDb();
    const [post, autosave] = await Promise.all([
      db.collection("blog_posts").doc(id).get(),
      db.collection("blog_autosaves").doc(id).get(),
    ]);
    if (!post.exists) return res.status(404).json({ error: "Post not found" });
    const pending = autosave.exists
      ? (autosave.get("data") as Record<string, unknown> | undefined)
      : undefined;
    return res.status(200).json({
      post: { ...post.data(), ...(pending ?? {}), id },
      hasPendingChanges: !!pending,
    });
  } catch (err) {
    console.error("[preview] failed:", err);
    return res.status(500).json({ error: "Could not load preview" });
  }
}
