import { BlogMetadata } from "../types/blog";

interface BlogModule {
  metadata: BlogMetadata;
  content: React.ReactNode;
}

/**
 * Dynamically import all blog posts from the posts directory
 * Uses Vite's import.meta.glob for efficient bundling
 */
export async function getAllBlogs(): Promise<
  { slug: string; metadata: BlogMetadata }[]
> {
  // Import all blog files dynamically
  const modules = import.meta.glob<BlogModule>("../posts/*.tsx", {
    eager: true,
  });

  const blogs = Object.entries(modules).map(([path, module]) => {
    // Extract slug from filename: "2025-01-24-blog-title.tsx" → "2025-01-24-blog-title"
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
 * Get a single blog post by slug
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