/**
 * shared/hooks/useProjects.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for project data.
 *
 * ProjectService now calls Firestore directly — no Express proxy.
 * React Query caches results for 5 min (staleTime in App.tsx).
 * Query keys are sourced from the central queryKeys registry.
 */

import { useQuery } from "@tanstack/react-query";
import { ProjectService } from "@/services/project-service";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { Project } from "@/types";

/** All projects ordered by order_index. */
export const useProjects = () =>
  useQuery<Project[]>({
    queryKey: queryKeys.projects.all,
    queryFn:  () => ProjectService.getAll(),
  });

/** Featured projects only (featured === true). */
export const useFeaturedProjects = () =>
  useQuery<Project[]>({
    queryKey: queryKeys.projects.featured,
    queryFn:  () => ProjectService.getFeatured(),
  });

/**
 * Single project by slug.
 * Disabled until a slug value is present to avoid a premature fetch.
 */
export const useProject = (slug: string) =>
  useQuery<Project | null>({
    queryKey: queryKeys.projects.detail(slug),
    queryFn:  () => ProjectService.getBySlug(slug),
    enabled:  !!slug,
  });
