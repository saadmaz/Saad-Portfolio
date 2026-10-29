import { useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Eyebrow, Reveal, SectionHeader, Skeleton, Stat } from "@/components/ui";
import { EventCard, ProjectCard, Row } from "@/components/cards";
import { useFeaturedProjects, useProjects } from "@/hooks/useProjects";
import { useBlogPosts } from "@/hooks/useBlog";
import { useCertificates, useEvents, useExperience, useSkills, useTestimonials } from "@/hooks/useContent";
import { normalizeExperience, companyPeriod } from "@/lib/experience";
import { monthYear, readingTime } from "@/lib/format";
import { CONTACT, SOCIALS } from "@/lib/site";
import { PAGE_SEO, PERSON_SCHEMA, BASE_URL } from "@/lib/seo-content";
import portrait from "@/assets/profile-photo.webp";
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf";

function Hero({
  projects,
  events,
  certificates,
}: {
  projects?: number;
  events?: number;
  certificates?: number;
}) {
  const stats = [
    { value: "5+", label: "Years building" },
    { value: projects ? `${projects}` : "20+", label: "Products shipped" },
    { value: events ? `${events}` : "40+", label: "Stages & events" },
    { value: certificates ? `${certificates}` : "99", label: "Certifications" },
  ];
  return (
    <section aria-labelledby="hero-heading" className="relative -mt-[72px] overflow-hidden lg:-mt-[88px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_78%_35%,rgb(255_106_61/0.16),transparent_70%)]"
      />
      <img
        src={portrait}
        alt=""
        aria-hidden
        fetchPriority="high"
        className="pointer-events-none absolute right-[-10%] top-10 w-[118%] max-w-none opacity-90 mix-blend-lighten [mask-image:linear-gradient(to_bottom,black_55%,transparent)] sm:right-[-4%] sm:w-[80%] lg:right-[-2%] lg:top-[90px] lg:w-[60%] lg:max-w-[860px]"
      />
      <div className="wrap relative flex min-h-[860px] flex-col justify-end pb-14 pt-[340px] sm:pt-[420px] lg:min-h-[1000px] lg:justify-center lg:pb-0 lg:pt-[120px]">
        <span className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-line-2 bg-surface px-3 py-2 font-mono text-meta text-fg-2">
          <span className="size-2 rounded-full bg-live shadow-[0_0_8px_rgb(74_222_128/0.6)]" />
          Currently building TankSudda & Stopwash
        </span>
        <h1 id="hero-heading" className="text-display-xl font-medium">
          Building
          <br />
          products that
          <br />
          solve <span className="font-light text-accent">real</span>
          <br />
          problems.
        </h1>
        <p className="mt-8 max-w-[520px] text-body-l text-fg-2">
          Founder, full-stack engineer and tech speaker from Colombo. I turn rough ideas into products people
          pay for, then go on stage and explain how.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button to="/projects" size="lg">
            See selected work
          </Button>
          <Button
            href={myResume}
            download="Saad_Mazhar_Resume.pdf"
            variant="secondary"
            size="lg"
            icon={false}
          >
            Download résumé
          </Button>
        </div>
      </div>
      <div className="relative border-t border-line">
        <div className="wrap grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
          {stats.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Statement() {
  return (
    <section className="section">
      <Reveal className="wrap">
        <Eyebrow index="01">About</Eyebrow>
        <p className="mt-12 text-h1 font-medium text-fg-3">
          <span className="text-fg">I’m Saad, a founder who still writes the code.</span> Five years, two
          startups and twenty-odd products in,{" "}
          <span className="font-light text-fg">I care about one thing:</span> shipping work that feels
          considered, fast and honest.
        </p>
        <div className="mt-12">
          <Button to="/about" variant="secondary">
            More about me
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

function SelectedWork() {
  const { data: featured = [], isLoading } = useFeaturedProjects();
  const { data: testimonials = [] } = useTestimonials();
  const projects = [...featured].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999)).slice(0, 3);
  const quote = testimonials[0];
  if (!isLoading && projects.length === 0) return null;
  return (
    <section className="section" aria-labelledby="work-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader
            index="02"
            label="Selected work"
            title="Things I’ve"
            soft="built"
            action={
              <Button to="/projects" variant="ghost">
                All projects
              </Button>
            }
          />
        </Reveal>
        {isLoading ? (
          <Skeleton className="aspect-[16/9] w-full rounded-media" />
        ) : (
          <div className="flex flex-col gap-20">
            {projects[0] && (
              <Reveal>
                <ProjectCard project={projects[0]} index={0} feature />
              </Reveal>
            )}
            {projects.length > 1 && (
              <div className="grid gap-16 md:grid-cols-2 md:gap-6">
                {projects.slice(1).map((p, i) => (
                  <Reveal key={p.id}>
                    <ProjectCard project={p} index={i + 1} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}
        {quote && (
          <Reveal className="ml-auto mt-24 max-w-[900px]">
            <blockquote className="text-h2 font-light leading-snug">“{quote.content}”</blockquote>
            <p className="mt-7 text-sm">
              {quote.name}
              <span className="ml-3 font-mono text-meta text-fg-3">
                {[quote.position, quote.company].filter(Boolean).join(", ")}
              </span>
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function ExperienceList() {
  const { data = [], isLoading } = useExperience();
  const companies = useMemo(() => normalizeExperience(data).slice(0, 4), [data]);
  if (!isLoading && companies.length === 0) return null;
  return (
    <section className="section" aria-labelledby="experience-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader
            index="03"
            label="Experience"
            title="Where I’ve"
            soft="worked"
            action={
              <Button to="/experience" variant="ghost">
                Full timeline
              </Button>
            }
          />
        </Reveal>
        <div className="border-b border-line-2">
          {companies.map((c) => (
            <Row
              key={c.key}
              to="/experience"
              lead={companyPeriod(c)}
              title={c.roles[0]?.title}
              sub={c.name}
              trail={c.meta.split(" · ").pop()}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Speaking() {
  const { data = [] } = useEvents();
  const events = [...data].reverse().slice(0, 3);
  if (events.length === 0) return null;
  return (
    <section className="section" aria-labelledby="speaking-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader
            index="04"
            label="Speaking & hosting"
            title="On stage,"
            soft="behind the mic"
            action={
              <Button to="/events" variant="ghost">
                All events
              </Button>
            }
          />
        </Reveal>
        <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {events.map((e) => (
            <EventCard key={e.id} event={e} className="w-[78%] shrink-0 snap-start md:w-auto" />
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const { data: skills = [] } = useSkills();
  const { data: certs = [] } = useCertificates();
  const groups = skills.slice(0, 4);
  if (groups.length === 0) return null;
  return (
    <section className="section" aria-labelledby="capabilities-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader index="05" label="Capabilities" title="What I" soft="bring" />
        </Reveal>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-6">
          {groups.map((g) => (
            <div key={g.category} className="flex flex-col gap-4 border-t border-line-3 pt-6">
              <h3 className="text-h4 font-medium md:text-h3">{g.category}</h3>
              <ul className="flex flex-col gap-3 text-sm text-fg-2 md:text-[1rem]">
                {g.skills.slice(0, 4).map((s) => (
                  <li key={s.name}>{s.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {certs.length > 0 && (
          <div className="mt-16 flex flex-col gap-5 rounded-media border border-line bg-surface p-6 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <p className="text-h3 font-medium">
                {certs.length} <span className="soft">certifications</span> across AI, security & cloud
              </p>
              <p className="mt-1.5 font-mono text-meta text-fg-3">
                {[...new Set(certs.map((c) => c.issuer).filter(Boolean))].slice(0, 5).join(" · ")}
              </p>
            </div>
            <Button to="/certifications" variant="secondary">
              View credentials
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function Writing() {
  const { data = [] } = useBlogPosts();
  const posts = data.slice(0, 3);
  if (posts.length === 0) return null;
  return (
    <section className="section" aria-labelledby="writing-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader
            index="06"
            label="Writing"
            title="Notes from"
            soft="the build"
            action={
              <Button to="/blog" variant="ghost">
                All writing
              </Button>
            }
          />
        </Reveal>
        <div className="border-b border-line-2">
          {posts.map((p) => (
            <Row
              key={p.id}
              to={`/blog/${p.slug || p.id}`}
              lead={monthYear(p.date)}
              title={p.title}
              trail={[p.category, readingTime(p.content)].filter(Boolean).join(" · ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCTA() {
  return (
    <section className="section relative overflow-hidden py-32 md:py-48">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_105%,rgb(255_106_61/0.18),transparent_70%)]"
      />
      <Reveal className="wrap relative">
        <Eyebrow index="07">Contact</Eyebrow>
        <h2 className="mt-12 text-display-xl font-medium">
          Let’s build
          <br />
          <span className="soft">something good.</span>
        </h2>
        <div className="mt-14 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <a href={`mailto:${CONTACT.email}`} className="break-all text-h2 font-medium hover:text-accent">
            {CONTACT.email}
          </a>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={CONTACT.bookingUrl} variant="secondary" size="lg" icon={false}>
              Book a call
            </Button>
            <Button to="/contact" size="lg">
              Start a project
            </Button>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap gap-8 font-mono text-meta text-fg-2">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fg"
            >
              {s.label} ↗
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

const Index = () => {
  const { data: projects } = useProjects();
  const { data: events } = useEvents();
  const { data: certs } = useCertificates();
  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/"].title}
        description={PAGE_SEO["/"].description}
        url={BASE_URL}
        structuredData={PERSON_SCHEMA}
      />
      <Hero projects={projects?.length} events={events?.length} certificates={certs?.length} />
      <Statement />
      <SelectedWork />
      <ExperienceList />
      <Speaking />
      <Capabilities />
      <Writing />
      <ContactCTA />
    </Layout>
  );
};

export default Index;
