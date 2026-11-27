import type { PointerEvent } from "react";
import { BadgeCheck } from "lucide-react";
import { Mark } from "@/components/cards";
import { monthYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Certificate } from "@/types";

const typeLabel = (t?: string) =>
  !t
    ? "Certificate"
    : t.toLowerCase() === "course"
      ? "Course certificate"
      : t.replace(/\b\w/g, (m) => m.toUpperCase());

/**
 * A certificate drawn as paper: cream face, issuer logo, orange seal and a
 * thin inner border. Tilts toward the pointer unless `still`.
 */
export function CertPaper({
  cert,
  color = "#ff5f00",
  still,
  className,
}: {
  cert: Certificate;
  color?: string;
  still?: boolean;
  className?: string;
}) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (still) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg)`;
  };
  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
      className={cn(
        "relative overflow-hidden rounded-[18px] bg-[#fbf7f0] p-2.5 text-[#1c1a17] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)] transition-transform duration-200 ease-out motion-reduce:transform-none",
        className,
      )}
    >
      <div className="relative flex h-full flex-col gap-5 rounded-[12px] border border-[#1c1a17]/15 p-5 md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_100%_0%,var(--c),transparent_45%)]"
          style={{ ["--c" as string]: `${color}22` }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <Mark
            src={cert.issuer_logo}
            label={cert.issuer}
            className="size-10 rounded-[10px] border-[#1c1a17]/10 bg-white text-[#1c1a17]"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#1c1a17]/55">
            {typeLabel(cert.type)}
          </span>
        </div>
        <div className="relative flex flex-1 flex-col gap-2">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.12em]"
            style={{ color: `color-mix(in srgb, ${color} 58%, #1c1a17)` }}
          >
            {cert.category || cert.issuer}
          </span>
          <h3 className="text-balance text-h4 font-medium leading-snug md:text-h3">{cert.title}</h3>
        </div>
        <div className="relative flex items-end justify-between gap-4 border-t border-dashed border-[#1c1a17]/20 pt-4">
          <span className="flex flex-col gap-0.5 text-sm">
            <span className="text-[#1c1a17]/55">Issued by</span>
            <span className="font-medium">{cert.issuer}</span>
            {cert.issue_date && (
              <span className="font-mono text-[12px] text-[#1c1a17]/55">{monthYear(cert.issue_date)}</span>
            )}
          </span>
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full text-white shadow-[inset_0_0_0_3px_rgb(255_255_255/0.35)]"
            style={{ background: color }}
          >
            <BadgeCheck className="size-7" />
          </span>
        </div>
      </div>
    </div>
  );
}
