/**
 * hooks/useBlog.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for blog data. Caching defaults
 * (5 min staleTime) are set on the QueryClient in App.tsx.
 */

import { useQuery } from "@tanstack/react-query";
import { BlogService } from "@/services/blog-service";
import { queryKeys } from "@/lib/queryKeys";

/** All published blog posts, latest first. */
export const useBlogPosts = () =>
  useQuery({
    queryKey: queryKeys.blog.published,
    queryFn: BlogService.getPublished,
  });

/** Single most-recent published post. */
export const useLatestBlogPost = () =>
  useQuery({
    queryKey: queryKeys.blog.latest,
    queryFn: BlogService.getLatest,
  });

/** Single published post by slug (or document ID). Disabled until a slug is present. */
export const useBlogPost = (slug: string) =>
  useQuery({
    queryKey: queryKeys.blog.detail(slug),
    queryFn: () => BlogService.getBySlugOrId(slug),
    enabled: !!slug,
  });
