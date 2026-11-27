/**
 * Read-only GA4 and Search Console reports for the CMS analytics page.
 *
 * Both use the site's existing service account (FIREBASE_CLIENT_EMAIL /
 * FIREBASE_PRIVATE_KEY): add that email as a Viewer on the GA4 property and as a
 * (restricted) user on the Search Console property, and enable the "Google
 * Analytics Data API" and "Search Console API" on its Google Cloud project.
 * Then set GA4_PROPERTY_ID (numeric) and GSC_SITE_URL ("sc-domain:example.com"
 * or "https://www.example.com/").
 *
 * Results are cached per isolate for 30 minutes; GA4 and Search Console data
 * only update a few times a day anyway.
 */

import { accessToken } from "./google.js";

const GA_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TTL_MS = 30 * 60_000;
const DAYS = 28;

/** A refusal or failure reported by a Google API, with its message (never credentials). */
export class GoogleApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const ga4Configured = (env: NodeJS.ProcessEnv = process.env) =>
  /^\d+$/.test(env.GA4_PROPERTY_ID?.trim() ?? "");
export const gscConfigured = (env: NodeJS.ProcessEnv = process.env) => !!env.GSC_SITE_URL?.trim();

const memo = new Map<string, { at: number; value: unknown }>();
async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  const value = await load();
  memo.set(key, { at: Date.now(), value });
  return value;
}

async function post<T>(url: string, scope: string, body: unknown): Promise<T> {
  const token = await accessToken(Date.now(), scope);
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok)
    throw new GoogleApiError(res.status, data.error?.message || `Google API error (${res.status})`);
  return data as T;
}

const num = (v: string | number | undefined) => Number(v ?? 0) || 0;
const round = (n: number, dp = 1) => Math.round(n * 10 ** dp) / 10 ** dp;

/* ───────────────────────── GA4 ───────────────────────── */

export interface Ga4Report {
  range: { start: string; end: string };
  totals: { views: number; users: number; sessions: number; avgEngagementSec: number };
  daily: { date: string; views: number; users: number }[];
  pages: { path: string; views: number; users: number; avgEngagementSec: number }[];
  sources: { source: string; sessions: number }[];
}

type Ga4Row = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };
export type Ga4BatchResponse = { reports?: { rows?: Ga4Row[]; totals?: Ga4Row[] }[] };

const GA4_RANGE = [{ startDate: `${DAYS}daysAgo`, endDate: "yesterday" }];

export const GA4_REQUESTS = [
  {
    dateRanges: GA4_RANGE,
    dimensions: [{ name: "date" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "userEngagementDuration" },
    ],
    metricAggregations: ["TOTAL"],
    orderBys: [{ dimension: { dimensionName: "date" } }],
    keepEmptyRows: true,
  },
  {
    dateRanges: GA4_RANGE,
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "userEngagementDuration" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 50,
  },
  {
    dateRanges: GA4_RANGE,
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  },
];

const dim = (r: Ga4Row, i = 0) => r.dimensionValues?.[i]?.value ?? "";
const met = (r: Ga4Row, i: number) => num(r.metricValues?.[i]?.value);
/** GA4 dates come as YYYYMMDD. */
const isoDate = (d: string) => (/^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : d);

export function parseGa4(data: Ga4BatchResponse, today = new Date()): Ga4Report {
  const [trend, pages, sources] = data.reports ?? [];
  const t = trend?.totals?.[0];
  const users = t ? met(t, 1) : 0;
  return {
    range: { start: daysBefore(today, DAYS), end: daysBefore(today, 1) },
    totals: {
      views: t ? met(t, 0) : 0,
      users,
      sessions: t ? met(t, 2) : 0,
      avgEngagementSec: users && t ? round(met(t, 3) / users) : 0,
    },
    daily: (trend?.rows ?? []).map((r) => ({ date: isoDate(dim(r)), views: met(r, 0), users: met(r, 1) })),
    pages: (pages?.rows ?? []).map((r) => ({
      path: dim(r),
      views: met(r, 0),
      users: met(r, 1),
      avgEngagementSec: met(r, 1) ? round(met(r, 2) / met(r, 1)) : 0,
    })),
    sources: (sources?.rows ?? []).map((r) => ({ source: dim(r) || "(direct)", sessions: met(r, 0) })),
  };
}

export function ga4Report(env: NodeJS.ProcessEnv = process.env): Promise<Ga4Report> {
  const id = env.GA4_PROPERTY_ID!.trim();
  return cached(`ga4:${id}`, async () =>
    parseGa4(
      await post<Ga4BatchResponse>(
        `https://analyticsdata.googleapis.com/v1beta/properties/${id}:batchRunReports`,
        GA_SCOPE,
        { requests: GA4_REQUESTS },
      ),
    ),
  );
}

/* ───────────────────── Search Console ───────────────────── */

export interface GscRow {
  clicks: number;
  impressions: number;
  /** Click-through rate as a percentage. */
  ctr: number;
  position: number;
}
export interface GscReport {
  range: { start: string; end: string };
  totals: GscRow;
  daily: ({ date: string } & GscRow)[];
  queries: ({ query: string } & GscRow)[];
  pages: ({ path: string } & GscRow)[];
}

type GscApiRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };
export type GscResponse = { rows?: GscApiRow[] };

const metrics = (r?: GscApiRow): GscRow => ({
  clicks: num(r?.clicks),
  impressions: num(r?.impressions),
  ctr: round(num(r?.ctr) * 100),
  position: round(num(r?.position)),
});

const pathOf = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

/** Search Console lags ~2-3 days, so the window ends three days ago. */
export function gscRange(today = new Date()) {
  return { start: daysBefore(today, DAYS + 2), end: daysBefore(today, 3) };
}

export function parseGsc(
  [totals, daily, queries, pages]: GscResponse[],
  range: { start: string; end: string },
): GscReport {
  return {
    range,
    totals: metrics(totals?.rows?.[0]),
    daily: (daily?.rows ?? []).map((r) => ({ date: r.keys?.[0] ?? "", ...metrics(r) })),
    queries: (queries?.rows ?? []).map((r) => ({ query: r.keys?.[0] ?? "", ...metrics(r) })),
    pages: (pages?.rows ?? []).map((r) => ({ path: pathOf(r.keys?.[0] ?? ""), ...metrics(r) })),
  };
}

export function gscReport(env: NodeJS.ProcessEnv = process.env): Promise<GscReport> {
  const site = env.GSC_SITE_URL!.trim();
  return cached(`gsc:${site}`, async () => {
    const range = gscRange();
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
    const q = (dimensions: string[], rowLimit = 1000) =>
      post<GscResponse>(url, GSC_SCOPE, { startDate: range.start, endDate: range.end, dimensions, rowLimit });
    const results = await Promise.all([q([]), q(["date"]), q(["query"], 25), q(["page"], 50)]);
    return parseGsc(results, range);
  });
}

function daysBefore(today: Date, n: number) {
  return new Date(today.getTime() - n * 86_400_000).toISOString().slice(0, 10);
}
