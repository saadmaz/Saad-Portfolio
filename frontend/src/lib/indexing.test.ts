import { describe, expect, it } from "vitest";
import {
  EVENT_MIN_WORDS,
  eventWordCount,
  isEventIndexable,
  isProjectIndexable,
  PROJECT_MIN_WORDS,
  projectWordCount,
} from "./indexing.js";

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

describe("project indexing", () => {
  it("counts contribution, impact, architecture and technical decisions too", () => {
    expect(
      projectWordCount({
        impact: "a b",
        contribution: ["c d", "e"],
        technical_decisions: ["f"],
        architecture: { description: "g h" },
      }),
    ).toBe(8);
  });

  it("counts tagline, overview, description and long description", () => {
    expect(
      projectWordCount({ tagline: "a b", overview: "c", description: "d e", long_description: "f" }),
    ).toBe(6);
  });

  it("hides stub projects and indexes real case studies", () => {
    expect(isProjectIndexable({ title: "po", tagline: "gvytcvi", overview: "x y z" } as never)).toBe(false);
    expect(isProjectIndexable({ overview: text(PROJECT_MIN_WORDS) })).toBe(true);
    expect(isProjectIndexable({ tagline: "Short", seo_visibility: "index" })).toBe(true);
    expect(isProjectIndexable({ overview: text(500), seo_visibility: "noindex" })).toBe(false);
  });
});
