/** Types for project-seo.js (kept as JS so scripts/prerender.mjs can import it). */
import type { Project } from "@/types";

export interface GalleryItem {
  url: string;
  alt: string;
  caption: string;
}

export function toDate(value: unknown): Date | null;
export function projectSeoTitle(p: Project): string;
export function projectSeoDescription(p: Project): string;
export function projectCanonical(p: Project, baseUrl: string): string;
export function projectTimeline(p: Project): string;
export function projectDuration(p: Project, now?: Date): string;
export function projectGallery(p: Project): GalleryItem[];
export function projectVideos(p: Project): { url: string; title: string }[];
export function projectSchema(
  p: Project,
  opts: { baseUrl: string; author: object; related?: Project[] },
): Record<string, unknown>;
export function relatedProjects(p: Project, all: Project[]): Project[];
