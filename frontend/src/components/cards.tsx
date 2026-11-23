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
  compact,
}: {
  project: Project;
  index?: number;
  feature?: boolean;
  /** Homepage grid: shorter image and clamped tagline so a row fits one screen. */
  compact?: boolean;
}) {
  const img = project.heroImage || project.image;
  const tags = (project.techStack ?? []).slice(0, feature ? 4 : 3);
  return (
    <Link to={`/projects/${project.slug}`} className="group flex flex-col gap-6 md:gap-7">
      <Media
        src={img}
        alt={project.altText || project.title}
        className={feature ? "aspect-[16/9]" : compact ? "aspect-[16/10]" : "aspect-[3/2]"}
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
          <p className={cn("text-fg-2", compact && "line-clamp-2")}>{project.tagline}</p>
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
 * Homepage project spotlight: image beside the details from tablet up, so a
 * single project fits one screen. `aside` renders under the details (e.g. a quote).
 */
export function ProjectSpotlight({
  project,
  index,
  aside,
}: {
  project: Project;
  index?: number;
  aside?: ReactNode;
}) {
  const img = project.heroImage || project.image;
  const tags = (project.techStack ?? []).slice(0, 4);
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center md:gap-10 lg:gap-16">
      <Link to={`/projects/${project.slug}`} className="group block" aria-label={project.title}>
        <Media
          src={img}
          alt={project.altText || project.title}
          className="aspect-[16/10] transition-[border-color] duration-200 group-hover:border-line-3 md:aspect-auto md:h-[min(46svh,40vw)]"
          priority
        />
      </Link>
      <div className="flex flex-col gap-5">
        <span className="font-mono text-meta text-fg-3">{projectMeta(project, index)}</span>
        <Link to={`/projects/${project.slug}`} className="group flex items-start justify-between gap-4">
          <h3 className="text-h1 font-medium transition-colors group-hover:text-accent">{project.title}</h3>
          <span className="mt-2">{arrow}</span>
        </Link>
        {project.tagline && <p className="line-clamp-3 text-fg-2">{project.tagline}</p>}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
        {aside}
      </div>
    </div>
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
    "group flex flex-col gap-3 border-t border-line-2 py-6 md:flex-row md:items-center md:gap-10 md:py-8";
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
