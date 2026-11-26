import { describe, expect, it } from "vitest";
import { projectAppSchema } from "./project-seo";
import type { Project } from "@/types";

const base = {
  slug: "pos",
  title: "POS",
  tagline: "A POS",
  techStack: [],
  heroImage: "",
  overview: "",
} as unknown as Project;
const opts = { baseUrl: "https://x.com", author: { "@id": "https://x.com/#person" } };

describe("projectAppSchema", () => {
  it("describes live products as web applications", () => {
    const s = projectAppSchema(
      { ...base, liveUrl: "https://pos.app", stage: "Production", category: "Operations Systems" },
      opts,
    );
    expect(s).toMatchObject({ "@type": "WebApplication", url: "https://pos.app", operatingSystem: "Web" });
    expect(s?.subjectOf).toEqual({ "@id": "https://x.com/projects/pos#project" });
  });
  it("skips websites, prototypes and products without a live URL", () => {
    expect(
      projectAppSchema(
        { ...base, liveUrl: "https://a.com", stage: "Production", category: "Websites" },
        opts,
      ),
    ).toBeNull();
    expect(
      projectAppSchema({ ...base, liveUrl: "https://a.com", stage: "Prototype", category: "AI" }, opts),
    ).toBeNull();
    expect(projectAppSchema({ ...base, stage: "Production", category: "AI" }, opts)).toBeNull();
  });
});
