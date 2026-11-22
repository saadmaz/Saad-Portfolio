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

/**
 * Stable identifiers for the site's entity graph. Every schema that means
 * "Saad Mazhar" or "this website" points at the same @id, so search engines
 * and AI answer engines merge them into one entity instead of several
 * loosely related ones.
 */
export const PERSON_ID = `${BASE_URL}/#person`;
export const WEBSITE_ID = `${BASE_URL}/#website`;

/** Use wherever another schema mentions Saad (author, about, performer…). */
export const PERSON_REF = { "@type": "Person", "@id": PERSON_ID, name: "Saad Mazhar", url: BASE_URL };

/**
 * The one-line bio. Keep LinkedIn, GitHub and X headlines saying the same
 * thing: consistent facts across profiles are how engines confirm identity.
 */
export const BIO =
  "Saad Mazhar is a startup founder and full-stack developer from Colombo, Sri Lanka, building TankSudda and Stopwash and studying Computer Science at the University of Westminster.";

export const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Saad Mazhar",
  url: BASE_URL,
  image: `${BASE_URL}/profile-photo.png`,
  email: "mailto:hello@saadmaz.com",
  sameAs: [
    "https://www.linkedin.com/in/saadmaz/",
    "https://github.com/saadmaz",
    "https://www.instagram.com/saaadmaz/",
    "https://www.facebook.com/saadmazhar03",
    "https://x.com/SaadMazhar_",
  ],
  jobTitle: "Startup Founder & Full-Stack Developer",
  // Matches the Experience page and the homepage's "Currently building" line.
  worksFor: [
    { "@type": "Organization", name: "TankSudda", url: "https://tanksudda.com" },
    {
      "@type": "Organization",
      name: "Stopwash",
      legalName: "Stopwash (PVT) Ltd.",
      url: "https://stopwash.lk",
    },
    { "@type": "Organization", name: "Spectrify AI" },
  ],
  address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
};

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: "Saad Mazhar",
  url: BASE_URL,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

/** Homepage graph: the person, the site, and the profile page that is about them. */
export function homeSchemas(person = PERSON_SCHEMA) {
  return [
    person,
    WEBSITE_SCHEMA,
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${BASE_URL}/#profilepage`,
      url: BASE_URL,
      name: PAGE_SEO["/"].fullTitle,
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
    },
  ];
}

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
    title: "Startup Founder & Full-Stack Developer",
    // Home leads with the name (the query it must win) instead of the usual suffix.
    fullTitle: "Saad Mazhar | Startup Founder & Full-Stack Developer",
    // The crawler copy's H1 mirrors the visible hero heading in Index.tsx.
    h1: "Saad Mazhar: building products that solve real problems.",
    description:
      "Saad Mazhar, startup founder, tech speaker, and full-stack developer in Colombo, Sri Lanka, building AI-powered products and web apps.",
  },
  "/projects": {
    title: "Projects | AI, Web & Mobile Apps",
    description:
      "Explore projects built by Saad Mazhar - full-stack web applications, AI integrations, Flutter mobile apps, and startup products developed in Sri Lanka.",
  },
  "/about": {
    title: "About | Founder & Developer",
    description:
      "Get to know Saad Mazhar, a computer science undergraduate, startup founder, and tech speaker based in Colombo, Sri Lanka.",
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
      "Saad Mazhar's career timeline: startup founder, full-stack developer, and AI engineer based in Colombo, Sri Lanka.",
  },
  "/skills": {
    title: "Skills & Tech Stack",
    description:
      "Saad Mazhar's technical skill set: React, TypeScript, Flutter, Python, AI tools, and cloud platforms.",
  },
  "/certifications": {
    title: "Certifications",
    description:
      "Saad Mazhar's certifications in AI, cybersecurity, cloud computing, and DevOps, from Microsoft, Google, and ISACA.",
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
  "/languages": {
    title: "Languages",
    description: "The languages Saad Mazhar speaks and hosts events in, with proficiency for each.",
  },
  "/education": {
    title: "Education",
    description: "Saad Mazhar's academic background, degrees, and coursework.",
  },
};
