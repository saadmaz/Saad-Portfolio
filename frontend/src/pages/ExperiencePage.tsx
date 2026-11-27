import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import {
  CountUp,
  Empty,
  Eyebrow,
  PageHero,
  Reveal,
  RisingWords,
  SectionHeader,
  Skeleton,
} from "@/components/ui";
import { Mark } from "@/components/cards";
import { ExperienceJourney } from "@/components/ExperienceJourney";
import { useExperience } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { companyPeriod, normalizeExperience } from "@/lib/experience";
import { experienceFaq, venturesFrom, type VentureCompanyInput } from "@/lib/ventures";
import { PAGE_SEO, BASE_URL, PERSON_REF } from "@/lib/seo-content";

const INTRO =
  "The companies I founded and the systems I built to run them, plus the roles I’ve held along the way.";

const ExperiencePage = () => {
  const { data = [], isLoading } = useExperience();
  const { data: projects = [] } = useProjects();
  const companies = useMemo(() => normalizeExperience(data), [data]);
  const inputs: VentureCompanyInput[] = useMemo(
    () =>
      companies.map((c) => ({
        name: c.name,
        role: c.roles[0]?.title ?? "",
        period: companyPeriod(c),
        summary: c.description || c.roles[0]?.description || "",
        url: c.url,
        logo: c.logo,
        path: `/experience/${c.slug}`,
        ids: c.ids,
        current: c.roles.some((r) => r.isCurrent),
      })),
    [companies],
  );
  const ventures = useMemo(() => venturesFrom(inputs, projects), [inputs, projects]);
  const faq = useMemo(() => experienceFaq(ventures, inputs), [ventures, inputs]);

  const roles = companies.reduce((n, c) => n + c.roles.length, 0);
  const systems = new Set(ventures.flatMap((v) => v.projects.map((p) => p.slug))).size;
  const stats = [
    { value: ventures.length, label: "Ventures founded" },
    { value: companies.length, label: "Companies" },
    { value: roles, label: "Roles" },
    { value: systems, label: "Systems built for them" },
  ].filter((s) => s.value > 0);

  const url = `${BASE_URL}/experience`;
  const abs = (path: string) => `${BASE_URL}${path}`;

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/experience"].title}
        description={PAGE_SEO["/experience"].description}
        url={url}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Saad Mazhar's work experience",
            url,
            itemListElement: inputs.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "OrganizationRole",
                roleName: c.role || undefined,
                member: PERSON_REF,
                memberOf: { "@type": "Organization", name: c.name, ...(c.url ? { url: c.url } : {}) },
                url: abs(c.path),
              },
            })),
          },
          ...ventures.map((v) => ({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: v.name,
            ...(v.url ? { url: v.url, sameAs: [v.url] } : {}),
            founder: PERSON_REF,
            subjectOf: { "@type": "WebPage", url: abs(v.path) },
          })),
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

      <PageHero ambient className="mb-0" band={<span className="truncate">Saad Mazhar · Experience</span>}>
        <div className="max-w-[820px]">
          <div className="animate-rise">
            <Eyebrow>Work experience</Eyebrow>
          </div>
          <h1 className="mt-8 text-display-xl font-medium md:mt-10">
            <RisingWords text="Where I’ve" /> <RisingWords text="built" from={2} className="soft" />
          </h1>
          <p className="mt-8 max-w-[580px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
            {INTRO}
          </p>
          {stats.length > 0 && (
            <dl className="mt-12 grid max-w-[680px] animate-rise grid-cols-2 gap-6 [animation-delay:450ms] sm:grid-cols-4">
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
      </PageHero>

      {isLoading ? (
        <div className="wrap py-16">
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      ) : companies.length === 0 ? (
        <section className="section border-t-0">
          <div className="wrap">
            <Empty>Experience will appear here soon.</Empty>
          </div>
        </section>
      ) : (
        <>
          {ventures.length > 0 && (
            <section className="section border-t-0" aria-labelledby="ventures">
              <div className="wrap">
                <Reveal>
                  <SectionHeader
                    id="ventures"
                    label={`Ventures · ${ventures.length}`}
                    title="Companies I"
                    soft="founded"
                  />
                </Reveal>
                <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {ventures.map((v) => (
                    <li key={v.name}>
                      <Reveal className="h-full">
                        <article className="flex h-full flex-col gap-5 rounded-[22px] border border-line bg-surface/50 p-6 md:p-8">
                          <div className="flex items-center gap-3.5">
                            <Mark src={v.logo} label={v.name} className="size-11 rounded-[12px]" />
                            <div className="flex min-w-0 flex-col">
                              <h3 className="truncate text-h3 font-medium">{v.name}</h3>
                              <span className="font-mono text-meta text-fg-3">
                                {[v.role, v.period].filter(Boolean).join(" · ")}
                              </span>
                            </div>
                          </div>
                          {v.summary && <p className="text-fg-2">{v.summary}</p>}
                          {v.projects.length > 0 && (
                            <div className="flex flex-col gap-2">
                              <span className="label text-fg-3">Built</span>
                              <ul className="flex flex-wrap gap-2">
                                {v.projects.slice(0, 5).map((p) => (
                                  <li key={p.slug}>
                                    <Link
                                      to={`/projects/${p.slug}`}
                                      className="inline-flex h-8 items-center rounded-full border border-line-2 px-3 text-sm text-fg-2 transition-colors hover:border-accent hover:text-fg"
                                    >
                                      {p.title}
                                    </Link>
                                  </li>
                                ))}
                                {v.projects.length > 5 && (
                                  <li className="inline-flex h-8 items-center px-1 text-sm text-fg-3">
                                    +{v.projects.length - 5} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                          <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2 text-sm">
                            <Link
                              to={v.path}
                              className="inline-flex items-center gap-1.5 font-medium text-fg hover:text-accent"
                            >
                              {v.path.startsWith("/projects/") ? "Case study" : "Company page"}
                              <ArrowUpRight aria-hidden className="size-4" />
                            </Link>
                            {v.url && (
                              <a
                                href={v.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-fg-2 hover:text-fg"
                              >
                                {v.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                                <ArrowUpRight aria-hidden className="size-4" />
                              </a>
                            )}
                          </div>
                        </article>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section className="section" aria-labelledby="journey">
            <div className="wrap">
              <Reveal>
                <SectionHeader id="journey" label="Journey" title="The road" soft="so far" />
              </Reveal>
              <ExperienceJourney companies={companies} />
            </div>
          </section>

          {faq.length > 0 && (
            <section aria-labelledby="experience-faq" className="wrap border-t border-line-2 py-16 lg:py-24">
              <Eyebrow>FAQ</Eyebrow>
              <h2 id="experience-faq" className="mt-6 text-h2 font-medium">
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
        </>
      )}
    </Layout>
  );
};

export default ExperiencePage;
