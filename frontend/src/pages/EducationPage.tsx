import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Empty, PageHeader, Reveal, SectionHeader, Skeleton, Tag } from "@/components/ui";
import { Mark, Row } from "@/components/cards";
import { useCourses, useEducation } from "@/hooks/useContent";
import { partsToLabel, range, year } from "@/lib/format";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { cn } from "@/lib/utils";
import type { Education } from "@/types";

/** School crests are mostly drawn for white paper, so they sit on a light tile. */
function LogoTile({ src, label }: { src?: string; label: string }) {
  if (!src) return <Mark label={label} className="size-16 rounded-2xl text-[15px] md:size-20" />;
  return (
    <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#F4F4F1] p-2 shadow-[0_8px_24px_-8px_rgb(0_0_0/0.6)] ring-1 ring-white/10 md:size-20 md:p-2.5">
      <img src={src} alt="" className="size-full object-contain" loading="lazy" />
    </span>
  );
}

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full border border-line-2 px-3.5 font-mono text-meta text-fg-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

function EducationCard({ edu: e, highlight }: { edu: Education; highlight: boolean }) {
  const school = e.school_name ?? e.institution ?? "";
  const program = [e.degree, e.field_of_study ?? e.fieldOfStudy].filter(Boolean).join(" in ");
  const current = e.is_current ?? e.isCurrent;
  const start = partsToLabel(e.start_month, e.start_year) || year(e.startDate);
  const end = partsToLabel(e.end_month, e.end_year) || (e.endDate ? year(e.endDate) : "");
  const period = start ? range(start, end, current) : end;
  const honors = e.honors_and_awards ?? [];
  const skills = e.skills ?? [];
  const hasBody = Boolean(e.description || e.activities_and_societies || honors.length || skills.length);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-media border bg-surface/60 p-6 md:p-10",
        highlight ? "border-accent/35" : "border-line",
      )}
    >
      {highlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_100%_0%,rgb(255_106_61/0.10),transparent_60%)]"
        />
      )}

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="flex min-w-0 items-center gap-5 md:gap-7">
          <LogoTile src={e.school_logo ?? e.logo} label={school} />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="text-h3 font-medium md:text-h2">{program || school}</h2>
            {program && <p className="text-fg-2">{school}</p>}
          </div>
        </div>

        {(period || current || (e.show_grade_publicly && e.grade) || e.school_website_url) && (
          <div className="flex flex-wrap gap-2 md:max-w-[360px] md:justify-end">
            {current && (
              <Pill className="border-live/30 text-fg">
                <span className="size-1.5 rounded-full bg-live shadow-[0_0_8px_rgb(74_222_128/0.6)]" />
                Studying
              </Pill>
            )}
            {period && <Pill>{period}</Pill>}
            {e.show_grade_publicly && e.grade && <Pill>Grade · {e.grade}</Pill>}
            {e.school_website_url && (
              <a
                href={e.school_website_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${school} website (opens in a new tab)`}
                className="group"
              >
                <Pill className="transition-colors group-hover:border-line-3 group-hover:text-fg">
                  Website
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </Pill>
              </a>
            )}
          </div>
        )}
      </div>

      {hasBody && (
        <div className="relative mt-8 grid gap-8 border-t border-line pt-8 md:mt-10 md:grid-cols-[minmax(0,1fr)_280px] md:gap-12 md:pt-10">
          <div className="flex flex-col gap-6">
            {e.description && <p className="whitespace-pre-line text-body-l text-fg-2">{e.description}</p>}
            {e.activities_and_societies && (
              <div className="flex flex-col gap-2.5">
                <span className="label text-fg-3">Activities & societies</span>
                <p className="whitespace-pre-line text-fg-2">{e.activities_and_societies}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-8">
            {honors.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="label text-fg-3">Honours</span>
                <ul className="flex flex-col gap-3">
                  {honors.map((h) => (
                    <li key={h.award_title} className="flex gap-3">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="flex flex-col">
                        <span className="text-fg">{h.award_title}</span>
                        {(h.award_issuer || h.award_date_year) && (
                          <span className="font-mono text-meta text-fg-3">
                            {[h.award_issuer, h.award_date_year].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {skills.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="label text-fg-3">Skills</span>
                <div className="flex flex-wrap gap-2">
                  {skills.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

const EducationPage = () => {
  const { data = [], isLoading } = useEducation();
  const { data: courses = [] } = useCourses();
  const education = data
    .filter((e) => e.is_published !== false)
    .sort(
      (a, b) =>
        (a.display_order ?? 99) - (b.display_order ?? 99) || (b.start_year ?? 0) - (a.start_year ?? 0),
    );

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/education"].title}
        description={PAGE_SEO["/education"].description}
        url={`${BASE_URL}/education`}
      />
      <PageHeader label="Education" title="Where I" soft="learned" />

      <section className="wrap flex flex-col gap-6 pb-32">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : education.length === 0 ? (
          <Empty>Education details will appear here soon.</Empty>
        ) : (
          education.map((e, i) => (
            <Reveal key={e.id}>
              <EducationCard edu={e} highlight={i === 0} />
            </Reveal>
          ))
        )}
      </section>

      {courses.length > 0 && (
        <section className="section">
          <div className="wrap">
            <SectionHeader
              label="Courses"
              title="Learning"
              soft="outside class"
              action={
                <Button to="/certifications" variant="ghost">
                  All certificates
                </Button>
              }
            />
            <div className="border-b border-line-2">
              {courses.map((c) => (
                <Row
                  key={c.id}
                  href={c.link}
                  mark={<Mark label={c.school} />}
                  title={c.name}
                  sub={c.school}
                  trail={c.completedDate && year(c.completedDate)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default EducationPage;
