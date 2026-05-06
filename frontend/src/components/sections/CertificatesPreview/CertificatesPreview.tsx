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

function CertCard({ cert, index }: { cert: Certificate; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cert.credential_id) return;
    navigator.clipboard.writeText(cert.credential_id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cert.credential_id]);

  const tags = cert.tags?.length ? cert.tags : cert.skills || [];

  const accentColors = [
    "from-cyan-500/20 to-teal-500/10",
    "from-violet-500/20 to-purple-500/10",
    "from-amber-500/20 to-orange-500/10",
  ];
  const accentBorder = [
    "border-t-cyan-500/60",
    "border-t-violet-500/60",
    "border-t-amber-500/60",
  ];
  const gradient = accentColors[index % accentColors.length];
  const topBorder = accentBorder[index % accentBorder.length];

  return (
    <Link to={`/certifications/${cert.id}`} className="group block h-full">
      <div
        className={`relative h-full flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:border-border border-t-2 ${topBorder}`}
        style={{ minHeight: 280 }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 0 0 1px hsl(var(--accent) / 0.3), 0 20px 50px rgba(0,0,0,0.18)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        }}
      >
        {/* Gradient glow at top */}
        <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${gradient} pointer-events-none`} />

        {/* Header */}
        <div className="relative flex items-center gap-3 p-5 pb-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-background/60 border border-border/80 flex items-center justify-center overflow-hidden shadow-sm">
            {cert.issuer_logo ? (
              <img
                src={cert.issuer_logo}
                alt={cert.issuer}
                loading="lazy"
                decoding="async"
                className="w-7 h-7 object-contain"
              />
            ) : (
              <Award className="w-5 h-5 text-accent" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground/70 truncate">{cert.issuer}</p>
            {cert.is_verifiable && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 mt-0.5">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="relative flex-1 flex flex-col px-5 pb-5 gap-4">
          {/* Title */}
          <h4 className="font-display font-bold text-foreground text-[15px] leading-snug line-clamp-3 group-hover:text-accent transition-colors duration-200">
            {cert.title}
          </h4>

          {/* Dates */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-accent/70" />
              {fmt(cert.issue_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
              {cert.does_not_expire ? "No Expiry" : fmt(cert.expiry_date) || "No Expiry"}
            </span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-semibold border border-accent/20"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* View CTA — always visible */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
            {cert.credential_id && (
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-accent transition-colors group/copy"
                title="Copy credential ID"
              >
                <span>{copied ? "Copied!" : "Copy ID"}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
            {cert.credential_url ? (
              <a
                href={cert.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-accent/80 group-hover:text-accent transition-colors">
                Details <ArrowRight className="w-3 h-3" />
              </span>
            )}
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
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-card animate-pulse" />
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

            {/* Nav + See All */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Previous"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center transition-all hover:border-accent/60 hover:text-accent hover:bg-accent/5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground tabular-nums min-w-[60px] text-center">
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
                <CertCard cert={cert} index={i} />
              </m.div>
            ))}
            {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
              <div key={`pad-${i}`} />
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
