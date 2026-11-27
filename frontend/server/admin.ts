/**
 * /api/admin?action=…  - CMS-only operations that need server credentials.
 *
 *   POST preview-token { postId }  → { token, url, expiresAt }  signed draft-preview link
 *   POST rebuild       { reason? } → RebuildResult              queue a production rebuild
 *   POST run-scheduler             → SchedulerSummary            publish due posts now
 *   GET  status                    → integration + job status    (no secrets, only booleans)
 *   GET  ga4-report                → Ga4Report                   last 28 days from the GA4 Data API
 *   GET  gsc-report                → GscReport                   last 28 days from Search Console
 *
 * Every action requires a Firebase ID token for ADMIN_EMAIL (see _lib/auth.ts)
 * and is only callable cross-origin from ADMIN_ORIGINS.
 */

import type { ApiRequest, ApiResponse } from "./_lib/adapter.js";
import { requireAdmin } from "./_lib/auth.js";
import { adminDb, hasAdminCredentials } from "./_lib/firebase.js";
import { adminCors, createRateLimiter, jsonBody } from "./_lib/http.js";
import { ga4Configured, ga4Report, GoogleApiError, gscConfigured, gscReport } from "./_lib/insights.js";
import { PREVIEW_TTL_MS, previewSecret, signPreviewToken } from "./_lib/preview-token.js";
import { triggerRebuild } from "./_lib/rebuild.js";
import { runScheduler } from "./_lib/scheduler.js";
import { BASE_URL } from "../src/lib/seo-content.js";

const limited = createRateLimiter({ windowMs: 60_000, max: 60 });
const POST_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const GET_ACTIONS = new Set(["status", "ga4-report", "gsc-report"]);

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (adminCors(req, res)) return;
  res.setHeader("Cache-Control", "no-store");

  const action = String(req.query.action ?? "");
  const method = GET_ACTIONS.has(action) ? "GET" : "POST";
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
      case "ga4-report": {
        if (!ga4Configured())
          return res
            .status(409)
            .json({ error: "GA4_PROPERTY_ID is not set on the site (numeric property ID)" });
        return res.status(200).json(await ga4Report());
      }
      case "gsc-report": {
        if (!gscConfigured()) return res.status(409).json({ error: "GSC_SITE_URL is not set on the site" });
        return res.status(200).json(await gscReport());
      }
      default:
        return res.status(404).json({ error: "Unknown action" });
    }
  } catch (err) {
    // Google's own message ("permission denied", "API not enabled"…) tells the author what to fix.
    if (err instanceof GoogleApiError) return res.status(502).json({ error: `Google: ${err.message}` });
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
    deployHook: !!env.DEPLOY_HOOK_URL,
    previewSecret: (env.PREVIEW_SECRET ?? "").length >= 32,
    cronSecret: (env.CRON_SECRET ?? "").length >= 16,
    analyticsSalt: (env.ANALYTICS_SALT ?? "").length >= 16,
    ga4: ga4Configured(env),
    searchConsole: gscConfigured(env),
  };
}
