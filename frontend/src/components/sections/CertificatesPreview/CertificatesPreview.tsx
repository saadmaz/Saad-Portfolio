import { useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, Calendar, ChevronLeft, ChevronRight, Copy, Check, ArrowRight, Clock } from "lucide-react";
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

function CertCard({ cert }: { cert: Certificate }) {
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

  return (
    <Link to={`/certifications/${cert.id}`} className="group block h-full">
      <div
        className="relative h-full flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-[5px] group-hover:shadow-xl"
        style={{ minHeight: 260 }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 0 0 1.5px hsl(var(--accent)), 0 16px 40px rgba(0,0,0,0.10)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        }}
      >
        {/* Header area */}
        <div className="flex items-center gap-3 p-4 pb-3 border-b border-border/60">
          {/* Issuer logo */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
            {cert.issuer_logo ? (
              <img
                src={cert.issuer_logo}
                alt={cert.issuer}
                loading="lazy"
                decoding="async"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Award className="w-6 h-6 text-accent" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium truncate">{cert.issuer}</p>
            {cert.is_verifiable && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-4 gap-3">
          {/* Title */}
          <h4 className="font-display font-bold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-[250ms]">
            {cert.title}
          </h4>

          {/* Meta row: dates */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {fmt(cert.issue_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {cert.does_not_expire ? "No Expiration" : fmt(cert.expiry_date) || "No Expiration"}
            </span>
          </div>

          {/* Credential ID — copyable */}
          {cert.credential_id && (
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-accent transition-colors group/copy w-fit"
            >
              <span className="truncate max-w-[180px]">ID: {cert.credential_id}</span>
              <span className="shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity">
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </span>
            </button>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
              {tags.slice(0, 4).map((tag, i) => (
                <span
                  key={i}
                  className="cert-tag transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{ transitionDelay: `${i * 20}ms` }}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 4 && (
                <span className="text-[10px] text-muted-foreground self-center">+{tags.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Footer — "View Credential" fades in on hover */}
        <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
          {cert.credential_url ? (
            <a
              href={cert.credential_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); }}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent hover:underline"
            >
              View Credential <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent">
              View Details <ArrowRight className="w-3 h-3" />
            </span>
          )}
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
      <section className="py-16 bg-secondary/30">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="section-container">

        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="section-title">Credentials</span>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Licenses &amp; Certifications
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Industry-recognized credentials validating expertise across cloud, development, and data engineering.
              </p>
            </div>

            {/* Nav + See All */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Previous"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Next"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link
                to="/certifications"
                className="ml-1 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {visible.map((cert: Certificate, i: number) => (
              <m.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <CertCard cert={cert} />
              </m.div>
            ))}

            {/* Fill empty slots on last page */}
            {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
          </m.div>
        </AnimatePresence>

        {/* Dot indicators */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {totalPages <= 7
              ? Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
                    style={{
                      width: i === page ? 20 : 8,
                      height: 8,
                      background: i === page ? "hsl(var(--accent))" : "hsl(var(--border))",
                    }}
                  />
                ))
              : <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
            }
          </div>
        )}
      </div>
    </section>
  );
}
