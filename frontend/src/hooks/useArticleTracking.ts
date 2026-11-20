import { useEffect, type RefObject } from "react";
import { track } from "@/services/track-service";

/**
 * Records one view per article visit, then engaged time (only while the tab
 * is visible) and the deepest scroll position when the reader leaves.
 */
export function useArticleTracking(
  postId: string | undefined,
  article: RefObject<HTMLElement>,
  enabled = true,
) {
  useEffect(() => {
    if (!postId || !enabled) return;
    track({ t: "view", postId, ref: document.referrer || undefined });

    let engagedMs = 0;
    let since = document.visibilityState === "visible" ? performance.now() : 0;
    let maxDepth = 0;
    let sent = false;

    const measureDepth = () => {
      const el = article.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const seen = window.innerHeight - rect.top;
      maxDepth = Math.max(maxDepth, Math.min(100, Math.max(0, (seen / rect.height) * 100)));
    };
    const flush = () => {
      if (since) engagedMs += performance.now() - since;
      since = 0;
      if (sent || engagedMs < 1000) return;
      sent = true;
      track({ t: "engage", postId, ms: Math.round(engagedMs), depth: Math.round(maxDepth) });
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else since = performance.now();
    };

    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measureDepth();
        });
    };
    measureDepth();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [postId, article, enabled]);
}
