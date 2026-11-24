import type { ReactNode } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Eyebrow, PageHero, Reveal } from "@/components/ui";
import { Row } from "@/components/cards";
import {
  useAwards,
  useEducation,
  useHackathons,
  useLanguages,
  useOrganizations,
  useVolunteer,
} from "@/hooks/useContent";
import { partsToLabel, range, year } from "@/lib/format";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import portrait from "@/assets/profile-photo.webp";

function Split({
  id,
  index,
  label,
  title,
  soft,
  children,
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  soft: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section">
      <Reveal className="wrap grid gap-12 md:grid-cols-[400px_1fr] md:gap-0">
        <div className="flex flex-col gap-6">
          <Eyebrow index={index}>{label}</Eyebrow>
          <h2 className="text-h1 font-medium">
            {title} <span className="soft">{soft}</span>
          </h2>
        </div>
        <div className="border-b border-line-2">{children}</div>
      </Reveal>
    </section>
  );
}

/** Date strings here are "YYYY", "YYYY-MM" or ISO, so they sort as text. */
function newestFirst<T>(items: T[], date: (item: T) => string | undefined) {
  return [...items].sort((a, b) => (date(b) ?? "").localeCompare(date(a) ?? ""));
}

const AboutPage = () => {
  const { data: education = [] } = useEducation();
  const { data: awards = [] } = useAwards();
  const { data: languages = [] } = useLanguages();
  const { data: volunteer = [] } = useVolunteer();
  const { data: organizations = [] } = useOrganizations();
  const { data: hackathons = [] } = useHackathons();

  let n = 0;
  const idx = () => String(++n).padStart(2, "0");

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/about"].title}
        description={PAGE_SEO["/about"].description}
        url={`${BASE_URL}/about`}
      />
      <PageHero className="mb-8" band="Saad Mazhar · About">
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,420px)_1fr] md:gap-24">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] md:h-[min(62svh,525px)] md:w-auto md:justify-self-start border border-line bg-surface bg-[radial-gradient(ellipse_at_50%_30%,rgb(255_95_0/0.16),transparent_70%)]">
            <img
              src={portrait}
              alt="Saad Mazhar"
              className="absolute bottom-0 left-1/2 w-[135%] max-w-none -translate-x-1/2 mix-blend-lighten"
            />
          </div>
          <div className="flex flex-col gap-9">
            <Eyebrow>About</Eyebrow>
            <h1 className="text-display-m font-medium">
              Founder by trade, <span className="soft">engineer by habit,</span> host by accident.
            </h1>
            <p className="text-body-l text-fg-2">
              I’m Saad Mazhar, a computer science undergraduate and the founder of TankSudda and Stopwash.
              I’ve been writing software for five years and selling it for three.
            </p>
            <p className="text-body-l text-fg-2">
              Outside the code I host and speak at tech events across Sri Lanka, from small meetups to packed
              summits. Both jobs are the same skill: making something complicated feel simple.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button to="/contact" size="lg">
                Get in touch
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {education.length > 0 && (
        <Split id="education" index={idx()} label="Education" title="Where I" soft="learned">
          {education.map((e) => (
            <Row
              key={e.id}
              to="/education"
              title={[e.degree, e.field_of_study ?? e.fieldOfStudy].filter(Boolean).join(" ")}
              sub={e.school_name ?? e.institution}
              trail={range(
                partsToLabel(undefined, e.start_year),
                partsToLabel(undefined, e.end_year),
                e.is_current,
              )}
            />
          ))}
        </Split>
      )}

      {awards.length > 0 && (
        <Split id="awards" index={idx()} label="Awards" title="Recognition" soft="& honours">
          {newestFirst(awards, (a) => a.date).map((a) => (
            <Row key={a.id} href={a.link} title={a.title} sub={a.issuer} trail={year(a.date)} />
          ))}
        </Split>
      )}

      {languages.length > 0 && (
        <Split
          id="languages"
          index={idx()}
          label="Languages"
          title="Fluent in"
          soft={languages.length === 3 ? "three" : String(languages.length)}
        >
          {languages.map((l) => (
            <Row key={l.id} to="/languages" title={l.name} trail={l.level} />
          ))}
        </Split>
      )}

      {volunteer.length > 0 && (
        <Split id="volunteer" index={idx()} label="Volunteer" title="Giving" soft="back">
          {newestFirst(volunteer, (v) => v.startDate).map((v) => (
            <Row
              key={v.id}
              href={v.link}
              title={v.role}
              sub={v.organization}
              trail={range(year(v.startDate), v.endDate && year(v.endDate), v.isCurrent)}
            />
          ))}
        </Split>
      )}

      {(organizations.length > 0 || hackathons.length > 0) && (
        <Split
          id="extracurricular"
          index={idx()}
          label="Extra-curricular"
          title="Clubs, sport"
          soft="& the rest"
        >
          {organizations.map((o) => (
            <Row
              key={o.id}
              href={o.link}
              title={o.position || o.name}
              sub={o.position ? o.name : undefined}
              trail={range(year(o.startDate), o.endDate && year(o.endDate), o.isCurrent)}
            />
          ))}
          {hackathons.map((h) => (
            <Row
              key={h.id}
              href={h.link}
              title={h.name}
              sub={[h.role, h.achievement].filter(Boolean).join(" · ")}
              trail={year(h.date)}
            />
          ))}
        </Split>
      )}
    </Layout>
  );
};

export default AboutPage;
