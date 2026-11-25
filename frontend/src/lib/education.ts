import type { Education, Skill, SkillSet } from "@/types";
import { skillKey } from "@/lib/skillUsage";

export interface EduSkill {
  name: string;
  icon?: string;
  /** How many schools list it. */
  count: number;
}

/**
 * Skills listed across every school, de-duplicated ("React.js" = "React"),
 * most shared first, with the logo from the skills CMS when one exists.
 */
export function educationSkills(education: Education[], skillSets: SkillSet[] = []): EduSkill[] {
  const known = new Map<string, Skill>();
  for (const set of skillSets) for (const s of set.skills) known.set(skillKey(s.name), s);

  const merged = new Map<string, EduSkill>();
  for (const e of education) {
    for (const k of new Set((e.skills ?? []).map((n) => n.trim()).filter(Boolean))) {
      const key = skillKey(k);
      const hit = merged.get(key);
      if (hit) hit.count++;
      else merged.set(key, { name: known.get(key)?.name ?? k, icon: known.get(key)?.icon, count: 1 });
    }
  }
  return [...merged.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Calendar years spanned by all schooling, counting a current school up to `now`. */
export function studyYears(education: Education[], now = new Date().getFullYear()): number {
  const starts = education.map((e) => e.start_year).filter((y): y is number => !!y);
  if (!starts.length) return 0;
  const ends = education.map((e) =>
    (e.is_current ?? e.isCurrent) ? now : (e.end_year ?? e.start_year ?? now),
  );
  return Math.max(1, Math.max(...ends) - Math.min(...starts));
}
