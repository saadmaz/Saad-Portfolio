/**
 * Cloudflare Pages middleware: runs before every request.
 *
 *  1. /api/* goes straight to its function (functions/api/*).
 *  2. Redirects: fixed moves below, trailing slashes, then the CMS rules in
 *     /redirects.json (written by scripts/prerender.mjs from Firestore
 *     `redirects` plus id → slug aliases).
 *  3. Live routes: /rss.xml, /feed.xml, /sitemaps/blog.xml (server/feed.ts)
 *     and /blog/:slug (server/blog-page.ts, live share metadata).
 *  4. Static files, with fallbacks: a missing /og card → the home card, a
 *     missing /share-image → the blog card.
 *  5. Real 404s: a page path that isn't in /routes.json (everything
 *     prerendered) and doesn't exist in Firestore gets HTTP 404 with the
 *     site's not-found page, not a 200 "soft 404". Anything else is the app.
 *
 * Fails open: if a check can't be made, the request is served normally.
 */

import { bindEnv, runHandler, type PagesContext, type PagesEnv } from "../server/_lib/adapter";
import feed from "../server/feed";
import blogPage from "../server/blog-page";
import { resolveRedirect } from "../src/lib/article-core.js";
import { classifyPath, type ContentKind } from "../src/lib/edge-routing.js";
import { PREVIEW_HEADERS, SECURITY_HEADERS } from "../src/lib/security-headers.js";

/** Moved URLs that aren't CMS content. */
const FIXED_REDIRECTS: Record<string, string> = {
  "/languages": "/about#languages",
  "/logo.png": "/icons/logo-v4-512.png",
  "/favicon.svg": "/icons/favicon-v4.svg",
  "/app-icon.svg": "/apple-touch-icon.png",
  "/blog/ai-for-customer-success-how-smart-companies-turn-support-into-a-retention-engine": "/blog",
  "/blog/yc-partner-in-your-pocket-claude-problem-validation": "/blog",
};

type RedirectMap = Record<string, { to: string; statusCode?: number }>;

const TTL_MS = 60_000;
const cache = new Map<string, { at: number; value: unknown }>();

function withHeaders(res: Response, headers: Record<string, string>, drop: string[] = []): Response {
  const out = new Response(res.body, res);
  for (const h of drop) out.headers.delete(h);
  for (const [k, v] of Object.entries(headers)) out.headers.set(k, v);
  return out;
}

async function asset(env: PagesEnv, origin: string, path: string): Promise<Response | null> {
  if (!env.ASSETS) return null;
  try {
    const res = await env.ASSETS.fetch(`${origin}${path}`);
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

async function cachedJson<T>(env: PagesEnv, origin: string, file: string, fallback: T): Promise<T> {
  const hit = cache.get(file);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  const res = await asset(env, origin, `/${file}`);
  if (!res) return (hit?.value as T) ?? fallback;
  try {
    const value = (await res.json()) as T;
    cache.set(file, { at: Date.now(), value });
    return value;
  } catch {
    return (hit?.value as T) ?? fallback;
  }
}

// ── Firestore existence checks (public REST API, same rules as the site) ──

const FIRESTORE = () => {
  const project = process.env.FIREBASE_PROJECT_ID;
  return project
    ? `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`
    : null;
};

type Filter = { field: string; value: string | boolean };

async function anyMatch(base: string, collection: string, filters: Filter[]): Promise<boolean> {
  const conds = filters.map((f) => ({
    fieldFilter: {
      field: { fieldPath: f.field },
      op: "EQUAL",
      value: typeof f.value === "boolean" ? { booleanValue: f.value } : { stringValue: f.value },
    },
  }));
  const res = await fetch(`${base}:runQuery`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: conds.length === 1 ? conds[0] : { compositeFilter: { op: "AND", filters: conds } },
        limit: 1,
      },
    }),
  });
  if (!res.ok) throw new Error(`query ${res.status}`);
  const rows = (await res.json()) as { document?: unknown }[];
  return rows.some((r) => r.document);
}

async function docExists(base: string, collection: string, id: string): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return false;
  const res = await fetch(`${base}/${collection}/${id}`);
  if (res.status === 200) return true;
  if (res.status === 404 || res.status === 403) return false; // 403: unpublished (rules)
  throw new Error(`get ${res.status}`);
}

/** true / false, or null when it couldn't be determined (→ serve normally). */
async function contentExists(kind: ContentKind, key: string): Promise<boolean | null> {
  const base = FIRESTORE();
  if (!base) return null;
  const cacheKey = `exists:${kind}:${key}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as boolean;
  try {
    let found: boolean;
    switch (kind) {
      case "post":
        found =
          (await anyMatch(base, "blog_posts", [
            { field: "slug", value: key },
            { field: "published", value: true },
          ])) || (await docExists(base, "blog_posts", key));
        break;
      case "event":
        found =
          (await docExists(base, "events", key)) ||
          (await anyMatch(base, "events", [{ field: "slug", value: key }]));
        break;
      case "certificate":
        found =
          (await docExists(base, "certificates", key)) ||
          (await anyMatch(base, "certificates", [{ field: "slug", value: key }]));
        break;
      case "project":
        found = await anyMatch(base, "projects", [{ field: "slug", value: key }]);
        break;
      case "author":
        found = await anyMatch(base, "authors", [{ field: "slug", value: key }]);
        break;
      case "series":
        found = await anyMatch(base, "blog_series", [
          { field: "slug", value: key },
          { field: "published", value: true },
        ]);
        break;
      default:
        return null; // categories and experience slugs are derived (no stored field); let the page decide
    }
    cache.set(cacheKey, { at: Date.now(), value: found });
    return found;
  } catch {
    return null;
  }
}

async function notFound(env: PagesEnv, origin: string): Promise<Response> {
  const page = await asset(env, origin, "/404.html");
  return new Response(page ? await page.text() : "Not found", {
    status: 404,
    headers: {
      ...SECURITY_HEADERS,
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "x-robots-tag": "noindex",
    },
  });
}

/** The app shell for client-rendered routes (Pages serves 404.html otherwise). */
async function appShell(env: PagesEnv, origin: string, path: string): Promise<Response | null> {
  const shell = await asset(env, origin, "/index.html");
  if (!shell) return null;
  const res = new Response(shell.body, { status: 200, headers: shell.headers });
  return path.startsWith("/preview/")
    ? withHeaders(res, PREVIEW_HEADERS, ["X-Frame-Options"])
    : withHeaders(res, SECURITY_HEADERS);
}

export const onRequest = async (ctx: PagesContext): Promise<Response> => {
  const { request, env, next } = ctx;
  bindEnv(env);
  const url = new URL(request.url);
  const { origin, pathname: path } = url;

  if (path.startsWith("/api/")) return next();

  const fixed = FIXED_REDIRECTS[path];
  if (fixed) return Response.redirect(`${origin}${fixed}`, 301);
  if (path.length > 1 && path.endsWith("/"))
    return Response.redirect(`${origin}${path.replace(/\/+$/, "")}${url.search}`, 301);

  if (path === "/rss.xml" || path === "/feed.xml") return runHandler(feed, request, env, { type: "rss" });
  if (path === "/sitemaps/blog.xml") return runHandler(feed, request, env, { type: "sitemap" });

  if (path.startsWith("/share-image/")) {
    const res = await next();
    return res.ok ? res : Response.redirect(`${origin}/og/blog.png`, 302);
  }
  if (path.startsWith("/og/")) {
    const res = await next();
    if (res.ok) return res;
    return (await asset(env, origin, "/og/home.png")) ?? res;
  }
  // Any other file (has an extension): serve as-is, including Pages' 404.
  if (/\.[A-Za-z0-9]+$/.test(path)) return next();

  const redirects = await cachedJson<RedirectMap>(env, origin, "redirects.json", {});
  const hit = Object.keys(redirects).length ? resolveRedirect(redirects, path) : null;
  if (hit) {
    const target = /^https?:\/\//i.test(hit.to) ? hit.to : `${origin}${hit.to}${url.search}`;
    return Response.redirect(target, hit.statusCode ?? 301);
  }

  const routes = await cachedJson<string[]>(env, origin, "routes.json", []);
  if (routes.length) {
    const verdict = classifyPath(path, new Set(routes));
    if (verdict.type === "lookup" && (await contentExists(verdict.kind, verdict.key)) === false)
      return notFound(env, origin);
    if (verdict.type === "missing") return notFound(env, origin);
  }

  const post = path.match(/^\/blog\/([^/]+)$/);
  if (post) {
    const res = await runHandler(blogPage, request, env, { slug: decodeURIComponent(post[1]) });
    return withHeaders(res, SECURITY_HEADERS);
  }

  const res = await next();
  if (res.status !== 404) return res;
  return (await appShell(env, origin, path)) ?? res;
};
