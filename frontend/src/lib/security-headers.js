/**
 * Response headers for the whole site, defined once.
 *
 *   - scripts/write-headers.mjs turns HEADER_RULES into dist/_headers, which
 *     Cloudflare Pages applies to static files;
 *   - functions/_middleware.ts applies the same security headers to pages it
 *     builds itself (articles, feeds, the SPA fallback, 404s) and the
 *     framable variant to /preview/*;
 *   - scripts/check-csp.mjs checks every inline <script> hash is in CSP.
 *
 * Keep frame-src in sync with src/lib/embeds.ts.
 */

const directives = (frameAncestors) =>
  [
    "default-src 'self'",
    // The hash pins the inline gtag snippet in index.html (see scripts/check-csp.mjs).
    "script-src 'self' 'sha256-38+K9MPSU4N7Ohk+jz/7ovdBkYDynRGXXHkCS9Ym8x8=' https://www.googletagmanager.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://cloudflareinsights.com",
    "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.loom.com https://codepen.io",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    "upgrade-insecure-requests",
  ].join("; ") + ";";

export const CSP = directives("'none'");
/** Draft previews are embedded by the CMS. */
export const PREVIEW_CSP = directives("https://admin.saadmaz.com http://localhost:8081");

const COMMON = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

/** Every page except draft previews. */
export const SECURITY_HEADERS = { ...COMMON, "X-Frame-Options": "DENY", "Content-Security-Policy": CSP };

/** /preview/*: framable by the CMS, never cached or indexed. */
export const PREVIEW_HEADERS = {
  ...COMMON,
  "Content-Security-Policy": PREVIEW_CSP,
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "private, no-store",
};

const NOINDEX = { "X-Robots-Tag": "noindex, nofollow" };
const IMMUTABLE = { "Cache-Control": "public, max-age=31536000, immutable" };
const IMAGES = { "Cache-Control": "public, max-age=2592000, stale-while-revalidate=86400" };

/** Static-file rules for dist/_headers (Cloudflare merges every rule that matches). */
export const HEADER_RULES = [
  { path: "/*", headers: SECURITY_HEADERS },
  { path: "/assets/*", headers: IMMUTABLE },
  { path: "/og/*", headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
  { path: "/share-image/*", headers: IMAGES },
  { path: "/icons/*", headers: IMAGES },
  { path: "/Certificates/*", headers: IMAGES },
  { path: "/Logo/*", headers: IMAGES },
  { path: "/favicon.ico", headers: { "Cache-Control": "public, max-age=3600, must-revalidate" } },
  { path: "/apple-touch-icon.png", headers: { "Cache-Control": "public, max-age=3600, must-revalidate" } },
  { path: "/site.webmanifest", headers: { "Cache-Control": "public, max-age=3600, must-revalidate" } },
  { path: "/_prerendered/*", headers: NOINDEX },
  { path: "/routes.json", headers: NOINDEX },
  { path: "/redirects.json", headers: NOINDEX },
  { path: "/404.html", headers: NOINDEX },
];

/** dist/_headers file contents. */
export function headersFile(rules = HEADER_RULES) {
  return rules
    .map(({ path, headers }) => [path, ...Object.entries(headers).map(([k, v]) => `  ${k}: ${v}`)].join("\n"))
    .join("\n\n")
    .concat("\n");
}
