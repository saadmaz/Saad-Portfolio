import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Award, ExternalLink, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCertificates } from "@/shared/hooks/useCommon";
import { Certificate } from "@/types";

const CARDS_PER_PAGE = 3;

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export function CertificatesPreview() {
  const { data: certificates, isLoading } = useCertificates();
  const [page, setPage] = useState(0);

  const sorted = [...(certificates || [])].sort((a, b) => {
    const da = a.issue_date ? new Date(a.issue_date) : new Date(0);
    const db = b.issue_date ? new Date(b.issue_date) : new Date(0);
    return db.getTime() - da.getTime();
  });

  const totalPages = Math.ceil(sorted.length / CARDS_PER_PAGE);
  const visible = sorted.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="section-container text-center text-muted-foreground">Loading certificates...</div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="section-container">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="section-title">Credentials</span>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Licenses & Certifications
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Industry-recognized credentials validating my expertise across cloud,
                development, and data engineering.
              </p>
            </div>

            {/* Controls: arrows + see all */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={prev}
                disabled={page === 0}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent/50 hover:text-accent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent/50 hover:text-accent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link
                to="/certifications"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-full font-semibold text-sm shadow-sm hover:opacity-95 transition"
              >
                See All Certificates
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 3-card grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
          >
            {visible.map((cert: Certificate) => (
              <Link key={cert.id} to={`/certifications/${cert.id}`} className="group block" style={{ height: 220 }}>
                <div
                  className="relative h-full overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-px"
                  style={{
                    background: "var(--card)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderLeft: "3px solid #0d9488",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  {/* ROW 1 — Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    {/* Logo 40×40 */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        minWidth: 40,
                        borderRadius: 8,
                        background: "#0a66c2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {cert.issuer_logo ? (
                        <img
                          src={cert.issuer_logo}
                          alt={cert.issuer}
                          style={{ width: 26, height: 26, objectFit: "contain", filter: "brightness(0) invert(1)" }}
                        />
                      ) : (
                        <Award style={{ width: 20, height: 20, color: "#fff" }} />
                      )}
                    </div>

                    {/* Title + org stack */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        className="group-hover:text-accent transition-colors duration-150"
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          lineHeight: 1.35,
                          color: "var(--foreground)",
                          marginBottom: 3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {cert.title}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--muted-foreground)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cert.issuer}
                        </span>
                        {cert.is_verifiable && (
                          <span
                            style={{
                              flexShrink: 0,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#4ade80",
                              background: "rgba(22,163,74,0.15)",
                              borderRadius: 20,
                              padding: "2px 8px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ROW 2 — Divider */}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 8 }} />

                  {/* ROW 3 — Description */}
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      lineHeight: 1.5,
                      marginBottom: 8,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {cert.description}
                  </p>

                  {/* ROW 4 — Tags */}
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "nowrap",
                      overflow: "hidden",
                      maxHeight: 22,
                      marginBottom: 8,
                    }}
                  >
                    {(cert.tags?.length ? cert.tags : cert.skills || []).map((tag: string, i: number) => (
                      <span
                        key={i}
                        style={{
                          flexShrink: 0,
                          fontSize: 10,
                          fontWeight: 500,
                          color: "#2dd4bf",
                          background: "rgba(13,148,136,0.12)",
                          borderRadius: 20,
                          padding: "2px 9px",
                          whiteSpace: "nowrap",
                          lineHeight: "16px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* ROW 5 — Footer (pinned to bottom) */}
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 10,
                      borderTop: "1px solid rgba(255,255,255,0.07)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--muted-foreground)" }}>
                      <Calendar style={{ width: 11, height: 11 }} />
                      <span>{formatDate(cert.issue_date)}</span>
                    </div>
                    {cert.credential_url && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(cert.credential_url, "_blank"); }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#fff",
                          background: "#0a66c2",
                          borderRadius: 20,
                          padding: "4px 12px",
                          border: "none",
                          cursor: "pointer",
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        Verify <ExternalLink style={{ width: 10, height: 10 }} />
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {/* Fill empty slots if last page has < 3 cards */}
            {visible.length < CARDS_PER_PAGE &&
              Array.from({ length: CARDS_PER_PAGE - visible.length }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: 220 }} />
              ))}
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  width: i === page ? 20 : 8,
                  height: 8,
                  borderRadius: 20,
                  background: i === page ? "#0d9488" : "rgba(255,255,255,0.2)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
