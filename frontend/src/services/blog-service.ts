/**
 * services/blog-service.ts
 * ─────────────────────────────────────────────────────────────
 * Read-only blog queries. Only `published === true` posts are ever
 * returned to the public site.
 */

import { orderBy, where } from "firebase/firestore";
import { COLLECTIONS, fetchById, fetchCollection, fetchFirstWhere } from "@/lib/firestore";
import type { BlogPost } from "@/types";

const publishedOnly = (post: BlogPost | null) => (post?.published ? post : null);

export const BlogService = {
  /** All published posts, latest first. */
  getPublished(): Promise<BlogPost[]> {
    return fetchCollection<BlogPost>(
      COLLECTIONS.blogPosts,
      where("published", "==", true),
      orderBy("date", "desc"),
    );
  },

  /** The single most recent published post. */
  async getLatest(): Promise<BlogPost | null> {
    const posts = await BlogService.getPublished();
    return posts[0] ?? null;
  },

  /** A published post by slug, falling back to its document ID. */
  async getBySlugOrId(slugOrId: string): Promise<BlogPost | null> {
    const bySlug = publishedOnly(await fetchFirstWhere<BlogPost>(COLLECTIONS.blogPosts, "slug", slugOrId));
    // A "/" can't appear in a document ID, so don't attempt the lookup.
    if (bySlug || slugOrId.includes("/")) return bySlug;
    return publishedOnly(await fetchById<BlogPost>(COLLECTIONS.blogPosts, slugOrId));
  },
};
