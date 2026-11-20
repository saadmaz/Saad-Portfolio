/**
 * First-party analytics beacons (see api/track.ts). Fire-and-forget:
 * failures are ignored and never affect the page. Respects Do Not Track
 * and Global Privacy Control in the browser too.
 */

type Event =
  | { t: "view"; postId: string; ref?: string }
  | { t: "engage"; postId: string; ms: number; depth: number }
  | { t: "404"; path: string; ref?: string };

const optedOut = () => {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
};

export function track(event: Event) {
  if (typeof navigator === "undefined" || optedOut() || import.meta.env.DEV) return;
  const body = JSON.stringify(event);
  try {
    // text/plain keeps sendBeacon a "simple" request (no CORS preflight).
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) return;
  } catch {
    // fall through to fetch
  }
  fetch("/api/track", {
    method: "POST",
    body,
    keepalive: true,
    headers: { "Content-Type": "text/plain" },
  }).catch(() => undefined);
}
