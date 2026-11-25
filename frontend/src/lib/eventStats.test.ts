import { describe, expect, it } from "vitest";
import { audienceOf, eventStats, featuredEvents, roleCounts } from "./eventStats";
import type { Event } from "@/types";

const ev = (p: Partial<Event>): Event =>
  ({
    id: p.title ?? "x",
    title: "x",
    organizer: "",
    date: "2023",
    location: "",
    description: "",
    type: "Other",
    ...p,
  }) as Event;

describe("audienceOf", () => {
  it("reads common formats", () => {
    expect(audienceOf("500+")).toBe(500);
    expect(audienceOf("2,000+")).toBe(2000);
    expect(audienceOf("1.2k")).toBe(1200);
    expect(audienceOf("lots")).toBe(0);
    expect(audienceOf(undefined)).toBe(0);
  });
});

describe("eventStats", () => {
  it("sums audience, counts years and stage roles", () => {
    const s = eventStats([
      ev({ role: "Host", attendees: "300", date: "Apr 27, 2022" }),
      ev({ role: "Attendee", attendees: "1,000+", date: "2023" }),
      ev({ role: "Compere", date: "2023" }),
      ev({ date: "someday" }),
    ]);
    expect(s).toEqual({ count: 4, audience: 1300, years: 2, onStage: 2 });
  });
});

describe("featuredEvents", () => {
  it("keeps stage events with photos, biggest first", () => {
    const out = featuredEvents([
      ev({ title: "a", role: "Host", image: "a.jpg", attendees: "100" }),
      ev({ title: "b", role: "Attendee", image: "b.jpg", attendees: "9000" }),
      ev({ title: "c", role: "Speaker", images: ["c.jpg"], attendees: "800" }),
      ev({ title: "d", role: "Host", attendees: "5000" }),
    ]);
    expect(out.map((e) => e.title)).toEqual(["c", "a"]);
  });
});

describe("roleCounts", () => {
  it("orders by frequency", () => {
    expect(roleCounts([ev({ role: "Host" }), ev({ role: "Speaker" }), ev({ role: "Host" })])).toEqual([
      ["Host", 2],
      ["Speaker", 1],
    ]);
  });
});
