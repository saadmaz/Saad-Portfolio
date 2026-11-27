import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, CalendarDays, Clock } from "lucide-react";
import { Media } from "@/components/ui";
import { cn } from "@/lib/utils";
import { monthYear } from "@/lib/format";
import { articlePath, coverOf, readingMinutesOf } from "@/lib/article-core";
import type { BlogPost, ImageAsset } from "@/types";

type CardProps = {
  post: BlogPost;
  wpm: number;
  typeLabel?: string;
  priority?: boolean;
  className?: string;
};

function facts(post: BlogPost, wpm: number, typeLabel?: string) {
  return {
    minutes: readingMinutesOf(post, wpm),
    date: monthYear(post.publishedAt || post.date),
    kind: typeLabel || post.category || "Article",
    blurb: post.subtitle || post.excerpt,
  };
}

function Stats({ minutes, kind, date }: { minutes: number; kind: string; date: string }) {
  const items = [
    { icon: Clock, value: `${minutes} min`, label: "Read" },
    { icon: BookOpen, value: kind, label: "Type" },
    { icon: CalendarDays, value: date, label: "Published" },
  ].filter((s) => s.value);
  return (
    <dl className="grid grid-cols-3 gap-2 border-y border-line py-2.5">
      {items.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex min-w-0 flex-col items-center gap-1 text-center">
          <dd className="flex max-w-full items-center gap-1.5 text-sm font-medium">
            <Icon aria-hidden className="size-3.5 shrink-0 text-accent" />
            <span className="truncate">{value}</span>
          </dd>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-fg-3">{label}</dt>
        </div>
      ))}
    </dl>
  );
}

function ReadPill({ glass }: { glass?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-11 items-center gap-3 rounded-full pl-1.5 pr-5 text-sm font-medium",
        glass
          ? "border border-white/20 bg-white/10 text-white backdrop-blur-md"
          : "bg-[linear-gradient(90deg,rgb(var(--fg))_55%,rgb(var(--fg)/0.55))] text-fg-inverse",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          glass ? "bg-white text-black" : "bg-accent text-white",
        )}
      >
        <ArrowUpRight aria-hidden className="size-4" />
      </span>
      <span className="flex-1 text-center">Read article</span>
    </span>
  );
}

/** Cover card that turns into a detail card on hover/focus (always detailed on touch screens). */
export function BlogCard({ post, wpm, typeLabel, priority, className }: CardProps) {
  const cover = coverOf(post);
  const { minutes, date, kind, blurb } = facts(post, wpm, typeLabel);
  return (
    <Link
      to={articlePath(post)}
      className={cn("blog-card theme-dark aspect-[3/4]", className)}
      draggable={false}
    >
      <div className="blog-card__media">
        {/* Covers are designed graphics: show them whole, over a blurred copy that fills the card. */}
        {cover && (
          <Media
            asset={cover as ImageAsset}
            alt=""
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="absolute inset-0 size-full scale-125 rounded-none border-0 blur-2xl brightness-110 saturate-200"
          />
        )}
        <Media
          asset={cover as ImageAsset | null}
          alt=""
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="blog-card__cover absolute inset-0 size-full rounded-none border-0 bg-transparent"
          imgClassName="object-contain object-top"
        />
        <div aria-hidden className="blog-card__scrim" />
      </div>

      {/* Resting face: decorative, the details panel below carries the accessible text. */}
      <div aria-hidden className="blog-card__front">
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-white">
            {kind}
          </span>
          <span className="font-mono text-meta text-white/75">
            {date} · {minutes} min
          </span>
        </div>
        <p className="line-clamp-2 text-h4 font-medium leading-snug">{post.title}</p>
        {blurb && <p className="blog-card__blurb line-clamp-2 text-sm text-white/70">{blurb}</p>}
        <div className="mt-1">
          <ReadPill glass />
        </div>
      </div>

      <div className="blog-card__back">
        <span className="label text-accent">{post.category || kind}</span>
        <h3 className="line-clamp-2 text-h4 font-medium leading-snug">{post.title}</h3>
        {blurb && <p className="blog-card__blurb line-clamp-2 text-sm text-fg-2">{blurb}</p>}
        <Stats minutes={minutes} kind={kind} date={date} />
        <ReadPill />
      </div>
    </Link>
  );
}

/** Wide card for the lead post on /blog: cover beside the details, stacked on phones. */
export function FeaturedPostCard({
  post,
  wpm,
  typeLabel,
  label = "Featured",
}: CardProps & { label?: string }) {
  const cover = coverOf(post);
  const { minutes, date, kind, blurb } = facts(post, wpm, typeLabel);
  return (
    <Link
      to={articlePath(post)}
      className="theme-dark group grid overflow-hidden rounded-[28px] border border-line bg-surface p-2.5 transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] lg:aspect-auto lg:min-h-[380px]">
        <Media
          asset={cover as ImageAsset | null}
          alt={cover?.alt || ""}
          sizes="(min-width: 1024px) 700px, 100vw"
          priority
          className="size-full rounded-none border-0"
        />
        <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-white">
          {label}
        </span>
      </div>
      <div className="flex flex-col justify-center gap-5 p-5 md:p-8 lg:p-10">
        <span className="label text-accent">{post.category || kind}</span>
        <h3 className="text-h2 font-medium leading-tight transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        {blurb && <p className="line-clamp-3 text-fg-2">{blurb}</p>}
        <Stats minutes={minutes} kind={kind} date={date} />
        <div className="w-full sm:max-w-[300px]">
          <ReadPill />
        </div>
      </div>
    </Link>
  );
}
