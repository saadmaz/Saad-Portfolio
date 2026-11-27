import { describe, expect, it } from "vitest";
import { TOPICS, composeMessage, topicFromQuery } from "./contactForm";

const topic = (id: string) => TOPICS.find((t) => t.id === id)!;

describe("topicFromQuery", () => {
  it("picks the topic from ?topic=, case-insensitively", () => {
    expect(topicFromQuery("?topic=Consulting").id).toBe("consulting");
  });
  it("maps the old hosting topic to speaking", () => {
    expect(topicFromQuery("?topic=hosting").id).toBe("speaking");
  });
  it("falls back to the first topic", () => {
    expect(topicFromQuery("").id).toBe("build");
    expect(topicFromQuery("?topic=nope").id).toBe("build");
  });
});

describe("composeMessage", () => {
  it("adds company, budget and timeline for builds", () => {
    expect(
      composeMessage({
        topic: topic("ai"),
        company: " Acme ",
        budget: "$10,000+",
        timeline: "ASAP",
        message: " Hi there ",
      }),
    ).toEqual({
      subject: "AI & automation · $10,000+",
      message: "Company: Acme\nBudget: $10,000+\nTimeline: ASAP\n\nHi there",
    });
  });
  it("skips budget and timeline when they're left blank", () => {
    expect(composeMessage({ topic: topic("build"), message: "Idea" })).toEqual({
      subject: "Product development",
      message: "Idea",
    });
  });
  it("adds event date and audience for events, skipping blanks", () => {
    expect(
      composeMessage({ topic: topic("speaking"), eventDate: "12 May", audience: " ", message: "Gala" }),
    ).toEqual({
      subject: "Speaking / hosting · 12 May",
      message: "Event date: 12 May\n\nGala",
    });
  });
  it("ignores build answers for other topics", () => {
    expect(composeMessage({ topic: topic("startup"), budget: "$10,000+", message: "Hello" })).toEqual({
      subject: "Startup collaboration",
      message: "Hello",
    });
  });
});
