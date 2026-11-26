export const OWN_BUCKET: RegExp;
export const RESIZE_WIDTHS: number[];
export function isOwnStorageImage(url: unknown): boolean;
export function cloudflareResized(url: string, width: number): string;
export function cloudflareSrcSet(url: string): string;
export function variantSrcSet(variants: { url?: string; width: number }[] | null | undefined): string;
