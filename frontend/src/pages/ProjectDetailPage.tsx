import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { Button, Media, PageHero, Reveal, Skeleton, Tag } from "@/components/ui";
import { useProject, useProjects } from "@/hooks/useProjects";
import { year } from "@/lib/format";
import { BASE_URL } from "@/lib/seo-content";
import { isProjectIndexable } from "@/lib/indexing";

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
      <span className="label text-accent">
        {index} · {label}
      </span>
      {title && <h2 className="text-h2 font-medium">{title}</h2>}
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

  const live = project.liveUrl || project.live_preview;
  const code = project.githubUrl || project.github;
  const stack = project.technologies?.length ? project.technologies : (project.techStack ?? []);
  const challenges = (project.challenges ?? []).map((c) =>
    typeof c === "string" ? c : [c.wall, c.fix].filter(Boolean).join(". "),
  );
  const shots = project.screenshots ?? project.images ?? [];
  const ordered = [...all].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
  const next = ordered[(ordered.findIndex((p) => p.slug === project.slug) + 1) % ordered.length];

  const meta = [
    ["Role", project.role],
    ["Timeline", [project.date && year(project.date), project.duration].filter(Boolean).join(" · ")],
    ["Stack", (project.techStack ?? []).slice(0, 4).join(", ")],
    ["Status", project.status],
  ].filter(([, v]) => v) as [string, string][];

  let n = 0;
  const idx = () => String(++n).padStart(2, "0");

  return (
    <Layout>
      <SEO
        title={project.title}
        description={project.tagline}
        url={`${BASE_URL}/projects/${project.slug}`}
        // Stub write-ups stay out of search (same rule as the prerendered copy).
        noIndex={isProjectIndexable(project) ? false : "follow"}
        breadcrumbs={[
          { name: "Projects", url: `${BASE_URL}/projects` },
          { name: project.title, url: `${BASE_URL}/projects/${project.slug}` },
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
          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line-2 pt-8 md:grid-cols-4">
            {meta.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-2.5">
                <dt className="label text-fg-3">{k}</dt>
                <dd className={k === "Status" ? "text-live" : "text-fg"}>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </PageHero>

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
          {project.features?.length ? (
            <Block index={idx()} label="Features">
              <List items={project.features} />
            </Block>
          ) : null}
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
          {project.impact && (
            <Block index={idx()} label="Impact">
              <p>{project.impact}</p>
            </Block>
          )}
          {shots.length > 0 && (
            <div className="grid gap-4">
              {shots.map((s, i) => (
                <Media
                  key={s}
                  src={s}
                  alt={`${project.title} screenshot ${i + 1}`}
                  className="aspect-[16/10]"
                />
              ))}
            </div>
          )}
        </article>
      </div>

      {next && next.slug !== project.slug && (
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
