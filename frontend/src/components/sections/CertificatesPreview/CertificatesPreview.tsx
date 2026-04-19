import { motion } from "framer-motion";
import { ArrowRight, Award, ExternalLink, Tag, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCertificates } from "@/shared/hooks/useCommon";
import { Certificate } from "@/types";

export function CertificatesPreview() {
  const { data: certificates, isLoading } = useCertificates();

  const getYear = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).getFullYear().toString();
    } catch {
      return dateStr.split("-")[0] || dateStr;
    }
  };

  const sortedCertificates = [...(certificates || [])].sort((a, b) => {
    const da = a.issue_date ? new Date(a.issue_date) : new Date(0);
    const db = b.issue_date ? new Date(b.issue_date) : new Date(0);
    return db.getTime() - da.getTime();
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="section-container text-center text-muted-foreground">
          Loading certificates...
        </div>
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
            <div className="mt-4 md:mt-0 shrink-0">
              <Link
                to="/certifications"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-full font-semibold shadow-sm hover:opacity-95 transition"
              >
                See All Certificates
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">

              {sortedCertificates.map((cert: Certificate, index: number) => (
                <CarouselItem
                  key={cert.id || index}
                  className="pl-4 basis-full sm:basis-1/2 xl:basis-1/3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    whileHover={{ y: -3, transition: { duration: 0.18 } }}
                  >
                    <Link to={`/certifications/${cert.id}`} className="block">
                      <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all duration-300 relative">

                        {/* Subtle hover gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="relative z-10 flex items-stretch gap-0">

                          {/* Left - logo column */}
                          <div className="flex items-center justify-center w-24 shrink-0 bg-secondary/30 border-r border-border/60 group-hover:border-accent/20 transition-colors duration-300">
                            <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border group-hover:border-accent/30 group-hover:shadow-[0_0_14px_hsl(174_72%_44%_/_0.2)] transition-all duration-300 overflow-hidden">
                              {cert.issuer_logo ? (
                                <img
                                  src={cert.issuer_logo}
                                  alt={cert.issuer}
                                  className="w-9 h-9 object-contain"
                                />
                              ) : (
                                <Award className="w-5 h-5 text-accent" />
                              )}
                            </div>
                          </div>

                          {/* Right - content */}
                          <div className="flex-1 px-5 py-4 min-w-0">

                            {/* Title + year */}
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <h4 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
                                {cert.title}
                              </h4>
                              <span className="shrink-0 text-xs font-medium text-muted-foreground mt-0.5">
                                {getYear(cert.issue_date)}
                              </span>
                            </div>

                            {/* Organisation */}
                            <p className="text-sm text-muted-foreground mb-3 truncate">
                              {cert.issuer}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                              {cert.category && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-tight text-muted-foreground bg-secondary/60 border border-border/60 px-2 py-0.5 rounded-md">
                                  <Layers className="w-2.5 h-2.5" />
                                  {cert.category}
                                </span>
                              )}
                              {cert.tags?.slice(0, 2).map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-tight text-accent/80 bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md"
                                >
                                  <Tag className="w-2.5 h-2.5" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </CarouselItem>
              ))}

              {/* See all card */}
              <CarouselItem className="pl-4 basis-full sm:basis-1/2 xl:basis-1/3">
                <Link to="/certifications" className="block h-full">
                  <div className="group bg-accent/5 border border-accent/25 rounded-xl hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 flex items-center justify-center gap-4 px-6 py-8">
                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors shrink-0">
                      <ExternalLink className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-accent">See All Certificates</p>
                      <p className="text-xs text-muted-foreground mt-0.5">View full credentials list</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-accent ml-auto group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </Link>
              </CarouselItem>

            </CarouselContent>

            <CarouselPrevious className="hidden md:flex -left-4 bg-background border-border hover:bg-secondary" />
            <CarouselNext className="hidden md:flex -right-4 bg-background border-border hover:bg-secondary" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
