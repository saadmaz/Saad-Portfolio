import { describe, expect, it } from "vitest";
import { authorFaq, authorTopics } from "./authorFaq";

const posts = [
  { category: "Technology", tags: ["ai-agents", "rag"] },
  { category: "Technology", tags: ["rag"] },
  { category: "Startups", tags: [] },
];

describe("authorTopics", () => {
  it("ranks categories above tags and humanises tag slugs", () => {
    expect(authorTopics(posts, 4)).toEqual(["Technology", "Startups", "rag", "ai agents"]);
  });
});

describe("authorFaq", () => {
  it("answers who, what and how to reach", () => {
    const faq = authorFaq({ name: "Ada", bio: "Ada builds things." }, posts);
    expect(faq.map((f) => f.question)).toEqual([
      "Who is Ada?",
      "What does Ada write about?",
      "How can I contact Ada?",
    ]);
    expect(faq[1].answer).toMatch(/^Technology, Startups, rag and ai agents. /);
    expect(faq[1].answer).toContain("3 articles so far");
  });
  it("prefers the author's own expertise list", () => {
    expect(authorFaq({ name: "Ada" }, posts, { expertise: ["AI"] })[0].answer).toBe(
      "AI. 3 articles so far, each from hands-on work.",
    );
  });
  it("returns nothing without an author", () => {
    expect(authorFaq(null, posts)).toEqual([]);
  });
});
