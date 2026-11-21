/** Types for share-meta.js (kept as JS so scripts/prerender.mjs can import it). */

export interface ShareImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface HeadMeta {
  /** Full title, including the site name. */
  title: string;
  description: string;
  url: string;
  canonical?: string;
  type?: string;
  noIndex?: boolean | "follow";
  /** Omit to keep the page's existing og:image tags. */
  image?: ShareImage | null;
  imageFallbackSize?: { width: number; height: number };
}

export const POST_PAGES_DIR: string;
export function escapeHtml(str: unknown): string;
export function truncate(s: string | undefined | null, n: number): string;
export function imageMimeOf(url: string | undefined | null): string;
export function applyHeadMeta(html: string, meta: HeadMeta): string;
