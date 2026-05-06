import { useState, useEffect, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Award, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dataManager } from "@/shared/lib/dataManager";
import { CertCard } from "@/components/sections/CertificatesPreview";
import { Certificate } from "@/types";

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
      <SEO
        title="Certifications | Saad Mazhar's Professional Credentials"
        description="Browse Saad Mazhar's professional certifications in AI, cybersecurity, cloud computing, data analytics, Flutter, DevOps, and more - earned from Microsoft, LinkedIn Learning, Google, and ISACA."
        url="https://saadmaz.com/certifications"
      />
      <section className="section-padding">
        <div className="section-container">

          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="section-title">Credentials</span>
              {!loading && certificates.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-bold border border-accent/25">
                  {certificates.length} total
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Licenses & Certificates
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Professional certifications earned through continuous learning and industry validation.
            </p>
          </m.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-full rounded-xl bg-card animate-pulse" style={{ aspectRatio: "3/2" }} />
              ))}
            </div>
          ) : (
            <>
              {/* Search */}
              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative max-w-lg mb-6"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by title, issuer, or tag…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-10 h-11 bg-card border-border rounded-xl text-sm w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </m.div>

              {/* Category filters */}
              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mb-10"
              >
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                        selectedCategory === category
                          ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                          : "bg-card border border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {/* Result count */}
                <p className="text-xs text-muted-foreground mt-4">
                  {filteredCertificates.length === certificates.length
                    ? `Showing all ${certificates.length} certifications`
                    : `${filteredCertificates.length} of ${certificates.length} certifications`}
                </p>
              </m.div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {displayedCertificates.map((cert, index) => (
                    <m.div
                      key={cert.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                    >
                      <CertCard cert={cert} />
                    </m.div>
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
