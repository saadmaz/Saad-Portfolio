/**
 * prerender.mjs
 * ─────────────────────────────────────────────────────────────
 * Generates per-route static HTML so search engines and AI crawlers that
 * don't run JavaScript (GPTBot, ClaudeBot, PerplexityBot, …) see the real
 * page: title, description, canonical, an H1, the page's actual content
 * (education, events, awards, skills, full blog posts…), on-page links and
 * JSON-LD. React replaces this copy instantly for visitors (index.html hides
 * [data-prerendered] until it mounts).
 *
 * Also writes the sitemaps and llms-full.txt from the same Firestore data,
 * so none of them can drift from what the site shows.
 *
 * Plain string templating, no headless browser: Puppeteer never reliably
 * launches inside Vercel's build container, so this stays on the path that
 * produces identical output everywhere. Without Firebase Admin credentials
 * (e.g. CI) it still writes every static route, just without Firestore data.
 *
 * Title/description copy lives in ../src/lib/seo-content.js, the same file
 * each page's <SEO> component imports.
 */

import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import {
  PAGE_SEO,
  PERSON_SCHEMA,
  PERSON_ID,
  PERSON_REF,
  WEBSITE_ID,
  BIO,
  homeSchemas,
  NAV_LINKS,
  SITE_NAME,
  BASE_URL,
  CONTACT_FAQ,
  CONTACT_SERVICES,
  categoryDescriptionOf,
  eventDescriptionOf,
  pageTitle,
} from "../src/lib/seo-content.js";
import { isEventIndexable, isProjectIndexable } from "../src/lib/indexing.js";
import {
  projectCanonical,
  projectDuration,
  projectGallery,
  projectSchema,
  projectSeoDescription,
  projectSeoTitle,
  projectTimeline,
  projectVideos,
  relatedProjects,
  toDate,
} from "../src/lib/project-seo.js";
import { submitChangedUrls } from "./indexnow.mjs";
import { skillLink } from "../src/lib/skill-links.js";
import { eventPhotos, eventPhotoAlt } from "../src/lib/imageAlt.js";
import {
  articleSchema,
  CATEGORY_MIN_POSTS,
  canonicalOf,
  categoriesOf,
  countWords,
  demoteH1,
  coverOf,
  isIndexable,
  normalizePath,
  personSchema as authorPersonSchema,
  publishedAtOf,
  readingMinutesOf,
  seoDescriptionOf,
  seriesParts,
  seoTitleOf,
  slugify,
  socialImageOf,
} from "../src/lib/article-core.js";
import { applyHeadMeta, POST_PAGES_DIR } from "../src/lib/share-meta.js";
import { renderOg, loadPhoto, OG_WIDTH, OG_HEIGHT } from "./og/render.mjs";
import { ogVersion } from "./og/version.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");

// ── Helpers ──────────────────────────────────────────────────────────────

/** Safe in both text nodes and double-quoted attribute values. */
function escape(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2021" stays "2021"; "2020-02-24" / "2020-12" → "Feb 2020" / "Dec 2020". */
function dateLabel(value) {
  if (!value) return "";
  const s = String(value);
  if (/^\d{4}$/.test(s)) return s;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** ("September", 2023) → "Sep 2023". */
const parts = (month, year) =>
  month && year ? `${String(month).slice(0, 3)} ${year}` : year ? String(year) : "";

function period(start, end, current) {
  const to = current ? "Present" : end;
  return start && to ? `${start} – ${to}` : start || to || "";
}

const joinMeta = (...xs) => xs.filter(Boolean).join(" · ");
const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s || "");
const stripHtml = (html) =>
  String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const keyOf = (item) => item.slug || item.id;
const list = (items, render) =>
  items.length ? `<ul>\n${items.map((i) => `  <li>${render(i)}</li>`).join("\n")}\n</ul>` : "";
/** A real <img> in the crawler copy, so image search finds the photo without running JS. */
const img = (src, alt) =>
  `<figure><img src="${escape(src)}" alt="${escape(alt)}" loading="lazy" decoding="async" /></figure>`;
/** schema.org ImageObject with the page owner credited. */
const imageObject = (src, caption) => ({
  "@type": "ImageObject",
  contentUrl: src,
  url: src,
  caption,
  creditText: SITE_NAME,
});

const paras = (text) =>
  String(text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escape(p).replace(/\n/g, "<br />")}</p>`)
    .join("\n");

function navHtml(currentPath) {
  const links = NAV_LINKS.map(
    (l) =>
      `    <a href="${l.path}"${l.path === currentPath ? ' aria-current="page"' : ""}>${escape(l.label)}</a>`,
  ).join("\n");
  return `<nav aria-label="Primary">\n${links}\n</nav>`;
}

function pageSchemas(routePath, title) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: `${BASE_URL}${routePath}`,
      isPartOf: { "@type": "WebSite", "@id": WEBSITE_ID, name: SITE_NAME, url: BASE_URL },
      about: PERSON_REF,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: title, item: `${BASE_URL}${routePath}` },
      ],
    },
  ];
}

/**
 * Rewrites `shell` (the built, JS-only index.html) into a real page for
 * `routePath`: title/canonical/meta/OG/Twitter tags plus actual content
 * inside <div id="root">. Function replacers throughout, because CMS text
 * may contain "$&"-style sequences a string replacement would expand.
 */
/** Social cards queued while pages are written, drawn at the end (see renderCards). */
const OG_JOBS = [];
/** "/" → /og/home.png, "/events/48th-big-debate" → /og/events/48th-big-debate.png (matches SEO.tsx). */
const ogFile = (routePath) => `og/${routePath === "/" ? "home" : routePath.replace(/^\//, "")}.png`;
const OG_VERSION = ogVersion();

function injectContent(
  shell,
  {
    path: routePath,
    title,
    fullTitle,
    h1,
    description,
    schemas,
    bodyHtml = "",
    og,
    noIndex = false,
    canonical,
    type,
    image,
  },
) {
  const pageUrl = routePath === "/" ? BASE_URL : `${BASE_URL}${routePath}`;
  // Every page gets its own 1200×630 card as og:image / twitter:image, unless
  // the author uploaded a dedicated social image for it.
  OG_JOBS.push({ file: ogFile(routePath), spec: { title, ...og } });
  const card = `${BASE_URL}/${ogFile(routePath)}?v=${OG_VERSION}`;
  const html = applyHeadMeta(shell, {
    title: fullTitle || pageTitle(title),
    description,
    url: pageUrl,
    canonical,
    type,
    // Unlisted pages: reachable by link, but search engines must not index them.
    noIndex,
    image: image?.url ? image : { url: card },
    imageFallbackSize: { width: OG_WIDTH, height: OG_HEIGHT },
  });

  const schemaScripts = (schemas || [])
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, "\\u003c")}</script>`)
    .join("\n");

  const content = [
    `<header>\n<h1>${escape(h1 || title)}</h1>\n<p>${escape(description)}</p>\n</header>`,
    bodyHtml && `<main>\n${bodyHtml}\n</main>`,
    navHtml(routePath),
    schemaScripts,
  ]
    .filter(Boolean)
    .join("\n");

  // What crawlers see, hashed per indexable URL so IndexNow only hears about real changes
  // (not every build's new asset file names).
  if (!noIndex && !canonical) CONTENT_HASHES[pageUrl] = hash(content);

  // data-prerendered: index.html hides this unstyled crawler copy from
  // visitors until React mounts and replaces it (no flash of plain text).
  return html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    () => `<div id="root"><div data-prerendered>${content}</div></div>`,
  );
}

/** Indexable page URL → hash of its crawler-visible content (see scripts/indexnow.mjs). */
const CONTENT_HASHES = {};
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/** Every prerendered path; written to dist/routes.json for the 404 check in middleware.ts. */
const ROUTES = new Set();

function writeRoute(routePath, html) {
  ROUTES.add(routePath.toLowerCase());
  const routeDir = routePath === "/" ? DIST_DIR : join(DIST_DIR, routePath);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, "index.html"), html, "utf-8");
}

/**
 * Article pages are served by api/blog-page.ts, which re-applies live title,
 * description and share image from Firestore, so edits and new posts show up
 * in link previews without waiting for a rebuild. They're written outside the
 * route path so the static file doesn't shadow that rewrite.
 */
function writePostPage(slug, html, { listed = true } = {}) {
  // routes.json is public: unlisted posts are left out (middleware.ts then
  // confirms them with a live lookup, so their links still work).
  if (listed) ROUTES.add(`/blog/${slug}`.toLowerCase());
  const dir = join(DIST_DIR, POST_PAGES_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.html`), html, "utf-8");
}

// ── Data ─────────────────────────────────────────────────────────────────

const EMPTY = {
  projects: [],
  posts: [],
  unlistedPosts: [],
  events: [],
  certificates: [],
  education: [],
  experience: [],
  skills: [],
  awards: [],
  volunteer: [],
  languages: [],
  publications: [],
  newsletters: [],
  authors: [],
  series: [],
  redirects: [],
  settings: {},
};

async function loadData() {
  const hasCreds =
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;
  if (!hasCreds) {
    console.warn(
      "⚠️  Firebase Admin credentials not set - prerendering static routes without Firestore content.",
    );
    return EMPTY;
  }
  const { initializeApp, cert, getApps } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
  const db = getFirestore();
  const all = async (name) => (await db.collection(name).get()).docs.map((d) => ({ id: d.id, ...d.data() }));
  const byDateDesc = (field) => (a, b) => String(b[field] ?? "").localeCompare(String(a[field] ?? ""));
  // Event dates are free text ("2023", "Apr 27, 2022"); compare parsed times, undated last
  // (mirrors byEventDateDesc in src/lib/eventDates.ts).
  const eventTime = (v) => {
    const t = String(v ?? "").trim();
    return /^\d{4}$/.test(t) ? Date.UTC(Number(t), 0, 1) : Date.parse(t);
  };
  const byEventDateDesc = (a, b) => {
    const ta = eventTime(a.date);
    const tb = eventTime(b.date);
    if (Number.isNaN(ta)) return Number.isNaN(tb) ? 0 : 1;
    if (Number.isNaN(tb)) return -1;
    return tb - ta;
  };

  const [
    projects,
    posts,
    events,
    certificates,
    education,
    experience,
    skills,
    awards,
    volunteer,
    languages,
    publications,
    newsletters,
    authors,
    series,
    redirects,
    settingsSnap,
  ] = await Promise.all([
    all("projects"),
    all("blog_posts"),
    all("events"),
    all("certificates"),
    all("education"),
    all("work_experience"),
    all("skills"),
    all("awards"),
    all("volunteer_experience"),
    all("languages"),
    all("publications"),
    all("newsletters"),
    all("authors"),
    all("blog_series"),
    all("redirects"),
    db.collection("blog_settings").doc("config").get(),
  ]);

  return {
    // `published` defaults to true for legacy projects predating the field;
    // blog posts must be explicitly published (matches BlogService.getPublished()).
    projects: projects
      .filter((p) => p.slug && p.published !== false)
      .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999)),
    // Unlisted posts are live but only reachable by direct link: they get a
    // (noindex) page so shared links preview properly, and nothing else.
    posts: posts.filter((p) => p.slug && p.published === true && !p.unlisted).sort(byDateDesc("date")),
    unlistedPosts: posts.filter((p) => p.slug && p.published === true && p.unlisted),
    events: events.sort(byEventDateDesc),
    certificates: certificates.sort(byDateDesc("issue_date")),
    education: education
      .filter((e) => e.is_published !== false)
      .sort(
        (a, b) =>
          (a.display_order ?? 99) - (b.display_order ?? 99) || (b.start_year ?? 0) - (a.start_year ?? 0),
      ),
    // The site queries orderBy("order_index"), which Firestore answers with only
    // the docs that have that field; match it so crawlers see what visitors see.
    experience: experience
      .filter((x) => x.order_index !== undefined)
      .sort((a, b) => a.order_index - b.order_index),
    // Strip-only tools (toolOnly) stay off the public skills list.
    skills: skills
      .map((g) => ({ ...g, skills: (g.skills ?? []).filter((s) => !s.toolOnly) }))
      .filter((g) => g.skills.length),
    awards: awards.sort(byDateDesc("date")),
    volunteer: volunteer.sort(byDateDesc("startDate")),
    languages,
    publications: publications.sort(byDateDesc("date")),
    newsletters: newsletters.sort(byDateDesc("date")),
    authors,
    series: series.filter((s) => s.published === true),
    redirects,
    settings: settingsSnap.exists ? settingsSnap.data() : {},
  };
}

// ── Content blocks (shared by pages and llms-full.txt) ──────────────────

const schoolOf = (e) => e.school_name ?? e.institution ?? "";
const programOf = (e) => [e.degree, e.field_of_study ?? e.fieldOfStudy].filter(Boolean).join(" in ");
const eduPeriod = (e) =>
  period(
    parts(e.start_month, e.start_year) || dateLabel(e.startDate),
    parts(e.end_month, e.end_year) || dateLabel(e.endDate),
    e.is_current ?? e.isCurrent,
  );
const companyOf = (x) => x.company_name ?? x.company ?? "";
/** Same rule as companySlug() in src/lib/experience.ts. */
const companySlugOf = (x) => slugify(companyOf(x)) || "company";

/** Experience docs grouped into companies (legacy one-role docs share a name). */
function experienceCompanies(experience) {
  const bySlug = new Map();
  for (const x of experience) {
    const slug = companySlugOf(x);
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(x);
  }
  return [...bySlug.entries()].map(([slug, docs]) => ({ slug, name: companyOf(docs[0]), docs }));
}

/** A company page with real write-up gets indexed; a bare title-and-dates page doesn't. */
const isCompanyIndexable = (c) => stripHtml(experienceHtml(c.docs)).split(" ").filter(Boolean).length >= 80;
const expPeriod = (x) =>
  period(
    parts(x.start_month, x.start_year) || dateLabel(x.startDate),
    parts(x.end_month, x.end_year) || dateLabel(x.endDate),
    x.is_current ?? x.isCurrent,
  );
const volPeriod = (v) => period(dateLabel(v.startDate), dateLabel(v.endDate), v.isCurrent);

function educationHtml(education) {
  return education
    .map((e) => {
      const honours = (e.honors_and_awards ?? []).map((h) =>
        joinMeta(h.award_title, h.award_issuer, h.award_date_year),
      );
      return [
        `<article>`,
        `<h2>${escape(programOf(e) || schoolOf(e))}</h2>`,
        `<p>${escape(joinMeta(programOf(e) && schoolOf(e), eduPeriod(e), e.show_grade_publicly && e.grade && `Grade: ${e.grade}`))}</p>`,
        paras(e.description),
        e.activities_and_societies &&
          `<h3>Activities and societies</h3>\n${list(e.activities_and_societies.split("\n").filter(Boolean), escape)}`,
        honours.length && `<h3>Honours</h3>\n${list(honours, escape)}`,
        e.skills?.length && `<p>Skills: ${escape(e.skills.join(", "))}</p>`,
        `</article>`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
}

function experienceHtml(experience) {
  return experience
    .map((x) => {
      const roles = x.roles?.length
        ? x.roles
        : [{ role_title: x.title ?? x.position, description: x.description }];
      return [
        `<article>`,
        `<h2><a href="/experience/${escape(companySlugOf(x))}">${escape(companyOf(x))}</a></h2>`,
        `<p>${escape(joinMeta(x.employment_type ?? x.employmentType, x.location_type ?? x.location, expPeriod(x)))}</p>`,
        ...roles.map((r) =>
          [
            r.role_title && `<h3>${escape(r.role_title)}</h3>`,
            r.role_start_year &&
              `<p>${escape(period(parts(r.role_start_month, r.role_start_year), parts(r.role_end_month, r.role_end_year), r.role_is_current))}</p>`,
            paras(r.description),
          ]
            .filter(Boolean)
            .join("\n"),
        ),
        x.impact_metrics?.length && list(x.impact_metrics, (m) => `${escape(m.value)} ${escape(m.label)}`),
        ...(x.highlights ?? []).map(
          (h) => `<h3>${escape(h.title)}</h3>
${paras(h.description)}`,
        ),
        paras(x.achievements),
        x.testimonial?.quote &&
          `<blockquote><p>${escape(x.testimonial.quote)}</p><footer>${escape(joinMeta(x.testimonial.name, x.testimonial.role))}</footer></blockquote>`,
        x.skills?.length && `<p>Skills: ${escape(x.skills.join(", "))}</p>`,
        `</article>`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
}

const eventLine = (e) =>
  `<a href="/events/${escape(keyOf(e))}">${escape(e.title)}</a> - ${escape(joinMeta(e.role, dateLabel(e.date), e.location, e.organizer))}`;
const certLine = (c) =>
  `<a href="/certifications/${escape(keyOf(c))}">${escape(c.title)}</a> - ${escape(joinMeta(c.issuer, dateLabel(c.issue_date)))}`;
const awardLine = (a) => escape(joinMeta(a.title, a.issuer, dateLabel(a.date)));
const volunteerLine = (v) => escape(joinMeta(`${v.role}, ${v.organization}`, volPeriod(v)));
const languageLine = (l) => escape(joinMeta(l.name, l.level));

/** Labels the /skills page shows for each stored level. */
const LEVEL_LABEL = {
  Expert: "Daily driver",
  Advance: "Proficient",
  Intermediate: "Familiar",
  Beginner: "Learning",
};
const skillMeta = (s) => joinMeta(LEVEL_LABEL[s.level] ?? s.level, s.startYear && `since ${s.startYear}`);

function skillsHtml(skills) {
  const line = (s) => {
    const href = skillLink(s);
    const name = href ? `<a href="${escape(href)}" rel="noopener">${escape(s.name)}</a>` : escape(s.name);
    return `${name} - ${escape(skillMeta(s))}`;
  };
  return skills.map((g) => `<h2>${escape(g.category)}</h2>\n${list(g.skills, line)}`).join("\n");
}

/** Plain-language answers about the stack, built from the CMS so they never go stale. */
function skillsFaqSchema(skills) {
  const all = skills.flatMap((g) => g.skills);
  const names = (lvl) => [...new Set(all.filter((s) => s.level === lvl).map((s) => s.name))];
  const main = [...names("Expert"), ...names("Advance")].slice(0, 15);
  const learning = names("Beginner").slice(0, 8);
  const first = Math.min(...all.map((s) => s.startYear).filter((y) => y > 1990));
  const qa = [
    main.length && [
      "What is Saad Mazhar's main tech stack?",
      `Saad Mazhar works mainly with ${main.join(", ")}.`,
    ],
    Number.isFinite(first) && [
      "How long has Saad Mazhar been building software?",
      `Since ${first}, across ${all.length} tools and ${skills.length} disciplines (${skills.map((g) => g.category).join(", ")}).`,
    ],
    learning.length && [
      "What is Saad Mazhar learning right now?",
      `Currently learning ${learning.join(", ")}.`,
    ],
  ].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Every skill as a DefinedTerm linked to its official site (mirrors skillsSchema in SkillsPage.tsx). */
function skillsListSchema(skills) {
  const all = skills.flatMap((g) => g.skills.map((s) => ({ ...s, category: g.category })));
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Skills and tools - Saad Mazhar",
    url: `${BASE_URL}/skills`,
    numberOfItems: all.length,
    itemListElement: all.map((s, i) => {
      const href = skillLink(s);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "DefinedTerm",
          name: s.name,
          description: joinMeta(
            LEVEL_LABEL[s.level] ?? s.level,
            s.category,
            s.startYear && `since ${s.startYear}`,
          ),
          inDefinedTermSet: s.category,
          ...(href ? { sameAs: href } : {}),
        },
      };
    }),
  };
}

const section = (title, body) => (body ? `<section>\n<h2>${escape(title)}</h2>\n${body}\n</section>` : "");

/** Person JSON-LD enriched with what the site actually knows, so AI and search engines can connect the facts. */
function personSchema(data) {
  const schema = { ...PERSON_SCHEMA, description: BIO };
  if (data.education.length)
    schema.alumniOf = data.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: schoolOf(e),
      ...(e.school_website_url ? { url: e.school_website_url } : {}),
    }));
  if (data.awards.length) schema.award = data.awards.map((a) => joinMeta(a.title, a.issuer));
  // Strongest first, each tied to its official site so engines resolve the exact entity.
  const rank = { Expert: 0, Advance: 1, Intermediate: 2, Beginner: 3 };
  const seen = new Set();
  const skills = data.skills
    .flatMap((g) => g.skills)
    .sort((a, b) => (rank[a.level] ?? 2) - (rank[b.level] ?? 2))
    .filter((s) => !seen.has(s.name) && seen.add(s.name));
  if (skills.length)
    schema.knowsAbout = skills.slice(0, 40).map((s) => {
      const href = skillLink(s);
      return href ? { "@type": "Thing", name: s.name, sameAs: href } : s.name;
    });
  if (data.languages.length) schema.knowsLanguage = data.languages.map((l) => l.name);
  return schema;
}

// ── Static routes ────────────────────────────────────────────────────────

function staticBody(routePath, data) {
  const recentEvents = data.events.slice(0, 6);
  switch (routePath) {
    case "/":
      return [
        `<p>${escape(BIO)}</p>`,
        `<p>Founder, full-stack engineer and tech speaker from Colombo, Sri Lanka. I turn rough ideas into products people pay for, then go on stage and explain how.</p>`,
        section(
          "Selected projects",
          list(
            data.projects.slice(0, 6),
            (p) =>
              `<a href="/projects/${escape(p.slug)}">${escape(p.title)}</a>${p.tagline ? ` - ${escape(p.tagline)}` : ""}`,
          ),
        ),
        section(
          "Experience",
          list(data.experience.slice(0, 4), (x) =>
            escape(joinMeta(companyOf(x), x.roles?.[0]?.role_title, expPeriod(x))),
          ),
        ),
        section("Speaking and hosting", list(recentEvents, eventLine)),
        section(
          "Education",
          list(data.education, (e) =>
            escape(joinMeta(programOf(e) || schoolOf(e), programOf(e) && schoolOf(e), eduPeriod(e))),
          ),
        ),
        section(
          "Recent writing",
          list(data.posts.slice(0, 5), (p) => `<a href="/blog/${escape(p.slug)}">${escape(p.title)}</a>`),
        ),
      ].join("\n");
    case "/about":
      return [
        section(
          "Education",
          list(data.education, (e) =>
            escape(joinMeta(programOf(e) || schoolOf(e), programOf(e) && schoolOf(e), eduPeriod(e))),
          ),
        ),
        section("Awards and honours", list(data.awards, awardLine)),
        section("Volunteering", list(data.volunteer, volunteerLine)),
        section("Languages", list(data.languages, languageLine)),
      ].join("\n");
    case "/education":
      return educationHtml(data.education);
    case "/experience":
      return experienceHtml(data.experience);
    case "/events":
      return list(data.events, eventLine);
    case "/skills":
      return skillsHtml(data.skills);
    case "/certifications":
      return list(data.certificates, certLine);
    case "/languages":
      return list(data.languages, languageLine);
    case "/projects":
      return list(
        data.projects,
        (p) =>
          `<a href="/projects/${escape(p.slug)}">${escape(p.title)}</a>${p.tagline ? ` - ${escape(p.tagline)}` : ""}`,
      );
    case "/blog":
      return list(
        data.posts,
        (p) =>
          `<a href="/blog/${escape(p.slug)}">${escape(p.title)}</a> - ${escape(joinMeta(dateLabel(p.date), p.excerpt))}`,
      );
    case "/publications":
      return list(
        data.publications,
        (p) =>
          `${p.link ? `<a href="${escape(p.link)}">${escape(p.title)}</a>` : escape(p.title)} - ${escape(joinMeta(p.publisher, dateLabel(p.date)))}`,
      );
    case "/newsletters":
      return list(
        data.newsletters,
        (n) =>
          `<a href="${escape(n.content_url)}">${escape(n.title)}</a> - ${escape(joinMeta(dateLabel(n.date), n.description))}`,
      );
    case "/contact":
      return [
        `<p>Product builds, startup collaborations, speaking and hosting. Tell me what you're working on and I'll reply within a day.</p>`,
        `<p>Email: <a href="mailto:hello@saadmaz.com">hello@saadmaz.com</a> · <a href="https://calendly.com/saadmaz/30min">Book a 30-minute call</a></p>`,
        `<p>Based in Colombo, Sri Lanka.</p>`,
        section(
          "What I can help with",
          CONTACT_SERVICES.map((s) => `<h3>${escape(s.title)}</h3>\n<p>${escape(s.body)}</p>`).join("\n"),
        ),
        section(
          "Frequently asked questions",
          CONTACT_FAQ.map(({ q, a }) => `<h3>${escape(q)}</h3>\n<p>${escape(a)}</p>`).join("\n"),
        ),
        section(
          "Elsewhere",
          list(PERSON_SCHEMA.sameAs, (u) => `<a href="${escape(u)}">${escape(u)}</a>`),
        ),
      ].join("\n");
    default:
      return "";
  }
}

/** Card copy per static page: the same two-tone headline the page shows. */
function staticCard(routePath, data) {
  const firstYear = Math.min(...data.education.map((e) => e.start_year ?? Infinity));
  const cards = {
    "/": {
      eyebrow: "Founder · Engineer · Host",
      title: "Building products that solve",
      soft: "real problems.",
      meta: "Colombo, Sri Lanka",
      visual: { kind: "portrait" },
    },
    "/about": {
      eyebrow: "About",
      title: "Founder by trade,",
      soft: "engineer by habit, host by accident.",
      meta: "Colombo, Sri Lanka",
      visual: { kind: "portrait" },
    },
    "/contact": {
      eyebrow: "Contact",
      title: "Let's build",
      soft: "something good.",
      meta: "hello@saadmaz.com",
      visual: { kind: "portrait" },
    },
    "/education": {
      eyebrow: "Education",
      title: "Classrooms",
      soft: "behind the work",
      meta: joinMeta(
        data.education.length && `${data.education.length} institutions`,
        Number.isFinite(firstYear) && `Since ${firstYear}`,
      ),
    },
    "/events": {
      eyebrow: "Events & Hosting",
      title: "Every stage,",
      soft: "a new story",
      meta: joinMeta(data.events.length && `${data.events.length} events`, "Host · Speaker · Organiser"),
    },
    "/experience": { eyebrow: "Experience", title: "Where I've", soft: "worked" },
    "/skills": {
      eyebrow: "Capabilities",
      title: "What I bring",
      soft: "to a team",
      meta: data.skills
        .map((g) => g.category)
        .slice(0, 3)
        .join(" · "),
    },
    "/certifications": {
      eyebrow: "Credentials",
      title: `${data.certificates.length || ""}`.trim() || "Certifications",
      soft: data.certificates.length ? "certifications" : "",
      meta: "AI · Security · Cloud · Leadership",
    },
    "/projects": { eyebrow: "Selected work", title: "Things I've", soft: "built" },
    "/blog": {
      eyebrow: "Writing",
      title: "Notes from",
      soft: "the build",
      meta: data.posts.length ? `${data.posts.length} articles` : "",
    },
    "/languages": { eyebrow: "Languages", title: "Languages I", soft: "speak and host in" },
    "/publications": { eyebrow: "Publications", title: "Published", soft: "work" },
    "/newsletters": { eyebrow: "Newsletter", title: "Notes, straight", soft: "to your inbox" },
  };
  return cards[routePath] ?? { eyebrow: PAGE_SEO[routePath]?.title };
}

/** Same FAQ as ContactPage.tsx shows and marks up. */
const CONTACT_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: CONTACT_FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

/**
 * Static pages kept out of the index: /projects until it lists a real case study
 * (an empty or stub-only listing reads as a soft 404), and /languages, a few
 * lines already covered on /about.
 */
const thinStaticRoute = (routePath, data) =>
  (routePath === "/projects" && !data.projects.some(isProjectIndexable)) || routePath === "/languages";

function prerenderStaticRoutes(shell, data) {
  const person = personSchema(data);
  for (const [routePath, { title, fullTitle, h1, description }] of Object.entries(PAGE_SEO)) {
    const schemas =
      routePath === "/"
        ? homeSchemas(person)
        : routePath === "/about"
          ? [person, ...pageSchemas(routePath, title)]
          : routePath === "/contact"
            ? [...pageSchemas(routePath, title), CONTACT_FAQ_SCHEMA]
            : routePath === "/skills" && data.skills.length
              ? [
                  ...pageSchemas(routePath, title),
                  skillsListSchema(data.skills),
                  skillsFaqSchema(data.skills),
                ]
              : pageSchemas(routePath, title);
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title,
        fullTitle,
        h1,
        description,
        schemas,
        bodyHtml: staticBody(routePath, data),
        og: staticCard(routePath, data),
        noIndex: thinStaticRoute(routePath, data) ? "follow" : false,
      }),
    );
  }
  console.log(`✅ Static routes prerendered: ${Object.keys(PAGE_SEO).length}`);
}

// ── Detail routes ────────────────────────────────────────────────────────

const author = PERSON_REF;

function prerenderProjects(shell, projects) {
  const list = (items) =>
    items.length && `<ul>\n${items.map((t) => `<li>${escape(t)}</li>`).join("\n")}\n</ul>`;
  const section = (heading, ...parts) => {
    const body = parts.filter(Boolean).join("\n");
    return body && `<section>\n<h2>${escape(heading)}</h2>\n${body}\n</section>`;
  };
  for (const p of projects) {
    const routePath = `/projects/${p.slug}`;
    const tech = p.technologies?.length ? p.technologies : (p.techStack ?? []);
    const related = relatedProjects(p, projects);
    const timeline = projectTimeline(p);
    const duration = projectDuration(p);
    const updated = toDate(p.updated_at);
    const facts = [
      ["Role", p.role],
      ["Client / organisation", p.client],
      ["Timeline", [timeline, duration].filter(Boolean).join(" · ")],
      ["Stage", p.stage],
      ["Status", p.status],
      ["Industry", p.industry],
      ["Built for", p.target_audience],
      ["Team size", p.team_size && String(p.team_size)],
    ].filter(([, v]) => v);
    const challenges = (p.challenges ?? []).map((c) =>
      typeof c === "string" ? c : [c.wall, c.fix].filter(Boolean).join(". "),
    );
    const links = [
      (p.liveUrl || p.live_preview) &&
        `<li><a href="${escape(p.liveUrl || p.live_preview)}">Live site</a></li>`,
      (p.githubUrl || p.github) && `<li><a href="${escape(p.githubUrl || p.github)}">Source code</a></li>`,
      ...(p.resources ?? [])
        .filter((r) => r?.url)
        .map(
          (r) =>
            `<li><a href="${escape(r.url)}">${escape(r.label || r.url)}</a>${r.kind ? ` (${escape(r.kind)})` : ""}</li>`,
        ),
    ].filter(Boolean);
    const bodyHtml = [
      p.heroImage && img(p.heroImage, p.altText || `${p.title}, a project by ${SITE_NAME}`),
      facts.length &&
        `<dl>\n${facts.map(([k, v]) => `<dt>${escape(k)}</dt><dd>${escape(v)}</dd>`).join("\n")}\n</dl>`,
      section("Overview", paras(p.overview), paras(p.description)),
      section("What I built", paras(p.solution || p.long_description)),
      section("My contribution", list(p.contribution ?? [])),
      section(
        "Impact & results",
        (p.results ?? []).length &&
          `<ul>\n${p.results.map((r) => `<li><strong>${escape(r.value)}</strong> ${escape(r.label)}</li>`).join("\n")}\n</ul>`,
        paras(p.impact),
      ),
      section("Features", list(p.features ?? [])),
      section(
        "Architecture",
        p.architecture?.diagramUrl &&
          img(p.architecture.diagramUrl, p.architecture.diagramAlt || `${p.title} architecture diagram`),
        paras(p.architecture?.description),
        list(p.technical_decisions ?? []),
      ),
      section("Challenges", list(challenges)),
      section("What I learned", list(p.learnings ?? [])),
      tech.length && `<p>Built with: ${escape(tech.join(", "))}</p>`,
      (p.skills ?? []).length && `<p>Skills: ${escape(p.skills.join(", "))}</p>`,
      section(
        "Team & credits",
        list(
          (p.collaborators ?? [])
            .filter((c) => c?.name)
            .map((c) => [c.name, c.role].filter(Boolean).join(", ")),
        ),
      ),
      section(
        "What people said",
        (p.testimonials ?? [])
          .filter((t) => t?.quote)
          .map(
            (t) =>
              `<blockquote><p>${escape(t.quote)}</p><footer>${escape([t.name, t.role, t.organisation].filter(Boolean).join(", "))}</footer></blockquote>`,
          )
          .join("\n"),
      ),
      section(
        "Gallery",
        projectGallery(p)
          .map(
            (g) =>
              `<figure><img src="${escape(g.url)}" alt="${escape(g.alt)}" loading="lazy" decoding="async" />${g.caption ? `<figcaption>${escape(g.caption)}</figcaption>` : ""}</figure>`,
          )
          .join("\n"),
      ),
      section(
        "Video",
        projectVideos(p)
          .map(
            (v, i) =>
              `<p><a href="${escape(v.url)}">${escape(v.title || `${p.title} demo video ${i + 1}`)}</a></p>`,
          )
          .join("\n"),
      ),
      section("Links", links.length && `<ul>\n${links.join("\n")}\n</ul>`),
      section(
        "Related projects",
        related.length &&
          `<ul>\n${related.map((r) => `<li><a href="/projects/${escape(r.slug)}">${escape(r.title)}</a>${r.tagline ? ` - ${escape(r.tagline)}` : ""}</li>`).join("\n")}\n</ul>`,
      ),
      updated &&
        `<p>Last updated <time datetime="${updated.toISOString()}">${escape(dateLabel(updated.toISOString()))}</time></p>`,
      '<p><a href="/projects">All projects</a></p>',
    ]
      .filter(Boolean)
      .join("\n");
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title: projectSeoTitle(p),
        h1: p.title,
        description: projectSeoDescription(p),
        schemas: [projectSchema(p, { baseUrl: BASE_URL, author, related })],
        bodyHtml,
        // Only set when the original case study lives elsewhere; otherwise the page is its own canonical.
        canonical: p.canonical_url ? projectCanonical(p, BASE_URL) : undefined,
        // A dedicated 1200×630 share image beats the generated card.
        image: p.og_image ? { url: p.og_image, width: OG_WIDTH, height: OG_HEIGHT } : undefined,
        // Stub write-ups (see src/lib/indexing.js) stay reachable but out of the index.
        noIndex: isProjectIndexable(p) ? false : "follow",
        og: {
          eyebrow: "Project",
          title: p.title,
          meta: joinMeta(p.role, timeline || (p.date && dateLabel(p.date)), tech.slice(0, 3).join(", ")),
          photo: p.heroImage,
        },
      }),
    );
  }
}

/** The post's author profile (authorId, else the default author), or null for legacy name-only posts. */
const authorOf = (p, data) =>
  data.authors.find((a) => a.id === p.authorId) ??
  data.authors.find((a) => a.id === data.settings.defaultAuthorId) ??
  data.authors.find((a) => a.isDefault) ??
  null;

function prerenderPosts(shell, posts, data, { noIndex = false } = {}) {
  for (const p of posts) {
    const routePath = `/blog/${p.slug}`;
    const postAuthor = authorOf(p, data);
    const authorName = postAuthor?.name || p.author || SITE_NAME;
    const description = seoDescriptionOf(p) || `"${p.title}" by ${authorName}.`;
    const cover = coverOf(p);
    const social = socialImageOf(p);
    const hidden = noIndex || !!p.noIndex;
    const schema = articleSchema(p, {
      baseUrl: BASE_URL,
      author: postAuthor,
      publisher: { name: SITE_NAME, logo: "/icons/logo-v4-512.png", id: PERSON_ID },
      series: data.series.find((s) => s.id === p.seriesId),
      wordCount: countWords(stripHtml(p.content)),
    });
    const published = publishedAtOf(p);
    // The full article, not just the excerpt: it's the content worth indexing.
    const bodyHtml = [
      "<article>",
      p.subtitle && `<p><strong>${escape(p.subtitle)}</strong></p>`,
      `<p>${escape(joinMeta(authorName, dateLabel(published), p.category, `${readingMinutesOf(p, data.settings.readingWpm)} min read`))}</p>`,
      postAuthor &&
        `<p><a href="/authors/${escape(postAuthor.slug)}">About ${escape(postAuthor.name)}</a></p>`,
      cover && img(cover.url, cover.alt || p.title),
      // One H1 per page (the title): body H1s become H2s, as on the live page.
      demoteH1(p.content),
      (p.sources ?? []).length &&
        `<h2>Sources &amp; references</h2>\n<ol>${p.sources
          .map(
            (s) =>
              `<li>${s.url ? `<a href="${escape(s.url)}">${escape(s.title)}</a>` : escape(s.title)}</li>`,
          )
          .join("")}</ol>`,
      "</article>",
      '<p><a href="/blog">All writing</a></p>',
    ]
      .filter(Boolean)
      .join("\n");
    writePostPage(
      p.slug,
      injectContent(shell, {
        path: routePath,
        title: seoTitleOf(p),
        description,
        schemas: hidden ? [] : [schema],
        bodyHtml,
        noIndex: hidden,
        canonical: canonicalOf(p, BASE_URL),
        type: "article",
        // A dedicated social image wins over the generated card.
        image: p.socialImage?.url ? social : null,
        og: {
          eyebrow: "Writing",
          title: p.title,
          meta: joinMeta(
            p.category,
            dateLabel(published),
            `${readingMinutesOf(p, data.settings.readingWpm)} min read`,
          ),
          photo: cover?.url,
        },
      }),
      // `noIndex` here means the unlisted batch.
      { listed: !noIndex },
    );
  }
}

function prerenderBlogIndexes(shell, data) {
  // Category pages.
  for (const c of categoriesOf(data.posts.filter(isIndexable))) {
    const setting = data.settings.categories?.find((s) => s.slug === c.slug);
    const label = setting?.label ?? c.label;
    const inCat = data.posts.filter((p) => slugify(p.category) === c.slug);
    const routePath = `/blog/category/${c.slug}`;
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title: `${label} articles`,
        description: categoryDescriptionOf(label, setting?.description),
        bodyHtml: [
          setting?.description && paras(setting.description),
          list(
            inCat,
            (p) =>
              `<a href="/blog/${escape(p.slug)}">${escape(p.title)}</a>${p.excerpt ? ` - ${escape(p.excerpt)}` : ""}`,
          ),
        ]
          .filter(Boolean)
          .join("\n"),
        // A category with one or two posts is a thin copy of /blog: out of the index until
        // it fills up (same rule as the blog sitemap and BlogsPage.tsx).
        noIndex: inCat.length < CATEGORY_MIN_POSTS ? "follow" : false,
        og: { eyebrow: "Writing", title: `${label} articles` },
      }),
    );
  }
  // Author pages.
  for (const a of data.authors.filter((a) => a.slug)) {
    const byAuthor = data.posts.filter((p) => authorOf(p, data)?.id === a.id);
    const routePath = `/authors/${a.slug}`;
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title: `${a.name}${a.title ? `, ${a.title}` : ""}`,
        description: a.bio || `Articles by ${a.name}.`,
        schemas: [
          {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: authorPersonSchema(a, BASE_URL),
          },
        ],
        bodyHtml: [
          paras(a.bio),
          list(byAuthor, (p) => `<a href="/blog/${escape(p.slug)}">${escape(p.title)}</a>`),
        ]
          .filter(Boolean)
          .join("\n"),
        og: { eyebrow: "Author", title: a.name, meta: a.title },
      }),
    );
  }
  // Series pages.
  const byId = new Map(data.posts.map((p) => [p.id, p]));
  for (const s of data.series.filter((s) => s.slug)) {
    const parts = seriesParts(s, byId);
    const routePath = `/blog/series/${s.slug}`;
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title: `${s.title} - series`,
        description: s.description || `A ${parts.length}-part series by ${SITE_NAME}.`,
        bodyHtml: list(parts, (p) => `<a href="/blog/${escape(p.slug)}">${escape(p.title)}</a>`),
        og: { eyebrow: "Series", title: s.title, meta: `${parts.length} parts` },
      }),
    );
  }
}

/** Redirect map for middleware.ts: { "/blog/old": { to, statusCode } }. */
function writeRedirects(data) {
  const map = {};
  for (const r of data.redirects) {
    const from = normalizePath(r.from);
    if (from && r.to) map[from] = { to: r.to, statusCode: r.statusCode === 302 ? 302 : 301 };
  }
  // Old id-based URLs (shared before slugs existed) → the slug URL, as a real 301.
  const alias = (prefix, items) => {
    for (const item of items) {
      if (!item.slug || item.slug === item.id) continue;
      const from = normalizePath(`${prefix}/${item.id}`);
      if (!map[from]) map[from] = { to: `${prefix}/${item.slug}`, statusCode: 301 };
    }
  };
  alias("/events", data.events);
  alias("/certifications", data.certificates);
  // Not unlisted posts: redirects.json is public and would reveal their slugs.
  alias("/blog", data.posts);
  writeFileSync(join(DIST_DIR, "redirects.json"), JSON.stringify(map), "utf-8");
  console.log(`✅ redirects.json (${Object.keys(map).length} rules)`);
}

/** The page middleware.ts serves (with HTTP 404) for URLs that don't exist. */
function writeNotFound(shell) {
  const html = injectContent(shell, {
    path: "/404",
    title: "Page not found",
    description: "The page you're after moved, or never existed.",
    bodyHtml: '<p><a href="/">Back home</a> · <a href="/blog">Read the blog</a></p>',
    noIndex: true,
    og: { title: "Page not found" },
  });
  writeFileSync(join(DIST_DIR, "404.html"), html, "utf-8");
}

function prerenderEvents(shell, events) {
  for (const e of events) {
    const routePath = `/events/${keyOf(e)}`;
    const cover = e.image || e.images?.[0];
    const photos = eventPhotos(e);
    const description = eventDescriptionOf(e);
    const images = photos.length
      ? { image: photos.map((src) => imageObject(src, eventPhotoAlt(e, src))) }
      : {};
    const indexable = isEventIndexable(e);
    // Event markup is for upcoming events with a real date; a past event marked
    // "EventScheduled" (or dated "2023") is invalid structured data. Past events
    // are described as a page about Saad's part in them instead.
    const startsAt = /^\d{4}-\d{2}-\d{2}/.test(String(e.date ?? "")) ? Date.parse(e.date) : NaN;
    const upcoming = startsAt > Date.now();
    const schemas = upcoming
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.title,
            description: e.description,
            startDate: e.date,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: { "@type": "Place", name: e.location, address: e.location },
            organizer: { "@type": "Organization", name: e.organizer },
            [e.role === "Speaker" ? "performer" : "contributor"]: author,
            ...images,
          },
        ]
      : [
          {
            ...pageSchemas(routePath, e.title)[0],
            description,
            ...images,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
              { "@type": "ListItem", position: 3, name: e.title, item: `${BASE_URL}${routePath}` },
            ],
          },
        ];
    const bodyHtml = [
      `<p>${escape(joinMeta(e.role && `Role: ${e.role}`, dateLabel(e.date), e.location, e.organizer && `Organiser: ${e.organizer}`))}</p>`,
      paras(e.description),
      e.highlights?.length && `<h2>Highlights</h2>\n${list(e.highlights, escape)}`,
      photos.length && `<h2>Photos</h2>\n${photos.map((src) => img(src, eventPhotoAlt(e, src))).join("\n")}`,
      '<p><a href="/events">All events</a></p>',
    ]
      .filter(Boolean)
      .join("\n");
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title: e.title,
        description,
        schemas,
        bodyHtml,
        // Thin write-ups (see src/lib/indexing.js) stay reachable but out of the index.
        noIndex: indexable ? false : "follow",
        og: {
          eyebrow: "Events & Hosting",
          title: e.title,
          meta: joinMeta(e.role, dateLabel(e.date), e.location),
          photo: cover,
          figure: String(dateLabel(e.date)).slice(-4),
        },
      }),
    );
  }
}

function prerenderExperience(shell, experience) {
  for (const c of experienceCompanies(experience)) {
    const routePath = `/experience/${c.slug}`;
    const first = c.docs[0];
    const role = first.roles?.[0]?.role_title ?? first.position ?? "";
    const description = truncate(
      stripHtml(first.description || first.roles?.[0]?.description || "") ||
        `${role ? `${role} at ` : ""}${c.name}. Saad Mazhar's work experience.`,
      160,
    );
    const bodyHtml = [experienceHtml(c.docs), '<p><a href="/experience">All experience</a></p>'].join("\n");
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title: `${c.name}${role ? `: ${role}` : ""}`,
        description,
        schemas: [
          {
            "@context": "https://schema.org",
            "@type": "OrganizationRole",
            roleName: role || undefined,
            member: author,
            memberOf: { "@type": "Organization", name: c.name },
          },
        ],
        bodyHtml,
        noIndex: isCompanyIndexable(c) ? false : "follow",
        og: { eyebrow: "Experience", title: c.name, meta: joinMeta(role, expPeriod(first)) },
      }),
    );
  }
}

function prerenderCertificates(shell, certificates) {
  for (const c of certificates) {
    const routePath = `/certifications/${keyOf(c)}`;
    const description = truncate(
      c.description ||
        `${c.title}, issued by ${c.issuer}${c.issue_date ? ` in ${dateLabel(c.issue_date)}` : ""}. Earned by Saad Mazhar.`,
      160,
    );
    const schema = {
      "@context": "https://schema.org",
      "@type": "EducationalOccupationalCredential",
      name: c.title,
      description: c.description,
      credentialCategory: c.type || "certificate",
      recognizedBy: { "@type": "Organization", name: c.issuer },
      dateCreated: c.issue_date,
      ...(c.credential_url ? { url: c.credential_url } : {}),
      about: author,
    };
    const bodyHtml = [
      `<p>${escape(joinMeta(c.issuer, c.platform !== c.issuer && c.platform, dateLabel(c.issue_date), c.category))}</p>`,
      paras(c.description),
      c.skills?.length && `<p>Skills: ${escape(c.skills.join(", "))}</p>`,
      c.credential_url && `<p><a href="${escape(c.credential_url)}">Verify credential</a></p>`,
      '<p><a href="/certifications">All certifications</a></p>',
    ]
      .filter(Boolean)
      .join("\n");
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title: c.title,
        description,
        schemas: [schema],
        bodyHtml,
        // Thin, near-identical pages: kept out of the index so search engines spend their
        // attention on the articles and main pages. Links on them are still followed.
        noIndex: "follow",
        og: {
          eyebrow: "Certification",
          title: c.title,
          meta: joinMeta(c.issuer, c.platform !== c.issuer && c.platform, dateLabel(c.issue_date)),
        },
      }),
    );
  }
}

// ── Social cards ─────────────────────────────────────────────────────────

/** Draws every queued card. Photos (event/blog/project covers) are fetched first; on any failure the card falls back to type only. */
async function renderCards() {
  const started = Date.now();
  let failed = 0;
  for (const { file, spec } of OG_JOBS) {
    const { photo, figure, visual, ...rest } = spec;
    const src = photo ? await loadPhoto(photo) : null;
    const chosen =
      visual ?? (src ? { kind: "photo", src } : figure ? { kind: "figure", text: figure } : undefined);
    try {
      const png = await renderOg({ ...rest, visual: chosen });
      mkdirSync(dirname(join(DIST_DIR, file)), { recursive: true });
      writeFileSync(join(DIST_DIR, file), png);
    } catch (err) {
      failed++;
      console.warn(`⚠️  Card failed for ${file}: ${err.message}`);
    }
  }
  console.log(
    `✅ Social cards rendered: ${OG_JOBS.length - failed}/${OG_JOBS.length} in ${Math.round((Date.now() - started) / 1000)}s.`,
  );
}

// ── Sitemaps ─────────────────────────────────────────────────────────────

/**
 * `lastmod` only when it's a real content date: stamping every URL with the
 * build date teaches Google to ignore lastmod for the whole site. No
 * changefreq/priority: Google ignores both.
 * `images`: photo URLs on the page, listed for Google Images (image sitemap extension).
 */
function urlEntry(loc, lastmod, images = []) {
  const imageTags = [...new Set(images.filter(Boolean))]
    .map((src) => `\n    <image:image>\n      <image:loc>${escape(src)}</image:loc>\n    </image:image>`)
    .join("");
  const mod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>\n    <loc>${escape(loc)}</loc>${mod}${imageTags}\n  </url>`;
}

/** YYYY-MM-DD for a Firestore timestamp / date-ish value, or null when unknown. */
function toDateString(value) {
  const raw = value?.toDate ? value.toDate() : value;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Newest real date in a list (null when none are known). */
const newest = (dates) => dates.filter(Boolean).sort().pop() ?? null;

const buildUrlset = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join("\n")}\n</urlset>\n`;

/** Always submitted; the rest only once they have content (an empty page isn't worth Google's time). */
const ALWAYS_INDEXED_ROUTES = ["/", "/about", "/experience", "/skills", "/certifications", "/contact"];

function writeSitemaps(data) {
  mkdirSync(join(DIST_DIR, "sitemaps"), { recursive: true });

  const main = [...ALWAYS_INDEXED_ROUTES];
  if (data.newsletters.length) main.push("/newsletters");
  if (data.publications.length) main.push("/publications");
  if (data.education.length) main.push("/education");
  for (const c of experienceCompanies(data.experience))
    if (isCompanyIndexable(c)) main.push(`/experience/${c.slug}`);
  // /languages is noindex (see thinStaticRoute), so it isn't submitted.
  // Only projects whose pages are indexable (see src/lib/indexing.js).
  const projects = data.projects.filter(isProjectIndexable);
  const projectDates = projects.map((p) => toDateString(p.updated_at));
  // Only events whose pages are indexable (see src/lib/indexing.js).
  const events = data.events.filter(isEventIndexable);
  const eventDates = events.map((e) => toDateString(e.updated_at));
  const files = {
    // Static pages have no reliable "last changed" date, so no lastmod.
    "main.xml": main.map((p) => urlEntry(p === "/" ? BASE_URL : `${BASE_URL}${p}`, null)),
    "projects.xml": [
      urlEntry(`${BASE_URL}/projects`, newest(projectDates)),
      ...projects.map((p, i) =>
        urlEntry(`${BASE_URL}/projects/${p.slug}`, projectDates[i], [
          ...new Set(
            [p.heroImage, p.architecture?.diagramUrl, ...projectGallery(p).map((g) => g.url)].filter(Boolean),
          ),
        ]),
      ),
    ],
  };
  // blog.xml is served live by api/feed.ts (vercel.json rewrite), so it
  // follows publishing without a rebuild. It's only listed in the index here;
  // writing a static file would shadow the rewrite.
  const dynamic = ["blog.xml"];
  if (events.length)
    files["events.xml"] = [
      urlEntry(`${BASE_URL}/events`, newest(eventDates)),
      ...events.map((e, i) => urlEntry(`${BASE_URL}/events/${keyOf(e)}`, eventDates[i], eventPhotos(e))),
    ];
  // Certificate detail pages are noindex (see prerenderCertificates), so they're
  // not listed; /certifications itself is in main.xml.
  if (!projects.length) delete files["projects.xml"];

  for (const [name, entries] of Object.entries(files))
    writeFileSync(join(DIST_DIR, "sitemaps", name), buildUrlset(entries), "utf-8");
  const fileDates = { "projects.xml": newest(projectDates), "events.xml": newest(eventDates) };
  const index = [...Object.keys(files), ...dynamic]
    .map((f) => {
      const mod = fileDates[f] ? `\n    <lastmod>${fileDates[f]}</lastmod>` : "";
      return `  <sitemap>\n    <loc>${BASE_URL}/sitemaps/${f}</loc>${mod}\n  </sitemap>`;
    })
    .join("\n");
  writeFileSync(
    join(DIST_DIR, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${index}\n</sitemapindex>\n`,
    "utf-8",
  );
  const urls = Object.values(files).reduce((n, e) => n + e.length, 0);
  console.log(
    `✅ sitemap.xml + ${Object.keys(files).length} sitemaps (${urls} URLs; ${data.events.length - events.length} thin events left out).`,
  );
}

// ── llms-full.txt: the whole site as plain text, for AI tools ───────────

function writeLlmsFull(data) {
  const md = [];
  const h = (t) => md.push("", `## ${t}`, "");
  const item = (s) => s && md.push(`- ${s}`);
  md.push(
    `# ${SITE_NAME}`,
    "",
    `> ${BIO}`,
    "",
    `Everything published on ${BASE_URL}, as plain text. Each section links to its canonical page. Generated at build time from the same data the site renders.`,
  );
  if (data.experience.length) {
    h("Work experience");
    for (const x of data.experience)
      item(
        joinMeta(
          companyOf(x),
          x.roles
            ?.map((r) => r.role_title)
            .filter(Boolean)
            .join(", "),
          expPeriod(x),
        ),
      );
  }
  if (data.education.length) {
    h(`Education (${BASE_URL}/education)`);
    for (const e of data.education) {
      md.push(
        "",
        `### ${programOf(e) || schoolOf(e)}`,
        joinMeta(
          programOf(e) && schoolOf(e),
          eduPeriod(e),
          e.show_grade_publicly && e.grade && `Grade: ${e.grade}`,
        ),
      );
      if (e.description) md.push("", e.description.trim());
      if (e.activities_and_societies)
        md.push(
          "",
          "Activities and societies:",
          ...e.activities_and_societies
            .split("\n")
            .filter(Boolean)
            .map((l) => `- ${l}`),
        );
      if (e.honors_and_awards?.length)
        md.push(
          "",
          "Honours:",
          ...e.honors_and_awards.map(
            (a) => `- ${joinMeta(a.award_title, a.award_issuer, a.award_date_year)}`,
          ),
        );
    }
  }
  if (data.events.length) {
    h(`Speaking, hosting and events (${BASE_URL}/events)`);
    for (const e of data.events)
      item(
        `[${e.title}](${BASE_URL}/events/${keyOf(e)}): ${joinMeta(e.role, dateLabel(e.date), e.location, e.organizer)}. ${e.description ?? ""}`.trim(),
      );
  }
  if (data.awards.length) {
    h(`Awards and honours (${BASE_URL}/about#awards)`);
    for (const a of data.awards)
      item(`${joinMeta(a.title, a.issuer, dateLabel(a.date))}${a.description ? `. ${a.description}` : ""}`);
  }
  if (data.volunteer.length) {
    h(`Volunteering (${BASE_URL}/about#volunteer)`);
    for (const v of data.volunteer)
      item(
        `${joinMeta(`${v.role}, ${v.organization}`, volPeriod(v))}${v.description ? `. ${v.description.replace(/\s*\n+\s*/g, " ")}` : ""}`,
      );
  }
  if (data.projects.length) {
    h(`Projects (${BASE_URL}/projects)`);
    for (const p of data.projects)
      item(`[${p.title}](${BASE_URL}/projects/${p.slug})${p.tagline ? `: ${p.tagline}` : ""}`);
  }
  if (data.skills.length) {
    h(`Skills (${BASE_URL}/skills)`);
    for (const g of data.skills)
      item(
        `${g.category}: ${g.skills
          .map((s) => {
            const href = skillLink(s);
            return `${href ? `[${s.name}](${href})` : s.name} (${skillMeta(s)})`;
          })
          .join(", ")}`,
      );
  }
  if (data.languages.length) {
    h(`Languages (${BASE_URL}/languages)`);
    for (const l of data.languages) item(joinMeta(l.name, l.level));
  }
  if (data.certificates.length) {
    h(`Certifications (${BASE_URL}/certifications)`);
    for (const c of data.certificates)
      item(
        `[${c.title}](${BASE_URL}/certifications/${keyOf(c)}): ${joinMeta(c.issuer, dateLabel(c.issue_date))}`,
      );
  }
  if (data.posts.length) {
    h(`Writing (${BASE_URL}/blog)`);
    for (const p of data.posts)
      md.push(
        "",
        `### [${p.title}](${BASE_URL}/blog/${p.slug})`,
        joinMeta(dateLabel(p.date), p.category),
        "",
        stripHtml(p.content),
      );
  }
  h("Contact");
  item(`Email: hello@saadmaz.com`);
  item(`Location: Colombo, Sri Lanka`);
  for (const u of PERSON_SCHEMA.sameAs) item(u);
  writeFileSync(join(DIST_DIR, "llms-full.txt"), `${md.join("\n")}\n`, "utf-8");
  console.log(`✅ llms-full.txt written (${md.length} lines).`);
}

// ── Entry point ──────────────────────────────────────────────────────────

async function main() {
  // Read once, before anything writes to dist/index.html, so every route
  // starts from the same pristine, JS-only shell.
  const shell = readFileSync(join(DIST_DIR, "index.html"), "utf-8");
  const data = await loadData();

  prerenderStaticRoutes(shell, data);
  prerenderProjects(shell, data.projects);
  prerenderPosts(shell, data.posts, data);
  prerenderPosts(shell, data.unlistedPosts, data, { noIndex: true });
  prerenderBlogIndexes(shell, data);
  prerenderEvents(shell, data.events);
  prerenderCertificates(shell, data.certificates);
  prerenderExperience(shell, data.experience);
  console.log(
    `✅ Detail pages prerendered: ${data.projects.length} projects, ${data.posts.length} posts, ${data.events.length} events, ${data.certificates.length} certificates.`,
  );
  writeSitemaps(data);
  writeRedirects(data);
  writeNotFound(shell);
  writeFileSync(join(DIST_DIR, "routes.json"), JSON.stringify([...ROUTES].sort()), "utf-8");
  console.log(`✅ routes.json (${ROUTES.size} pages)`);
  writeLlmsFull(data);
  await renderCards();
  await submitChangedUrls(CONTENT_HASHES, { baseUrl: BASE_URL });
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
