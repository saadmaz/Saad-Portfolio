/// <reference types="vite/client" />
import { BlogMetadata } from "../types/blog";

// Define the module structure for blog files
interface BlogModule {
  metadata: BlogMetadata;
  content: React.ReactNode;
}

/**
 * Dynamically import all blog posts from the posts directory.
 */
export async function getAllBlogs(): Promise<
  { slug: string; metadata: BlogMetadata }[]
> {
  const modules = import.meta.glob<BlogModule>("../posts/*.tsx", {
    eager: true,
  });

  const blogs = Object.entries(modules).map(([path, module]) => {
    // Extract slug from filename: "../posts/2025-01-02-the-case-for-typescript.tsx" → "2025-01-02-the-case-for-typescript"
    const filename = path.split("/").pop()?.replace(".tsx", "") || "";

    return {
      slug: filename,
      metadata: module.metadata,
    };
  });

  // Sort by date (newest first)
  return blogs.sort((a, b) => {
    return (
      new Date(b.metadata.publishedDate).getTime() -
      new Date(a.metadata.publishedDate).getTime()
    );
  });
}

/**
 * Get a single blog post by slug.
 */
export async function getBlogBySlug(
  slug: string
): Promise<BlogModule | null> {
  try {
    const module = await import(`../posts/${slug}.tsx`);
    return module as BlogModule;
  } catch (error) {
    console.error(`Blog not found: ${slug}`, error);
    return null;
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}