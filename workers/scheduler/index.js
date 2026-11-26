/**
 * Cron Worker: every 10 minutes, asks the site to publish scheduled posts.
 *
 * Cloudflare Pages has no cron triggers, so this small Worker (free plan)
 * calls /api/cron/publish-scheduled on the Pages site. Overlapping runs are
 * safe: each post is published inside a Firestore transaction
 * (frontend/server/_lib/scheduler.ts).
 *
 * Secret: CRON_SECRET, the same value as on the saad-portfolio Pages project.
 * A failed call throws, so it shows as an error in the Worker's logs.
 */

export default {
  async scheduled(_event, env) {
    const res = await fetch(`${env.SITE_URL}/api/cron/publish-scheduled`, {
      method: "POST",
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    if (!res.ok) {
      throw new Error(`Scheduler returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
  },
};
