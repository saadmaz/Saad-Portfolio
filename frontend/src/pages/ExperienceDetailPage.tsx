import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText, Link2, Presentation, Quote } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { PageHero, Reveal, SectionHeader, Skeleton, Tag } from "@/components/ui";
import { Mark, ProjectCard } from "@/components/cards";
import { Gallery } from "@/components/Gallery";
import { Linkified } from "@/components/Linkified";
import { useExperience, useSkills } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { companyPeriod, companyProjects, normalizeExperience, type Company } from "@/lib/experience";
import { BASE_URL } from "@/lib/seo-content";
import { cn } from "@/lib/utils";

const MEDIA_ICON = { Document: FileText, Presentation, Link: Link2, Image: Link2 } as const;
const pad = (n: number) => String(n).padStart(2, "0");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True once the element has scrolled into view. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/** "2,000+" counts up from 0 when seen, keeping its prefix, suffix and separators. */
function MetricValue({ value }: { value: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const m = value.match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  const target = m ? parseFloat(m[2].replace(/,/g, "")) : 0;
  const decimals = m?.[2].split(".")[1]?.length ?? 0;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!m || !inView) return;
    if (reducedMotion()) return setShown(target);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1600);
      setShown(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target]);
  if (!m) return <span ref={ref}>{value}</span>;
  const grouped = m[2].includes(",");
  const num = shown.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
  return (
    <span ref={ref} className="tabular-nums" aria-label={value}>
      <span aria-hidden>
        {m[1]}
        {num}
        {m[3]}
      </span>
    </span>
  );
}

/** Card with a soft orange light that follows the pointer. */
function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <div
      onPointerMove={onMove}
      className={cn(
        "group/spot relative h-full overflow-hidden rounded-[22px] border border-line bg-surface/50 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/40",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(360px_circle_at_var(--x,50%)_var(--y,50%),rgb(255_95_0/0.14),transparent_60%)] group-hover/spot:opacity-100"
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/** Roles as a vertical journey whose rail fills in as you scroll through it. */
function RoleJourney({ company }: { company: Company }) {
  const ref = useRef<HTMLOListElement>(null);
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) return setFill(1);
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      setFill(Math.min(1, Math.max(0, (window.innerHeight * 0.65 - r.top) / Math.max(1, r.height))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <ol ref={ref} className="relative flex flex-col gap-6 pl-10 md:pl-14">
      <span
        aria-hidden
        className="absolute bottom-2 left-[11px] top-2 w-0.5 rounded-full bg-line-2 md:left-[19px]"
      />
      <span
        aria-hidden
        className="absolute left-[11px] top-2 w-0.5 origin-top rounded-full bg-gradient-to-b from-accent to-accent/40 md:left-[19px]"
        style={{ height: "calc(100% - 1rem)", transform: `scaleY(${fill})` }}
      />
      {company.roles.map((r, i) => (
        <li key={r.title + r.period} className="relative">
          <span
            aria-hidden
            className={cn(
              "absolute -left-10 top-7 flex size-6 items-center justify-center rounded-full border-2 bg-base md:-left-14 md:size-10",
              r.isCurrent ? "border-live" : "border-accent",
            )}
          >
            <span className={cn("size-2 rounded-full md:size-3", r.isCurrent ? "bg-live" : "bg-accent")} />
          </span>
          <Reveal delay={i * 80}>
            <Spotlight className="p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <h3 className="text-h3 font-medium text-fg">{r.title}</h3>
                <span className="flex items-center gap-2 font-mono text-meta text-fg-3">
                  {r.isCurrent && <span className="size-1.5 rounded-full bg-live" />}
                  {r.period}
                </span>
              </div>
              {r.description && (
                <p className="mt-4 whitespace-pre-line text-body-l text-fg-2">
                  <Linkified text={r.description} />
                </p>
              )}
              {r.skills.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {r.skills.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              )}
            </Spotlight>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

const ExperienceDetailPage = () => {
  const { slug = "" } = useParams();
  const { data = [], isLoading } = useExperience();
  const { data: projects = [] } = useProjects();
  const { data: skillSets = [] } = useSkills();
  const companies = useMemo(() => normalizeExperience(data), [data]);
  const icons = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of skillSets)
      for (const s of g.skills ?? []) if (s.icon) map.set(s.name.toLowerCase(), s.icon);
    return map;
  }, [skillSets]);

  if (isLoading)
    return (
      <Layout>
        <div className="wrap flex flex-col gap-8 py-32">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-2/3" />
          <Skeleton className="h-64 w-full rounded-[22px]" />
        </div>
      </Layout>
    );

  const at = companies.findIndex((c) => c.slug === slug);
  const company = companies[at];
  if (!company) return <NotFound />;

  const url = `${BASE_URL}/experience/${company.slug}`;
  const period = companyPeriod(company);
  const current = company.roles.some((r) => r.isCurrent);
  const lead = company.roles[0];
  const linked = companyProjects(company, projects);
  const skills = [...new Set([...company.skills, ...company.roles.flatMap((r) => r.skills)])];
  const images = company.media.filter((m) => m.media_type === "Image");
  const files = company.media.filter((m) => m.media_type !== "Image");
  const next = companies[(at + 1) % companies.length];
  const summary =
    company.description ||
    lead?.description ||
    `${lead?.title ?? "Work"} at ${company.name}${period ? `, ${period}` : ""}.`;

  // "What I did": CMS highlight cards, else the achievements split into lines.
  const achievementLines = (company.achievements ?? "")
    .split(/\n+|•/)
    .map((l) => l.replace(/^[-*\s]+/, "").trim())
    .filter(Boolean);
  const cards = company.highlights.length
    ? company.highlights
    : achievementLines.length >= 2
      ? achievementLines.slice(0, 6).map((l) => ({ title: "", description: l }))
      : [];
  const achievementsAsText = !company.highlights.length && cards.length === 0 && company.achievements;

  const facts = [
    ["Period", period],
    ["Roles", String(company.roles.length)],
    ["Type", company.employmentType],
    ["Location", [company.location, company.locationType].filter(Boolean).join(" · ")],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <Layout>
      <SEO
        title={`${company.name}: ${lead?.title ?? "Experience"} | Saad Mazhar`}
        description={summary.replace(/\s+/g, " ").slice(0, 158)}
        url={url}
        breadcrumbs={[
          { name: "Experience", url: `${BASE_URL}/experience` },
          { name: company.name, url },
        ]}
      />

      {/* 1 · Hero */}
      <PageHero ambient band={<span className="truncate">Saad Mazhar · Experience · {company.name}</span>}>
        <nav aria-label="Breadcrumb" className="animate-rise font-mono text-meta text-fg-3">
          <Link to="/experience" className="inline-flex items-center gap-1.5 hover:text-fg">
            <ArrowLeft aria-hidden className="size-3.5" />
            All experience
          </Link>
        </nav>
        <div className="mt-8 flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-[820px] flex-col gap-6">
            <div className="flex animate-rise flex-wrap items-center gap-2 [animation-delay:100ms]">
              {current && (
                <span className="label inline-flex h-7 items-center gap-2 rounded-full border border-live/25 bg-live/10 px-2.5 text-live">
                  <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-live" />
                  Current
                </span>
              )}
              {company.employmentType && <Tag>{company.employmentType}</Tag>}
              {company.locationType && <Tag>{company.locationType}</Tag>}
              {period && <Tag>{period}</Tag>}
            </div>
            <div className="flex animate-rise items-center gap-5 [animation-delay:180ms] md:gap-7">
              <Mark
                src={company.logo}
                label={company.name}
                className="size-16 rounded-[18px] text-[1.25rem] text-fg md:size-24 md:rounded-[24px] md:text-[2rem]"
              />
              <h1 className="text-display-l font-medium">{company.name}</h1>
            </div>
            {lead && (
              <p className="animate-rise text-h3 font-light text-fg-2 [animation-delay:260ms] md:text-h2">
                {lead.title}
                {company.roles.length > 1 && (
                  <span className="text-fg-3">
                    {" "}
                    + {company.roles.length - 1} more {company.roles.length > 2 ? "roles" : "role"}
                  </span>
                )}
              </p>
            )}
            {company.url && (
              <a
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-11 w-fit animate-rise items-center gap-2 rounded-full border border-line-3 px-5 text-sm font-medium text-fg transition-colors [animation-delay:340ms] hover:border-accent hover:text-accent"
              >
                Visit {company.name}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            )}
          </div>
          {company.illustration && (
            <div className="relative mx-auto shrink-0 animate-rise [animation-delay:300ms] lg:mx-0">
              <div
                aria-hidden
                className="absolute inset-[15%] rounded-full bg-[radial-gradient(circle,rgb(255_95_0/0.35),transparent_70%)] blur-2xl"
              />
              <img
                src={company.illustration}
                alt=""
                className="relative size-[220px] animate-float object-contain drop-shadow-[0_30px_40px_rgb(0_0_0/0.6)] md:size-[340px]"
              />
            </div>
          )}
        </div>
      </PageHero>

      {/* 2 · Impact numbers (or the quick facts when there are none) */}
      <section aria-label="At a glance" className="border-b border-line">
        {company.metrics.length > 0 ? (
          <dl className="wrap grid grid-cols-2 gap-3 py-14 md:grid-cols-4 md:py-16">
            {company.metrics.map((m, i) => (
              <Reveal key={m.label + m.value} delay={i * 90}>
                <Spotlight className="flex flex-col-reverse gap-3 p-6 md:p-7">
                  <dt className="text-sm leading-snug text-fg-2">{m.label}</dt>
                  <dd className="text-display-m font-medium leading-none text-accent">
                    <MetricValue value={m.value} />
                  </dd>
                </Spotlight>
              </Reveal>
            ))}
          </dl>
        ) : (
          <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-8 py-12 md:grid-cols-4 md:py-14">
            {facts.map(([k, v], i) => (
              <Reveal key={k} delay={i * 80} className="flex flex-col gap-2.5 border-l border-line-2 pl-4">
                <dt className="label text-fg-3">{k}</dt>
                <dd className={cn("leading-snug", k === "Period" && current ? "text-live" : "text-fg")}>
                  {v}
                </dd>
              </Reveal>
            ))}
          </dl>
        )}
      </section>

      <div className="counted">
        {/* 3 · Overview */}
        {company.description && (
          <section className="section theme-orange border-t-0" aria-labelledby="overview">
            <div className="wrap grid gap-10 md:grid-cols-[280px_1fr] md:gap-20">
              <Reveal>
                <SectionHeader counted id="overview" label="Overview" title="The" soft="story" />
              </Reveal>
              <Reveal delay={120}>
                <p className="whitespace-pre-line text-h3 font-light leading-relaxed text-fg md:text-[1.75rem] md:leading-[1.5]">
                  <Linkified text={company.description} />
                </p>
              </Reveal>
            </div>
          </section>
        )}

        {/* 4 · What I did */}
        {(cards.length > 0 || achievementsAsText) && (
          <section className="section theme-light border-t-0" aria-labelledby="what-i-did">
            <div className="wrap">
              <Reveal>
                <SectionHeader
                  counted
                  id="what-i-did"
                  label="What I did"
                  title="Where I"
                  soft="moved the needle"
                />
              </Reveal>
              {cards.length > 0 ? (
                <ul
                  className={cn(
                    "grid gap-4 md:gap-6",
                    cards.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2",
                  )}
                >
                  {cards.map((c, i) => (
                    <li key={c.title + c.description}>
                      <Reveal delay={i * 110} className="h-full">
                        <Spotlight className="flex flex-col gap-5 p-6 md:p-8">
                          <span className="flex size-11 items-center justify-center rounded-[14px] bg-accent/15 font-mono text-meta text-accent transition-colors duration-300 group-hover/spot:bg-accent group-hover/spot:text-fg-inverse">
                            {pad(i + 1)}
                          </span>
                          {c.title && <h3 className="text-h3 font-medium text-fg">{c.title}</h3>}
                          <p
                            className={cn(
                              "text-fg-2",
                              !c.title && "text-h4 font-normal leading-relaxed text-fg",
                            )}
                          >
                            <Linkified text={c.description} />
                          </p>
                        </Spotlight>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              ) : (
                <Reveal>
                  <Spotlight className="p-6 md:p-10">
                    <p className="whitespace-pre-line text-h4 font-normal leading-relaxed text-fg">
                      <Linkified text={company.achievements ?? ""} />
                    </p>
                  </Spotlight>
                </Reveal>
              )}
            </div>
          </section>
        )}

        {/* 5 · Role journey */}
        <section className="section" aria-labelledby="journey">
          <div className="wrap grid gap-12 md:grid-cols-[280px_1fr] md:gap-20">
            <Reveal className="md:sticky md:top-32 md:self-start">
              <SectionHeader
                counted
                id="journey"
                label={company.roles.length > 1 ? "Role journey" : "My role"}
                title={company.roles.length > 1 ? "How it" : "What I"}
                soft={company.roles.length > 1 ? "grew" : "owned"}
              />
            </Reveal>
            <RoleJourney company={company} />
          </div>
        </section>

        {/* 6 · Tech & tools */}
        {skills.length > 0 && (
          <section className="section theme-light border-t-0" aria-labelledby="tools">
            <div className="wrap">
              <Reveal>
                <SectionHeader counted id="tools" label="Tech & tools" title="What I" soft="worked with" />
              </Reveal>
              <ul className="flex flex-wrap gap-3">
                {skills.map((s, i) => {
                  const icon = icons.get(s.toLowerCase());
                  return (
                    <li key={s}>
                      <Reveal delay={Math.min(i, 16) * 35}>
                        <span className="group inline-flex h-12 items-center gap-3 rounded-full border border-line-2 bg-surface/50 pl-2 pr-5 text-fg-2 transition-[border-color,color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 hover:text-fg">
                          <span className="flex size-8 items-center justify-center rounded-full bg-surface-2 transition-colors group-hover:bg-base">
                            {icon ? (
                              <img src={icon} alt="" className="size-4 object-contain" loading="lazy" />
                            ) : (
                              <span className="size-1.5 rounded-full bg-accent" />
                            )}
                          </span>
                          {s}
                        </span>
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* 7 · Projects */}
        {linked.length > 0 && (
          <section className="section" aria-labelledby="company-projects">
            <div className="wrap">
              <Reveal>
                <SectionHeader
                  counted
                  id="company-projects"
                  label="Projects"
                  title="What I"
                  soft={`shipped at ${company.name}`}
                />
              </Reveal>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {linked.map((p, i) => (
                  <li key={p.id}>
                    <Reveal delay={i * 100} className="h-full">
                      <ProjectCard project={p} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 8 · Testimonial */}
        {company.testimonial && (
          <section
            className="theme-orange relative overflow-hidden py-24 md:py-32"
            aria-label="What people said"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 size-[480px] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.25),transparent_65%)]"
            />
            <div className="wrap relative">
              <Reveal>
                <figure className="mx-auto flex max-w-[900px] flex-col items-center gap-8 text-center">
                  <Quote aria-hidden className="size-12 text-fg/30" />
                  <blockquote className="text-h2 font-medium leading-snug text-fg md:text-[2.5rem] md:leading-[1.2]">
                    “{company.testimonial.quote}”
                  </blockquote>
                  <figcaption className="flex flex-col items-center gap-1">
                    <span className="font-medium text-fg">{company.testimonial.name}</span>
                    {company.testimonial.role && (
                      <span className="font-mono text-meta text-fg-2">{company.testimonial.role}</span>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </section>
        )}

        {/* Documents */}
        {files.length > 0 && (
          <section className="section" aria-labelledby="resources">
            <div className="wrap">
              <Reveal>
                <SectionHeader counted id="resources" label="Documents & links" title="Read" soft="more" />
              </Reveal>
              <ul className="grid gap-3 md:grid-cols-2">
                {files.map((m, i) => {
                  const Icon = MEDIA_ICON[m.media_type] ?? Link2;
                  return (
                    <li key={m.media_url}>
                      <Reveal delay={i * 70}>
                        <a
                          href={m.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 rounded-card border border-line bg-surface/40 p-5 text-fg transition-colors hover:border-accent/40 hover:text-accent"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-surface-2">
                            <Icon aria-hidden className="size-5 text-fg-3 group-hover:text-accent" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{m.media_caption || m.media_url}</span>
                          <ArrowUpRight aria-hidden className="size-4 shrink-0" />
                        </a>
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </div>

      {/* 9 · Moments */}
      {images.length > 0 && (
        <Gallery
          images={images.map((m) => m.media_url)}
          captions={images.map((m) => m.media_caption ?? "")}
          alts={images.map((m, i) => m.media_caption || `${company.name} (${i + 1} of ${images.length})`)}
          title={company.name}
          label="Moments"
          heading={
            <>
              Moments <span className="soft">at {company.name}</span>
            </>
          }
        />
      )}

      {/* 10 · Next company */}
      {next && next.slug !== company.slug && (
        <section className="section">
          <div className="wrap">
            <Link
              to={`/experience/${next.slug}`}
              className="group relative flex flex-col gap-8 overflow-hidden rounded-[28px] border border-line bg-surface/40 p-8 transition-colors hover:border-accent/40 md:flex-row md:items-center md:justify-between md:p-12"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-[radial-gradient(circle,rgb(255_95_0/0.18),transparent_65%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="relative flex flex-col gap-5">
                <span className="label text-fg-3">Next stop</span>
                <span className="flex items-center gap-5">
                  <Mark src={next.logo} label={next.name} className="size-14 rounded-[16px] md:size-16" />
                  <span className="text-display-m font-medium transition-colors group-hover:text-accent">
                    {next.name}
                  </span>
                </span>
                {next.roles[0] && <span className="text-body-l text-fg-2">{next.roles[0].title}</span>}
              </div>
              <span className="relative flex items-center gap-6">
                {next.illustration && (
                  <img
                    src={next.illustration}
                    alt=""
                    loading="lazy"
                    className="hidden size-36 object-contain drop-shadow-[0_20px_30px_rgb(0_0_0/0.5)] transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105 md:block"
                  />
                )}
                <span className="flex size-14 items-center justify-center rounded-full bg-fg transition-colors duration-300 group-hover:bg-accent">
                  <ArrowRight
                    aria-hidden
                    className="size-6 text-fg-inverse transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </span>
            </Link>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ExperienceDetailPage;
