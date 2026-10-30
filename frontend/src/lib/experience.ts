import type { Experience } from "@/types";
import { monthIndex, partsToLabel, range } from "@/lib/format";

export interface Role {
  title: string;
  period: string;
  isCurrent: boolean;
  start: number;
  description?: string;
  skills: string[];
}

export interface Company {
  key: string;
  name: string;
  logo?: string;
  url?: string;
  meta: string;
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
    const company =
      byKey.get(key) ??
      ({
        key,
        name,
        logo: d.company_logo ?? d.companyLogo,
        url: d.companyUrl,
        meta: [d.employment_type ?? d.employmentType, d.location, d.location_type ?? d.workMode]
          .filter(Boolean)
          .join(" · "),
        featured: d.is_featured ?? false,
        order: d.display_order ?? d.order_index,
        roles: [],
        skills: d.skills ?? d.technologies ?? [],
      } satisfies Company);
    byKey.set(key, company);

    if (d.roles?.length) {
      for (const r of d.roles) {
        company.roles.push({
          title: r.role_title,
          period: range(
            partsToLabel(r.role_start_month, r.role_start_year),
            partsToLabel(r.role_end_month, r.role_end_year),
            r.role_is_current,
          ),
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
      company.roles.push({
        title: d.position ?? "",
        period: range(d.startDate ?? "", d.endDate === "Present" ? null : d.endDate, current),
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
  const first = c.roles[c.roles.length - 1]?.period.split(" – ")[0] ?? "";
  const last = c.roles[0]?.period.split(" – ")[1];
  return range(first, last, current);
}
