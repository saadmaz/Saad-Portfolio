import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Award,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCertificates } from "@/hooks/useContent";
import { Certificate } from "@/types";

const PER_PAGE = 3;

const fmt = (d: string | null | undefined) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return d;
  }
};

// border = color for top border + hover ring
// glow   = gradient fill at top of card (dark mode only — opacity reduced in light)
// tag*   = pill colors; lightText = darker shade for readable contrast on white.
// These are Tailwind -800/-900 shades rather than -600/-700: at the chip's actual
// size (10px/600) the -600/-700 shades measured 2.04-3.33:1 against the near-white
// tag background, short of the 4.5:1 WCAG AA floor for text this small.
const ACCENT_VARIANTS = [
  {
    border: "#22d3ee",
    glow: "rgba(34,211,238,0.14)",
    tag: "rgba(34,211,238,0.12)",
    tagBorder: "rgba(34,211,238,0.35)",
    tagText: "#22d3ee",
    lightText: "#155e75",
  },
  {
    border: "#a78bfa",
    glow: "rgba(167,139,250,0.14)",
    tag: "rgba(167,139,250,0.12)",
    tagBorder: "rgba(167,139,250,0.35)",
    tagText: "#a78bfa",
    lightText: "#5b21b6",
  },
  {
    border: "#fb923c",
    glow: "rgba(251,146,60,0.14)",
    tag: "rgba(251,146,60,0.12)",
    tagBorder: "rgba(251,146,60,0.35)",
    tagText: "#fb923c",
    lightText: "#9a3412",
  },
  {
    border: "#34d399",
    glow: "rgba(52,211,153,0.14)",
    tag: "rgba(52,211,153,0.12)",
    tagBorder: "rgba(52,211,153,0.35)",
    tagText: "#34d399",
    lightText: "#065f46",
  },
  {
    border: "#f472b6",
    glow: "rgba(244,114,182,0.14)",
    tag: "rgba(244,114,182,0.12)",
    tagBorder: "rgba(244,114,182,0.35)",
    tagText: "#f472b6",
    lightText: "#9d174d",
  },
  {
    border: "#facc15",
    glow: "rgba(250,204,21,0.14)",
    tag: "rgba(250,204,21,0.12)",
    tagBorder: "rgba(250,204,21,0.35)",
    tagText: "#ca8a04",
    lightText: "#78350f",
  },
  {
    border: "#60a5fa",
    glow: "rgba(96,165,250,0.14)",
    tag: "rgba(96,165,250,0.12)",
    tagBorder: "rgba(96,165,250,0.35)",
    tagText: "#60a5fa",
    lightText: "#1e40af",
  },
  {
    border: "#f87171",
    glow: "rgba(248,113,113,0.14)",
    tag: "rgba(248,113,113,0.12)",
    tagBorder: "rgba(248,113,113,0.35)",
    tagText: "#f87171",
    lightText: "#991b1b",
  },
  {
    border: "#4ade80",
    glow: "rgba(74,222,128,0.14)",
    tag: "rgba(74,222,128,0.12)",
    tagBorder: "rgba(74,222,128,0.35)",
    tagText: "#4ade80",
    lightText: "#166534",
  },
  {
    border: "#e879f9",
    glow: "rgba(232,121,249,0.14)",
    tag: "rgba(232,121,249,0.12)",
    tagBorder: "rgba(232,121,249,0.35)",
    tagText: "#e879f9",
    lightText: "#701a75",
  },
  {
    border: "#38bdf8",
    glow: "rgba(56,189,248,0.14)",
    tag: "rgba(56,189,248,0.12)",
    tagBorder: "rgba(56,189,248,0.35)",
    tagText: "#38bdf8",
    lightText: "#075985",
  },
  {
    border: "#fb7185",
    glow: "rgba(251,113,133,0.14)",
    tag: "rgba(251,113,133,0.12)",
    tagBorder: "rgba(251,113,133,0.35)",
    tagText: "#fb7185",
    lightText: "#9f1239",
  },
  {
    border: "#a3e635",
    glow: "rgba(163,230,53,0.14)",
    tag: "rgba(163,230,53,0.12)",
    tagBorder: "rgba(163,230,53,0.35)",
    tagText: "#65a30d",
    lightText: "#365314",
  },
  {
    border: "#2dd4bf",
    glow: "rgba(45,212,191,0.14)",
    tag: "rgba(45,212,191,0.12)",
    tagBorder: "rgba(45,212,191,0.35)",
    tagText: "#2dd4bf",
    lightText: "#115e59",
  },
  {
    border: "#818cf8",
    glow: "rgba(129,140,248,0.14)",
    tag: "rgba(129,140,248,0.12)",
    tagBorder: "rgba(129,140,248,0.35)",
    tagText: "#818cf8",
    lightText: "#3730a3",
  },
  {
    border: "#f9a8d4",
    glow: "rgba(249,168,212,0.14)",
    tag: "rgba(249,168,212,0.12)",
    tagBorder: "rgba(249,168,212,0.35)",
    tagText: "#ec4899",
    lightText: "#9d174d",
  },
];

function hashId(id: string | number): number {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function useIsDark() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains("dark")));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

export function CertCard({ cert }: { cert: Certificate }) {
  const isDark = useIsDark();
  const navigate = useNavigate();
  const accent = ACCENT_VARIANTS[hashId(cert.id) % ACCENT_VARIANTS.length];
  const tags = cert.tags?.length ? cert.tags : cert.skills || [];
  const tagText = isDark ? accent.tagText : accent.lightText;

  // Card navigates to the detail page on click/Enter; the "View credential" link below is a
  // real external <a>, so the card itself can't also be an <a> (invalid nested-anchor HTML).
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/certifications/${cert.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/certifications/${cert.id}`);
        }
      }}
      className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      <div
        className="relative w-full overflow-hidden rounded-xl border bg-card transition-all duration-300 ease-out group-hover:-translate-y-1"
        style={{
          aspectRatio: "3 / 2",
          borderTop: `2px solid ${accent.border}`,
          borderRight: `1px solid ${isDark ? "hsl(var(--border)/0.5)" : "hsl(var(--border))"}`,
          borderBottom: `1px solid ${isDark ? "hsl(var(--border)/0.5)" : "hsl(var(--border))"}`,
          borderLeft: `1px solid ${isDark ? "hsl(var(--border)/0.5)" : "hsl(var(--border))"}`,
          boxShadow: isDark
            ? "0 2px 12px rgba(0,0,0,0.15)"
            : "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
            ? `0 0 0 1px ${accent.border}55, 0 20px 50px rgba(0,0,0,0.25)`
            : `0 0 0 1.5px ${accent.border}66, 0 8px 30px rgba(0,0,0,0.1)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
            ? "0 2px 12px rgba(0,0,0,0.15)"
            : "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)";
        }}
      >
        {/* Top glow — visible in dark, very subtle in light */}
        <div
          className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${accent.glow}, transparent)`,
            opacity: isDark ? 1 : 0.4,
          }}
        />

        <div className="absolute inset-0 flex flex-col p-5">
          {/* Issuer row */}
          <div className="flex items-center gap-2.5">
            <div
              className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center overflow-hidden ${isDark ? "bg-background/50 border-border/70" : "bg-muted/60 border-border"}`}
            >
              {cert.issuer_logo ? (
                <img
                  src={cert.issuer_logo}
                  alt={cert.issuer}
                  loading="lazy"
                  decoding="async"
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <Award className="w-4 h-4" style={{ color: accent.border }} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-muted-foreground truncate leading-none mb-1">
                {cert.issuer}
              </p>
              {cert.is_verifiable && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[12px] font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                >
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h4 className="font-display font-bold text-foreground text-[15px] leading-snug line-clamp-2 transition-colors duration-200 my-3">
            <span
              className="group-hover:text-[var(--accent-col)] transition-colors duration-200"
              style={{ "--accent-col": accent.border } as React.CSSProperties}
            >
              {cert.title}
            </span>
          </h4>

          {/* Footer */}
          <div className="mt-auto space-y-2.5">
            {/* Dates */}
            <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 shrink-0" style={{ color: accent.border }} />
                {fmt(cert.issue_date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0 opacity-50" />
                {cert.does_not_expire ? "No Expiry" : fmt(cert.expiry_date) || "No Expiry"}
              </span>
            </div>

            {/* Tags + View — single row, no wrap */}
            <div
              className={`flex items-center gap-1.5 overflow-hidden pt-2.5 border-t`}
              style={{ borderColor: isDark ? "hsl(var(--border)/0.4)" : "hsl(var(--border))" }}
            >
              {tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="shrink-0 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap"
                  style={{
                    background: accent.tag,
                    border: `1px solid ${accent.tagBorder}`,
                    color: tagText,
                  }}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[12px] font-semibold text-muted-foreground bg-muted whitespace-nowrap">
                  +{tags.length - 2}
                </span>
              )}
              <div className="ml-auto shrink-0">
                {cert.credential_url ? (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold hover:underline whitespace-nowrap"
                    style={{ color: accent.border }}
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[12px] font-semibold whitespace-nowrap"
                    style={{ color: accent.border }}
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificatesPreview() {
  const { data: certificates, isLoading } = useCertificates();
  const [page, setPage] = useState(0);

  const sorted = [...(certificates || [])].sort(
    (a, b) => new Date(b.issue_date || 0).getTime() - new Date(a.issue_date || 0).getTime(),
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const visible = sorted.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  if (isLoading) {
    return (
      <section className="py-20 bg-secondary/20">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full rounded-xl bg-card animate-pulse"
                style={{ aspectRatio: "3/2" }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="credentials-heading" className="py-20 bg-secondary/20">
      <div className="section-container">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="section-title">Credentials</span>
            {sorted.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[12px] font-bold border border-accent/25">
                {sorted.length} total
              </span>
            )}
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2
                id="credentials-heading"
                className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2"
              >
                Licenses &amp; Certifications
              </h2>
              <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
                Industry-recognized credentials validating expertise across cloud, development, and data
                engineering.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Previous"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center transition-all hover:border-accent/60 hover:text-accent hover:bg-accent/5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground tabular-nums min-w-[52px] text-center">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Next"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center transition-all hover:border-accent/60 hover:text-accent hover:bg-accent/5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link
                to="/certifications"
                className="ml-2 inline-flex items-center gap-2 px-5 py-2 bg-accent text-accent-foreground rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                See All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </m.div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <m.div
            key={page}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {visible.map((cert: Certificate, i: number) => (
              <m.div
                key={cert.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
              >
                <CertCard cert={cert} />
              </m.div>
            ))}
            {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
              <div key={`pad-${i}`} style={{ aspectRatio: "3/2" }} />
            ))}
          </m.div>
        </AnimatePresence>

        {/* Dot pagination */}
        {totalPages > 1 && totalPages <= 10 && (
          <div className="flex items-center justify-center gap-1.5 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
                style={{
                  width: i === page ? 22 : 7,
                  height: 7,
                  background: i === page ? "hsl(var(--accent))" : "hsl(var(--border))",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
