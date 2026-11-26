import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

type Gtag = (command: "event", name: string, params: Record<string, unknown>) => void;

/**
 * GA4 page_view for client-side navigations. The gtag snippet in index.html only
 * records the landing page; SPA route changes never reload it. The first render is
 * skipped so the landing page isn't counted twice. If "Page changes based on browser
 * history events" is turned on in GA's enhanced measurement, remove this to avoid doubles.
 */
export function GaPageViews() {
  const { pathname, search } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Wait for react-helmet-async (and lazy routes) to set the new <title>.
    const timer = window.setTimeout(() => {
      const gtag = (window as Window & { gtag?: Gtag }).gtag;
      gtag?.("event", "page_view", {
        page_location: window.location.href,
        page_path: pathname + search,
        page_title: document.title,
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [pathname, search]);

  return null;
}
