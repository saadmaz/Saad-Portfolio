import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Search, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import {
  Button,
  CountUp,
  Empty,
  Eyebrow,
  PageHero,
  Reveal,
  RisingWords,
  SectionHeader,
  Skeleton,
} from "@/components/ui";
import { ProjectCard, ProjectFeature, StageBadge } from "@/components/cards";
import { useProjects } from "@/hooks/useProjects";
import { PAGE_SEO, BASE_URL, PERSON_REF } from "@/lib/seo-content";
import { isProjectIndexable } from "@/lib/indexing";
import { projectsListSchema } from "@/lib/project-seo";
import {
  PROJECT_GROUPS,
  PROJECT_STATUSES,
  projectGroupOf,
  projectStatusOf,
  projectsFaq,
} from "@/lib/projectGroups";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

const INTRO =
  "Startups I founded, products I shipped for clients, and experiments that taught me something. Each one has a full case study.";
/** Cards per group before "Show all". */
const GROUP_PREVIEW = 6;

const categoryOf = (p: Project) => p.category || p.type || "";
const stackOf = (p: Project) => (p.techStack?.length ? p.techStack : (p.technologies ?? []));

/** Everything a visitor might type: name, pitch, client, industry and stack. */
const haystack = (p: Project) =>
  [p.title, p.tagline, p.client, p.industry, categoryOf(p), p.stage, ...stackOf(p)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

/** Newest by date (YYYY or YYYY-MM), for the hero card. */
const newest = (projects: Project[]) =>
  [...projects].sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")))[0];

function Chip({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 text-sm transition-colors",
        active
          ? "border-fg bg-fg text-fg-inverse"
          : "border-line-2 text-fg-2 hover:border-line-3 hover:text-fg",
      )}
    >
      {children}
      <span className={cn("font-mono text-[11px] tabular-nums", active ? "text-fg-inverse/60" : "text-fg-3")}>
        {count}
      </span>
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full appearance-none rounded-full border border-line-2 bg-surface/60 pl-3.5 pr-8 text-sm text-fg focus:border-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-fg-3"
      />
    </label>
  );
}

/** The newest project as a small card in the hero. */
function LatestShip({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group flex max-w-[360px] flex-col gap-3 rounded-card border border-line-2 bg-surface/70 p-6 backdrop-blur-sm transition-colors hover:border-accent"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="label text-accent">Latest ship</span>
        <StageBadge stage={project.stage} />
      </div>
      <span className="text-h4 font-medium transition-colors group-hover:text-accent">{project.title}</span>
      <span className="line-clamp-2 text-sm text-fg-2">{project.tagline}</span>
      <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-fg-2 group-hover:text-fg">
        Read the case study <ArrowUpRight aria-hidden className="size-4" />
      </span>
    </Link>
  );
}

const ProjectsPage = () => {
  const { data = [], isLoading } = useProjects();
  const [params, setParams] = useSearchParams();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const q = params.get("q") ?? "";
  const filter = params.get("category") ?? "";
  const status = params.get("status") ?? "";
  const stack = params.get("stack") ?? "";
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const reset = () => setParams(new URLSearchParams(), { replace: true });

  const projects = useMemo(
    () => [...data].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999)),
    [data],
  );
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      const c = categoryOf(p);
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);
  const stacks = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) for (const t of stackOf(p)) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([, n]) => n > 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 20);
  }, [projects]);

  const query = q.trim().toLowerCase();
  const shown = projects.filter(
    (p) =>
      (!filter || categoryOf(p) === filter) &&
      (!status || projectStatusOf(p) === status) &&
      (!stack || stackOf(p).includes(stack)) &&
      (!query || haystack(p).includes(query)),
  );
  // Browsing (no filters): spotlight plus grouped sections. Filtering: one flat, equal grid.
  const browsing = !filter && !status && !stack && !query;
  const lead = browsing ? (shown.find((p) => p.featured) ?? shown[0]) : undefined;
  const groups = PROJECT_GROUPS.map((g) => ({
    ...g,
    items: shown.filter((p) => p !== lead && projectGroupOf(p) === g.id),
  })).filter((g) => g.items.length > 0);

  const live = projects.filter((p) => projectStatusOf(p) === "live").length;
  const ventures = projects.filter((p) => projectGroupOf(p) === "venture").length;
  const stats = [
    { value: projects.length, label: "Projects" },
    { value: live, label: "Live in production" },
    { value: ventures, label: "For my ventures" },
    { value: categories.length, label: "Areas" },
  ].filter((s) => s.value > 0);

  const indexable = projects.filter(isProjectIndexable);
  const faq = useMemo(() => projectsFaq(projects), [projects]);
  const latest = newest(projects);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/projects"].title}
        description={PAGE_SEO["/projects"].description}
        url={`${BASE_URL}/projects`}
        // An empty or stub-only listing reads as a soft 404 to search engines
        // (same rule as the prerendered copy).
        noIndex={!isLoading && !indexable.length ? "follow" : false}
        structuredData={[
          ...(indexable.length
            ? [projectsListSchema(indexable, { baseUrl: BASE_URL, author: PERSON_REF })]
            : []),
          ...(faq.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faq.map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
                },
              ]
            : []),
        ]}
      />

      <PageHero ambient className="mb-0" band={<span className="truncate">Saad Mazhar · Projects</span>}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-[760px]">
            <div className="animate-rise">
              <Eyebrow>Projects</Eyebrow>
            </div>
            <h1 className="mt-8 text-display-xl font-medium md:mt-10">
              <RisingWords text="Selected" /> <RisingWords text="work" from={1} className="soft" />
            </h1>
            <p className="mt-8 max-w-[580px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
              {INTRO}
            </p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:400ms]">
              <Button to="/contact">Work with me</Button>
              {ventures > 0 && (
                <Button href="#venture" variant="secondary" icon={false}>
                  See my ventures
                </Button>
              )}
            </div>
            {stats.length > 0 && (
              <dl className="mt-12 grid max-w-[640px] animate-rise grid-cols-2 gap-6 [animation-delay:450ms] sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse gap-2 border-l border-line-2 pl-4">
                    <dt className="label text-fg-3">{s.label}</dt>
                    <dd className="text-display-m font-medium leading-none">
                      <CountUp value={s.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {latest && (
            <div className="hidden animate-rise [animation-delay:550ms] lg:block">
              <LatestShip project={latest} />
            </div>
          )}
        </div>
      </PageHero>

      {/* Search and filters stay in reach while scrolling a long list. */}
      <div className="sticky top-[84px] z-30 border-y border-line bg-base/90 backdrop-blur-xl lg:top-[92px]">
        <div className="wrap flex flex-col gap-2 py-2 md:flex-row md:items-center md:gap-4">
          <div className="flex gap-2">
            <label className="relative flex min-w-0 flex-1 items-center md:w-[220px] md:flex-none">
              <span className="sr-only">Search projects</span>
              <Search aria-hidden className="pointer-events-none absolute left-3 size-3.5 text-fg-3" />
              <input
                type="search"
                value={q}
                onChange={(e) => setParam("q", e.target.value)}
                placeholder="Search name or stack"
                className="h-8 w-full rounded-full border border-line-2 bg-surface/60 pl-9 pr-8 text-sm text-fg placeholder:text-fg-3 transition-colors focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setParam("q", "")}
                  aria-label="Clear search"
                  className="absolute right-1.5 flex size-6 items-center justify-center rounded-full text-fg-3 hover:bg-surface-2 hover:text-fg"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </label>
            {/* Phones: categories as a dropdown instead of a long chip row. */}
            {categories.length > 1 && (
              <Select
                label="Category"
                value={filter}
                onChange={(v) => setParam("category", v)}
                className="w-[44%] md:hidden"
                options={[
                  { value: "", label: `All (${projects.length})` },
                  ...categories.map(([c, n]) => ({ value: c, label: `${c} (${n})` })),
                ]}
              />
            )}
          </div>
          {categories.length > 1 && (
            <div
              role="group"
              aria-label="Filter by category"
              className="hidden min-w-0 flex-1 gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-40px),transparent)] [scrollbar-width:none] md:flex md:px-4"
            >
              <Chip active={!filter} count={projects.length} onClick={() => setParam("category", "")}>
                All
              </Chip>
              {categories.map(([c, n]) => (
                <Chip
                  key={c}
                  active={filter === c}
                  count={n}
                  onClick={() => setParam("category", filter === c ? "" : c)}
                >
                  {c}
                </Chip>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Select
              label="Status"
              value={status}
              onChange={(v) => setParam("status", v)}
              className="flex-1 md:w-[150px] md:flex-none"
              options={[
                { value: "", label: "Any status" },
                ...PROJECT_STATUSES.map((s) => ({ value: s.id, label: s.label })),
              ]}
            />
            {stacks.length > 0 && (
              <Select
                label="Stack"
                value={stack}
                onChange={(v) => setParam("stack", v)}
                className="flex-1 md:w-[150px] md:flex-none"
                options={[
                  { value: "", label: "Any stack" },
                  ...stacks.map(([t, n]) => ({ value: t, label: `${t} (${n})` })),
                ]}
              />
            )}
          </div>
        </div>
      </div>

      <div className="pb-24">
        {isLoading ? (
          <div className="wrap flex flex-col gap-6 pt-12">
            <Skeleton className="h-[440px] w-full rounded-[28px]" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[420px] rounded-[22px]" />
              ))}
            </div>
          </div>
        ) : shown.length === 0 ? (
          <div className="wrap flex flex-col items-center gap-5 pt-16">
            <Empty>{projects.length ? "Nothing matches those filters." : "No projects here yet."}</Empty>
            {projects.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="text-sm text-fg-2 underline underline-offset-4 hover:text-fg"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : browsing ? (
          <>
            {lead && (
              <section className="wrap pt-12" aria-label="Spotlight">
                <Reveal>
                  <ProjectFeature project={lead} />
                </Reveal>
              </section>
            )}
            {groups.map((g) => {
              const open = expanded.has(g.id);
              const items = open ? g.items : g.items.slice(0, GROUP_PREVIEW);
              return (
                <section
                  key={g.id}
                  id={g.id}
                  className="section scroll-mt-40"
                  aria-labelledby={`${g.id}-title`}
                >
                  <div className="wrap">
                    <Reveal>
                      <SectionHeader
                        id={`${g.id}-title`}
                        label={`${g.label} · ${g.items.length}`}
                        title={g.title}
                        soft={g.soft}
                      />
                      <p className="-mt-4 mb-10 max-w-[580px] text-fg-2">{g.intro}</p>
                    </Reveal>
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((p) => (
                        <li key={p.id}>
                          <Reveal className="h-full">
                            <ProjectCard project={p} />
                          </Reveal>
                        </li>
                      ))}
                    </ul>
                    {g.items.length > GROUP_PREVIEW && (
                      <div className="mt-10 flex justify-center">
                        <Button
                          variant="secondary"
                          icon={false}
                          onClick={() =>
                            setExpanded((s) => {
                              const next = new Set(s);
                              if (open) next.delete(g.id);
                              else next.add(g.id);
                              return next;
                            })
                          }
                        >
                          {open ? "Show fewer" : `Show all ${g.items.length}`}
                        </Button>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </>
        ) : (
          <section className="wrap flex flex-col gap-6 pt-10" aria-label="Matching projects">
            <div className="flex flex-wrap items-center gap-4">
              <p className="font-mono text-meta text-fg-3" aria-live="polite">
                {shown.length} {shown.length === 1 ? "project" : "projects"}
                {filter && ` in ${filter}`}
                {query && ` matching “${q.trim()}”`}
              </p>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-fg"
              >
                <X aria-hidden className="size-4" /> Clear filters
              </button>
            </div>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => (
                <li key={p.id}>
                  <Reveal className="h-full">
                    <ProjectCard project={p} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        )}

        {faq.length > 0 && browsing && (
          <section aria-labelledby="projects-faq" className="wrap border-t border-line-2 pt-16 lg:pt-24">
            <Eyebrow>FAQ</Eyebrow>
            <h2 id="projects-faq" className="mt-6 text-h2 font-medium">
              The short <span className="soft">version</span>
            </h2>
            <div className="mt-10 max-w-[820px] border-b border-line-2">
              {faq.map(({ question, answer }, i) => (
                <details key={question} open={i === 0} className="group border-t border-line-2 py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-body-l font-medium [&::-webkit-details-marker]:hidden">
                    {question}
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg-3 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[680px] text-fg-2">{answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProjectsPage;
