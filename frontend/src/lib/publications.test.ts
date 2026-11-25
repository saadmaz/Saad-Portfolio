import { describe, expect, it } from "vitest";
import { citeApa, citeBibtex, publicationSchema, pubType } from "./publications.js";
import type { Publication } from "@/types";

const pub = (p: Partial<Publication> = {}): Publication => ({
  id: "1",
  title: "Agents in production.",
  publisher: "IEEE Access",
  date: "2025-03-01",
  authors: ["Saad Mazhar", "Jane Doe"],
  ...p,
});

describe("pubType", () => {
  it("falls back to article", () => {
    expect(pubType(pub({ type: "paper" }))).toBe("paper");
    expect(pubType(pub({ type: "weird" }))).toBe("article");
    expect(pubType(undefined)).toBe("article");
  });
});

describe("citeApa", () => {
  it("formats authors, year, title, venue and DOI", () => {
    expect(citeApa(pub({ doi: "https://doi.org/10.1/abc" }))).toBe(
      "Mazhar, S., & Doe, J. (2025). Agents in production. IEEE Access. https://doi.org/10.1/abc",
    );
  });
  it("defaults the author to Saad and handles missing dates", () => {
    expect(citeApa(pub({ authors: [], date: "", publisher: "" }))).toBe(
      "Mazhar, S. (n.d.). Agents in production.",
    );
  });
});

describe("citeBibtex", () => {
  it("builds a keyed entry for papers", () => {
    const b = citeBibtex(pub({ type: "paper", doi: "10.1/abc" }));
    expect(b.startsWith("@article{mazhar2025agents,")).toBe(true);
    expect(b).toContain("author = {Saad Mazhar and Jane Doe}");
    expect(b).toContain("journal = {IEEE Access}");
    expect(b).toContain("doi = {10.1/abc}");
  });
});

describe("publicationSchema", () => {
  it("links Saad to the person node and others by name", () => {
    const ref = { "@id": "me" };
    const s = publicationSchema(pub({ type: "talk" }), ref);
    expect(s["@type"]).toBe("PresentationDigitalDocument");
    expect(s.author).toEqual([ref, { "@type": "Person", name: "Jane Doe" }]);
  });
});
