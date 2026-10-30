import { useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Empty, PageHeader, Reveal, Skeleton, Stat, Tag } from "@/components/ui";
import { Mark } from "@/components/cards";
import { useExperience } from "@/hooks/useContent";
import { companyPeriod, normalizeExperience } from "@/lib/experience";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf";

const ExperiencePage = () => {
  const { data = [], isLoading } = useExperience();
  const companies = useMemo(() => normalizeExperience(data), [data]);
  const roles = companies.reduce((n, c) => n + c.roles.length, 0);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/experience"].title}
        description={PAGE_SEO["/experience"].description}
        url={`${BASE_URL}/experience`}
      />
      <PageHeader
        label="Work experience"
        title="Where I’ve"
        soft="worked"
        aside={
          companies.length > 0 && (
            <div className="flex gap-14">
              <Stat value={companies.length} label="Companies" />
              <Stat value={roles} label="Roles" />
            </div>
          )
        }
      />

      <section className="wrap pb-32">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : companies.length === 0 ? (
          <Empty>Experience will appear here soon.</Empty>
        ) : (
          <div className="border-b border-line-2">
            {companies.map((c) => (
              <Reveal key={c.key}>
                <article className="grid gap-6 border-t border-line-3 py-12 md:grid-cols-[220px_1fr] md:py-14">
                  <div className="flex items-center gap-4 md:flex-col md:items-start">
                    <Mark src={c.logo} label={c.name} className="size-14 rounded-[14px]" />
                    <span className="font-mono text-meta text-fg-3">{companyPeriod(c)}</span>
                  </div>
                  <div className="flex flex-col gap-8">
                    <div>
                      <h2 className="text-h2 font-medium">
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-accent"
                          >
                            {c.name}
                          </a>
                        ) : (
                          c.name
                        )}
                      </h2>
                      {c.meta && <p className="mt-2 font-mono text-meta text-fg-3">{c.meta}</p>}
                    </div>
                    <ol className="flex flex-col gap-8">
                      {c.roles.map((r) => (
                        <li
                          key={r.title + r.period}
                          className="flex flex-col gap-3 border-l border-line-2 pl-6"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                            <h3 className="text-h4 font-medium">{r.title}</h3>
                            <span className="font-mono text-meta text-fg-3">{r.period}</span>
                          </div>
                          {r.description && <p className="whitespace-pre-line text-fg-2">{r.description}</p>}
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
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
        <div className="mt-12">
          <Button href={myResume} download="Saad_Mazhar_Resume.pdf" size="lg" icon={false}>
            Download full résumé
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default ExperiencePage;
