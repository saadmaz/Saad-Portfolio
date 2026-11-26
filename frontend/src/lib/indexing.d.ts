/** Types for indexing.js (kept as JS so scripts/prerender.mjs can import it). */

export type SeoVisibility = "auto" | "index" | "noindex";

export interface IndexableEvent {
  description?: string;
  highlights?: string[];
  seo_visibility?: SeoVisibility;
}

export const EVENT_MIN_WORDS: number;
export const SEO_VISIBILITY: readonly SeoVisibility[];
export function eventWordCount(event: IndexableEvent): number;
export function isEventIndexable(event: IndexableEvent): boolean;

export interface IndexableProject {
  tagline?: string;
  overview?: string;
  description?: string;
  long_description?: string;
  impact?: string;
  contribution?: string[];
  technical_decisions?: string[];
  architecture?: { description?: string };
  seo_visibility?: SeoVisibility;
}

export const PROJECT_MIN_WORDS: number;
export function projectWordCount(project: IndexableProject): number;
export function isProjectIndexable(project: IndexableProject): boolean;
export const COMPANY_MIN_WORDS: number;
export function isCompanyPageIndexable(opts: { words?: number; projectCount?: number }): boolean;
