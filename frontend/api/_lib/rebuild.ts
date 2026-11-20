/**
 * Triggers a production rebuild through a Vercel Deploy Hook so the
 * prerendered pages (crawler HTML, social cards, llms-full.txt) pick up
 * newly published or changed articles. Feeds and the blog sitemap are
 * served live by api/feed.ts and don't need this.
 *
 * Env: VERCEL_DEPLOY_HOOK_URL (Vercel → Project → Settings → Git → Deploy Hooks).
 * Throttled through Firestore so a burst of edits queues one build.
 */

import type { Firestore } from "firebase-admin/firestore";

export const REBUILD_COOLDOWN_MS = 2 * 60 * 1000;

export type RebuildResult =
  | { triggered: true }
  | { triggered: false; reason: "not-configured" | "throttled" | "failed"; detail?: string };

export async function triggerRebuild(
  db: Firestore,
  reason: string,
  now = Date.now(),
): Promise<RebuildResult> {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) return { triggered: false, reason: "not-configured" };

  const ref = db.collection("system").doc("rebuild");
  const allowed = await db.runTransaction(async (tx) => {
    const last = Number((await tx.get(ref)).get("lastTriggeredAt") ?? 0);
    if (now - last < REBUILD_COOLDOWN_MS) return false;
    tx.set(ref, { lastTriggeredAt: now, lastReason: reason }, { merge: true });
    return true;
  });
  if (!allowed) return { triggered: false, reason: "throttled" };

  try {
    const res = await fetch(hook, { method: "POST" });
    if (!res.ok) return { triggered: false, reason: "failed", detail: `Deploy hook returned ${res.status}` };
    return { triggered: true };
  } catch (err) {
    return { triggered: false, reason: "failed", detail: err instanceof Error ? err.message : String(err) };
  }
}
