/**
 * Ventures for the experience page: companies Saad founded or co-founded.
 * They come from two places in the CMS: experience entries with a founder
 * role, and founder-role projects for a client that has no experience entry
 * (e.g. AgentiveX, STTPS). Each venture carries the systems built for it.
 * Shared by ExperiencePage.tsx and scripts/prerender.mjs.
 */

import { sameOrg } from "./orgName.js";
import { projectGroupOf } from "./projectGroups.js";

const isFounderRole = (role) => /founder/i.test(String(role ?? ""));
const firstSentence = (text) => {
  const t = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  const m = t.match(/^(.{20,220}?[.!?])(\s|$)/);
  return m ? m[1] : t.slice(0, 200);
};

/**
 * @param companies  [{ name, role, period, summary, url, logo, path, ids }]
 *                   (path: the company page; ids: experience doc ids)
 * @param projects   published projects
 */
export function venturesFrom(companies, projects) {
  const builtFor = (name, ids = []) =>
    projects.filter(
      (p) => p.linked_experience_ids?.some((id) => ids.includes(String(id))) || sameOrg(p.client, name),
    );

  const fromExperience = companies
    .filter((c) => isFounderRole(c.role))
    .map((c) => ({
      name: c.name,
      role: c.role,
      period: c.period,
      summary: firstSentence(c.summary),
      url: c.url,
      logo: c.logo,
      path: c.path,
      projects: builtFor(c.name, c.ids),
    }));

  // Founder-role projects for a client with no experience entry: one venture per client.
  const clients = new Map();
  for (const p of projects) {
    const client = String(p.client ?? "").trim();
    if (!client || projectGroupOf(p) !== "venture" || !isFounderRole(p.role)) continue;
    if (companies.some((c) => sameOrg(c.name, client))) continue;
    const key = [...clients.keys()].find((k) => sameOrg(k, client)) ?? client;
    clients.set(key, [...(clients.get(key) ?? []), p]);
  }
  const fromProjects = [...clients.entries()].map(([client, list]) => {
    // The project named after the company (AgentiveX, LeoAgent website…) leads.
    const lead =
      list.find((p) => sameOrg(p.title, client)) ??
      list.find((p) => sameOrg(String(p.title).replace(/\s+(website|site|os|erp)$/i, ""), client)) ??
      list[0];
    const years = list
      .map((p) => String(p.start_date || p.date || "").slice(0, 4))
      .filter((y) => /^\d{4}$/.test(y))
      .sort();
    return {
      name: client,
      // The company-level title, not the project wording ("Founder & lead engineer" → "Founder").
      role: list.some((p) => /co-?founder/i.test(p.role)) ? "Co-founder" : "Founder",
      period: years.length
        ? years[0] === years[years.length - 1]
          ? years[0]
          : `${years[0]} – ${years[years.length - 1]}`
        : "",
      summary: firstSentence(lead.tagline || lead.description),
      url: lead.liveUrl || lead.live_preview || "",
      logo: "",
      path: `/projects/${lead.slug}`,
      projects: list,
    };
  });

  return [...fromExperience, ...fromProjects];
}

/** Plain answers about Saad's companies and roles, shown on the page and marked up as FAQPage. */
export function experienceFaq(ventures, companies) {
  const faq = [];
  const list = (names) =>
    names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  if (ventures.length)
    faq.push({
      question: "What companies has Saad Mazhar founded?",
      answer: `${list(ventures.map((v) => `${v.name} (${String(v.role).toLowerCase().includes("co-founder") ? "co-founder" : "founder"})`))}. The systems he built for them are documented as case studies on this site.`,
    });
  const current = companies.filter((c) => c.current).map((c) => `${c.role} at ${c.name}`);
  if (current.length) faq.push({ question: "Where does Saad Mazhar work now?", answer: `${list(current)}.` });
  const roles = companies.filter((c) => !isFounderRole(c.role)).map((c) => `${c.role} at ${c.name}`);
  if (roles.length)
    faq.push({
      question: "What roles has Saad Mazhar held outside his own companies?",
      answer: `${list(roles)}.`,
    });
  return faq;
}
