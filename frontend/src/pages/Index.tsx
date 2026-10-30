import { useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Eyebrow, Reveal, SectionHeader, Skeleton } from "@/components/ui";
import { EventCard, ProjectCard, Row } from "@/components/cards";
import { SkillsShowcase } from "@/components/SkillsShowcase";
import { CertificationsShowcase } from "@/components/CertificationsShowcase";
import { useFeaturedProjects, useProjects } from "@/hooks/useProjects";
import { useBlogPosts } from "@/hooks/useBlog";
import { useCertificates, useEvents, useExperience, useSkills, useTestimonials } from "@/hooks/useContent";
import { normalizeExperience, companyPeriod } from "@/lib/experience";
import { monthYear, readingTime } from "@/lib/format";
import { CONTACT } from "@/lib/site";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { PAGE_SEO, PERSON_SCHEMA, BASE_URL } from "@/lib/seo-content";
import portrait from "@/assets/profile-photo.webp";

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
    { value: "5+", label: "Years building", short: "Years" },
    { value: projects ? `${projects}` : "20+", label: "Products shipped", short: "Shipped" },
    { value: events ? `${events}` : "40+", label: "Stages & events", short: "Stages" },
    { value: certificates ? `${certificates}` : "99", label: "Certifications", short: "Certs" },
  ];
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative -mt-[72px] flex h-[100svh] flex-col overflow-hidden lg:-mt-[88px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_78%_35%,rgb(255_106_61/0.16),transparent_70%)]"
      />

      {/* Everything above the stats band; the portrait and copy share it so nothing spills below the fold. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="wrap relative flex min-h-0 flex-1 flex-col justify-end pb-[clamp(16px,4svh,56px)] pt-[72px] lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-x-12 lg:pb-0 lg:pt-[88px]">
          <img
            src={portrait}
            alt=""
            aria-hidden
            fetchPriority="high"
            className="pointer-events-none absolute right-[-24%] top-[48px] aspect-square h-[min(46%,96vw)] w-auto max-w-none opacity-75 mix-blend-lighten [mask-image:linear-gradient(to_bottom,black_35%,transparent_80%)] sm:right-[-8%] sm:h-[min(70%,80vw)] sm:opacity-90 sm:[mask-image:linear-gradient(to_bottom,black_50%,transparent_92%)] lg:static lg:col-start-2 lg:row-start-1 lg:h-full lg:min-h-0 lg:w-full lg:max-w-full lg:self-end lg:origin-bottom lg:scale-[1.32] lg:object-contain lg:object-bottom lg:[mask-image:linear-gradient(to_bottom,black_62%,transparent_98%)]"
          />
          <div className="relative lg:col-start-1 lg:row-start-1 lg:self-center lg:pb-[clamp(16px,3svh,40px)]">
            <span className="mb-[clamp(12px,2.6svh,24px)] inline-flex w-fit items-center gap-2.5 rounded-full border border-line-2 bg-surface px-3 py-2 font-mono text-meta text-fg-2 [@media(max-height:719px)]:hidden">
              <span className="size-2 rounded-full bg-live shadow-[0_0_8px_rgb(74_222_128/0.6)]" />
              Currently building TankSudda & Stopwash
            </span>
            <h1 id="hero-heading" className="text-hero font-medium lg:text-hero-lg">
              Building
              <br />
              products that
              <br />
              solve <span className="font-light text-accent">real</span>
              <br />
              problems.
            </h1>
            <p className="mt-[clamp(12px,3svh,32px)] max-w-[520px] text-[clamp(15px,2.2svh,19px)] leading-[1.55] text-fg-2 [@media(max-height:620px)]:hidden">
              Founder, full-stack engineer and tech speaker from Colombo. I turn rough ideas into products
              people pay for, then go on stage and explain how.
            </p>
            <div className="mt-[clamp(14px,3.4svh,36px)] flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button to="/projects" size="lg" className="h-[clamp(44px,6svh,52px)] px-5 sm:px-6">
                <span className="sm:hidden">See my work</span>
                <span className="hidden sm:inline">See selected work</span>
              </Button>
              <SocialLinks size="sm" className="gap-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative shrink-0 border-t border-line bg-base/60 backdrop-blur-sm">
        <dl className="wrap grid grid-cols-4 gap-x-3 py-[clamp(12px,3svh,36px)] sm:gap-x-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col-reverse items-center gap-[clamp(4px,1svh,10px)] text-center"
            >
              <dt className="label text-fg-3">
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </dt>
              <dd className="text-[clamp(1.375rem,min(6.4vw,5.2svh),4rem)] font-medium leading-none tracking-[-0.035em]">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
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
  const groups = skills.filter((g) => g.skills?.length);
  if (groups.length === 0) return null;
  return (
    <section
      className="flex min-h-[100svh] flex-col justify-center overflow-hidden border-t border-line py-[clamp(48px,9svh,112px)]"
      aria-labelledby="capabilities-heading"
    >
      <div className="wrap">
        <Reveal className="mb-[clamp(20px,4svh,48px)] flex flex-col gap-[clamp(16px,3svh,28px)]">
          <Eyebrow index="05">Capabilities</Eyebrow>
          <h2 id="capabilities-heading" className="text-display-m font-medium">
            What I <span className="soft">bring</span> to a team
          </h2>
        </Reveal>
        <SkillsShowcase groups={groups} />
      </div>
    </section>
  );
}

function Certifications() {
  const { data: certs = [] } = useCertificates();
  if (certs.length === 0) return null;
  return (
    <section
      className="flex min-h-[100svh] flex-col justify-center border-t border-line py-[clamp(48px,9svh,112px)]"
      aria-labelledby="certifications-heading"
    >
      <div className="wrap">
        <Reveal className="mb-[clamp(20px,4svh,48px)] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-[clamp(16px,3svh,28px)]">
            <Eyebrow index="06">Credentials</Eyebrow>
            <h2 id="certifications-heading" className="text-display-m font-medium">
              {certs.length} <span className="soft">certifications</span>
            </h2>
          </div>
          <Button to="/certifications" variant="secondary" className="self-start md:self-auto">
            View all credentials
          </Button>
        </Reveal>
        <CertificationsShowcase certs={certs} />
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
            index="07"
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
        <Eyebrow index="08">Contact</Eyebrow>
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
        <SocialLinks className="mt-12" />
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
      <Certifications />
      <Writing />
      <ContactCTA />
    </Layout>
  );
};

export default Index;
