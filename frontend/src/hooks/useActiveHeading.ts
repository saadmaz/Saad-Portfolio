import { useEffect, useState } from "react";
import type { ContentHeading } from "@/components/CmsContent";

/** Id of the heading the reader is currently in, tracked with one IntersectionObserver. */
export function useActiveHeading(headings: ContentHeading[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        // The first heading in view; else the last one scrolled past.
        const inView = els.find((el) => visible.get(el.id));
        if (inView) return setActive(inView.id);
        const above = els.filter((el) => el.getBoundingClientRect().top < 0).pop();
        if (above) setActive(above.id);
      },
      { rootMargin: "-88px 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);
  return active;
}
