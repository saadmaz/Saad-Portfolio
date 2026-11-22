import { describe, expect, it } from "vitest";
import { EVENT_MIN_WORDS, eventWordCount, isEventIndexable } from "./indexing.js";

const text = (n: number) => Array.from({ length: n }, () => "word").join(" ");

describe("event indexing", () => {
  it("counts description and highlights", () => {
    expect(eventWordCount({ description: "one two  three\nfour", highlights: ["five six", ""] })).toBe(6);
    expect(eventWordCount({})).toBe(0);
  });

  it("indexes write-ups at the threshold and hides shorter ones under auto", () => {
    expect(isEventIndexable({ description: text(EVENT_MIN_WORDS) })).toBe(true);
    expect(isEventIndexable({ description: text(EVENT_MIN_WORDS - 1) })).toBe(false);
    expect(isEventIndexable({ description: "Big Debate", seo_visibility: "auto" })).toBe(false);
  });

  it("lets the CMS override the rule", () => {
    expect(isEventIndexable({ description: "Big Debate", seo_visibility: "index" })).toBe(true);
    expect(isEventIndexable({ description: text(500), seo_visibility: "noindex" })).toBe(false);
  });
});
