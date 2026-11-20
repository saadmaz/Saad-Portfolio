/**
 * Vercel Routing Middleware: server-side redirects for moved content.
 *
 * Redirect rules live in Firestore (`redirects`, managed by the CMS and
 * created automatically when a published article's slug changes).
 * scripts/prerender.mjs snapshots them into /redirects.json at build time;
 * publishing triggers a rebuild through the deploy hook, so the snapshot
 * follows changes within a build. Rules created since the last build are
 * still honoured client-side (BlogDetailPage → RedirectService) until then.
 *
 * Only page requests run this (see matcher); assets, API and files skip it.
 */

import { resolveRedirect } from "./src/lib/article-core.js";

export const config = {
  matcher: ["/((?!api/|assets/|og/|sitemaps/|_vercel|.*\\.[a-z0-9]+$).*)"],
};

type RedirectMap = Record<string, { to: string; statusCode?: number }>;

const TTL_MS = 60_000;
let cache: { at: number; map: RedirectMap } | null = null;

async function redirectMap(origin: string): Promise<RedirectMap> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map;
  try {
    const res = await fetch(`${origin}/redirects.json`, { headers: { accept: "application/json" } });
    const map = res.ok ? ((await res.json()) as RedirectMap) : {};
    cache = { at: Date.now(), map };
    return map;
  } catch {
    return cache?.map ?? {};
  }
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  const map = await redirectMap(url.origin);
  if (!Object.keys(map).length) return undefined;
  const hit = resolveRedirect(map, url.pathname);
  if (!hit) return undefined;
  const target = /^https?:\/\//i.test(hit.to) ? hit.to : `${url.origin}${hit.to}${url.search}`;
  return Response.redirect(target, hit.statusCode);
}
