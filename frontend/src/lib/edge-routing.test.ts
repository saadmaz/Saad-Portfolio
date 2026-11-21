import { describe, expect, it } from "vitest";
import { classifyPath } from "./edge-routing.js";

const known = new Set([
  "/",
  "/blog",
  "/about",
  "/events/48th-big-debate",
  "/blog/my-post",
  "/blog/category/tech",
]);

describe("classifyPath", () => {
  it("serves prerendered pages, ignoring case, trailing slashes and queries", () => {
    expect(classifyPath("/", known)).toEqual({ type: "known" });
    expect(classifyPath("/About/", known)).toEqual({ type: "known" });
    expect(classifyPath("/blog?q=ai", known)).toEqual({ type: "known" });
    expect(classifyPath("/events/48th-Big-Debate", known)).toEqual({ type: "known" });
  });

  it("always serves draft previews", () => {
    expect(classifyPath("/preview/abc123", known)).toEqual({ type: "pass" });
  });

  it("checks detail URLs that may have been published since the build, keeping key case", () => {
    expect(classifyPath("/blog/new-post", known)).toEqual({ type: "lookup", kind: "post", key: "new-post" });
    expect(classifyPath("/events/AbC123xyz", known)).toEqual({
      type: "lookup",
      kind: "event",
      key: "AbC123xyz",
    });
    expect(classifyPath("/certifications/aws-saa", known)).toMatchObject({ kind: "certificate" });
    expect(classifyPath("/projects/tanksudda", known)).toMatchObject({ kind: "project" });
    expect(classifyPath("/authors/saad", known)).toMatchObject({ kind: "author" });
    expect(classifyPath("/blog/series/ai-basics", known)).toMatchObject({ kind: "series", key: "ai-basics" });
    expect(classifyPath("/blog/category/new-cat", known)).toMatchObject({ kind: "category" });
  });

  it("treats everything else as missing (real 404)", () => {
    for (const p of ["/blogs", "/portfolio", "/wp-admin", "/blog/a/b/c", "/events/a/b", "/random-page"])
      expect(classifyPath(p, known)).toEqual({ type: "missing" });
  });
});
