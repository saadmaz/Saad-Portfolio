import type { Newsletter } from "@/types";
import type { NewsletterSeries } from "@/services/subscribe-service";

/** The two newsletter series; ids match `Newsletter.type` in the CMS. */
export const SERIES: { id: NewsletterSeries; label: string; blurb: string; color: string }[] = [
  {
    id: "founder",
    label: "Founder notes",
    blurb: "Building startups, product calls and lessons from shipping.",
    color: "#ff5f00",
  },
  {
    id: "cse",
    label: "Engineering",
    blurb: "Applied AI, full-stack builds and the tools behind them.",
    color: "#2fbf71",
  },
];

/** Series for an issue; unknown types fall under "founder". */
export const seriesOf = (n: Pick<Newsletter, "type">) => SERIES.find((s) => s.id === n.type) ?? SERIES[0];

/** Newest first, grouped by year ("Undated" last). */
export function issuesByYear<T extends { date?: string }>(issues: T[]): [string, T[]][] {
  const time = (d?: string) => {
    const t = Date.parse(d ?? "");
    return Number.isNaN(t) ? -Infinity : t;
  };
  const sorted = [...issues].sort((a, b) => time(b.date) - time(a.date));
  const groups = new Map<string, T[]>();
  for (const n of sorted) {
    const t = time(n.date);
    const key = t === -Infinity ? "Undated" : String(new Date(t).getFullYear());
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }
  return [...groups];
}
