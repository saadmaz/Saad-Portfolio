/**
 * generate-sitemap.mjs
 * Generates a sitemap index + individual sitemaps (main, projects, blog, events, media).
 *
 * Output:
 *   frontend/public/sitemap.xml          → sitemap index
 *   frontend/public/sitemaps/main.xml    → static pages
 *   frontend/public/sitemaps/projects.xml
 *   frontend/public/sitemaps/blog.xml
 *   frontend/public/sitemaps/events.xml
 *   frontend/public/sitemaps/media.xml   → image sitemap
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 *
 * Requires serviceAccountKey.json at the project root for dynamic routes.
 * If unavailable, falls back to static routes only.
 */

import { createRequire } from 'module';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require     = createRequire(import.meta.url);
const __dirname   = dirname(fileURLToPath(import.meta.url));
const ROOT        = resolve(__dirname, '..');
const PUBLIC_DIR  = resolve(ROOT, 'frontend', 'public');
const SITEMAPS_DIR = resolve(PUBLIC_DIR, 'sitemaps');
const BASE_URL    = 'https://saadmaz.com';
const TODAY       = new Date().toISOString().split('T')[0];

// ── Static routes ─────────────────────────────────────────────────────────────

const MAIN_ROUTES = [
  { path: '/',               changefreq: 'weekly',  priority: '1.0' },
  { path: '/about',          changefreq: 'monthly', priority: '0.8' },
  { path: '/experience',     changefreq: 'monthly', priority: '0.8' },
  { path: '/skills',         changefreq: 'monthly', priority: '0.7' },
  { path: '/certifications', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact',        changefreq: 'yearly',  priority: '0.5' },
  { path: '/newsletters',    changefreq: 'monthly', priority: '0.6' },
];

// ── XML helpers ───────────────────────────────────────────────────────────────

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

function buildUrlset(entries, extraNs = '') {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${extraNs}>`,
    ...entries.map(urlEntry),
    '</urlset>',
    '',
  ].join('\n');
}

function buildSitemapIndex(sitemapPaths) {
  const entries = sitemapPaths.map((p) => [
    '  <sitemap>',
    `    <loc>${BASE_URL}/sitemaps/${p}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    '  </sitemap>',
  ].join('\n'));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</sitemapindex>',
    '',
  ].join('\n');
}

function buildMediaSitemap(items) {
  // items: [{ pageUrl, imageUrl, title }]
  const entries = items.map(({ pageUrl, imageUrl, title }) => [
    '  <url>',
    `    <loc>${pageUrl}</loc>`,
    '    <image:image>',
    `      <image:loc>${imageUrl}</image:loc>`,
    title ? `      <image:title>${escapeXml(title)}</image:title>` : '',
    '    </image:image>',
    '  </url>',
  ].filter(Boolean).join('\n'));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Firestore fetch ───────────────────────────────────────────────────────────

async function fetchDynamicData() {
  const keyPath = resolve(ROOT, 'serviceAccountKey.json');
  if (!existsSync(keyPath)) {
    console.warn('⚠️  serviceAccountKey.json not found - skipping dynamic routes.');
    return { projects: [], blogs: [], events: [], certs: [] };
  }

  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
  }

  const db = admin.firestore();

  const [projectsSnap, blogsSnap, eventsSnap, certsSnap] = await Promise.all([
    db.collection('projects').select('slug', 'title', 'heroImage', 'updatedAt').get(),
    db.collection('blogs').select('slug', 'updatedAt').get(),
    db.collection('events').select('updatedAt').get(),
    db.collection('certifications').select('updatedAt').get(),
  ]);

  const toDate = (ts) =>
    ts?.toDate ? ts.toDate().toISOString().split('T')[0] : TODAY;

  const projects = [];
  projectsSnap.forEach((doc) => {
    const { slug, title, heroImage, updatedAt } = doc.data();
    if (slug) projects.push({ slug, title, heroImage, lastmod: toDate(updatedAt) });
  });

  const blogs = [];
  blogsSnap.forEach((doc) => {
    const { slug, updatedAt } = doc.data();
    if (slug) blogs.push({ slug, lastmod: toDate(updatedAt) });
  });

  const events = [];
  eventsSnap.forEach((doc) => {
    events.push({ id: doc.id, lastmod: toDate(doc.data().updatedAt) });
  });

  const certs = [];
  certsSnap.forEach((doc) => {
    certs.push({ id: doc.id, lastmod: toDate(doc.data().updatedAt) });
  });

  console.log(`  📄  ${projects.length} projects, ${blogs.length} blogs, ${events.length} events, ${certs.length} certifications`);
  return { projects, blogs, events, certs };
}

// ── Write helpers ─────────────────────────────────────────────────────────────

function write(filePath, content) {
  writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✅  ${filePath.replace(ROOT, '').replace(/\\/g, '/')}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🗺️  Generating sitemaps...\n');

  mkdirSync(SITEMAPS_DIR, { recursive: true });

  let dynamic = { projects: [], blogs: [], events: [], certs: [] };
  try {
    dynamic = await fetchDynamicData();
  } catch (err) {
    console.warn(`⚠️  Could not fetch dynamic routes: ${err.message}`);
  }

  // ── main.xml ──────────────────────────────────────────────────────────────
  const mainEntries = MAIN_ROUTES.map(({ path, changefreq, priority }) => ({
    loc: path === '/' ? BASE_URL : `${BASE_URL}${path}`,
    lastmod: TODAY,
    changefreq,
    priority,
  }));
  write(resolve(SITEMAPS_DIR, 'main.xml'), buildUrlset(mainEntries));

  // ── projects.xml ──────────────────────────────────────────────────────────
  const projectEntries = [
    { loc: `${BASE_URL}/projects`, lastmod: TODAY, changefreq: 'weekly', priority: '0.9' },
    ...dynamic.projects.map(({ slug, lastmod }) => ({
      loc: `${BASE_URL}/projects/${slug}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.95',
    })),
  ];
  write(resolve(SITEMAPS_DIR, 'projects.xml'), buildUrlset(projectEntries));

  // ── blog.xml ──────────────────────────────────────────────────────────────
  const blogEntries = [
    { loc: `${BASE_URL}/blog`, lastmod: TODAY, changefreq: 'weekly', priority: '0.9' },
    ...dynamic.blogs.map(({ slug, lastmod }) => ({
      loc: `${BASE_URL}/blog/${slug}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];
  write(resolve(SITEMAPS_DIR, 'blog.xml'), buildUrlset(blogEntries));

  // ── events.xml ────────────────────────────────────────────────────────────
  const eventEntries = [
    { loc: `${BASE_URL}/events`, lastmod: TODAY, changefreq: 'monthly', priority: '0.7' },
    ...dynamic.events.map(({ id, lastmod }) => ({
      loc: `${BASE_URL}/events/${id}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ];
  write(resolve(SITEMAPS_DIR, 'events.xml'), buildUrlset(eventEntries));

  // ── media.xml ─────────────────────────────────────────────────────────────
  const mediaItems = dynamic.projects
    .filter(({ heroImage }) => heroImage)
    .map(({ slug, title, heroImage }) => ({
      pageUrl: `${BASE_URL}/projects/${slug}`,
      imageUrl: heroImage.startsWith('http') ? heroImage : `${BASE_URL}${heroImage}`,
      title,
    }));

  if (mediaItems.length > 0) {
    write(resolve(SITEMAPS_DIR, 'media.xml'), buildMediaSitemap(mediaItems));
  } else {
    console.log('  ⏭️  media.xml skipped (no hero images found)');
  }

  // ── sitemap index ─────────────────────────────────────────────────────────
  const indexFiles = ['main.xml', 'projects.xml', 'blog.xml', 'events.xml'];
  if (mediaItems.length > 0) indexFiles.push('media.xml');

  write(resolve(PUBLIC_DIR, 'sitemap.xml'), buildSitemapIndex(indexFiles));

  const total = mainEntries.length + projectEntries.length + blogEntries.length + eventEntries.length;
  console.log(`\n🎉  Done - ${total} URLs across ${indexFiles.length} sitemaps\n`);
}

run().catch((err) => {
  console.error('❌  Sitemap generation failed:', err.message);
  process.exit(1);
});
