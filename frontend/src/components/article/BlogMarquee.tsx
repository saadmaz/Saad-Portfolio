import { useEffect, useRef } from "react";
import type { BlogPost } from "@/types";
import { BlogCard } from "./BlogCard";

const SPEED = 0.035; // px per ms (~35px/s)
const MIN_CARDS = 8; // repeat short lists so one copy is wider than any screen

/**
 * A horizontally scrolling strip of blog cards that drifts on its own and loops.
 * Pauses on hover, focus and touch; swipe, trackpad and mouse-drag scroll it by hand.
 * Stays still for visitors who prefer reduced motion.
 */
export function BlogMarquee({
  posts,
  wpm,
  typeOf,
}: {
  posts: BlogPost[];
  wpm: number;
  typeOf?: (p: BlogPost) => string | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const loop = posts.length > 1;
  const reps = loop ? Math.max(1, Math.ceil(MIN_CARDS / posts.length)) : 1;
  const copy = Array.from({ length: reps }, () => posts).flat();
  // Two identical halves: when the first scrolls fully out, jump back by one half (seamless).
  const items = loop ? [...copy, ...copy] : copy;

  useEffect(() => {
    const el = ref.current;
    if (!el || !loop) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pos = el.scrollLeft;
    let last = performance.now();
    let raf = 0;
    let resumeTimer = 0;

    const half = () => el.scrollWidth / 2;
    const tick = (t: number) => {
      const dt = Math.min(t - last, 50);
      last = t;
      if (!paused.current && !reduce) {
        pos += SPEED * dt;
        if (pos >= half()) pos -= half();
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => {
      window.clearTimeout(resumeTimer);
      paused.current = true;
    };
    const resume = (delay = 0) => {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        // Wrap after manual scrolling so the loop never runs out in either direction.
        const h = half();
        if (el.scrollLeft >= h) el.scrollLeft -= h;
        else if (el.scrollLeft <= 0) el.scrollLeft += h;
        pos = el.scrollLeft;
        paused.current = false;
      }, delay);
    };

    // Mouse drag to scroll; a drag never counts as a click on the card underneath.
    let dragX = 0;
    let dragStart = 0;
    let dragging = false;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = false;
      dragX = e.clientX;
      dragStart = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragX;
      if (Math.abs(dx) > 5) moved = true;
      el.scrollLeft = dragStart - dx;
    };
    const onUp = () => {
      dragging = false;
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    const onEnter = (e: PointerEvent) => e.pointerType === "mouse" && pause();
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        dragging = false;
        resume();
      }
    };
    const onTouchStart = () => pause();
    const onTouchEnd = () => resume(2500);
    const onFocusIn = () => pause();
    const onFocusOut = () => resume();
    const onWheel = () => {
      pause();
      if (!el.matches(":hover")) resume(1500);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resumeTimer);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
      el.removeEventListener("wheel", onWheel);
    };
  }, [loop, items.length]);

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Latest writing"
      className="flex cursor-grab select-none gap-5 overflow-x-auto overscroll-x-contain px-5 py-4 [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)] [scrollbar-width:none] active:cursor-grabbing sm:px-8 lg:px-12 [&::-webkit-scrollbar]:hidden"
    >
      {items.map((p, i) => (
        <BlogCard
          key={`${p.id}-${i}`}
          post={p}
          wpm={wpm}
          typeLabel={typeOf?.(p)}
          duplicate={i >= posts.length}
          className="w-[280px] shrink-0 sm:w-[320px] lg:w-[340px]"
        />
      ))}
    </div>
  );
}
