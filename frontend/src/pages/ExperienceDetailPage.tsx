import { useMemo, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText, Link2, Presentation } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { PageHero, Reveal, Skeleton, Tag } from "@/components/ui";
import { Mark, ProjectCard } from "@/components/cards";
import { Gallery } from "@/components/Gallery";
import { useExperience } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { companyPeriod, companyProjects, normalizeExperience } from "@/lib/experience";
import { BASE_URL } from "@/lib/seo-content";
import { cn } from "@/lib/utils";

const MEDIA_ICON = { Document: FileText, Presentation, Link: Link2, Image: Link2 } as const;

function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal className="flex flex-col gap-7">
      <h2 id={id} className="flex items-baseline gap-4 text-h2 font-medium text-fg">
        <span aria-hidden className="font-mono text-meta font-normal text-accent">
          {String(index).padStart(2, "0")}
        </span>
        {title}
      </h2>
      {children}
    </Reveal>
  );
}

const ExperienceDetailPage = () => {
  const { slug = "" } = useParams();
  const { data = [], isLoading } = useExperience();
  const { data: projects = [] } = useProjects();
  const companies = useMemo(() => normalizeExperience(data), [data]);

  if (isLoading)
    return (
      <Layout>
        <div className="wrap flex flex-col gap-8 py-32">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-2/3" />
          <Skeleton className="h-64 w-full rounded-[22px]" />
        </div>
      </Layout>
    );

  const at = companies.findIndex((c) => c.slug === slug);
  const company = companies[at];
  if (!company) return <NotFound />;

  const url = `${BASE_URL}/experience/${company.slug}`;
  const period = companyPeriod(company);
  const current = company.roles.some((r) => r.isCurrent);
  const linked = companyProjects(company, projects);
  const skills = [...new Set([...company.skills, ...company.roles.flatMap((r) => r.skills)])];
  const images = company.media.filter((m) => m.media_type === "Image");
  const files = company.media.filter((m) => m.media_type !== "Image");
  const prev = at > 0 ? companies[at - 1] : undefined;
  const next = at < companies.length - 1 ? companies[at + 1] : undefined;
  const lead = company.roles[0];
  const summary =
    company.description ||
    lead?.description ||
    `${lead?.title ?? "Work"} at ${company.name}${period ? `, ${period}` : ""}.`;

  const facts = [
    ["Period", period],
    ["Roles", String(company.roles.length)],
    ["Type", company.employmentType],
    ["Location", [company.location, company.locationType].filter(Boolean).join(" · ")],
  ].filter(([, v]) => v) as [string, string][];

  let n = 0;

  return (
    <Layout>
      <SEO
        title={`${company.name}: ${lead?.title ?? "Experience"} | Saad Mazhar`}
        description={summary.replace(/\s+/g, " ").slice(0, 158)}
        url={url}
        breadcrumbs={[
          { name: "Experience", url: `${BASE_URL}/experience` },
          { name: company.name, url },
        ]}
      />
      <PageHero ambient band={<span className="truncate">Saad Mazhar · Experience · {company.name}</span>}>
        <nav aria-label="Breadcrumb" className="animate-rise font-mono text-meta text-fg-3">
          <Link to="/experience" className="inline-flex items-center gap-1.5 hover:text-fg">
            <ArrowLeft aria-hidden className="size-3.5" />
            All experience
          </Link>
        </nav>
        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-[860px] flex-col gap-6">
            <div className="flex animate-rise flex-wrap items-center gap-2 [animation-delay:100ms]">
              {current && (
                <span className="label inline-flex h-7 items-center gap-2 rounded-full border border-live/25 bg-live/10 px-2.5 text-live">
                  <span aria-hidden className="size-1.5 rounded-full bg-live" />
                  Current
                </span>
              )}
              {company.employmentType && <Tag>{company.employmentType}</Tag>}
              {company.locationType && <Tag>{company.locationType}</Tag>}
            </div>
            <div className="flex animate-rise items-center gap-5 [animation-delay:180ms] md:gap-7">
              <Mark
                src={company.logo}
                label={company.name}
                className="size-16 rounded-[18px] text-[1.25rem] text-fg md:size-24 md:rounded-[24px] md:text-[2rem]"
              />
              <h1 className="text-display-l font-medium">{company.name}</h1>
            </div>
            {lead && (
              <p className="animate-rise text-h3 font-light text-fg-2 [animation-delay:260ms] md:text-h2">
                {lead.title}
                {company.roles.length > 1 && (
                  <span className="text-fg-3">
                    {" "}
                    + {company.roles.length - 1} more {company.roles.length > 2 ? "roles" : "role"}
                  </span>
                )}
              </p>
            )}
            {company.url && (
              <a
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit animate-rise items-center gap-1.5 text-sm text-fg-2 underline-offset-4 [animation-delay:320ms] hover:text-accent hover:underline"
              >
                Visit {company.name} <ArrowUpRight aria-hidden className="size-4" />
              </a>
            )}
          </div>
          {company.illustration && (
            <img
              src={company.illustration}
              alt=""
              className="mx-auto size-[200px] shrink-0 animate-rise object-contain drop-shadow-[0_30px_40px_rgb(0_0_0/0.6)] [animation-delay:300ms] md:size-[300px] lg:mx-0"
            />
          )}
        </div>
      </PageHero>

      {facts.length > 0 && (
        <section aria-label="At a glance" className="border-b border-line">
          <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-8 py-12 md:grid-cols-4 md:py-14">
            {facts.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-2.5 border-l border-line-2 pl-4">
                <dt className="label text-fg-3">{k}</dt>
                <dd className={cn("leading-snug", k === "Period" && current ? "text-live" : "text-fg")}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="wrap grid gap-14 py-20 md:grid-cols-[1fr_260px] md:gap-16 md:py-28 lg:gap-24">
        <article className="flex min-w-0 max-w-[720px] flex-col gap-20 text-body-l text-fg-2">
          {company.description && (
            <Section id="overview" index={++n} title="Overview">
              <p className="whitespace-pre-line">{company.description}</p>
            </Section>
          )}
          <Section id="roles" index={++n} title={company.roles.length > 1 ? "Roles" : "What I did"}>
            <ol className="relative flex flex-col gap-10 border-l border-line-2 pl-8">
              {company.roles.map((r) => (
                <li key={r.title + r.period} className="relative flex flex-col gap-4">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -left-[37px] top-2 size-3 rounded-full ring-4 ring-base",
                      r.isCurrent ? "bg-live" : "bg-accent",
                    )}
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="text-h3 font-medium text-fg">{r.title}</h3>
                    {r.period && <span className="font-mono text-meta text-fg-3">{r.period}</span>}
                  </div>
                  {r.description && <p className="whitespace-pre-line">{r.description}</p>}
                  {r.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {r.skills.map((s) => (
                        <Tag key={s}>{s}</Tag>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Section>
          {company.achievements && (
            <Section id="achievements" index={++n} title="Achievements">
              <p className="whitespace-pre-line rounded-card border border-line bg-surface/40 p-6 text-fg md:p-8">
                {company.achievements}
              </p>
            </Section>
          )}
          {files.length > 0 && (
            <Section id="resources" index={++n} title="Documents & links">
              <ul className="flex flex-col divide-y divide-line-2 border-y border-line-2">
                {files.map((m) => {
                  const Icon = MEDIA_ICON[m.media_type] ?? Link2;
                  return (
                    <li key={m.media_url}>
                      <a
                        href={m.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 py-4 text-fg transition-colors hover:text-accent"
                      >
                        <Icon aria-hidden className="size-5 shrink-0 text-fg-3 group-hover:text-accent" />
                        <span className="min-w-0 flex-1 truncate">{m.media_caption || m.media_url}</span>
                        <span className="font-mono text-meta text-fg-3">{m.media_type}</span>
                        <ArrowUpRight aria-hidden className="size-4 shrink-0" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}
        </article>

        {skills.length > 0 && (
          <aside className="md:sticky md:top-28 md:self-start">
            <div className="flex flex-col gap-4 rounded-card border border-line bg-surface/40 p-5">
              <span className="label text-fg-3">Skills used</span>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {linked.length > 0 && (
        <section className="section" aria-labelledby="company-projects">
          <div className="wrap">
            <h2 id="company-projects" className="mb-10 text-h1 font-medium">
              Projects <span className="soft">at {company.name}</span>
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {linked.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {images.length > 0 && (
        <Gallery
          images={images.map((m) => m.media_url)}
          captions={images.map((m) => m.media_caption ?? "")}
          alts={images.map((m, i) => m.media_caption || `${company.name} (${i + 1} of ${images.length})`)}
          title={company.name}
          heading={
            <>
              Moments <span className="soft">at {company.name}</span>
            </>
          }
        />
      )}

      {(prev || next) && (
        <nav aria-label="More experience" className="section">
          <div className="wrap grid gap-4 md:grid-cols-2">
            {[prev, next].map((c, i) =>
              c ? (
                <Link
                  key={c.key}
                  to={`/experience/${c.slug}`}
                  className={cn(
                    "group flex items-center gap-4 rounded-[22px] border border-line bg-surface/40 p-5 transition-colors hover:border-accent/40 hover:bg-surface md:p-6",
                    i === 1 && "md:col-start-2 md:flex-row-reverse md:text-right",
                  )}
                >
                  <Mark src={c.logo} label={c.name} className="size-12 rounded-[14px]" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="label text-fg-3">{i === 0 ? "Previous" : "Next"}</span>
                    <span className="truncate text-h4 font-medium transition-colors group-hover:text-accent">
                      {c.name}
                    </span>
                  </span>
                  {i === 0 ? (
                    <ArrowLeft aria-hidden className="size-5 text-fg-3 group-hover:text-accent" />
                  ) : (
                    <ArrowRight aria-hidden className="size-5 text-fg-3 group-hover:text-accent" />
                  )}
                </Link>
              ) : null,
            )}
          </div>
        </nav>
      )}
    </Layout>
  );
};

export default ExperienceDetailPage;
