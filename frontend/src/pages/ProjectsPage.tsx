import { useMemo, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, PageHeader, Reveal, Skeleton } from "@/components/ui";
import { ProjectCard, ProjectFeature } from "@/components/cards";
import { stageTone } from "@/lib/projectStage";
import { useProjects } from "@/hooks/useProjects";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { isProjectIndexable } from "@/lib/indexing";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

const categoryOf = (p: Project) => p.category || p.type || "";

/** Everything a visitor might type: name, pitch, client, industry and stack. */
const haystack = (p: Project) =>
  [
    p.title,
    p.tagline,
    p.client,
    p.industry,
    categoryOf(p),
    p.stage,
    ...(p.techStack ?? []),
    ...(p.technologies ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

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
        "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-sm transition-colors",
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

const ProjectsPage = () => {
  const { data = [], isLoading } = useProjects();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

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

  const q = query.trim().toLowerCase();
  const shown = projects.filter(
    (p) => (filter === "All" || categoryOf(p) === filter) && (!q || haystack(p).includes(q)),
  );
  // The spotlight only leads the unfiltered list; once you narrow it, every match is an equal card.
  const browsing = filter === "All" && !q;
  const lead = browsing ? (shown.find((p) => p.featured) ?? shown[0]) : undefined;
  const grid = lead ? shown.filter((p) => p !== lead) : shown;

  const live = projects.filter((p) => stageTone(p.stage) === "live").length;
  const stats = [
    { value: projects.length, label: "Projects" },
    { value: live, label: "Live in production" },
    { value: categories.length, label: "Areas" },
  ];

  const reset = () => {
    setFilter("All");
    setQuery("");
  };

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/projects"].title}
        description={PAGE_SEO["/projects"].description}
        url={`${BASE_URL}/projects`}
        // An empty or stub-only listing reads as a soft 404 to search engines
        // (same rule as the prerendered copy).
        noIndex={!isLoading && !data.some(isProjectIndexable) ? "follow" : false}
      />
      <PageHeader
        label="Projects"
        title="Selected"
        soft="work"
        intro="Startups I founded, products I shipped for clients, and experiments that taught me something. Each one has a full case study."
        aside={
          projects.length > 0 && (
            <dl className="flex gap-8 md:gap-10 md:pb-3">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-2">
                  <dt className="label text-fg-3">{s.label}</dt>
                  <dd className="text-display-m font-medium tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          )
        }
      />

      {/* Search and filters stay in reach while scrolling a long list. */}
      <div className="sticky top-[76px] z-30 -mt-8 mb-10 border-y border-line bg-base/85 backdrop-blur-xl md:-mt-12 lg:top-[84px]">
        <div className="wrap flex flex-col gap-3 py-3 md:flex-row md:items-center md:gap-6">
          <label className="relative flex shrink-0 items-center md:w-[260px]">
            <span className="sr-only">Search projects</span>
            <Search aria-hidden className="pointer-events-none absolute left-3.5 size-4 text-fg-3" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or stack"
              className="h-9 w-full rounded-full border border-line-2 bg-surface/60 pl-10 pr-9 text-sm text-fg placeholder:text-fg-3 transition-colors focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 flex size-6 items-center justify-center rounded-full text-fg-3 hover:bg-surface-2 hover:text-fg"
              >
                <X className="size-3.5" />
              </button>
            )}
          </label>
          {categories.length > 1 && (
            <div
              role="group"
              aria-label="Filter by category"
              className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:px-0"
            >
              <Chip active={filter === "All"} count={projects.length} onClick={() => setFilter("All")}>
                All
              </Chip>
              {categories.map(([c, n]) => (
                <Chip key={c} active={filter === c} count={n} onClick={() => setFilter(c)}>
                  {c}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="wrap pb-32" aria-label="Projects">
        {isLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[440px] w-full rounded-[28px]" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[420px] rounded-[22px]" />
              ))}
            </div>
          </div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-5">
            <Empty>{projects.length ? "Nothing matches that search." : "No projects here yet."}</Empty>
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
        ) : (
          <div className="flex flex-col gap-6">
            {!browsing && (
              <p className="font-mono text-meta text-fg-3" aria-live="polite">
                {shown.length} {shown.length === 1 ? "project" : "projects"}
                {filter !== "All" && ` in ${filter}`}
                {q && ` matching “${query.trim()}”`}
              </p>
            )}
            {lead && (
              <Reveal>
                <ProjectFeature project={lead} />
              </Reveal>
            )}
            {grid.length > 0 && (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((p) => (
                  <li key={p.id}>
                    <Reveal className="h-full">
                      <ProjectCard project={p} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ProjectsPage;
