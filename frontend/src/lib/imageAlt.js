/**
 * Alt text for event photos, shared by the React pages and
 * scripts/prerender.mjs (plain JS for the same reason as seo-content.js).
 *
 * A caption typed in admin wins; otherwise it's built from the event so every
 * photo names who's in it, what they're doing and where: the words people
 * actually search for ("Saad Mazhar hosting 48th Big Debate, Isipathana College").
 */

import { SITE_NAME } from "./seo-content.js";

const ROLE_PHRASE = {
  Speaker: "speaking at",
  Host: "hosting",
  Compere: "compering",
  Organizer: "organising",
  Panelist: "on the panel at",
  Attendee: "at",
};

/** All of an event's photos in display order (legacy events only have `image`). */
export function eventPhotos(event) {
  if (event.images?.length) return event.images;
  return event.image ? [event.image] : [];
}

/** Alt text for one of an event's photos, identified by its URL. */
export function eventPhotoAlt(event, src) {
  const index = Math.max(0, eventPhotos(event).indexOf(src));
  const caption = event.imageCaptions?.[index]?.trim();
  if (caption) return caption;

  const phrase = ROLE_PHRASE[event.role] ?? "at";
  const title = String(event.title ?? "").trim();
  const where = [
    // Skip the organiser when the title already names it ("Isipathana College Big Debate").
    event.organizer &&
      !title.toLowerCase().includes(String(event.organizer).toLowerCase()) &&
      event.organizer,
    event.location,
  ].filter(Boolean);
  const base = [`${SITE_NAME} ${phrase} ${title}`, ...where].join(", ");
  return index > 0 ? `${base} (photo ${index + 1})` : base;
}
