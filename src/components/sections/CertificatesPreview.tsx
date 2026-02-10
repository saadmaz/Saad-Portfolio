import { motion } from "framer-motion";
import { ArrowRight, Award, ExternalLink, Calendar, Tag, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { certificatesData } from "@/data";

/**
 * Load and normalize certificate data from JSON
 * Accepts either an array or single object in the JSON file
 */
const certificates = (Array.isArray(certificatesData) ? certificatesData : [certificatesData])
  .map((c: any) => ({
    id: c.id,
    title: c.title,
    issuer: c.issuer,
    issuerLogo: c.issuer_logo || c.issuerLogo || c.issuerLogoUrl,
    issueDate: c.issue_date || c.issueDate || c.issue || null,
    expiryDate: c.expiry_date || c.expiryDate || null,
    credentialId: c.credential_id || c.credentialId || c.credential,
    credentialUrl: c.credential_url || c.credentialUrl || c.credential_url,
    description: c.description,
    tags: c.tags || [],
    category: c.category || "",
    color: c.colour || c.color || "from-accent-500/10 to-accent-400/10",
    pdf: c.pdf_document_link || c.certificatePdfUrl || c.certificate_pdf || null,
    isFeatured: c.is_featured || c.isLatest || c.isLatest,
  }))
  // Sort by most recent issue date first (newest first)
  .sort((a: any, b: any) => {
    const da = a.issueDate ? new Date(a.issueDate) : new Date(0);
    const db = b.issueDate ? new Date(b.issueDate) : new Date(0);
    return db.getTime() - da.getTime();
  });

export function CertificatesPreview() {
  const formatDate = (dateStr: any) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, { month: "short", year: "numeric" });
    } catch (e) {
      return dateStr.split("-")[0] || dateStr;
    }
  };

  return (
    // 'py-16' used instead of 'section-padding' to slightly reduce vertical footprint
    <section className="py-16 bg-secondary/30">
      <div className="section-container">

        {/* --- SECTION HEADER --- */}
        {/* Entrance animation using framer-motion's whileInView to trigger when visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10" // Reduced bottom margin for a tighter layout
        >
          <span className="section-title">Credentials</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Licenses & Certifications
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Industry-recognized credentials validating my expertise across cloud,
                development, and data engineering.
              </p>
            </div>

            {/* SEE ALL CTA in header for more discoverability on large screens */}
            <div className="mt-4 md:mt-0">
              <Link to="/certifications" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-full font-semibold shadow-sm hover:opacity-95 transition">
                See All Certificates
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* --- CERTIFICATES CAROUSEL --- */}
        {/* Wrap in motion.div to provide a smooth fade-in as the section appears */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <Carousel
            opts={{
              align: "start", // Keeps the first item aligned to the left
              loop: true,     // Infinite scrolling for better UX
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {/* Mapping through data to generate individual slides */}
              {certificates.map((cert, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                  {/* Internal card animation: Scale and hover translation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="h-full"
                  >
                    <Link to={`/certifications/${cert.id}`} className="block h-full">
                      {/* The Card: Uses group hover states for the gradient reveal effect */}
                      <div className={`h-full bg-card rounded-xl border border-border p-5 relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:border-accent/30 flex flex-col`}>

                        {/* HOVER GRADIENT: Hidden by default, reveals on group-hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                        {/* CARD CONTENT: Relative z-index to stay above the gradient background */}
                        <div className="relative z-10 flex-1 flex flex-col">
                          {/* Header: Logo and Year */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border group-hover:border-accent/30 transition-colors overflow-hidden">
                              {cert.issuerLogo ? (
                                <img src={cert.issuerLogo} alt={cert.issuer} className="w-10 h-10 object-contain" />
                              ) : (
                                <Award className="w-5 h-5 text-accent" />
                              )}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(cert.issueDate)}
                            </span>
                          </div>

                          {/* CERTIFICATE TEXT */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                              {cert.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">{cert.issuer}</p>
                          </div>

                          {/* Footer: Category & Tag */}
                          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                            <div className="flex items-center text-xs text-muted-foreground gap-1 bg-secondary/30 px-2 py-1 rounded-md">
                              <Layers className="w-3 h-3" />
                              {cert.category}
                            </div>
                            {cert.tags && cert.tags[0] && (
                              <div className="flex items-center text-xs text-muted-foreground gap-1 bg-secondary/30 px-2 py-1 rounded-md">
                                <Tag className="w-3 h-3" />
                                {cert.tags[0]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </CarouselItem>
              ))}

              {/* --- "SEE ALL" CTA CARD --- */}
              {/* Last item in carousel leading users to the full skills/certifications page */}
              <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Link to="/certifications" className="block h-full">
                  <div className="h-full bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/30 p-5 flex flex-col items-center justify-center gap-3 hover:bg-accent/15 transition-all duration-300 min-h-[180px] group">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                      <ExternalLink className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-medium text-accent text-center">See All Certificates</span>
                    {/* Arrow animation to nudge users visually towards the link */}
                    <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </CarouselItem>
            </CarouselContent>

            {/* NAVIGATION CONTROLS: Hidden on mobile to save space, visible from 'md' screens up */}
            <CarouselPrevious className="hidden md:flex -left-4 bg-background border-border hover:bg-secondary" />
            <CarouselNext className="hidden md:flex -right-4 bg-background border-border hover:bg-secondary" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}