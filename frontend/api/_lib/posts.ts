/** Published-post lookup shared by api/blog-page and api/share-image. */

import { adminDb, hasAdminCredentials } from "./firebase.js";
import type { BlogPost } from "../../src/types/blog.js";

export type Post = Partial<BlogPost> & { id: string; title: string };

/** Published post by slug: the post, null when there's none, undefined when the lookup failed. */
export async function findPublishedPost(slug: string): Promise<Post | null | undefined> {
  if (!hasAdminCredentials()) return undefined;
  try {
    const snap = await adminDb().collection("blog_posts").where("slug", "==", slug).limit(5).get();
    const doc = snap.docs.find((d) => d.get("published") === true);
    return doc ? ({ ...doc.data(), id: doc.id } as Post) : null;
  } catch (err) {
    console.error("[posts] Firestore lookup failed:", err);
    return undefined;
  }
}
