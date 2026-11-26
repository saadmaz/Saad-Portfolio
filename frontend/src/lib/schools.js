/**
 * School pages (/education/:slug): one per education entry, gathering what
 * the CMS holds about that school elsewhere (awards, volunteering, events,
 * projects built for its community). Shared by SchoolPage.tsx and
 * scripts/prerender.mjs so both show the same content.
 */

import { slugify } from "./article-core.js";

/** Short name used to find mentions: "Isipathana College, Colombo 05" → "Isipathana College". */
export const schoolNameOf = (e) =>
  String(e?.institution || e?.school_name || "")
    .split(",")[0]
    .trim();

/** URL slug for a school page. */
export const schoolSlugOf = (e) => slugify(schoolNameOf(e));

/** The distinctive word(s) of a school's name, for matching: "Isipathana College" → "isipathana". */
function keyOf(name) {
  const generic =
    /^(college|school|university|institute|of|the|and|for|technology|international|national|academy|vidyalaya|campus)$/i;
  const words = name.split(/\s+/).filter((w) => w.length > 2 && !generic.test(w));
  return (words[0] ?? name).toLowerCase();
}

const textOf = (...parts) => parts.flat().filter(Boolean).join(" ").toLowerCase();

/** Newline- or comma-separated "Role, Club (years)" text → list. */
export const rolesOf = (e) =>
  String(e?.activities_and_societies ?? "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Everything linked to a school. Matching is on the school's distinctive name
 * word, so "Isipathana" finds the Interact Club of Isipathana College, the
 * OBA's booking system and the debates the school won.
 */
export function schoolContent(edu, { awards = [], volunteer = [], events = [], projects = [] }) {
  const key = keyOf(schoolNameOf(edu));
  const has = (...parts) => !!key && textOf(...parts).includes(key);
  return {
    honours: (edu.honors_and_awards ?? []).filter((h) => h?.award_title),
    awards: awards.filter((a) => has(a.title, a.issuer, a.description)),
    volunteer: volunteer.filter((v) => has(v.organization, v.role, v.description)),
    events: events.filter((e) => has(e.title, e.description, e.location, e.organizer)),
    projects: projects.filter((p) => has(p.client, p.title, p.tagline, p.target_audience)),
  };
}

/** Worth indexing: a real description plus linked material, not a bare name and dates. */
export function isSchoolPageIndexable(edu, content) {
  const words = textOf(edu.description, edu.activities_and_societies).split(/\s+/).filter(Boolean).length;
  const linked =
    content.honours.length +
    content.awards.length +
    content.volunteer.length +
    content.events.length +
    content.projects.length;
  return words >= 40 && linked >= 2;
}
