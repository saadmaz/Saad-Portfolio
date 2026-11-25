import { useEffect, useRef, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { RisingWords } from "@/components/ui";
import { coverOf } from "@/lib/article-core";
import { responsiveImage } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { BlogPost, ImageAsset } from "@/types";

/**
 * Full-bleed article opening: the cover fills the screen behind a dark fade
 * and drifts slower than the page; the category sits huge and faint behind
 * the title. Posts without a cover get the ambient orange backdrop.
 */
export function ArticleHero({
  post,
  eyebrow,
  breadcrumbs,
  byline,
  notice,
}: {
  post: BlogPost;
  eyebrow?: string;
  breadcrumbs: ReactNode;
  byline: ReactNode;
  notice?: ReactNode;
}) {
  const cover = coverOf(post);
  const img = cover ? responsiveImage(cover as ImageAsset, "100vw") : null;
  const media = useRef<HTMLDivElement>(null);

  // Parallax: the photo moves at 30% of the scroll speed while the hero is on screen.
  useEffect(() => {
    const el = media.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.min(window.scrollY, window.innerHeight);
      el.style.transform = `translate3d(0, ${y * 0.3}px, 0) scale(1.08)`;
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

  const watermark = post.category || eyebrow;
  const credit = cover && "credit" in cover ? (cover as ImageAsset & { credit?: string }).credit : undefined;

  return (
    <section className="relative -mt-[72px] flex min-h-[92svh] flex-col overflow-hidden lg:-mt-[88px]">
      <div aria-hidden className="absolute inset-0">
        {img ? (
          <div
            ref={media}
            className="absolute inset-0 will-change-transform"
            style={{ transform: "scale(1.08)" }}
          >
            <img
              src={img.src}
              srcSet={img.srcSet}
              sizes={img.sizes}
              alt=""
              fetchPriority="high"
              className="size-full object-cover"
              style={img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
            />
          </div>
        ) : (
          <>
            <div className="absolute -right-[10%] -top-[20%] size-[70vmax] animate-drift rounded-full bg-[radial-gradient(circle,rgb(255_95_0/0.22),transparent_62%)] blur-2xl" />
            <div className="absolute inset-0 [background-image:linear-gradient(rgb(var(--ink)/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--ink)/0.045)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,black,transparent_80%)]" />
          </>
        )}
        <div
          className={cn(
            "absolute inset-0",
            img
              ? "bg-[linear-gradient(to_bottom,rgb(17_17_19/0.55)_0%,rgb(17_17_19/0.35)_35%,rgb(17_17_19/0.85)_75%,rgb(17_17_19)_100%)]"
              : "bg-gradient-to-b from-transparent via-transparent to-base",
          )}
        />
        <div className="grain absolute inset-0 opacity-[0.06] mix-blend-overlay" />
      </div>

      {watermark && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[22%] select-none overflow-hidden whitespace-nowrap text-center text-[clamp(5rem,17vw,16rem)] font-semibold leading-none tracking-[-0.06em] text-white/[0.06]"
        >
          {watermark}
        </span>
      )}

      <div className="wrap relative flex flex-1 flex-col items-center justify-end pb-40 pt-36 text-center md:pb-56">
        <div className="flex max-w-[900px] flex-col items-center gap-6">
          <div className="animate-rise">{breadcrumbs}</div>
          {notice}
          {eyebrow && (
            <span className="label inline-flex h-7 animate-rise items-center gap-2 rounded-full bg-white/10 px-3 text-white backdrop-blur-md [animation-delay:80ms]">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {eyebrow}
            </span>
          )}
          <h1 className="text-display-m font-medium text-white md:text-[clamp(2.75rem,5vw,4.5rem)] md:leading-[1.02]">
            <RisingWords text={post.title} />
          </h1>
          {(post.subtitle || post.excerpt) && (
            <p className="max-w-[720px] animate-rise text-body-l text-white/75 [animation-delay:400ms]">
              {post.subtitle || post.excerpt}
            </p>
          )}
          <div className="animate-rise [animation-delay:520ms]">{byline}</div>
        </div>
      </div>

      <div className="wrap pointer-events-none absolute inset-x-0 bottom-20 flex items-end justify-between gap-6 font-mono text-meta text-white/50 md:bottom-28">
        <span className="hidden items-center gap-2 sm:flex" aria-hidden>
          <ArrowDown className="size-4 animate-bounce motion-reduce:animate-none" />
          Scroll to read
        </span>
        {credit && <span className="ml-auto truncate">Photo · {credit}</span>}
      </div>
    </section>
  );
}
