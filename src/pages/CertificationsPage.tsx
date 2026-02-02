import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  Award,
  ExternalLink,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Dialog removed: navigating to detail route instead
import { certificatesData } from "@/data";

interface Certificate {
  id: any;
  title: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string | null;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  certificatePdfUrl?: string | null;
  pdf?: string | null;
  isLatest?: boolean;
}

const CertificationsPage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCerts, setShowAllCerts] = useState(false);

  useEffect(() => {
    // Normalize incoming JSON fields and ensure we have an array
    const raw = Array.isArray(certificatesData) ? certificatesData : [certificatesData];
    const normalized = raw.map((c: any) => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      issueDate: c.issue_date || c.issueDate || c.issue || null,
      expiryDate: c.expiry_date || c.expiryDate || null,
      credentialId: c.credential_id || c.credentialId || c.credential || "",
      credentialUrl: c.credential_url || c.credentialUrl || "",
      description: c.description || "",
      certificatePdfUrl: c.pdf_document_link || c.certificatePdfUrl || c.certificatePdfUrl || c.certificatePdfUrl || null,
      isLatest: c.is_featured || c.isLatest || false,
    }));

    // Sort newest first by issueDate
    normalized.sort((a: any, b: any) => {
      const da = a.issueDate ? new Date(a.issueDate) : new Date(0);
      const db = b.issueDate ? new Date(b.issueDate) : new Date(0);
      return db.getTime() - da.getTime();
    });

    setCertificates(normalized);
    setLoading(false);
  }, []);

  // Extract unique categories from certificates
  const categories = [
    "All",
    ...Array.from(
      new Set(
        certificates.map((cert) => {
          // Extract category from issuer or title
          if (cert.issuer.includes("AWS")) return "Cloud";
          if (cert.issuer.includes("Google")) return "Cloud";
          if (cert.issuer.includes("Frontend")) return "Frontend";
          if (cert.issuer.includes("Udemy")) return "Backend";
          return "Other";
        })
      )
    ),
  ];

  const filteredCertificates = certificates.filter((cert) => {
    const certCategory = cert.issuer.includes("AWS")
      ? "Cloud"
      : cert.issuer.includes("Google")
      ? "Cloud"
      : cert.issuer.includes("Frontend")
      ? "Frontend"
      : cert.issuer.includes("Udemy")
      ? "Backend"
      : "Other";

    const matchesCategory =
      selectedCategory === "All" || certCategory === selectedCategory;
    const matchesSearch =
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedCertificates = showAllCerts
    ? filteredCertificates
    : filteredCertificates.slice(0, 6);

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
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
              {certificates.length}+ professional certifications and credentials
              earned through continuous learning and expertise validation.
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <div className="h-12 w-12 border-4 border-accent border-t-transparent rounded-full"></div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          {!loading && (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search certificates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
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
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        selectedCategory === category
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificates Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {displayedCertificates.map((cert, index) => (
                    <motion.div
                      key={cert.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <a href={`/certifications/${cert.id}`} className="block">
                        <div className="bg-card rounded-xl border border-border p-5 card-hover cursor-pointer group hover:border-accent/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                              {cert.title}
                            </h4>
                            <Award className="w-4 h-4 text-muted-foreground shrink-0" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {cert.issuer}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">
                                {cert.description}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2 shrink-0">
                              <Calendar className="w-3 h-3" />
                              {cert.issueDate ? cert.issueDate.split("-")[0] : ""}
                            </span>
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Show More/Less Button */}
              {filteredCertificates.length > 6 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 text-center"
                >
                  <Button
                    variant="outline"
                    onClick={() => setShowAllCerts(!showAllCerts)}
                    className="gap-2"
                  >
                    {showAllCerts ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show All {filteredCertificates.length} Certificates{" "}
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Empty State */}
              {filteredCertificates.length === 0 && (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No certificates found matching your search.
                  </p>
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
