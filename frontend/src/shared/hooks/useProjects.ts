/**
 * shared/hooks/useProjects.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for project data.
 *
 * ProjectService now calls Firestore directly - no Express proxy.
 * React Query caches results for 5 min (staleTime in App.tsx).
 * Query keys are sourced from the central queryKeys registry.
 */

import { useQuery } from "@tanstack/react-query";
import { ProjectService } from "@/services/project-service";
import { queryKeys } from "@/shared/lib/queryKeys";
import type { Project } from "@/types";

// `published` defaults to true for legacy docs that predate the field -
// only an explicit `false` (set via the admin toggle) hides a project.
// Admin pages call ProjectService directly (unfiltered) so drafts stay
// editable there; these hooks are the public-facing boundary.
const isPublished = (p: Project) => p.published !== false;

/** All published projects ordered by order_index. */
export const useProjects = () =>
  useQuery<Project[]>({
    queryKey: queryKeys.projects.all,
    queryFn:  async () => (await ProjectService.getAll()).filter(isPublished),
  });

/** Featured, published projects only (featured === true). */
export const useFeaturedProjects = () =>
  useQuery<Project[]>({
    queryKey: queryKeys.projects.featured,
    queryFn:  async () => (await ProjectService.getFeatured()).filter(isPublished),
  });

/**
 * Single published project by slug.
 * Disabled until a slug value is present to avoid a premature fetch.
 */
export const useProject = (slug: string) =>
  useQuery<Project | null>({
    queryKey: queryKeys.projects.detail(slug),
    queryFn:  async () => {
      const p = await ProjectService.getBySlug(slug);
      return p && isPublished(p) ? p : null;
    },
    enabled:  !!slug,
  });
