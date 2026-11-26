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
/** Google shows roughly 60 characters of a title before cutting it off. */
export const TITLE_MAX = 60;

/**
 * The <title> for a page: "<title> - Saad Mazhar", or the bare title when the
 * suffix would push it past TITLE_MAX (so the words that matter aren't cut off).
 */
export function pageTitle(title) {
  const full = `${title} - ${SITE_NAME}`;
  return full.length <= TITLE_MAX ? full : title;
}

const cut = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2021" stays "2021"; "2020-02-24" → "Feb 2020"; anything unparseable is returned as-is. */
const dateText = (value) => {
  const s = String(value ?? "").trim();
  if (!s || /^\d{4}$/.test(s)) return s;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

/**
 * Meta description for an event page. CMS descriptions are often a few words
 * ("IDC 21"), which Google swaps for random page text; short ones get the
 * role, organiser, place and date added so the snippet says something.
 * Used by EventDetailPage.tsx and scripts/prerender.mjs.
 */
export function eventDescriptionOf(e) {
  const own = String(e?.description ?? "").trim();
  if (own.length >= 70) return cut(own, 160);
  const date = dateText(e?.date);
  const facts = [
    `${e?.role || "Participant"} at ${e?.title}`,
    e?.organizer && `organised by ${e.organizer}`,
    e?.location && `in ${e.location}`,
    date && `(${date})`,
  ]
    .filter(Boolean)
    .join(" ");
  // Skip a description that only repeats the title ("Big Debate").
  const lead =
    own &&
    !String(e?.title ?? "")
      .toLowerCase()
      .includes(own.toLowerCase())
      ? `${own.replace(/[.!]?$/, ".")} `
      : "";
  // CMS fields can carry stray spaces ("51st Big Debate "): collapse them.
  return cut(`${lead}Saad Mazhar: ${facts}.`.replace(/\s+/g, " ").trim(), 160);
}

/** Meta description for a blog category page: the CMS one, else a full sentence. */
export function categoryDescriptionOf(label, custom) {
  return fitDescription(
    String(custom ?? "").trim() ||
      `Articles on ${label} by Saad Mazhar, startup founder and full-stack developer in Colombo: lessons, tutorials and notes from real projects.`,
  );
}

/**
 * Meta description sized for search results: long text is cut at a word
 * boundary (≤158 chars); short text gets `tail` appended when given.
 */
export function fitDescription(text, tail = "") {
  let s = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length < 70 && tail) s = `${s} ${tail}`.trim();
  if (s.length <= 158) return s;
  const cutAt = s.lastIndexOf(" ", 157);
  return `${s.slice(0, cutAt > 100 ? cutAt : 157).replace(/[,;:.\s]+$/, "")}…`;
}

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
  givenName: "Saad",
  familyName: "Mazhar",
  alternateName: "saadmaz",
  url: BASE_URL,
  mainEntityOfPage: { "@id": `${BASE_URL}/#profilepage` },
  image: `${BASE_URL}/profile-photo.png`,
  nationality: { "@type": "Country", name: "Sri Lanka" },
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
    title: "Full-Stack Developer & Founder in Colombo",
    // Home leads with the name (the query it must win) instead of the usual suffix.
    // What he does and where: the snippet has to beat LinkedIn for "saad mazhar".
    fullTitle: "Saad Mazhar | Full-Stack Developer & Founder in Colombo",
    // The crawler copy's H1 mirrors the visible hero heading in Index.tsx.
    h1: "Saad Mazhar: building products that solve real problems.",
    description:
      "Saad Mazhar is a full-stack developer and startup founder in Colombo, Sri Lanka. See his projects, writing and talks, or hire him for your web or AI product.",
  },
  // `h1` is the heading in the crawler copy (scripts/prerender.mjs): a plain,
  // descriptive line. Without it the H1 repeated the title ("About | Founder & Developer").
  "/projects": {
    title: "Projects | AI, Web & Mobile Apps",
    h1: "Projects by Saad Mazhar",
    description:
      "Explore projects built by Saad Mazhar - full-stack web applications, AI integrations, Flutter mobile apps, and startup products developed in Sri Lanka.",
  },
  "/about": {
    title: "About | Founder & Developer",
    h1: "About Saad Mazhar",
    description:
      "Get to know Saad Mazhar, a computer science undergraduate, startup founder, and tech speaker based in Colombo, Sri Lanka.",
  },
  "/blog": {
    title: "Blog | Startups, AI & Dev Insights",
    h1: "Saad Mazhar's blog: startups, AI and software development",
    description:
      "Thoughts and tutorials from Saad Mazhar on AI tools, full-stack development, and the Sri Lanka tech ecosystem.",
  },
  "/contact": {
    title: "Contact | Hire a Developer",
    h1: "Contact Saad Mazhar",
    description:
      "Get in touch with Saad Mazhar. Available for freelance projects, collaborations, speaking engagements, and consulting - based in Colombo, Sri Lanka.",
  },
  "/experience": {
    title: "Work Experience",
    h1: "Saad Mazhar's work experience",
    description:
      "Saad Mazhar's career timeline: startup founder, full-stack developer, and AI engineer based in Colombo, Sri Lanka.",
  },
  "/skills": {
    title: "Skills & Tech Stack",
    h1: "Saad Mazhar's skills and tech stack",
    description:
      "Saad Mazhar's tech stack: React, TypeScript, Next.js, Python, Flutter, AWS and AI tools, with proficiency, years used and official links for each.",
  },
  "/certifications": {
    title: "Certifications",
    h1: "Saad Mazhar's certifications",
    description:
      "Saad Mazhar's certifications in AI, cybersecurity, cloud computing, and DevOps, from Microsoft, Google, and ISACA.",
  },
  "/events": {
    title: "Events & Public Presence",
    h1: "Events Saad Mazhar has spoken at, hosted and organised",
    description:
      "Saad Mazhar as a speaker, host, and organizer at tech conferences, summits, and community events in Sri Lanka and beyond.",
  },
  "/newsletters": {
    title: "Newsletter | Insights",
    h1: "Saad Mazhar's newsletter",
    description:
      "Subscribe to Saad Mazhar's newsletter for insights on AI, startups, and full-stack development from Colombo, Sri Lanka.",
  },
  "/publications": {
    title: "Publications",
    h1: "Publications by Saad Mazhar",
    description:
      "Articles, research papers, and other published work by Saad Mazhar, startup founder and full-stack developer in Colombo, Sri Lanka.",
  },
  "/education": {
    title: "Education",
    h1: "Saad Mazhar's education",
    description:
      "Saad Mazhar's academic background: Computer Science at the University of Westminster, school years, coursework, honours and activities.",
  },
};

/**
 * Contact page copy, shared by ContactPage.tsx and the crawler copy so both say
 * the same thing. Only facts the site already states elsewhere (the enquiry
 * types and budgets on the form, reply time, the booking link).
 */
export const CONTACT_SERVICES = [
  {
    title: "Product builds",
    body: "Web apps and MVPs built end to end: React and TypeScript on the front, APIs, databases and deployment behind it.",
  },
  {
    title: "AI integration",
    body: "Adding AI features to an existing product, or building an AI-powered tool around a real workflow.",
  },
  {
    title: "Speaking and hosting",
    body: "Talks, panels and hosting for tech, startup and community events in Sri Lanka and online.",
  },
];

/** ContactPage JSON-LD: who to contact and what they offer (used by ContactPage.tsx and the prerender). */
export const CONTACT_PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Saad Mazhar",
  url: `${BASE_URL}/contact`,
  mainEntity: {
    "@type": "Person",
    name: "Saad Mazhar",
    url: BASE_URL,
    email: "hello@saadmaz.com",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "business inquiries",
      email: "hello@saadmaz.com",
      areaServed: "Worldwide",
      availableLanguage: ["English"],
    },
    makesOffer: CONTACT_SERVICES.map((svc) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: svc.title, description: svc.body },
    })),
  },
};

export const CONTACT_FAQ = [
  {
    q: "What kind of work do you take on?",
    a: "Product builds, AI integrations, startup collaborations, and speaking or hosting. If it's something else, send it anyway and I'll tell you honestly if I'm the right fit.",
  },
  {
    q: "How quickly will you reply?",
    a: "Within a day. Messages from the form go straight to my inbox.",
  },
  {
    q: "What budgets do you work with?",
    a: "Projects range from under $2k to $10k+. If you're not sure yet, pick \"Not sure\" and we'll scope it together.",
  },
  {
    q: "Can we talk before writing anything up?",
    a: "Yes. Book a free 30-minute call and we'll go through the idea, timeline and budget.",
  },
  {
    q: "Where are you based?",
    a: "Colombo, Sri Lanka. I work with clients and teams remotely as well as in person.",
  },
];
