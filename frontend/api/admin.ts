/**
 * /api/admin?action=…  - CMS-only operations that need server credentials.
 *
 *   POST preview-token { postId }  → { token, url, expiresAt }  signed draft-preview link
 *   POST rebuild       { reason? } → RebuildResult              queue a production rebuild
 *   POST run-scheduler             → SchedulerSummary            publish due posts now
 *   GET  status                    → integration + job status    (no secrets, only booleans)
 *
 * Every action requires a Firebase ID token for ADMIN_EMAIL (see _lib/auth.ts)
 * and is only callable cross-origin from ADMIN_ORIGINS.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth.js";
import { adminDb, hasAdminCredentials } from "./_lib/firebase.js";
import { adminCors, createRateLimiter, jsonBody } from "./_lib/http.js";
import { PREVIEW_TTL_MS, previewSecret, signPreviewToken } from "./_lib/preview-token.js";
import { triggerRebuild } from "./_lib/rebuild.js";
import { runScheduler } from "./_lib/scheduler.js";
import { BASE_URL } from "../src/lib/seo-content.js";

const limited = createRateLimiter({ windowMs: 60_000, max: 60 });
const POST_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (adminCors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");

  const action = String(req.query.action ?? "");
  const method = action === "status" ? "GET" : "POST";
  if (req.method !== method) {
    res.setHeader("Allow", `${method}, OPTIONS`);
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!hasAdminCredentials())
    return res.status(500).json({ error: "Firebase Admin credentials are not configured" });

  const auth = await requireAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  if (limited(auth.email)) return res.status(429).json({ error: "Too many requests" });

  const db = adminDb();
  try {
    switch (action) {
      case "preview-token": {
        const secret = previewSecret();
        if (!secret)
          return res.status(500).json({ error: "PREVIEW_SECRET is not configured (min 32 chars)" });
        const postId = String(jsonBody(req).postId ?? "");
        if (!POST_ID_RE.test(postId)) return res.status(400).json({ error: "Invalid postId" });
        if (!(await db.collection("blog_posts").doc(postId).get()).exists)
          return res.status(404).json({ error: "Post not found" });
        const token = signPreviewToken(postId, secret);
        return res.status(200).json({
          token,
          url: `${siteUrl()}/preview/${postId}?token=${encodeURIComponent(token)}`,
          expiresAt: new Date(Date.now() + PREVIEW_TTL_MS).toISOString(),
        });
      }
      case "rebuild": {
        const reason = String(jsonBody(req).reason ?? "content change").slice(0, 120);
        return res.status(200).json(await triggerRebuild(db, reason));
      }
      case "run-scheduler": {
        const summary = await runScheduler(db);
        const rebuild = summary.published.length ? await triggerRebuild(db, "scheduled publish") : null;
        return res.status(200).json({ ...summary, rebuild });
      }
      case "status": {
        const [scheduler, rebuild] = await Promise.all([
          db.collection("system").doc("scheduler").get(),
          db.collection("system").doc("rebuild").get(),
        ]);
        return res.status(200).json({
          integrations: integrationStatus(),
          scheduler: scheduler.exists ? scheduler.data() : null,
          rebuild: rebuild.exists ? rebuild.data() : null,
        });
      }
      default:
        return res.status(404).json({ error: "Unknown action" });
    }
  } catch (err) {
    console.error(`[admin] ${action} failed:`, err);
    return res.status(500).json({ error: "Request failed" });
  }
}

/** Public base URL of this deployment (PUBLIC_SITE_URL overrides for previews/local). */
function siteUrl() {
  return (process.env.PUBLIC_SITE_URL || BASE_URL).replace(/\/$/, "");
}

/** Which optional integrations are configured. Booleans only - never values. */
export function integrationStatus(env: NodeJS.ProcessEnv = process.env) {
  return {
    deployHook: !!env.VERCEL_DEPLOY_HOOK_URL,
    previewSecret: (env.PREVIEW_SECRET ?? "").length >= 32,
    cronSecret: (env.CRON_SECRET ?? "").length >= 16,
    analyticsSalt: (env.ANALYTICS_SALT ?? "").length >= 16,
    ga4: !!(env.GA4_PROPERTY_ID && env.GA4_SERVICE_ACCOUNT_EMAIL),
    searchConsole: !!(env.GSC_SITE_URL && env.GSC_SERVICE_ACCOUNT_EMAIL),
  };
}
