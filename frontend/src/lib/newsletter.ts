import type { Newsletter } from "@/types";
import type { NewsletterSeries } from "@/services/subscribe-service";

/**
 * The six series: each is a blog series (`blog_series/{id}`) and a newsletter
 * topic. Ids match `Newsletter.type`, subscriber `topics` and
 * server/_lib/subscribe.ts SERIES.
 */
export const SERIES: {
  id: NewsletterSeries;
  number: string;
  title: string;
  label: string;
  blurb: string;
  color: string;
}[] = [
  {
    id: "building-in-public",
    number: "01",
    title: "Building in Public",
    label: "Projects",
    blurb: "The messy, exciting process of turning ideas into reality.",
    color: "#ff5f00",
  },
  {
    id: "ai-and-technology",
    number: "02",
    title: "AI & Technology",
    label: "AI",
    blurb: "Less hype. More real-world AI.",
    color: "#2fbf71",
  },
  {
    id: "startups",
    number: "03",
    title: "Startups",
    label: "Business",
    blurb: "Stories, lessons and realities of building businesses.",
    color: "#3b82f6",
  },
  {
    id: "personal-branding",
    number: "04",
    title: "Personal Branding",
    label: "Growth",
    blurb: "Building your presence beyond a LinkedIn page.",
    color: "#e8488a",
  },
  {
    id: "ai-tutorials",
    number: "05",
    title: "AI Tutorials",
    label: "Practical AI",
    blurb: "Practical ways to work smarter with AI.",
    color: "#8b5cf6",
  },
  {
    id: "tech-news",
    number: "06",
    title: "Tech News",
    label: "News",
    blurb: "What's happening. What's changing. What matters.",
    color: "#f5b700",
  },
];

/** Issue types from before the six series. */
const LEGACY_TYPE: Record<string, NewsletterSeries> = { founder: "startups", cse: "ai-and-technology" };

/** Series for an issue; legacy types are mapped, unknown ones fall under the first series. */
export const seriesOf = (n: Pick<Newsletter, "type">) => {
  const id = LEGACY_TYPE[n.type] ?? n.type;
  return SERIES.find((s) => s.id === id) ?? SERIES[0];
};

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
