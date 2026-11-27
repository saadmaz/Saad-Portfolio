import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search, X } from "lucide-react";
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
} from "@/components/ui";
import { Mark } from "@/components/cards";
import { useCertificates, useExperience, useSkills } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { normalizeExperience } from "@/lib/experience";
import { certificatePath } from "@/lib/paths";
import { skillKey, skillUsage, type SkillUsage } from "@/lib/skillUsage";
import { skillLink } from "@/lib/skill-links.js";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { cn, tint } from "@/lib/utils";
import type { Skill } from "@/types";

/** Levels as colours: orange for daily drivers down to slate for what I'm learning. */
const LEVELS = [
  { key: "Expert", label: "Daily driver", value: 4, color: "#ff5f00" },
  { key: "Advance", label: "Proficient", value: 3, color: "#f5a524" },
  { key: "Intermediate", label: "Familiar", value: 2, color: "#2fbf71" },
  { key: "Beginner", label: "Learning", value: 1, color: "#7c8db5" },
] as const;
const levelOf = (s: Skill) => LEVELS.find((l) => l.key === s.level) ?? LEVELS[2];

const NOW = new Date().getFullYear();
const yearsOf = (s: Skill) => (s.startYear > 1990 ? Math.max(1, NOW - s.startYear) : 0);

type Item = Skill & { category: string };

/** Logo in a tile, or its initials when there's no logo yet. */
function Logo({ skill, className }: { skill: Skill; className?: string }) {
  return skill.icon ? (
    <img src={skill.icon} alt="" loading="lazy" className={cn("object-contain", className)} />
  ) : (
    <span className={cn("flex items-center justify-center font-mono font-medium uppercase", className)}>
      {skill.name.slice(0, 2)}
    </span>
  );
}

/** Four-segment ring around a logo, filled to the skill's level in its level colour. */
function LevelRing({ skill }: { skill: Skill }) {
  const lvl = levelOf(skill);
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="absolute inset-0 -rotate-90">
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          cx="32"
          cy="32"
          r="29"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="21 79"
          strokeDashoffset={-i * 25 - 2}
          stroke={i < lvl.value ? lvl.color : "rgb(var(--ink) / 0.1)"}
        />
      ))}
    </svg>
  );
}

/** Hero backdrop: three slow rings of logos orbiting an orange glow. */
function Orbit({ skills }: { skills: Item[] }) {
  const withIcons = skills.filter((s) => s.icon).slice(0, 18);
  if (withIcons.length < 4) return null;
  const rings = [withIcons.slice(0, 5), withIcons.slice(5, 11), withIcons.slice(11)].filter((r) => r.length);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-[-12%] top-1/2 hidden size-[620px] -translate-y-1/2 opacity-80 lg:block xl:right-[-4%]"
    >
      <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,rgb(255_95_0/0.35),transparent_70%)] blur-2xl" />
      {rings.map((ring, r) => {
        const radius = 120 + r * 85;
        const duration = 50 + r * 25;
        return (
          <div
            key={r}
            className="absolute inset-0 animate-spin motion-reduce:animate-none"
            style={{ animationDuration: `${duration}s`, animationDirection: r % 2 ? "reverse" : "normal" }}
          >
            <span
              className="absolute left-1/2 top-1/2 rounded-full border border-line"
              style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius }}
            />
            {ring.map((s, i) => {
              const angle = (360 / ring.length) * i;
              return (
                <span
                  key={s.name}
                  className="absolute left-1/2 top-1/2 -ml-6 -mt-6"
                  style={{ transform: `rotate(${angle}deg) translateX(${radius}px) rotate(${-angle}deg)` }}
                >
                  <span
                    className="flex size-12 animate-spin items-center justify-center rounded-2xl border border-line-2 bg-surface/80 p-2.5 backdrop-blur motion-reduce:animate-none"
                    style={{
                      animationDuration: `${duration}s`,
                      animationDirection: r % 2 ? "normal" : "reverse",
                    }}
                  >
                    <Logo skill={s} className="size-full" />
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** Card that tilts toward the pointer. */
function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translateY(-4px)`;
  };
  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
      className={cn("transition-transform duration-200 ease-out motion-reduce:transform-none", className)}
    >
      {children}
    </div>
  );
}

/** Side panel for one skill: level, years and everywhere it shows up. */
function SkillPanel({ skill, usage, onClose }: { skill: Item; usage?: SkillUsage; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);
  const lvl = levelOf(skill);
  const years = yearsOf(skill);
  const href = skillLink(skill);
  const groups = [
    {
      title: "Projects",
      items: (usage?.projects ?? []).map((p) => ({
        key: p.slug,
        to: `/projects/${p.slug}`,
        label: p.title,
        sub: p.tagline,
      })),
    },
    {
      title: "Companies",
      items: (usage?.companies ?? []).map((c) => ({
        key: c.slug,
        to: `/experience/${c.slug}`,
        label: c.name,
        sub: c.roles[0]?.title,
      })),
    },
    {
      title: "Certificates",
      items: (usage?.certificates ?? []).map((c) => ({
        key: String(c.id),
        to: certificatePath(c),
        label: c.title,
        sub: c.issuer,
      })),
    },
  ].filter((g) => g.items.length);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={skill.name}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-rise bg-black/60 backdrop-blur-sm [animation-duration:250ms]"
      />
      <aside className="relative flex h-full w-full max-w-[440px] animate-slide-in flex-col overflow-y-auto border-l border-line-2 bg-base">
        <div
          className="relative overflow-hidden p-6 pb-8 md:p-8"
          style={{ background: `linear-gradient(160deg, ${lvl.color}33, transparent 70%)` }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-line-2 text-fg-2 hover:text-fg"
          >
            <X className="size-5" />
          </button>
          <span className="relative flex size-20 items-center justify-center p-4">
            <LevelRing skill={skill} />
            <Logo skill={skill} className="size-full text-lg" />
          </span>
          <h2 className="mt-5 text-h1 font-medium">{skill.name}</h2>
          <p className="mt-2 font-mono text-meta text-fg-3">{skill.category}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-card border border-line bg-surface/60 p-4">
              <dt className="label text-fg-3">Level</dt>
              <dd className="mt-2 font-medium" style={{ color: tint(lvl.color) }}>
                {lvl.label}
              </dd>
            </div>
            <div className="rounded-card border border-line bg-surface/60 p-4">
              <dt className="label text-fg-3">Using since</dt>
              <dd className="mt-2 font-medium">
                {skill.startYear || "–"}
                {years > 0 && (
                  <span className="text-fg-3">
                    {" "}
                    · {years} yr{years > 1 ? "s" : ""}
                  </span>
                )}
              </dd>
            </div>
          </dl>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 text-sm text-fg-2 transition-colors hover:border-accent hover:text-accent"
            >
              {skill.name} official site <ArrowUpRight aria-hidden className="size-4" />
            </a>
          )}
        </div>
        <div className="flex flex-col gap-8 p-6 md:p-8">
          <span className="label text-fg-3">Where I’ve used it</span>
          {groups.length === 0 && (
            <p className="text-fg-3">Not linked to a project or role on this site yet.</p>
          )}
          {groups.map((g) => (
            <div key={g.title} className="flex flex-col gap-3">
              <h3 className="text-h4 font-medium">
                {g.title} <span className="font-mono text-meta text-fg-3">{g.items.length}</span>
              </h3>
              <ul className="flex flex-col gap-2">
                {g.items.map((it) => (
                  <li key={it.key}>
                    <Link
                      to={it.to}
                      onClick={onClose}
                      className="group flex items-center justify-between gap-4 rounded-card border border-line bg-surface/40 p-4 transition-colors hover:border-accent/50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium group-hover:text-accent">{it.label}</span>
                        {it.sub && <span className="mt-0.5 block truncate text-sm text-fg-3">{it.sub}</span>}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 text-fg-3 group-hover:text-accent"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

const TIMELINE_MAX = 8;
const LEVEL_MAX = 12;

function MoreButton({ open, hidden, onClick }: { open: boolean; hidden: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="tap self-start rounded-full px-1 font-mono text-meta text-fg-3 underline-offset-4 transition-colors hover:text-accent hover:underline"
    >
      {open ? "Show less" : `+${hidden} more`}
    </button>
  );
}

/** ItemList of every skill as a DefinedTerm linked to its official site, for search and answer engines. */
function skillsSchema(items: Item[]) {
  if (!items.length) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Skills and tools - Saad Mazhar",
    url: `${BASE_URL}/skills`,
    numberOfItems: items.length,
    itemListElement: items.map((s, i) => {
      const href = skillLink(s);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "DefinedTerm",
          name: s.name,
          description: `${levelOf(s).label} · ${s.category}${s.startYear ? ` · since ${s.startYear}` : ""}`,
          inDefinedTermSet: s.category,
          ...(href ? { sameAs: href } : {}),
        },
      };
    }),
  };
}

const SkillsPage = () => {
  const { data: all = [], isLoading } = useSkills();
  const { data: certs = [] } = useCertificates();
  const { data: projects = [] } = useProjects();
  const { data: experience = [] } = useExperience();

  // Strip-only tools (set in the CMS) belong to the home page, not this list.
  const data = useMemo(
    () =>
      all.map((g) => ({ ...g, skills: g.skills.filter((s) => !s.toolOnly) })).filter((g) => g.skills.length),
    [all],
  );
  const items = useMemo<Item[]>(
    () => data.flatMap((g) => g.skills.map((s) => ({ ...s, category: g.category }))),
    [data],
  );
  const usage = useMemo(
    () => skillUsage(projects, normalizeExperience(experience), certs),
    [projects, experience, certs],
  );

  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Item | null>(null);
  const close = useCallback(() => setOpen(null), []);

  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (s) =>
      (category === "All" || s.category === category) &&
      (!level || s.level === level) &&
      (!q || s.name.toLowerCase().includes(q)),
  );
  const experts = items.filter((s) => s.level === "Expert");
  const firstYear = Math.min(...items.map((s) => s.startYear).filter((y) => y > 1990), NOW);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleMore = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  const byYear = useMemo(() => {
    const m = new Map<number, Item[]>();
    for (const s of items) if (s.startYear > 1990) m.set(s.startYear, [...(m.get(s.startYear) ?? []), s]);
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [items]);

  // Sliding underline under the active category tab.
  const tabs = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const el = tabs.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
  }, [category, data.length]);

  const stats = [
    { value: items.length, label: "Tools" },
    { value: data.length, label: "Disciplines" },
    { value: NOW - firstYear, label: "Years building" },
    { value: projects.length, label: "Projects shipped" },
  ].filter((s) => s.value > 0);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/skills"].title}
        description={PAGE_SEO["/skills"].description}
        url={`${BASE_URL}/skills`}
        structuredData={skillsSchema(items)}
      />

      {/* 1 · Hero */}
      <PageHero ambient className="mb-0" band={<span className="truncate">Saad Mazhar · Skills</span>}>
        <Orbit skills={items} />
        <div className="relative max-w-[720px]">
          <div className="animate-rise">
            <Eyebrow>Skills</Eyebrow>
          </div>
          <h1 className="mt-8 text-display-xl font-medium md:mt-10">
            <RisingWords text="Tech stack" /> <RisingWords text="& skills" from={2} className="soft" />
          </h1>
          <p className="mt-8 max-w-[560px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
            The tools I reach for every day, the ones I’m strong in, and the ones I’m still learning. Click
            any tool to see where I’ve used it.
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

      {/* 2 · Daily drivers */}
      {experts.length > 0 && (
        <section className="section screen theme-orange border-t-0" aria-labelledby="drivers">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="drivers" label="Daily drivers" title="What I reach for" soft="every day" />
            </Reveal>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {experts.map((s, i) => (
                <li key={s.name}>
                  <Reveal delay={i * 70}>
                    <TiltCard>
                      <button
                        type="button"
                        onClick={() => setOpen(s)}
                        className="flex w-full flex-col items-start gap-6 rounded-[22px] bg-[rgb(17_17_19)] p-5 text-left text-white shadow-[0_24px_50px_-24px_rgb(0_0_0/0.6)] md:p-6"
                      >
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-white p-2.5 text-[rgb(17_17_19)]">
                          <Logo skill={s} className="size-full" />
                        </span>
                        <span className="flex w-full flex-col gap-1">
                          <span className="truncate text-h4 font-medium">{s.name}</span>
                          <span className="font-mono text-meta text-white/60">
                            {yearsOf(s) ? `${yearsOf(s)} yr${yearsOf(s) > 1 ? "s" : ""}` : s.category}
                          </span>
                        </span>
                      </button>
                    </TiltCard>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 3 · Explorer */}
      <section className="section screen theme-light border-t-0" aria-labelledby="explorer">
        <div className="wrap">
          <Reveal>
            <SectionHeader id="explorer" label="Explorer" title="The whole" soft="toolbox" />
          </Reveal>
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-card" />
          ) : items.length === 0 ? (
            <Empty>Skills will appear here soon.</Empty>
          ) : (
            <>
              <div className="flex flex-col gap-5">
                <div
                  ref={tabs}
                  role="tablist"
                  aria-label="Category"
                  className="relative -mx-5 flex gap-1 overflow-x-auto border-b border-line-2 px-5 [scrollbar-width:none] sm:mx-0 sm:px-0"
                >
                  {["All", ...data.map((g) => g.category)].map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="tab"
                      aria-selected={category === c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "shrink-0 whitespace-nowrap px-4 pb-3 pt-1 text-[15px] transition-colors",
                        category === c ? "font-medium text-fg" : "text-fg-3 hover:text-fg",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                  <span
                    aria-hidden
                    className="absolute bottom-0 h-0.5 rounded-full bg-accent transition-[left,width] duration-300 ease-out"
                    style={{ left: bar.left, width: bar.width }}
                  />
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Level">
                    {LEVELS.map((l) => {
                      const on = level === l.key;
                      return (
                        <button
                          key={l.key}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setLevel(on ? null : l.key)}
                          className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors"
                          style={
                            on
                              ? { background: l.color, borderColor: l.color, color: "rgb(17 17 19)" }
                              : { borderColor: `${l.color}66` }
                          }
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ background: on ? "rgb(17 17 19)" : l.color }}
                          />
                          {l.label}
                        </button>
                      );
                    })}
                  </div>
                  <label className="relative flex items-center md:w-[260px]">
                    <span className="sr-only">Search skills</span>
                    <Search aria-hidden className="pointer-events-none absolute left-3.5 size-4 text-fg-3" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search tools"
                      className="h-10 w-full rounded-full border border-line-2 bg-surface pl-10 pr-4 text-sm text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
                    />
                  </label>
                </div>
              </div>

              {shown.length === 0 ? (
                <p className="mt-10 text-fg-3">Nothing matches. Try another level or search.</p>
              ) : (
                <ul
                  key={category + level + q}
                  className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                >
                  {shown.map((s, i) => {
                    const lvl = levelOf(s);
                    const used = usage.get(skillKey(s.name));
                    const count =
                      (used?.projects.length ?? 0) +
                      (used?.companies.length ?? 0) +
                      (used?.certificates.length ?? 0);
                    return (
                      <li
                        key={s.category + s.name}
                        // Phones show the first dozen until "Show all"; wider screens show everything.
                        className={cn("animate-rise", i >= 12 && !expanded.has("explorer") && "max-sm:hidden")}
                        style={{ animationDelay: `${Math.min(i, 18) * 25}ms` }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpen(s)}
                          className="group flex w-full flex-col items-center gap-3 rounded-[20px] border border-line-2 bg-surface/60 p-5 text-center transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:bg-base hover:shadow-[0_18px_40px_-20px_var(--glow)]"
                          style={{ ["--glow" as string]: lvl.color }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = lvl.color)}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                        >
                          <span className="relative flex size-16 items-center justify-center p-3.5">
                            <LevelRing skill={s} />
                            <Logo
                              skill={s}
                              className="size-full text-sm text-fg-2 transition-transform duration-300 group-hover:scale-110"
                            />
                          </span>
                          <span className="w-full truncate text-[15px] font-medium">{s.name}</span>
                          <span
                            className="font-mono text-[11px] uppercase tracking-wider"
                            style={{ color: tint(lvl.color) }}
                          >
                            {lvl.label}
                          </span>
                          <span className="font-mono text-[11px] text-fg-3">
                            {yearsOf(s) ? `${yearsOf(s)} yr${yearsOf(s) > 1 ? "s" : ""}` : "New"}
                            {count > 0 && ` · used ${count}×`}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {shown.length > 12 && (
                <button
                  type="button"
                  onClick={() => toggleMore("explorer")}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full border border-line-2 text-sm font-medium sm:hidden"
                >
                  {expanded.has("explorer") ? "Show fewer" : `Show all ${shown.length} skills`}
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* 4 · How the stack grew */}
      {byYear.length > 1 && (
        <section className="section screen border-t-0" aria-labelledby="timeline">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="timeline" label="Timeline" title="How the stack" soft="grew" />
            </Reveal>
          </div>
          <div className="wrap overflow-x-auto pb-4 [scrollbar-width:thin]">
            <Reveal className="group relative flex min-w-max gap-4 pt-10 md:gap-6">
              <span aria-hidden className="absolute inset-x-0 top-[13px] h-px bg-line-2" />
              <span
                aria-hidden
                className="absolute inset-x-0 top-[12px] h-[3px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-accent/40 via-accent to-accent transition-transform duration-[1600ms] ease-out group-data-[in=true]:scale-x-100"
              />
              {byYear.map(([year, list], yi) => (
                <div key={year} className="relative flex w-[200px] shrink-0 flex-col gap-4">
                  <span
                    aria-hidden
                    className="absolute -top-[33px] left-0 size-3 rounded-full border-2 border-accent bg-base opacity-0 transition-opacity duration-500 group-data-[in=true]:opacity-100"
                    style={{ transitionDelay: `${yi * 140}ms` }}
                  />
                  <span className="text-display-m font-medium leading-none">{year}</span>
                  <span className="font-mono text-meta text-fg-3">+{list.length} new</span>
                  <ul className="flex flex-col gap-2">
                    {(expanded.has(`y${year}`) ? list : list.slice(0, TIMELINE_MAX)).map((s, i) => (
                      <li
                        key={s.name}
                        className="flex translate-y-3 items-center gap-2.5 rounded-xl border border-line bg-surface/60 px-3 py-2 opacity-0 transition-[opacity,transform] duration-500 group-data-[in=true]:translate-y-0 group-data-[in=true]:opacity-100"
                        style={{ transitionDelay: `${yi * 140 + i * 60 + 200}ms` }}
                      >
                        <span className="size-5 shrink-0 text-[10px] text-fg-3">
                          <Logo skill={s} className="size-full" />
                        </span>
                        <span className="truncate text-sm">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                  {list.length > TIMELINE_MAX && (
                    <MoreButton
                      open={expanded.has(`y${year}`)}
                      hidden={list.length - TIMELINE_MAX}
                      onClick={() => toggleMore(`y${year}`)}
                    />
                  )}
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* 5 · Level map */}
      {items.length > 0 && (
        <section className="section screen theme-light border-t-0" aria-labelledby="levels">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="levels" label="Level map" title="Where I’m" soft="strongest" />
            </Reveal>
            <div className="swipe-row grid-cols-1 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
              {LEVELS.map((l, li) => {
                const list = items.filter((s) => s.level === l.key);
                const pct = items.length ? list.length / items.length : 0;
                return (
                  <Reveal
                    key={l.key}
                    delay={li * 100}
                    className="swipe-item group flex flex-col gap-5 rounded-[22px] border border-line-2 bg-surface/50 p-5 md:p-6"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-h3 font-medium" style={{ color: tint(l.color) }}>
                        {l.label}
                      </h3>
                      <span className="font-mono text-meta text-fg-3">{list.length}</span>
                    </div>
                    <span className="h-2 overflow-hidden rounded-full bg-line-2">
                      <span
                        className="block h-full origin-left scale-x-0 rounded-full transition-transform duration-1000 ease-out group-data-[in=true]:scale-x-100"
                        style={{
                          width: `${Math.max(pct * 100, 4)}%`,
                          background: l.color,
                          transitionDelay: `${li * 120 + 200}ms`,
                        }}
                      />
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      {(expanded.has(`l${l.key}`) ? list : list.slice(0, LEVEL_MAX)).map((s) => (
                        <li key={s.name}>
                          <button
                            type="button"
                            onClick={() => setOpen(s)}
                            title={s.name}
                            className="flex h-9 w-full items-center gap-2.5 rounded-full border border-line-2 bg-base pl-1.5 pr-3 text-left text-sm transition-colors hover:text-fg"
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = l.color)}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                          >
                            <span className="size-6 shrink-0 rounded-full bg-surface p-1 text-[9px] text-fg-3">
                              <Logo skill={s} className="size-full" />
                            </span>
                            <span className="min-w-0 truncate">{s.name}</span>
                          </button>
                        </li>
                      ))}
                      {list.length === 0 && <li className="text-sm text-fg-3">Nothing here yet.</li>}
                    </ul>
                    {list.length > LEVEL_MAX && (
                      <MoreButton
                        open={expanded.has(`l${l.key}`)}
                        hidden={list.length - LEVEL_MAX}
                        onClick={() => toggleMore(`l${l.key}`)}
                      />
                    )}
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6 · Proof */}
      <section className="section screen theme-orange border-t-0" aria-labelledby="proof">
        <div className="wrap flex flex-col gap-12">
          {certs.length > 0 && (
            <Reveal className="flex flex-col gap-8">
              <SectionHeader
                id="proof"
                label="Proof"
                title="Backed by"
                soft={`${certs.length} certifications`}
                action={
                  <Button to="/certifications" variant="secondary">
                    All certifications
                  </Button>
                }
              />
              <ul className="flex flex-wrap gap-3">
                {[...new Map(certs.map((c) => [c.issuer, c])).values()].slice(0, 12).map((c) => (
                  <li key={c.issuer}>
                    <span className="inline-flex h-12 items-center gap-3 rounded-full border border-line-2 bg-surface/50 pl-1.5 pr-4 text-sm text-fg-2">
                      <Mark src={c.issuer_logo} label={c.issuer} className="size-9 rounded-full" />
                      {c.issuer}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          <Reveal className="flex flex-col items-start gap-6 rounded-[28px] bg-gradient-to-br from-accent to-[#ff8a3d] p-8 text-[rgb(17_17_19)] md:flex-row md:items-center md:justify-between md:p-12">
            <h2 className="text-display-m font-medium">
              Need this stack <span className="font-light opacity-70">on your team?</span>
            </h2>
            <Link
              to="/contact"
              className="inline-flex h-[52px] shrink-0 items-center gap-2.5 rounded-full bg-[rgb(17_17_19)] px-6 text-[15px] font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              Let’s talk <ArrowUpRight aria-hidden className="size-[18px]" />
            </Link>
          </Reveal>
        </div>
      </section>

      {open && <SkillPanel skill={open} usage={usage.get(skillKey(open.name))} onClose={close} />}
    </Layout>
  );
};

export default SkillsPage;
