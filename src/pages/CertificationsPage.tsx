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
  Layers,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Data import from your central data index
import { certificatesData } from "@/data";

/**
 * INTERFACE: Defined strictly to match your provided JSON keys.
 * This ensures TypeScript knows exactly what 'issue_date' or 'colour' is.
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
  colour: string; // TailWind gradient classes from JSON (e.g. from-orange-500/20)
}

const CertificationsPage = () => {
  // --- STATE ---
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCerts, setShowAllCerts] = useState(false);

  // --- DATA LOADING & NORMALIZATION ---
  useEffect(() => {
    // 1. Ensure the imported data is treated as an array
    const raw = Array.isArray(certificatesData) ? certificatesData : [certificatesData];
    
    // 2. Sort newest first using the 'issue_date' field from your JSON
    const sorted = [...raw].sort((a, b) => {
      const dateA = new Date(a.issue_date || 0).getTime();
      const dateB = new Date(b.issue_date || 0).getTime();
      return dateB - dateA;
    });

    setCertificates(sorted as Certificate[]);
    setLoading(false);
  }, []);

  // --- CATEGORY EXTRACTION ---
  // Pulls unique 'category' strings directly from your JSON objects
  const categories = [
    "All",
    ...Array.from(new Set(certificates.map((cert) => cert.category))),
  ];

  // --- FILTERING LOGIC ---
  const filteredCertificates = certificates.filter((cert) => {
    // Filter by category selected in the UI
    const matchesCategory = selectedCategory === "All" || cert.category === selectedCategory;
    
    // Search across multiple fields: Title, Issuer, Description, and Tags
    const matchesSearch =
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesCategory && matchesSearch;
  });

  // --- PAGINATION LOGIC ---
  // Shows only 6 cards initially; shows everything if 'Show All' is clicked
  const displayedCertificates = showAllCerts
    ? filteredCertificates
    : filteredCertificates.slice(0, 6);

  return (
    <Layout>
      <section className="section-padding">
        {/* Main Container with safe-zone padding for mobile screens */}
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
              {certificates.length}+ professional certifications and credentials
              earned through continuous learning and industry-standard validation.
            </p>
          </motion.div>

          {/* --- LOADING SPINNER --- */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* --- SEARCH & FILTERS --- */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                {/* Search Input Box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, tag, or issuer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border"
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

                {/* Category Selection Row */}
                <div className="flex flex-wrap gap-2">
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      {/* Navigate to Detail Page on Click */}
                      <a href={`/certifications/${cert.id}`} className="block h-full">
                        <div className="group relative h-full bg-card rounded-2xl border border-border p-6 cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-accent/40 flex flex-col">
                          
                          {/* GRADIENT OVERLAY: Strictly uses 'colour' field from JSON */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${cert.colour} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                          <div className="relative z-10 flex-1 flex flex-col">
                            {/* Card Top: Logo and Date Chip */}
                            <div className="flex items-start justify-between mb-6">
                              <div className="w-12 h-12 rounded-xl bg-background/90 backdrop-blur-md flex items-center justify-center border border-border group-hover:border-accent/30 transition-colors">
                                {cert.issuer_logo ? (
                                  <img src={cert.issuer_logo} alt={cert.issuer} className="w-8 h-8 object-contain" />
                                ) : (
                                  <Award className="w-6 h-6 text-accent" />
                                )}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground bg-secondary/60 px-2 py-1 rounded-md flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {cert.issue_date.split("-")[0]}
                              </span>
                            </div>

                            {/* Card Content: Title and Platform Info */}
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-foreground mb-1 group-hover:text-accent transition-colors line-clamp-2">
                                {cert.title}
                              </h4>
                              <p className="text-sm text-muted-foreground font-medium mb-4">
                                {cert.issuer} • <span className="opacity-60">{cert.platform}</span>
                              </p>
                            </div>

                            {/* Card Footer: Category and Tag chips */}
                            <div className="mt-auto pt-4 border-t border-border/20 flex flex-wrap gap-2">
                              <div className="flex items-center text-[10px] font-black uppercase text-muted-foreground gap-1 bg-secondary/30 px-2 py-1 rounded-md">
                                <Layers className="w-3 h-3" />
                                {cert.category}
                              </div>
                              {cert.tags[0] && (
                                <div className="flex items-center text-[10px] font-black uppercase text-muted-foreground gap-1 bg-secondary/30 px-2 py-1 rounded-md">
                                  <Tag className="w-3 h-3" />
                                  {cert.tags[0]}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* --- PAGINATION TOGGLE --- */}
              {filteredCertificates.length > 6 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center">
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
                </motion.div>
              )}

              {/* --- EMPTY SEARCH STATE --- */}
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