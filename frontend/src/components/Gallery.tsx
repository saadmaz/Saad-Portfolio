import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { Eyebrow, Media } from "@/components/ui";
import { cn } from "@/lib/utils";
import { resizedUrl } from "@/lib/images";

const pad = (n: number) => String(n).padStart(2, "0");

/** Width on the 6-column tablet/desktop grid. */
type Size = "feature" | "third" | "half" | "full";

interface Tile {
  size: Size;
  /** Feature sits on the right, alternating each time one appears. */
  flip: boolean;
  /** Full width on the 2-column phone grid, so no row is left half empty. */
  wide: boolean;
}

const SIZE: Record<Size, string> = {
  feature: "col-span-2 md:col-span-4 md:row-span-2",
  third: "md:col-span-2",
  half: "md:col-span-3",
  full: "col-span-2 md:col-span-6",
};

/**
 * Alternates a feature group (one 2×2 photo plus two beside it) with a row of
 * three. Tails that would leave a gap become rows of two, so every row is full.
 */
function layout(count: number): Tile[] {
  if (count === 1) return [{ size: "full", flip: false, wide: true }];
  const sizes: Size[] = [];
  let left = count;
  let feature = true;
  while (left > 0) {
    // 4 or 2 left: halves fill evenly where a feature or a row of three can't.
    if (left === 4 || left === 2) {
      sizes.push(...Array<Size>(left).fill("half"));
      break;
    }
    sizes.push(...((feature ? ["feature", "third", "third"] : ["third", "third", "third"]) as Size[]));
    left -= 3;
    feature = !feature;
  }
  let features = 0;
  const tiles = sizes.map((size) => ({
    size,
    flip: size === "feature" && features++ % 2 === 1,
    wide: false,
  }));

  let col = 0;
  tiles.forEach((t, i) => {
    if (t.size === "feature") {
      if (col === 1) tiles[i - 1].wide = true;
      col = 0;
    } else col = 1 - col;
  });
  if (col === 1) tiles[count - 1].wide = true;
  return tiles;
}

export function Gallery({
  images,
  title,
  alts,
  captions,
  label = "Gallery",
  heading,
}: {
  images: string[];
  title: string;
  /** Per-photo alt text, aligned with `images`. */ alts?: string[];
  /** Per-photo captions, aligned with `images`; shown in the lightbox. */
  captions?: string[];
  label?: string;
  /** Replaces the default "From the day in N photos" heading. */
  heading?: ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const tiles = layout(images.length);
  const single = images.length === 1;

  return (
    <section className="section screen" aria-labelledby="gallery-heading">
      <div className="wrap">
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-6">
            <Eyebrow>{label}</Eyebrow>
            <h2 id="gallery-heading" className="text-h1 font-medium">
              {heading ?? (
                <>
                  From the day{" "}
                  <span className="soft">
                    in {images.length} {single ? "photo" : "photos"}
                  </span>
                </>
              )}
            </h2>
          </div>
          {!single && (
            <button
              type="button"
              onClick={() => setOpen(0)}
              className="label hidden h-10 shrink-0 items-center gap-2 rounded-full border border-line-2 px-4 text-fg-2 transition-colors hover:border-line-3 hover:text-fg sm:inline-flex"
            >
              <Maximize2 aria-hidden className="size-3.5" />
              View all
            </button>
          )}
        </div>

        <ul className="mt-10 grid grid-flow-dense grid-cols-2 gap-3 md:mt-12 md:grid-cols-6 md:gap-4 lg:gap-5">
          {images.map((src, i) => {
            const t = tiles[i];
            const big = t.size === "feature";
            return (
              <li
                key={src}
                className={cn("relative", t.wide && "col-span-2", SIZE[t.size], t.flip && "md:col-start-3")}
              >
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Open photo ${i + 1} of ${images.length}`}
                  // The feature fills its 2×2 area; the small tiles' aspect ratio sets the row heights.
                  className={cn("group relative block w-full rounded-media", big && "md:absolute md:inset-0")}
                >
                  <Media
                    src={src}
                    alt={alts?.[i] || `${title} (${i + 1} of ${images.length})`}
                    className={cn(
                      "transition-colors duration-300 group-hover:border-line-3",
                      single ? "aspect-video" : "aspect-[4/3]",
                      t.size === "half" && "md:aspect-[3/2]",
                      big && "md:aspect-auto md:h-full",
                    )}
                  />
                  {/* Hover veil: lifts the index and expand icon off busy photos. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-end justify-between rounded-media bg-gradient-to-t from-black/60 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:p-5"
                  >
                    <span className="label text-white/80">{pad(i + 1)}</span>
                    <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md">
                      <Maximize2 className="size-4" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {open !== null && (
        <Lightbox
          images={images}
          title={title}
          alts={alts}
          captions={captions}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

function Lightbox({
  images,
  title,
  alts,
  captions,
  index,
  onIndex,
  onClose,
}: {
  images: string[];
  title: string;
  alts?: string[];
  captions?: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const go = useCallback((step: number) => onIndex((index + step + count) % count), [index, count, onIndex]);

  // Lock page scroll, focus the dialog, and hand focus back to the tile on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialog.current) {
        const focusable = dialog.current.querySelectorAll<HTMLElement>("button");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Warm the neighbours so arrowing through feels instant.
  useEffect(() => {
    if (count < 2) return;
    [images[(index + 1) % count], images[(index - 1 + count) % count]].forEach((src) => {
      new Image().src = src;
    });
    strip.current
      ?.querySelector<HTMLElement>(`[data-i="${index}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index, images, count]);

  const navBtn =
    "flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10";

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} gallery`}
      className="fixed inset-0 z-[100] flex animate-rise flex-col bg-[rgb(14_14_15/0.96)] backdrop-blur-xl [animation-duration:300ms]"
    >
      <div className="gutter flex h-16 shrink-0 items-center justify-between gap-6 md:h-20">
        <span className="label tabular-nums text-white/60" aria-live="polite">
          <span className="text-white">{pad(index + 1)}</span> / {pad(count)}
        </span>
        <span className="hidden min-w-0 truncate text-meta text-white/50 md:block">{title}</span>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close gallery" className={navBtn}>
          <X className="size-5" />
        </button>
      </div>

      {/* Backdrop click and swipe are pointer shortcuts; Esc and the arrow keys cover keyboards. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        <img
          key={images[index]}
          src={resizedUrl(images[index], 1600)}
          alt={alts?.[index] || `${title} (${index + 1} of ${count})`}
          className="max-h-full max-w-full animate-rise select-none rounded-xl object-contain shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] [animation-duration:400ms]"
          draggable={false}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className={cn(navBtn, "absolute left-6 top-1/2 hidden -translate-y-1/2 md:flex")}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className={cn(navBtn, "absolute right-6 top-1/2 hidden -translate-y-1/2 md:flex")}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {captions?.[index] && (
        <p className="gutter shrink-0 pt-4 text-center text-meta text-white/70" aria-live="polite">
          {captions[index]}
        </p>
      )}

      {count > 1 && (
        <div
          ref={strip}
          className="flex shrink-0 justify-start gap-2 overflow-x-auto px-4 py-5 [scrollbar-width:none] md:justify-center md:py-6"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              data-i={i}
              onClick={() => onIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-12 w-16 shrink-0 overflow-hidden rounded-lg ring-1 transition-all duration-300 md:h-14 md:w-20",
                i === index ? "opacity-100 ring-2 ring-accent" : "opacity-40 ring-white/10 hover:opacity-80",
              )}
            >
              <img src={src} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
