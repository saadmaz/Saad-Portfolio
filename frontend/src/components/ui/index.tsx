import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { responsiveImage } from "@/lib/images";
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
        "label inline-flex h-7 items-center whitespace-nowrap rounded-full px-2.5",
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

export function Stat({ value, label, className }: { value: ReactNode; label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <span className="text-display-m font-medium">{value}</span>
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
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
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
    <div ref={ref} data-in={inView} className={cn("reveal", className)}>
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
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  asset?: ImageAsset | null;
  sizes?: string;
  natural?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const img = asset?.url ? responsiveImage(asset, sizes) : src ? { src } : null;
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
    <header className="wrap pb-16 pt-16 md:pb-20 md:pt-24">
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-8 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <h1 className="text-display-l font-medium">
          {title}
          {soft && (
            <>
              {" "}
              <span className="soft">{soft}</span>
            </>
          )}
        </h1>
        {aside}
      </div>
      {intro && <p className="mt-8 max-w-[640px] text-body-l text-fg-2">{intro}</p>}
      {children}
    </header>
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
    <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
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
          className={cls}
        />
      )}
      {error && <span className="font-mono text-meta text-danger">{error}</span>}
    </label>
  );
}
