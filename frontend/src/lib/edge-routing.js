/**
 * edge-routing.js
 * ─────────────────────────────────────────────────────────────
 * Decides, at the edge, whether a page URL exists, so unknown URLs get a
 * real HTTP 404 instead of a 200 "not found" screen (which Google reports
 * as a soft 404). Pure logic; middleware.ts does the I/O.
 *
 *   known   - prerendered at build time (dist/routes.json)        → serve
 *   pass    - routes that are valid by construction (previews)    → serve
 *   lookup  - a detail URL that may have been published after the
 *             last build; middleware checks Firestore             → serve or 404
 *   missing - nothing can live here                               → 404
 */

/** Detail routes and the content type behind each (order matters: most specific first). */
export const DETAIL_ROUTES = [
  { re: /^\/blog\/series\/([^/]+)$/, kind: "series" },
  { re: /^\/blog\/category\/([^/]+)$/, kind: "category" },
  { re: /^\/blog\/([^/]+)$/, kind: "post" },
  { re: /^\/events\/([^/]+)$/, kind: "event" },
  { re: /^\/certifications\/([^/]+)$/, kind: "certificate" },
  { re: /^\/projects\/([^/]+)$/, kind: "project" },
  { re: /^\/experience\/([^/]+)$/, kind: "experience" },
  { re: /^\/authors\/([^/]+)$/, kind: "author" },
  // A school added in the CMS since the last build: served, and the page decides.
  { re: /^\/education\/([^/]+)$/, kind: "school" },
];

/** Always served: the page itself handles access (draft previews). */
export const PASS_PREFIXES = ["/preview/"];

const clean = (path) => {
  let p = String(path || "/").split(/[?#]/)[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    // keep as-is
  }
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p || "/";
};

/**
 * @param {string} pathname request path
 * @param {Set<string>} known lowercase prerendered paths
 */
export function classifyPath(pathname, known) {
  const path = clean(pathname);
  if (known.has(path.toLowerCase())) return { type: "known" };
  if (PASS_PREFIXES.some((p) => path.startsWith(p))) return { type: "pass" };
  for (const { re, kind } of DETAIL_ROUTES) {
    const m = path.match(re);
    // Keys keep their case: Firestore document ids are case-sensitive.
    if (m) return { type: "lookup", kind, key: m[1] };
  }
  return { type: "missing" };
}
