import { describe, expect, it } from "vitest";
import { ga4Configured, gscConfigured, gscRange, parseGa4, parseGsc } from "./_lib/insights";
import { integrationStatus } from "./admin";

const env = (vars: Record<string, string>) => vars as NodeJS.ProcessEnv;

describe("GA4 report", () => {
  it("turns a batchRunReports response into totals, trend, pages and sources", () => {
    const report = parseGa4(
      {
        reports: [
          {
            rows: [
              {
                dimensionValues: [{ value: "20261101" }],
                metricValues: [{ value: "12" }, { value: "5" }, { value: "6" }, { value: "300" }],
              },
              {
                dimensionValues: [{ value: "20261102" }],
                metricValues: [{ value: "8" }, { value: "4" }, { value: "4" }, { value: "100" }],
              },
            ],
            totals: [{ metricValues: [{ value: "20" }, { value: "8" }, { value: "10" }, { value: "400" }] }],
          },
          {
            rows: [
              {
                dimensionValues: [{ value: "/blog/a" }],
                metricValues: [{ value: "15" }, { value: "6" }, { value: "180" }],
              },
              {
                dimensionValues: [{ value: "/" }],
                metricValues: [{ value: "5" }, { value: "0" }, { value: "0" }],
              },
            ],
          },
          { rows: [{ dimensionValues: [{ value: "" }], metricValues: [{ value: "7" }] }] },
        ],
      },
      new Date("2026-11-29T12:00:00Z"),
    );
    expect(report.range).toEqual({ start: "2026-11-01", end: "2026-11-28" });
    expect(report.totals).toEqual({ views: 20, users: 8, sessions: 10, avgEngagementSec: 50 });
    expect(report.daily).toEqual([
      { date: "2026-11-01", views: 12, users: 5 },
      { date: "2026-11-02", views: 8, users: 4 },
    ]);
    expect(report.pages[0]).toEqual({ path: "/blog/a", views: 15, users: 6, avgEngagementSec: 30 });
    // No users: no division by zero.
    expect(report.pages[1].avgEngagementSec).toBe(0);
    expect(report.sources).toEqual([{ source: "(direct)", sessions: 7 }]);
  });

  it("handles an empty property", () => {
    const report = parseGa4({ reports: [{}, {}, {}] });
    expect(report.totals).toEqual({ views: 0, users: 0, sessions: 0, avgEngagementSec: 0 });
    expect(report.daily).toEqual([]);
    expect(report.pages).toEqual([]);
  });
});

describe("Search Console report", () => {
  it("turns query responses into totals, trend, queries and page paths", () => {
    const range = { start: "2026-10-30", end: "2026-11-26" };
    const report = parseGsc(
      [
        { rows: [{ clicks: 30, impressions: 1200, ctr: 0.025, position: 14.234 }] },
        { rows: [{ keys: ["2026-11-01"], clicks: 2, impressions: 40, ctr: 0.05, position: 9 }] },
        { rows: [{ keys: ["saad mazhar"], clicks: 20, impressions: 50, ctr: 0.4, position: 1.2 }] },
        {
          rows: [
            {
              keys: ["https://www.saadmaz.com/blog/a"],
              clicks: 5,
              impressions: 300,
              ctr: 0.0167,
              position: 8.04,
            },
          ],
        },
      ],
      range,
    );
    expect(report.range).toBe(range);
    expect(report.totals).toEqual({ clicks: 30, impressions: 1200, ctr: 2.5, position: 14.2 });
    expect(report.daily[0]).toEqual({ date: "2026-11-01", clicks: 2, impressions: 40, ctr: 5, position: 9 });
    expect(report.queries[0].query).toBe("saad mazhar");
    expect(report.pages[0]).toEqual({ path: "/blog/a", clicks: 5, impressions: 300, ctr: 1.7, position: 8 });
  });

  it("ends the window three days ago because Search Console lags", () => {
    expect(gscRange(new Date("2026-11-29T12:00:00Z"))).toEqual({ start: "2026-10-30", end: "2026-11-26" });
  });
});

describe("configuration", () => {
  it("needs a numeric GA4 property ID, not a G- measurement ID", () => {
    expect(ga4Configured(env({ GA4_PROPERTY_ID: "412345678" }))).toBe(true);
    expect(ga4Configured(env({ GA4_PROPERTY_ID: "G-ABC123" }))).toBe(false);
    expect(ga4Configured(env({}))).toBe(false);
  });

  it("reports both integrations from the site variables alone", () => {
    expect(gscConfigured(env({ GSC_SITE_URL: "sc-domain:saadmaz.com" }))).toBe(true);
    const status = integrationStatus(
      env({ GA4_PROPERTY_ID: "412345678", GSC_SITE_URL: "sc-domain:saadmaz.com" }),
    );
    expect(status.ga4).toBe(true);
    expect(status.searchConsole).toBe(true);
  });
});
