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

/* ── Parsing the free-text CMS fields into structure ─────────────────────── */

// "G.C.E. Advanced Level (2022): Physics, Chemistry and General English."
const QUALIFICATION = /^(.+?)\s*\((\d{4})\):\s*(.+)$/;
// "President, Interact Club (2020–21)"
const ROLE = /^([^,]+),\s*(.+?)(?:\s*\(([^)]+)\))?$/;

interface Qualification {
  title: string;
  year: string;
  subjects: string[];
}

function parseDescription(text = "") {
  const paragraphs: string[] = [];
  const qualifications: Qualification[] = [];
  for (const block of text.split(/\n\s*\n/)) {
    const prose: string[] = [];
    for (const line of block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)) {
      const m = line.match(QUALIFICATION);
      if (m) {
        const subjects = m[3]
          .replace(/\.$/, "")
          .split(/,\s*(?:and\s+)?|\s+and\s+/)
          .map((s) => s.trim())
          .filter(Boolean);
        qualifications.push({ title: m[1], year: m[2], subjects });
      } else prose.push(line);
    }
    if (prose.length) paragraphs.push(prose.join(" "));
  }
  return { paragraphs, qualifications };
}

function parseRoles(text = "") {
  return text
    .split("\n")
    .map((l) => l.trim().replace(/^[.\-•·]\s*/, ""))
    .filter((l) => l.length > 1)
    .map((line) => {
      const m = line.match(ROLE);
      return m
        ? { role: m[1].trim(), org: m[2].trim(), years: m[3] }
        : { role: "", org: line, years: undefined };
    });
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

/** School crests are mostly drawn for white paper, so they sit on a light tile. */
function LogoTile({ src, label }: { src?: string; label: string }) {
  if (!src) return <Mark label={label} className="size-14 rounded-2xl text-[13px]" />;
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4F4F1] p-1.5 shadow-[0_8px_24px_-8px_rgb(0_0_0/0.6)] ring-1 ring-white/10">
      <img src={src} alt="" className="size-full object-contain" loading="lazy" />
    </span>
  );
}

function Block({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <span className="label text-fg-3">{label}</span>
      {children}
    </div>
  );
}

function Entry({ edu: e, last }: { edu: Education; last: boolean }) {
  const school = e.school_name ?? e.institution ?? "";
  const program = [e.degree, e.field_of_study ?? e.fieldOfStudy].filter(Boolean).join(" in ");
  const current = e.is_current ?? e.isCurrent;
  const start = partsToLabel(e.start_month, e.start_year) || year(e.startDate);
  const end = partsToLabel(e.end_month, e.end_year) || (e.endDate ? year(e.endDate) : "");
  const period = start ? range(start, end, current) : end;
  const { paragraphs, qualifications } = parseDescription(e.description);
  const roles = parseRoles(e.activities_and_societies);
  const honors = e.honors_and_awards ?? [];
  const skills = e.skills ?? [];

  return (
    <article className="relative grid gap-6 py-12 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10 md:py-16">
      {/* Rail: logo node with period and status beside it; the line runs from this node to the next. */}
      <div className="relative flex items-start gap-4">
        {!last && (
          <span
            aria-hidden
            className="absolute -bottom-16 left-7 top-[68px] hidden w-px bg-gradient-to-b from-line-3 to-line md:block"
          />
        )}
        <LogoTile src={e.school_logo ?? e.logo} label={school} />
        <div className="flex flex-col gap-2 pt-2">
          {period && <span className="font-mono text-meta text-fg-2">{period}</span>}
          {current && (
            <span className="flex items-center gap-2 font-mono text-meta text-live">
              <span className="size-1.5 rounded-full bg-live shadow-[0_0_8px_rgb(74_222_128/0.6)]" />
              Studying now
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h2 className="text-h3 font-medium leading-tight md:text-[1.875rem]">{program || school}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-fg-2">
            {program && <span>{school}</span>}
            {e.show_grade_publicly && e.grade && (
              <span className="rounded-full border border-accent/30 bg-accent/[0.08] px-2.5 py-1 font-mono text-meta text-accent">
                {e.grade}
              </span>
            )}
            {e.school_website_url && (
              <a
                href={e.school_website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-sm text-fg-3 transition-colors hover:text-fg"
              >
                Website
                <ArrowUpRight
                  aria-hidden
                  className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            )}
          </div>
        </header>

        {paragraphs.length > 0 && (
          <div className="flex max-w-[720px] flex-col gap-4 text-body-l text-fg-2">
            {paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}

        {qualifications.length > 0 && (
          <Block label="Qualifications">
            <div className="grid gap-3 lg:grid-cols-2">
              {qualifications.map((q) => (
                <div
                  key={q.title}
                  className="flex flex-col gap-4 rounded-card border border-line bg-surface/60 p-5"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{q.title}</span>
                    <span className="font-mono text-meta text-fg-3">{q.year}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {q.subjects.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-surface-2 px-2.5 py-1 text-[13px] leading-none text-fg-2"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Block>
        )}

        {roles.length > 0 && (
          <Block label="Leadership & societies">
            <ul className="grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
              {roles.map((r) => (
                <li
                  key={`${r.role}-${r.org}`}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-3"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-fg">{r.org}</span>
                    {r.role && <span className="text-sm text-fg-3">{r.role}</span>}
                  </span>
                  {r.years && <span className="shrink-0 font-mono text-meta text-fg-3">{r.years}</span>}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {(honors.length > 0 || skills.length > 0) && (
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
            {honors.length > 0 && (
              <Block label="Honours">
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
              </Block>
            )}
            {skills.length > 0 && (
              <Block label="Skills">
                <div className="flex flex-wrap gap-2">
                  {skills.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </Block>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

const EducationPage = () => {
  const { data = [], isLoading } = useEducation();
  const { data: courses = [] } = useCourses();
  const education = data
    .filter((e) => e.is_published !== false)
    .sort(
      (a, b) =>
        (a.display_order ?? 99) - (b.display_order ?? 99) || (b.start_year ?? 0) - (a.start_year ?? 0),
    );
  const firstYear = Math.min(...education.map((e) => e.start_year ?? Infinity));

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/education"].title}
        description={PAGE_SEO["/education"].description}
        url={`${BASE_URL}/education`}
      />
      <PageHeader
        label="Education"
        title="Where I"
        soft="learned"
        aside={
          education.length > 0 && (
            <dl className="flex gap-10 md:gap-14">
              <div className="flex flex-col-reverse gap-2">
                <dt className="label text-fg-3">Institutions</dt>
                <dd className="text-h2 font-medium">{education.length}</dd>
              </div>
              {Number.isFinite(firstYear) && (
                <div className="flex flex-col-reverse gap-2">
                  <dt className="label text-fg-3">Learning since</dt>
                  <dd className="text-h2 font-medium">{firstYear}</dd>
                </div>
              )}
            </dl>
          )
        }
      />

      <section className="wrap pb-24 md:pb-32">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : education.length === 0 ? (
          <Empty>Education details will appear here soon.</Empty>
        ) : (
          <div className="divide-y divide-line border-y border-line md:divide-y-0 md:border-y-0">
            {education.map((e, i) => (
              <Reveal key={e.id}>
                <Entry edu={e} last={i === education.length - 1} />
              </Reveal>
            ))}
          </div>
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
