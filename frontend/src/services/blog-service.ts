/**
 * services/blog-service.ts
 * ─────────────────────────────────────────────────────────────
 * Read-only blog queries. Only `published === true` posts are ever
 * returned to the public site (Firestore rules enforce the same, so every
 * query here filters on it). Unlisted posts are published but only
 * reachable by direct link, so they're left out of every listing.
 */

import { orderBy, where } from "firebase/firestore";
import { COLLECTIONS, fetchById, fetchCollection, fetchFirst } from "@/lib/firestore";
import { normalizePath } from "@/lib/article-core";
import type { Author, BlogPost, BlogSeries, BlogSettings, ReactionCounts, Redirect } from "@/types";

const publishedOnly = (post: BlogPost | null) => (post?.published ? post : null);

/** Firestore denies reads of unpublished docs; to the site that's simply "not found". */
const isPermissionDenied = (err: unknown) =>
  typeof err === "object" && err !== null && (err as { code?: string }).code === "permission-denied";

export const BlogService = {
  /** All published, listed posts, latest first. */
  async getPublished(): Promise<BlogPost[]> {
    // Filtered here rather than in the query: `unlisted != true` would drop
    // every older post that has no `unlisted` field at all.
    const posts = await fetchCollection<BlogPost>(
      COLLECTIONS.blogPosts,
      where("published", "==", true),
      orderBy("date", "desc"),
    );
    return posts.filter((p) => !p.unlisted);
  },

  /** The single most recent published post. */
  async getLatest(): Promise<BlogPost | null> {
    const posts = await BlogService.getPublished();
    return posts[0] ?? null;
  },

  /** A published post (listed or unlisted) by slug, falling back to its document ID. */
  async getBySlugOrId(slugOrId: string): Promise<BlogPost | null> {
    const bySlug = await fetchFirst<BlogPost>(
      COLLECTIONS.blogPosts,
      where("slug", "==", slugOrId),
      where("published", "==", true),
    );
    // A "/" can't appear in a document ID, so don't attempt the lookup.
    if (bySlug || slugOrId.includes("/")) return bySlug;
    try {
      return publishedOnly(await fetchById<BlogPost>(COLLECTIONS.blogPosts, slugOrId));
    } catch (err) {
      if (isPermissionDenied(err)) return null;
      throw err;
    }
  },
};

export const AuthorService = {
  getAll: () => fetchCollection<Author>(COLLECTIONS.authors),
};

export const SeriesService = {
  getPublished: () => fetchCollection<BlogSeries>(COLLECTIONS.blogSeries, where("published", "==", true)),
};

export const BlogSettingsService = {
  async get(): Promise<BlogSettings> {
    return (await fetchById<BlogSettings & { id: string }>(COLLECTIONS.blogSettings, "config")) ?? {};
  },
};

export const RedirectService = {
  /** The redirect rule for a site path, if one exists (rules created since the last build). */
  findFor: (path: string) =>
    fetchFirst<Redirect>(COLLECTIONS.redirects, where("from", "==", normalizePath(path))),
};

export const ReactionService = {
  async getCounts(postId: string): Promise<ReactionCounts> {
    return (await fetchById<ReactionCounts & { id: string }>(COLLECTIONS.blogReactions, postId)) ?? {};
  },

  /** Toggles a reaction through the API (counts can't be written from the browser). */
  async toggle(postId: string, reaction: string): Promise<{ counts: ReactionCounts; reacted: boolean }> {
    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, reaction }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      counts: ReactionCounts;
      reacted: boolean;
      error?: string;
    };
    if (!res.ok) throw new Error(data.error || "Could not save your reaction");
    return data;
  },
};

export interface PreviewResponse {
  post: BlogPost;
  hasPendingChanges: boolean;
}

export const PreviewService = {
  async get(id: string, token: string): Promise<PreviewResponse> {
    // The endpoint responds with Cache-Control: no-store.
    const res = await fetch(`/api/preview?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`);
    const data = (await res.json().catch(() => ({}))) as PreviewResponse & { error?: string };
    if (!res.ok) throw new Error(data.error || "Could not load preview");
    return data;
  },
};
