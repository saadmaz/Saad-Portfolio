/**
 * Scheduled publishing.
 *
 * A post is scheduled when `status === "scheduled"` and `scheduledAt` (UTC
 * ISO) is set. The CMS writes those fields; this module is the only thing
 * that flips a scheduled post live, so publishing never depends on a
 * browser tab being open.
 *
 * Safety:
 *   - each post is published inside a Firestore transaction that re-reads it
 *     and re-checks status + time, so overlapping runs (cron + manual
 *     trigger) cannot publish twice;
 *   - incomplete posts are rejected back to draft with the reason recorded;
 *   - unexpected failures are counted and retried on the next run, then
 *     parked as draft after MAX_ATTEMPTS so a broken post can't loop forever.
 */

import type { Firestore } from "firebase-admin/firestore";
import { normalizePath, planSlugRedirect, publishBlockers } from "../../src/lib/article-core.js";
import type { BlogPost } from "../../src/types/blog";

export const MAX_ATTEMPTS = 5;

type Post = Partial<BlogPost> & { id: string; publishedSlug?: string; scheduleAttempts?: number };

export type ScheduledDecision =
  | { action: "skip"; reason: "not-scheduled" | "not-due" }
  | { action: "publish"; update: Record<string, unknown>; slugMove: { from: string; to: string } | null }
  | { action: "reject"; update: Record<string, unknown>; issues: string[] };

/** What to do with one post at `now`. Pure: no I/O. */
export function decideScheduled(post: Post, now: Date): ScheduledDecision {
  if (post.status !== "scheduled") return { action: "skip", reason: "not-scheduled" };
  const due = Date.parse(post.scheduledAt ?? "");
  if (Number.isNaN(due)) {
    return {
      action: "reject",
      issues: ["No valid publish time"],
      update: {
        status: "draft",
        published: false,
        scheduleError: "Not published: no valid publish time was set.",
      },
    };
  }
  if (due > now.getTime()) return { action: "skip", reason: "not-due" };

  const issues = publishBlockers(post);
  if (issues.length) {
    return {
      action: "reject",
      issues,
      update: {
        status: "draft",
        published: false,
        scheduleError: `Not published at the scheduled time: ${issues.join("; ")}.`,
      },
    };
  }

  const scheduledIso = new Date(due).toISOString();
  const firstPublication = !post.publishedAt;
  const slugMove =
    post.publishedSlug && post.slug && post.publishedSlug !== post.slug
      ? { from: `/blog/${post.publishedSlug}`, to: `/blog/${post.slug}` }
      : null;

  return {
    action: "publish",
    slugMove,
    update: {
      status: "published",
      published: true,
      // The publication date is set once and never moves on later edits.
      publishedAt: firstPublication ? scheduledIso : post.publishedAt,
      date: firstPublication ? scheduledIso : post.date,
      lastUpdatedAt: firstPublication ? scheduledIso : now.toISOString(),
      publishedSlug: post.slug,
      scheduledAt: null,
      scheduleError: null,
      scheduleAttempts: 0,
      revision: (post.revision ?? 0) + 1,
    },
  };
}

/** Fields captured in a revision snapshot. Must match the CMS's list. */
export const SNAPSHOT_FIELDS = [
  "title",
  "subtitle",
  "slug",
  "excerpt",
  "content",
  "contentJson",
  "category",
  "articleType",
  "tags",
  "authorId",
  "author",
  "cover",
  "socialImage",
  "seoTitle",
  "metaDescription",
  "keywords",
  "canonicalUrl",
  "noIndex",
  "unlisted",
  "sources",
  "seriesId",
  "relatedPostIds",
  "featured",
  "featuredOrder",
  "tableOfContents",
  "reactionsEnabled",
  "socialShareEnabled",
  "ctaText",
  "ctaUrl",
  "readingTimeMinutes",
  "image",
] as const;

export function snapshotOf(post: Record<string, unknown>) {
  const snap: Record<string, unknown> = {};
  for (const f of SNAPSHOT_FIELDS) if (post[f] !== undefined) snap[f] = post[f];
  return snap;
}

export interface SchedulerSummary {
  ranAt: string;
  published: string[];
  rejected: { id: string; issues: string[] }[];
  failed: { id: string; error: string }[];
}

export async function runScheduler(db: Firestore, now = new Date()): Promise<SchedulerSummary> {
  const summary: SchedulerSummary = { ranAt: now.toISOString(), published: [], rejected: [], failed: [] };
  const snap = await db.collection("blog_posts").where("status", "==", "scheduled").get();

  for (const doc of snap.docs) {
    const candidate = { id: doc.id, ...doc.data() } as Post;
    if (decideScheduled(candidate, now).action === "skip") continue;
    try {
      const decision = await db.runTransaction(async (tx) => {
        const fresh = await tx.get(doc.ref);
        if (!fresh.exists) return null;
        const data = fresh.data() as Record<string, unknown>;
        const d = decideScheduled({ id: doc.id, ...data } as Post, now);
        if (d.action === "skip") return d;
        tx.update(doc.ref, d.update);
        if (d.action === "publish") {
          tx.create(doc.ref.collection("revisions").doc(), {
            createdAt: now.toISOString(),
            by: "scheduler",
            reason: "Published on schedule",
            revision: d.update.revision,
            snapshot: snapshotOf(data),
          });
        }
        return d;
      });
      if (!decision || decision.action === "skip") continue;
      if (decision.action === "reject") {
        summary.rejected.push({ id: doc.id, issues: decision.issues });
        continue;
      }
      summary.published.push(doc.id);
      if (decision.slugMove) await applySlugRedirect(db, decision.slugMove.from, decision.slugMove.to);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      summary.failed.push({ id: doc.id, error: message });
      const attempts = (candidate.scheduleAttempts ?? 0) + 1;
      await doc.ref
        .update(
          attempts >= MAX_ATTEMPTS
            ? {
                status: "draft",
                published: false,
                scheduleAttempts: attempts,
                scheduleError: `Publishing failed ${attempts} times: ${message}`,
              }
            : {
                scheduleAttempts: attempts,
                scheduleError: `Publish attempt ${attempts} failed, will retry: ${message}`,
              },
        )
        .catch(() => undefined);
    }
  }

  await db
    .collection("system")
    .doc("scheduler")
    .set({ lastRunAt: summary.ranAt, ...summary }, { merge: false })
    .catch(() => undefined);
  return summary;
}

/** Writes the redirect plan for a slug change (chain-collapsing, loop-free). */
export async function applySlugRedirect(db: Firestore, from: string, to: string) {
  const col = db.collection("redirects");
  const existing = (await col.get()).docs.map((d) => ({
    id: d.id,
    from: String(d.get("from")),
    to: String(d.get("to")),
  }));
  const plan = planSlugRedirect(existing, from, to);
  const batch = db.batch();
  for (const id of plan.remove) batch.delete(col.doc(id));
  for (const r of plan.repoint)
    batch.update(col.doc(r.id), { to: r.to, updatedAt: new Date().toISOString() });
  if (plan.create)
    batch.set(col.doc(), {
      ...plan.create,
      from: normalizePath(plan.create.from),
      source: "auto",
      createdAt: new Date().toISOString(),
    });
  await batch.commit();
}
