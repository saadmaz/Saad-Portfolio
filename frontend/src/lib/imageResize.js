/**
 * Cloudflare-resized URLs for the site's own Storage images. Shared by
 * lib/images.ts (what the page requests) and scripts/prerender.mjs (the
 * matching <link rel="preload">), so both always produce the same URLs.
 */

/** Only the site's own bucket is allowed as a source (Cloudflare → Images → Transformations). */
export const OWN_BUCKET =
  /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/saadportfolio03\.firebasestorage\.app\//;

/** Widths offered in srcset: few, so the free monthly transformation quota goes far. */
export const RESIZE_WIDTHS = [480, 960, 1600];

export const isOwnStorageImage = (url) => OWN_BUCKET.test(String(url ?? ""));

export const cloudflareResized = (url, width) =>
  `/cdn-cgi/image/width=${width},format=auto,quality=80,fit=scale-down/${url}`;

export const cloudflareSrcSet = (url) =>
  RESIZE_WIDTHS.map((w) => `${cloudflareResized(url, w)} ${w}w`).join(", ");

/** srcset for an uploaded asset's own variants, as lib/images.ts responsiveImage() builds it. */
export const variantSrcSet = (variants) =>
  [...(variants ?? [])]
    .filter((v) => v?.url && v.width > 0)
    .sort((a, b) => a.width - b.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");
