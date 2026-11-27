import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Award as AwardIcon,
  BookOpen,
  Briefcase,
  GraduationCap,
  Hammer,
  Medal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, CountUp, Eyebrow, PageHero, Reveal, RisingWords, SectionHeader } from "@/components/ui";
import { EventCard, Mark } from "@/components/cards";
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
import { companyPeriod, normalizeExperience } from "@/lib/experience";
import { partsToLabel, range, year } from "@/lib/format";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { cn } from "@/lib/utils";
import { useScrollFill } from "@/hooks/useScrollFill";
import portrait from "@/assets/profile-photo.webp";

type Kind = "work" | "education" | "award" | "hackathon";

const KINDS: Record<Kind, { label: string; color: string; icon: typeof Briefcase }> = {
  work: { label: "Work", color: "#ff5f00", icon: Briefcase },
  education: { label: "Education", color: "#0ea5e9", icon: GraduationCap },
  award: { label: "Awards", color: "#f5a524", icon: Trophy },
  hackathon: { label: "Hackathons", color: "#8b5cf6", icon: Hammer },
};

interface Moment {
  key: string;
  kind: Kind;
  sort: number;
  when: string;
  title: string;
  sub?: string;
  logo?: string;
  to?: string;
  href?: string;
}

const sortKey = (date?: string | number) => {
  const t = typeof date === "number" ? new Date(date, 0, 1).getTime() : Date.parse(date ?? "");
  return Number.isNaN(t) ? 0 : t;
};

/** "Native", "Fluent", "Professional", "Conversational", "Basic" → 4..1 */
function languageLevel(level: string): number {
  const l = level.toLowerCase();
  if (/native|bilingual|fluent|mother/.test(l)) return 4;
  if (/professional|advanced|full/.test(l)) return 3;
  if (/conversational|intermediate|limited working/.test(l)) return 2;
  return 1;
}

/** A phrase that gets a white marker swept behind it once in view. */
function Mark_({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap px-1">
      <span aria-hidden className="highlight-swipe absolute inset-0 -z-0 rounded-md bg-white/90" />
      <span className="relative">{children}</span>
    </span>
  );
}

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

  const moments = useMemo<Moment[]>(() => {
    const list: Moment[] = [
      ...companies.map((c) => ({
        key: `w-${c.key}`,
        kind: "work" as const,
        sort: Math.max(0, ...c.roles.map((r) => r.start)),
        when: companyPeriod(c),
        title: c.roles[0]?.title || c.name,
        sub: c.name,
        logo: c.logo,
        to: `/experience/${c.slug}`,
      })),
      ...education.map((e) => ({
        key: `e-${e.id}`,
        kind: "education" as const,
        sort: sortKey(e.start_year),
        when: range(partsToLabel(undefined, e.start_year), partsToLabel(undefined, e.end_year), e.is_current),
        title:
          [e.degree, e.field_of_study ?? e.fieldOfStudy].filter(Boolean).join(" ") || (e.school_name ?? ""),
        sub: e.school_name ?? e.institution,
        logo: e.school_logo,
        to: "/education",
      })),
      ...awards.map((a) => ({
        key: `a-${a.id}`,
        kind: "award" as const,
        sort: sortKey(a.date),
        when: year(a.date),
        title: a.title,
        sub: a.issuer,
        href: a.link,
      })),
      ...hackathons.map((h) => ({
        key: `h-${h.id}`,
        kind: "hackathon" as const,
        sort: sortKey(h.date),
        when: year(h.date),
        title: h.name,
        sub: [h.role, h.achievement].filter(Boolean).join(" · "),
        logo: h.image,
        href: h.link,
      })),
    ];
    return list.sort((a, b) => b.sort - a.sort);
  }, [companies, education, awards, hackathons]);

  const [kinds, setKinds] = useState<Set<Kind>>(new Set(Object.keys(KINDS) as Kind[]));
  const toggle = (k: Kind) =>
    setKinds((cur) => {
      const next = new Set(cur);
      if (next.has(k) && next.size > 1) next.delete(k);
      else next.add(k);
      return next;
    });
  const shownMoments = moments.filter((m) => kinds.has(m.kind));
  const [rail, fill] = useScrollFill<HTMLOListElement>();

  const firstYear = Math.min(
    new Date().getFullYear(),
    ...companies.flatMap((c) => c.roles.map((r) => (r.start ? new Date(r.start).getFullYear() : Infinity))),
  );
  const stats = [
    { value: new Date().getFullYear() - firstYear, label: "Years building" },
    { value: projects.length, label: "Products shipped" },
    { value: events.length, label: "Stages & events" },
    { value: certs.length, label: "Certifications" },
  ].filter((s) => s.value > 0);

  const values = (settings?.values ?? []).filter((v) => v.title);
  const now = [
    { label: "Building", text: settings?.now?.building, icon: Hammer },
    { label: "Learning", text: settings?.now?.learning, icon: Sparkles },
    { label: "Reading", text: settings?.now?.reading, icon: BookOpen },
  ].filter((n) => n.text);
  const beyond = [
    ...volunteer.map((v) => ({
      key: `v-${v.id}`,
      tag: "Volunteer",
      title: v.role,
      sub: v.organization,
      when: range(year(v.startDate), v.endDate && year(v.endDate), v.isCurrent),
      image: v.image,
      href: v.link,
    })),
    ...organizations.map((o) => ({
      key: `o-${o.id}`,
      tag: "Club & sport",
      title: o.position || o.name,
      sub: o.position ? o.name : undefined,
      when: range(year(o.startDate), o.endDate && year(o.endDate), o.isCurrent),
      image: o.image,
      href: o.link,
    })),
  ];
  const sortedAwards = [...awards].sort((a, b) => sortKey(b.date) - sortKey(a.date));

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/about"].title}
        description={PAGE_SEO["/about"].description}
        url={`${BASE_URL}/about`}
      />

      {/* 1 · Hero */}
      <PageHero ambient band={<span className="truncate">Saad Mazhar · About</span>}>
        <div className="grid items-center gap-12 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:gap-16">
          <div className="flex flex-col gap-8">
            <div className="animate-rise">
              <Eyebrow>About</Eyebrow>
            </div>
            <h1 className="text-display-xl font-medium">
              <RisingWords text="Hi, I’m" /> <RisingWords text="Saad." from={2} className="text-accent" />
            </h1>
            <p className="max-w-[560px] animate-rise text-h3 font-light text-fg-2 [animation-delay:350ms]">
              Founder by trade, engineer by habit, host by accident.
            </p>
            <div className="flex animate-rise flex-wrap items-center gap-4 [animation-delay:450ms]">
              <Button to="/contact" size="lg">
                Get in touch
              </Button>
              <SocialLinks />
            </div>
            {stats.length > 0 && (
              <dl className="mt-2 grid max-w-[620px] animate-rise grid-cols-2 gap-6 [animation-delay:550ms] sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse gap-2 border-l border-line-2 pl-4">
                    <dt className="label text-fg-3">{s.label}</dt>
                    <dd className="text-display-m font-medium leading-none">
                      <CountUp value={s.value} />
                      {s.label === "Years building" && "+"}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="relative mx-auto w-full max-w-[420px] animate-rise [animation-delay:300ms]">
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

      {/* 2 · My story */}
      <section className="section screen theme-orange border-t-0" aria-labelledby="story">
        <div className="wrap">
          <Reveal>
            <SectionHeader id="story" label="My story" title="How I" soft="got here" />
          </Reveal>
          <Reveal>
            <p className="max-w-[1000px] text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-[1.2] tracking-[-0.025em]">
              I’m a computer science undergraduate and the founder of <Mark_>TankSudda</Mark_> and{" "}
              <Mark_>Stopwash</Mark_>. I’ve been writing software for five years and{" "}
              <Mark_>selling it for three</Mark_>.
            </p>
          </Reveal>
          <Reveal className="mt-10 grid max-w-[1000px] gap-6 text-body-l text-fg-2 grid-cols-1 md:grid-cols-2">
            <p>
              Outside the code I host and speak at tech events across Sri Lanka, from small meetups to packed
              summits.
            </p>
            <p>Both jobs are the same skill: making something complicated feel simple.</p>
          </Reveal>
        </div>
      </section>

      {/* 3 · Journey */}
      {moments.length > 0 && (
        <section className="section screen border-t-0" aria-labelledby="journey">
          <div className="wrap grid grid-cols-1 gap-12 md:grid-cols-[300px_minmax(0,1fr)] md:gap-20">
            <div className="flex flex-col gap-8 md:sticky md:top-32 md:self-start">
              <Reveal>
                <SectionHeader id="journey" label="Journey" title="The road" soft="so far" />
              </Reveal>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Show">
                {(Object.keys(KINDS) as Kind[])
                  .filter((k) => moments.some((m) => m.kind === k))
                  .map((k) => {
                    const on = kinds.has(k);
                    const { icon: Icon, color, label } = KINDS[k];
                    return (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(k)}
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors",
                          on ? "text-fg" : "border-line-2 text-fg-3",
                        )}
                        style={on ? { borderColor: color, background: `${color}1f` } : undefined}
                      >
                        <Icon aria-hidden className="size-4" style={{ color: on ? color : undefined }} />
                        {label}
                      </button>
                    );
                  })}
              </div>
            </div>
            <ol ref={rail} className="relative flex flex-col gap-4 pl-10 md:pl-14">
              <span
                aria-hidden
                className="absolute bottom-3 left-[15px] top-3 w-0.5 rounded-full bg-line-2 md:left-[23px]"
              />
              <span
                aria-hidden
                className="absolute left-[15px] top-3 w-0.5 origin-top rounded-full bg-gradient-to-b from-accent via-accent to-accent/30 md:left-[23px]"
                style={{ height: "calc(100% - 1.5rem)", transform: `scaleY(${fill})` }}
              />
              {shownMoments.map((m, i) => {
                const { icon: Icon, color, label } = KINDS[m.kind];
                const body = (
                  <>
                    <span className="flex items-center gap-3">
                      {m.logo ? (
                        <Mark src={m.logo} label={m.sub || m.title} className="size-10" />
                      ) : (
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-[10px]"
                          style={{ background: `${color}22`, color }}
                        >
                          <Icon aria-hidden className="size-5" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-h4 font-medium transition-colors group-hover:text-accent">
                          {m.title}
                        </span>
                        {m.sub && <span className="block truncate text-sm text-fg-2">{m.sub}</span>}
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-3 font-mono text-meta text-fg-3">
                      <span style={{ color }}>{label}</span>
                      <span>{m.when}</span>
                    </span>
                  </>
                );
                const card =
                  "group flex flex-col gap-4 rounded-[20px] border border-line bg-surface/50 p-5 transition-[transform,border-color] duration-300 hover:-translate-y-0.5";
                return (
                  <li key={m.key} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-10 top-6 flex size-8 items-center justify-center rounded-full border-2 bg-base md:-left-14 md:size-12"
                      style={{ borderColor: color }}
                    >
                      <Icon className="size-3.5 md:size-5" style={{ color }} />
                    </span>
                    <Reveal delay={Math.min(i, 6) * 60}>
                      {m.to ? (
                        <Link to={m.to} className={card}>
                          {body}
                        </Link>
                      ) : m.href ? (
                        <a href={m.href} target="_blank" rel="noopener noreferrer" className={card}>
                          {body}
                        </a>
                      ) : (
                        <div className={card}>{body}</div>
                      )}
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* 4 · What drives me */}
      {values.length > 0 && (
        <section className="section screen theme-light border-t-0" aria-labelledby="values">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="values" label="What drives me" title="How I" soft="work" />
            </Reveal>
            <ul
              className={cn(
                "grid gap-4",
                values.length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3",
              )}
            >
              {values.map((v, i) => (
                <li key={v.title}>
                  <Reveal delay={i * 100} className="h-full">
                    <div className="group flex h-full flex-col gap-5 rounded-[22px] border border-line-2 bg-surface/50 p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent md:p-7">
                      <span className="flex size-11 items-center justify-center rounded-[14px] bg-accent/15 font-mono text-meta text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-h3 font-medium">{v.title}</h3>
                      {v.description && <p className="text-fg-2">{v.description}</p>}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 5 · Beyond the code */}
      {(beyond.length > 0 || events.length > 0) && (
        <section
          className={cn("section screen border-t-0", values.length ? "" : "theme-light")}
          aria-labelledby="beyond"
        >
          <div className="wrap">
            <Reveal>
              <SectionHeader
                id="beyond"
                label="Beyond the code"
                title="Stages, clubs"
                soft="& giving back"
                action={
                  events.length > 0 ? (
                    <Button to="/events" variant="secondary">
                      All events
                    </Button>
                  ) : undefined
                }
              />
            </Reveal>
            {events.length > 0 && (
              <ul className="mb-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {events.slice(0, 3).map((e, i) => (
                  <li key={e.id}>
                    <Reveal delay={i * 90}>
                      <EventCard event={e} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
            {beyond.length > 0 && (
              <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {beyond.map((b, i) => {
                  const inner = (
                    <>
                      <Mark src={b.image} label={b.sub || b.title} className="size-12 rounded-[14px]" />
                      <span className="min-w-0 flex-1">
                        <span className="label text-accent">{b.tag}</span>
                        <span className="mt-1 block truncate font-medium">{b.title}</span>
                        {b.sub && <span className="block truncate text-sm text-fg-2">{b.sub}</span>}
                        <span className="mt-1 block font-mono text-meta text-fg-3">{b.when}</span>
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
                      <Reveal delay={Math.min(i, 8) * 50} className="h-full">
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
            )}
          </div>
        </section>
      )}

      {/* 6 · Languages */}
      {languages.length > 0 && (
        <section className="section screen" aria-labelledby="languages">
          <div className="wrap">
            <Reveal>
              <SectionHeader
                id="languages"
                label="Languages"
                title="Fluent in"
                soft={languages.length === 3 ? "three" : String(languages.length)}
              />
            </Reveal>
            <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {languages.map((l, i) => {
                const lvl = languageLevel(l.level ?? "");
                const breakdown = (
                  [
                    ["Speaking", l.speaking],
                    ["Reading", l.reading],
                    ["Writing", l.writing],
                  ] as const
                ).filter(([, v]) => typeof v === "number" && v > 0) as [string, number][];
                return (
                  <li key={l.id}>
                    <Reveal
                      delay={i * 90}
                      className="group flex flex-col gap-5 rounded-[22px] border border-line bg-surface/50 p-6"
                    >
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="text-h2 font-medium">{l.name}</span>
                        <span className="font-mono text-meta text-fg-3">{l.level}</span>
                      </span>
                      <span className="flex gap-1.5" role="img" aria-label={`${lvl} of 4`}>
                        {[0, 1, 2, 3].map((s) => (
                          <span key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-2">
                            <span
                              className={cn(
                                "block h-full origin-left scale-x-0 rounded-full bg-accent transition-transform duration-500 ease-out",
                                s < lvl && "group-data-[in=true]:scale-x-100",
                              )}
                              style={{ transitionDelay: `${i * 90 + s * 120 + 200}ms` }}
                            />
                          </span>
                        ))}
                      </span>
                      {breakdown.length > 0 && (
                        <dl className="flex flex-col gap-2.5 border-t border-line pt-4">
                          {breakdown.map(([k, v], si) => (
                            <div key={k} className="grid grid-cols-[72px_minmax(0,1fr)_36px] items-center gap-3">
                              <dt className="label text-fg-3">{k}</dt>
                              <dd className="h-1 overflow-hidden rounded-full bg-line-2">
                                <span
                                  className="block h-full origin-left scale-x-0 rounded-full bg-fg/70 transition-transform duration-700 ease-out group-data-[in=true]:scale-x-100"
                                  style={{
                                    width: `${Math.min(100, v)}%`,
                                    transitionDelay: `${i * 90 + si * 100 + 500}ms`,
                                  }}
                                />
                              </dd>
                              <span className="text-right font-mono text-meta text-fg-3">
                                {Math.min(100, v)}
                              </span>
                            </div>
                          ))}
                        </dl>
                      )}
                      {l.note && <p className="text-sm text-fg-2">{l.note}</p>}
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* 7 · Recognition */}
      {sortedAwards.length > 0 && (
        <section className="section screen theme-orange border-t-0" aria-labelledby="recognition">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="recognition" label="Recognition" title="Awards" soft="& honours" />
            </Reveal>
            <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {sortedAwards.map((a, i) => {
                const inner = (
                  <>
                    <span className="flex size-14 items-center justify-center rounded-full bg-[rgb(17_17_19)] text-[#f5a524] shadow-[inset_0_0_0_3px_rgb(245_165_36/0.4)] transition-transform duration-500 group-hover:rotate-[20deg]">
                      <Medal className="size-7" />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="font-mono text-meta text-fg-2">{year(a.date)}</span>
                      <span className="text-h4 font-medium leading-snug">{a.title}</span>
                      {a.issuer && <span className="text-sm text-fg-2">{a.issuer}</span>}
                    </span>
                  </>
                );
                const cls =
                  "group flex h-full flex-col gap-5 rounded-[22px] bg-white/25 p-6 transition-[transform,background-color] duration-300 hover:-translate-y-1 hover:bg-white/40";
                return (
                  <li key={a.id}>
                    <Reveal delay={i * 80} className="h-full">
                      {a.link ? (
                        <a href={a.link} target="_blank" rel="noopener noreferrer" className={cls}>
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

      {/* 8 · Now */}
      {now.length > 0 && (
        <section className="section screen border-t-0" aria-labelledby="now">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="now" label="Now" title="What I’m" soft="up to" />
            </Reveal>
            <ul className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {now.map((n, i) => (
                <li key={n.label}>
                  <Reveal
                    delay={i * 100}
                    className="flex h-full flex-col gap-4 rounded-[22px] border border-line bg-surface/50 p-6"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-live" />
                      </span>
                      <span className="label text-fg-3">{n.label}</span>
                      <n.icon aria-hidden className="ml-auto size-4 text-fg-3" />
                    </span>
                    <p className="text-h4 font-medium leading-snug">{n.text}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 9 · Call to action */}
      <section className={cn("pb-24", now.length === 0 && "pt-24")}>
        <div className="wrap">
          <Reveal className="flex flex-col items-start gap-6 rounded-[28px] bg-gradient-to-br from-accent to-[#ff8a3d] p-8 text-[rgb(17_17_19)] md:flex-row md:items-center md:justify-between md:p-12">
            <div className="flex flex-col gap-3">
              <AwardIcon aria-hidden className="size-8 opacity-70" />
              <h2 className="text-display-m font-medium">
                Let’s build <span className="font-light opacity-70">something.</span>
              </h2>
            </div>
            <Link
              to="/contact"
              className="inline-flex h-[52px] shrink-0 items-center gap-2.5 rounded-full bg-[rgb(17_17_19)] px-6 text-[15px] font-medium text-white transition-transform hover:-translate-y-0.5"
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
