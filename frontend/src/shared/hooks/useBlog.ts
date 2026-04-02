/**
 * shared/hooks/useBlog.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for blog data.
 *
 * BlogService now calls Firestore directly — no Express proxy.
 * React Query caches results for 5 min (staleTime in App.tsx).
 * Query keys are sourced from the central queryKeys registry.
 */

import { useQuery } from "@tanstack/react-query";
import { BlogService } from "@/services/blog-service";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { BlogPost } from "@/types";

/** All published blog posts, latest first. */
export const useBlogPosts = () =>
  useQuery<BlogPost[]>({
    queryKey: queryKeys.blog.published,
    queryFn:  () => BlogService.getPublished(),
  });

/** Single most-recent published post. */
export const useLatestBlogPost = () =>
  useQuery<BlogPost | null>({
    queryKey: queryKeys.blog.latest,
    queryFn:  () => BlogService.getLatest(),
  });

/**
 * Single post by slug.
 * Disabled until a slug value is present.
 */
export const useBlogPost = (slug: string) =>
  useQuery<BlogPost | null>({
    queryKey: queryKeys.blog.detail(slug),
    queryFn:  () => BlogService.getBySlug(slug),
    enabled:  !!slug,
  });
