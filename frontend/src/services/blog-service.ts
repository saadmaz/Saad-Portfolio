/**
 * services/blog-service.ts
 * ─────────────────────────────────────────────────────────────
 * Read-only blog queries. Only `published === true` posts are ever
 * returned to the public site. Unlisted posts are published but only
 * reachable by direct link, so they're left out of every listing.
 */

import { orderBy, where } from "firebase/firestore";
import { COLLECTIONS, fetchById, fetchCollection, fetchFirstWhere } from "@/lib/firestore";
import type { BlogPost } from "@/types";

const publishedOnly = (post: BlogPost | null) => (post?.published ? post : null);

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
    const bySlug = publishedOnly(await fetchFirstWhere<BlogPost>(COLLECTIONS.blogPosts, "slug", slugOrId));
    // A "/" can't appear in a document ID, so don't attempt the lookup.
    if (bySlug || slugOrId.includes("/")) return bySlug;
    return publishedOnly(await fetchById<BlogPost>(COLLECTIONS.blogPosts, slugOrId));
  },
};
