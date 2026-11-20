/**
 * hooks/useBlog.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for blog data. Caching defaults
 * (5 min staleTime) are set on the QueryClient in App.tsx.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AuthorService,
  BlogService,
  BlogSettingsService,
  PreviewService,
  ReactionService,
  RedirectService,
  SeriesService,
} from "@/services/blog-service";
import { queryKeys } from "@/lib/queryKeys";
import { ARTICLE_TYPES, DEFAULT_WPM } from "@/lib/article-core";
import type { Author, BlogPost } from "@/types";

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

export const useAuthors = () => useQuery({ queryKey: queryKeys.blog.authors, queryFn: AuthorService.getAll });

export const useSeries = () =>
  useQuery({ queryKey: queryKeys.blog.series, queryFn: SeriesService.getPublished });

/** Blog settings with defaults filled in, so callers never deal with missing config. */
export const useBlogSettings = () => {
  const query = useQuery({ queryKey: queryKeys.blog.settings, queryFn: BlogSettingsService.get });
  const settings = useMemo(
    () => ({
      articleTypes: query.data?.articleTypes?.length ? query.data.articleTypes : ARTICLE_TYPES,
      categories: query.data?.categories ?? [],
      readingWpm: query.data?.readingWpm || DEFAULT_WPM,
      reactionsEnabled: query.data?.reactionsEnabled !== false,
      defaultAuthorId: query.data?.defaultAuthorId,
      postsPerPage: query.data?.postsPerPage || 12,
    }),
    [query.data],
  );
  return { ...query, settings };
};

/** The author profile for a post: its authorId, the default author, or none (legacy name only). */
export const useAuthorOf = (post: Pick<BlogPost, "authorId"> | null | undefined): Author | null => {
  const { data: authors = [] } = useAuthors();
  const { settings } = useBlogSettings();
  return useMemo(() => {
    const id = post?.authorId || settings.defaultAuthorId;
    return authors.find((a) => a.id === id) ?? authors.find((a) => a.isDefault) ?? null;
  }, [authors, post?.authorId, settings.defaultAuthorId]);
};

export const useReactionCounts = (postId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.blog.reactions(postId),
    queryFn: () => ReactionService.getCounts(postId),
    enabled: enabled && !!postId,
    staleTime: 30_000,
  });

/** Looks up a redirect for a missing article (rules created since the last build). */
export const useRedirectFor = (path: string, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.blog.redirect(path),
    queryFn: () => RedirectService.findFor(path),
    enabled,
    retry: false,
  });

export const usePreview = (id: string, token: string) =>
  useQuery({
    queryKey: queryKeys.blog.preview(id, token),
    queryFn: () => PreviewService.get(id, token),
    enabled: !!id && !!token,
    retry: false,
    staleTime: 0,
  });
