import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui";
import { Mark } from "@/components/cards";
import { companyPeriod, type Company } from "@/lib/experience";
import { roadPath, type Point } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { resizedUrl } from "@/lib/images";

const pad = (n: number) => String(n).padStart(2, "0");

/** What sits on the road: the 3D illustration when uploaded, else the logo as a raised tile. */
function Stop({ company }: { company: Company }) {
  if (company.illustration)
    return (
      <img
        src={resizedUrl(company.illustration, 480)}
        alt=""
        loading="lazy"
        className="size-full object-contain drop-shadow-[0_24px_28px_rgb(0_0_0/0.55)]"
      />
    );
  return (
    <Mark
      src={company.logo}
      label={company.name}
      className="size-[70%] rounded-[24%] border-transparent bg-surface-3 transition-[border-color,box-shadow] duration-300 group-hover/stop:border-accent group-hover/stop:shadow-[0_22px_40px_-12px_rgb(0_0_0/0.75),0_0_0_4px_rgb(255_95_0/0.15),0_0_32px_rgb(255_95_0/0.25)] text-[1.25rem] text-fg md:text-[2.5rem] shadow-[0_22px_40px_-12px_rgb(0_0_0/0.75),inset_0_1px_0_rgb(255_255_255/0.08)]"
    />
  );
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  return (
    <Link
      to={`/experience/${company.slug}`}
      className="group/card block rounded-[22px] border border-line bg-surface/70 p-6 backdrop-blur-sm transition-[border-color,background-color,transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-accent/40 hover:bg-surface hover:shadow-[0_24px_60px_-28px_rgb(0_0_0/0.8)] md:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="label text-accent">{pad(index + 1)}</span>
        <span aria-hidden className="h-px w-8 bg-line-3" />
        <span className="font-mono text-meta text-fg-3">{companyPeriod(company)}</span>
      </div>
      <div className="mt-4 flex items-center gap-3.5">
        <Mark src={company.logo} label={company.name} className="size-11 rounded-[12px]" />
        <h2 className="text-h2 font-medium transition-colors group-hover/card:text-accent">{company.name}</h2>
      </div>
      {company.meta && <p className="mt-2 font-mono text-meta text-fg-3">{company.meta}</p>}
      <ol className="mt-6 flex flex-col gap-5">
        {company.roles.map((r) => (
          <li key={r.title + r.period} className="flex flex-col gap-2 border-l border-line-2 pl-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="text-h4 font-medium">{r.title}</h3>
              <span className="font-mono text-meta text-fg-3">{r.period}</span>
            </div>
            {/* The full story lives on the company page. */}
            {r.description && <p className="line-clamp-2 text-fg-2">{r.description}</p>}
          </li>
        ))}
      </ol>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fg-2 transition-colors group-hover/card:text-accent">
        View details
        <ArrowUpRight
          aria-hidden
          className="size-4 transition-transform duration-200 ease-out group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

/**
 * Experience as a road: stops alternate sides on desktop and the road
 * S-curves through each one, drawing itself in as you scroll. The path is
 * measured from the rendered stops, so it fits any amount of content.
 * On phones the stops share one column and the road runs straight.
 */
export function ExperienceJourney({ companies }: { companies: Company[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const stops = useRef<(HTMLDivElement | null)[]>([]);
  const road = useRef<SVGPathElement>(null);
  const maskId = `road-${useId().replace(/:/g, "")}`;
  const [geo, setGeo] = useState<{ w: number; h: number; d: string } | null>(null);
  const [draw, setDraw] = useState<{ len: number; progress: number; tip: Point | null }>({
    len: 0,
    progress: 1,
    tip: null,
  });

  // Rebuild the road whenever the layout changes size (fonts, images, viewport).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const points = stops.current
        .slice(0, companies.length)
        .filter((s): s is HTMLDivElement => !!s)
        .map((s) => {
          const r = s.getBoundingClientRect();
          return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
        });
      setGeo({ w: box.width, h: box.height, d: roadPath(points, box.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [companies]);

  // Draw progress follows the scroll; reduced motion shows the whole road.
  useEffect(() => {
    const path = road.current;
    const el = wrap.current;
    if (!geo || !path || !el) return;
    const len = path.getTotalLength();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const progress = still
        ? 1
        : Math.min(1, Math.max(0, (window.innerHeight * 0.7 - r.top) / Math.max(1, r.height)));
      const p = path.getPointAtLength(len * progress);
      setDraw({ len, progress, tip: still || progress >= 1 ? null : { x: p.x, y: p.y } });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [geo]);

  const wide = (geo?.w ?? 0) >= 768;
  const width = wide ? 56 : 22;

  return (
    <div ref={wrap} className="relative">
      {geo?.d && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={geo.w}
          height={geo.h}
          viewBox={`0 0 ${geo.w} ${geo.h}`}
        >
          <defs>
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x={-50}
              y={-50}
              width={geo.w + 100}
              height={geo.h + 100}
            >
              <path
                ref={road}
                d={geo.d}
                fill="none"
                stroke="white"
                strokeWidth={width + 40}
                strokeDasharray={draw.len || undefined}
                strokeDashoffset={draw.len ? draw.len * (1 - draw.progress) : undefined}
              />
            </mask>
          </defs>
          {/* Faint track for the part not yet driven. */}
          <path
            d={geo.d}
            fill="none"
            stroke="rgb(var(--ink) / 0.06)"
            strokeWidth={width}
            strokeLinecap="round"
          />
          <g mask={`url(#${maskId})`}>
            {/* Shadow, then the road's side, then the surface: a raised, slightly 3D band. */}
            <path
              d={geo.d}
              transform={`translate(0 ${wide ? 22 : 10})`}
              fill="none"
              stroke="rgb(0 0 0 / 0.35)"
              strokeWidth={width + 6}
              strokeLinecap="round"
            />
            <path
              d={geo.d}
              transform={`translate(0 ${wide ? 10 : 5})`}
              fill="none"
              stroke="rgb(170 58 0)"
              strokeWidth={width}
              strokeLinecap="round"
            />
            <path
              d={geo.d}
              fill="none"
              stroke="rgb(var(--accent))"
              strokeWidth={width}
              strokeLinecap="round"
            />
            {wide && (
              <path
                d={geo.d}
                fill="none"
                stroke="rgb(255 255 255 / 0.55)"
                strokeWidth={2.5}
                strokeDasharray="12 16"
              />
            )}
          </g>
          {draw.tip && (
            <circle
              cx={draw.tip.x}
              cy={draw.tip.y}
              r={wide ? 10 : 6}
              fill="white"
              className="drop-shadow-[0_0_12px_rgb(255_95_0)]"
            />
          )}
        </svg>
      )}

      <ol className="relative flex flex-col gap-14 md:gap-6">
        {companies.map((c, i) => {
          const flip = i % 2 === 1;
          return (
            <li
              key={c.key}
              className="group/stop grid grid-cols-[64px_minmax(0,1fr)] items-start gap-5 md:grid-cols-2 md:items-center md:gap-16"
            >
              <div
                ref={(el) => {
                  stops.current[i] = el;
                }}
                className={cn(
                  "relative flex size-16 items-center justify-center md:size-[220px] md:justify-self-center",
                  flip && "md:order-2",
                )}
              >
                <Stop company={c} />
              </div>
              <Reveal className={cn("min-w-0 md:py-10", flip && "md:order-1")}>
                <CompanyCard company={c} index={i} />
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
