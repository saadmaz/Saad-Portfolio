/** Types for seo-content.js (kept as JS so scripts/prerender.mjs can import it). */

export const SITE_NAME: string;
export const BASE_URL: string;
export const TITLE_MAX: number;
export function pageTitle(title: string): string;
export function eventDescriptionOf(event: {
  title?: string;
  description?: string;
  role?: string;
  organizer?: string;
  location?: string;
  date?: string;
}): string;
export function categoryDescriptionOf(label: string, custom?: string | null): string;
export const PERSON_ID: string;
export const WEBSITE_ID: string;
export const PERSON_REF: Record<string, unknown>;
export const BIO: string;
export const PERSON_SCHEMA: Record<string, unknown>;
export const WEBSITE_SCHEMA: Record<string, unknown>;
export function homeSchemas(person?: Record<string, unknown>): Record<string, unknown>[];
export const NAV_LINKS: { path: string; label: string }[];
export const PAGE_SEO: Record<
  string,
  {
    title: string;
    description: string;
    /** Full <title> used as-is, without the " - Saad Mazhar" suffix. */
    fullTitle?: string;
    /** Crawler-copy H1 when it should differ from `title`. */
    h1?: string;
  }
>;
export const CONTACT_SERVICES: { title: string; body: string }[];
export const CONTACT_FAQ: { q: string; a: string }[];
