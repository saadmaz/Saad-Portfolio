import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { loadClarity } from "@/lib/clarity";
// Geist + Geist Mono, self-hosted (bundled woff2, same origin): no render-blocking
// request to Google Fonts. One variable file covers every weight; the browser only
// downloads the unicode subsets a page actually uses.
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";

const rootElement = document.getElementById("root")!;

// The build's prerender step (scripts/prerender.mjs) and the static tags in
// index.html both write real <title>/canonical/meta/JSON-LD into <head> so
// crawlers that don't run JS see correct SEO tags. Once JS does run, <SEO>
// (react-helmet-async) takes over and renders its own copy of the same tags
// for the current route - but Helmet only manages tags it renders itself,
// it has no way to know the ones already sitting in <head> are equivalent,
// so without this cleanup every tag below ends up duplicated. Removing the
// pre-hydration copies here, once, before Helmet ever mounts, keeps exactly
// one of each in the final DOM.
function stripPrerenderedSeoTags() {
  const selector = [
    'link[rel="canonical"]',
    'meta[name="description"]',
    'meta[name="keywords"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'script[type="application/ld+json"]',
  ].join(", ");
  document.head.querySelectorAll(selector).forEach((el) => el.remove());
}
stripPrerenderedSeoTags();

// Always a fresh client-side mount. The build's prerender step
// (scripts/prerender.mjs) writes crawler-visible static HTML into this
// element for search engines and other non-JS clients; it isn't meant to
// be hydrated - React replaces it here as soon as the bundle loads.
createRoot(rootElement).render(<App />);
loadClarity();
