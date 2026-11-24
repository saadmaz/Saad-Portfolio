import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, FilterPill, PageHeader, Reveal, Skeleton } from "@/components/ui";
import { ProjectCard } from "@/components/cards";
import { useProjects } from "@/hooks/useProjects";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { isProjectIndexable } from "@/lib/indexing";

const ProjectsPage = () => {
  const { data = [], isLoading } = useProjects();
  const [filter, setFilter] = useState("All");

  const projects = useMemo(
    () => [...data].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999)),
    [data],
  );
  const categories = useMemo(
    () => ["All", ...new Set(projects.map((p) => p.category || p.type).filter(Boolean) as string[])],
    [projects],
  );
  const shown = filter === "All" ? projects : projects.filter((p) => (p.category || p.type) === filter);
  const [first, ...rest] = shown;

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
      >
        {categories.length > 2 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-line-2 pt-8">
            {categories.map((c) => (
              <FilterPill key={c} active={filter === c} onClick={() => setFilter(c)}>
                {c === "All" ? `All · ${projects.length}` : c}
              </FilterPill>
            ))}
          </div>
        )}
      </PageHeader>

      <section className="wrap pb-32">
        {isLoading ? (
          <Skeleton className="aspect-[16/9] w-full rounded-media" />
        ) : shown.length === 0 ? (
          <Empty>No projects here yet.</Empty>
        ) : (
          <div className="flex flex-col gap-20 md:gap-24">
            <Reveal>
              <ProjectCard project={first} index={0} feature />
            </Reveal>
            <div className="grid gap-16 md:grid-cols-2 md:gap-x-6 md:gap-y-24">
              {rest.map((p, i) => (
                <Reveal key={p.id}>
                  <ProjectCard project={p} index={i + 1} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ProjectsPage;
