/**
 * GET /blog/:slug  (routed here by functions/_middleware.ts)
 *
 * Serves an article page with its title, description, canonical and share
 * image taken live from Firestore, so link previews (WhatsApp, LinkedIn, X,
 * Facebook, Slack…) are right as soon as a post is published or its social
 * image changes, instead of only after the next site rebuild.
 *
 * The body is the build-time prerender (dist/_prerendered/blog/<slug>.html)
 * when it exists; for a post newer than the last build it's the app shell
 * plus the article itself. React replaces either for visitors.
 *
 * CDN-cached for a minute. If Firestore can't be reached the prerendered
 * page (or the shell) is served unchanged, so the page never goes down.
 */

import type { ApiRequest, ApiResponse } from "./_lib/adapter.js";
import { createHash } from "node:crypto";
import { allowMethods } from "./_lib/http.js";
import { findPublishedPost, type Post } from "./_lib/posts.js";
import { canonicalOf, coverOf, SLUG_RE, seoDescriptionOf, seoTitleOf } from "../src/lib/article-core.js";
import { BASE_URL, SITE_NAME, pageTitle } from "../src/lib/seo-content.js";
import { applyHeadMeta, escapeHtml, POST_PAGES_DIR } from "../src/lib/share-meta.js";
import type { HeadMeta, ShareImage } from "../src/lib/share-meta.js";

const CACHE_OK = "public, max-age=0, s-maxage=60, stale-while-revalidate=86400";
const CACHE_MISS = "public, max-age=0, s-maxage=60";
/** Generic blog card, drawn by every build. */
const BLOG_CARD = `${BASE_URL}/og/blog.png`;

/**
 * A post image converted at build time (scripts/prerender.mjs) to a 1200×630
 * JPEG on our own domain; until the next build it falls back to the blog card. ?v= changes with the source URL (uploads get a new token), so a
 * replaced image gets a new URL that link-preview caches must fetch again.
 */
export function shareImageUrl(slug: string, sourceUrl: string): string {
  const v = createHash("sha256").update(sourceUrl).digest("hex").slice(0, 12);
  return `${BASE_URL}/share-image/${slug}.jpg?v=${v}`;
}

/** Share image: the uploaded social image, else (only when the build has no card for this post) the cover. */
export function shareImageOf(post: Post, hasBuiltCard: boolean): ShareImage | null {
  const source = post.socialImage?.url ? post.socialImage : hasBuiltCard ? null : coverOf(post);
  if (source?.url && post.slug) {
    return {
      url: shareImageUrl(post.slug, source.url),
      width: 1200,
      height: 630,
      alt: source.alt || post.title,
    };
  }
  if (hasBuiltCard) return null; // keep the prerendered page's generated card
  return { url: BLOG_CARD, width: 1200, height: 630, alt: post.title };
}

export function postHeadMeta(post: Post, hasBuiltCard: boolean): HeadMeta {
  return {
    title: pageTitle(seoTitleOf(post)),
    description: seoDescriptionOf(post) || `"${post.title}" by ${post.author || SITE_NAME}.`,
    url: `${BASE_URL}/blog/${post.slug}`,
    canonical: canonicalOf(post, BASE_URL),
    type: "article",
    noIndex: !!post.unlisted || !!post.noIndex,
    image: shareImageOf(post, hasBuiltCard),
  };
}

/** Crawler copy for a post the last build didn't prerender (mirrors prerenderPosts, minus extras). */
export function injectArticle(shell: string, post: Post): string {
  const parts = [
    `<header>\n<h1>${escapeHtml(post.title)}</h1>\n<p>${escapeHtml(seoDescriptionOf(post))}</p>\n</header>`,
    `<main>\n<article>\n${post.subtitle ? `<p><strong>${escapeHtml(post.subtitle)}</strong></p>\n` : ""}${post.content ?? ""}\n</article>\n<p><a href="/blog">All writing</a></p>\n</main>`,
  ].join("\n");
  return shell.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    () => `<div id="root"><div data-prerendered>${parts}</div></div>`,
  );
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["GET", "HEAD"])) return;

  const loadStatic = async (path: string): Promise<string | null> => {
    const r = await req.asset?.(path);
    return r ? await r.text() : null;
  };

  const slug = String(req.query.slug ?? "").toLowerCase();
  const valid = SLUG_RE.test(slug);
  const [prerendered, post] = valid
    ? await Promise.all([loadStatic(`/${POST_PAGES_DIR}/${slug}.html`), findPublishedPost(slug)])
    : [null, null];

  const send = (status: number, html: string, cache: string) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", cache);
    return res.status(status).send(req.method === "HEAD" ? "" : html);
  };

  // Lookup failed: serve what the build made (or the shell) unchanged.
  if (post === undefined) {
    const page = prerendered ?? (await loadStatic("/index.html"));
    return page ? send(200, page, CACHE_MISS) : res.status(502).send("Page unavailable");
  }

  // Not published (or never existed): the app shows its not-found state.
  if (post === null) {
    const shell = await loadStatic("/index.html");
    return shell ? send(404, shell, CACHE_MISS) : res.status(404).send("Not found");
  }

  const base = prerendered ?? (await loadStatic("/index.html"));
  if (!base) return res.status(502).send("Page unavailable");
  const withBody = prerendered ? base : injectArticle(base, post);
  return send(200, applyHeadMeta(withBody, postHeadMeta(post, !!prerendered)), CACHE_OK);
}
