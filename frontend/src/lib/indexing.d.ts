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
