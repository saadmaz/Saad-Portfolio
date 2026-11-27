import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Globe } from "lucide-react";
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
  Tag,
} from "@/components/ui";
import { Mark, Row } from "@/components/cards";
import { useCourses, useEducation, useSkills } from "@/hooks/useContent";
import { useScrollFill } from "@/hooks/useScrollFill";
import { educationSkills, studyYears } from "@/lib/education";
import { schoolNameOf, schoolSlugOf } from "@/lib/schools";
import { partsToLabel, range, year } from "@/lib/format";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { cn } from "@/lib/utils";
import type { Education } from "@/types";
import { resizedUrl } from "@/lib/images";

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
  const size = "size-[72px] rounded-[18px] md:size-28 md:rounded-[26px]";
  if (!src) return <Mark label={label} className={cn(size, "text-base md:text-xl")} />;
  return (
    <span
      className={cn(
        size,
        "flex shrink-0 items-center justify-center bg-[#F4F4F1] p-2 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.7)] ring-1 ring-white/10 md:p-3",
      )}
    >
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

function Entry({ edu: e }: { edu: Education }) {
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
  const projects = e.projects ?? [];
  const media = (e.media ?? []).filter((m) => m.media_url);

  return (
    <article
      className={cn(
        "relative grid gap-7 overflow-hidden rounded-media border bg-surface/50 p-5 sm:p-7 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10 md:p-10",
        current ? "border-accent/30" : "border-line",
      )}
    >
      {current && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_100%_0%,rgb(255_95_0/0.08),transparent_70%)]"
        />
      )}

      {/* Website: a real button pinned to the card's top-right corner (icon-only on phones). */}
      {e.school_website_url && (
        <a
          href={e.school_website_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${school} website (opens in a new tab)`}
          className="group absolute right-5 top-5 z-10 inline-flex size-10 items-center justify-center gap-2 rounded-full border border-line-3 bg-base/40 text-sm font-medium text-fg backdrop-blur transition-colors hover:border-fg/40 hover:bg-surface-2 sm:right-7 sm:top-7 md:right-10 md:top-10 md:h-10 md:w-auto md:px-4"
        >
          <Globe aria-hidden className="size-4 md:size-3.5" />
          <span className="hidden md:inline">Website</span>
          <ArrowUpRight
            aria-hidden
            className="hidden size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block"
          />
        </a>
      )}

      {/* Rail: crest with period and status (beside it on phones, beneath it on desktop). */}
      <div className="relative flex items-center gap-4 pr-12 md:flex-col md:items-start md:gap-5 md:pr-0">
        <LogoTile src={e.school_logo ?? e.logo} label={school} />
        <div className="flex flex-col gap-2">
          {period && <span className="font-mono text-meta text-fg-2">{period}</span>}
          {current && (
            <span className="flex items-center gap-2 font-mono text-meta text-live">
              <span className="size-1.5 rounded-full bg-live shadow-[0_0_8px_rgb(74_222_128/0.6)]" />
              Studying now
            </span>
          )}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col gap-8">
        <header className="flex flex-col gap-3 md:pr-36">
          <h2 className="text-h3 font-medium leading-tight md:text-[1.875rem]">{program || school}</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-fg-2">
            {program && <span>{school}</span>}
            {schoolSlugOf(e) && (
              <Link
                to={`/education/${schoolSlugOf(e)}`}
                className="tap inline-flex items-center gap-1 text-sm text-fg-2 underline-offset-4 hover:text-accent hover:underline"
              >
                More on {schoolNameOf(e)} <ArrowUpRight aria-hidden className="size-3.5" />
              </Link>
            )}
            {e.show_grade_publicly && e.grade && (
              <span className="rounded-full border border-accent/30 bg-accent/[0.08] px-2.5 py-1 font-mono text-meta text-accent">
                {e.grade}
              </span>
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

        {projects.length > 0 && (
          <Block label="Projects">
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((pr) => {
                const inner = (
                  <>
                    {pr.project_thumbnail && (
                      <img
                        src={resizedUrl(pr.project_thumbnail, 960)}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/9] w-full rounded-[12px] object-cover"
                      />
                    )}
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-medium group-hover:text-accent">{pr.project_title}</span>
                      {pr.project_url && (
                        <ArrowUpRight
                          aria-hidden
                          className="mt-1 size-4 shrink-0 text-fg-3 group-hover:text-accent"
                        />
                      )}
                    </span>
                    {pr.project_description && (
                      <span className="line-clamp-3 text-sm text-fg-2">{pr.project_description}</span>
                    )}
                  </>
                );
                const cls =
                  "group flex flex-col gap-3 rounded-card border border-line bg-surface/60 p-4 transition-colors";
                return pr.project_url ? (
                  <a
                    key={pr.project_title}
                    href={pr.project_url}
                    target="_blank"
                    rel="noopener"
                    className={cn(cls, "hover:border-accent/50")}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={pr.project_title} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </Block>
        )}

        {media.length > 0 && (
          <Block label="Media">
            <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
              {media.map((m) => {
                const thumb = m.thumbnail_url || (m.media_type === "Image" ? m.media_url : "");
                return (
                  <a
                    key={m.media_url}
                    href={m.media_url}
                    target="_blank"
                    rel="noopener"
                    className="group flex w-56 shrink-0 snap-start flex-col gap-2"
                  >
                    <span className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-card border border-line bg-surface-2">
                      {thumb ? (
                        <img
                          src={resizedUrl(thumb, 960)}
                          alt={m.media_caption}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <FileText aria-hidden className="size-8 text-fg-3" />
                      )}
                    </span>
                    <span className="line-clamp-2 text-sm text-fg-2 group-hover:text-fg">
                      {m.media_caption}
                    </span>
                  </a>
                );
              })}
            </div>
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
  const { data: skillSets = [] } = useSkills();
  const [rail, fill] = useScrollFill<HTMLOListElement>();
  const education = useMemo(
    () =>
      data
        .filter((e) => e.is_published !== false)
        .sort(
          (a, b) =>
            (a.display_order ?? 99) - (b.display_order ?? 99) || (b.start_year ?? 0) - (a.start_year ?? 0),
        ),
    [data],
  );
  const learned = useMemo(() => educationSkills(education, skillSets), [education, skillSets]);
  const stats = [
    { label: "Schools", value: education.length },
    { label: "Years studying", value: studyYears(education) },
    { label: "Honours", value: education.reduce((n, e) => n + (e.honors_and_awards?.length ?? 0), 0) },
    { label: "Courses", value: courses.length },
  ].filter((s) => s.value > 0);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/education"].title}
        description={PAGE_SEO["/education"].description}
        url={`${BASE_URL}/education`}
      />

      <PageHero ambient className="mb-0" band={<span className="truncate">Saad Mazhar · Education</span>}>
        <div className="relative max-w-[760px]">
          <div className="animate-rise">
            <Eyebrow>Education</Eyebrow>
          </div>
          <h1 className="mt-8 text-display-xl font-medium md:mt-10">
            <RisingWords text="Classrooms" /> <RisingWords text="behind the work" from={1} className="soft" />
          </h1>
          <p className="mt-8 max-w-[580px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
            Thirteen years at Isipathana, an IT diploma on the side, and a Computer Science degree in
            progress. The places that taught me how to think, build and lead.
          </p>
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
      </PageHero>

      <section className="section border-t-0" aria-labelledby="path">
        <div className="wrap">
          <Reveal>
            <SectionHeader id="path" label="Study path" title="Where I" soft="learned" />
          </Reveal>
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-media" />
          ) : education.length === 0 ? (
            <Empty>Education details will appear here soon.</Empty>
          ) : (
            <ol ref={rail} className="relative flex flex-col gap-6 md:gap-10 md:pl-14">
              <span
                aria-hidden
                className="absolute bottom-6 left-[23px] top-6 hidden w-0.5 rounded-full bg-line-2 md:block"
              />
              <span
                aria-hidden
                className="absolute left-[23px] top-6 hidden w-0.5 origin-top rounded-full bg-gradient-to-b from-accent via-accent to-accent/30 md:block"
                style={{ height: "calc(100% - 3rem)", transform: `scaleY(${fill})` }}
              />
              {education.map((e) => {
                const current = e.is_current ?? e.isCurrent;
                return (
                  <li key={e.id} className="relative">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[39px] top-10 hidden size-4 rounded-full border-2 bg-base md:block",
                        current ? "border-live shadow-[0_0_12px_rgb(74_222_128/0.6)]" : "border-accent",
                      )}
                    />
                    <Reveal>
                      <Entry edu={e} />
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {learned.length > 0 && (
        <section className="section theme-light border-t-0" aria-labelledby="learned">
          <div className="wrap">
            <Reveal>
              <SectionHeader
                id="learned"
                label="Picked up in class"
                title="Skills from"
                soft="school"
                action={
                  <Button to="/skills" variant="ghost">
                    Full stack
                  </Button>
                }
              />
            </Reveal>
            <ul className="flex flex-wrap gap-2">
              {learned.map((s) => (
                <li key={s.name}>
                  <Link
                    to="/skills"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-line-2 bg-base pl-1.5 pr-4 text-sm transition-colors hover:border-accent hover:text-accent"
                  >
                    {s.icon ? (
                      <span className="size-7 rounded-full bg-white p-1">
                        <img src={s.icon} alt="" loading="lazy" className="size-full object-contain" />
                      </span>
                    ) : (
                      <span className="ml-2 size-1.5 rounded-full bg-accent" aria-hidden />
                    )}
                    {s.name}
                    {s.count > 1 && <span className="font-mono text-meta text-fg-3">×{s.count}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

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
