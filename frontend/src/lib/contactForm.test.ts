import { describe, expect, it } from "vitest";
import { TOPICS, composeMessage, topicFromQuery } from "./contactForm";

const topic = (id: string) => TOPICS.find((t) => t.id === id)!;

describe("topicFromQuery", () => {
  it("picks the topic from ?topic=, case-insensitively", () => {
    expect(topicFromQuery("?topic=Hosting").id).toBe("hosting");
  });
  it("falls back to the first topic", () => {
    expect(topicFromQuery("").id).toBe("build");
    expect(topicFromQuery("?topic=nope").id).toBe("build");
  });
});

describe("composeMessage", () => {
  it("adds budget and timeline for builds", () => {
    expect(
      composeMessage({ topic: topic("ai"), budget: "$10k+", timeline: "ASAP", message: " Hi there " }),
    ).toEqual({
      subject: "AI integration · $10k+",
      message: "Budget: $10k+\nTimeline: ASAP\n\nHi there",
    });
  });
  it("adds event date and audience for events, skipping blanks", () => {
    expect(
      composeMessage({ topic: topic("hosting"), eventDate: "12 May", audience: " ", message: "Gala" }),
    ).toEqual({
      subject: "Hosting · 12 May",
      message: "Event date: 12 May\n\nGala",
    });
  });
  it("sends the message alone for other topics", () => {
    expect(composeMessage({ topic: topic("other"), budget: "$10k+", message: "Hello" })).toEqual({
      subject: "Something else",
      message: "Hello",
    });
  });
});
