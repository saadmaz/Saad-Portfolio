import { describe, expect, it } from "vitest";
import { categoryDescriptionOf, eventDescriptionOf, pageTitle, TITLE_MAX } from "./seo-content.js";

describe("eventDescriptionOf", () => {
  it("keeps a CMS description that is already long enough", () => {
    const own =
      "Hosted the annual inter-school debate final, introducing speakers and keeping the evening on time.";
    expect(eventDescriptionOf({ title: "Big Debate", description: own })).toBe(own);
  });

  it("pads a short description with role, organiser, place and date, without stray spaces", () => {
    const text = eventDescriptionOf({
      title: "51st Big Debate ",
      description: "Big Debate",
      role: "Attendee",
      organizer: "Isipathana College",
      location: "Colombo",
      date: "2025-02-14",
    });
    expect(text).toBe(
      "Saad Mazhar: Attendee at 51st Big Debate organised by Isipathana College in Colombo (Feb 2025).",
    );
    expect(text).not.toMatch(/\s{2}/);
  });

  it("leads with a short description that adds something beyond the title", () => {
    expect(
      eventDescriptionOf({ title: "Interact District Conference", description: "IDC 21", role: "Host" }),
    ).toBe("IDC 21. Saad Mazhar: Host at Interact District Conference.");
  });
});

describe("pageTitle", () => {
  it("adds the name when it fits and drops it when it would overflow", () => {
    expect(pageTitle("Work Experience")).toBe("Work Experience - Saad Mazhar");
    const long = "Staynex Sri Lanka – The Future of Travel, AI & Entrepreneurship";
    expect(pageTitle(long)).toBe(long);
    expect(pageTitle("x".repeat(TITLE_MAX - " - Saad Mazhar".length))).toHaveLength(TITLE_MAX);
  });
});

describe("categoryDescriptionOf", () => {
  it("prefers the CMS description and falls back to a full sentence", () => {
    expect(categoryDescriptionOf("Technology", "  Custom copy.  ")).toBe("Custom copy.");
    expect(categoryDescriptionOf("Technology").length).toBeGreaterThanOrEqual(70);
  });
});
