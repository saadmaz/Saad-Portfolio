import { describe, expect, it } from "vitest";
import { formatDate } from "./dateUtils";

describe("formatDate", () => {
  it("formats an ISO date in long US form", () => {
    expect(formatDate("2024-03-15T12:00:00Z")).toBe("March 15, 2024");
  });

  it("returns an empty string for empty input", () => {
    expect(formatDate("")).toBe("");
  });
});
