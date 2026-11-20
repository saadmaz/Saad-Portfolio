/**
 * GET /blog/:slug  (rewritten here by vercel.json)
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

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminDb, hasAdminCredentials } from "./_lib/firebase.js";
import { allowMethods } from "./_lib/http.js";
import { canonicalOf, coverOf, SLUG_RE, seoDescriptionOf, seoTitleOf } from "../src/lib/article-core.js";
import { BASE_URL, SITE_NAME } from "../src/lib/seo-content.js";
import { applyHeadMeta, escapeHtml, POST_PAGES_DIR } from "../src/lib/share-meta.js";
import type { HeadMeta, ShareImage } from "../src/lib/share-meta.js";
import type { BlogPost } from "../src/types/blog.js";

const CACHE_OK = "public, max-age=0, s-maxage=60, stale-while-revalidate=86400";
const CACHE_MISS = "public, max-age=0, s-maxage=60";
/** Generic blog card, drawn by every build. */
const BLOG_CARD = `${BASE_URL}/og/blog.png`;

type Post = Partial<BlogPost> & { id: string; title: string };

/** Share image: the uploaded social image, else (only when the build has no card for this post) the cover. */
export function shareImageOf(post: Post, hasBuiltCard: boolean): ShareImage | null {
  const alt = (img: { alt?: string } | undefined) => img?.alt || post.title;
  if (post.socialImage?.url) return { ...post.socialImage, alt: alt(post.socialImage) };
  if (hasBuiltCard) return null; // keep the prerendered page's generated card
  const cover = coverOf(post);
  if (cover?.url) return { url: cover.url, width: cover.width, height: cover.height, alt: alt(cover) };
  return { url: BLOG_CARD, width: 1200, height: 630, alt: post.title };
}

export function postHeadMeta(post: Post, hasBuiltCard: boolean): HeadMeta {
  return {
    title: `${seoTitleOf(post)} - ${SITE_NAME}`,
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

/** Published post by slug: the post, null when there's none, undefined when the lookup failed. */
async function findPost(slug: string): Promise<Post | null | undefined> {
  if (!hasAdminCredentials()) return undefined;
  try {
    const snap = await adminDb().collection("blog_posts").where("slug", "==", slug).limit(5).get();
    const doc = snap.docs.find((d) => d.get("published") === true);
    return doc ? ({ ...doc.data(), id: doc.id } as Post) : null;
  } catch (err) {
    console.error("[blog-page] Firestore lookup failed:", err);
    return undefined;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET", "HEAD"])) return;

  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "");
  const proto = String(req.headers["x-forwarded-proto"] ?? "https").split(",")[0];
  const origin = host ? `${proto}://${host}` : BASE_URL;
  // Forwarded so static reads also work on protected preview deployments.
  const fwd: Record<string, string> = {};
  for (const h of ["cookie", "x-vercel-protection-bypass"]) {
    const v = req.headers[h];
    if (typeof v === "string") fwd[h] = v;
  }
  const loadStatic = async (path: string): Promise<string | null> => {
    try {
      const r = await fetch(`${origin}${path}`, { headers: fwd, signal: AbortSignal.timeout(8000) });
      return r.ok ? await r.text() : null;
    } catch {
      return null;
    }
  };

  const slug = String(req.query.slug ?? "").toLowerCase();
  const valid = SLUG_RE.test(slug);
  const [prerendered, post] = valid
    ? await Promise.all([loadStatic(`/${POST_PAGES_DIR}/${slug}.html`), findPost(slug)])
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
