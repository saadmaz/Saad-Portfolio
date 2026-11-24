import { describe, expect, it } from "vitest";
import type { Project } from "@/types";
import {
  projectCanonical,
  projectDuration,
  projectGallery,
  projectSchema,
  projectSeoDescription,
  projectSeoTitle,
  projectTimeline,
  projectVideos,
  relatedProjects,
} from "./project-seo.js";

const base = (over: Partial<Project> = {}): Project =>
  ({
    id: "1",
    slug: "tanksudda",
    title: "TankSudda",
    tagline: "Fuel delivery on demand.",
    overview: "",
    heroImage: "",
    techStack: [],
    status: "Completed",
    ...over,
  }) as Project;
const BASE = "https://www.saadmaz.com";

describe("SEO title, description and canonical", () => {
  it("uses CMS overrides when set", () => {
    const p = base({ seo_title: "TankSudda: fuel delivery app", seo_description: "Custom description." });
    expect(projectSeoTitle(p)).toBe("TankSudda: fuel delivery app");
    expect(projectSeoDescription(p)).toBe("Custom description.");
  });

  it("falls back to title and a description built from the tagline and stack", () => {
    const p = base({ techStack: ["React", "Firebase", "Node.js", "Go"], industry: "Logistics" });
    expect(projectSeoTitle(p)).toBe("TankSudda | Project");
    expect(projectSeoDescription(p)).toBe(
      "Fuel delivery on demand. Built with React, Firebase, Node.js. Logistics. Case study by Saad Mazhar.",
    );
  });

  it("ends the tagline with a full stop before adding more", () => {
    expect(projectSeoDescription(base({ tagline: "Car wash booking" }))).toBe(
      "Car wash booking. Case study by Saad Mazhar.",
    );
  });

  it("keeps descriptions within 160 characters", () => {
    expect(projectSeoDescription(base({ seo_description: "word ".repeat(80) })).length).toBeLessThanOrEqual(
      160,
    );
  });

  it("is its own canonical unless an external original is set", () => {
    expect(projectCanonical(base(), BASE)).toBe(`${BASE}/projects/tanksudda`);
    expect(projectCanonical(base({ canonical_url: "https://medium.com/x" }), BASE)).toBe(
      "https://medium.com/x",
    );
  });
});

describe("timeline", () => {
  it("formats ranges, ongoing work and single dates", () => {
    expect(projectTimeline(base({ start_date: "2024-03", end_date: "2025-01" }))).toBe("Mar 2024 – Jan 2025");
    expect(projectTimeline(base({ start_date: "2024-03", is_ongoing: true }))).toBe("Mar 2024 – Present");
    expect(projectTimeline(base({ date: "2023-06-01" }))).toBe("Jun 2023");
    expect(projectTimeline(base())).toBe("");
  });

  it("works out the duration in years and months", () => {
    expect(projectDuration(base({ start_date: "2024-01", end_date: "2025-03" }))).toBe("1 yr 3 mos");
    expect(projectDuration(base({ start_date: "2025-01", is_ongoing: true }), new Date(2025, 1, 10))).toBe(
      "2 mos",
    );
    expect(projectDuration(base({ duration: "6 weeks" }))).toBe("6 weeks");
  });
});

describe("media", () => {
  it("prefers the captioned gallery, else legacy screenshots without the hero", () => {
    expect(projectGallery(base({ gallery: [{ url: "a.png", alt: "", caption: "Home" }] }))).toEqual([
      { url: "a.png", alt: "TankSudda screenshot 1", caption: "Home" },
    ]);
    expect(projectGallery(base({ heroImage: "h.png", screenshots: ["h.png", "b.png"] }))).toEqual([
      { url: "b.png", alt: "TankSudda screenshot 1", caption: "" },
    ]);
  });

  it("reads multiple videos, else the legacy single video", () => {
    expect(projectVideos(base({ videos: [{ url: "https://y/1", title: "Demo" }, { url: " " }] }))).toEqual([
      { url: "https://y/1", title: "Demo" },
    ]);
    expect(projectVideos(base({ video: "https://y/2" }))).toEqual([{ url: "https://y/2", title: "" }]);
  });
});

describe("structured data", () => {
  it("is a CreativeWork with dates, credits, citations and related work, and no empty fields", () => {
    const related = [base({ id: "2", slug: "stopwash", title: "Stopwash" })];
    const s = projectSchema(
      base({
        start_date: "2024-03",
        updated_at: "2025-02-01T00:00:00Z",
        client: "ICTA",
        collaborators: [{ name: "Ayesha", role: "Designer" }],
        resources: [{ label: "Docs", url: "https://docs.x" }],
        liveUrl: "https://tanksudda.lk",
      }),
      { baseUrl: BASE, author: { "@type": "Person", name: "Saad Mazhar" }, related },
    );
    expect(s["@type"]).toBe("CreativeWork");
    expect(s.dateCreated).toBe("2024-03");
    expect(s.dateModified).toBe("2025-02-01T00:00:00.000Z");
    expect(s.sourceOrganization).toEqual({ "@type": "Organization", name: "ICTA" });
    expect(s.contributor).toEqual([{ "@type": "Person", name: "Ayesha" }]);
    expect(s.citation).toEqual(["https://docs.x"]);
    expect(s.sameAs).toEqual(["https://tanksudda.lk"]);
    expect(s.isRelatedTo).toEqual([
      { "@type": "CreativeWork", name: "Stopwash", url: `${BASE}/projects/stopwash` },
    ]);
    expect(Object.values(s).some((v) => v === undefined)).toBe(false);
    expect("image" in s).toBe(false);
  });

  it("links related projects in CMS order, skipping unpublished, missing and self", () => {
    const all = [
      base({ id: "1" }),
      base({ id: "2", slug: "b", title: "B" }),
      base({ id: "3", slug: "c", title: "C", published: false }),
    ];
    const p = base({ related_project_ids: ["2", "3", "9", "1"] });
    expect(relatedProjects(p, all).map((x) => x.slug)).toEqual(["b"]);
  });
});
