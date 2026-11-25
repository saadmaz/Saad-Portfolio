import type { Experience, ExperienceMedia, Project } from "@/types";
import { monthIndex, partsToLabel, range } from "@/lib/format";
import { slugify } from "@/lib/article-core";

export interface Role {
  title: string;
  period: string;
  /** "Jan 2024" / "2024" / "" - kept apart so company spans don't re-parse `period`. */
  startLabel: string;
  endLabel: string;
  isCurrent: boolean;
  start: number;
  description?: string;
  skills: string[];
}

export interface Company {
  key: string;
  /** URL segment for /experience/:slug, derived from the company name. */
  slug: string;
  /** Firestore ids behind this company (legacy one-role docs merge by name). */
  ids: string[];
  name: string;
  logo?: string;
  illustration?: string;
  url?: string;
  meta: string;
  employmentType?: string;
  location?: string;
  locationType?: string;
  description?: string;
  achievements?: string;
  metrics: { value: string; label: string }[];
  highlights: { title: string; description: string }[];
  testimonial?: { quote: string; name: string; role?: string };
  media: ExperienceMedia[];
  featured: boolean;
  order?: number;
  roles: Role[];
  skills: string[];
}

function legacyStart(value?: string): number {
  if (!value) return 0;
  const parts = value.trim().split(/\s+/);
  const y = parseInt(parts[parts.length - 1], 10);
  return Number.isNaN(y) ? 0 : new Date(y, monthIndex(parts[0]), 1).getTime();
}

/** Company URL slug; same rule the prerender uses. */
export const companySlug = (name: string) => slugify(name) || "company";

/**
 * Firestore holds two experience shapes: new documents with roles[] and
 * legacy one-position documents. Both become a list of companies, each with
 * its roles newest first, ordered featured → display order → most recent.
 */
export function normalizeExperience(docs: Experience[]): Company[] {
  const byKey = new Map<string, Company>();

  for (const d of docs) {
    const name = d.company_name ?? d.company ?? "";
    const key = d.roles?.length ? String(d.id) : name;
    const employmentType = d.employment_type ?? d.employmentType;
    const locationType = d.location_type ?? d.workMode;
    const company =
      byKey.get(key) ??
      ({
        key,
        slug: companySlug(name),
        ids: [],
        name,
        logo: d.company_logo ?? d.companyLogo,
        illustration: d.journey_image || undefined,
        url: d.companyUrl,
        meta: [employmentType, d.location, locationType].filter(Boolean).join(" · "),
        employmentType,
        location: d.location,
        locationType,
        // Legacy docs use `description` for the single role, so only roles[] docs have a company one.
        description: d.roles?.length ? d.description : undefined,
        achievements: d.achievements ?? d.impact,
        metrics: (d.impact_metrics ?? []).filter((m) => m?.value && m?.label),
        highlights: (d.highlights ?? []).filter((h) => h?.title).slice(0, 3),
        testimonial: d.testimonial?.quote && d.testimonial.name ? d.testimonial : undefined,
        media: [],
        featured: d.is_featured ?? false,
        order: d.display_order ?? d.order_index,
        roles: [],
        skills: d.skills ?? d.technologies ?? [],
      } satisfies Company);
    byKey.set(key, company);
    company.ids.push(String(d.id));
    company.media.push(...(d.media ?? []).filter((m) => m?.media_url));

    if (d.roles?.length) {
      for (const r of d.roles) {
        const startLabel = partsToLabel(r.role_start_month, r.role_start_year);
        const endLabel = partsToLabel(r.role_end_month, r.role_end_year);
        company.media.push(...(r.media ?? []).filter((m) => m?.media_url));
        company.roles.push({
          title: r.role_title,
          period: range(startLabel, endLabel, r.role_is_current),
          startLabel,
          endLabel,
          isCurrent: r.role_is_current,
          start: r.role_start_year
            ? new Date(r.role_start_year, monthIndex(r.role_start_month), 1).getTime()
            : 0,
          description: r.description,
          skills: r.skills ?? [],
        });
      }
    } else {
      const current = d.is_current ?? d.isCurrent ?? false;
      const startLabel = d.startDate ?? "";
      const endLabel = d.endDate === "Present" ? "" : (d.endDate ?? "");
      company.roles.push({
        title: d.position ?? "",
        period: range(startLabel, endLabel, current),
        startLabel,
        endLabel,
        isCurrent: current,
        start: legacyStart(d.startDate),
        description: d.description,
        skills: d.skills ?? d.technologies ?? [],
      });
    }
  }

  const companies = [...byKey.values()];
  for (const c of companies) c.roles.sort((a, b) => b.start - a.start);
  return companies.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    return (b.roles[0]?.start ?? 0) - (a.roles[0]?.start ?? 0);
  });
}

/** The earliest-to-latest span across all of a company's roles. */
export function companyPeriod(c: Company): string {
  const current = c.roles.some((r) => r.isCurrent);
  const first = [...c.roles].reverse().find((r) => r.startLabel)?.startLabel ?? "";
  const last = c.roles.find((r) => r.endLabel)?.endLabel;
  return range(first, last, current);
}

/** Projects tied to a company: linked in the CMS, or naming it as the client. */
export function companyProjects(c: Company, projects: Project[]): Project[] {
  const ids = new Set(c.ids);
  const name = c.name.trim().toLowerCase();
  return projects.filter(
    (p) =>
      p.linked_experience_ids?.some((id) => ids.has(String(id))) ||
      (!!name && p.client?.trim().toLowerCase() === name),
  );
}
