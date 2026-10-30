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

function SkillGlyph({ skill, className }: { skill: Skill; className?: string }) {
  return (
    <span
      className={cn(
        "label flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line-2 bg-surface-2 text-fg-2",
        className,
      )}
    >
      {skill.icon ? (
        <img src={skill.icon} alt="" className="size-[55%] object-contain" loading="lazy" />
      ) : (
        skill.name.slice(0, 2)
      )}
    </span>
  );
}

/** Level meter whose filled segments sweep in, staggered after the tile itself. */
function LiveMeter({ value, delay }: { value: number; delay: number }) {
  return (
    <span className="inline-flex gap-[3px]" role="img" aria-label={`${value} of 4`}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-1 w-3 overflow-hidden rounded-full bg-line-3">
          {i < value && (
            <span
              className="block h-full origin-left animate-fill-x rounded-full bg-accent"
              style={{ animationDelay: `${delay + i * 80}ms` }}
            />
          )}
        </span>
      ))}
    </span>
  );
}

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
            className="flex items-center gap-2.5 rounded-full border border-line-2 bg-surface py-1.5 pl-1.5 pr-4 text-sm text-fg-2 transition-colors duration-200 hover:border-accent/60 hover:text-fg"
          >
            <SkillGlyph skill={s} className="size-7 rounded-full text-[10px]" />
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
          className="relative overflow-hidden rounded-media border border-line bg-surface p-5 [--x:50%] [--y:0%] md:p-7 lg:min-h-[340px]"
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

          <div className="relative mb-6 flex items-baseline justify-between gap-4">
            <h3 key={group.category} className="animate-rise text-h3 font-medium">
              {group.category}
            </h3>
            <span className="shrink-0 font-mono text-meta text-fg-3">
              {group.skills.length} tool{group.skills.length === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="relative grid gap-2.5 sm:grid-cols-2">
            {group.skills.map((s, i) => {
              const lvl = SKILL_LEVEL[s.level] ?? SKILL_LEVEL.Intermediate;
              const delay = i * 55;
              const years = yearsOf(s);
              return (
                <li
                  key={`${group.category}-${s.name}`}
                  style={{ animationDelay: `${delay}ms` }}
                  className="group/tile flex animate-rise items-center gap-3.5 rounded-card border border-line bg-base/60 p-3.5 transition-[border-color,transform,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-2"
                >
                  <SkillGlyph
                    skill={s}
                    className="size-10 transition-transform duration-300 ease-out group-hover/tile:-rotate-6 group-hover/tile:scale-105"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{s.name}</span>
                    <span className="mt-1.5 flex items-center gap-2 font-mono text-[12px] text-fg-3">
                      <LiveMeter value={lvl.value} delay={delay + 180} />
                      <span className="truncate">{lvl.label}</span>
                      {years && <span className="ml-auto shrink-0">{years}</span>}
                    </span>
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
