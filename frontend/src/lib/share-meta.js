/**
 * Rewrites a page's <head> SEO and share tags (title, description, canonical,
 * robots, Open Graph, Twitter). Kept as JS so scripts/prerender.mjs (build
 * time) and api/blog-page.ts (request time) produce identical tags.
 *
 * Every replacement is idempotent, so a prerendered page can be rewritten
 * again with fresher values. Function replacers throughout, because CMS text
 * may contain "$&"-style sequences a string replacement would expand.
 */

/** Where prerendered article pages live in dist (served via api/blog-page.ts, not directly). */
export const POST_PAGES_DIR = "_prerendered/blog";

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s || "");

const MIME = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  png: "image/png",
};

/** Image MIME type from a URL's extension (query string ignored); PNG when unknown. */
export function imageMimeOf(url) {
  const ext = String(url ?? "")
    .split(/[?#]/)[0]
    .split(".")
    .pop()
    ?.toLowerCase();
  return MIME[ext] ?? "image/png";
}

const tag = (attr, key) => new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`, "i");
const CANONICAL = /<link\s[^>]*rel=["']canonical["'][^>]*>/i;
const ROBOTS = tag("name", "robots");

/**
 * @param {string} html
 * @param {{
 *   title: string; description: string; url: string; canonical?: string;
 *   type?: string; noIndex?: boolean | "follow";
 *   image?: { url: string; width?: number; height?: number; alt?: string } | null;
 *   imageFallbackSize?: { width: number; height: number };
 * }} m  `title` is the full title (with the site name). Without `image` the
 *   existing og:image tags are left untouched.
 */
export function applyHeadMeta(html, m) {
  const et = escapeHtml(m.title);
  const ed = escapeHtml(truncate(m.description, 300));
  const eu = escapeHtml(m.canonical || m.url);
  const set = (re, value) => {
    html = html.replace(re, (_, a, b) => `${a}${value}${b}`);
  };

  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${et}</title>`);
  html = CANONICAL.test(html)
    ? html.replace(CANONICAL, () => `<link rel="canonical" href="${eu}" />`)
    : html.replace("</head>", () => `  <link rel="canonical" href="${eu}" />\n</head>`);
  if (m.noIndex) {
    // "follow": out of the index, but crawlers still follow the page's links.
    const robots = m.noIndex === "follow" ? "noindex, follow" : "noindex, nofollow";
    if (ROBOTS.test(html)) set(ROBOTS, robots);
    else html = html.replace("</head>", () => `  <meta name="robots" content="${robots}" />\n</head>`);
  }

  set(tag("name", "description"), ed);
  set(tag("property", "og:title"), et);
  set(tag("property", "og:description"), ed);
  set(tag("property", "og:url"), escapeHtml(m.url));
  set(tag("property", "og:type"), escapeHtml(m.type || "website"));
  set(tag("name", "twitter:title"), et);
  set(tag("name", "twitter:description"), ed);
  set(tag("name", "twitter:card"), "summary_large_image");

  if (m.image?.url) {
    const fallback = m.imageFallbackSize ?? { width: 1200, height: 630 };
    const src = escapeHtml(m.image.url);
    set(tag("property", "og:image"), src);
    set(tag("name", "twitter:image"), src);
    set(tag("property", "og:image:type"), imageMimeOf(m.image.url));
    set(tag("property", "og:image:width"), String(m.image.width || fallback.width));
    set(tag("property", "og:image:height"), String(m.image.height || fallback.height));
    set(tag("property", "og:image:alt"), m.image.alt ? escapeHtml(m.image.alt) : et);
  }
  return html;
}
