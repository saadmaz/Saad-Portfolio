/**
 * indexing.js
 * ─────────────────────────────────────────────────────────────
 * Which event pages search engines should index.
 *
 * A page with a one-line description is thin content, and enough thin pages
 * drag down how search engines rate the whole site. Under "auto" an event is
 * indexed once its write-up (description + highlights) reaches
 * EVENT_MIN_WORDS; shorter ones stay on the site but are `noindex, follow`
 * and left out of the sitemap. The CMS can override per event with
 * `seo_visibility: "index" | "noindex"`.
 *
 * Plain JS so scripts/prerender.mjs can import it. The admin CMS keeps an
 * identical copy (src/shared/lib/indexing.ts) for its live word-count hint:
 * change both together.
 */

export const EVENT_MIN_WORDS = 100;

/** @type {readonly ["auto", "index", "noindex"]} */
export const SEO_VISIBILITY = ["auto", "index", "noindex"];

const words = (s) =>
  String(s ?? "")
    .split(/\s+/)
    .filter(Boolean).length;

/** Words in the event's own write-up: description plus highlights. */
export function eventWordCount(event) {
  return words(event?.description) + (event?.highlights ?? []).reduce((n, h) => n + words(h), 0);
}

/** True when the event's page should be indexed and listed in the sitemap. */
export function isEventIndexable(event) {
  const visibility = event?.seo_visibility;
  if (visibility === "index") return true;
  if (visibility === "noindex") return false;
  return eventWordCount(event) >= EVENT_MIN_WORDS;
}

/**
 * Projects follow the same rule: a case study is indexed once its write-up
 * (tagline, overview, description, long description, impact, contribution,
 * architecture notes and technical decisions) reaches PROJECT_MIN_WORDS.
 * A stub project stays reachable by link but is `noindex, follow` and out of
 * the sitemap, and /projects itself is only indexed when it lists at least one
 * indexable project. `seo_visibility` overrides, as for events.
 */
export const PROJECT_MIN_WORDS = 100;

/** Words in a project's own write-up: the descriptions plus contribution, impact and architecture notes. */
export function projectWordCount(project) {
  const text = ["tagline", "overview", "description", "long_description", "impact"].reduce(
    (n, key) => n + words(project?.[key]),
    0,
  );
  const lists = [...(project?.contribution ?? []), ...(project?.technical_decisions ?? [])];
  return text + words(project?.architecture?.description) + lists.reduce((n, item) => n + words(item), 0);
}

/** True when the project's page should be indexed and listed in the sitemap. */
export function isProjectIndexable(project) {
  const visibility = project?.seo_visibility;
  if (visibility === "index") return true;
  if (visibility === "noindex") return false;
  return projectWordCount(project) >= PROJECT_MIN_WORDS;
}
