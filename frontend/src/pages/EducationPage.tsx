import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Empty, PageHeader, Reveal, SectionHeader, Skeleton, Tag } from "@/components/ui";
import { Mark, Row } from "@/components/cards";
import { useCourses, useEducation } from "@/hooks/useContent";
import { partsToLabel, range, year } from "@/lib/format";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

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
          education.map((e, i) => {
            const school = e.school_name ?? e.institution ?? "";
            const tags = e.skills ?? [];
            return (
              <Reveal key={e.id}>
                <article
                  className={`grid gap-8 rounded-[24px] border bg-surface p-6 md:grid-cols-[260px_1fr] md:gap-12 md:p-10 ${i === 0 ? "border-accent/60" : "border-line"}`}
                >
                  <div className="flex items-center gap-4 md:flex-col md:items-start">
                    <Mark src={e.school_logo ?? e.logo} label={school} className="size-16 rounded-2xl" />
                    <span className="font-mono text-meta text-fg-3">
                      {range(
                        partsToLabel(e.start_month, e.start_year) || year(e.startDate),
                        partsToLabel(e.end_month, e.end_year) || (e.endDate && year(e.endDate)),
                        e.is_current ?? e.isCurrent,
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h2 className="text-h2 font-medium">
                      {[e.degree, e.field_of_study ?? e.fieldOfStudy].filter(Boolean).join(" in ")}
                    </h2>
                    <p className="text-body-l text-fg-2">{school}</p>
                    {e.show_grade_publicly && e.grade && (
                      <p className="font-mono text-meta text-fg-3">Grade · {e.grade}</p>
                    )}
                    {e.description && <p className="whitespace-pre-line text-fg-2">{e.description}</p>}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {tags.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })
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
