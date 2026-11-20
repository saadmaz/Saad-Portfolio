/** Types for seo-content.js (kept as JS so scripts/prerender.mjs can import it). */

export const SITE_NAME: string;
export const BASE_URL: string;
export const PERSON_SCHEMA: Record<string, unknown>;
export const NAV_LINKS: { path: string; label: string }[];
export const PAGE_SEO: Record<string, { title: string; description: string }>;
