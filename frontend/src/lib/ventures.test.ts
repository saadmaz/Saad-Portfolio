import { describe, expect, it } from "vitest";
import type { Project } from "@/types";
import { experienceFaq, venturesFrom } from "./ventures";

const companies = [
  {
    name: "Stopwash (PVT) Ltd.",
    role: "Co-Founder",
    period: "2024 – Present",
    summary: "A self-service car wash in Colombo. More text.",
    path: "/experience/stopwash",
    ids: ["e1"],
    current: true,
  },
  {
    name: "Spectrify AI",
    role: "Business Development Associate",
    period: "2025 – Present",
    path: "/experience/spectrify-ai",
    ids: ["e2"],
    current: true,
  },
];
const projects = [
  {
    slug: "stopwash-os",
    title: "STOPWASH OS",
    client: "STOPWASH PVT LTD",
    role: "Co-founder & sole engineer",
  },
  {
    slug: "agentivex",
    title: "AgentiveX",
    client: "AgentiveX",
    role: "Founder",
    tagline: "A digital workforce.",
    liveUrl: "https://a.x",
    date: "2026-10",
  },
  {
    slug: "brix",
    title: "Brix",
    client: "AgentiveX",
    role: "Founder & developer",
    category: "AI",
    date: "2026-05",
  },
  { slug: "blends", title: "Blends", client: "Blends", role: "Web developer", category: "Websites" },
] as unknown as Project[];

describe("venturesFrom", () => {
  const v = venturesFrom(companies, projects);
  it("takes founder roles from experience and attaches what was built there", () => {
    expect(v[0]).toMatchObject({
      name: "Stopwash (PVT) Ltd.",
      path: "/experience/stopwash",
      summary: "A self-service car wash in Colombo.",
    });
    expect(v[0].projects.map((p) => p.slug)).toEqual(["stopwash-os"]);
  });
  it("adds founder-role clients with no experience entry, led by the eponymous project", () => {
    expect(v[1]).toMatchObject({
      role: "Founder",
      name: "AgentiveX",
      path: "/projects/agentivex",
      url: "https://a.x",
      period: "2026",
    });
    expect(v[1].projects).toHaveLength(2);
  });
  it("leaves out employers and client work", () => {
    expect(v.map((x) => x.name)).toEqual(["Stopwash (PVT) Ltd.", "AgentiveX"]);
  });
});

describe("experienceFaq", () => {
  it("answers founded, current and other roles", () => {
    const faq = experienceFaq(venturesFrom(companies, projects), companies);
    expect(faq[0].answer).toMatch(/^Stopwash \(PVT\) Ltd\. \(co-founder\) and AgentiveX \(founder\)\./);
    expect(faq[1].answer).toBe(
      "Co-Founder at Stopwash (PVT) Ltd. and Business Development Associate at Spectrify AI.",
    );
    expect(faq[2].answer).toBe("Business Development Associate at Spectrify AI.");
  });
});
