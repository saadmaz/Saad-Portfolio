import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Event, Project } from "@/types";
import { Media, Tag } from "@/components/ui";
import { monthYear, year } from "@/lib/format";
import { cn } from "@/lib/utils";

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

export function EventCard({ event, className }: { event: Event; className?: string }) {
  return (
    <Link to={`/events/${event.id}`} className={cn("group flex flex-col gap-[18px]", className)}>
      <div className="relative">
        <Media src={event.image || event.images?.[0]} alt={event.title} className="aspect-[4/5]" />
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
  const initials = label
    .split(/\s+/)
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
