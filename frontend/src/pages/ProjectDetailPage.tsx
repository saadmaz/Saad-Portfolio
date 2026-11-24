import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, Quote } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { Button, Media, PageHero, Reveal, Skeleton, Tag } from "@/components/ui";
import { ProjectCard } from "@/components/cards";
import { VideoCard } from "@/components/article/VideoCard";
import { useProject, useProjects } from "@/hooks/useProjects";
import { fullDate } from "@/lib/format";
import { BASE_URL, PERSON_REF } from "@/lib/seo-content";
import { isProjectIndexable } from "@/lib/indexing";
import { youTubeId } from "@/lib/youtube";
import {
  projectCanonical,
  projectDuration,
  projectGallery,
  projectSchema,
  projectSeoDescription,
  projectSeoTitle,
  projectTimeline,
  projectVideos,
  relatedProjects,
  toDate,
} from "@/lib/project-seo";

function Block({
  index,
  label,
  title,
  children,
}: {
  index: string;
  label: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="flex flex-col gap-6">
      <h2 className="label text-accent">
        {index} · {label}
      </h2>
      {title && <p className="text-h2 font-medium text-fg">{title}</p>}
      {children}
    </Reveal>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((t) => (
        <li key={t} className="flex gap-3.5 text-fg">
          <span aria-hidden className="mt-[11px] size-1.5 shrink-0 rounded-full bg-accent" />
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Small labelled fact in the sidebar. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-line-2 pt-4">
      <span className="label text-fg-3">{label}</span>
      <span className="text-[15px] text-fg">{children}</span>
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
        <div className="wrap flex flex-col gap-8 py-24">
          <Skeleton className="h-24 w-2/3" />
          <Skeleton className="aspect-[16/9] w-full rounded-media" />
        </div>
      </Layout>
    );
  // A real "not found" (the server already answered 404), not a silent jump to the list.
  if (!project) return <NotFound />;

  const url = `${BASE_URL}/projects/${project.slug}`;
  const live = project.liveUrl || project.live_preview;
  const code = project.githubUrl || project.github;
  const stack = project.technologies?.length ? project.technologies : (project.techStack ?? []);
  const challenges = (project.challenges ?? []).map((c) =>
    typeof c === "string" ? c : [c.wall, c.fix].filter(Boolean).join(". "),
  );
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

  // Stage (where the product is) and status (where my work on it is) are separate facts.
  const meta = [
    ["Role", project.role],
    ["Client", project.client],
    ["Timeline", [timeline, duration].filter(Boolean).join(" · ")],
    ["Stage", project.stage],
    ["Status", project.status],
  ].filter(([, v]) => v) as [string, string][];

  let n = 0;
  const idx = () => String(++n).padStart(2, "0");

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
        structuredData={projectSchema(project, { baseUrl: BASE_URL, author: PERSON_REF, related })}
        breadcrumbs={[
          { name: "Projects", url: `${BASE_URL}/projects` },
          { name: project.title, url },
        ]}
      />
      <PageHero
        band="Saad Mazhar · Projects"
        media={
          <Media
            src={project.heroImage || project.image}
            alt={project.altText || project.title}
            className="absolute inset-0"
            priority
          />
        }
      >
        <Link to="/projects" className="text-sm text-fg-2 hover:text-fg">
          ← All work
        </Link>
        <h1 className="mt-8 text-display-xl font-medium">{project.title}</h1>
        <p className="mt-6 max-w-[860px] text-h2 font-light text-fg-2">{project.tagline}</p>
        {meta.length > 0 && (
          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line-2 pt-8 md:grid-cols-5">
            {meta.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-2.5">
                <dt className="label text-fg-3">{k}</dt>
                <dd className={k === "Status" ? "text-live" : "text-fg"}>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </PageHero>

      {results.length > 0 && (
        <section aria-label="Results" className="border-y border-line">
          <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4">
            {results.slice(0, 4).map((r) => (
              <div key={r.label + r.value} className="flex flex-col-reverse gap-2">
                <dt className="text-sm text-fg-2">{r.label}</dt>
                <dd className="text-display-m font-medium leading-none">{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="wrap grid gap-16 py-24 md:grid-cols-[280px_1fr] md:gap-24 md:py-32">
        <aside className="flex flex-col gap-8 md:sticky md:top-28 md:self-start">
          {(live || code) && (
            <div className="flex flex-wrap gap-3 md:flex-col md:items-start">
              {live && <Button href={live}>Visit live site</Button>}
              {code && (
                <Button href={code} variant="secondary" icon={false}>
                  View code
                </Button>
              )}
            </div>
          )}
          {stack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stack.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-4">
            {project.industry && <Fact label="Industry">{project.industry}</Fact>}
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
          </div>
        </aside>

        <article className="flex max-w-prose flex-col gap-16 text-body-l text-fg-2">
          {(project.problem || project.overview) && (
            <Block index={idx()} label="Overview">
              <p>{project.problem || project.overview}</p>
              {project.problem && project.overview && <p>{project.overview}</p>}
            </Block>
          )}
          {(project.solution || project.long_description) && (
            <Block index={idx()} label="What I built">
              <p className="whitespace-pre-line">{project.solution || project.long_description}</p>
            </Block>
          )}
          {project.contribution?.length ? (
            <Block index={idx()} label="My contribution">
              <List items={project.contribution} />
            </Block>
          ) : null}
          {(project.impact || results.length > 4) && (
            <Block index={idx()} label="Impact & results">
              {results.length > 4 && <List items={results.slice(4).map((r) => `${r.value} ${r.label}`)} />}
              {project.impact && <p className="whitespace-pre-line">{project.impact}</p>}
            </Block>
          )}
          {project.features?.length ? (
            <Block index={idx()} label="Features">
              <List items={project.features} />
            </Block>
          ) : null}
          {(project.architecture?.description ||
            project.architecture?.diagramUrl ||
            project.technical_decisions?.length) && (
            <Block index={idx()} label="Architecture">
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
                  <List items={project.technical_decisions} />
                </div>
              ) : null}
            </Block>
          )}
          {challenges.length > 0 && (
            <Block index={idx()} label="Challenges">
              <List items={challenges} />
            </Block>
          )}
          {project.learnings?.length ? (
            <Block index={idx()} label="What I learned">
              <List items={project.learnings} />
            </Block>
          ) : null}
          {collaborators.length > 0 && (
            <Block index={idx()} label="Team & credits">
              <ul className="flex flex-col divide-y divide-line-2 border-y border-line-2">
                {collaborators.map((c) => (
                  <li
                    key={c.name + (c.role ?? "")}
                    className="flex items-baseline justify-between gap-6 py-3.5"
                  >
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
              </ul>
            </Block>
          )}
          {testimonials.length > 0 && (
            <Block index={idx()} label="What people said">
              <div className="flex flex-col gap-10">
                {testimonials.map((t) => (
                  <figure key={t.quote.slice(0, 40)} className="flex flex-col gap-4">
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
              </div>
            </Block>
          )}
          {videos.length > 0 && (
            <Block index={idx()} label={videos.length > 1 ? "Demos" : "Demo"}>
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
              </div>
            </Block>
          )}
          {gallery.length > 0 && (
            <div className="grid gap-8">
              {gallery.map((g) => (
                <figure key={g.url} className="flex flex-col gap-3">
                  <Media src={g.url} alt={g.alt} className="aspect-[16/10]" />
                  {g.caption && <figcaption className="text-sm text-fg-3">{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
          {updated && (
            <p className="font-mono text-meta text-fg-3">
              Last updated <time dateTime={updated.toISOString()}>{fullDate(updated.toISOString())}</time>
            </p>
          )}
        </article>
      </div>

      {related.length > 0 && (
        <section className="section" aria-labelledby="related-heading">
          <div className="wrap">
            <h2 id="related-heading" className="label mb-10 text-fg-3">
              Related projects
            </h2>
            <div className="grid gap-16 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {related.slice(0, 3).map((r, i) => (
                <ProjectCard key={r.id} project={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {next && next.slug !== project.slug && !related.some((r) => r.slug === next.slug) && (
        <section className="section">
          <Link to={`/projects/${next.slug}`} className="wrap group flex flex-col gap-4">
            <span className="label text-fg-3">Next project</span>
            <span className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <span className="text-display-l font-medium">
                {next.title}{" "}
                <span className="text-accent transition-transform group-hover:translate-x-2">→</span>
              </span>
              <span className="text-body-l text-fg-2">{next.tagline}</span>
            </span>
          </Link>
        </section>
      )}
    </Layout>
  );
};

export default ProjectDetailPage;
