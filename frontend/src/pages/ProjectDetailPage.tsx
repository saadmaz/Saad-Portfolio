import { useMemo, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Github, Quote } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { Button, Media, PageHero, Reveal, Skeleton, Tag } from "@/components/ui";
import { ProjectCard, ProjectPoster, StageBadge } from "@/components/cards";
import { Gallery } from "@/components/Gallery";
import { VideoCard } from "@/components/article/VideoCard";
import { useProject, useProjects } from "@/hooks/useProjects";
import { useActiveHeading } from "@/hooks/useActiveHeading";
import { fullDate } from "@/lib/format";
import { BASE_URL, PERSON_REF } from "@/lib/seo-content";
import { isProjectIndexable } from "@/lib/indexing";
import { youTubeId } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import {
  projectCanonical,
  projectDuration,
  projectGallery,
  projectAppSchema,
  projectSchema,
  projectSeoDescription,
  projectSeoTitle,
  projectTimeline,
  projectVideos,
  relatedProjects,
  toDate,
} from "@/lib/project-seo";

interface Section {
  id: string;
  label: string;
  body: ReactNode;
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3.5 text-fg">
          <span
            aria-hidden
            className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
          >
            <Check className="size-3" strokeWidth={3} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col divide-y divide-line-2 border-y border-line-2">
      {items.map((t, i) => (
        <li key={t} className="flex gap-5 py-4 text-fg">
          <span aria-hidden className="mt-1 font-mono text-meta text-accent">
            {String(i + 1).padStart(2, "0")}
          </span>
          {t}
        </li>
      ))}
    </ol>
  );
}

/** Small labelled fact in the sidebar. */
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="label text-fg-3">{label}</span>
      <span className="text-[15px] leading-snug text-fg">{children}</span>
    </div>
  );
}

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface/40 p-5">
      <span className="label text-fg-3">{title}</span>
      {children}
    </div>
  );
}

/** "On this page" links with the current section highlighted. */
function SectionNav({ sections }: { sections: Section[] }) {
  const items = useMemo(() => sections.map((s) => ({ id: s.id })), [sections]);
  const active = useActiveHeading(items);
  return (
    <nav aria-label="On this page" className="hidden md:block">
      <span className="label text-fg-3">On this page</span>
      <ol className="mt-4 flex flex-col border-l border-line-2">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              className={cn(
                "-ml-px flex gap-3 border-l py-1.5 pl-4 text-[0.9375rem] leading-snug transition-colors",
                active === s.id ? "border-accent text-fg" : "border-transparent text-fg-3 hover:text-fg",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "font-mono text-[12px] leading-[1.6rem]",
                  active === s.id ? "text-accent" : "text-fg-3",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Hero screenshot in a browser window, so a page capture reads as a product, not a photo. */
function BrowserFrame({ src, alt, url }: { src?: string; alt: string; url?: string }) {
  let host = "";
  try {
    host = url ? new URL(url).host.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[22px] border border-line-2 bg-surface shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)]">
      <div className="flex h-10 shrink-0 items-center gap-4 border-b border-line px-4">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-fg/15" />
          <span className="size-2.5 rounded-full bg-fg/15" />
          <span className="size-2.5 rounded-full bg-fg/15" />
        </span>
        {host && (
          <span className="mx-auto max-w-[60%] truncate rounded-full bg-base/60 px-4 py-1 font-mono text-[11px] text-fg-3">
            {host}
          </span>
        )}
      </div>
      <div className="relative min-h-0 flex-1">
        <Media
          src={src}
          alt={alt}
          className="absolute inset-0 rounded-none border-0"
          imgClassName="object-top"
          priority
        />
      </div>
    </div>
  );
}

const ProjectDetailPage = () => {
  const { slug = "" } = useParams();
  const { data: project, isLoading } = useProject(slug);
  const { data: all = [] } = useProjects();

  if (isLoading)
    return (
      <Layout>
        <div className="wrap flex flex-col gap-8 py-32">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-2/3" />
          <Skeleton className="aspect-[16/9] w-full rounded-[22px]" />
        </div>
      </Layout>
    );
  // A real "not found" (the server already answered 404), not a silent jump to the list.
  if (!project) return <NotFound />;

  const url = `${BASE_URL}/projects/${project.slug}`;
  const live = project.liveUrl || project.live_preview;
  const code = project.githubUrl || project.github;
  const category = project.category || project.type;
  const stack = project.technologies?.length ? project.technologies : (project.techStack ?? []);
  const challenges = (project.challenges ?? [])
    .map((c) => (typeof c === "string" ? { wall: c } : c))
    .filter((c) => c.wall || c.fix);
  const gallery = projectGallery(project);
  const videos = projectVideos(project);
  const related = relatedProjects(project, all);
  const timeline = projectTimeline(project);
  const duration = projectDuration(project);
  const updated = toDate(project.updated_at);
  const results = (project.results ?? []).filter((r) => r?.value);
  const testimonials = (project.testimonials ?? []).filter((t) => t?.quote);
  const collaborators = (project.collaborators ?? []).filter((c) => c?.name);
  const resources = (project.resources ?? []).filter((r) => r?.url);
  const ordered = [...all].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
  const next = ordered[(ordered.findIndex((p) => p.slug === project.slug) + 1) % ordered.length];
  const showNext =
    next && next.slug !== project.slug && !related.slice(0, 3).some((r) => r.slug === next.slug);

  // Stage (where the product is) and status (where my work on it is) are separate facts.
  const meta = [
    ["Role", project.role],
    ["Client", project.client],
    ["Timeline", timeline],
    ["Duration", duration],
    ["Status", project.status],
  ].filter(([, v]) => v) as [string, string][];

  const sections: Section[] = [];
  const add = (id: string, label: string, body: ReactNode) => sections.push({ id, label, body });

  if (project.problem || project.overview)
    add(
      "overview",
      "Overview",
      <>
        <p className="whitespace-pre-line">{project.problem || project.overview}</p>
        {project.problem && project.overview && <p className="whitespace-pre-line">{project.overview}</p>}
      </>,
    );
  if (project.solution || project.long_description)
    add(
      "what-i-built",
      "What I built",
      <p className="whitespace-pre-line">{project.solution || project.long_description}</p>,
    );
  if (project.contribution?.length)
    add("contribution", "My contribution", <CheckList items={project.contribution} />);
  if (project.features?.length)
    add(
      "features",
      "Features",
      <ul className="grid gap-3 sm:grid-cols-2">
        {project.features.map((f) => (
          <li
            key={f}
            className="flex gap-3 rounded-card border border-line bg-surface/40 p-4 text-[15px] leading-relaxed text-fg"
          >
            <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} />
            {f}
          </li>
        ))}
      </ul>,
    );
  if (project.impact || results.length > 4)
    add(
      "impact",
      "Impact & results",
      <>
        {results.length > 4 && <CheckList items={results.slice(4).map((r) => `${r.value} ${r.label}`)} />}
        {project.impact && <p className="whitespace-pre-line">{project.impact}</p>}
      </>,
    );
  if (
    project.architecture?.description ||
    project.architecture?.diagramUrl ||
    project.technical_decisions?.length
  )
    add(
      "architecture",
      "Architecture",
      <>
        {project.architecture?.diagramUrl && (
          <figure className="flex flex-col gap-3">
            <Media
              src={project.architecture.diagramUrl}
              alt={project.architecture.diagramAlt || `${project.title} architecture diagram`}
              natural
            />
            {project.architecture.diagramAlt && (
              <figcaption className="text-sm text-fg-3">{project.architecture.diagramAlt}</figcaption>
            )}
          </figure>
        )}
        {project.architecture?.description && (
          <p className="whitespace-pre-line">{project.architecture.description}</p>
        )}
        {project.technical_decisions?.length ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-h4 font-medium text-fg">Technical decisions</h3>
            <NumberedList items={project.technical_decisions} />
          </div>
        ) : null}
      </>,
    );
  if (challenges.length)
    add(
      "challenges",
      "Challenges",
      <div className="flex flex-col gap-3">
        {challenges.map((c, i) => (
          <div
            key={(c.wall ?? "") + (c.fix ?? "")}
            className="flex flex-col gap-3 rounded-card border border-line bg-surface/40 p-5 md:p-6"
          >
            <span className="font-mono text-meta text-accent">
              Challenge {String(i + 1).padStart(2, "0")}
            </span>
            {c.wall && <p className="text-fg">{c.wall}</p>}
            {c.fix && (
              <p className="border-l-2 border-live/50 pl-4 text-[15px]">
                <span className="label mr-2 text-live">Fix</span>
                {c.fix}
              </p>
            )}
            {c.lesson && (
              <p className="border-l-2 border-line-3 pl-4 text-[15px]">
                <span className="label mr-2 text-fg-3">Lesson</span>
                {c.lesson}
              </p>
            )}
          </div>
        ))}
      </div>,
    );
  if (project.learnings?.length)
    add("learnings", "What I learned", <NumberedList items={project.learnings} />);
  if (collaborators.length)
    add(
      "team",
      "Team & credits",
      <ul className="flex flex-col divide-y divide-line-2 border-y border-line-2">
        {collaborators.map((c) => (
          <li key={c.name + (c.role ?? "")} className="flex items-baseline justify-between gap-6 py-3.5">
            {c.url ? (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg underline-offset-4 hover:text-accent hover:underline"
              >
                {c.name}
              </a>
            ) : (
              <span className="text-fg">{c.name}</span>
            )}
            {c.role && <span className="text-right text-sm text-fg-3">{c.role}</span>}
          </li>
        ))}
      </ul>,
    );
  if (testimonials.length)
    add(
      "testimonials",
      "What people said",
      <div className="flex flex-col gap-4">
        {testimonials.map((t) => (
          <figure
            key={t.quote.slice(0, 40)}
            className="flex flex-col gap-5 rounded-card border border-line bg-surface/40 p-6 md:p-8"
          >
            <Quote aria-hidden className="size-6 text-accent" />
            <blockquote className="text-h3 font-light leading-snug text-fg">{t.quote}</blockquote>
            <figcaption className="text-sm">
              <span className="text-fg">{t.name}</span>
              {(t.role || t.organisation) && (
                <span className="ml-2 font-mono text-meta text-fg-3">
                  {[t.role, t.organisation].filter(Boolean).join(", ")}
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>,
    );
  if (videos.length)
    add(
      "demo",
      videos.length > 1 ? "Demos" : "Demo",
      <div className="video-standalone flex flex-col gap-6">
        {videos.map((v, i) => {
          const id = youTubeId(v.url);
          return id ? (
            <VideoCard key={v.url} id={id} title={v.title || `${project.title} demo ${i + 1}`} />
          ) : (
            <a
              key={v.url}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-fg hover:text-accent"
            >
              {v.title || `Watch demo ${i + 1}`} <ArrowUpRight aria-hidden className="size-4" />
            </a>
          );
        })}
      </div>,
    );

  const navSections = gallery.length
    ? [...sections, { id: "gallery-heading", label: "Screens", body: null }]
    : sections;

  return (
    <Layout>
      <SEO
        title={projectSeoTitle(project)}
        description={projectSeoDescription(project)}
        url={url}
        canonical={project.canonical_url ? projectCanonical(project, BASE_URL) : undefined}
        {...(project.og_image
          ? { image: project.og_image, imageWidth: 1200, imageHeight: 630, imageAlt: project.title }
          : {})}
        // Stub write-ups stay out of search (same rule as the prerendered copy).
        noIndex={isProjectIndexable(project) ? false : "follow"}
        structuredData={[
          projectSchema(project, { baseUrl: BASE_URL, author: PERSON_REF, related }),
          projectAppSchema(project, { baseUrl: BASE_URL, author: PERSON_REF }),
        ].filter((s): s is Record<string, unknown> => !!s)}
        breadcrumbs={[
          { name: "Projects", url: `${BASE_URL}/projects` },
          { name: project.title, url },
        ]}
      />
      <PageHero
        band={<span className="truncate">Saad Mazhar · Projects{category ? ` · ${category}` : ""}</span>}
        media={
          // No screenshot yet: the generated cover (colour and stack) instead of an empty hero.
          project.heroImage || project.image ? (
            <BrowserFrame
              src={project.heroImage || project.image}
              alt={project.altText || project.title}
              url={live}
            />
          ) : (
            <ProjectPoster
              project={project}
              showTitle={false}
              className="min-h-[180px] flex-1 rounded-[22px]"
            />
          )
        }
      >
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-meta text-fg-3">
          <Link to="/projects" className="inline-flex items-center gap-1.5 hover:text-fg">
            <ArrowLeft aria-hidden className="size-3.5" />
            All projects
          </Link>
          {category && (
            <>
              <span aria-hidden>/</span>
              <span className="text-fg-2">{category}</span>
            </>
          )}
        </nav>
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[880px] flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={project.stage} />
              {project.is_ongoing && <Tag>Ongoing</Tag>}
              {project.industry && <Tag>{project.industry}</Tag>}
            </div>
            <h1 className="text-display-l font-medium">{project.title}</h1>
            <p className="text-h3 font-light text-fg-2 md:text-h2">{project.tagline}</p>
          </div>
          {(live || code) && (
            <div className="flex shrink-0 flex-wrap gap-3">
              {live && (
                <Button href={live} size="lg">
                  Visit live site
                </Button>
              )}
              {code && (
                <Button href={code} variant="secondary" size="lg" icon={false}>
                  <Github aria-hidden className="size-[18px]" />
                  View code
                </Button>
              )}
            </div>
          )}
        </div>
      </PageHero>

      {(meta.length > 0 || results.length > 0) && (
        <section aria-label="Project at a glance" className="border-b border-line">
          <div className="wrap flex flex-col gap-10 py-12 md:py-16">
            {meta.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {meta.map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-2.5 border-l border-line-2 pl-4">
                    <dt className="label text-fg-3">{k}</dt>
                    <dd className={cn("leading-snug", k === "Status" ? "text-live" : "text-fg")}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {results.length > 0 && (
              <dl
                className={cn(
                  "grid grid-cols-2 gap-3",
                  results.length >= 4 ? "md:grid-cols-4" : results.length === 3 ? "md:grid-cols-3" : "",
                )}
              >
                {results.slice(0, 4).map((r) => (
                  <div
                    key={r.label + r.value}
                    className="flex flex-col-reverse gap-2 rounded-card border border-line bg-surface/50 p-5 md:p-6"
                  >
                    <dt className="text-sm text-fg-2">{r.label}</dt>
                    <dd className="text-display-m font-medium leading-none text-accent">{r.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      )}

      <div className="wrap grid gap-14 py-20 md:grid-cols-[240px_1fr] md:gap-16 md:py-28 lg:grid-cols-[260px_1fr] lg:gap-24">
        <aside className="flex flex-col gap-6 md:sticky md:top-28 md:max-h-[calc(100svh-8rem)] md:self-start md:overflow-y-auto md:[scrollbar-width:none]">
          {navSections.length > 1 && <SectionNav sections={navSections} />}
          {stack.length > 0 && (
            <SideCard title="Built with">
              <div className="flex flex-wrap gap-2">
                {stack.map((t) => (
                  <Link
                    key={t}
                    to={`/projects?stack=${encodeURIComponent(t)}`}
                    title={`Other projects built with ${t}`}
                    className="transition-opacity hover:opacity-80"
                  >
                    <Tag>{t}</Tag>
                  </Link>
                ))}
              </div>
            </SideCard>
          )}
          {(project.target_audience ||
            project.team_size ||
            project.skills?.length ||
            resources.length > 0) && (
            <SideCard title="Details">
              {project.target_audience && <Fact label="Built for">{project.target_audience}</Fact>}
              {project.team_size ? (
                <Fact label="Team">{project.team_size === 1 ? "Solo" : `${project.team_size} people`}</Fact>
              ) : null}
              {project.skills?.length ? (
                <Fact label="Skills">
                  <span className="flex flex-wrap gap-x-3 gap-y-1">
                    {project.skills.map((s) => (
                      <Link
                        key={s}
                        to="/skills"
                        className="underline-offset-4 hover:text-accent hover:underline"
                      >
                        {s}
                      </Link>
                    ))}
                  </span>
                </Fact>
              ) : null}
              {resources.length > 0 && (
                <Fact label="Docs & publications">
                  <span className="flex flex-col gap-1.5">
                    {resources.map((r) => (
                      <a
                        key={r.url}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-accent"
                      >
                        {r.label || r.url}
                        {r.kind && <span className="font-mono text-meta text-fg-3">· {r.kind}</span>}
                        <ArrowUpRight aria-hidden className="size-3.5 shrink-0" />
                      </a>
                    ))}
                  </span>
                </Fact>
              )}
            </SideCard>
          )}
        </aside>

        <article className="flex min-w-0 max-w-[720px] flex-col gap-20 text-body-l text-fg-2">
          {sections.map((s, i) => (
            <Reveal key={s.id} className="flex flex-col gap-7">
              <h2 id={s.id} className="flex items-baseline gap-4 text-h2 font-medium text-fg">
                <span aria-hidden className="font-mono text-meta font-normal text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.label}
              </h2>
              {s.body}
            </Reveal>
          ))}
          {updated && (
            <p className="border-t border-line-2 pt-6 font-mono text-meta text-fg-3">
              Last updated <time dateTime={updated.toISOString()}>{fullDate(updated.toISOString())}</time>
            </p>
          )}
        </article>
      </div>

      {gallery.length > 0 && (
        <Gallery
          images={gallery.map((g) => g.url)}
          alts={gallery.map((g) => g.alt)}
          captions={gallery.map((g) => g.caption)}
          title={project.title}
          label="Screens"
          heading={
            <>
              Inside the product{" "}
              <span className="soft">
                in {gallery.length} {gallery.length === 1 ? "screen" : "screens"}
              </span>
            </>
          }
        />
      )}

      {related.length > 0 && (
        <section className="section" aria-labelledby="related-heading">
          <div className="wrap">
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 id="related-heading" className="text-h1 font-medium">
                Related <span className="soft">projects</span>
              </h2>
              <Link to="/projects" className="hidden shrink-0 text-sm text-fg-2 hover:text-fg sm:inline-flex">
                All projects →
              </Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((r) => (
                <li key={r.id}>
                  <ProjectCard project={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {showNext && (
        <section className="section">
          <div className="wrap">
            <Link
              to={`/projects/${next.slug}`}
              className="group grid items-center gap-6 overflow-hidden rounded-[28px] border border-line bg-surface/40 p-2 transition-colors hover:border-line-3 hover:bg-surface/70 md:grid-cols-[1fr_360px] md:p-3"
            >
              <div className="flex flex-col gap-4 p-5 md:p-8">
                <span className="label text-fg-3">Next project</span>
                <span className="text-display-m font-medium">
                  {next.title}{" "}
                  <ArrowRight
                    aria-hidden
                    className="inline size-[0.7em] text-accent transition-transform duration-200 group-hover:translate-x-2"
                  />
                </span>
                <span className="text-body-l text-fg-2">{next.tagline}</span>
              </div>
              {next.heroImage || next.image ? (
                <Media
                  src={next.heroImage || next.image}
                  alt=""
                  className="aspect-[16/10] rounded-[20px]"
                  imgClassName="object-top"
                />
              ) : (
                <ProjectPoster project={next} className="aspect-[16/10] rounded-[20px]" />
              )}
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProjectDetailPage;
