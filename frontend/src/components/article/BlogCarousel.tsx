import { useEffect } from "react";
import type { Carousel } from "@/hooks/useCarousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types";
import { BlogCard } from "./BlogCard";

const ARROW =
  "flex size-11 items-center justify-center rounded-full bg-fg text-[rgb(var(--bg))] transition-[transform,opacity] hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-25";

/** Prev/next buttons; hidden when every card already fits. */
export function CarouselArrows({ carousel, label }: { carousel: Carousel; label: string }) {
  const { atStart, atEnd, step } = carousel;
  if (atStart && atEnd) return null;
  return (
    <div className="flex gap-2.5" role="group" aria-label={`${label} controls`}>
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={atStart}
        aria-label={`Previous ${label}`}
        className={ARROW}
      >
        <ArrowLeft aria-hidden className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={atEnd}
        aria-label={`Next ${label}`}
        className={ARROW}
      >
        <ArrowRight aria-hidden className="size-5" />
      </button>
    </div>
  );
}

/**
 * A horizontal row of blog cards that only moves when asked: arrows, swipe, trackpad,
 * or mouse drag. Cards snap into place; the first card lines up with the page content.
 */
export function BlogCarousel({
  posts,
  wpm,
  typeOf,
  carousel,
}: {
  posts: BlogPost[];
  wpm: number;
  typeOf?: (p: BlogPost) => string | undefined;
  carousel: Carousel;
}) {
  const { ref, update } = carousel;

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
  }, [ref, update, posts.length]);

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Latest writing"
      // Side padding = the .wrap gutter, growing with the centred 1200px column on wide screens.
      className="flex cursor-grab select-none snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto overscroll-x-contain px-5 pb-6 pt-2 [scrollbar-width:none] active:cursor-grabbing sm:scroll-px-8 sm:px-8 lg:scroll-px-[max(3rem,calc((100%-81rem)/2+3rem))] lg:px-[max(3rem,calc((100%-81rem)/2+3rem))] [&::-webkit-scrollbar]:hidden"
    >
      {posts.map((p) => (
        <BlogCard
          key={p.id}
          post={p}
          wpm={wpm}
          typeLabel={typeOf?.(p)}
          className="aspect-[5/7] w-[280px] shrink-0 snap-start sm:aspect-[3/4] sm:w-[320px] lg:w-[340px]"
        />
      ))}
    </div>
  );
}
