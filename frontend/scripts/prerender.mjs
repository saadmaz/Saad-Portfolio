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

import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PAGE_SEO, PERSON_SCHEMA, NAV_LINKS, SITE_NAME, BASE_URL } from '../src/lib/seo-content.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');

// ── HTML helpers ─────────────────────────────────────────────────────────

/** Safe in both text nodes and double-quoted attribute values. */
function escape(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function navHtml(currentPath) {
  const links = NAV_LINKS.map(
    (l) => `    <a href="${l.path}"${l.path === currentPath ? ' aria-current="page"' : ''}>${escape(l.label)}</a>`,
  ).join('\n');
  return `<nav aria-label="Primary">\n${links}\n</nav>`;
}

function schemasForRoute(routePath, title) {
  if (routePath === '/') return [PERSON_SCHEMA];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url: `${BASE_URL}${routePath}`,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: BASE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: title, item: `${BASE_URL}${routePath}` },
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
function injectContent(shell, { path: routePath, title, description, schemas, extraBodyHtml = '' }) {
  const canonicalUrl = routePath === '/' ? BASE_URL : `${BASE_URL}${routePath}`;
  const fullTitle = `${title} - ${SITE_NAME}`;
  const et = escape(fullTitle);
  const ed = escape(description);
  const eu = escape(canonicalUrl);

  let html = shell.replace(/<title>[\s\S]*?<\/title>/, `<title>${et}</title>`);

  if (/<link\s[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link\s[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${eu}" />`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${eu}" />\n</head>`);
  }

  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${ed}$2`);
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${et}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${ed}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${eu}$2`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i, `$1${et}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i, `$1${ed}$2`);

  const schemaScripts = (schemas || [])
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n');

  const bodyContent = [`<h1>${escape(title)}</h1>`, `<p>${escape(description)}</p>`, extraBodyHtml, navHtml(routePath), schemaScripts]
    .filter(Boolean)
    .join('\n');

  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${bodyContent}</div>`);

  return html;
}

function writeRoute(routePath, html) {
  const routeDir = routePath === '/' ? DIST_DIR : join(DIST_DIR, routePath);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, 'index.html'), html, 'utf-8');
}

// ── Static routes, from seo-content.js ──────────────────────────────────

function prerenderStaticRoutes(shell) {
  let count = 0;
  for (const [routePath, { title, description }] of Object.entries(PAGE_SEO)) {
    const html = injectContent(shell, { path: routePath, title, description, schemas: schemasForRoute(routePath, title) });
    writeRoute(routePath, html);
    count++;
  }
  console.log(`✅ Static routes prerendered: ${count}`);
}

// ── Dynamic routes, from Firestore ──────────────────────────────────────

async function prerenderDynamicRoutes(shell) {
  const hasCreds = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;
  if (!hasCreds) {
    console.warn('⚠️  Firebase Admin credentials not set - skipping project/blog detail-page prerendering.');
    return { projects: [], posts: [] };
  }

  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
  const db = getFirestore();

  // Projects have no draft/published flag - ProjectsPage.tsx lists every one.
  const projectsSnap = await db.collection('projects').get();
  const projects = projectsSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.slug);

  for (const project of projects) {
    const routePath = `/projects/${project.slug}`;
    const title = `${project.title} | Project by Saad Mazhar`;
    const description = project.tagline
      ? `${project.tagline}${project.technologies?.length ? ` Built with ${project.technologies.slice(0, 3).join(', ')}.` : ''} Case study by Saad Mazhar, full-stack developer in Colombo, Sri Lanka.`
      : project.overview
        ? `${project.overview.slice(0, 140)} - case study by Saad Mazhar, full-stack developer in Sri Lanka.`
        : `${project.title} - a software project by Saad Mazhar, full-stack developer in Sri Lanka.`;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: project.title,
      description: project.tagline || project.overview,
      url: project.liveUrl || `${BASE_URL}${routePath}`,
      image: project.heroImage,
      applicationCategory: project.category || 'WebApplication',
      operatingSystem: 'Web',
      author: { '@type': 'Person', name: 'Saad Mazhar', url: BASE_URL },
      keywords: project.technologies?.join(', '),
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
  const postsSnap = await db.collection('blog_posts').where('published', '==', true).get();
  const posts = postsSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.slug);

  for (const post of posts) {
    const routePath = `/blog/${post.slug}`;
    const description =
      post.excerpt || `Read "${post.title}" by ${post.author} on Saad Mazhar's blog - AI, startups, and full-stack development from Colombo, Sri Lanka.`;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.image,
      author: { '@type': 'Person', name: post.author, url: BASE_URL },
      publisher: { '@type': 'Person', name: 'Saad Mazhar', url: BASE_URL },
      datePublished: post.date,
      url: `${BASE_URL}${routePath}`,
      keywords: post.tags?.join(', '),
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

  console.log(`✅ Dynamic routes prerendered: ${projects.length} projects, ${posts.length} blog posts.`);
  return { projects, posts };
}

// ── Sitemaps, regenerated from the same data so they can't go stale ─────

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${escape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function toDateString(value) {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

function writeSitemaps({ projects, posts }) {
  const projectsXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntry(
    `${BASE_URL}/projects`,
    toDateString(),
    'weekly',
    '0.9',
  )}\n${projects.map((p) => urlEntry(`${BASE_URL}/projects/${p.slug}`, toDateString(p.updated_at), 'monthly', '0.8')).join('\n')}\n</urlset>\n`;

  const blogXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntry(
    `${BASE_URL}/blog`,
    toDateString(),
    'weekly',
    '0.9',
  )}\n${posts.map((p) => urlEntry(`${BASE_URL}/blog/${p.slug}`, toDateString(p.date), 'monthly', '0.8')).join('\n')}\n</urlset>\n`;

  mkdirSync(join(DIST_DIR, 'sitemaps'), { recursive: true });
  writeFileSync(join(DIST_DIR, 'sitemaps', 'projects.xml'), projectsXml, 'utf-8');
  writeFileSync(join(DIST_DIR, 'sitemaps', 'blog.xml'), blogXml, 'utf-8');
  console.log('✅ sitemaps/projects.xml and sitemaps/blog.xml regenerated from Firestore data.');
}

// ── Entry point ────────────────────────────────────────────────────────

async function main() {
  // Read once, before anything writes to dist/index.html, so every route
  // starts from the same pristine, JS-only shell.
  const shell = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');

  prerenderStaticRoutes(shell);
  const { projects, posts } = await prerenderDynamicRoutes(shell);
  if (projects.length || posts.length) writeSitemaps({ projects, posts });
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
