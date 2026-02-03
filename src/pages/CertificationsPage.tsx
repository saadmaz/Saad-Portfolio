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
  X
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
              {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
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
                      {/* 
                        CERTIFICATE CARD WRAPPER:
                        Click this entire card to navigate to detail page with PDF
                      */}
                      <a href={`/certifications/${cert.id}`} className="group block h-full relative">
                        <div className="group relative h-full bg-card rounded-2xl border border-border p-5 md:p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-accent/50 flex flex-col">
                          
                          {/* 
                            HOVER GRADIENT OVERLAY:
                            Subtle gradient background that appears on hover.
                            Uses the 'colour' field directly from JSON (e.g., 'from-orange-500/20 to-amber-500/20')
                          */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${cert.colour} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                          {/* Content container - stays above gradient overlay */}
                          <div className="relative z-10 flex flex-col h-full">
                            
                            {/* 
                              HEADER SECTION: Issuer Logo + Verifiable Badge
                              Logo on left (circular), badge on right (only if is_verifiable = true)
                            */}
                            <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/30">
                              
                              {/* Issuer Logo Circle */}
                              <div className=\"w-14 h-14 md:w-16 md:h-16 rounded-full bg-background/70 backdrop-blur-md flex items-center justify-center border-2 border-border group-hover:border-accent/50 transition-colors flex-shrink-0\">
                                {cert.issuer_logo ? (
                                  <img src={cert.issuer_logo} alt={cert.issuer} className=\"w-8 h-8 md:w-10 md:h-10 object-contain\" />
                                ) : (
                                  <Award className=\"w-6 h-6 md:w-7 md:h-7 text-accent\" />
                                )}
                              </div>

                              {/* Verifiable Badge - Only show if is_verifiable is true */}
                              {cert.is_verifiable && (
                                <div className=\"flex items-center gap-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap\">
                                  <span className=\"w-1.5 h-1.5 bg-emerald-500 rounded-full\"></span>
                                  Verifiable
                                </div>
                              )}
                            </div>

                            {/* 
                              TITLE SECTION:
                              Shows certification title and issuer name
                            */}
                            <div className=\"mb-3 flex-shrink-0\">
                              <h3 className=\"text-lg md:text-xl font-bold text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors\">
                                {cert.title}
                              </h3>
                              <p className=\"text-xs md:text-sm text-muted-foreground font-medium\">
                                {cert.issuer}
                              </p>
                            </div>

                            {/* 
                              DESCRIPTION SECTION:
                              Short description of what the certification validates.
                              Limited to 3 lines to maintain card height balance
                            */}
                            <p className=\"text-xs md:text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow\">
                              {cert.description}
                            </p>

                            {/* 
                              SKILLS/TAGS SECTION:
                              Displays all skills from the JSON as individual pills.
                              Falls back to tags if skills array is empty.
                              Each pill is responsive with different text sizes on mobile/desktop.
                            */}
                            <div className=\"mb-4 flex flex-wrap gap-2\">
                              {cert.skills && cert.skills.length > 0 ? (
                                cert.skills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className=\"text-[10px] md:text-xs bg-secondary/60 text-secondary-foreground px-2.5 py-1 rounded-full font-medium whitespace-nowrap\"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                cert.tags && cert.tags.length > 0 && (
                                  cert.tags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className=\"text-[10px] md:text-xs bg-secondary/60 text-secondary-foreground px-2.5 py-1 rounded-full font-medium whitespace-nowrap\"
                                    >
                                      {tag}
                                    </span>
                                  ))
                                )
                              )}
                            </div>

                            {/* 
                              FOOTER SECTION: Issue Date + Verify Button
                              - Left side: Issue date from JSON
                              - Right side: External link button to credential verification URL
                              - Uses flexbox to maintain spacing on all screen sizes
                            */}
                            <div className=\"flex items-center justify-between gap-3 mt-auto pt-4 border-t border-border/30\">
                              
                              {/* Issue Date Display */}
                              <div className=\"flex items-center gap-1 text-xs text-muted-foreground\">
                                <Calendar className=\"w-4 h-4\" />
                                <span>Issued {cert.issue_date}</span>
                              </div>

                              {/* Verify Credential Button - Links to external platform */}
                              {cert.credential_url && (
                                <a
                                  href={cert.credential_url}
                                  target=\"_blank\"
                                  rel=\"noopener noreferrer\"
                                  onClick={(e) => e.stopPropagation()}
                                  className=\"flex items-center gap-1 bg-foreground/10 hover:bg-accent/20 text-accent hover:text-accent font-bold text-xs md:text-sm px-3 py-1.5 rounded-md transition-all duration-200\"
                                >
                                  Verify
                                  <ExternalLink className=\"w-3.5 h-3.5 md:w-4 md:h-4\" />
                                </a>
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