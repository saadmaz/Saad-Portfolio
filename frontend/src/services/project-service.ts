/**
 * services/project-service.ts
 * ─────────────────────────────────────────────────────────────
 * Read-only project queries. Writes happen in the separate admin app;
 * Firestore rules restrict them to the admin account.
 */

import { COLLECTIONS, fetchCollection, fetchFirstWhere, fetchOrdered, where } from "@/lib/firestore";
import type { Project } from "@/types";

/**
 * `published` defaults to true for legacy docs that predate the field -
 * only an explicit `false` (set via the admin toggle) hides a project.
 */
export const isPublished = (p: Pick<Project, "published">) => p.published !== false;

export const ProjectService = {
  /** All published projects, ordered by order_index ascending. */
  async getAll(): Promise<Project[]> {
    const projects = await fetchOrdered<Project>(COLLECTIONS.projects, "order_index");
    return projects.filter(isPublished);
  },

  /**
   * Published projects flagged `featured`.
   * No orderBy - avoids requiring a composite index on (featured, order_index);
   * callers sort client-side.
   */
  async getFeatured(): Promise<Project[]> {
    const projects = await fetchCollection<Project>(COLLECTIONS.projects, where("featured", "==", true));
    return projects.filter(isPublished);
  },

  /** One published project by slug, or `null`. */
  async getBySlug(slug: string): Promise<Project | null> {
    const project = await fetchFirstWhere<Project>(COLLECTIONS.projects, "slug", slug);
    return project && isPublished(project) ? project : null;
  },
};
