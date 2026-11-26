import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Award as AwardIcon } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Eyebrow, PageHero, Reveal, SectionHeader, Skeleton } from "@/components/ui";
import { ProjectCard } from "@/components/cards";
import { useAwards, useEducation, useEvents, useVolunteer } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { isSchoolPageIndexable, rolesOf, schoolContent, schoolNameOf, schoolSlugOf } from "@/lib/schools";
import { eventPath } from "@/lib/paths";
import { monthYear, partsToLabel, range } from "@/lib/format";
import { resizedUrl } from "@/lib/images";
import { BASE_URL, PERSON_REF, fitDescription } from "@/lib/seo-content";
import NotFound from "./NotFound";

/** /education/:slug - one school: years, roles, honours, and everything linked to it elsewhere. */
const SchoolPage = () => {
  const { slug = "" } = useParams();
  const { data: education = [], isLoading } = useEducation();
  const { data: awards = [] } = useAwards();
  const { data: volunteer = [] } = useVolunteer();
  const { data: events = [] } = useEvents();
  const { data: projects = [] } = useProjects();

  const edu = education.find((e) => e.is_published !== false && schoolSlugOf(e) === slug);
  const content = useMemo(
    () => (edu ? schoolContent(edu, { awards, volunteer, events, projects }) : null),
    [edu, awards, volunteer, events, projects],
  );

  if (isLoading)
    return (
      <Layout>
        <div className="wrap py-24">
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  if (!edu || !content) return <NotFound />;

  const name = schoolNameOf(edu);
  const fullName = edu.school_name || name;
  const program = [edu.degree, edu.field_of_study].filter(Boolean).join(" in ");
  const start = partsToLabel(edu.start_month, edu.start_year);
  const end = partsToLabel(edu.end_month, edu.end_year);
  const current = edu.is_current ?? edu.isCurrent;
  const period = start ? range(start, end, current) : end;
  const roles = rolesOf(edu);
  const paragraphs = String(edu.description ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const url = `${BASE_URL}/education/${slug}`;
  const logo = edu.school_logo || edu.logo;
  const summary = `Saad Mazhar at ${fullName}${period ? ` (${period})` : ""}${program ? `: ${program}` : ""}. ${paragraphs[0] ?? ""}`;

  return (
    <Layout>
      <SEO
        title={`${name}: Saad Mazhar`}
        description={fitDescription(summary, `Roles, honours, events and projects connected to ${name}.`)}
        url={url}
        noIndex={isSchoolPageIndexable(edu, content) ? false : "follow"}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url,
          about: {
            "@type": "EducationalOrganization",
            name: fullName,
            ...(edu.school_website_url
              ? { url: edu.school_website_url, sameAs: [edu.school_website_url] }
              : {}),
            ...(logo ? { logo } : {}),
            alumni: PERSON_REF,
          },
          mainEntity: PERSON_REF,
        }}
        breadcrumbs={[
          { name: "Education", url: `${BASE_URL}/education` },
          { name, url },
        ]}
      />

      <PageHero
        ambient
        className="mb-0"
        band={<span className="truncate">Saad Mazhar · Education · {name}</span>}
      >
        <nav aria-label="Breadcrumb" className="animate-rise font-mono text-meta text-fg-3">
          <Link to="/education" className="inline-flex items-center gap-1.5 hover:text-fg">
            <ArrowLeft aria-hidden className="size-3.5" />
            All education
          </Link>
        </nav>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-center">
          {logo && (
            <img
              src={resizedUrl(logo, 480)}
              alt=""
              className="size-20 shrink-0 animate-rise rounded-2xl border border-line-2 bg-white object-contain p-2 md:size-28"
            />
          )}
          <div className="flex max-w-[820px] flex-col gap-4">
            <h1 className="text-display-l font-medium">{fullName}</h1>
            <p className="animate-rise text-body-l text-fg-2 [animation-delay:300ms]">
              {[program, period].filter(Boolean).join(" · ")}
            </p>
            {edu.school_website_url && (
              <a
                href={edu.school_website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-sm text-fg-2 hover:text-fg"
              >
                {edu.school_website_url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            )}
          </div>
        </div>
      </PageHero>

      {(paragraphs.length > 0 || roles.length > 0) && (
        <section className="section border-t-0" aria-labelledby="story">
          <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            {paragraphs.length > 0 && (
              <Reveal>
                <SectionHeader id="story" label="Overview" title="My time" soft="there" />
                <div className="flex max-w-[680px] flex-col gap-4 text-body-l text-fg-2">
                  {paragraphs.map((p) => (
                    <p key={p} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}
            {roles.length > 0 && (
              <Reveal>
                <Eyebrow>Roles & societies</Eyebrow>
                <ul className="mt-6 flex flex-col divide-y divide-line-2 border-y border-line-2">
                  {roles.map((r) => (
                    <li key={r} className="py-3 text-fg">
                      {r}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {(content.honours.length > 0 || content.awards.length > 0) && (
        <section className="section" aria-labelledby="honours">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="honours" label="Honours" title="Recognition" soft="along the way" />
            </Reveal>
            <ul className="grid gap-4 md:grid-cols-2">
              {content.honours.map((h) => (
                <li
                  key={h.award_title}
                  className="flex gap-4 rounded-card border border-line bg-surface/40 p-5"
                >
                  <AwardIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-fg">{h.award_title}</span>
                    <span className="text-sm text-fg-3">
                      {[h.award_issuer, h.award_date_year].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                </li>
              ))}
              {content.awards
                .filter((a) => !content.honours.some((h) => h.award_title === a.title))
                .map((a) => (
                  <li key={a.id} className="flex gap-4 rounded-card border border-line bg-surface/40 p-5">
                    <AwardIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-fg">{a.title}</span>
                      <span className="text-sm text-fg-3">
                        {[a.issuer, monthYear(a.date)].filter(Boolean).join(" · ")}
                      </span>
                      {a.description && <span className="text-sm text-fg-2">{a.description}</span>}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}

      {content.events.length > 0 && (
        <section className="section" aria-labelledby="events">
          <div className="wrap">
            <Reveal>
              <SectionHeader
                id="events"
                label={`Events · ${content.events.length}`}
                title="On stage"
                soft="for the school"
              />
            </Reveal>
            <ul className="flex flex-col divide-y divide-line-2 border-y border-line-2">
              {content.events.map((e) => (
                <li key={e.id}>
                  <Link
                    to={eventPath(e)}
                    className="group flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:justify-between md:gap-8"
                  >
                    <span className="font-medium text-fg transition-colors group-hover:text-accent">
                      {e.title}
                    </span>
                    <span className="shrink-0 font-mono text-meta text-fg-3">
                      {[e.role, monthYear(e.date)].filter(Boolean).join(" · ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {content.volunteer.length > 0 && (
        <section className="section" aria-labelledby="service">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="service" label="Service" title="Clubs &" soft="volunteering" />
            </Reveal>
            <ul className="grid gap-4 md:grid-cols-2">
              {content.volunteer.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-col gap-1 rounded-card border border-line bg-surface/40 p-5"
                >
                  <span className="font-medium text-fg">{v.role}</span>
                  <span className="text-sm text-fg-3">{v.organization}</span>
                  {v.description && <p className="mt-2 text-sm text-fg-2">{v.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {content.projects.length > 0 && (
        <section className="section" aria-labelledby="built">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="built" label="Projects" title="Built for the" soft="school community" />
            </Reveal>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.projects.map((p) => (
                <li key={p.id}>
                  <Reveal className="h-full">
                    <ProjectCard project={p} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default SchoolPage;
