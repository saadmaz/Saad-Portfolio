import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { Skill, SkillSet } from "@/types";
import { SKILL_LEVEL } from "@/lib/levels";
import { cn } from "@/lib/utils";

const levelOf = (s: Skill) => SKILL_LEVEL[s.level] ?? SKILL_LEVEL.Intermediate;

// Strongest first, so the filter chips read like a ladder.
const LEVELS = Object.values(SKILL_LEVEL).sort((a, b) => b.value - a.value);

/** Four dots that light up one after another once the section is in view. */
function LevelDots({
  value,
  delay,
  play,
  lit,
}: {
  value: number;
  delay: number;
  play: boolean;
  lit: boolean;
}) {
  return (
    <span className="flex shrink-0 gap-1" role="img" aria-label={`Level ${value} of 4`}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="relative size-1.5 overflow-hidden rounded-full bg-line-3">
          {i < value && (
            <span
              className={cn(
                "absolute inset-0 rounded-full bg-accent transition-[box-shadow] duration-300",
                play ? "animate-rise" : "opacity-0",
                lit && "shadow-[0_0_8px_rgb(255_106_61/0.9)]",
              )}
              style={{ animationDelay: `${delay + i * 90}ms` }}
            />
          )}
        </span>
      ))}
    </span>
  );
}

export function SkillsShowcase({ groups }: { groups: SkillSet[] }) {
  const gridRef = useRef<HTMLUListElement>(null);
  const [inView, setInView] = useState(false);
  const [level, setLevel] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Play the entrance once, when the grid first scrolls into view.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One pointer position for the whole grid; every card's border glow reads it.
  const onGridMove = (e: PointerEvent<HTMLUListElement>) => {
    const grid = gridRef.current;
    if (!grid) return;
    for (const card of grid.querySelectorAll<HTMLElement>("[data-card]")) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  };

  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const g of groups)
      for (const s of g.skills) c.set(levelOf(s).label, (c.get(levelOf(s).label) ?? 0) + 1);
    return c;
  }, [groups]);
  const total = groups.reduce((n, g) => n + g.skills.length, 0);
  const cols = Math.min(groups.length, 5);

  return (
    <div>
      {/* Level filter */}
      <div className="-mx-5 mb-[clamp(16px,3svh,28px)] flex items-center gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:-mx-8 md:px-8 lg:mx-0 lg:px-0">
        <button
          type="button"
          onClick={() => setLevel(null)}
          aria-pressed={level === null}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.06em] transition-colors duration-200",
            level === null ? "border-fg/30 bg-fg/10 text-fg" : "border-line-2 text-fg-3 hover:text-fg-2",
          )}
        >
          All · {total}
        </button>
        {LEVELS.filter((l) => counts.has(l.label)).map((l) => (
          <button
            key={l.label}
            type="button"
            onClick={() => setLevel((cur) => (cur === l.label ? null : l.label))}
            aria-pressed={level === l.label}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.06em] transition-colors duration-200",
              level === l.label
                ? "border-accent/60 bg-accent/10 text-accent"
                : "border-line-2 text-fg-3 hover:border-line-3 hover:text-fg-2",
            )}
          >
            <span className="flex gap-0.5" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn("size-1 rounded-full", i < l.value ? "bg-accent" : "bg-line-3")}
                />
              ))}
            </span>
            {l.label} · {counts.get(l.label)}
          </button>
        ))}
      </div>

      {/* Discipline cards: a swipeable row on phones, one row of columns on wide screens */}
      <ul
        ref={gridRef}
        onPointerMove={onGridMove}
        onPointerLeave={() => setHoveredCard(null)}
        className={cn(
          // Below lg a swipeable row keeps the section to one screen; from lg up, one row of columns.
          "-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0",
          cols <= 3 && "lg:grid-cols-3",
          cols === 4 && "lg:grid-cols-4",
          cols >= 5 && "lg:grid-cols-5",
        )}
      >
        {groups.map((g, gi) => {
          const matches = level ? g.skills.filter((s) => levelOf(s).label === level).length : g.skills.length;
          const best = g.skills.filter((s) => levelOf(s).value === 4).length;
          return (
            <li
              key={g.category}
              data-card
              onPointerEnter={() => setHoveredCard(gi)}
              style={{ animationDelay: `${gi * 90}ms` }}
              className={cn(
                "group/card relative flex w-[82%] shrink-0 snap-start flex-col rounded-media border border-line bg-surface/70 p-5 transition-[filter] duration-500 ease-out [--mx:-999px] [--my:-999px] sm:w-[48%] md:w-[38%] lg:w-auto lg:p-4 xl:p-6",
                inView ? "animate-rise" : "opacity-0",
                // filter, not opacity: the entrance animation holds opacity at 1.
                hoveredCard !== null && hoveredCard !== gi && "md:[filter:brightness(0.62)_saturate(0.7)]",
              )}
            >
              {/* Ember border glow that follows the pointer across the whole grid */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-px hidden rounded-[inherit] p-px [background:radial-gradient(260px_circle_at_var(--mx)_var(--my),rgb(255_106_61/0.85),transparent_65%)] [mask-composite:exclude] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] md:block"
              />
              {/* Soft wash under the pointer */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 [background:radial-gradient(300px_circle_at_var(--mx)_var(--my),rgb(255_106_61/0.07),transparent_70%)] group-hover/card:opacity-100"
              />

              <div className="relative flex items-center justify-between">
                <span className="label text-accent">{String(gi + 1).padStart(2, "0")}</span>
                <span className="label text-fg-3">
                  {level ? `${matches}/${g.skills.length}` : g.skills.length}
                </span>
              </div>

              <h3 className="relative mt-[clamp(16px,3svh,32px)] text-h4 font-medium lg:min-h-[2.6em]">
                {g.category}
              </h3>
              <p className="relative mt-1.5 font-mono text-meta text-fg-3">
                {best > 0 ? `${best} daily driver${best === 1 ? "" : "s"}` : `${g.skills.length} tools`}
              </p>

              <ul className="relative mt-[clamp(14px,2.4svh,24px)] flex flex-col border-t border-line-2 pt-[clamp(6px,1.2svh,12px)]">
                {g.skills.map((s, si) => {
                  const lvl = levelOf(s);
                  const on = !level || lvl.label === level;
                  return (
                    <li
                      key={s.name}
                      title={lvl.label}
                      className={cn(
                        "group/skill flex items-center justify-between gap-3 py-[clamp(5px,1svh,9px)] text-[15px] leading-snug tracking-[-0.01em] lg:text-[14px] xl:text-[15px] transition-[opacity,color] duration-300",
                        on ? "text-fg-2 hover:text-fg" : "text-fg-3 opacity-30",
                        level && on && "text-fg",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        {s.icon && (
                          <img
                            src={s.icon}
                            alt=""
                            className="size-4 shrink-0 object-contain"
                            loading="lazy"
                          />
                        )}
                        <span className="transition-transform duration-300 ease-out group-hover/skill:translate-x-0.5">
                          {s.name}
                        </span>
                      </span>
                      <LevelDots
                        value={lvl.value}
                        delay={gi * 90 + si * 60 + 250}
                        play={inView}
                        lit={!!level && on}
                      />
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
