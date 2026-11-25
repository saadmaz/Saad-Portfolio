/**
 * Publications helpers shared by PublicationsPage.tsx and the prerender:
 * type labels, citations (APA / BibTeX) and ScholarlyArticle JSON-LD.
 */

export const PUB_TYPES = {
  paper: { label: "Paper", color: "#ff5f00" },
  article: { label: "Article", color: "#2fbf71" },
  talk: { label: "Talk", color: "#f5a524" },
  book: { label: "Book", color: "#7c8db5" },
  patent: { label: "Patent", color: "#e5488a" },
};

/** Stored type, or "article" when unset/unknown. */
export const pubType = (p) => (p?.type && PUB_TYPES[p.type] ? p.type : "article");

const yearOf = (date) => String(date ?? "").match(/\d{4}/)?.[0] ?? "n.d.";
const SELF = "Saad Mazhar";
const authorsOf = (p) => (p.authors?.length ? p.authors : [SELF]);

/** "Saad Mazhar" → "Mazhar, S." */
function apaName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name.trim();
  const last = parts.pop();
  return `${last}, ${parts.map((n) => `${n[0].toUpperCase()}.`).join(" ")}`;
}

function apaAuthors(list) {
  const names = list.map(apaName);
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
}

const doiUrl = (doi) =>
  doi ? `https://doi.org/${String(doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, "")}` : "";

export function citeApa(p) {
  const where = [p.publisher].filter(Boolean).join("");
  const link = doiUrl(p.doi) || p.link || "";
  return `${apaAuthors(authorsOf(p))} (${yearOf(p.date)}). ${p.title.replace(/\.$/, "")}.${where ? ` ${where}.` : ""}${link ? ` ${link}` : ""}`;
}

export function citeBibtex(p) {
  const type = pubType(p);
  const entry = type === "paper" ? "article" : type === "book" ? "book" : "misc";
  const first = authorsOf(p)[0]
    .split(/\s+/)
    .pop()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const key = `${first}${yearOf(p.date)}${p.title.toLowerCase().match(/[a-z]+/)?.[0] ?? ""}`;
  const esc = (s) => String(s).replace(/[{}]/g, "");
  const fields = [
    ["title", p.title],
    ["author", authorsOf(p).join(" and ")],
    [entry === "article" ? "journal" : "publisher", p.publisher],
    ["year", yearOf(p.date)],
    ["doi", p.doi && String(p.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, "")],
    ["url", p.link],
  ].filter(([, v]) => v);
  return `@${entry}{${key},\n${fields.map(([k, v]) => `  ${k} = {${esc(v)}}`).join(",\n")}\n}`;
}

/** schema.org entity for one publication; `personRef` links Saad's Person node. */
export function publicationSchema(p, personRef) {
  const type = pubType(p);
  return {
    "@type": type === "talk" ? "PresentationDigitalDocument" : type === "book" ? "Book" : "ScholarlyArticle",
    headline: p.title,
    name: p.title,
    ...(p.abstract || p.description ? { abstract: p.abstract || p.description } : {}),
    datePublished: p.date,
    author: authorsOf(p).map((n) => (n === SELF && personRef ? personRef : { "@type": "Person", name: n })),
    ...(p.publisher ? { publisher: { "@type": "Organization", name: p.publisher } } : {}),
    ...(p.link || p.doi ? { url: doiUrl(p.doi) || p.link } : {}),
    ...(p.doi ? { sameAs: doiUrl(p.doi) } : {}),
    ...(p.tags?.length ? { keywords: p.tags.join(", ") } : {}),
  };
}
