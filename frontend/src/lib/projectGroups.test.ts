import { describe, expect, it } from "vitest";
import { firstProjectYear, projectGroupOf, projectStatusOf, projectsFaq } from "./projectGroups";

describe("projectGroupOf", () => {
  it("uses the CMS group when set", () => {
    expect(projectGroupOf({ group: "client", role: "Founder" })).toBe("client");
  });
  it("puts founder roles under ventures", () => {
    expect(projectGroupOf({ role: "Co-founder & engineer", category: "Websites", client: "X" })).toBe(
      "venture",
    );
  });
  it("puts university, open source and community together", () => {
    expect(projectGroupOf({ role: "Student", category: "University", client: "IIT" })).toBe("academic");
    expect(projectGroupOf({ role: "Contributor", category: "Open Source" })).toBe("academic");
  });
  it("treats AI, prototypes and client-less work as side projects", () => {
    expect(projectGroupOf({ role: "Lead engineer", category: "AI", client: "Acme" })).toBe("lab");
    expect(projectGroupOf({ role: "Developer", category: "SaaS & Platforms" })).toBe("lab");
  });
  it("defaults to client work", () => {
    expect(projectGroupOf({ role: "Web developer", category: "Websites", client: "Blends" })).toBe("client");
  });
  it("ignores unknown group values", () => {
    expect(projectGroupOf({ group: "nope", role: "Developer", category: "Websites", client: "A" })).toBe(
      "client",
    );
  });
});

describe("projectStatusOf", () => {
  it("buckets stages", () => {
    expect(projectStatusOf({ stage: "Production" })).toBe("live");
    expect(projectStatusOf({ stage: "Maintained" })).toBe("live");
    expect(projectStatusOf({ stage: "Beta" })).toBe("building");
    expect(projectStatusOf({ stage: "Archived" })).toBe("other");
    expect(projectStatusOf({})).toBe("other");
  });
});

describe("firstProjectYear", () => {
  it("returns the earliest valid year", () => {
    expect(firstProjectYear([{ date: "2026-05" }, { start_date: "2023-01" }, { date: "" }])).toBe(2023);
    expect(firstProjectYear([{}])).toBeNull();
  });
});

describe("projectsFaq", () => {
  it("answers from the data", () => {
    const faq = projectsFaq([
      { title: "A", role: "Founder", stage: "Production", techStack: ["React"] },
      {
        title: "B",
        role: "Web developer",
        category: "Websites",
        client: "C",
        stage: "Beta",
        techStack: ["React", "Go"],
      },
    ]);
    expect(faq[0].answer).toBe("2 projects so far: 1 venture; 1 client project. His own ventures include A.");
    expect(faq[1].answer).toBe("1 is live in production, including A.");
    expect(faq[2].answer).toContain("React and Go");
    expect(projectsFaq([])).toEqual([]);
  });
});
