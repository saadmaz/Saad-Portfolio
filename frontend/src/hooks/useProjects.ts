/**
 * hooks/useProjects.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for project data. Caching defaults
 * (5 min staleTime) are set on the QueryClient in App.tsx.
 */

import { useQuery } from "@tanstack/react-query";
import { ProjectService } from "@/services/project-service";
import { queryKeys } from "@/lib/queryKeys";

/** All published projects ordered by order_index. */
export const useProjects = () =>
  useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: ProjectService.getAll,
  });

/** Featured, published projects only. */
export const useFeaturedProjects = () =>
  useQuery({
    queryKey: queryKeys.projects.featured,
    queryFn: ProjectService.getFeatured,
  });

/** Single published project by slug. Disabled until a slug is present. */
export const useProject = (slug: string) =>
  useQuery({
    queryKey: queryKeys.projects.detail(slug),
    queryFn: () => ProjectService.getBySlug(slug),
    enabled: !!slug,
  });
