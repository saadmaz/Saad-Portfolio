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
import { PAGE_SEO, PERSON_SCHEMA, NAV_LINKS, SITE_NAME, BASE_URL } from "../src/lib/seo-content.js";
import { eventPhotos, eventPhotoAlt } from "../src/lib/imageAlt.js";
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
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
      about: { "@type": "Person", name: SITE_NAME, url: BASE_URL },
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

function injectContent(shell, { path: routePath, title, description, schemas, bodyHtml = "", og }) {
  const canonicalUrl = routePath === "/" ? BASE_URL : `${BASE_URL}${routePath}`;
  const fullTitle = `${title} - ${SITE_NAME}`;
  const et = escape(fullTitle);
  const ed = escape(truncate(description, 300));
  const eu = escape(canonicalUrl);
  const meta = (re, value) => (html) => html.replace(re, (_, a, b) => `${a}${value}${b}`);

  let html = shell.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${et}</title>`);
  html = /<link\s[^>]*rel=["']canonical["'][^>]*>/i.test(html)
    ? html.replace(/<link\s[^>]*rel=["']canonical["'][^>]*>/i, () => `<link rel="canonical" href="${eu}" />`)
    : html.replace("</head>", () => `  <link rel="canonical" href="${eu}" />\n</head>`);

  for (const apply of [
    meta(/(<meta\s+name="description"\s+content=")[^"]*(")/i, ed),
    meta(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, et),
    meta(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, ed),
    meta(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, eu),
    meta(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i, et),
    meta(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i, ed),
  ])
    html = apply(html);
  // Every page gets its own 1200×630 card as og:image / twitter:image.
  OG_JOBS.push({ file: ogFile(routePath), spec: { title, ...og } });
  const card = escape(`${BASE_URL}/${ogFile(routePath)}?v=${OG_VERSION}`);
  for (const apply of [
    meta(/(<meta\s+property="og:image"\s+content=")[^"]*(")/i, card),
    meta(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/i, card),
    meta(/(<meta\s+property="og:image:width"\s+content=")[^"]*(")/i, String(OG_WIDTH)),
    meta(/(<meta\s+property="og:image:height"\s+content=")[^"]*(")/i, String(OG_HEIGHT)),
    meta(/(<meta\s+property="og:image:alt"\s+content=")[^"]*(")/i, et),
    meta(/(<meta\s+name="twitter:card"\s+content=")[^"]*(")/i, "summary_large_image"),
  ])
    html = apply(html);

  const schemaScripts = (schemas || [])
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, "\\u003c")}</script>`)
    .join("\n");

  const content = [
    `<header>\n<h1>${escape(title)}</h1>\n<p>${escape(description)}</p>\n</header>`,
    bodyHtml && `<main>\n${bodyHtml}\n</main>`,
    navHtml(routePath),
    schemaScripts,
  ]
    .filter(Boolean)
    .join("\n");

  // data-prerendered: index.html hides this unstyled crawler copy from
  // visitors until React mounts and replaces it (no flash of plain text).
  return html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    () => `<div id="root"><div data-prerendered>${content}</div></div>`,
  );
}

function writeRoute(routePath, html) {
  const routeDir = routePath === "/" ? DIST_DIR : join(DIST_DIR, routePath);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, "index.html"), html, "utf-8");
}

// ── Data ─────────────────────────────────────────────────────────────────

const EMPTY = {
  projects: [],
  posts: [],
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
  ]);

  return {
    // `published` defaults to true for legacy projects predating the field;
    // blog posts must be explicitly published (matches BlogService.getPublished()).
    projects: projects
      .filter((p) => p.slug && p.published !== false)
      .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999)),
    posts: posts.filter((p) => p.slug && p.published === true).sort(byDateDesc("date")),
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
    skills: skills.filter((g) => g.skills?.length),
    awards: awards.sort(byDateDesc("date")),
    volunteer: volunteer.sort(byDateDesc("startDate")),
    languages,
    publications: publications.sort(byDateDesc("date")),
    newsletters: newsletters.sort(byDateDesc("date")),
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
        `<h2>${escape(companyOf(x))}</h2>`,
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
        paras(x.achievements),
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

function skillsHtml(skills) {
  return skills
    .map((g) => `<h2>${escape(g.category)}</h2>\n${list(g.skills, (s) => escape(joinMeta(s.name, s.level)))}`)
    .join("\n");
}

const section = (title, body) => (body ? `<section>\n<h2>${escape(title)}</h2>\n${body}\n</section>` : "");

/** Person JSON-LD enriched with what the site actually knows, so AI and search engines can connect the facts. */
function personSchema(data) {
  const schema = { ...PERSON_SCHEMA, description: PAGE_SEO["/"].description };
  if (data.education.length)
    schema.alumniOf = data.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: schoolOf(e),
      ...(e.school_website_url ? { url: e.school_website_url } : {}),
    }));
  if (data.awards.length) schema.award = data.awards.map((a) => joinMeta(a.title, a.issuer));
  const skills = data.skills.flatMap((g) => g.skills.map((s) => s.name));
  if (skills.length) schema.knowsAbout = [...new Set(skills)].slice(0, 40);
  if (data.languages.length) schema.knowsLanguage = data.languages.map((l) => l.name);
  return schema;
}

// ── Static routes ────────────────────────────────────────────────────────

function staticBody(routePath, data) {
  const recentEvents = data.events.slice(0, 6);
  switch (routePath) {
    case "/":
      return [
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
      return `<p>Email: <a href="mailto:hello@saadmaz.com">hello@saadmaz.com</a></p>\n<p>Based in Colombo, Sri Lanka.</p>\n${list(PERSON_SCHEMA.sameAs, (u) => `<a href="${escape(u)}">${escape(u)}</a>`)}`;
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

function prerenderStaticRoutes(shell, data) {
  const person = personSchema(data);
  for (const [routePath, { title, description }] of Object.entries(PAGE_SEO)) {
    const schemas =
      routePath === "/"
        ? [person]
        : routePath === "/about"
          ? [person, ...pageSchemas(routePath, title)]
          : pageSchemas(routePath, title);
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title,
        description,
        schemas,
        bodyHtml: staticBody(routePath, data),
        og: staticCard(routePath, data),
      }),
    );
  }
  console.log(`✅ Static routes prerendered: ${Object.keys(PAGE_SEO).length}`);
}

// ── Detail routes ────────────────────────────────────────────────────────

const author = { "@type": "Person", name: SITE_NAME, url: BASE_URL };

function prerenderProjects(shell, projects) {
  for (const p of projects) {
    const routePath = `/projects/${p.slug}`;
    const tech = p.technologies ?? p.techStack ?? [];
    const description = p.tagline
      ? `${p.tagline}${tech.length ? ` Built with ${tech.slice(0, 3).join(", ")}.` : ""} Case study by Saad Mazhar.`
      : truncate(p.overview || `${p.title} - a software project by Saad Mazhar.`, 160);
    const shots = (p.screenshots ?? []).filter((src) => src && src !== p.heroImage);
    const bodyHtml = [
      p.heroImage && img(p.heroImage, p.altText || `${p.title}, a project by ${SITE_NAME}`),
      paras(p.overview),
      paras(p.description),
      paras(p.long_description),
      tech.length && `<p>Built with: ${escape(tech.join(", "))}</p>`,
      p.liveUrl && `<p><a href="${escape(p.liveUrl)}">Live site</a></p>`,
      shots.length &&
        `<h2>Screenshots</h2>\n${shots.map((src, i) => img(src, `${p.title} screenshot ${i + 1}`)).join("\n")}`,
      '<p><a href="/projects">All projects</a></p>',
    ]
      .filter(Boolean)
      .join("\n");
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: p.title,
      description: p.tagline || p.overview,
      url: p.liveUrl || `${BASE_URL}${routePath}`,
      image: p.heroImage,
      applicationCategory: p.category || "WebApplication",
      operatingSystem: "Web",
      author,
      keywords: tech.join(", "),
    };
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title: `${p.title} | Project`,
        description,
        schemas: [schema],
        bodyHtml,
        og: {
          eyebrow: "Project",
          title: p.title,
          meta: joinMeta(p.role, p.date && dateLabel(p.date), tech.slice(0, 3).join(", ")),
          photo: p.heroImage,
        },
      }),
    );
  }
}

function prerenderPosts(shell, posts) {
  for (const p of posts) {
    const routePath = `/blog/${p.slug}`;
    const description = p.metaDescription || p.excerpt || `"${p.title}" by ${p.author || SITE_NAME}.`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description,
      image: p.image,
      author: { "@type": "Person", name: p.author || SITE_NAME, url: BASE_URL },
      publisher: author,
      datePublished: p.publishedAt || p.date,
      dateModified: p.lastUpdatedAt || p.date,
      mainEntityOfPage: `${BASE_URL}${routePath}`,
      keywords: p.keywords || p.tags?.join(", "),
      articleSection: p.category,
    };
    // The full article, not just the excerpt: it's the content worth indexing.
    const bodyHtml = `<article>\n<p>${escape(joinMeta(p.author, dateLabel(p.date), p.category))}</p>\n${p.image ? `${img(p.image, p.title)}\n` : ""}${p.content ?? ""}\n</article>\n<p><a href="/blog">All writing</a></p>`;
    writeRoute(
      routePath,
      injectContent(shell, {
        path: routePath,
        title: p.title,
        description,
        schemas: [schema],
        bodyHtml,
        og: {
          eyebrow: "Writing",
          title: p.title,
          meta: joinMeta(
            p.category,
            dateLabel(p.date),
            `${Math.max(1, Math.round(stripHtml(p.content).split(" ").length / 220))} min read`,
          ),
          photo: p.image,
        },
      }),
    );
  }
}

function prerenderEvents(shell, events) {
  for (const e of events) {
    const routePath = `/events/${keyOf(e)}`;
    const cover = e.image || e.images?.[0];
    const photos = eventPhotos(e);
    const description = truncate(
      e.description || `${e.role ?? "Participant"} at ${e.title}, ${e.organizer}.`,
      160,
    );
    const schema = {
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
      ...(photos.length ? { image: photos.map((src) => imageObject(src, eventPhotoAlt(e, src))) } : {}),
    };
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
        schemas: [schema],
        bodyHtml,
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

/** `images`: photo URLs on the page, listed for Google Images (image sitemap extension). */
function urlEntry(loc, lastmod, changefreq, priority, images = []) {
  const imageTags = [...new Set(images.filter(Boolean))]
    .map((src) => `\n    <image:image>\n      <image:loc>${escape(src)}</image:loc>\n    </image:image>`)
    .join("");
  return `  <url>\n    <loc>${escape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${imageTags}\n  </url>`;
}

function toDateString(value) {
  const raw = value?.toDate ? value.toDate() : value;
  const d = raw ? new Date(raw) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

const buildUrlset = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join("\n")}\n</urlset>\n`;

/** Always submitted; the rest only once they have content (an empty page isn't worth Google's time). */
const ALWAYS_INDEXED_ROUTES = ["/", "/about", "/experience", "/skills", "/certifications", "/contact"];

function writeSitemaps(data) {
  const today = toDateString();
  mkdirSync(join(DIST_DIR, "sitemaps"), { recursive: true });

  const main = [...ALWAYS_INDEXED_ROUTES];
  if (data.newsletters.length) main.push("/newsletters");
  if (data.publications.length) main.push("/publications");
  if (data.education.length) main.push("/education");
  if (data.languages.length) main.push("/languages");
  const files = {
    "main.xml": main.map((p) =>
      urlEntry(
        p === "/" ? BASE_URL : `${BASE_URL}${p}`,
        today,
        p === "/" ? "weekly" : "monthly",
        p === "/" ? "1.0" : "0.7",
      ),
    ),
    "projects.xml": [
      urlEntry(`${BASE_URL}/projects`, today, "weekly", "0.9"),
      ...data.projects.map((p) =>
        urlEntry(`${BASE_URL}/projects/${p.slug}`, toDateString(p.updated_at), "monthly", "0.8", [
          p.heroImage,
          ...(p.screenshots ?? []),
        ]),
      ),
    ],
    "blog.xml": [
      urlEntry(`${BASE_URL}/blog`, today, "weekly", "0.9"),
      ...data.posts.map((p) =>
        urlEntry(`${BASE_URL}/blog/${p.slug}`, toDateString(p.lastUpdatedAt || p.date), "monthly", "0.8", [
          p.image,
        ]),
      ),
    ],
  };
  if (data.events.length)
    files["events.xml"] = [
      urlEntry(`${BASE_URL}/events`, today, "weekly", "0.8"),
      ...data.events.map((e) =>
        urlEntry(
          `${BASE_URL}/events/${keyOf(e)}`,
          toDateString(e.updated_at),
          "yearly",
          "0.6",
          eventPhotos(e),
        ),
      ),
    ];
  if (data.certificates.length)
    files["certifications.xml"] = data.certificates.map((c) =>
      urlEntry(`${BASE_URL}/certifications/${keyOf(c)}`, toDateString(c.updated_at), "yearly", "0.5"),
    );

  for (const [name, entries] of Object.entries(files))
    writeFileSync(join(DIST_DIR, "sitemaps", name), buildUrlset(entries), "utf-8");
  const index = Object.keys(files)
    .map(
      (f) =>
        `  <sitemap>\n    <loc>${BASE_URL}/sitemaps/${f}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`,
    )
    .join("\n");
  writeFileSync(
    join(DIST_DIR, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${index}\n</sitemapindex>\n`,
    "utf-8",
  );
  const urls = Object.values(files).reduce((n, e) => n + e.length, 0);
  console.log(`✅ sitemap.xml + ${Object.keys(files).length} sitemaps (${urls} URLs) regenerated.`);
}

// ── llms-full.txt: the whole site as plain text, for AI tools ───────────

function writeLlmsFull(data) {
  const md = [];
  const h = (t) => md.push("", `## ${t}`, "");
  const item = (s) => s && md.push(`- ${s}`);
  md.push(
    `# ${SITE_NAME}`,
    "",
    `> ${PAGE_SEO["/"].description}`,
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
    for (const g of data.skills) item(`${g.category}: ${g.skills.map((s) => s.name).join(", ")}`);
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
  prerenderPosts(shell, data.posts);
  prerenderEvents(shell, data.events);
  prerenderCertificates(shell, data.certificates);
  console.log(
    `✅ Detail pages prerendered: ${data.projects.length} projects, ${data.posts.length} posts, ${data.events.length} events, ${data.certificates.length} certificates.`,
  );
  writeSitemaps(data);
  writeLlmsFull(data);
  await renderCards();
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
