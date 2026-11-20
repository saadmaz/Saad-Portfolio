import { useEffect, useRef, type RefObject } from "react";

/**
 * Thin accent bar under the header that fills as the article is read.
 * One passive scroll listener, coalesced to a frame, writing only a
 * transform: no React re-renders and no layout thrash while scrolling.
 */
export function ReadingProgress({ target }: { target: RefObject<HTMLElement> }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = target.current;
      if (!el || !bar.current) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total <= 0 ? (rect.top < 0 ? 1 : 0) : Math.min(1, Math.max(0, -rect.top / total));
      bar.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-accent will-change-transform" />
    </div>
  );
}
