import type { Certificate, Project } from "@/types";
import type { Company } from "@/lib/experience";

/** "React.js", "ReactJS" and "react" all become "react"; "Node.js" becomes "node". */
export const skillKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "")
    .replace(/js$/, "") || name.toLowerCase();

export interface SkillUsage {
  projects: Project[];
  companies: Company[];
  certificates: Certificate[];
}

/** Where each skill shows up across projects, experience and certificates, keyed by skillKey. */
export function skillUsage(
  projects: Project[],
  companies: Company[],
  certificates: Certificate[],
): Map<string, SkillUsage> {
  const map = new Map<string, SkillUsage>();
  const add = <K extends keyof SkillUsage>(names: string[], kind: K, item: SkillUsage[K][number]) => {
    for (const k of new Set(names.filter(Boolean).map(skillKey))) {
      if (!map.has(k)) map.set(k, { projects: [], companies: [], certificates: [] });
      (map.get(k)![kind] as SkillUsage[K][number][]).push(item);
    }
  };
  for (const p of projects)
    add([...(p.techStack ?? []), ...(p.technologies ?? []), ...(p.skills ?? [])], "projects", p);
  for (const c of companies) add([...c.skills, ...c.roles.flatMap((r) => r.skills)], "companies", c);
  for (const c of certificates) add(c.skills ?? [], "certificates", c);
  return map;
}
