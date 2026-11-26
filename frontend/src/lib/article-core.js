/**
 * article-core.js
 * ─────────────────────────────────────────────────────────────
 * Pure article logic shared by every consumer of blog content:
 *   - the React site (via the `@/lib/article-core` import),
 *   - the server handlers in server/ (feeds, scheduler, preview),
 *   - scripts/prerender.mjs (crawler HTML, sitemaps).
 *
 * Plain JS with a hand-written .d.ts, like seo-content.js and imageAlt.js:
 * prerender.mjs runs under plain Node with no TypeScript loader.
 *
 * No I/O and no DOM access here, so everything is unit-testable.
 * The admin CMS (separate repo) keeps a copy of readingTime/slugify with the
 * same test vectors; the CMS stores `readingTimeMinutes` on each post, so the
 * site normally displays the stored value and only computes it for legacy posts.
 */

/** Default reading speed (words per minute). Overridable in blog settings. */
export const DEFAULT_WPM = 225;

/** Central list of article types. The CMS can override labels via blog settings. */
export const ARTICLE_TYPES = [
  { id: "opinion", label: "Opinion" },
  { id: "industry-analysis", label: "Industry Analysis" },
  { id: "technology", label: "Technology" },
  { id: "tutorials", label: "Tutorials" },
  { id: "business-startups", label: "Business & Startups" },
  { id: "news-updates", label: "News & Updates" },
  { id: "research", label: "Research" },
];

/** Reader reactions, in display order. */
export const REACTIONS = [
  { id: "helpful", label: "Helpful", emoji: "👍" },
  { id: "insightful", label: "Insightful", emoji: "💡" },
  { id: "interesting", label: "Interesting", emoji: "🤔" },
  { id: "loved", label: "Loved it", emoji: "❤️" },
];

export const REACTION_IDS = REACTIONS.map((r) => r.id);

// ── Text ──────────────────────────────────────────────────────────────────

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };

/**
 * Visible text of CMS HTML: drops tags (and their attributes), script/style
 * bodies, and leftover Markdown syntax, then decodes common entities.
 */
/**
 * The page title is an article's only <h1>; any in the body become <h2>s so
 * the outline (and search engines) see one H1. For sanitised or editor HTML,
 * where a literal "<h1" can only be a tag (text is always escaped).
 */
export function demoteH1(html) {
  return String(html ?? "").replace(/<(\/?)h1(?=[\s>])/gi, "<$1h2");
}

export function stripHtml(html) {
  return (
    String(html ?? "")
      .replace(/<(script|style|template)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e) => {
        if (e[0] === "#") {
          const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
          return Number.isFinite(code) ? String.fromCodePoint(code) : " ";
        }
        return ENTITIES[e.toLowerCase()] ?? " ";
      })
      // Markdown residue: link targets, emphasis/heading/quote/code markers.
      .replace(/\]\([^)]*\)/g, " ")
      .replace(/[#*_`>~[\]|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Counts words: runs of letters/digits (apostrophes and hyphens join a word). */
export function countWords(text) {
  const matches = String(text ?? "").match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  return matches ? matches.length : 0;
}

/** Whole minutes to read `html` at `wpm`, never less than 1. */
export function readingTimeMinutes(html, wpm = DEFAULT_WPM) {
  const speed = Number(wpm) > 0 ? Number(wpm) : DEFAULT_WPM;
  return Math.max(1, Math.round(countWords(stripHtml(html)) / speed));
}

/** The stored value when the CMS computed one, otherwise computed now (legacy posts). */
export function readingMinutesOf(post, wpm = DEFAULT_WPM) {
  const stored = Number(post?.readingTimeMinutes);
  return Number.isFinite(stored) && stored > 0 ? Math.round(stored) : readingTimeMinutes(post?.content, wpm);
}

/** "48th Big Debate!" → "48th-big-debate". Same rules as the CMS. */
export function slugify(input, max = 80) {
  return String(input ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Stable, unique ids for headings. Existing ids (author-defined anchors) are
 * reserved first and never changed; generated ids get -2, -3… on collision.
 *
 * @param {{ text: string, id?: string | null }[]} headings
 * @param {Iterable<string>} [reserved] ids already used elsewhere on the page
 * @returns {string[]}
 */
export function assignHeadingIds(headings, reserved = []) {
  const used = new Set(reserved);
  for (const h of headings) if (h.id) used.add(h.id);
  return headings.map((h) => {
    if (h.id) return h.id;
    const base = slugify(h.text, 60) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  });
}

// ── Post accessors (one place for every legacy fallback) ─────────────────

export const articlePath = (post) => `/blog/${post.slug || post.id}`;

/** Live and listed (shown on /blog, the homepage, feeds). */
export const isListed = (post) => post?.published === true && !post.unlisted;

/** Live, listed and not opted out of search: belongs in sitemaps and feeds. */
export const isIndexable = (post) => isListed(post) && !post.noIndex;

export const seoTitleOf = (post) => (post.seoTitle || "").trim() || post.title;
export const seoDescriptionOf = (post) => (post.metaDescription || "").trim() || post.excerpt || "";

/** Absolute canonical URL: the author's override, or the article's own URL. */
export function canonicalOf(post, baseUrl) {
  const custom = (post.canonicalUrl || "").trim();
  return /^https?:\/\//i.test(custom) ? custom : `${baseUrl}${articlePath(post)}`;
}

/** Cover image with metadata; legacy posts only have `image` (a URL). */
export function coverOf(post) {
  if (post.cover?.url) return post.cover;
  return post.image ? { url: post.image } : null;
}

/** Image for social cards: the dedicated social image, else the cover. */
export function socialImageOf(post) {
  return post.socialImage?.url ? post.socialImage : coverOf(post);
}

/** ISO string from an ISO string, epoch ms, Date, or Firestore Timestamp(-like). */
export function toIso(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const t = Date.parse(value);
    return Number.isNaN(t) ? null : new Date(t).toISOString();
  }
  if (typeof value === "number") return new Date(value).toISOString();
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  const seconds = value.seconds ?? value._seconds;
  return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;
}

export const publishedAtOf = (post) => toIso(post.publishedAt) || toIso(post.date);

/** Last meaningful update, never earlier than publication. */
export function updatedAtOf(post) {
  const published = publishedAtOf(post);
  const updated = toIso(post.lastUpdatedAt);
  if (!updated) return published;
  return published && updated < published ? published : updated;
}

/** True when the "Updated" date is worth showing (more than a day after publishing). */
export function wasUpdated(post) {
  const p = publishedAtOf(post);
  const u = toIso(post.lastUpdatedAt);
  return !!(p && u && Date.parse(u) - Date.parse(p) > 24 * 60 * 60 * 1000);
}

export const articleTypeLabel = (id, types = ARTICLE_TYPES) => types.find((t) => t.id === id)?.label ?? "";

// ── Related articles ──────────────────────────────────────────────────────

const STOP = new Set(
  "the a an and or of to in on for with is are was how why what your you my i we it this that from at by be as".split(
    " ",
  ),
);
const keywords = (s) =>
  new Set(
    String(s ?? "")
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );

/** Relevance of `b` to `a`: shared category, tags, type, series and title words. */
export function relatedScore(a, b) {
  let score = 0;
  if (a.category && a.category === b.category) score += 3;
  const tags = new Set((a.tags ?? []).map((t) => t.toLowerCase()));
  for (const t of b.tags ?? []) if (tags.has(t.toLowerCase())) score += 2;
  if (a.articleType && a.articleType === b.articleType) score += 1;
  if (a.seriesId && a.seriesId === b.seriesId) score += 2;
  const words = keywords(`${a.title} ${a.excerpt ?? ""}`);
  for (const w of keywords(`${b.title} ${b.excerpt ?? ""}`)) if (words.has(w)) score += 0.5;
  return score;
}

/**
 * Related articles for `post` from `candidates` (already filtered to listed
 * posts). Manual picks come first, in the author's order; automatic matches
 * fill the remaining slots; the latest posts top up if nothing matches.
 */
export function relatedPosts(post, candidates, limit = 3) {
  const others = candidates.filter((p) => p.id !== post.id);
  const byId = new Map(others.map((p) => [p.id, p]));
  const out = [];
  const seen = new Set();
  const push = (p) => {
    if (p && !seen.has(p.id) && out.length < limit) {
      seen.add(p.id);
      out.push(p);
    }
  };
  for (const id of post.relatedPostIds ?? []) push(byId.get(id));
  for (const slug of post.relatedPostSlugs ?? []) push(others.find((p) => p.slug === slug));
  const time = (p) => Date.parse(publishedAtOf(p) ?? "") || 0;
  others
    .map((p) => ({ p, s: relatedScore(post, p) }))
    .filter(({ s }) => s > 0)
    .sort((x, y) => y.s - x.s || time(y.p) - time(x.p))
    .forEach(({ p }) => push(p));
  [...others].sort((x, y) => time(y) - time(x)).forEach(push);
  return out;
}

/** Featured articles in the CMS's order (featuredOrder asc, then newest). */
/**
 * The articles published just before and after `post` (by publish date),
 * for the "Previous / Next article" footer. `previous` is older.
 */
export function adjacentPosts(post, candidates) {
  const time = (p) => Date.parse(publishedAtOf(p) ?? "") || 0;
  const sorted = candidates
    .filter((p) => p.id !== post.id && time(p))
    .sort((x, y) => time(x) - time(y) || String(x.id).localeCompare(String(y.id)));
  const t = time(post);
  if (!t) return { previous: null, next: null };
  return {
    previous: [...sorted].reverse().find((p) => time(p) <= t) ?? null,
    next: sorted.find((p) => time(p) > t) ?? null,
  };
}

export function featuredPosts(posts) {
  return posts
    .filter((p) => p.featured && isListed(p))
    .sort(
      (a, b) =>
        (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999) ||
        (Date.parse(publishedAtOf(b) ?? "") || 0) - (Date.parse(publishedAtOf(a) ?? "") || 0),
    );
}

// ── Series ────────────────────────────────────────────────────────────────

/**
 * Live parts of a series in reading order. A post belongs to a series via
 * its `seriesId`; the series' `postIds` sets the order, and members it
 * doesn't list yet follow, oldest first.
 */
export function seriesParts(series, livePostsById) {
  if (!series) return [];
  const ordered = (series.postIds ?? [])
    .map((id) => livePostsById.get(id))
    .filter((p) => p && (!p.seriesId || p.seriesId === series.id));
  const listed = new Set(ordered.map((p) => p.id));
  const time = (p) => Date.parse(publishedAtOf(p) ?? "") || 0;
  const rest = [...livePostsById.values()]
    .filter((p) => p.seriesId === series.id && !listed.has(p.id))
    .sort((a, b) => time(a) - time(b));
  return [...ordered, ...rest];
}

/**
 * Position of `post` within `series` (ordered `postIds`), counting only
 * articles that are live. Returns null when the post isn't part of it.
 */
export function seriesPosition(series, post, livePostsById) {
  const items = seriesParts(series, livePostsById);
  const index = items.findIndex((p) => p.id === post.id);
  if (index === -1) return null;
  return {
    index,
    total: items.length,
    items,
    previous: items[index - 1] ?? null,
    next: items[index + 1] ?? null,
  };
}

// ── Redirects ─────────────────────────────────────────────────────────────

/** Normalises a site path: leading slash, no trailing slash, no query/hash, lowercase. */
export function normalizePath(path) {
  let p = String(path ?? "").trim();
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname;
  } catch {
    return "";
  }
  p = p.split(/[?#]/)[0];
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p.toLowerCase();
}

/**
 * Follows `path` through a redirect map ({ from → { to, statusCode } }) to its
 * final destination. Returns null when there's no redirect or it loops.
 */
export function resolveRedirect(map, path, maxHops = 5) {
  const start = normalizePath(path);
  let current = start;
  let status = 301;
  const visited = new Set([current]);
  for (let hop = 0; hop < maxHops; hop++) {
    const rule = map[current];
    if (!rule) break;
    status = hop === 0 ? (rule.statusCode === 302 ? 302 : 301) : status;
    const next = /^https?:\/\//i.test(rule.to) ? rule.to : normalizePath(rule.to);
    if (visited.has(next)) return null; // loop
    visited.add(next);
    current = next;
    if (/^https?:\/\//i.test(next)) break;
  }
  return current === start ? null : { to: current, statusCode: status };
}

/**
 * Changes needed when content moves from `fromPath` to `toPath`, given the
 * existing redirects ([{ id, from, to }]):
 *   - create from → to (unless one already exists),
 *   - repoint redirects that ended at `fromPath` straight to `toPath` (no chains),
 *   - remove any redirect *from* `toPath`, since real content lives there now
 *     (this is also what prevents A → B → A loops when a slug is changed back).
 */
export function planSlugRedirect(existing, fromPath, toPath) {
  const from = normalizePath(fromPath);
  const to = normalizePath(toPath);
  const plan = { create: null, repoint: [], remove: [] };
  if (!from || !to || from === to) return plan;
  for (const r of existing) {
    const rFrom = normalizePath(r.from);
    const rTo = normalizePath(r.to);
    if (rFrom === to) plan.remove.push(r.id);
    else if (rTo === from) plan.repoint.push({ id: r.id, to });
  }
  const already = existing.some((r) => normalizePath(r.from) === from && normalizePath(r.to) === to);
  const conflicting = existing.filter((r) => normalizePath(r.from) === from && normalizePath(r.to) !== to);
  for (const r of conflicting) if (!plan.remove.includes(r.id)) plan.repoint.push({ id: r.id, to });
  if (!already && !conflicting.length) plan.create = { from, to, statusCode: 301 };
  return plan;
}

// ── Publishing ────────────────────────────────────────────────────────────

/**
 * Why a post can't go live yet (empty list = ready). Same rules the CMS
 * enforces before Publish/Schedule; the scheduler re-checks at publish time.
 */
export function publishBlockers(post) {
  const issues = [];
  if (String(post.title ?? "").trim().length < 5) issues.push("Title must be at least 5 characters");
  if (!SLUG_RE.test(String(post.slug ?? "")))
    issues.push("Slug must be lowercase letters, numbers and hyphens");
  const excerpt = String(post.excerpt ?? "").trim();
  if (excerpt.length < 10 || excerpt.length > 300) issues.push("Excerpt must be 10–300 characters");
  if (stripHtml(post.content).length < 50) issues.push("Content must be at least 50 characters");
  if (post.cover?.url && !String(post.cover.alt ?? "").trim()) issues.push("Cover image needs alt text");
  return issues;
}

// ── Structured data ──────────────────────────────────────────────────────

const abs = (url, baseUrl) => (!url ? undefined : /^https?:\/\//i.test(url) ? url : `${baseUrl}${url}`);

/** schema.org Person for an author profile (falls back to the site owner). */
export function personSchema(author, baseUrl) {
  if (!author) return undefined;
  const sameAs = [
    author.linkedin,
    author.x,
    author.github,
    author.website,
    ...(author.links ?? []).map((l) => l.url),
  ].filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));
  return {
    "@type": "Person",
    name: author.name,
    ...(author.slug ? { url: `${baseUrl}/authors/${author.slug}` } : { url: baseUrl }),
    ...(author.avatar ? { image: abs(author.avatar, baseUrl) } : {}),
    ...(author.title ? { jobTitle: author.title } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/**
 * BlogPosting JSON-LD with everything Google's Article rich result reads:
 * headline, description, image, author, publisher, dates, mainEntityOfPage.
 */
export function articleSchema(post, { baseUrl, author, publisher, series, wordCount }) {
  const url = canonicalOf(post, baseUrl);
  const images = [socialImageOf(post)?.url, coverOf(post)?.url].filter(Boolean);
  const authorNode = personSchema(author, baseUrl) ?? {
    "@type": "Person",
    name: post.author || publisher.name,
    url: baseUrl,
  };
  // The site owner's articles point at the homepage Person entity (publisher.id),
  // so engines credit them to the same "Saad Mazhar" the rest of the site describes.
  if (publisher.id && authorNode.name === publisher.name) authorNode["@id"] = publisher.id;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: seoTitleOf(post).slice(0, 110),
    ...(post.subtitle ? { alternativeHeadline: post.subtitle } : {}),
    description: seoDescriptionOf(post),
    ...(images.length ? { image: [...new Set(images)] } : {}),
    author: authorNode,
    publisher: {
      "@type": "Person",
      ...(publisher.id ? { "@id": publisher.id } : {}),
      name: publisher.name,
      url: baseUrl,
      ...(publisher.logo ? { logo: { "@type": "ImageObject", url: abs(publisher.logo, baseUrl) } } : {}),
    },
    datePublished: publishedAtOf(post),
    dateModified: updatedAtOf(post),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(post.category ? { articleSection: post.category } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
    ...(wordCount ? { wordCount } : {}),
    ...(series
      ? {
          isPartOf: {
            "@type": "CreativeWorkSeries",
            name: series.title,
            url: `${baseUrl}/blog/series/${series.slug}`,
          },
        }
      : {}),
    inLanguage: "en",
  };
}

/**
 * Blog JSON-LD for the blog index (or a category page): the blog itself
 * plus a short BlogPosting entry per listed post, newest first.
 */
export function blogSchema(posts, { baseUrl, name, description, url, publisher, limit = 30 }) {
  const ref = publisher.id
    ? { "@id": publisher.id }
    : { "@type": "Person", name: publisher.name, url: baseUrl };
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name,
    ...(description ? { description } : {}),
    url,
    inLanguage: "en",
    author: ref,
    publisher: ref,
    blogPost: posts
      .filter(isListed)
      .slice(0, limit)
      .map((p) => {
        const image = socialImageOf(p)?.url || coverOf(p)?.url;
        return {
          "@type": "BlogPosting",
          headline: seoTitleOf(p).slice(0, 110),
          description: seoDescriptionOf(p),
          url: canonicalOf(p, baseUrl),
          datePublished: publishedAtOf(p),
          dateModified: updatedAtOf(p),
          ...(image ? { image: abs(image, baseUrl) } : {}),
          ...(p.category ? { articleSection: p.category } : {}),
          author: ref,
        };
      }),
  };
}

// ── Feeds ─────────────────────────────────────────────────────────────────

export function escapeXml(s) {
  return (
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
      // Characters XML 1.0 forbids outright.
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
  );
}

const rfc822 = (iso) => new Date(iso).toUTCString();

const imageMime = (url) => {
  const ext = String(url).split("?")[0].split(".").pop()?.toLowerCase();
  return { png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif" }[ext] ?? "image/jpeg";
};

/** RSS 2.0 for listed, indexable posts, newest first. */
export function buildRss(posts, { baseUrl, title, description, authorsById = new Map(), limit = 50 }) {
  const items = posts
    .filter(isIndexable)
    .sort((a, b) => (Date.parse(publishedAtOf(b) ?? "") || 0) - (Date.parse(publishedAtOf(a) ?? "") || 0))
    .slice(0, limit);
  const lastBuild = items[0] ? rfc822(updatedAtOf(items[0])) : new Date().toUTCString();
  const entry = (p) => {
    const url = `${baseUrl}${articlePath(p)}`;
    const authorName = authorsById.get(p.authorId)?.name || p.author || title;
    const cover = coverOf(p);
    const categories = [p.category, ...(p.tags ?? [])].filter(Boolean);
    return [
      "    <item>",
      `      <title>${escapeXml(p.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <description>${escapeXml(seoDescriptionOf(p))}</description>`,
      `      <pubDate>${rfc822(publishedAtOf(p))}</pubDate>`,
      `      <dc:creator>${escapeXml(authorName)}</dc:creator>`,
      ...categories.map((c) => `      <category>${escapeXml(c)}</category>`),
      ...(cover
        ? [
            `      <media:content url="${escapeXml(cover.url)}" medium="image" type="${imageMime(cover.url)}"${cover.width ? ` width="${cover.width}"` : ""}${cover.height ? ` height="${cover.height}"` : ""} />`,
            `      <enclosure url="${escapeXml(cover.url)}" length="0" type="${imageMime(cover.url)}" />`,
          ]
        : []),
      "    </item>",
    ].join("\n");
  };
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">',
    "  <channel>",
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(`${baseUrl}/blog`)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    "    <language>en</language>",
    `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(`${baseUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    ...items.map(entry),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

const day = (iso) => (iso ? iso.slice(0, 10) : undefined);

function urlXml(loc, lastmod, images = []) {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    ...images.map(
      (img) =>
        `    <image:image><image:loc>${escapeXml(img.url)}</image:loc>${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ""}</image:image>`,
    ),
    "  </url>",
  ].join("\n");
}

/**
 * Blog sitemap: /blog, every indexable article (canonical-to-self only),
 * category, author and series pages that have at least one listed article.
 * Drafts, scheduled, unlisted and no-index posts never appear.
 */
export function buildBlogSitemap({ baseUrl, posts, authors = [], series = [], categories = [] }) {
  const live = posts.filter(isIndexable);
  const latest = live.map(updatedAtOf).filter(Boolean).sort().pop();
  const entries = [urlXml(`${baseUrl}/blog`, day(latest))];
  for (const p of live) {
    // An article that points its canonical elsewhere isn't the indexable copy.
    if (canonicalOf(p, baseUrl) !== `${baseUrl}${articlePath(p)}`) continue;
    const cover = coverOf(p);
    entries.push(
      urlXml(
        `${baseUrl}${articlePath(p)}`,
        day(updatedAtOf(p)),
        cover ? [{ url: cover.url, title: cover.alt || p.title }] : [],
      ),
    );
  }
  const newestIn = (list) => day(list.map(updatedAtOf).filter(Boolean).sort().pop());
  for (const c of categories) {
    const inCat = live.filter((p) => slugify(p.category) === c.slug);
    // Smaller categories are noindex (thin copies of /blog), so they're not submitted.
    if (inCat.length >= CATEGORY_MIN_POSTS)
      entries.push(urlXml(`${baseUrl}/blog/category/${c.slug}`, newestIn(inCat)));
  }
  for (const a of authors) {
    const byAuthor = live.filter((p) => p.authorId === a.id);
    if (a.slug && byAuthor.length) entries.push(urlXml(`${baseUrl}/authors/${a.slug}`, newestIn(byAuthor)));
  }
  const liveById = new Map(live.map((p) => [p.id, p]));
  for (const s of series) {
    const parts = seriesParts(s, liveById);
    if (s.published && s.slug && parts.length)
      entries.push(urlXml(`${baseUrl}/blog/series/${s.slug}`, newestIn(parts)));
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

/**
 * A category page is indexed (and listed in the blog sitemap) once it has this
 * many listed articles. Below that it's `noindex, follow`.
 */
export const CATEGORY_MIN_POSTS = 3;

/** Unique category list ({ slug, label }) from posts, in first-seen order. */
export function categoriesOf(posts) {
  const seen = new Map();
  for (const p of posts) {
    const slug = slugify(p.category);
    if (slug && !seen.has(slug)) seen.set(slug, { slug, label: p.category });
  }
  return [...seen.values()];
}

/** Same words, ignoring case, punctuation and spacing ("A: B!" equals "a b"). */
export function sameText(a, b) {
  const norm = (s) =>
    String(s ?? "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  const x = norm(a);
  return x.length > 0 && x === norm(b);
}
