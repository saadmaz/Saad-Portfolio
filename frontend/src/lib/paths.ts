import type { Certificate, Event } from "@/types";

/** Readable URL segment when the doc has one, the Firestore ID otherwise. */
const key = (item: { id: string; slug?: string }) => item.slug || item.id;

export const eventPath = (e: Pick<Event, "id" | "slug">) => `/events/${key(e)}`;
export const certificatePath = (c: Pick<Certificate, "id" | "slug">) => `/certifications/${key(c)}`;

/** Detail routes accept either form, so links shared before slugs existed keep working. */
export const matchesKey = (item: { id: string; slug?: string }, param: string | undefined) =>
  !!param && (item.slug === param || String(item.id) === param);
