import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Calendar, Building, MapPin, ExternalLink, Grid, List, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExperience } from "@/shared/hooks/useCommon";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

export function ExperienceSection() {
  const { data: experiences, isLoading } = useExperience();
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  if (isLoading) {
    return (
      <section className="section-padding bg-background">
        <div className="section-container text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Reliving the journey...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="section-container">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-left max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Career Path</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Work <span className="text-primary italic">Experience</span>
            </h2>
            <p className="text-muted-foreground/80 md:text-lg leading-relaxed font-medium">
              A journey through the organizations and roles that have shaped my 
              professional growth and expertise.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* VIEW TOGGLE */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center p-1 bg-secondary/50 backdrop-blur-sm border rounded-xl shadow-sm"
            >
              <button
                onClick={() => setViewMode('detailed')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  viewMode === 'detailed' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <Grid className="w-3.5 h-3.5" />
                Detailed
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  viewMode === 'compact' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <List className="w-4 h-4" />
                Condensed
              </button>
            </motion.div>

            <Button asChild variant="ghost" className="text-accent hover:text-accent/80 hover:bg-accent/10 gap-2 h-11 px-6 font-bold uppercase tracking-widest text-[10px]">
              <Link to="/experience">
                Full Resume
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Experience Grid/List */}
        <motion.div 
          layout
          className={cn(
            "grid gap-6",
            viewMode === 'detailed' ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"
          )}
        >
          <AnimatePresence mode="popLayout">
            {experiences?.map((exp, index) => (
              <motion.div
                key={exp.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                {viewMode === 'detailed' ? (
                  <div className="bg-card/40 border border-border/50 rounded-2xl p-6 md:p-10 transition-all duration-500 hover:border-accent/30 hover:bg-card/60 group">
                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                      {/* Left: Branding & Role */}
                      <div className="md:w-1/3 space-y-6">
                        <div className="inline-flex w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-black/20 border border-border p-3 shadow-sm group-hover:border-accent/50 transition-colors">
                          {exp.companyLogo ? (
                            <img src={exp.companyLogo} alt={exp.company} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-accent/10 rounded-xl">
                              <Building className="w-8 h-8 text-accent" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-display font-bold group-hover:text-primary transition-colors tracking-tight">
                            {exp.position}
                          </h3>
                          <p className="text-muted-foreground font-semibold mt-1">@ {exp.company}</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            <Calendar className="w-3.5 h-3.5" />
                            {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
                          </div>
                          {exp.location && (
                            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                              <MapPin className="w-3.5 h-3.5" />
                              {exp.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Impact & Tools */}
                      <div className="md:w-2/3 space-y-6 md:pt-2">
                        <p className="text-muted-foreground md:text-lg leading-relaxed font-medium">
                          {exp.description}
                        </p>
                        
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div className="space-y-3">
                            {exp.responsibilities.map((item, i) => (
                              <div key={i} className="flex gap-4">
                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 group-hover:scale-125 transition-transform" />
                                <p className="text-sm font-medium text-foreground/80 leading-relaxed">{item}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-4">
                          {exp.technologies?.map((tech) => (
                            <span key={tech} className="px-3 py-1 rounded-full bg-secondary/80 border border-border/50 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground group-hover:text-foreground transition-colors">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card/40 border border-border/50 rounded-2xl p-6 h-full flex flex-col transition-all duration-500 hover:border-accent/30 hover:bg-card/60">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-black/20 border border-border p-2">
                        {exp.companyLogo ? (
                          <img src={exp.companyLogo} alt={exp.company} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-accent/5 rounded-lg">
                            <Building className="w-5 h-5 text-accent" />
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">
                        {exp.isCurrent ? "Active" : "Completed"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <h3 className="text-base font-bold truncate group-hover:text-primary transition-colors">
                        {exp.position}
                      </h3>
                      <p className="text-xs font-semibold text-muted-foreground">@ {exp.company}</p>
                    </div>

                    <p className="text-xs text-muted-foreground/80 line-clamp-3 mb-6 font-medium leading-relaxed flex-1">
                      {exp.description}
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 pt-4 border-t border-border/40">
                      <span>{exp.startDate.split(' ')[1]}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
