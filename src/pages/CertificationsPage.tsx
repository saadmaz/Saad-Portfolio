import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Award, ExternalLink, Calendar, ChevronDown, ChevronUp, Search, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { dataManager, Certificate } from "@/shared/lib/dataManager";

/**
 * INTERFACE: Matches your JSON structure
 */
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

const CertificationsPage = () => {
  // --- STATE ---
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCerts, setShowAllCerts] = useState(false);

  // --- DATA LOADING ---
  useEffect(() => {
    dataManager.getCertificates().then((data) => {
      const sorted = [...data].sort((a, b) => {
        const dateA = new Date(a.issue_date || 0).getTime();
        const dateB = new Date(b.issue_date || 0).getTime();
        return dateB - dateA;
      });
      setCertificates(sorted);
      setLoading(false);
    });
  }, []);

  // --- CATEGORY EXTRACTION ---
  const categories = useMemo(() => [
    "All",
    ...Array.from(new Set(certificates.map((cert) => cert.category))),
  ], [certificates]);

  // --- FILTERING LOGIC ---
  const filteredCertificates = certificates.filter((cert) => {
    const matchesCategory = selectedCategory === "All" || cert.category === selectedCategory;
    const matchesSearch =
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesCategory && matchesSearch;
  });

  const displayedCertificates = showAllCerts
    ? filteredCertificates
    : filteredCertificates.slice(0, 6);

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container" style={{ boxSizing: 'border-box', overflowX: 'hidden' }}>
          
          {/* --- HEADER --- */}
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
              <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* --- SEARCH & FILTERS --- */}
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

              {/* --- CERTIFICATES GRID --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                  {displayedCertificates.map((cert, index) => (
                    <motion.div
                      key={cert.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link to={`/certifications/${cert.id}`} className="group block h-full">
                        <div className="relative h-full bg-card rounded-2xl border border-border p-5 md:p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-accent/50 flex flex-col">
                          
                          {/* Hover Gradient Overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${cert.colour || 'from-accent/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                          {/* Content Container */}
                          <div className="relative z-10 flex flex-col h-full">
                            
                            {/* Header: Logo + Badge */}
                            <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/30">
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border/40 group-hover:border-accent/50 transition-all duration-300 flex-shrink-0 overflow-hidden shadow-sm">
                                {cert.issuer_logo ? (
                                  <img src={cert.issuer_logo} alt={cert.issuer} className="w-9 h-9 md:w-11 md:h-11 object-contain" />
                                ) : (
                                  <Award className="w-6 h-6 md:w-7 md:h-7 text-accent" />
                                )}
                              </div>

                              {cert.is_verifiable && (
                                <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                                  Verifiable
                                </div>
                              )}
                            </div>

                            {/* Info Section */}
                            <div className="mb-3">
                              <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                                {cert.title}
                              </h3>
                              <p className="text-xs md:text-sm text-muted-foreground font-medium">{cert.issuer}</p>
                            </div>

                            <p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                              {cert.description}
                            </p>

                            {/* Tags/Skills */}
                            <div className="mb-4 flex flex-wrap gap-2">
                              {(cert.skills?.slice(0, 3) || cert.tags?.slice(0, 3) || []).map((item, idx) => (
                                <span key={idx} className="text-[10px] md:text-xs bg-secondary/60 text-secondary-foreground px-2.5 py-1 rounded-full font-medium">
                                  {item}
                                </span>
                              ))}
                            </div>

                            {/* Footer: Date + Verify Button */}
                            <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-border/30">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{cert.issue_date}</span>
                              </div>

                              {cert.credential_url && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(cert.credential_url, '_blank');
                                  }}
                                  className="flex items-center gap-1 bg-foreground/5 hover:bg-accent/20 text-foreground group-hover:text-accent font-bold text-xs px-3 py-1.5 rounded-md transition-all border border-transparent hover:border-accent/30"
                                >
                                  Verify <ExternalLink className="w-3.5 h-3.5" />
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

              {/* --- PAGINATION TOGGLE --- */}
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

              {/* --- EMPTY STATE --- */}
              {filteredCertificates.length === 0 && (
                <div className="text-center py-24 bg-secondary/10 rounded-3xl border border-dashed border-border mt-10">
                  <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium text-lg">No certifications found.</p>
                  <Button variant="link" onClick={() => {setSelectedCategory("All"); setSearchQuery("");}} className="text-accent mt-2">
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