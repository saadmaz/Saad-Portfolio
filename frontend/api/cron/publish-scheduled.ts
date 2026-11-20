/**
 * GET /api/cron/publish-scheduled
 *
 * Publishes every scheduled post whose time has come. Called by:
 *   - Vercel Cron (vercel.json "crons"; Vercel sends `Authorization: Bearer $CRON_SECRET`),
 *   - the GitHub Actions workflow .github/workflows/publish-scheduled.yml (every 10 min),
 *   - the CMS "Run scheduler now" button (via /api/admin?action=run-scheduler).
 * Overlapping calls are safe: see api/_lib/scheduler.ts.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminDb, hasAdminCredentials } from "../_lib/firebase.js";
import { safeEqual } from "../_lib/http.js";
import { triggerRebuild } from "../_lib/rebuild.js";
import { runScheduler } from "../_lib/scheduler.js";

export function isAuthorizedCron(authorization: string | undefined, secret: string | undefined): boolean {
  if (!secret || secret.length < 16) return false;
  return safeEqual(String(authorization ?? ""), `Bearer ${secret}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isAuthorizedCron(req.headers.authorization, process.env.CRON_SECRET)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!hasAdminCredentials())
    return res.status(500).json({ error: "Firebase Admin credentials are not configured" });

  try {
    const db = adminDb();
    const summary = await runScheduler(db);
    const rebuild = summary.published.length ? await triggerRebuild(db, "scheduled publish") : null;
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ...summary, rebuild });
  } catch (err) {
    console.error("[cron] scheduler failed:", err);
    return res.status(500).json({ error: "Scheduler failed" });
  }
}
