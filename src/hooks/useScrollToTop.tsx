import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook that scrolls to the top of the page on route changes.
 * Place this in a component that's rendered on every page (like Layout or App).
 */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
}

/**
 * Component version for use in the Router context
 */
export function ScrollToTop() {
  useScrollToTop();
  return null;
}
