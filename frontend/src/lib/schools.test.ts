import { describe, expect, it } from "vitest";
import type { Award, Education, Event, Project, VolunteerExperience } from "@/types";
import { isSchoolPageIndexable, rolesOf, schoolContent, schoolNameOf, schoolSlugOf } from "./schools";

const edu = {
  school_name: "Isipathana College, Colombo 05",
  description: "Thirteen years at Isipathana, from Grade 1 to Grade 13. ".repeat(4),
  activities_and_societies: "President, Interact Club (2020–21)\nCaptain, English Debate Team (2020–23)",
  honors_and_awards: [{ award_title: "Best Speaker" }],
} as unknown as Education;

describe("schools", () => {
  it("names and slugs from the school name", () => {
    expect(schoolNameOf(edu)).toBe("Isipathana College");
    expect(schoolSlugOf(edu)).toBe("isipathana-college");
    expect(schoolNameOf({ institution: "University of Westminster", school_name: "x" } as Education)).toBe(
      "University of Westminster",
    );
  });
  it("lists roles line by line", () => {
    expect(rolesOf(edu)).toEqual([
      "President, Interact Club (2020–21)",
      "Captain, English Debate Team (2020–23)",
    ]);
  });
  it("gathers material mentioning the school's distinctive name", () => {
    const c = schoolContent(edu, {
      awards: [
        { title: "Winners", issuer: "Isipathana College & Thurstan College" },
        { title: "Other", issuer: "Royal College" },
      ] as Award[],
      volunteer: [
        { organization: "Interact Club of Isipathana College", role: "President" },
      ] as VolunteerExperience[],
      events: [{ title: "Big Debate", description: "Captained Isipathana College" }] as Event[],
      projects: [
        { title: "Isipathana Connect", client: "Isipathana College Old Boys' Association" },
      ] as Project[],
    });
    expect([
      c.awards.length,
      c.volunteer.length,
      c.events.length,
      c.projects.length,
      c.honours.length,
    ]).toEqual([1, 1, 1, 1, 1]);
    expect(isSchoolPageIndexable(edu, c)).toBe(true);
  });
  it("keeps bare entries out of search", () => {
    const bare = { school_name: "Somewhere School" } as Education;
    expect(isSchoolPageIndexable(bare, schoolContent(bare, {}))).toBe(false);
  });
});
