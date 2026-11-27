import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { resizedImage, responsiveImage } from "@/lib/images";
import type { ImageAsset } from "@/types";

export { Button } from "./Button";

/** Mono pill. Accent style marks the active filter. */
export function Tag({
  children,
  active,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label inline-flex min-h-7 max-w-full items-center rounded-full px-2.5 py-1 leading-[1.4]",
        active ? "bg-accent/[0.12] text-accent" : "border border-line-2 text-fg-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Clickable filter pill. */
export function FilterPill({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="rounded-full">
      <Tag active={active} className={cn(!active && "transition-colors hover:border-line-3 hover:text-fg")}>
        {children}
      </Tag>
    </button>
  );
}

/**
 * Section label: optional mono index in accent, a hairline, then the label.
 * `counted` numbers it automatically inside a `.counted` container.
 */
export function Eyebrow({
  index,
  counted,
  children,
}: {
  index?: string;
  counted?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5">
      {counted ? (
        <span className="label eyebrow-count text-accent" />
      ) : (
        index && <span className="label text-accent">{index}</span>
      )}
      <span aria-hidden className="h-px w-8 bg-line-3" />
      <span className="label text-fg-2">{children}</span>
    </div>
  );
}

/** Counts up from 0 to `value` once on mount (instantly with reduced motion). */
export function CountUp({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 4))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <span className="tabular-nums">{shown}</span>;
}

export function Stat({ value, label, className }: { value: ReactNode; label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <span className="text-display-m font-medium">
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </span>
      <span className="label text-fg-3">{label}</span>
    </div>
  );
}

/** Segmented meter, e.g. skill or language level. */
export function Meter({ value, max = 4, className }: { value: number; max?: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-[3px]", className)} aria-label={`${value} of ${max}`} role="img">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={cn("h-1 w-2.5 rounded-full", i < value ? "bg-accent" : "bg-line-3")} />
      ))}
    </span>
  );
}

/** Fades children up once they enter the viewport. */
export function Reveal({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger siblings: ms to wait after entering view. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      data-in={inView}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Image with a graphite gradient fallback when there's no source (or it fails).
 * Pass `asset` (an uploaded ImageAsset) for srcset, intrinsic size and focal point.
 *
 * `natural`: the frame takes the image's own proportions, so the whole image
 * always shows (cover art with text must never be cropped). Without known
 * dimensions it falls back to 16:9 and fits the image inside, uncropped.
 */
export function Media({
  src,
  alt,
  className,
  priority,
  asset,
  sizes,
  natural,
  imgClassName,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  asset?: ImageAsset | null;
  sizes?: string;
  natural?: boolean;
  /** Extra classes on the <img>, e.g. `object-top` for page screenshots. */
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  // Uploaded assets bring their own variants; plain Storage URLs get Cloudflare-resized ones.
  const img = asset?.url ? responsiveImage(asset, sizes) : src ? resizedImage(src, sizes) : null;
  const w = Number(img?.width) || 0;
  const h = Number(img?.height) || 0;
  const frame = natural ? { aspectRatio: w && h ? `${w} / ${h}` : "16 / 9" } : undefined;
  return (
    <div
      style={frame}
      className={cn("relative overflow-hidden rounded-media border border-line bg-surface", className)}
    >
      {img && !failed ? (
        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes={img.sizes}
          width={img.width}
          height={img.height}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          onError={() => setFailed(true)}
          style={!natural && img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
          className={cn(
            "size-full",
            natural
              ? "object-contain transition-opacity duration-300 group-hover:opacity-90"
              : "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]",
            imgClassName,
          )}
        />
      ) : (
        <div
          aria-hidden
          className="size-full bg-[radial-gradient(ellipse_at_85%_0%,rgb(255_95_0/0.35),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgb(255_95_0/0.12),transparent_60%)]"
        />
      )}
    </div>
  );
}

/** Header used at the top of every inner page. */
/**
 * Full-screen opening section for every page, like the homepage hero: sits
 * under the fixed header, fills the viewport, content centred, orange glow,
 * and a bottom band with a scroll cue. `media` fills the space left below the
 * copy (cover photos on detail pages).
 */
export function PageHero({
  children,
  media,
  band,
  centered,
  ambient,
  className,
}: {
  children: ReactNode;
  media?: ReactNode;
  /** Left side of the bottom band (defaults to nothing; the scroll cue is always on the right). */
  band?: ReactNode;
  centered?: boolean;
  /** Landing-page backdrop: drifting glows, a fading grid and film grain. */
  ambient?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative -mt-[72px] flex min-h-[100svh] flex-col overflow-hidden lg:-mt-[88px]",
        className,
      )}
    >
      {ambient ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-[10%] -top-[20%] size-[70vmax] animate-drift rounded-full bg-[radial-gradient(circle,rgb(255_95_0/0.22),transparent_62%)] blur-2xl" />
          <div className="absolute -bottom-[35%] -left-[15%] size-[55vmax] animate-drift rounded-full bg-[radial-gradient(circle,rgb(255_122_38/0.1),transparent_65%)] blur-2xl [animation-delay:-11s] [animation-duration:28s]" />
          <div className="absolute inset-0 [background-image:linear-gradient(rgb(var(--ink)/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--ink)/0.045)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_60%_40%,black,transparent_80%)]" />
          <div className="grain absolute inset-0 opacity-[0.06] mix-blend-overlay" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-base to-transparent" />
        </div>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_80%_25%,rgb(255_95_0/0.16),transparent_70%)]"
        />
      )}
      <div
        className={cn(
          "wrap relative flex flex-1 flex-col pb-[clamp(24px,5svh,56px)] pt-[clamp(104px,16svh,152px)]",
          media ? "gap-[clamp(24px,4svh,48px)]" : "justify-center",
          centered && "items-center text-center",
        )}
      >
        <div className={cn("flex flex-col", centered && "items-center")}>{children}</div>
        {media && <div className="relative flex min-h-[160px] flex-1 flex-col">{media}</div>}
      </div>
      <div className="relative shrink-0 border-t border-line bg-base/60 backdrop-blur-sm">
        <div className="wrap flex items-center justify-between gap-6 py-[clamp(14px,2.6svh,24px)]">
          <div className="min-w-0 font-mono text-meta text-fg-3">{band}</div>
        </div>
      </div>
    </section>
  );
}

/** Headline words rising out of a clipped line, one after another. */
export function RisingWords({
  text,
  from = 0,
  className,
}: {
  text: string;
  from?: number;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span
              className={cn("inline-block animate-word-in", className)}
              style={{ animationDelay: `${(from + i) * 90}ms` }}
            >
              {w}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

/** Page opening: label, two-tone title, intro and an optional aside, as a full-screen hero. */
export function PageHeader({
  label,
  title,
  soft,
  intro,
  aside,
  children,
}: {
  label: string;
  title: string;
  soft?: string;
  intro?: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <PageHero
      ambient
      className="mb-16 md:mb-24"
      band={<span className="truncate">Saad Mazhar · {label}</span>}
    >
      <div className="animate-rise">
        <Eyebrow>{label}</Eyebrow>
      </div>
      <div className="mt-8 flex flex-col gap-10 md:mt-10 md:flex-row md:items-end md:justify-between">
        <h1 className="text-display-xl font-medium">
          <RisingWords text={title} />
          {soft && (
            <>
              {" "}
              <RisingWords text={soft} from={title.split(" ").length} className="soft" />
            </>
          )}
        </h1>
        {aside && <div className="animate-rise [animation-delay:450ms]">{aside}</div>}
      </div>
      {intro && (
        <p className="mt-8 max-w-[640px] animate-rise text-body-l text-fg-2 [animation-delay:350ms] md:mt-10">
          {intro}
        </p>
      )}
      {children}
    </PageHero>
  );
}

/** Section heading with label, two-tone title and an optional link on the right. */
export function SectionHeader({
  id,
  index,
  counted,
  label,
  title,
  soft,
  action,
}: {
  /** Heading id, for the section's aria-labelledby. */
  id?: string;
  index?: string;
  counted?: boolean;
  label: string;
  title: string;
  soft?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-12 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-6 md:gap-7">
        <Eyebrow index={index} counted={counted}>
          {label}
        </Eyebrow>
        <h2 id={id} className="text-display-m font-medium">
          {title} {soft && <span className="soft">{soft}</span>}
        </h2>
      </div>
      {action && <div className="self-start md:self-auto">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-surface-2", className)} />;
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-card border border-dashed border-line-2 p-10 text-center text-fg-3">{children}</p>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  error?: string;
  autoComplete?: string;
  maxLength?: number;
}

export function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  multiline,
  error,
  autoComplete,
  maxLength,
}: FieldProps) {
  const cls = cn(
    "w-full rounded-xl border bg-surface px-[18px] py-4 text-[1rem] text-fg placeholder:text-fg-3 transition-colors focus:bg-surface-2 focus:outline-none",
    error ? "border-danger" : "border-line-2 focus:border-accent",
  );
  return (
    <label className="flex flex-col gap-2.5">
      <span className={cn("label", error ? "text-danger" : "text-fg-3")}>{label}</span>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={5}
          maxLength={maxLength}
          className={cn(cls, "resize-y")}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={cls}
        />
      )}
      {error && <span className="font-mono text-meta text-danger">{error}</span>}
    </label>
  );
}
