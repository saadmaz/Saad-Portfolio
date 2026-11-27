import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A brand/category colour used as text, deepened toward the text colour on light
 * bands (via --tint in index.css) so it stays readable; unchanged on dark ones.
 */
export const tint = (color: string) => `color-mix(in srgb, ${color} var(--tint), rgb(var(--fg)))`;
