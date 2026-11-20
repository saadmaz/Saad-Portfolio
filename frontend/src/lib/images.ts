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
