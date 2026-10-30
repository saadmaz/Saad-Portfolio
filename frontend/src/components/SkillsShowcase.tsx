import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Skill, SkillSet } from "@/types";
import { SKILL_LEVEL } from "@/lib/levels";
import { cn } from "@/lib/utils";

const CYCLE_MS = 5000;

const yearsOf = (skill: Skill) => {
  const years = new Date().getFullYear() - Number(skill.startYear);
  if (!skill.startYear || Number.isNaN(years)) return null;
  return years < 1 ? "New" : `${years} yr${years === 1 ? "" : "s"}`;
};

/** Brand icon when the skill has one; nothing otherwise (no fake monograms). */
function SkillIcon({ skill, className }: { skill: Skill; className?: string }) {
  if (!skill.icon) return null;
  return (
    <img src={skill.icon} alt="" className={cn("size-5 shrink-0 object-contain", className)} loading="lazy" />
  );
}

/** Continuous level track (quarters marked) that sweeps in after its row. */
function LevelTrack({ value, delay }: { value: number; delay: number }) {
  return (
    <span
      className="relative block h-1.5 w-full overflow-hidden rounded-full bg-line-2"
      role="img"
      aria-label={`Level ${value} of 4`}
    >
      <span
        className="absolute inset-y-0 left-0 origin-left animate-fill-x rounded-full bg-gradient-to-r from-accent/50 to-accent transition-[filter] duration-300 group-hover/row:brightness-125"
        style={{ width: `${(value / 4) * 100}%`, animationDelay: `${delay}ms`, animationDuration: "900ms" }}
      />
      {[1, 2, 3].map((q) => (
        <span
          key={q}
          className="absolute inset-y-0 w-0.5 bg-surface"
          style={{ left: `calc(${q * 25}% - 1px)` }}
        />
      ))}
    </span>
  );
}

const LEVEL_PLURAL: Record<string, [string, string]> = {
  "Daily driver": ["daily driver", "daily drivers"],
  Proficient: ["proficient", "proficient"],
  Familiar: ["familiar", "familiar"],
  Learning: ["learning", "learning"],
};

/** "3 daily drivers · 1 proficient · 1 learning", strongest first. */
const levelSummary = (skills: Skill[]) => {
  const counts = new Map<string, { n: number; v: number }>();
  for (const sk of skills) {
    const lvl = SKILL_LEVEL[sk.level] ?? SKILL_LEVEL.Intermediate;
    const c = counts.get(lvl.label) ?? { n: 0, v: lvl.value };
    counts.set(lvl.label, { n: c.n + 1, v: lvl.value });
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].v - a[1].v)
    .map(([label, { n }]) => {
      const [one, many] = LEVEL_PLURAL[label] ?? [label.toLowerCase(), label.toLowerCase()];
      return `${n} ${n === 1 ? one : many}`;
    })
    .join(" · ");
};

function Marquee({ skills, reverse }: { skills: Skill[]; reverse?: boolean }) {
  if (skills.length === 0) return null;
  // Two copies so the -50% loop is seamless.
  const loop = [...skills, ...skills];
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <ul
        className={cn(
          "flex w-max animate-marquee gap-3 group-hover/marquee:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse] [animation-duration:62s]",
        )}
      >
        {loop.map((s, i) => (
          <li
            key={`${s.name}-${i}`}
            className="flex items-center gap-2.5 rounded-full border border-line-2 bg-surface px-4 py-2 text-sm text-fg-2 transition-colors duration-200 hover:border-accent/60 hover:text-fg"
          >
            {s.icon ? (
              <SkillIcon skill={s} className="size-4" />
            ) : (
              <span
                className="size-1.5 shrink-0 rounded-full bg-accent"
                style={{
                  opacity: [0.3, 0.5, 0.75, 1][(SKILL_LEVEL[s.level] ?? SKILL_LEVEL.Intermediate).value - 1],
                }}
              />
            )}
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillsShowcase({ groups }: { groups: SkillSet[] }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [userPicked, setUserPicked] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const onChange = () => setReducedMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const autoplay = !userPicked && !reducedMotion && groups.length > 1;
  const running = autoplay && inView && !hovered;

  const select = (i: number, byUser = true) => {
    setActive((i + groups.length) % groups.length);
    elapsed.current = 0;
    if (barRef.current) barRef.current.style.transform = "scaleX(0)";
    if (byUser) setUserPicked(true);
  };

  // Autoplay timer. Writes the progress bar directly each frame (no re-render)
  // and simply stops ticking while paused, so it resumes where it left off.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsed.current += now - last;
      last = now;
      const p = Math.min(1, elapsed.current / CYCLE_MS);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (p >= 1) {
        setActive((a) => (a + 1) % groups.length);
        elapsed.current = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, active, groups.length]);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + groups.length) % groups.length;
    select(next);
    tabRefs.current[next]?.focus();
  };

  // Ember spotlight that follows the pointer across the panel.
  const onPanelMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const all = useMemo(() => {
    const seen = new Set<string>();
    return groups
      .flatMap((g) => g.skills)
      .filter((s) => (seen.has(s.name) ? false : (seen.add(s.name), true)));
  }, [groups]);
  const rowA = all.filter((_, i) => i % 2 === 0);
  const rowB = all.filter((_, i) => i % 2 === 1);

  const group = groups[active] ?? groups[0];

  return (
    <div ref={sectionRef} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-12">
        {/* Disciplines */}
        <div
          role="tablist"
          aria-label="Disciplines"
          aria-orientation="vertical"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-8 md:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {groups.map((g, i) => {
            const selected = i === active;
            return (
              <button
                key={g.category}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`skill-tab-${i}`}
                aria-selected={selected}
                aria-controls="skill-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  "group relative shrink-0 rounded-full border px-4 py-2 text-left text-sm transition-colors duration-300",
                  "lg:flex lg:items-baseline lg:gap-4 lg:rounded-none lg:border-0 lg:border-t lg:border-line-2 lg:py-5 lg:pl-5 lg:pr-0 lg:text-[1rem]",
                  selected
                    ? "border-accent/50 bg-accent/10 text-fg lg:bg-transparent"
                    : "border-line-2 text-fg-3 hover:text-fg-2",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-0 hidden h-full w-0.5 origin-top bg-accent transition-transform duration-500 ease-out lg:block",
                    selected ? "scale-y-100" : "scale-y-0",
                  )}
                />
                <span className={cn("label hidden lg:inline", selected ? "text-accent" : "text-fg-3")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "font-medium transition-[letter-spacing,transform] duration-500 ease-out lg:flex-1 lg:text-h3",
                    selected && "lg:translate-x-1",
                  )}
                >
                  {g.category}
                </span>
                <span className="hidden font-mono text-meta text-fg-3 lg:inline">{g.skills.length}</span>
              </button>
            );
          })}
          <span className="hidden border-t border-line-2 lg:block" aria-hidden />
        </div>

        {/* Skills in the active discipline */}
        <div
          ref={panelRef}
          id="skill-panel"
          role="tabpanel"
          aria-labelledby={`skill-tab-${active}`}
          onPointerMove={onPanelMove}
          className="relative overflow-hidden rounded-media border border-line bg-surface p-5 [--x:50%] [--y:0%] md:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [background:radial-gradient(420px_circle_at_var(--x)_var(--y),rgb(255_106_61/0.10),transparent_65%)]"
            style={{ opacity: hovered ? 1 : 0 }}
          />

          {/* Autoplay progress */}
          <div className="absolute inset-x-0 top-0 h-px bg-line-2" aria-hidden>
            {autoplay && <span ref={barRef} className="block h-full origin-left scale-x-0 bg-accent" />}
          </div>

          <div key={group.category} className="relative mb-5 flex flex-col md:mb-6">
            <div>
              <p className="label animate-rise">
                <span className="text-accent">{String(active + 1).padStart(2, "0")}</span>
                <span className="text-fg-3"> / {String(groups.length).padStart(2, "0")}</span>
              </p>
              <h3 className="mt-3 animate-rise text-h2 font-medium [animation-delay:60ms]">
                {group.category}
              </h3>
            </div>
            <p className="mt-2.5 animate-rise font-mono text-meta text-fg-3 [animation-delay:120ms]">
              {levelSummary(group.skills)}
            </p>
          </div>

          <ul className="relative border-t border-line-2 pt-1">
            {group.skills.map((s, i) => {
              const lvl = SKILL_LEVEL[s.level] ?? SKILL_LEVEL.Intermediate;
              const delay = 140 + i * 70;
              const years = yearsOf(s);
              return (
                <li
                  key={`${group.category}-${s.name}`}
                  style={{ animationDelay: `${delay}ms` }}
                  className="group/row relative -mx-3 grid animate-rise grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 rounded-xl px-3 py-4 after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-line last:after:hidden transition-colors duration-300 hover:bg-surface-2/70 md:grid-cols-[minmax(0,1fr)_minmax(140px,200px)_108px] md:py-[18px]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-3 left-0 w-0.5 origin-center scale-y-0 rounded-full bg-accent transition-transform duration-300 ease-out group-hover/row:scale-y-100"
                  />
                  <span className="flex min-w-0 items-center gap-3 transition-transform duration-300 ease-out group-hover/row:translate-x-1">
                    <SkillIcon skill={s} />
                    <span className="truncate text-[1.0625rem] font-medium tracking-[-0.01em]">{s.name}</span>
                    {years && <span className="shrink-0 font-mono text-[12px] text-fg-3">{years}</span>}
                  </span>
                  <span className="col-span-2 row-start-2 md:col-span-1 md:row-start-auto">
                    <LevelTrack value={lvl.value} delay={delay + 120} />
                  </span>
                  <span
                    className={cn(
                      "text-right font-mono text-[12px] uppercase tracking-[0.06em] transition-colors duration-300",
                      lvl.value === 4 ? "text-accent" : "text-fg-3 group-hover/row:text-fg-2",
                    )}
                  >
                    {lvl.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Everything, always moving */}
      <div className="group/marquee mt-14 flex flex-col gap-3" aria-hidden>
        <Marquee skills={rowA} />
        <Marquee skills={rowB} reverse />
      </div>
    </div>
  );
}
