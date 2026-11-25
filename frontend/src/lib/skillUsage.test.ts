import { describe, expect, it } from "vitest";
import type { Certificate, Project } from "@/types";
import type { Company } from "./experience";
import { skillKey, skillUsage } from "./skillUsage";

describe("skillKey", () => {
  it("treats common spellings as one skill", () => {
    expect(skillKey("React.js")).toBe(skillKey("React"));
    expect(skillKey("ReactJS")).toBe(skillKey("react"));
    expect(skillKey("Node.js")).toBe(skillKey("NodeJS"));
    expect(skillKey("C#")).not.toBe(skillKey("C"));
  });
});

describe("skillUsage", () => {
  it("collects projects, companies and certificates per skill without duplicates", () => {
    const projects = [{ slug: "a", techStack: ["React", "React.js"] }] as Project[];
    const companies = [
      { slug: "acme", skills: ["react"], roles: [{ skills: ["Python"] }] },
    ] as unknown as Company[];
    const certs = [{ id: "c1", skills: ["Python"] }] as Certificate[];
    const usage = skillUsage(projects, companies, certs);
    expect(usage.get(skillKey("React"))?.projects).toHaveLength(1);
    expect(usage.get(skillKey("React"))?.companies).toHaveLength(1);
    expect(usage.get(skillKey("Python"))?.certificates).toHaveLength(1);
    expect(usage.get(skillKey("Rust"))).toBeUndefined();
  });
});
