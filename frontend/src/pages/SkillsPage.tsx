import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Empty, FilterPill, Meter, PageHeader, Reveal, Skeleton, Stat } from "@/components/ui";
import { useCertificates, useSkills } from "@/hooks/useContent";
import { SKILL_LEVEL } from "@/lib/levels";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const SkillsPage = () => {
  const { data = [], isLoading } = useSkills();
  const { data: certs = [] } = useCertificates();
  const [filter, setFilter] = useState("All");
  const total = data.reduce((n, g) => n + g.skills.length, 0);
  const groups = filter === "All" ? data : data.filter((g) => g.category === filter);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/skills"].title}
        description={PAGE_SEO["/skills"].description}
        url={`${BASE_URL}/skills`}
      />
      <PageHeader
        label="Skills"
        title="Tech stack"
        soft="& skills"
        intro="The tools I reach for every day, the ones I’m strong in, and the ones I know well enough to be useful. Levels are honest, no percentages."
        aside={
          total > 0 && (
            <div className="flex gap-14">
              <Stat value={total} label="Tools" />
              <Stat value={data.length} label="Disciplines" />
            </div>
          )
        }
      >
        {data.length > 1 && (
          <div className="mt-12 flex flex-col gap-5 border-t border-line-2 pt-8">
            <div className="flex flex-wrap gap-2">
              {["All", ...data.map((g) => g.category)].map((c) => (
                <FilterPill key={c} active={filter === c} onClick={() => setFilter(c)}>
                  {c === "All" ? `All · ${total}` : c}
                </FilterPill>
              ))}
            </div>
            <div className="flex flex-wrap gap-5">
              {Object.values(SKILL_LEVEL).map((l) => (
                <span key={l.label} className="flex items-center gap-2 font-mono text-meta text-fg-3">
                  <Meter value={l.value} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </PageHeader>

      <section className="wrap pb-24">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : groups.length === 0 ? (
          <Empty>Skills will appear here soon.</Empty>
        ) : (
          <div className="border-b border-line-2">
            {groups.map((g, i) => (
              <Reveal key={g.category}>
                <div className="grid gap-6 border-t border-line-2 py-10 md:grid-cols-[282px_1fr] md:gap-6 md:py-12">
                  <div className="flex flex-col gap-2.5">
                    <span className="label text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <h2 className="text-h2 font-medium">{g.category}</h2>
                    <span className="font-mono text-meta text-fg-3">{g.skills.length} tools</span>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                    {g.skills.map((s) => {
                      const lvl = SKILL_LEVEL[s.level] ?? SKILL_LEVEL.Intermediate;
                      return (
                        <li
                          key={s.name}
                          className="flex items-center gap-3.5 rounded-card border border-line bg-surface p-4"
                        >
                          <span className="label flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line-2 bg-surface-2">
                            {s.icon ? (
                              <img src={s.icon} alt="" className="size-6 object-contain" loading="lazy" />
                            ) : (
                              s.name.slice(0, 2)
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{s.name}</span>
                            <span className="mt-1.5 flex items-center gap-2 font-mono text-meta text-fg-3">
                              <Meter value={lvl.value} />
                              {lvl.label}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {certs.length > 0 && (
        <section className="section">
          <div className="wrap flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <h2 className="text-display-m font-medium">
              Backed by <span className="soft">{certs.length} certifications</span>
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button to="/certifications" variant="secondary" size="lg">
                Licenses & certificates
              </Button>
              <Button to="/contact" size="lg">
                Start a project
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default SkillsPage;
