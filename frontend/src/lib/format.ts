import { readingTimeMinutes } from "./article-core";
// Date formatting shared by every page. Ranges use an en dash, never an em dash.

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** A bare "2021" is a year-only date; don't dress it up as "Jan 2021". */
const YEAR_ONLY = /^\d{4}$/;

/** "Mar 2026" */
export function monthYear(value: string | undefined | null): string {
  if (value && YEAR_ONLY.test(value)) return value;
  const d = toDate(value);
  return d ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : (value ?? "");
}

/** "14 March 2026" */
export function fullDate(value: string | undefined | null): string {
  if (value && YEAR_ONLY.test(value)) return value;
  const d = toDate(value);
  return d
    ? d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : (value ?? "");
}

export function year(value: string | undefined | null): string {
  const d = toDate(value);
  return d ? String(d.getFullYear()) : (value ?? "");
}

/** Month name + year from split fields, e.g. ("March", 2024) → "Mar 2024". */
export function partsToLabel(month?: string, yr?: number): string {
  if (month && yr) return `${month.slice(0, 3)} ${yr}`;
  return yr ? String(yr) : "";
}

export function range(start: string, end: string | null | undefined, current?: boolean): string {
  const to = current ? "Present" : end || "";
  // No start date: show the end alone rather than a dangling "– Present".
  if (!start) return to;
  return to ? `${start} – ${to}` : start;
}

export function monthIndex(month?: string): number {
  const i = month ? MONTHS.indexOf(month) : -1;
  return i < 0 ? 0 : i;
}

/** Rough reading time for HTML content. */
/** "4 min" - same algorithm the CMS uses (see lib/article-core.js). */
export function readingTime(html: string | undefined): string {
  return `${readingTimeMinutes(html)} min`;
}
