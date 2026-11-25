import { describe, expect, it } from "vitest";
import type { Experience, Project } from "@/types";
import { companyPeriod, companyProjects, companySlug, normalizeExperience } from "./experience";
import { range } from "./format";

const doc = (over: Partial<Experience>): Experience => ({ id: "x", ...over }) as Experience;

describe("range", () => {
  it("drops the dash when there is no start date", () => {
    expect(range("", null, true)).toBe("Present");
    expect(range("Jan 2024", null, true)).toBe("Jan 2024 – Present");
  });
});

describe("normalizeExperience", () => {
  it("gives each company a slug, its ids and a clean period without a start date", () => {
    const [c] = normalizeExperience([
      doc({
        id: "abc",
        company_name: "TankSudda",
        roles: [{ role_title: "Founder", role_is_current: true }],
      }),
    ]);
    expect(c.slug).toBe("tanksudda");
    expect(c.ids).toEqual(["abc"]);
    expect(c.roles[0].period).toBe("Present");
    expect(companyPeriod(c)).toBe("Present");
  });

  it("spans the oldest start to the newest end across roles", () => {
    const [c] = normalizeExperience([
      doc({
        company_name: "Acme",
        roles: [
          { role_title: "Lead", role_start_month: "March", role_start_year: 2023, role_is_current: true },
          {
            role_title: "Engineer",
            role_start_month: "January",
            role_start_year: 2021,
            role_end_month: "February",
            role_end_year: 2023,
            role_is_current: false,
          },
        ],
      }),
    ]);
    expect(companyPeriod(c)).toBe("Jan 2021 – Present");
  });
});

describe("companyProjects", () => {
  it("matches CMS links and the client name", () => {
    const [c] = normalizeExperience([
      doc({ id: "e1", company_name: "Polish Station", roles: [{ role_title: "x", role_is_current: false }] }),
    ]);
    const projects = [
      { slug: "a", linked_experience_ids: ["e1"] },
      { slug: "b", client: "polish station " },
      { slug: "c", client: "Other" },
    ] as Project[];
    expect(companyProjects(c, projects).map((p) => p.slug)).toEqual(["a", "b"]);
  });
});

describe("companySlug", () => {
  it("never returns an empty segment", () => {
    expect(companySlug("Saad & Co.")).toBe("saad-and-co");
    expect(companySlug("")).toBe("company");
  });
});
