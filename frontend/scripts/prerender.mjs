/**
 * prerender.mjs
 * ─────────────────────────────────────────────────────────────
 * Generates per-route static HTML so search engines and any other
 * client that doesn't run JavaScript see a real <title>, meta
 * description, canonical link, an H1, actual body text, on-page links,
 * and JSON-LD structured data - not an empty shell.
 *
 * This used to try full Puppeteer rendering first, with a plain
 * meta-tags-only fallback if that failed. Puppeteer never reliably
 * launches inside Vercel's build container (no system Chrome, missing
 * shared libraries), so that path always silently fell back - every
 * deployed page shipped with 0 words, no H1, and no structured data.
 * This version only ever does the reliable thing: plain string
 * templating that produces identical output on every platform.
 *
 * Title/description text lives in ../src/lib/seo-content.js, the same
 * file each page's <SEO> component imports, so the two can't drift
 * apart the way the old hardcoded ROUTES array here used to.
 */

import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { PAGE_SEO, PERSON_SCHEMA, NAV_LINKS, SITE_NAME, BASE_URL } from "../src/lib/seo-content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");

// ── HTML helpers ─────────────────────────────────────────────────────────

/** Safe in both text nodes and double-quoted attribute values. */
function escape(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function navHtml(currentPath) {
  const links = NAV_LINKS.map(
    (l) =>
      `    <a href="${l.path}"${l.path === currentPath ? ' aria-current="page"' : ""}>${escape(l.label)}</a>`,
  ).join("\n");
  return `<nav aria-label="Primary">\n${links}\n</nav>`;
}

function schemasForRoute(routePath, title) {
  if (routePath === "/") return [PERSON_SCHEMA];
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: `${BASE_URL}${routePath}`,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
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
 * `routePath`: correct title/canonical/meta/OG/Twitter tags (as before),
 * plus actual content inside <div id="root"> - an H1, a short paragraph,
 * on-page links, and JSON-LD. A normal client-side mount (src/app/main.tsx)
 * replaces this instantly for real visitors; it's here for crawlers and
 * anything else that reads the page without executing JavaScript.
 */
function injectContent(shell, { path: routePath, title, description, schemas, extraBodyHtml = "" }) {
  const canonicalUrl = routePath === "/" ? BASE_URL : `${BASE_URL}${routePath}`;
  const fullTitle = `${title} - ${SITE_NAME}`;
  const et = escape(fullTitle);
  const ed = escape(description);
  const eu = escape(canonicalUrl);

  let html = shell.replace(/<title>[\s\S]*?<\/title>/, `<title>${et}</title>`);

  if (/<link\s[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link\s[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${eu}" />`);
  } else {
    html = html.replace("</head>", `  <link rel="canonical" href="${eu}" />\n</head>`);
  }

  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${ed}$2`);
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${et}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${ed}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${eu}$2`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i, `$1${et}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i, `$1${ed}$2`);

  const schemaScripts = (schemas || [])
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join("\n");

  const bodyContent = [
    `<h1>${escape(title)}</h1>`,
    `<p>${escape(description)}</p>`,
    extraBodyHtml,
    navHtml(routePath),
    schemaScripts,
  ]
    .filter(Boolean)
    .join("\n");

  // data-prerendered: index.html hides this unstyled crawler copy from
  // visitors until React mounts and replaces it (no flash of plain text).
  html = html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root"><div data-prerendered>${bodyContent}</div></div>`,
  );

  return html;
}

function writeRoute(routePath, html) {
  const routeDir = routePath === "/" ? DIST_DIR : join(DIST_DIR, routePath);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, "index.html"), html, "utf-8");
}

// ── Static routes, from seo-content.js ──────────────────────────────────

function prerenderStaticRoutes(shell) {
  let count = 0;
  for (const [routePath, { title, description }] of Object.entries(PAGE_SEO)) {
    const html = injectContent(shell, {
      path: routePath,
      title,
      description,
      schemas: schemasForRoute(routePath, title),
    });
    writeRoute(routePath, html);
    count++;
  }
  console.log(`✅ Static routes prerendered: ${count}`);
}

// ── Dynamic routes, from Firestore ──────────────────────────────────────

async function prerenderDynamicRoutes(shell) {
  const hasCreds =
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;
  if (!hasCreds) {
    console.warn("⚠️  Firebase Admin credentials not set - skipping project/blog detail-page prerendering.");
    return { projects: [], posts: [], hasEducation: false, hasEvents: false, hasPublications: false };
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

  // `published` defaults to true for legacy docs predating the field (see
  // useProjects.ts's isPublished) - only an explicit `false` hides a project
  // from crawlers and the sitemap the way the admin toggle promises.
  const projectsSnap = await db.collection("projects").get();
  const projects = projectsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.slug && p.published !== false);

  for (const project of projects) {
    const routePath = `/projects/${project.slug}`;
    const title = `${project.title} | Project`;
    const description = project.tagline
      ? `${project.tagline}${project.technologies?.length ? ` Built with ${project.technologies.slice(0, 3).join(", ")}.` : ""} Case study by Saad Mazhar, full-stack developer in Colombo, Sri Lanka.`
      : project.overview
        ? `${project.overview.slice(0, 140)} - case study by Saad Mazhar, full-stack developer in Sri Lanka.`
        : `${project.title} - a software project by Saad Mazhar, full-stack developer in Sri Lanka.`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: project.title,
      description: project.tagline || project.overview,
      url: project.liveUrl || `${BASE_URL}${routePath}`,
      image: project.heroImage,
      applicationCategory: project.category || "WebApplication",
      operatingSystem: "Web",
      author: { "@type": "Person", name: "Saad Mazhar", url: BASE_URL },
      keywords: project.technologies?.join(", "),
    };
    const html = injectContent(shell, {
      path: routePath,
      title,
      description,
      schemas: [schema],
      extraBodyHtml: '<a href="/projects">Back to projects</a>',
    });
    writeRoute(routePath, html);
  }

  // Blog posts: published only, matching BlogService.getPublished().
  const postsSnap = await db.collection("blog_posts").where("published", "==", true).get();
  const posts = postsSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.slug);

  for (const post of posts) {
    const routePath = `/blog/${post.slug}`;
    const description =
      post.excerpt ||
      `Read "${post.title}" by ${post.author} on Saad Mazhar's blog - AI, startups, and full-stack development from Colombo, Sri Lanka.`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: post.image,
      author: { "@type": "Person", name: post.author, url: BASE_URL },
      publisher: { "@type": "Person", name: "Saad Mazhar", url: BASE_URL },
      datePublished: post.date,
      url: `${BASE_URL}${routePath}`,
      keywords: post.tags?.join(", "),
    };
    const html = injectContent(shell, {
      path: routePath,
      title: post.title,
      description,
      schemas: [schema],
      extraBodyHtml: '<a href="/blog">Back to blog</a>',
    });
    writeRoute(routePath, html);
  }

  // Collections with no per-item detail page - only their existence (not
  // their content) matters here, to decide whether /events, /publications
  // etc. belong in the sitemap. A page nobody has published anything to
  // yet is real but empty; submitting it to Google just to have Google see
  // an empty state is the sitemap.xml half of the "don't ship empty
  // sections" problem, so it's left out until it has something in it.
  const [eventsSnap, publicationsSnap, educationSnap] = await Promise.all([
    db.collection("events").limit(1).get(),
    db.collection("publications").limit(1).get(),
    db.collection("education").limit(1).get(),
  ]);

  console.log(`✅ Dynamic routes prerendered: ${projects.length} projects, ${posts.length} blog posts.`);
  return {
    projects,
    posts,
    hasEvents: !eventsSnap.empty,
    hasPublications: !publicationsSnap.empty,
    hasEducation: !educationSnap.empty,
  };
}

// ── Sitemaps, regenerated at every build from the same data the pages use,
// so they can never drift into the stale/empty state a hand-maintained
// static sitemap eventually does ─────────────────────────────────────────

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${escape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function toDateString(value) {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

function buildUrlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

/** Static routes always worth submitting - always have real content regardless of Firestore state. */
const ALWAYS_INDEXED_ROUTES = ["/", "/about", "/experience", "/skills", "/certifications", "/contact"];

function writeSitemaps({ projects, posts, hasEvents, hasPublications, hasEducation }) {
  const today = toDateString();
  mkdirSync(join(DIST_DIR, "sitemaps"), { recursive: true });

  const mainRoutes = [...ALWAYS_INDEXED_ROUTES, "/newsletters"];
  if (hasPublications) mainRoutes.push("/publications");
  if (hasEducation) mainRoutes.push("/education");
  if (hasEvents) mainRoutes.push("/events");
  const mainXml = buildUrlset(
    mainRoutes.map((path) =>
      urlEntry(
        path === "/" ? BASE_URL : `${BASE_URL}${path}`,
        today,
        path === "/" ? "weekly" : "monthly",
        path === "/" ? "1.0" : "0.7",
      ),
    ),
  );

  const projectsXml = buildUrlset([
    urlEntry(`${BASE_URL}/projects`, today, "weekly", "0.9"),
    ...projects.map((p) =>
      urlEntry(`${BASE_URL}/projects/${p.slug}`, toDateString(p.updated_at), "monthly", "0.8"),
    ),
  ]);

  const blogXml = buildUrlset([
    urlEntry(`${BASE_URL}/blog`, today, "weekly", "0.9"),
    ...posts.map((p) => urlEntry(`${BASE_URL}/blog/${p.slug}`, toDateString(p.date), "monthly", "0.8")),
  ]);

  writeFileSync(join(DIST_DIR, "sitemaps", "main.xml"), mainXml, "utf-8");
  writeFileSync(join(DIST_DIR, "sitemaps", "projects.xml"), projectsXml, "utf-8");
  writeFileSync(join(DIST_DIR, "sitemaps", "blog.xml"), blogXml, "utf-8");

  // No events.xml/media.xml: events has no published items to list yet, and
  // the old media.xml wasn't a valid image sitemap - it just repeated a
  // page URL. Re-add each once there's something real to put in it.
  const indexEntries = ["main.xml", "projects.xml", "blog.xml"].map(
    (f) =>
      `  <sitemap>\n    <loc>${BASE_URL}/sitemaps/${f}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`,
  );
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexEntries.join("\n")}\n</sitemapindex>\n`;
  writeFileSync(join(DIST_DIR, "sitemap.xml"), sitemapIndex, "utf-8");

  console.log("✅ sitemap.xml + sitemaps/{main,projects,blog}.xml regenerated from Firestore data.");
}

// ── Entry point ────────────────────────────────────────────────────────

async function main() {
  // Read once, before anything writes to dist/index.html, so every route
  // starts from the same pristine, JS-only shell.
  const shell = readFileSync(join(DIST_DIR, "index.html"), "utf-8");

  prerenderStaticRoutes(shell);
  const dynamic = await prerenderDynamicRoutes(shell);
  writeSitemaps(dynamic);
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
