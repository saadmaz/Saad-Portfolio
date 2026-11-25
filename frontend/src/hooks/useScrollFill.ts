import { useEffect, useRef, useState } from "react";

/** 0→1 as the element scrolls past 65% of the viewport; drives rails that fill while reading. */
export function useScrollFill<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setFill(1);
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      setFill(Math.min(1, Math.max(0, (window.innerHeight * 0.65 - r.top) / Math.max(1, r.height))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return [ref, fill] as const;
}
