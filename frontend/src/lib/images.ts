import type { ImageAsset } from "@/types";

export interface ResponsiveImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  objectPosition?: string;
}

/** `focalX/Y` (0–100) → CSS object-position, centred when unset. */
export function objectPositionOf(
  asset: Pick<ImageAsset, "focalX" | "focalY"> | null | undefined,
): string | undefined {
  if (!asset || (asset.focalX === undefined && asset.focalY === undefined)) return undefined;
  const clamp = (n: number | undefined) => Math.min(100, Math.max(0, Number(n ?? 50)));
  return `${clamp(asset.focalX)}% ${clamp(asset.focalY)}%`;
}

/**
 * <img> attributes for an uploaded image: WebP variants as srcset, the
 * intrinsic size (prevents layout shift) and the focal point.
 */
export function responsiveImage(asset: ImageAsset, sizes = "100vw"): ResponsiveImageProps {
  const variants = [...(asset.variants ?? [])]
    .filter((v) => v.url && v.width > 0)
    .sort((a, b) => a.width - b.width);
  return {
    src: asset.url,
    ...(variants.length ? { srcSet: variants.map((v) => `${v.url} ${v.width}w`).join(", "), sizes } : {}),
    ...(asset.width && asset.height ? { width: asset.width, height: asset.height } : {}),
    objectPosition: objectPositionOf(asset),
  };
}

/** Only the site's own Storage bucket is allowed as a transformation source (Cloudflare → Images → Transformations). */
const OWN_BUCKET =
  /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/saadportfolio03\.firebasestorage\.app\//;
/** Widths offered in srcset: few, so the free monthly transformation quota goes far. */
const WIDTHS = [480, 960, 1600];

/** Cloudflare image transformations only exist on the live domain (not localhost or *.pages.dev). */
const transformsAvailable = () => {
  const host = (globalThis as { location?: { hostname?: string } }).location?.hostname ?? "";
  return host === "saadmaz.com" || host.endsWith(".saadmaz.com");
};

/** A Storage image resized and re-encoded (AVIF/WebP) by Cloudflare, or the original URL. */
export function resizedUrl(url: string, width: number, available = transformsAvailable()): string {
  if (!available || !OWN_BUCKET.test(url)) return url;
  return `/cdn-cgi/image/width=${width},format=auto,quality=80,fit=scale-down/${url}`;
}

/** <img> attributes for a plain Storage URL: resized variants as srcset (no-op elsewhere). */
export function resizedImage(
  url: string,
  sizes = "100vw",
  available = transformsAvailable(),
): ResponsiveImageProps {
  if (!available || !OWN_BUCKET.test(url)) return { src: url };
  return {
    src: resizedUrl(url, 1600, available),
    srcSet: WIDTHS.map((w) => `${resizedUrl(url, w, available)} ${w}w`).join(", "),
    sizes,
  };
}
