import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Hammer,
  Medal,
  Mic,
  Rocket,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, CountUp, Eyebrow, PageHero, Reveal, RisingWords, SectionHeader } from "@/components/ui";
import { Mark } from "@/components/cards";
import { Gallery } from "@/components/Gallery";
import { SocialLinks } from "@/components/brand/SocialLinks";
import {
  useAboutSettings,
  useAwards,
  useCertificates,
  useEducation,
  useEvents,
  useExperience,
  useHackathons,
  useLanguages,
  useOrganizations,
  useVolunteer,
} from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { normalizeExperience } from "@/lib/experience";
import { range, year } from "@/lib/format";
import { schoolNameOf, schoolSlugOf } from "@/lib/schools";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { cn } from "@/lib/utils";
import type { Education } from "@/types";
import portrait from "@/assets/profile-photo.webp";

const sortKey = (date?: string | number) => {
  const t = typeof date === "number" ? new Date(date, 0, 1).getTime() : Date.parse(date ?? "");
  return Number.isNaN(t) ? 0 : t;
};

/** A phrase that gets a white marker swept behind it once in view. */
function Mark_({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap px-1">
      <span aria-hidden className="highlight-swipe absolute inset-0 -z-0 rounded-md bg-white/90" />
      <span className="relative">{children}</span>
    </span>
  );
}

const INTO = [
  { icon: Hammer, title: "Building things", body: "Products, applications and the systems behind them." },
  { icon: Bot, title: "AI & technology", body: "Exploring what's possible, then making it actually useful." },
  { icon: Rocket, title: "Entrepreneurship", body: "Building businesses and learning a lot along the way." },
  { icon: Users, title: "Community", body: "Events, leadership, debating and bringing people together." },
];

/** Awards grouped by theme; first match wins, anything else lands in "More". */
const AWARD_GROUPS = [
  {
    key: "debate",
    label: "Debating & public speaking",
    icon: Mic,
    test: /debat|speak|speech|oratory|elocution/i,
  },
  {
    key: "lead",
    label: "Leadership & recognition",
    icon: Medal,
    test: /governor|shield|appreciation|leader|recogni|interact|rotary|award/i,
  },
  {
    key: "sport",
    label: "Sports",
    icon: Trophy,
    test: /rugby|cricket|football|athlet|sport|swim|tournament/i,
  },
];

/** School-leaving exams are taken in one year; show that year, not years at the school. */
const isSchoolExam = (e: Education) =>
  /advanced level|ordinary level|\bA\/?L\b|\bO\/?L\b/i.test(`${e.degree ?? ""} ${e.field_of_study ?? ""}`);

function eduPeriod(e: Education) {
  const start = e.start_year ? String(e.start_year) : "";
  const end = e.end_year ? String(e.end_year) : "";
  if (isSchoolExam(e)) return end || start;
  if (start && end && start === end) return start;
  if (e.is_current) return `${start} – ${end || "now"}`;
  return [start, end].filter(Boolean).join(" – ");
}

const eduTitle = (e: Education) =>
  [e.degree, e.field_of_study ?? e.fieldOfStudy].filter(Boolean).join(", ").trim() || schoolNameOf(e);

const AboutPage = () => {
  const { data: education = [] } = useEducation();
  const { data: awards = [] } = useAwards();
  const { data: languages = [] } = useLanguages();
  const { data: volunteer = [] } = useVolunteer();
  const { data: organizations = [] } = useOrganizations();
  const { data: hackathons = [] } = useHackathons();
  const { data: experience = [] } = useExperience();
  const { data: projects = [] } = useProjects();
  const { data: events = [] } = useEvents();
  const { data: certs = [] } = useCertificates();
  const { data: settings } = useAboutSettings();

  const companies = useMemo(() => normalizeExperience(experience), [experience]);

  const firstYear = Math.min(
    new Date().getFullYear(),
    ...companies.flatMap((c) => c.roles.map((r) => (r.start ? new Date(r.start).getFullYear() : Infinity))),
  );
  const stats = [
    { value: new Date().getFullYear() - firstYear, label: "Years building", suffix: "+" },
    { value: projects.length, label: "Products shipped" },
    { value: events.length, label: "Stages & events" },
    { value: certs.length, label: "Certifications" },
  ].filter((s) => s.value > 0);

  const schools = [...education].sort(
    (a, b) =>
      (b.is_current ? 1 : 0) - (a.is_current ? 1 : 0) ||
      Number(b.end_year ?? 0) - Number(a.end_year ?? 0) ||
      Number(b.start_year ?? 0) - Number(a.start_year ?? 0),
  );

  const recognition = useMemo(() => {
    const byDate = [...awards].sort((a, b) => sortKey(b.date) - sortKey(a.date));
    const groups = AWARD_GROUPS.map((g) => ({ ...g, items: [] as typeof awards })).concat({
      key: "more",
      label: "More",
      icon: Medal,
      test: /$^/,
      items: [],
    });
    for (const a of byDate) {
      const text = `${a.title} ${a.issuer ?? ""}`;
      (
        groups.find((g) => g.items !== undefined && g.test.test(text)) ?? groups[groups.length - 1]
      ).items.push(a);
    }
    const list = groups
      .filter((g) => g.items.length)
      .map((g) => ({
        key: g.key,
        label: g.label,
        icon: g.icon,
        items: g.items.map((a) => ({
          key: a.id,
          title: a.title,
          sub: a.issuer,
          when: year(a.date),
          href: a.link,
        })),
      }));
    if (hackathons.length)
      list.push({
        key: "hack",
        label: "Hackathons & competitions",
        icon: Sparkles,
        items: [...hackathons]
          .sort((a, b) => sortKey(b.date) - sortKey(a.date))
          .map((h) => ({
            key: h.id,
            title: h.name,
            sub: [h.role, h.achievement].filter(Boolean).join(" · "),
            when: year(h.date),
            href: h.link,
          })),
      });
    return list;
  }, [awards, hackathons]);

  const community = [
    ...volunteer.map((v) => ({
      key: `v-${v.id}`,
      title: v.role,
      sub: v.organization,
      sort: sortKey(v.startDate),
      when: range(year(v.startDate), v.endDate && year(v.endDate), v.isCurrent),
      image: v.image,
      href: v.link,
    })),
    ...organizations.map((o) => ({
      key: `o-${o.id}`,
      title: o.position || o.name,
      sub: o.position ? o.name : undefined,
      sort: sortKey(o.startDate),
      when: range(year(o.startDate), o.endDate && year(o.endDate), o.isCurrent),
      image: o.image,
      href: o.link,
    })),
  ].sort((a, b) => b.sort - a.sort);

  // Real photos from stages and events, newest first.
  const moments = events
    .map((e) => ({ src: e.image || e.images?.[0], title: e.title }))
    .filter((m): m is { src: string; title: string } => !!m.src)
    .slice(0, 8);

  const now = [
    { label: "Building", text: settings?.now?.building, icon: Hammer },
    { label: "Learning", text: settings?.now?.learning, icon: Sparkles },
    { label: "Reading", text: settings?.now?.reading, icon: BookOpen },
  ].filter((n) => n.text);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/about"].title}
        description={PAGE_SEO["/about"].description}
        url={`${BASE_URL}/about`}
      />

      {/* 1 · Hello */}
      <PageHero ambient band={<span className="truncate">Saad Mazhar · About</span>}>
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-16">
          <div className="flex flex-col gap-6">
            <div className="animate-rise">
              <Eyebrow>About</Eyebrow>
            </div>
            <h1 className="text-display-xl font-medium">
              <RisingWords text="Hey, I’m" /> <RisingWords text="Saad!" from={2} className="text-accent" />
            </h1>
            <p className="max-w-[600px] animate-rise text-h3 font-light leading-snug [animation-delay:300ms]">
              I have a habit of turning <span className="text-accent">“wouldn’t it be cool if…”</span> into
              actual projects.
            </p>
            <div className="flex max-w-[600px] animate-rise flex-col gap-4 text-body-l text-fg-2 [animation-delay:400ms]">
              <p>
                Sometimes it’s a startup, sometimes it’s a random app idea, sometimes it’s 2 AM and I’m
                wondering if I can build something that probably doesn’t need to exist (yet).
              </p>
              <p>
                I’m a developer, entrepreneur and Computer Science undergraduate from Colombo, Sri Lanka. I
                enjoy building products, exploring AI, figuring out how businesses work and bringing
                interesting ideas to life.
              </p>
              <p className="font-medium text-fg">A little bit of everything, and a lot of curiosity.</p>
            </div>
            <div className="flex animate-rise flex-wrap items-center gap-4 [animation-delay:500ms]">
              <Button to="/contact" size="lg">
                Say hello
              </Button>
              <SocialLinks />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[300px] animate-rise [animation-delay:300ms] md:max-w-[400px]">
            <div
              aria-hidden
              className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgb(255_95_0/0.4),transparent_70%)] blur-3xl"
            />
            <div className="relative aspect-[4/5] animate-float overflow-hidden rounded-[28px] border border-line-2 bg-surface bg-[radial-gradient(ellipse_at_50%_30%,rgb(255_95_0/0.2),transparent_70%)] [animation-duration:7s]">
              <img
                src={portrait}
                alt="Saad Mazhar"
                className="absolute bottom-0 left-1/2 w-[135%] max-w-none -translate-x-1/2 mix-blend-lighten"
              />
            </div>
          </div>
        </div>
      </PageHero>

      {/* 2 · What I'm into */}
      <section className="section screen theme-light border-t-0" aria-labelledby="into">
        <div className="wrap">
          <Reveal>
            <SectionHeader id="into" label="What I’m into" title="The things I" soft="keep coming back to" />
          </Reveal>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {INTO.map((t, i) => (
              <li key={t.title}>
                <Reveal delay={i * 90} className="h-full">
                  <div className="group flex h-full flex-col gap-3 rounded-[22px] border border-line-2 bg-surface/60 p-4 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent sm:gap-4 md:p-6">
                    <span className="flex size-11 items-center justify-center rounded-[14px] bg-accent/[0.12] text-accent transition-colors group-hover:bg-accent group-hover:text-fg-inverse">
                      <t.icon aria-hidden className="size-5" />
                    </span>
                    <h3 className="text-[1.0625rem] font-medium leading-snug tracking-[-0.02em] sm:text-[1.25rem]">{t.title}</h3>
                    <p className="text-sm text-fg-2 sm:text-base">{t.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 · Story + highlights */}
      <section className="section screen theme-orange border-t-0" aria-labelledby="story">
        <div className="wrap">
          <Reveal>
            <SectionHeader id="story" label="My story" title="How I" soft="got here" />
          </Reveal>
          <Reveal>
            <p className="max-w-[1000px] text-[clamp(1.6rem,3.4vw,3rem)] font-medium leading-[1.2] tracking-[-0.025em]">
              I’m a computer science undergraduate and the founder of <Mark_>TankSudda</Mark_> and{" "}
              <Mark_>Stopwash</Mark_>. I’ve been writing software for five years and{" "}
              <Mark_>selling it for three</Mark_>.
            </p>
          </Reveal>
          <Reveal className="mt-8 grid max-w-[1000px] grid-cols-1 gap-6 text-body-l text-fg-2 md:mt-10 md:grid-cols-2">
            <p>
              Outside the code I host and speak at tech events across Sri Lanka, from small meetups to packed
              summits.
            </p>
            <p>
              Both jobs are the same skill: making something complicated feel simple.{" "}
              <Link to="/experience" className="tap font-medium text-fg underline underline-offset-4">
                See my experience
              </Link>
            </p>
          </Reveal>
          {stats.length > 0 && (
            <Reveal className="mt-12 md:mt-16">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[rgb(17_17_19/0.2)] pt-8 md:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse gap-2">
                    <dt className="label text-fg-2">{s.label}</dt>
                    <dd className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-none tracking-[-0.04em]">
                      <CountUp value={s.value} />
                      {s.suffix}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </section>

      {/* 4 · Education & learning (+ languages) */}
      {schools.length > 0 && (
        <section className="section screen border-t-0" aria-labelledby="education-heading">
          <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
            <div>
              <Reveal>
                <SectionHeader
                  id="education-heading"
                  label="Education & learning"
                  title="Where I"
                  soft="learned"
                  action={
                    <Button to="/education" variant="secondary">
                      More detail
                    </Button>
                  }
                />
              </Reveal>
              <ol className="relative border-l border-line-2 pl-6 md:pl-8">
                {schools.map((e, i) => (
                  <li key={e.id} className="relative pb-7 last:pb-0">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[31px] top-1.5 size-3 rounded-full border-2 md:-left-[39px]",
                        e.is_current ? "border-accent bg-accent" : "border-line-3 bg-base",
                      )}
                    />
                    <Reveal delay={i * 80}>
                      <Link
                        to={`/education/${schoolSlugOf(e)}`}
                        className="group grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6"
                      >
                        <span className="min-w-0">
                          <span className="block text-[1.125rem] font-medium leading-snug transition-colors group-hover:text-accent md:text-[1.25rem]">
                            {eduTitle(e)}
                          </span>
                          <span className="mt-1 flex items-center gap-2 text-fg-2">
                            {e.school_logo && (
                              <Mark src={e.school_logo} label={schoolNameOf(e)} className="size-5" />
                            )}
                            {schoolNameOf(e)}
                          </span>
                        </span>
                        <span className="font-mono text-meta text-fg-3 sm:text-right">
                          {eduPeriod(e)}
                          {e.is_current && <span className="ml-2 text-accent">· Current</span>}
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>

            {languages.length > 0 && (
              <Reveal className="flex flex-col gap-4 self-start rounded-[22px] border border-line-2 bg-surface/50 p-6 lg:sticky lg:top-32">
                <span className="label text-fg-3" id="languages">
                  Languages
                </span>
                <ul className="flex flex-col divide-y divide-line-2">
                  {languages.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="font-medium">{l.name}</span>
                      <span className="text-right text-sm text-fg-2">{l.level}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* 5 · Recognition */}
      {recognition.length > 0 && (
        <section className="section screen theme-light border-t-0" aria-labelledby="recognition">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="recognition" label="Recognition" title="A few things" soft="I’m proud of" />
            </Reveal>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recognition.map((g, gi) => (
                <Reveal
                  key={g.key}
                  delay={gi * 90}
                  className="flex flex-col gap-4 rounded-[22px] border border-line-2 bg-surface/60 p-5 md:p-6"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent/[0.12] text-accent">
                      <g.icon aria-hidden className="size-5" />
                    </span>
                    <h3 className="text-[1.125rem] font-medium">{g.label}</h3>
                  </span>
                  <ul className="flex flex-col divide-y divide-line-2">
                    {g.items.map((a) => {
                      const inner = (
                        <>
                          <span className="min-w-0">
                            <span className="block font-medium leading-snug">{a.title}</span>
                            {a.sub && <span className="mt-0.5 block text-sm text-fg-2">{a.sub}</span>}
                          </span>
                          <span className="shrink-0 font-mono text-meta text-fg-3">{a.when}</span>
                        </>
                      );
                      const cls = "flex items-baseline justify-between gap-4 py-3";
                      return (
                        <li key={a.key} className="first:[&>*]:pt-0 last:[&>*]:pb-0">
                          {a.href ? (
                            <a
                              href={a.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(cls, "hover:text-accent")}
                            >
                              {inner}
                            </a>
                          ) : (
                            <div className={cls}>{inner}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6 · Leadership & community */}
      {community.length > 0 && (
        <section className="section screen border-t-0" aria-labelledby="community">
          <div className="wrap">
            <Reveal>
              <SectionHeader
                id="community"
                label="Leadership & community"
                title="Leading"
                soft="& giving back"
                action={
                  events.length > 0 ? (
                    <Button to="/events" variant="secondary">
                      Events & hosting
                    </Button>
                  ) : undefined
                }
              />
            </Reveal>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {community.map((b, i) => {
                const inner = (
                  <>
                    <Mark src={b.image} label={b.sub || b.title} className="size-12 rounded-[14px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-snug">{b.title}</span>
                      {b.sub && <span className="mt-0.5 block text-sm text-fg-2">{b.sub}</span>}
                      <span className="mt-1.5 block font-mono text-meta text-fg-3">{b.when}</span>
                    </span>
                    {b.href && (
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 text-fg-3 group-hover:text-accent"
                      />
                    )}
                  </>
                );
                const cls =
                  "group flex h-full items-start gap-4 rounded-[20px] border border-line-2 bg-surface/50 p-5 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-accent/60";
                return (
                  <li key={b.key}>
                    <Reveal delay={Math.min(i, 8) * 60} className="h-full">
                      {b.href ? (
                        <a href={b.href} target="_blank" rel="noopener noreferrer" className={cls}>
                          {inner}
                        </a>
                      ) : (
                        <div className={cls}>{inner}</div>
                      )}
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* 7 · Moments */}
      {moments.length >= 3 && (
        <Gallery
          className="theme-light border-t-0"
          images={moments.map((m) => m.src)}
          alts={moments.map((m) => `Photo from ${m.title}`)}
          captions={moments.map((m) => m.title)}
          title="Saad Mazhar"
          label="Moments"
          heading={
            <>
              Off the screen, <span className="soft">on the stage</span>
            </>
          }
        />
      )}

      {/* 8 · Currently + call to action */}
      <section className="section screen border-t-0" aria-labelledby="now">
        <div className="wrap">
          <Reveal>
            <Eyebrow>Currently</Eyebrow>
            <p
              id="now"
              className="mt-6 max-w-[980px] text-[clamp(1.6rem,3.6vw,3rem)] font-medium leading-[1.2] tracking-[-0.025em]"
            >
              Building products, exploring AI, working on startups and trying to turn a few more ideas into{" "}
              <span className="text-accent">reality.</span>
            </p>
          </Reveal>
          {now.length > 0 && (
            <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
              {now.map((n, i) => (
                <li key={n.label}>
                  <Reveal
                    delay={i * 100}
                    className="flex h-full flex-col gap-3 rounded-[22px] border border-line bg-surface/50 p-5"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-live" />
                      </span>
                      <span className="label text-fg-3">{n.label}</span>
                      <n.icon aria-hidden className="ml-auto size-4 text-fg-3" />
                    </span>
                    <p className="font-medium leading-snug">{n.text}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
          <Reveal className="mt-12 flex flex-col items-start gap-6 rounded-[28px] bg-gradient-to-br from-accent to-[#ff8a3d] p-7 text-[rgb(17_17_19)] md:mt-16 md:flex-row md:items-center md:justify-between md:p-12">
            <h2 className="text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Got an idea? <span className="font-light opacity-75">Let’s build it.</span>
            </h2>
            <Link
              to="/contact"
              className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full bg-[rgb(17_17_19)] px-6 text-[15px] font-medium text-[#fff] transition-transform hover:-translate-y-0.5"
            >
              Get in touch <ArrowUpRight aria-hidden className="size-[18px]" />
            </Link>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
