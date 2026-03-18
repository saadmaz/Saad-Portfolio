import { motion } from "framer-motion";
import { ArrowUpRight, Award, ExternalLink, Calendar, Tag, Layers, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCertificates } from "@/shared/hooks/useCommon";
import { cn } from "@/shared/lib/utils";

export function CertificatesPreview() {
  const { data: certificates, isLoading } = useCertificates();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, { month: "short", year: "numeric" });
    } catch (e) {
      return dateStr.split("-")[0] || dateStr;
    }
  };

  // Sort by most recent issue date first
  const sortedCertificates = [...(certificates || [])].sort((a, b) => {
    const da = a.issue_date ? new Date(a.issue_date) : new Date(0);
    const db = b.issue_date ? new Date(b.issue_date) : new Date(0);
    return db.getTime() - da.getTime();
  });

  if (isLoading) {
    return (
      <section className="section-padding bg-background/50 backdrop-blur-3xl">
        <div className="section-container text-center py-20">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-primary/20 rounded-full" />
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
              <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
            </div>
            <p className="text-muted-foreground font-display font-medium text-lg animate-pulse tracking-wide">Verifying Credentials...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-b from-accent/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="section-container relative z-10">

        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-left max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Validation</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Licenses & <span className="text-primary italic">Certifications</span>
            </h2>
            <p className="text-muted-foreground/80 md:text-lg leading-relaxed font-medium">
              Industry-standard proofs of proficiency across cloud architecture, 
              full-stack development, and data systems.
            </p>
          </motion.div>

          <Button asChild variant="ghost" className="text-accent hover:text-accent/80 hover:bg-accent/10 gap-2 h-12 px-6 font-bold uppercase tracking-widest text-[10px]">
            <Link to="/certifications">
              View All Credentials
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* --- CERTIFICATES CAROUSEL --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative px-4 md:px-0"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6 py-4">
              {sortedCertificates.map((cert, index) => (
                <CarouselItem key={cert.id || index} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <Link to={`/certifications/${cert.id}`} className="block h-full cursor-pointer">
                      <div className="group h-full bg-card/40 backdrop-blur-xl rounded-3xl border border-border/50 p-8 transition-all duration-500 hover:border-accent/30 hover:bg-card/60 hover:shadow-2xl hover:shadow-accent/5 flex flex-col">
                        
                        <div className="flex items-start justify-between mb-8">
                          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-black/20 border border-border p-3 shadow-sm group-hover:border-accent/50 transition-all duration-500 group-hover:scale-110">
                            {cert.issuer_logo ? (
                              <img src={cert.issuer_logo} alt={cert.issuer} className="w-full h-full object-contain" />
                            ) : (
                              <Award className="w-full h-full text-accent p-1" />
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-3 py-1 bg-secondary/50 rounded-full">
                                <Calendar className="w-3 h-3" />
                                {formatDate(cert.issue_date)}
                            </div>
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary px-2 py-0">
                                Verified
                            </Badge>
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <h4 className="font-display text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {cert.title}
                          </h4>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest group-hover:text-muted-foreground/80 transition-colors">
                            {cert.issuer}
                          </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/40 flex flex-wrap gap-2">
                          <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-foreground/80 bg-secondary/30 px-3 py-1.5 rounded-lg border border-border/20">
                            <Layers className="w-3 h-3 mr-1.5 text-accent" />
                            {cert.category}
                          </div>
                          {cert.tags && cert.tags[0] && (
                            <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-foreground/80 bg-secondary/30 px-3 py-1.5 rounded-lg border border-border/20">
                              <Tag className="w-3 h-3 mr-1.5 text-accent" />
                              {cert.tags[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </CarouselItem>
              ))}

              <CarouselItem className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Link to="/certifications" className="block h-full">
                  <div className="h-full bg-gradient-to-br from-accent/10 to-transparent rounded-3xl border border-accent/20 border-dashed p-8 flex flex-col items-center justify-center gap-6 hover:bg-accent/5 transition-all duration-500 group min-h-[320px]">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-500">
                      <ExternalLink className="w-8 h-8 text-accent" />
                    </div>
                    <div className="text-center">
                        <span className="block font-display text-xl font-bold text-accent mb-1">Full Inventory</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/50 group-hover:text-accent/80 transition-colors">Explorer Profile</span>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            </CarouselContent>

            <div className="flex justify-center gap-4 mt-12 md:static">
                 <CarouselPrevious className="static translate-y-0 h-12 w-12 bg-card/50 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300" />
                 <CarouselNext className="static translate-y-0 h-12 w-12 bg-card/50 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300" />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
