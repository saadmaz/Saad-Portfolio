/// <reference types="vite/client" />
import { BlogMetadata } from "../types/blog";

// 1. Define the internal module structure for Vite's glob/import
interface BlogModule {
  metadata: BlogMetadata;
  // In Vite/React dynamic imports, the JSX component is usually the default export
  default: React.ReactNode; 
}

/**
 * Dynamically import all blog posts from the posts directory.
 * Includes explicit generic typing for the glob to prevent 'metadata' type errors.
 */
export async function getAllBlogs(): Promise<
  { slug: string; metadata: BlogMetadata }[]
> {
  // We pass <BlogModule> to the glob to tell Vite what each file exports
  const modules = import.meta.glob<BlogModule>("../posts/*.tsx", {
    eager: true,
  });

  const blogs = Object.entries(modules).map(([path, module]) => {
    // Extract slug from filename: "../posts/my-post.tsx" → "my-post"
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
 * Uses type-casting to ensure TypeScript recognizes the 'metadata' and 'default' exports.
 */
export async function getBlogBySlug(
  slug: string
): Promise<BlogModule | null> {
  try {
    // Vite requires dynamic imports to be relatively static for analysis
    const module = await import(`../posts/${slug}.tsx`);
    
    // Casting to BlogModule ensures we can access 'metadata' safely
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