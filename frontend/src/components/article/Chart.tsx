/**
 * Bar / line chart for the CMS "Chart" block. The block's HTML carries the
 * data as JSON (data-chart) plus a real <table> fallback; this renders an
 * SVG on top and leaves the table in place, visually hidden, for screen
 * readers. No chart library: the block only needs categorical bars/lines.
 */

import type { ChartData } from "@/lib/chart";

// Categorical order for dark surfaces, validated with the dataviz palette checker
// (lightness band, chroma, colour-blind separation, contrast). Ember leads.
const PALETTE = ["#e5562b", "#2f86d6", "#b8890a", "#9b5fd6"];

const fmt = (n: number) => (Math.abs(n) >= 1000 ? n.toLocaleString("en") : String(Math.round(n * 100) / 100));

export function Chart({ type, data, title }: { type: "bar" | "line"; data: ChartData; title?: string }) {
  const W = 640;
  const H = 300;
  const pad = { top: 16, right: 12, bottom: 44, left: 48 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const all = data.series.flatMap((s) => s.values);
  const max = Math.max(0, ...all);
  const min = Math.min(0, ...all);
  const span = max - min || 1;
  const y = (v: number) => pad.top + innerH - ((v - min) / span) * innerH;
  const band = innerW / data.labels.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + span * t);

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title || "Chart"} className="h-auto w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="rgb(255 255 255 / 0.08)" />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" className="fill-fg-3 font-mono text-[11px]">
              {fmt(t)}
            </text>
          </g>
        ))}
        {data.labels.map((label, i) => (
          <text
            key={label + i}
            x={pad.left + band * i + band / 2}
            y={H - pad.bottom + 18}
            textAnchor="middle"
            className="fill-fg-3 font-mono text-[11px]"
          >
            {label.length > 10 ? `${label.slice(0, 9)}…` : label}
          </text>
        ))}
        {type === "bar"
          ? data.series.map((s, si) => {
              const barW = (band * 0.7) / data.series.length;
              return s.values.map((v, i) => (
                <rect
                  key={`${si}-${i}`}
                  x={pad.left + band * i + band * 0.15 + barW * si}
                  y={Math.min(y(v), y(0))}
                  width={Math.max(1, barW - 2)}
                  height={Math.abs(y(v) - y(0))}
                  rx={3}
                  fill={PALETTE[si % PALETTE.length]}
                >
                  <title>{`${s.name ? `${s.name}, ` : ""}${data.labels[i]}: ${fmt(v)}`}</title>
                </rect>
              ));
            })
          : data.series.map((s, si) => (
              <g key={si}>
                <polyline
                  fill="none"
                  stroke={PALETTE[si % PALETTE.length]}
                  strokeWidth={2}
                  points={s.values.map((v, i) => `${pad.left + band * i + band / 2},${y(v)}`).join(" ")}
                />
                {s.values.map((v, i) => (
                  <circle
                    key={i}
                    cx={pad.left + band * i + band / 2}
                    cy={y(v)}
                    r={3.5}
                    fill={PALETTE[si % PALETTE.length]}
                  >
                    <title>{`${s.name ? `${s.name}, ` : ""}${data.labels[i]}: ${fmt(v)}`}</title>
                  </circle>
                ))}
              </g>
            ))}
      </svg>
      {data.series.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-4 text-meta text-fg-2" aria-hidden>
          {data.series.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
