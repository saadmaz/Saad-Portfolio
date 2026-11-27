import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types";
import { BlogCard } from "./BlogCard";

/**
 * A horizontal row of blog cards that only moves when asked: prev/next buttons,
 * swipe, trackpad, or mouse drag. Cards snap into place.
 */
export function BlogCarousel({
  posts,
  wpm,
  typeOf,
}: {
  posts: BlogPost[];
  wpm: number;
  typeOf?: (p: BlogPost) => string | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // Mouse drag to scroll; a drag never counts as a click on the card underneath.
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      el.style.scrollSnapType = "";
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [update, posts.length]);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduce ? "auto" : "smooth" });
  };

  const arrow =
    "flex size-12 items-center justify-center rounded-full bg-fg text-[rgb(var(--bg))] transition-[transform,opacity] hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-25";

  return (
    <div>
      <div
        ref={ref}
        role="region"
        aria-label="Latest writing"
        className="flex cursor-grab select-none snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto overscroll-x-contain px-5 py-4 [scrollbar-width:none] active:cursor-grabbing sm:scroll-px-8 sm:px-8 lg:scroll-px-12 lg:px-12 [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((p) => (
          <BlogCard
            key={p.id}
            post={p}
            wpm={wpm}
            typeLabel={typeOf?.(p)}
            className="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-[340px]"
          />
        ))}
      </div>
      {!(atStart && atEnd) && (
        <div className="wrap mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Previous articles"
            className={arrow}
          >
            <ArrowLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="Next articles"
            className={arrow}
          >
            <ArrowRight aria-hidden className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
