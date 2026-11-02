/** Types for imageAlt.js (kept as JS so scripts/prerender.mjs can import it). */

export interface EventPhotoSource {
  title?: string;
  organizer?: string;
  location?: string;
  role?: string;
  image?: string;
  images?: string[];
  imageCaptions?: string[];
}

export function eventPhotos(event: EventPhotoSource): string[];
export function eventPhotoAlt(event: EventPhotoSource, src: string): string;
