import type { Event } from "@/types";
import { parseEventDate } from "@/lib/eventDates";

/** Roles where Saad was on stage rather than in the audience. */
export const STAGE_ROLES = new Set([
  "Host",
  "Speaker",
  "Compere",
  "Compère",
  "Emcee",
  "MC",
  "Panelist",
  "Moderator",
]);

/** "500+" → 500, "2,000+" → 2000, "1.2k" → 1200; anything else → 0. */
export function audienceOf(text?: string): number {
  const m = (text ?? "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(k)?/i);
  if (!m) return 0;
  return Math.round(Number(m[1]) * (m[2] ? 1000 : 1));
}

export interface EventStats {
  count: number;
  audience: number;
  /** Calendar years with at least one event. */
  years: number;
  onStage: number;
}

export function eventStats(events: Event[]): EventStats {
  const years = new Set(events.map((e) => parseEventDate(e.date).year).filter((y) => y !== null));
  return {
    count: events.length,
    audience: events.reduce((n, e) => n + audienceOf(e.attendees), 0),
    years: years.size,
    onStage: events.filter((e) => e.role && STAGE_ROLES.has(e.role)).length,
  };
}

/** The biggest stage moments with a photo: largest audience first, then newest. */
export function featuredEvents(events: Event[], n = 3): Event[] {
  return events
    .filter((e) => e.role && STAGE_ROLES.has(e.role) && (e.image || e.images?.length))
    .map((e, i) => ({ e, i, size: audienceOf(e.attendees) }))
    .sort((a, b) => b.size - a.size || a.i - b.i)
    .slice(0, n)
    .map((x) => x.e);
}

/** Roles in order of how often they appear, with counts. */
export function roleCounts(events: Event[]): [string, number][] {
  const m = new Map<string, number>();
  for (const e of events) if (e.role) m.set(e.role, (m.get(e.role) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const ROLE_COLORS: Record<string, string> = {
  Host: "#ff5f00",
  Speaker: "#f5a524",
  Organizer: "#2fbf71",
  Organiser: "#2fbf71",
  Compere: "#e5488a",
  Compère: "#e5488a",
  Attendee: "#7c8db5",
};
export const roleColor = (role?: string) => (role && ROLE_COLORS[role]) || "#9aa0aa";
