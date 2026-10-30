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

/** "Mar 2026" */
export function monthYear(value: string | undefined | null): string {
  const d = toDate(value);
  return d ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : (value ?? "");
}

/** "14 March 2026" */
export function fullDate(value: string | undefined | null): string {
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
  return to ? `${start} – ${to}` : start;
}

export function monthIndex(month?: string): number {
  const i = month ? MONTHS.indexOf(month) : -1;
  return i < 0 ? 0 : i;
}

/** Rough reading time for HTML content. */
export function readingTime(html: string | undefined): string {
  const words = (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 230))} min`;
}
