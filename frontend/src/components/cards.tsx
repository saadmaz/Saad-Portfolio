import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Event, Project } from "@/types";
import { Media, Tag } from "@/components/ui";
import { monthYear, year } from "@/lib/format";
import { cn } from "@/lib/utils";
import { eventPath } from "@/lib/paths";
import { eventPhotoAlt } from "@/lib/imageAlt";
import { stageTone } from "@/lib/projectStage";

const arrow = (
  <ArrowUpRight
    aria-hidden
    className="size-5 shrink-0 text-fg-3 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
  />
);

function projectMeta(p: Project) {
  return [p.date && year(p.date), p.role].filter(Boolean).join(" · ");
}

export function StageBadge({ stage, className }: { stage?: string; className?: string }) {
  if (!stage) return null;
  const tone = stageTone(stage);
  return (
    <span
      className={cn(
        "label inline-flex h-7 items-center gap-2 whitespace-nowrap rounded-full border px-2.5",
        tone === "live" && "border-live/25 bg-live/10 text-live",
        tone === "building" && "border-accent/25 bg-accent/10 text-accent",
        tone === "muted" && "border-line-2 bg-base/60 text-fg-2",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          tone === "live" && "bg-live shadow-[0_0_0_3px_rgb(var(--live)/0.18)]",
          tone === "building" && "bg-accent",
          tone === "muted" && "bg-fg-3",
        )}
      />
      {stage}
    </span>
  );
}

const projectTags = (p: Project, n: number) =>
  (p.techStack?.length ? p.techStack : (p.technologies ?? [])).slice(0, n);

/** Grid card: framed screenshot with category and stage, then meta, title, tagline and stack. */
export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  index?: number;
  className?: string;
}) {
  const img = project.heroImage || project.image;
  const category = project.category || project.type;
  const tags = projectTags(project, 3);
  return (
    <Link
      to={`/projects/${project.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface/40 transition-[border-color,background-color,transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-line-3 hover:bg-surface/80 hover:shadow-[0_24px_60px_-28px_rgb(0_0_0/0.8)]",
        className,
      )}
    >
      <div className="relative p-2 pb-0">
        <Media
          src={img}
          alt={project.altText || project.title}
          className="aspect-[16/10] rounded-[16px]"
          imgClassName="object-top"
        />
        <div className="pointer-events-none absolute inset-x-5 top-5 flex items-start justify-between gap-2">
          {category ? (
            <span className="label inline-flex h-7 items-center rounded-full bg-base/75 px-2.5 text-fg backdrop-blur-md">
              {category}
            </span>
          ) : (
            <span />
          )}
          <StageBadge stage={project.stage} className="bg-base/75 backdrop-blur-md" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="truncate font-mono text-meta text-fg-3">{projectMeta(project)}</span>
          {arrow}
        </div>
        <h3 className="text-h3 font-medium transition-colors group-hover:text-accent">{project.title}</h3>
        <p className="line-clamp-2 text-fg-2">{project.tagline}</p>
        {tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            {tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/** Wide spotlight card for the lead project: screenshot left, story and headline numbers right. */
export function ProjectFeature({ project }: { project: Project }) {
  const img = project.heroImage || project.image;
  const category = project.category || project.type;
  const tags = projectTags(project, 5);
  const results = (project.results ?? []).filter((r) => r?.value).slice(0, 3);
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group grid overflow-hidden rounded-[28px] border border-line bg-surface/40 p-2 transition-[border-color,background-color] duration-300 hover:border-line-3 hover:bg-surface/70 md:grid-cols-[1.35fr_1fr] md:p-3"
    >
      <Media
        src={img}
        alt={project.altText || project.title}
        className="aspect-[16/10] rounded-[20px] md:aspect-auto md:min-h-[440px]"
        imgClassName="object-top"
        priority
      />
      <div className="flex flex-col gap-6 p-5 md:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label inline-flex h-7 items-center rounded-full bg-accent px-2.5 text-fg-inverse">
            Featured
          </span>
          {category && <Tag>{category}</Tag>}
          <StageBadge stage={project.stage} />
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-mono text-meta text-fg-3">{projectMeta(project)}</span>
          <h3 className="text-h1 font-medium">{project.title}</h3>
          <p className="text-body-l text-fg-2">{project.tagline}</p>
        </div>
        {results.length > 0 && (
          <dl className="grid grid-cols-3 gap-4 border-y border-line-2 py-5">
            {results.map((r) => (
              <div key={r.label + r.value} className="flex min-w-0 flex-col-reverse gap-1.5">
                <dt className="text-meta leading-snug text-fg-3">{r.label}</dt>
                <dd className="truncate text-h3 font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-medium text-fg transition-colors group-hover:text-accent">
          Read the case study
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

/**
 * Homepage project card: square image with a notched corner holding the arrow
 * button, then a tag, the title and orange-dotted meta.
 */
export function ProjectTile({ project, tabIndex }: { project: Project; tabIndex?: number }) {
  const img = project.cardImage || project.heroImage || project.image;
  const tag = project.category || project.type || project.techStack?.[0];
  const meta = [project.role || project.status, project.date && monthYear(project.date)].filter(Boolean);
  return (
    <Link to={`/projects/${project.slug}`} tabIndex={tabIndex} className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-[24px] bg-surface">
        {img && (
          <img
            src={img}
            alt={project.altText || project.title}
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        )}
        <span className="notch" aria-hidden />
        <span
          aria-hidden
          className="absolute bottom-0 right-0 flex size-[68px] items-center justify-center rounded-full bg-fg text-base transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
        >
          <ArrowUpRight className="size-6 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
      {tag && (
        <span className="mt-5 self-start rounded-full bg-surface px-3.5 py-1.5 text-sm text-fg-2">{tag}</span>
      )}
      <h3 className="mt-3 line-clamp-2 text-h4 font-semibold leading-snug text-fg">{project.title}</h3>
      {meta.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-2">
          {meta.map((m) => (
            <span key={m} className="flex items-center gap-1.5">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {m}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export function EventCard({ event, className }: { event: Event; className?: string }) {
  const cover = event.image || event.images?.[0];
  return (
    <Link to={eventPath(event)} className={cn("group flex flex-col gap-[18px]", className)}>
      <div className="relative">
        {cover ? (
          <Media src={cover} alt={eventPhotoAlt(event, cover)} className="aspect-video" />
        ) : (
          // No photo yet: a typographic poster (year + tags) instead of an empty frame.
          <div className="relative flex aspect-video flex-col justify-end gap-2 overflow-hidden rounded-media border border-line bg-surface p-5">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgb(255_95_0/0.28),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgb(255_95_0/0.08),transparent_60%)] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            {event.tags?.length ? (
              <span className="label relative text-fg-3">{event.tags.slice(0, 2).join(" · ")}</span>
            ) : null}
            <span className="relative text-[clamp(2.25rem,3.6vw,3.25rem)] font-medium leading-[0.85] tracking-[-0.05em] text-fg/90">
              {year(event.date)}
            </span>
          </div>
        )}
        {event.role && (
          <span className="label absolute left-4 top-4 rounded-full bg-base/70 px-3 py-1.5 text-fg backdrop-blur">
            {event.role}
          </span>
        )}
      </div>
      <span className="font-mono text-meta text-fg-3">
        {[monthYear(event.date), event.location].filter(Boolean).join(" · ")}
      </span>
      <h3 className="text-h4 font-medium transition-colors group-hover:text-accent">{event.title}</h3>
      <span className="-mt-2 text-sm text-fg-2">{event.organizer}</span>
    </Link>
  );
}

/**
 * The list row used for experience, articles, credentials and publications:
 * mono meta on the left, title + subtitle, trailing meta and an arrow.
 * Stacks on mobile.
 */
export function Row({
  to,
  href,
  lead,
  title,
  sub,
  trail,
  mark,
}: {
  to?: string;
  href?: string;
  lead?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  trail?: ReactNode;
  mark?: ReactNode;
}) {
  const body = (
    <>
      {lead && <span className="font-mono text-meta text-fg-3 md:w-[160px] md:shrink-0">{lead}</span>}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {mark}
        <div className="min-w-0">
          <div className="text-h4 font-medium transition-colors group-hover:text-accent md:text-h3">
            {title}
          </div>
          {sub && <div className="mt-1 text-sm text-fg-2">{sub}</div>}
        </div>
      </div>
      {(trail || to || href) && (
        <div className="flex items-center justify-between gap-6 md:shrink-0 md:justify-end md:gap-8">
          {trail && (
            <span className="font-mono text-meta text-fg-3 md:min-w-[128px] md:text-right">{trail}</span>
          )}
          {(to || href) && <span className="ml-auto md:ml-0">{arrow}</span>}
        </div>
      )}
    </>
  );
  const cls =
    "group flex flex-col gap-3 border-t border-line-2 py-6 md:flex-row md:items-center md:gap-10 md:py-[clamp(18px,3.6svh,32px)]";
  if (to)
    return (
      <Link to={to} className={cls}>
        {body}
      </Link>
    );
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    );
  return <div className={cls}>{body}</div>;
}

/** Initials tile for issuers/companies without a logo. */
export function Mark({ src, label, className }: { src?: string; label: string; className?: string }) {
  // Skip "of", "and", "(IIT)" etc. so "University of Westminster" reads UW, not UO.
  const words = label.split(/\s+/).filter((w) => /^[A-Z0-9]/.test(w));
  const initials = (words.length ? words : label.split(/\s+/))
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={cn(
        "label flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-line-2 bg-surface-2 text-fg-2",
        className,
      )}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" loading="lazy" /> : initials}
    </span>
  );
}
