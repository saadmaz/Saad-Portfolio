/**
 * Project groups for the projects page: ventures Saad founded, client work,
 * side projects and experiments, and university/open-source/community work.
 *
 * A project's `group` field (set in the CMS) wins; otherwise it's inferred
 * from the role and category so existing projects sort themselves.
 * Shared by ProjectsPage.tsx and scripts/prerender.mjs.
 */

export const PROJECT_GROUPS = [
  {
    id: "venture",
    label: "Ventures I founded",
    title: "Companies I",
    soft: "built",
    intro: "Businesses I started or co-founded, and the systems that run them.",
    noun: ["venture", "ventures"],
  },
  {
    id: "client",
    label: "Client work",
    title: "Built for",
    soft: "clients",
    intro: "Websites and products shipped for clients, most of them live today.",
    noun: ["client project", "client projects"],
  },
  {
    id: "lab",
    label: "Side projects & experiments",
    title: "Side projects &",
    soft: "experiments",
    intro: "AI experiments, hackathon builds and products I made to learn something.",
    noun: ["side project or experiment", "side projects and experiments"],
  },
  {
    id: "academic",
    label: "University, open source & community",
    title: "University &",
    soft: "open source",
    intro: "Coursework, open-source contributions and volunteer builds.",
    noun: ["university, open-source or community project", "university, open-source and community projects"],
  },
];

const GROUP_IDS = new Set(PROJECT_GROUPS.map((g) => g.id));
const ACADEMIC = /^(university|open source|community)$/i;
const LAB = /^(ai|prototypes?)$/i;

/** The group a project belongs to. */
export function projectGroupOf(p) {
  if (p.group && GROUP_IDS.has(p.group)) return p.group;
  const category = String(p.category || p.type || "").trim();
  if (/founder/i.test(p.role || "")) return "venture";
  if (ACADEMIC.test(category)) return "academic";
  if (LAB.test(category) || !String(p.client || "").trim()) return "lab";
  return "client";
}

/** Status buckets for the filter, from the project's stage. */
export const PROJECT_STATUSES = [
  { id: "live", label: "Live" },
  { id: "building", label: "In development" },
  { id: "other", label: "Prototype or archived" },
];

export function projectStatusOf(p) {
  const s = String(p.stage || "").toLowerCase();
  if (s === "production" || s === "maintained") return "live";
  if (s === "beta" || s === "development") return "building";
  return "other";
}

/** Earliest year in the projects' dates (for "years building"), or null. */
export function firstProjectYear(projects) {
  const years = projects
    .map((p) => Number(String(p.start_date || p.date || "").slice(0, 4)))
    .filter((y) => y > 1990 && y < 2100);
  return years.length ? Math.min(...years) : null;
}

const listNames = (names, max = 6) =>
  names.length <= max
    ? names.join(", ").replace(/, ([^,]*)$/, " and $1")
    : `${names.slice(0, max).join(", ")} and ${names.length - max} more`;

/**
 * Plain answers about the projects, generated from the CMS so they never go
 * stale. Shown on the page and marked up as FAQPage (same text in both).
 */
export function projectsFaq(projects) {
  if (!projects.length) return [];
  const byGroup = (id) => projects.filter((p) => projectGroupOf(p) === id);
  const ventures = byGroup("venture");
  const live = projects.filter((p) => projectStatusOf(p) === "live");
  const counts = PROJECT_GROUPS.map((g) => [g, byGroup(g.id).length])
    .filter(([, n]) => n > 0)
    .map(([g, n]) => `${n} ${g.noun[n === 1 ? 0 : 1]}`);
  const faq = [
    {
      question: "What has Saad Mazhar built?",
      answer: `${projects.length} ${projects.length === 1 ? "project" : "projects"} so far: ${counts.join("; ")}.${
        ventures.length ? ` His own ventures include ${listNames(ventures.map((p) => p.title))}.` : ""
      }`,
    },
  ];
  if (live.length)
    faq.push({
      question: "Which of Saad Mazhar's projects are live?",
      answer: `${live.length} ${live.length === 1 ? "is" : "are"} live in production, including ${listNames(live.map((p) => p.title))}.`,
    });
  const stack = new Map();
  for (const p of projects)
    for (const t of p.techStack?.length ? p.techStack : (p.technologies ?? []))
      stack.set(t, (stack.get(t) ?? 0) + 1);
  const top = [...stack.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([t]) => t);
  if (top.length)
    faq.push({
      question: "What technologies does Saad Mazhar build with?",
      answer: `Most often ${listNames(top)}, chosen per project. Each case study lists the full stack.`,
    });
  return faq;
}
