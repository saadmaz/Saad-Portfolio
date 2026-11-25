import { describe, expect, it } from "vitest";
import { decodeFields, encodeFields, fieldPath, FieldValue, splitWrite } from "./_lib/firestore";

describe("encode/decode", () => {
  it("round-trips plain JSON values", () => {
    const data = { s: "x", i: 3, d: 1.5, b: true, n: null, a: [1, "two"], m: { nested: { deep: 1 } } };
    expect(decodeFields(encodeFields(data))).toEqual(data);
  });
  it("stores dates as timestamps and reads them back as ISO strings", () => {
    const at = new Date("2026-01-02T03:04:05.000Z");
    const enc = encodeFields({ at });
    expect(enc.at).toEqual({ timestampValue: "2026-01-02T03:04:05.000Z" });
    expect(decodeFields(enc).at).toBe("2026-01-02T03:04:05.000Z");
  });
  it("encodes integers as strings, as the REST API expects", () => {
    expect(encodeFields({ n: 42 }).n).toEqual({ integerValue: "42" });
  });
});

describe("fieldPath", () => {
  it("quotes segments that aren't simple identifiers", () => {
    expect(fieldPath(["referrers", "google_com"])).toBe("referrers.google_com");
    expect(fieldPath(["referrers", "t-co"])).toBe("referrers.`t-co`");
    expect(fieldPath(["depth", "d25"])).toBe("depth.d25");
  });
});

describe("splitWrite", () => {
  it("separates increments and timestamps from plain values, with merge leaf paths", () => {
    const { plain, leaves, transforms } = splitWrite({
      views: FieldValue.increment(1),
      lastViewAt: "now",
      referrers: { "t-co": FieldValue.increment(2), keep: "x" },
      created: FieldValue.serverTimestamp(),
    });
    expect(plain).toEqual({ lastViewAt: "now", referrers: { keep: "x" } });
    expect(leaves).toEqual(["lastViewAt", "referrers.keep"]);
    expect(transforms).toEqual([
      { fieldPath: "views", increment: { integerValue: "1" } },
      { fieldPath: "referrers.`t-co`", increment: { integerValue: "2" } },
      { fieldPath: "created", setToServerValue: "REQUEST_TIME" },
    ]);
  });
});
