/**
 * Vercel Routing Middleware for page requests:
 *
 * 1. Redirects - moved content and old URL formats get a real 301/302.
 *    Rules come from /redirects.json, written by scripts/prerender.mjs from
 *    Firestore `redirects` plus id → slug aliases for events, certificates
 *    and articles.
 *
 * 2. Real 404s - a URL that doesn't exist gets HTTP 404 (with the site's
 *    not-found page) instead of a 200 that only *looks* like a 404, which
 *    search engines report as a "soft 404". Known pages come from
 *    /routes.json (everything prerendered). Detail URLs that aren't in it
 *    may have been published since the last build, so they're checked
 *    against Firestore before answering 404.
 *
 * Fails open: if anything can't be loaded or checked, the request is
 * served normally. A glitch must never turn a real page into a 404.
 */

import { resolveRedirect } from "./src/lib/article-core.js";
import { classifyPath, type ContentKind } from "./src/lib/edge-routing.js";

export const config = {
  matcher: ["/((?!api/|assets/|og/|sitemaps/|icons/|_vercel|.*\\.[a-z0-9]+$).*)"],
};

type RedirectMap = Record<string, { to: string; statusCode?: number }>;

const TTL_MS = 60_000;
const cache = new Map<string, { at: number; value: unknown }>();

async function cachedJson<T>(origin: string, file: string, fallback: T): Promise<T> {
  const hit = cache.get(file);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  try {
    const res = await fetch(`${origin}/${file}`, { headers: { accept: "application/json" } });
    const value = res.ok ? ((await res.json()) as T) : fallback;
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

async function notFound(origin: string): Promise<Response | undefined> {
  try {
    const page = await fetch(`${origin}/404.html`);
    if (!page.ok) return undefined;
    return new Response(await page.text(), {
      status: 404,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
        "x-robots-tag": "noindex",
      },
    });
  } catch {
    return undefined;
  }
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);

  const redirects = await cachedJson<RedirectMap>(url.origin, "redirects.json", {});
  const hit = Object.keys(redirects).length ? resolveRedirect(redirects, url.pathname) : null;
  if (hit) {
    const target = /^https?:\/\//i.test(hit.to) ? hit.to : `${url.origin}${hit.to}${url.search}`;
    return Response.redirect(target, hit.statusCode);
  }

  const routes = await cachedJson<string[]>(url.origin, "routes.json", []);
  if (!routes.length) return undefined; // no route list: fail open
  const verdict = classifyPath(url.pathname, new Set(routes));
  if (verdict.type === "known" || verdict.type === "pass") return undefined;
  if (verdict.type === "lookup") {
    const exists = await contentExists(verdict.kind, verdict.key);
    if (exists !== false) return undefined;
  }
  return notFound(url.origin);
}
