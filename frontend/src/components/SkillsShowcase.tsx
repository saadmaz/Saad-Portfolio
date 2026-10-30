import { useEffect, useMemo, useRef, useState } from "react";
import type { Skill, SkillSet } from "@/types";
import { SKILL_LEVEL } from "@/lib/levels";
import { cn } from "@/lib/utils";

const levelOf = (s: Skill) => SKILL_LEVEL[s.level] ?? SKILL_LEVEL.Intermediate;

// Strongest band first.
const BANDS = Object.values(SKILL_LEVEL).sort((a, b) => b.value - a.value);

// Chip treatment per band: strength reads at a glance without a legend.
const CHIP: Record<number, string> = {
  4: "border-accent/45 bg-accent/[0.12] text-fg",
  3: "border-line-3 bg-surface-2 text-fg",
  2: "border-line-2 bg-surface text-fg-2",
  1: "border-dashed border-line-3 text-fg-3",
};

interface Entry {
  skill: Skill;
  category: string;
}

function Dots({ value }: { value: number }) {
  return (
    <span className="flex gap-[3px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={cn("size-1.5 rounded-full", i < value ? "bg-accent" : "bg-line-3")} />
      ))}
    </span>
  );
}

function Marquee({ items, reverse }: { items: Entry[]; reverse?: boolean }) {
  if (items.length === 0) return null;
  // Two copies so the -50% loop is seamless.
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <ul
        className={cn(
          "flex w-max animate-marquee items-center gap-10 group-hover/marquee:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse] [animation-duration:64s]",
        )}
      >
        {loop.map(({ skill }, i) => (
          <li
            key={`${skill.name}-${i}`}
            className="flex items-center gap-3 whitespace-nowrap text-[clamp(1.25rem,2.4vw,1.75rem)] font-medium tracking-[-0.02em] text-fg-3 transition-colors duration-300 hover:text-fg"
          >
            {skill.icon ? (
              <img src={skill.icon} alt="" className="size-6 object-contain opacity-80" loading="lazy" />
            ) : (
              <span className="size-1.5 rounded-full bg-accent/70" />
            )}
            {skill.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillsShowcase({ groups }: { groups: SkillSet[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  // Play the entrance once, when the ladder first scrolls into view.
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
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const entries = useMemo<Entry[]>(
    () => groups.flatMap((g) => g.skills.map((skill) => ({ skill, category: g.category }))),
    [groups],
  );
  const bands = BANDS.map((level) => ({
    level,
    items: entries.filter((e) => levelOf(e.skill).value === level.value),
  })).filter((b) => b.items.length > 0);

  const rowA = entries.filter((_, i) => i % 2 === 0);
  const rowB = entries.filter((_, i) => i % 2 === 1);
  const tabs = [
    { category: null as string | null, count: entries.length },
    ...groups.map((g) => ({ category: g.category, count: g.skills.length })),
  ];
  let chipIndex = 0;

  return (
    <div ref={ref}>
      {/* Discipline spotlight */}
      <div
        role="group"
        aria-label="Highlight a discipline"
        className="-mx-5 mb-[clamp(14px,2.6svh,24px)] flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:-mx-8 md:px-8 lg:mx-0 lg:flex-wrap lg:px-0"
      >
        {tabs.map(({ category, count }) => {
          const active = focus === category;
          return (
            <button
              key={category ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => setFocus(category)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium tracking-[-0.01em] transition-colors duration-200",
                active
                  ? "border-fg bg-fg text-fg-inverse"
                  : "border-line-2 text-fg-2 hover:border-line-3 hover:text-fg",
              )}
            >
              {category ?? "Everything"}
              <span className={cn("font-mono text-[12px]", active ? "text-fg-inverse/60" : "text-fg-3")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* The ladder: each band is a proficiency level, strongest on top */}
      <div className="overflow-hidden rounded-media border border-line bg-surface/60">
        {bands.map(({ level, items }, bi) => (
          <div
            key={level.label}
            className={cn(
              "grid gap-3 border-line px-5 py-[clamp(14px,2.4svh,22px)] md:grid-cols-[200px_minmax(0,1fr)] md:items-center md:gap-6 md:px-7",
              bi > 0 && "border-t",
            )}
          >
            <div
              className={cn("flex items-center gap-3", inView ? "animate-rise" : "opacity-0")}
              style={{ animationDelay: `${bi * 120}ms` }}
            >
              <Dots value={level.value} />
              <span className={cn("label", level.value === 4 ? "text-accent" : "text-fg-2")}>
                {level.label}
              </span>
              <span className="font-mono text-[12px] text-fg-3">{items.length}</span>
            </div>
            {/* One swipeable row per band on phones keeps the ladder to one screen; wraps from md up. */}
            <ul className="-mr-5 flex gap-2 overflow-x-auto pr-5 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] md:mr-0 md:flex-wrap md:overflow-visible md:pr-0 md:[mask-image:none]">
              {items.map(({ skill, category }) => {
                const dim = focus !== null && category !== focus;
                const delay = 160 + bi * 120 + chipIndex++ * 22;
                return (
                  <li
                    key={`${category}-${skill.name}`}
                    className={cn("shrink-0", inView ? "animate-rise" : "opacity-0")}
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    <span
                      title={`${skill.name} · ${category}`}
                      className={cn(
                        "flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[14px] tracking-[-0.01em] transition-[opacity,transform,filter,box-shadow] duration-300 ease-out hover:-translate-y-0.5",
                        CHIP[level.value],
                        dim && "scale-[0.97] opacity-20 grayscale",
                        focus !== null && !dim && "shadow-[0_0_0_1px_rgb(255_106_61/0.35)]",
                      )}
                    >
                      {skill.icon && (
                        <img src={skill.icon} alt="" className="size-4 object-contain" loading="lazy" />
                      )}
                      {skill.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Everything, always moving */}
      <div
        className="group/marquee mt-[clamp(20px,4svh,44px)] flex flex-col gap-[clamp(8px,1.6svh,16px)]"
        aria-hidden
      >
        <Marquee items={rowA} />
        <Marquee items={rowB} reverse />
      </div>
    </div>
  );
}
