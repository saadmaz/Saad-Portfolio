import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Award, ExternalLink, Calendar, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { dataManager, Certificate } from "@/shared/lib/dataManager";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  platform: string;
  issuer_logo: string;
  issue_date: string;
  expiry_date: string | null;
  does_not_expire: boolean;
  credential_id: string;
  credential_url: string;
  description: string;
  skills: string[];
  category: string;
  type: string;
  tags: string[];
  pdf_document_link: string;
  is_verifiable: boolean;
  is_featured: boolean;
  colour: string;
}

const formatDate = (dateStr: string) => {
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

const CertificationsPage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCerts, setShowAllCerts] = useState(false);

  useEffect(() => {
    dataManager.getCertificates().then((data) => {
      const sorted = [...data].sort((a, b) =>
        new Date(b.issue_date || 0).getTime() - new Date(a.issue_date || 0).getTime()
      );
      setCertificates(sorted);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => [
    "All",
    ...Array.from(new Set(certificates.map((c) => c.category))),
  ], [certificates]);

  const filteredCertificates = certificates.filter((cert) => {
    const matchesCategory = selectedCategory === "All" || cert.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      cert.title.toLowerCase().includes(q) ||
      cert.issuer.toLowerCase().includes(q) ||
      cert.description.toLowerCase().includes(q) ||
      (cert.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const displayedCertificates = showAllCerts
    ? filteredCertificates
    : filteredCertificates.slice(0, 6);

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container" style={{ boxSizing: "border-box", overflowX: "hidden" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="section-title">Credentials</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Licenses & Certificates
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {certificates.length}+ professional certifications earned through continuous learning and industry validation.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                <div className="relative flex-1 lg:flex-none lg:max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search certifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border max-w-xl w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                        selectedCategory === category
                          ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {displayedCertificates.map((cert, index) => (
                    <motion.div
                      key={cert.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className="h-[280px]"
                    >
                      <Link to={`/certifications/${cert.id}`} className="group block h-full">
                        <div className="relative h-full bg-card rounded-xl border border-border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:border-accent/35 hover:-translate-y-px">

                          {/* Left accent stripe — hover only */}
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Card body */}
                          <div className="relative z-10 flex flex-col h-full px-4 pt-4 pb-3.5">

                            {/* Header: logo + title + org + badge */}
                            <div className="flex items-start gap-3 mb-3">
                              {/* Logo */}
                              <div className="w-13 h-13 shrink-0 rounded-xl bg-secondary/50 border border-border/60 flex items-center justify-center overflow-hidden" style={{ width: 52, height: 52 }}>
                                {cert.issuer_logo ? (
                                  <img src={cert.issuer_logo} alt={cert.issuer} className="w-9 h-9 object-contain" />
                                ) : (
                                  <Award className="w-6 h-6 text-accent" />
                                )}
                              </div>

                              {/* Title + org row */}
                              <div className="flex-1 min-w-0 pt-0.5">
                                <h3
                                  className="text-[13.5px] font-bold text-foreground leading-[1.35] mb-1.5 group-hover:text-accent transition-colors duration-200"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {cert.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-muted-foreground truncate">{cert.issuer}</span>
                                  {cert.is_verifiable && (
                                    <span className="flex items-center gap-1 shrink-0 text-[9px] font-bold uppercase tracking-wide text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                      Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border/50 mb-3" />

                            {/* Description */}
                            <div className="relative overflow-hidden mb-3" style={{ maxHeight: "2.6rem" }}>
                              <p className="text-[11.5px] text-muted-foreground leading-[1.5] line-clamp-2">
                                {cert.description}
                              </p>
                              <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-card to-transparent" />
                            </div>

                            {/* Tags — single row, no wrap, overflow clipped */}
                            <div className="flex gap-1.5 overflow-hidden flex-nowrap" style={{ maxHeight: "1.625rem" }}>
                              {(cert.tags?.length ? cert.tags : cert.skills || []).map((item: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="shrink-0 text-[10px] font-medium text-muted-foreground bg-secondary/70 border border-border/60 px-2.5 py-0.5 rounded-full whitespace-nowrap"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>

                            {/* Footer divider — mt-auto pins footer to bottom */}
                            <div className="border-t border-border/50 mt-auto mb-2.5" />

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span>{formatDate(cert.issue_date)}</span>
                              </div>

                              {cert.credential_url && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(cert.credential_url, "_blank");
                                  }}
                                  className="flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 text-[11px] font-semibold px-3.5 py-1.5 rounded-lg transition-all active:scale-95"
                                >
                                  Verify <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Expand/collapse */}
              {filteredCertificates.length > 6 && (
                <div className="mt-12 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllCerts(!showAllCerts)}
                    className="gap-2 px-8 border-accent/20 hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    {showAllCerts ? (
                      <>Collapse List <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Show All {filteredCertificates.length} Certificates <ChevronDown className="w-4 h-4" /></>
                    )}
                  </Button>
                </div>
              )}

              {/* Empty state */}
              {filteredCertificates.length === 0 && (
                <div className="text-center py-24 bg-secondary/10 rounded-3xl border border-dashed border-border mt-10">
                  <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium text-lg">No certifications found.</p>
                  <Button
                    variant="link"
                    onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                    className="text-accent mt-2"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CertificationsPage;
