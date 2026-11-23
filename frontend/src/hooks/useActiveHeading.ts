import { useEffect, useState } from "react";

/**
 * Id of the section the reader is currently in (headings and prompt cards),
 * tracked with one IntersectionObserver.
 */
export function useActiveHeading(items: { id: string }[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = items
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => !!el)
      // Headings and prompts arrive as separate lists: track in reading order.
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
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
  }, [items]);
  return active;
}
