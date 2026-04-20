/**
 * generate-sitemap.mjs
 * Generates frontend/public/sitemap.xml with both static routes and
 * dynamic Firestore-backed URLs (projects, blogs, events, certifications).
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 *
 * Requires serviceAccountKey.json at the project root.
 * If unavailable, falls back to writing only the static routes.
 *
 * Run as part of the build:
 *   "build": "node scripts/generate-sitemap.mjs && vite build && node scripts/prerender.mjs"
 */

import { createRequire } from 'module';
import { existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require      = createRequire(import.meta.url);
const __dirname    = dirname(fileURLToPath(import.meta.url));
const ROOT         = resolve(__dirname, '..');
const SITEMAP_OUT  = resolve(ROOT, 'frontend', 'public', 'sitemap.xml');
const BASE_URL     = 'https://saadmaz.com';
const TODAY        = new Date().toISOString().split('T')[0];

// ── Static routes ────────────────────────────────────────────────────────────

const STATIC_ROUTES = [
  { path: '/',               changefreq: 'weekly',  priority: '1.0' },
  { path: '/projects',       changefreq: 'weekly',  priority: '0.9' },
  { path: '/blog',           changefreq: 'weekly',  priority: '0.9' },
  { path: '/about',          changefreq: 'monthly', priority: '0.8' },
  { path: '/experience',     changefreq: 'monthly', priority: '0.8' },
  { path: '/contact',        changefreq: 'yearly',  priority: '0.8' },
  { path: '/skills',         changefreq: 'monthly', priority: '0.7' },
  { path: '/certifications', changefreq: 'monthly', priority: '0.7' },
  { path: '/events',         changefreq: 'monthly', priority: '0.7' },
  { path: '/newsletters',    changefreq: 'monthly', priority: '0.6' },
];

// ── XML helpers ──────────────────────────────────────────────────────────────

function urlEntry({ loc, lastmod = TODAY, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function buildSitemap(entries) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(urlEntry),
    '</urlset>',
    '',
  ].join('\n');
}

// ── Firestore fetch ──────────────────────────────────────────────────────────

async function fetchDynamicRoutes() {
  const keyPath = resolve(ROOT, 'serviceAccountKey.json');
  if (!existsSync(keyPath)) {
    console.warn('⚠️  serviceAccountKey.json not found — skipping dynamic routes.');
    return [];
  }

  const admin = require('firebase-admin');

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
  }

  const db = admin.firestore();

  const [projectsSnap, blogsSnap, eventsSnap, certsSnap] = await Promise.all([
    db.collection('projects').select('slug', 'updatedAt').get(),
    db.collection('blogs').select('slug', 'updatedAt').get(),
    db.collection('events').select('updatedAt').get(),
    db.collection('certifications').select('updatedAt').get(),
  ]);

  const toDate = (ts) =>
    ts?.toDate ? ts.toDate().toISOString().split('T')[0] : TODAY;

  const routes = [];

  projectsSnap.forEach((doc) => {
    const { slug, updatedAt } = doc.data();
    if (slug) {
      routes.push({
        loc:        `${BASE_URL}/projects/${slug}`,
        lastmod:    toDate(updatedAt),
        changefreq: 'monthly',
        priority:   '0.8',
      });
    }
  });

  blogsSnap.forEach((doc) => {
    const { slug, updatedAt } = doc.data();
    if (slug) {
      routes.push({
        loc:        `${BASE_URL}/blog/${slug}`,
        lastmod:    toDate(updatedAt),
        changefreq: 'monthly',
        priority:   '0.7',
      });
    }
  });

  eventsSnap.forEach((doc) => {
    routes.push({
      loc:        `${BASE_URL}/events/${doc.id}`,
      lastmod:    toDate(doc.data().updatedAt),
      changefreq: 'monthly',
      priority:   '0.6',
    });
  });

  certsSnap.forEach((doc) => {
    routes.push({
      loc:        `${BASE_URL}/certifications/${doc.id}`,
      lastmod:    toDate(doc.data().updatedAt),
      changefreq: 'yearly',
      priority:   '0.5',
    });
  });

  console.log(`  📄  ${projectsSnap.size} projects, ${blogsSnap.size} blogs, ${eventsSnap.size} events, ${certsSnap.size} certifications`);
  return routes;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🗺️  Generating sitemap...\n');

  const staticEntries = STATIC_ROUTES.map(({ path, changefreq, priority }) => ({
    loc: path === '/' ? BASE_URL : `${BASE_URL}${path}`,
    lastmod: TODAY,
    changefreq,
    priority,
  }));

  let dynamicEntries = [];
  try {
    dynamicEntries = await fetchDynamicRoutes();
  } catch (err) {
    console.warn(`⚠️  Could not fetch dynamic routes: ${err.message}`);
  }

  const xml = buildSitemap([...staticEntries, ...dynamicEntries]);
  writeFileSync(SITEMAP_OUT, xml, 'utf-8');

  const total = staticEntries.length + dynamicEntries.length;
  console.log(`✅  sitemap.xml written — ${total} URLs (${staticEntries.length} static + ${dynamicEntries.length} dynamic)\n`);
}

run().catch((err) => {
  console.error('❌  Sitemap generation failed:', err.message);
  process.exit(1);
});
