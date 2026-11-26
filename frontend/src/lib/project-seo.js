/**
 * project-seo.js
 * ─────────────────────────────────────────────────────────────
 * One source of truth for what a project page tells people and search
 * engines: title, description, canonical, share image, timeline, gallery and
 * JSON-LD. Used by the live page (ProjectDetailPage) and by
 * scripts/prerender.mjs, so crawlers and browsers always see the same thing.
 *
 * Plain JS so the prerender script can import it (types in project-seo.d.ts).
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const clean = (s) => String(s ?? "").trim();
const truncate = (s, n) => {
  const t = clean(s).replace(/\s+/g, " ");
  if (t.length <= n) return t;
  const cut = t.slice(0, n - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), n - 20)).replace(/[\s,.;:-]+$/, "")}…`;
};

/** "2025-03" / "2025-03-14" / "2025" → { y, m } (m is 0-based, or null). */
function parseYm(value) {
  const m = /^(\d{4})(?:-(\d{1,2}))?/.exec(clean(value));
  if (!m) return null;
  return { y: Number(m[1]), m: m[2] ? Math.min(Math.max(Number(m[2]) - 1, 0), 11) : null };
}
const ymLabel = (p) => (p.m === null ? String(p.y) : `${MONTHS[p.m]} ${p.y}`);

/** ISO date (YYYY-MM or YYYY) for schema.org, or undefined. */
function isoYm(value) {
  const p = parseYm(value);
  if (!p) return undefined;
  return p.m === null ? String(p.y) : `${p.y}-${String(p.m + 1).padStart(2, "0")}`;
}

/** Any Firestore-ish timestamp → Date, or null. */
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "object" && typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value === "object" && typeof value._seconds === "number") return new Date(value._seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** <title> text (the site appends " - Saad Mazhar"). */
export function projectSeoTitle(p) {
  return clean(p?.seo_title) || `${clean(p?.title)} | Project`;
}

/** Meta description: the CMS override, else built from tagline, stack and context. */
export function projectSeoDescription(p) {
  if (clean(p?.seo_description)) return truncate(p.seo_description, 160);
  const tech = (p?.technologies?.length ? p.technologies : p?.techStack) ?? [];
  const sentence = (t) => (t && !/[.!?…]$/.test(t) ? `${t}.` : t);
  const bits = [
    sentence(clean(p?.tagline)),
    tech.length ? `Built with ${tech.slice(0, 3).join(", ")}.` : "",
    sentence(clean(p?.industry)),
    "Case study by Saad Mazhar.",
  ].filter(Boolean);
  const text = bits.join(" ").replace(/\.\./g, ".");
  return truncate(text || clean(p?.overview) || `${clean(p?.title)}, a project by Saad Mazhar.`, 160);
}

/** Canonical URL: the CMS override (original published elsewhere) or the page itself. */
export function projectCanonical(p, baseUrl) {
  return clean(p?.canonical_url) || `${baseUrl}/projects/${p.slug}`;
}

/** "Mar 2024 – Present", "2023 – Jan 2024", "2025", or "" when no dates are set. */
export function projectTimeline(p) {
  const start = parseYm(p?.start_date) ?? parseYm(p?.date);
  const end = parseYm(p?.end_date);
  if (!start && !end) return "";
  const from = start ? ymLabel(start) : "";
  const to = p?.is_ongoing ? "Present" : end ? ymLabel(end) : "";
  if (!to || to === from) return from;
  return from ? `${from} – ${to}` : to;
}

/** "1 yr 3 mos" between start and end (or today when ongoing); "" when unknown. */
export function projectDuration(p, now = new Date()) {
  if (clean(p?.duration)) return clean(p.duration);
  const start = parseYm(p?.start_date);
  if (!start || start.m === null) return "";
  const end = p?.is_ongoing ? { y: now.getFullYear(), m: now.getMonth() } : parseYm(p?.end_date);
  if (!end || end.m === null) return "";
  const months = (end.y - start.y) * 12 + (end.m - start.m) + 1;
  if (months <= 0) return "";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo${m > 1 ? "s" : ""}`].filter(Boolean).join(" ");
}

/** Gallery items with alt text and captions; falls back to the legacy screenshots[] list. */
export function projectGallery(p) {
  const title = clean(p?.title);
  const hero = p?.heroImage || p?.image;
  if (p?.gallery?.length)
    return p.gallery
      .filter((g) => g?.url)
      .map((g, i) => ({
        url: g.url,
        alt: clean(g.alt) || `${title} screenshot ${i + 1}`,
        caption: clean(g.caption),
      }));
  return (p?.screenshots ?? p?.images ?? [])
    .filter((src) => src && src !== hero)
    .map((url, i) => ({ url, alt: `${title} screenshot ${i + 1}`, caption: "" }));
}

/** Video demos; the legacy single `video` field becomes the first entry. */
export function projectVideos(p) {
  const list = (p?.videos ?? []).filter((v) => clean(v?.url));
  if (list.length) return list.map((v) => ({ url: clean(v.url), title: clean(v.title) }));
  const legacy = clean(p?.video || p?.videoDemo);
  return legacy ? [{ url: legacy, title: "" }] : [];
}

/**
 * schema.org CreativeWork for a case study. (SoftwareApplication would ask
 * Google for ratings and prices a portfolio piece doesn't have.)
 */
export function projectSchema(p, { baseUrl, author, related = [] }) {
  const url = `${baseUrl}/projects/${p.slug}`;
  const tech = (p.technologies?.length ? p.technologies : p.techStack) ?? [];
  const images = [p.og_image, p.heroImage || p.image, ...projectGallery(p).map((g) => g.url)].filter(Boolean);
  const modified = toDate(p.updated_at);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    name: p.title,
    headline: clean(p.seo_title) || p.title,
    description: projectSeoDescription(p),
    url,
    mainEntityOfPage: url,
    image: [...new Set(images)],
    author,
    creator: author,
    keywords: [...new Set([...tech, ...(p.skills ?? [])])].join(", ") || undefined,
    genre: clean(p.type) || clean(p.category) || undefined,
    about: clean(p.industry) ? { "@type": "Thing", name: clean(p.industry) } : undefined,
    audience: clean(p.target_audience)
      ? { "@type": "Audience", audienceType: clean(p.target_audience) }
      : undefined,
    dateCreated: isoYm(p.start_date || p.date),
    datePublished: isoYm(p.start_date || p.date),
    dateModified: modified ? modified.toISOString() : undefined,
    creativeWorkStatus: clean(p.stage) || clean(p.status) || undefined,
    sameAs: [p.liveUrl || p.live_preview, p.githubUrl || p.github].filter(Boolean),
    sourceOrganization: clean(p.client) ? { "@type": "Organization", name: clean(p.client) } : undefined,
    contributor: (p.collaborators ?? [])
      .filter((c) => clean(c?.name))
      .map((c) => ({
        "@type": "Person",
        name: clean(c.name),
        ...(clean(c.url) ? { url: clean(c.url) } : {}),
      })),
    citation: (p.resources ?? []).filter((r) => clean(r?.url)).map((r) => clean(r.url)),
    isPartOf: { "@type": "CollectionPage", "@id": `${baseUrl}/projects`, name: "Projects" },
    isRelatedTo: undefined,
  };
  if (related.length)
    schema.isRelatedTo = related.map((r) => ({
      "@type": "CreativeWork",
      name: r.title,
      url: `${baseUrl}/projects/${r.slug}`,
    }));
  for (const k of Object.keys(schema)) {
    const v = schema[k];
    if (v === undefined || (Array.isArray(v) && v.length === 0)) delete schema[k];
  }
  return schema;
}

/** Projects linked from this one, in the order chosen in the CMS (unpublished/missing ones skipped). */
export function relatedProjects(p, all) {
  const byId = new Map(all.map((x) => [String(x.id), x]));
  return (p?.related_project_ids ?? [])
    .map((id) => byId.get(String(id)))
    .filter((x) => x && x.slug && x.slug !== p.slug && x.published !== false);
}

/**
 * ItemList JSON-LD for the projects page: one compact CreativeWork per project
 * (the full entity lives on each project page under the same @id).
 */
export function projectsListSchema(projects, { baseUrl, author }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Projects by Saad Mazhar",
    url: `${baseUrl}/projects`,
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => {
      const url = `${baseUrl}/projects/${p.slug}`;
      const image = p.og_image || p.heroImage || p.image;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          "@id": `${url}#project`,
          name: p.title,
          description: projectSeoDescription(p),
          url,
          ...(image ? { image } : {}),
          creator: author,
          ...(clean(p.stage) ? { creativeWorkStatus: clean(p.stage) } : {}),
          ...(isoYm(p.start_date || p.date) ? { dateCreated: isoYm(p.start_date || p.date) } : {}),
          ...(clean(p.category || p.type) ? { genre: clean(p.category || p.type) } : {}),
        },
      };
    }),
  };
}

const APP_STAGES = new Set(["production", "maintained", "beta"]);

/**
 * WebApplication JSON-LD for a product people can use today (a live URL and a
 * live or beta stage), next to the case study's CreativeWork. Marketing
 * websites aren't applications, so they're left out.
 */
export function projectAppSchema(p, { baseUrl, author }) {
  const live = clean(p.liveUrl || p.live_preview);
  const category = clean(p.category || p.type).toLowerCase();
  // Open-source work is often a fork or a contribution, so it is not credited as Saad's own app.
  if (
    !live ||
    !APP_STAGES.has(clean(p.stage).toLowerCase()) ||
    category === "websites" ||
    category === "open source"
  )
    return null;
  const page = `${baseUrl}/projects/${p.slug}`;
  const image = p.og_image || p.heroImage || p.image;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${page}#app`,
    name: p.title,
    description: projectSeoDescription(p),
    url: live,
    applicationCategory: category.includes("ai") ? "AI application" : "BusinessApplication",
    operatingSystem: "Web",
    ...(image ? { image } : {}),
    creator: author,
    ...(clean(p.client) ? { provider: { "@type": "Organization", name: clean(p.client) } } : {}),
    subjectOf: { "@id": `${page}#project` },
  };
}
