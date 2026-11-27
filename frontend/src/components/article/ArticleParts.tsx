import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { fullDate } from "@/lib/format";
import { articlePath, readingMinutesOf, type SeriesPosition } from "@/lib/article-core";
import type { ArticleSource, Author, BlogPost, BlogSeries } from "@/types";
import { authorLinks } from "@/lib/authors";
import { resizedUrl } from "@/lib/images";

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-fg-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {item.to ? (
              <Link to={item.to} className="hover:text-fg">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1 max-w-[40ch] text-fg-2">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Avatar({ author, size = "size-10" }: { author: Author; size?: string }) {
  return author.avatar ? (
    <img
      src={resizedUrl(author.avatar, 480)}
      alt=""
      className={cn(size, "shrink-0 rounded-full border border-line-2 object-cover")}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        size,
        "label flex shrink-0 items-center justify-center rounded-full border border-line-2 bg-surface-2 text-fg-2",
      )}
    >
      {author.name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}

/** Author, dates and reading time under the headline. */
export function Byline({
  post,
  author,
  updated,
  wpm,
}: {
  post: BlogPost;
  author: Author | null;
  updated: string | null;
  wpm: number;
}) {
  const published = post.publishedAt || post.date;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
      {author ? (
        <Link to={`/authors/${author.slug}`} className="group flex items-center gap-3">
          <Avatar author={author} />
          <span className="text-left">
            <span className="block font-medium text-fg group-hover:text-accent">{author.name}</span>
            {author.title && <span className="block text-sm text-fg-3">{author.title}</span>}
          </span>
        </Link>
      ) : (
        <span className="font-medium text-fg">{post.author || "Saad Mazhar"}</span>
      )}
      <span aria-hidden className="hidden h-8 w-px bg-line-2 sm:block" />
      {/* Items wrap as whole units: "10 min read" never splits across lines. */}
      <p className="flex flex-wrap justify-center gap-x-2 font-mono text-meta text-fg-3 sm:justify-start">
        <time dateTime={published} className="whitespace-nowrap">
          {fullDate(published)}
        </time>
        {updated && (
          <span className="whitespace-nowrap">
            <span aria-hidden>· </span>Updated <time dateTime={updated}>{fullDate(updated)}</time>
          </span>
        )}
        <span className="whitespace-nowrap">
          <span aria-hidden>· </span>
          {readingMinutesOf(post, wpm)} min read
        </span>
      </p>
    </div>
  );
}

export function SourcesList({ sources, className }: { sources: ArticleSource[]; className?: string }) {
  if (!sources.length) return null;
  return (
    <section
      aria-labelledby="sources-heading"
      className={cn("rounded-card border border-line-2 bg-surface p-6", className)}
    >
      <h2 id="sources-heading" className="label mb-4 text-fg-3">
        Sources & references
      </h2>
      <ol className="flex list-decimal flex-col gap-3 pl-5 text-[0.9375rem] text-fg-2 marker:text-fg-3">
        {sources.map((s, i) => (
          <li key={i}>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg underline decoration-line-3 underline-offset-4 hover:decoration-accent"
              >
                {s.title}
                <ExternalLink aria-hidden className="ml-1 inline size-3.5 align-[-2px] text-fg-3" />
              </a>
            ) : (
              <span className="text-fg">{s.title}</span>
            )}
            {s.publisher && <span className="text-fg-3"> · {s.publisher}</span>}
            {s.note && <span className="block text-sm text-fg-3">{s.note}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Series box: progress, the ordered parts, and previous/next. */
export function SeriesNav({
  series,
  position,
  current,
}: {
  series: BlogSeries;
  position: SeriesPosition<BlogPost>;
  current: BlogPost;
}) {
  const pct = Math.round(((position.index + 1) / position.total) * 100);
  return (
    <aside aria-labelledby="series-heading" className="rounded-card border border-line-2 bg-surface p-6">
      <p className="label text-accent">
        Series · Part {position.index + 1} of {position.total}
      </p>
      <h2 id="series-heading" className="mt-2 text-h4 font-medium">
        <Link to={`/blog/series/${series.slug}`} className="hover:text-accent">
          {series.title}
        </Link>
      </h2>
      <div
        className="mt-4 h-1 overflow-hidden rounded-full bg-line-2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Series progress"
      >
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-4 flex flex-col gap-1.5 text-[0.9375rem]">
        {position.items.map((p, i) => (
          <li key={p.id} className="flex gap-3">
            <span className="w-5 shrink-0 font-mono text-meta leading-6 text-fg-3">{i + 1}</span>
            {p.id === current.id ? (
              <span aria-current="page" className="text-fg">
                {p.title}
              </span>
            ) : (
              <Link to={articlePath(p)} className="text-fg-2 hover:text-fg">
                {p.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
      {(position.previous || position.next) && (
        <div className="mt-5 grid gap-3 border-t border-line pt-5 grid-cols-1 sm:grid-cols-2">
          {position.previous ? (
            <Link to={articlePath(position.previous)} className="group flex flex-col gap-1">
              <span className="label flex items-center gap-1.5 text-fg-3">
                <ArrowLeft aria-hidden className="size-3.5" /> Previous
              </span>
              <span className="text-sm text-fg-2 group-hover:text-fg">{position.previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {position.next && (
            <Link to={articlePath(position.next)} className="group flex flex-col gap-1 sm:text-right">
              <span className="label flex items-center gap-1.5 text-fg-3 sm:justify-end">
                Next <ArrowRight aria-hidden className="size-3.5" />
              </span>
              <span className="text-sm text-fg-2 group-hover:text-fg">{position.next.title}</span>
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}

export function AuthorCard({ author, className }: { author: Author; className?: string }) {
  const links = authorLinks(author);
  return (
    <aside
      aria-label="About the author"
      className={cn("flex flex-col gap-4 rounded-card border border-line-2 p-6 sm:flex-row", className)}
    >
      <Avatar author={author} size="size-14" />
      <div className="flex flex-col gap-2">
        <p className="label text-fg-3">Written by</p>
        <Link to={`/authors/${author.slug}`} className="text-h4 font-medium hover:text-accent">
          {author.name}
        </Link>
        {author.title && <p className="text-sm text-fg-2">{author.title}</p>}
        {author.bio && <p className="text-[0.9375rem] text-fg-2">{author.bio}</p>}
        {links.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="text-fg-2 underline-offset-4 hover:text-fg hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export function ArticlePager({
  previous,
  next,
  className,
}: {
  previous: BlogPost | null;
  next: BlogPost | null;
  className?: string;
}) {
  if (!previous && !next) return null;
  const card =
    "group flex flex-col gap-1.5 rounded-card border border-line-2 p-5 transition-colors hover:border-line-3 hover:bg-surface";
  return (
    <nav aria-label="More articles" className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {previous ? (
        <Link to={articlePath(previous)} rel="prev" className={card}>
          <span className="label flex items-center gap-1.5 text-fg-3">
            <ArrowLeft aria-hidden className="size-3.5" /> Previous article
          </span>
          <span className="text-[0.9375rem] leading-snug text-fg-2 group-hover:text-fg">
            {previous.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link to={articlePath(next)} rel="next" className={cn(card, "sm:items-end sm:text-right")}>
          <span className="label flex items-center gap-1.5 text-fg-3">
            Next article <ArrowRight aria-hidden className="size-3.5" />
          </span>
          <span className="text-[0.9375rem] leading-snug text-fg-2 group-hover:text-fg">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
