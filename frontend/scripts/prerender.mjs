/**
 * prerender.mjs
 * Generates static HTML snapshots for key routes using modern Puppeteer.
 * Run after `vite build` — saves each route as dist/[route]/index.html
 * so Google sees real HTML on first crawl instead of a blank SPA shell.
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = 5174;

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

// Routes and their authoritative meta tags.
// These are injected directly into the prerendered HTML so Google
// always gets the correct <title> and <meta description> on first crawl,
// regardless of react-helmet-async timing.
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
];

function createStaticServer() {
  return createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = join(DIST_DIR, urlPath);

    // If no file extension, try to serve index.html (SPA fallback)
    if (!extname(filePath)) {
      filePath = join(DIST_DIR, 'index.html');
    }

    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      } catch {
        // fall through to 500
      }
    }

    // Fallback: serve index.html for unknown paths (SPA behaviour)
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

async function prerender() {
  const server = createStaticServer();
  await new Promise((resolve, reject) => {
    server.listen(PORT, resolve);
    server.on('error', reject);
  });
  console.log(`\n📡  Local server running at http://localhost:${PORT}`);

  // Prefer system Chrome; fall back to puppeteer's bundled Chromium on CI (Linux)
  const systemChrome =
    process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome';

  const { existsSync: _exists } = await import('fs');
  const executablePath = _exists(systemChrome) ? systemChrome : undefined;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const { path: routePath, title, description } = route;
    const page = await browser.newPage();

    // Suppress console noise from the page
    page.on('console', () => {});
    page.on('pageerror', () => {});

    try {
      await page.goto(`http://localhost:${PORT}${routePath}`, {
        waitUntil: 'networkidle2',
        timeout: 30_000,
      });

      // Wait for React + Suspense to finish rendering (root has real content)
      await page
        .waitForFunction(
          () => {
            const root = document.getElementById('root');
            return root && root.children.length > 0 && root.innerHTML.length > 500;
          },
          { timeout: 15_000 },
        )
        .catch(() => {});

      // Extra buffer for Firebase fetches and lazy chunk execution
      await new Promise(r => setTimeout(r, 2000));

      let html = await page.content();

      // Authoritative meta injection — override whatever helmet produced
      // to guarantee Google sees the correct title/description on first crawl.
      const SITE_NAME = 'Saad Mazhar';
      const fullTitle = `${title} - ${SITE_NAME}`;
      const escapedTitle = fullTitle.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      const escapedDesc = description.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapedTitle}</title>`);
      html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${escapedDesc}$2`);
      html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${escapedTitle}$2`);
      html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${escapedDesc}$2`);
      html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i, `$1${escapedTitle}$2`);
      html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i, `$1${escapedDesc}$2`);

      const routeDir = routePath === '/' ? DIST_DIR : join(DIST_DIR, routePath);
      mkdirSync(routeDir, { recursive: true });
      writeFileSync(join(routeDir, 'index.html'), html, 'utf-8');

      console.log(`  ✅  ${routePath}`);
      success++;
    } catch (err) {
      console.error(`  ❌  ${routePath} — ${err.message}`);
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  console.log(`\n🎉  Prerendering done — ${success} succeeded, ${failed} failed.\n`);

  if (failed === ROUTES.length) {
    // All routes failed — treat as a hard error so CI notices
    process.exit(1);
  }
}

prerender().catch(err => {
  console.error('\n🔥  Prerender script crashed:', err);
  process.exit(1);
});
