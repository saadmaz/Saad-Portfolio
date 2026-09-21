/**
 * seo-content.js
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for per-page SEO copy (title, description).
 *
 * Both the React pages (via `<SEO title={PAGE_SEO['/path'].title} .../>`)
 * and the build-time prerender script (scripts/prerender.mjs) import this
 * same plain-JS file, so the two can never drift apart the way the old
 * hardcoded ROUTES array in prerender.mjs used to drift from each page's
 * own <SEO> props.
 *
 * Plain JS (no TypeScript, no JSX) on purpose: prerender.mjs runs as a
 * plain Node ESM script after `vite build`, with no bundler/loader, so it
 * can only `import` files Node itself understands natively.
 */

export const SITE_NAME = "Saad Mazhar";
// www is what actually serves (apex 301s to www) - canonical/og:url must
// name the URL that returns 200, or Google treats it as a conflicting signal.
export const BASE_URL = "https://www.saadmaz.com";

export const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Saad Mazhar",
  url: BASE_URL,
  image: `${BASE_URL}/logo.png`,
  sameAs: [
    "https://linkedin.com/in/saadmaz/",
    "https://github.com/saadmaz/",
    "https://instagram.com/saaadmaz/",
    "https://facebook.com/saadmazhar",
    "https://x.com/SaadMazhar_",
  ],
  jobTitle: "Startup Founder & Full-Stack Developer",
  worksFor: { "@type": "Organization", name: "TankSudda" },
  address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
};

/** Top-level nav used for the crawler-visible <nav> injected by prerender.mjs. */
export const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/projects", label: "Projects" },
  { path: "/experience", label: "Experience" },
  { path: "/skills", label: "Skills" },
  { path: "/blog", label: "Blog" },
  { path: "/contact", label: "Contact" },
];

/**
 * Every statically prerendered route. Titles are the raw `<SEO title>`
 * prop - SEO.tsx (and prerender.mjs) append " - Saad Mazhar" themselves, so
 * titles here must NOT already contain the brand name (that produced the
 * "Publications | Saad Mazhar - Saad Mazhar" double-brand bug). Keep each
 * title under ~46 characters to land under the ~60-character display limit
 * once the suffix is added. Descriptions should stay under ~160 characters.
 */
export const PAGE_SEO = {
  "/": {
    title: "Full-Stack Developer & Startup Founder",
    description:
      "Saad Mazhar — startup founder, tech speaker, and full-stack developer in Colombo, Sri Lanka, building AI-powered products and web apps.",
  },
  "/projects": {
    title: "Projects | AI, Web & Mobile Apps",
    description:
      "Explore projects built by Saad Mazhar - full-stack web applications, AI integrations, Flutter mobile apps, and startup products developed in Sri Lanka.",
  },
  "/about": {
    title: "About | Founder & Developer",
    description:
      "Get to know Saad Mazhar — computer science undergraduate, startup founder, and tech speaker based in Colombo, Sri Lanka.",
  },
  "/blog": {
    title: "Blog | Startups, AI & Dev Insights",
    description:
      "Thoughts and tutorials from Saad Mazhar on AI tools, full-stack development, and the Sri Lanka tech ecosystem.",
  },
  "/contact": {
    title: "Contact | Hire a Developer",
    description:
      "Get in touch with Saad Mazhar. Available for freelance projects, collaborations, speaking engagements, and consulting - based in Colombo, Sri Lanka.",
  },
  "/experience": {
    title: "Work Experience",
    description:
      "Saad Mazhar's career timeline — startup founder, full-stack developer, and AI engineer based in Colombo, Sri Lanka.",
  },
  "/skills": {
    title: "Skills & Tech Stack",
    description:
      "Saad Mazhar's technical skill set — React, TypeScript, Flutter, Python, AI tools, and cloud platforms.",
  },
  "/certifications": {
    title: "Certifications",
    description:
      "Saad Mazhar's certifications in AI, cybersecurity, cloud computing, and DevOps — from Microsoft, Google, and ISACA.",
  },
  "/events": {
    title: "Events & Public Presence",
    description:
      "Saad Mazhar as a speaker, host, and organizer at tech conferences, summits, and community events in Sri Lanka and beyond.",
  },
  "/newsletters": {
    title: "Newsletter | Insights",
    description:
      "Subscribe to Saad Mazhar's newsletter for insights on AI, startups, and full-stack development from Colombo, Sri Lanka.",
  },
  "/publications": {
    title: "Publications",
    description: "Articles, research papers, and published work by Saad Mazhar.",
  },
  "/education": {
    title: "Education",
    description: "Saad Mazhar's academic background, degrees, and coursework.",
  },
};
