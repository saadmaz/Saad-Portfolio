/**
 * Microsoft Clarity (heatmaps and session replays). Clarity's own snippet is
 * an inline script; loading it from here keeps the CSP free of another inline
 * hash. It starts after the page has loaded so it never competes with first
 * paint, and only on the live domain (not localhost or *.pages.dev previews).
 * The project ID is public, like the GA4 measurement ID.
 */

const CLARITY_PROJECT_ID = "zjtyglo1nd";

type ClarityQueue = ((...args: unknown[]) => void) & { q?: unknown[][] };

export function loadClarity(win: Window = window) {
  const host = win.location.hostname;
  if (host !== "saadmaz.com" && !host.endsWith(".saadmaz.com")) return;
  const w = win as Window & { clarity?: ClarityQueue };
  if (w.clarity) return;
  const queue: ClarityQueue = (...args: unknown[]) => {
    (queue.q ??= []).push(args);
  };
  w.clarity = queue;
  const start = () => {
    const s = win.document.createElement("script");
    s.async = true;
    s.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
    win.document.head.appendChild(s);
  };
  if (win.document.readyState === "complete") start();
  else win.addEventListener("load", start, { once: true });
}
