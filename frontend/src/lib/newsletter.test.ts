import { describe, expect, it } from "vitest";
import { issuesByYear, seriesOf } from "./newsletter";

describe("seriesOf", () => {
  it("maps types and falls back to founder notes", () => {
    expect(seriesOf({ type: "cse" }).label).toBe("Engineering");
    expect(seriesOf({ type: "weird" }).id).toBe("founder");
  });
});

describe("issuesByYear", () => {
  it("sorts newest first and groups by year, undated last", () => {
    const out = issuesByYear([
      { date: "2024-01-05" },
      { date: "nope" },
      { date: "2025-03-01" },
      { date: "2024-06-01" },
    ]);
    expect(out.map(([y, l]) => [y, l.map((n) => n.date)])).toEqual([
      ["2025", ["2025-03-01"]],
      ["2024", ["2024-06-01", "2024-01-05"]],
      ["Undated", ["nope"]],
    ]);
  });
});
