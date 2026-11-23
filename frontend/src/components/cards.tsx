import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Event, Project } from "@/types";
import { Media, Tag } from "@/components/ui";
import { monthYear, year } from "@/lib/format";
import { cn } from "@/lib/utils";
import { eventPath } from "@/lib/paths";
import { eventPhotoAlt } from "@/lib/imageAlt";

const arrow = (
  <ArrowUpRight
    aria-hidden
    className="size-5 shrink-0 text-fg-3 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
  />
);

function projectMeta(p: Project, index?: number) {
  return [index !== undefined && String(index + 1).padStart(2, "0"), p.date && year(p.date), p.role]
    .filter(Boolean)
    .join(" · ");
}

export function ProjectCard({
  project,
  index,
  feature,
}: {
  project: Project;
  index?: number;
  feature?: boolean;
}) {
  const img = project.heroImage || project.image;
  const tags = (project.techStack ?? []).slice(0, feature ? 4 : 3);
  return (
    <Link to={`/projects/${project.slug}`} className="group flex flex-col gap-6 md:gap-7">
      <Media
        src={img}
        alt={project.altText || project.title}
        className={feature ? "aspect-[16/9]" : "aspect-[3/2]"}
        priority={feature}
      />
      {feature ? (
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-meta text-fg-3">{projectMeta(project, index)}</span>
            <h3 className="text-h1 font-medium">{project.title}</h3>
          </div>
          <div className="flex max-w-[460px] flex-col gap-5">
            <p className="text-fg-2">{project.tagline}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-meta text-fg-3">{projectMeta(project, index)}</span>
            {arrow}
          </div>
          <h3 className="text-h2 font-medium">{project.title}</h3>
          <p className="text-fg-2">{project.tagline}</p>
          {tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          )}
        </div>
      )}
    </Link>
  );
}

/**
 * Homepage project card: square image with a notched corner holding the arrow
 * button, then a tag, the title and orange-dotted meta.
 */
export function ProjectTile({ project }: { project: Project }) {
  const img = project.cardImage || project.heroImage || project.image;
  const tag = project.category || project.type || project.techStack?.[0];
  const meta = [project.role || project.status, project.date && monthYear(project.date)].filter(Boolean);
  return (
    <Link to={`/projects/${project.slug}`} className="group flex flex-col">
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
