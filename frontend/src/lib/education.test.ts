import { describe, expect, it } from "vitest";
import { educationSkills, studyYears } from "./education";
import type { Education } from "@/types";

const edu = (p: Partial<Education>): Education => ({
  id: "x",
  school_name: "S",
  school_logo: "",
  is_current: false,
  ...p,
});

describe("educationSkills", () => {
  it("merges name variants, counts schools and borrows CMS logos", () => {
    const out = educationSkills(
      [edu({ skills: ["React.js", "Python"] }), edu({ skills: ["React", "React"] })],
      [{ category: "Web", skills: [{ name: "React", level: "Expert", startYear: 2022, icon: "r.svg" }] }],
    );
    expect(out[0]).toEqual({ name: "React", icon: "r.svg", count: 2 });
    expect(out[1]).toEqual({ name: "Python", icon: undefined, count: 1 });
  });
});

describe("studyYears", () => {
  it("spans earliest start to latest end, with current schools running to now", () => {
    expect(
      studyYears(
        [edu({ start_year: 2009, end_year: 2022 }), edu({ start_year: 2023, is_current: true })],
        2026,
      ),
    ).toBe(17);
  });
  it("is 0 without dates", () => {
    expect(studyYears([edu({})])).toBe(0);
  });
});
