import { useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, Calendar, ChevronLeft, ChevronRight, Copy, Check, ArrowRight, Clock, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useCertificates } from "@/shared/hooks/useCommon";
import { Certificate } from "@/types";

const PER_PAGE = 3;

const fmt = (d: string | null | undefined) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch { return d; }
};

const ACCENT_VARIANTS = [
  { border: "#22d3ee", glow: "rgba(34,211,238,0.12)",   tag: "rgba(34,211,238,0.15)",   tagBorder: "rgba(34,211,238,0.3)",   tagText: "#22d3ee"  }, // cyan
  { border: "#a78bfa", glow: "rgba(167,139,250,0.12)",  tag: "rgba(167,139,250,0.15)",  tagBorder: "rgba(167,139,250,0.3)",  tagText: "#a78bfa"  }, // violet
  { border: "#fb923c", glow: "rgba(251,146,60,0.12)",   tag: "rgba(251,146,60,0.15)",   tagBorder: "rgba(251,146,60,0.3)",   tagText: "#fb923c"  }, // orange
  { border: "#34d399", glow: "rgba(52,211,153,0.12)",   tag: "rgba(52,211,153,0.15)",   tagBorder: "rgba(52,211,153,0.3)",   tagText: "#34d399"  }, // emerald
  { border: "#f472b6", glow: "rgba(244,114,182,0.12)",  tag: "rgba(244,114,182,0.15)",  tagBorder: "rgba(244,114,182,0.3)",  tagText: "#f472b6"  }, // pink
  { border: "#facc15", glow: "rgba(250,204,21,0.12)",   tag: "rgba(250,204,21,0.15)",   tagBorder: "rgba(250,204,21,0.3)",   tagText: "#facc15"  }, // yellow
  { border: "#60a5fa", glow: "rgba(96,165,250,0.12)",   tag: "rgba(96,165,250,0.15)",   tagBorder: "rgba(96,165,250,0.3)",   tagText: "#60a5fa"  }, // blue
  { border: "#f87171", glow: "rgba(248,113,113,0.12)",  tag: "rgba(248,113,113,0.15)",  tagBorder: "rgba(248,113,113,0.3)",  tagText: "#f87171"  }, // red
  { border: "#4ade80", glow: "rgba(74,222,128,0.12)",   tag: "rgba(74,222,128,0.15)",   tagBorder: "rgba(74,222,128,0.3)",   tagText: "#4ade80"  }, // green
  { border: "#e879f9", glow: "rgba(232,121,249,0.12)",  tag: "rgba(232,121,249,0.15)",  tagBorder: "rgba(232,121,249,0.3)",  tagText: "#e879f9"  }, // fuchsia
  { border: "#38bdf8", glow: "rgba(56,189,248,0.12)",   tag: "rgba(56,189,248,0.15)",   tagBorder: "rgba(56,189,248,0.3)",   tagText: "#38bdf8"  }, // sky
  { border: "#fb7185", glow: "rgba(251,113,133,0.12)",  tag: "rgba(251,113,133,0.15)",  tagBorder: "rgba(251,113,133,0.3)",  tagText: "#fb7185"  }, // rose
  { border: "#a3e635", glow: "rgba(163,230,53,0.12)",   tag: "rgba(163,230,53,0.15)",   tagBorder: "rgba(163,230,53,0.3)",   tagText: "#a3e635"  }, // lime
  { border: "#2dd4bf", glow: "rgba(45,212,191,0.12)",   tag: "rgba(45,212,191,0.15)",   tagBorder: "rgba(45,212,191,0.3)",   tagText: "#2dd4bf"  }, // teal
  { border: "#818cf8", glow: "rgba(129,140,248,0.12)",  tag: "rgba(129,140,248,0.15)",  tagBorder: "rgba(129,140,248,0.3)",  tagText: "#818cf8"  }, // indigo
  { border: "#fda4af", glow: "rgba(253,164,175,0.12)",  tag: "rgba(253,164,175,0.15)",  tagBorder: "rgba(253,164,175,0.3)",  tagText: "#fda4af"  }, // light rose
];

// Hash the cert id to a stable index so colours don't shift on re-render
function hashId(id: string | number): number {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function CertCard({ cert }: { cert: Certificate }) {
  const [copied, setCopied] = useState(false);
  const accent = ACCENT_VARIANTS[hashId(cert.id) % ACCENT_VARIANTS.length];
  const tags = cert.tags?.length ? cert.tags : cert.skills || [];

  const handleCopyId = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cert.credential_id) return;
    navigator.clipboard.writeText(cert.credential_id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cert.credential_id]);

  return (
    <Link to={`/certifications/${cert.id}`} className="group block">
      {/* Certificate aspect ratio: 3/2 (landscape) */}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-2xl"
        style={{
          aspectRatio: "3 / 2",
          borderTop: `2px solid ${accent.border}`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            `0 0 0 1px ${accent.border}55, 0 20px 50px rgba(0,0,0,0.2)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
        }}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${accent.glow}, transparent)` }}
        />

        {/* Inner layout — flex column filling the card */}
        <div className="absolute inset-0 flex flex-col p-5">

          {/* Issuer row */}
          <div className="flex items-center gap-2.5 mb-auto">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-background/50 border border-border/70 flex items-center justify-center overflow-hidden">
              {cert.issuer_logo ? (
                <img src={cert.issuer_logo} alt={cert.issuer} loading="lazy" decoding="async" className="w-6 h-6 object-contain" />
              ) : (
                <Award className="w-4 h-4" style={{ color: accent.border }} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground/60 truncate leading-none mb-1">{cert.issuer}</p>
              {cert.is_verifiable && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Title — centre of the certificate */}
          <h4
            className="font-display font-bold text-foreground text-[15px] leading-snug line-clamp-2 transition-colors duration-200 my-3"
            style={{ color: undefined }}
          >
            <span className="group-hover:text-[var(--accent-col)] transition-colors duration-200"
              style={{ "--accent-col": accent.border } as React.CSSProperties}>
              {cert.title}
            </span>
          </h4>

          {/* Footer */}
          <div className="mt-auto space-y-2.5">
            {/* Date row */}
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
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
            <div className="flex items-center gap-1.5 overflow-hidden">
              {tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                  style={{ background: accent.tag, border: `1px solid ${accent.tagBorder}`, color: accent.tagText }}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold text-muted-foreground bg-muted whitespace-nowrap">
                  +{tags.length - 2}
                </span>
              )}

              {/* View link pushed to right */}
              <div className="ml-auto shrink-0">
                {cert.credential_url ? (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold hover:underline whitespace-nowrap"
                    style={{ color: accent.border }}
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap"
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
    </Link>
  );
}

export function CertificatesPreview() {
  const { data: certificates, isLoading } = useCertificates();
  const [page, setPage] = useState(0);

  const sorted = [...(certificates || [])].sort(
    (a, b) => new Date(b.issue_date || 0).getTime() - new Date(a.issue_date || 0).getTime()
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const visible = sorted.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  if (isLoading) {
    return (
      <section className="py-20 bg-secondary/20">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full rounded-xl bg-card animate-pulse" style={{ aspectRatio: "3/2" }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary/20">
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
              <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-bold border border-accent/25">
                {sorted.length} total
              </span>
            )}
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Licenses &amp; Certifications
              </h2>
              <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
                Industry-recognized credentials validating expertise across cloud, development, and data engineering.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
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
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
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
