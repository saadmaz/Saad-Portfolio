/** Links to this site (any of its hosts) stay in the same tab, as in-app routes. */

const OWN_HOST = /^(www\.)?saadmaz\.com$/i;

/** The in-app path for an absolute link to this site, or null for anything else. */
export function internalPath(href: string): string | null {
  if (!/^https?:\/\//i.test(href)) return null;
  try {
    const url = new URL(href);
    // globalThis, not window: this module is also typechecked without DOM types (tsconfig.api.json).
    const here = (globalThis as { location?: { origin: string } }).location;
    const sameOrigin = !!here && url.origin === here.origin;
    if (!OWN_HOST.test(url.hostname) && !sameOrigin) return null;
    return `${url.pathname}${url.search}${url.hash}` || "/";
  } catch {
    return null;
  }
}

/** True for http(s) links that leave this site. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) && internalPath(href) === null;
}
