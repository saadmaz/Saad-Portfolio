/**
 * prerender.mjs
 * Generates per-route HTML files so Googlebot sees the correct
 * <title>, <meta description>, and <link rel="canonical"> on first crawl.
 *
 * Strategy:
 *   1. Try full Puppeteer rendering (real React content, needs Chrome).
 *      Uses domcontentloaded + custom wait so Firebase WebSocket connections
 *      don't block the networkidle2 phase indefinitely.
 *   2. Per-route fallback to meta-only injection if Puppeteer fails for that
 *      specific route — every route always gets a pre-rendered index.html.
 */

import { createServer } from 'http';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = 5174;
const BASE_URL = 'https://saadmaz.com';
const SITE_NAME = 'Saad Mazhar';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.pdf':  'application/pdf',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
};

const ROUTES = [
  {
    path: '/',
    title: 'Saad Mazhar | Startup Founder, Tech Speaker & Full-Stack Developer in Sri Lanka',
    description: 'Portfolio of Saad Mazhar — startup founder, tech speaker, and full-stack developer based in Colombo, Sri Lanka. Building AI-powered products, web apps, and mobile solutions.',
  },
  {
    path: '/projects',
    title: 'Projects | AI, Web & Mobile Apps by Saad Mazhar',
    description: 'Explore projects built by Saad Mazhar — full-stack web applications, AI integrations, Flutter mobile apps, and startup products developed in Sri Lanka.',
  },
  {
    path: '/about',
    title: 'About Saad Mazhar | CS Student, Startup Founder & Tech Speaker in Colombo',
    description: 'Get to know Saad Mazhar — a computer science undergraduate, startup founder, and tech speaker based in Colombo, Sri Lanka. Education, achievements, languages, and interests beyond the code.',
  },
  {
    path: '/blog',
    title: 'Blog | Startups, AI & Developer Insights by Saad Mazhar',
    description: 'Thoughts, tutorials, and real-world insights from Saad Mazhar — covering AI tools, full-stack development, startup building, and the Sri Lanka tech ecosystem.',
  },
  {
    path: '/contact',
    title: 'Contact Saad Mazhar | Hire a Freelance Developer in Sri Lanka',
    description: 'Get in touch with Saad Mazhar. Available for freelance projects, collaborations, speaking engagements, and consulting — based in Colombo, Sri Lanka.',
  },
  {
    path: '/experience',
    title: "Work Experience | Saad Mazhar's Professional Journey in Sri Lanka",
    description: "A timeline of Saad Mazhar's professional experience — from internships to founding startups in Sri Lanka. Full-stack development, AI, product management and leadership roles.",
  },
  {
    path: '/skills',
    title: "Skills | Saad Mazhar's Technical Stack & Expertise",
    description: "Explore the full technical skill set of Saad Mazhar — proficiency in React, TypeScript, Flutter, Python, AI tools, cloud platforms, and more. Based in Sri Lanka.",
  },
  {
    path: '/certifications',
    title: "Certifications | Saad Mazhar's Professional Credentials",
    description: "Browse Saad Mazhar's professional certifications in AI, cybersecurity, cloud computing, data analytics, Flutter, DevOps, and more — earned from Microsoft, LinkedIn Learning, Google, and ISACA.",
  },
  {
    path: '/events',
    title: "Events | Saad Mazhar's Speaking & Community Engagements",
    description: "Talks, workshops, and community events featuring Saad Mazhar — tech speaker and startup founder based in Colombo, Sri Lanka.",
  },
  {
    path: '/newsletters',
    title: "Newsletter | Insights by Saad Mazhar",
    description: "Subscribe to Saad Mazhar's newsletter for insights on AI, startups, and full-stack development from Colombo, Sri Lanka.",
  },
];

// ── Meta injection ──────────────────────────────────────────────────────────

function escape(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Injects correct title, description, canonical, and OG tags into an HTML
 * string. Works on both the raw index.html shell and Puppeteer-rendered HTML.
 */
function injectMeta(html, { path: routePath, title, description }) {
  const canonicalUrl = routePath === '/' ? BASE_URL : `${BASE_URL}${routePath}`;
  const fullTitle = `${title} - ${SITE_NAME}`;
  const et = escape(fullTitle);
  const ed = escape(description);
  const eu = escape(canonicalUrl);

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${et}</title>`);

  // canonical — update existing or insert before </head>
  if (/<link\s[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s[^>]*rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${eu}" />`,
    );
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${eu}" />\n</head>`);
  }

  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i,    `$1${ed}$2`);
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i,   `$1${et}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${ed}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i,     `$1${eu}$2`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i,  `$1${et}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i, `$1${ed}$2`);

  return html;
}

function writeRoute(routePath, html) {
  const routeDir = routePath === '/' ? DIST_DIR : join(DIST_DIR, routePath);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, 'index.html'), html, 'utf-8');
}

// ── Meta-only fallback (no browser required) ────────────────────────────────

function metaOnlyForRoute(route) {
  const shell = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
  const html = injectMeta(shell, route);
  writeRoute(route.path, html);
}

function metaOnlyPrerender() {
  console.log('\n📄  Running meta-only prerender (no browser available).');
  let ok = 0;
  for (const route of ROUTES) {
    metaOnlyForRoute(route);
    console.log(`  ✅  ${route.path}`);
    ok++;
  }
  console.log(`\n🎉  Meta prerender done — ${ok} routes written.\n`);
}

// ── Full Puppeteer prerender ─────────────────────────────────────────────────

function createStaticServer() {
  return createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = join(DIST_DIR, urlPath);
    if (!extname(filePath)) filePath = join(DIST_DIR, 'index.html');

    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(content);
        return;
      } catch { /* fall through */ }
    }

    try {
      const indexHtml = readFileSync(join(DIST_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
    } catch {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
}

async function puppeteerPrerender() {
  const { default: puppeteer } = await import('puppeteer');

  const systemChrome =
    process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome';

  const executablePath = existsSync(systemChrome) ? systemChrome : undefined;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
      ],
    });
  } catch (err) {
    console.warn(`\n⚠️  Puppeteer launch failed (${err.message}) — falling back to meta-only prerender.`);
    return false;
  }

  const server = createStaticServer();
  await new Promise((resolve, reject) => {
    server.listen(PORT, resolve);
    server.on('error', reject);
  });
  console.log(`\n📡  Local server running at http://localhost:${PORT}`);

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const page = await browser.newPage();
    page.on('console', () => {});
    page.on('pageerror', () => {});

    try {
      // Use domcontentloaded instead of networkidle2 — Firebase keeps WebSocket
      // connections open which would cause networkidle2 to never resolve.
      await page.goto(`http://localhost:${PORT}${route.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });

      await page
        .waitForFunction(
          () => {
            const root = document.getElementById('root');
            return root && root.children.length > 0 && root.innerHTML.length > 500;
          },
          { timeout: 15_000 },
        )
        .catch(() => {});

      await new Promise(r => setTimeout(r, 3000));

      const html = injectMeta(await page.content(), route);
      writeRoute(route.path, html);
      console.log(`  ✅  ${route.path}`);
      success++;
    } catch (err) {
      console.error(`  ❌  ${route.path} — ${err.message}`);
      // Always fall back to meta-only for this route so it's never skipped.
      try {
        metaOnlyForRoute(route);
        console.log(`  📄  ${route.path} — meta-only fallback applied`);
      } catch (fallbackErr) {
        console.error(`  💥  ${route.path} — meta-only also failed: ${fallbackErr.message}`);
      }
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log(`\n🎉  Puppeteer prerender done — ${success} succeeded, ${failed} fell back to meta-only.\n`);

  return true;
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function prerender() {
  const puppeteerOk = await puppeteerPrerender().catch(() => false);
  if (!puppeteerOk) {
    metaOnlyPrerender();
  }
}

prerender().catch(err => {
  console.warn('\n⚠️  Prerender encountered an unexpected error:', err.message);
  try {
    metaOnlyPrerender();
  } catch (fallbackErr) {
    console.error('Meta-only fallback also failed:', fallbackErr.message);
  }
});
