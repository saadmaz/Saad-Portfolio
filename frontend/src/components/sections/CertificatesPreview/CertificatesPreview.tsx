import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ArrowRight, Award, ExternalLink, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCertificates } from "@/shared/hooks/useCommon";
import { Certificate } from "@/types";

const PER_PAGE = 3;

const fmt = (d: string | null) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return d; }
};

export function CertificatesPreview() {
  const { data: certificates, isLoading } = useCertificates();
  const [page, setPage] = useState(0);

  const sorted = [...(certificates || [])].sort(
    (a, b) => new Date(b.issue_date || 0).getTime() - new Date(a.issue_date || 0).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const visible = sorted.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  if (isLoading) return (
    <section className="py-16 bg-secondary/30">
      <div className="section-container text-center text-muted-foreground">Loading certificates...</div>
    </section>
  );

  return (
    <section className="py-16 bg-secondary/30">
      <div className="section-container">

        {/* ── Header ────────────────────────────────────────────── */}
        <m.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="section-title">Credentials</span>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Licenses & Certifications
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Industry-recognized credentials validating my expertise across cloud, development, and data engineering.
              </p>
            </div>

            {/* Nav controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPage((p: number) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p: number) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link
                to="/certifications"
                className="ml-1 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-full font-semibold text-sm hover:opacity-90 transition"
              >
                See All Certificates <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </m.div>

        {/* ── Cards ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <m.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {visible.map((cert: Certificate) => (
              <Link key={cert.id} to={`/certifications/${cert.id}`} className="group" style={{ display: "block", height: 220 }}>
                <div
                  className="h-full flex flex-col overflow-hidden transition-all duration-250 hover:shadow-lg hover:-translate-y-px"
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderLeft: "3px solid #0d9488",
                    background: "var(--card)",
                  }}
                >
                  {/* Row 1 — logo + title + org */}
                  <div className="flex items-center gap-2.5" style={{ marginBottom: 8 }}>
                    {/* Logo 40×40 */}
                    <div
                      className="shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ width: 40, height: 40, borderRadius: 8, background: "#0a66c2" }}
                    >
                      {cert.issuer_logo
                        ? <img src={cert.issuer_logo} alt="" style={{ width: 26, height: 26, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                        : <Award style={{ width: 20, height: 20, color: "#fff" }} />
                      }
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className="group-hover:text-accent transition-colors duration-150 line-clamp-2"
                        style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, color: "var(--foreground)", marginBottom: 3 }}
                      >
                        {cert.title}
                      </h4>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="truncate" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                          {cert.issuer}
                        </span>
                        {cert.is_verifiable && (
                          <span
                            className="shrink-0 flex items-center gap-1"
                            style={{
                              fontSize: 10, fontWeight: 600, color: "#4ade80",
                              background: "rgba(22,163,74,0.15)", borderRadius: 20,
                              padding: "2px 7px", whiteSpace: "nowrap",
                            }}
                          >
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2 — divider */}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 8 }} />

                  {/* Row 3 — description (fills remaining space, clamps at 3 lines) */}
                  <p
                    className="line-clamp-3"
                    style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.5, flex: 1, overflow: "hidden" }}
                  >
                    {cert.description}
                  </p>

                  {/* Row 4+5 — tags + footer, grouped at bottom */}
                  <div style={{ marginTop: "auto" }}>
                    {/* Tags — single row, no wrap */}
                    <div
                      className="flex overflow-hidden"
                      style={{ gap: 5, flexWrap: "nowrap", maxHeight: 20, marginBottom: 8 }}
                    >
                      {(cert.tags?.length ? cert.tags : cert.skills || []).map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="shrink-0"
                          style={{
                            fontSize: 10, fontWeight: 500,
                            color: "#2dd4bf", background: "rgba(13,148,136,0.12)",
                            borderRadius: 20, padding: "2px 9px",
                            whiteSpace: "nowrap", lineHeight: "14px",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div
                      className="flex items-center justify-between"
                      style={{ paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <div className="flex items-center gap-1.5" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                        <Calendar style={{ width: 11, height: 11 }} />
                        {fmt(cert.issue_date)}
                      </div>
                      {cert.credential_url && (
                        <button
                          onClick={(e: { preventDefault(): void; stopPropagation(): void }) => { e.preventDefault(); e.stopPropagation(); window.open(cert.credential_url, "_blank"); }}
                          className="flex items-center gap-1"
                          style={{
                            fontSize: 10, fontWeight: 600, color: "#fff",
                            background: "#0a66c2", borderRadius: 20,
                            padding: "4px 12px", border: "none", cursor: "pointer",
                          }}
                        >
                          Verify <ExternalLink style={{ width: 10, height: 10 }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Fill empty slots on last page */}
            {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
              <div key={`pad-${i}`} style={{ height: 220 }} />
            ))}
          </m.div>
        </AnimatePresence>

        {/* ── Dot indicators (max 7 visible) ──────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {totalPages <= 7
              ? Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{
                      width: i === page ? 20 : 8, height: 8,
                      borderRadius: 20,
                      background: i === page ? "#0d9488" : "rgba(255,255,255,0.18)",
                      border: "none", cursor: "pointer",
                      transition: "all 0.25s ease", padding: 0,
                    }}
                  />
                ))
              : (
                <span className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
              )
            }
          </div>
        )}

      </div>
    </section>
  );
}
