import { describe, expect, it } from "vitest";
import { orgKey, sameOrg } from "./orgName";

describe("orgName", () => {
  it("ignores case, punctuation and legal suffixes", () => {
    expect(orgKey("Stopwash (PVT) Ltd.")).toBe("stopwash");
    expect(sameOrg("Stopwash (PVT) Ltd.", "STOPWASH PVT LTD")).toBe(true);
    expect(sameOrg("Tank Sudda (Pvt) Ltd", "Tank Sudda (PVT) Ltd.")).toBe(true);
    expect(sameOrg("Polish Station", "Polish Station")).toBe(true);
  });
  it("doesn't match different companies or blanks", () => {
    expect(sameOrg("Team Sudda", "Tank Sudda")).toBe(false);
    expect(sameOrg("", "")).toBe(false);
    expect(sameOrg("Ltd", "Pvt")).toBe(false);
  });
});
