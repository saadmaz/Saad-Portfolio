import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSkills } from "@/shared/hooks/useCommon";
import { cn } from "@/shared/lib/utils";

const levelColors: Record<string, string> = {
    Beginner: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    Intermediate: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    Advance: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    Expert: "text-sky-500 bg-sky-500/10 border-sky-500/20",
};

export function SkillsSection() {
  const { data: skillCategories = [], isLoading } = useSkills();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else if (w < 1280) setVisibleCount(3);
      else setVisibleCount(4);
    };
    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, []);

  const moveNext = useCallback(() => {
    if (skillCategories.length <= visibleCount) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % skillCategories.length);
  }, [skillCategories.length, visibleCount]);

  const movePrev = useCallback(() => {
    if (skillCategories.length <= visibleCount) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + skillCategories.length) % skillCategories.length);
  }, [skillCategories.length, visibleCount]);

  useEffect(() => {
    if (skillCategories.length <= visibleCount) return;
    const timer = setInterval(moveNext, 5000);
    return () => clearInterval(timer);
  }, [moveNext, skillCategories.length, visibleCount]);

  const getVisibleCategories = () => {
    if (skillCategories.length === 0) return [];
    if (skillCategories.length <= visibleCount) {
        return skillCategories.map((data, idx) => ({ data, originalIndex: idx }));
    }
    const items = [];
    for (let i = 0; i < visibleCount; i++) {
        const idx = (currentIndex + i) % skillCategories.length;
        items.push({ data: skillCategories[idx], originalIndex: idx });
    }
    return items;
  };

  if (isLoading) {
    return (
      <section className="section-padding bg-background/50 backdrop-blur-3xl">
        <div className="section-container text-center py-20">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-primary/20 rounded-full" />
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
              <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
            </div>
            <p className="text-muted-foreground font-display font-medium text-lg animate-pulse tracking-wide">Syncing Knowledge Base...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="section-container relative z-10">
        
        {/* Section Header */}
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
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Arsenal</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Technical <span className="text-primary italic">Expertise</span>
            </h2>
            <p className="text-muted-foreground/80 md:text-lg leading-relaxed font-medium">
              A comprehensive breakdown of my digital toolkit, categorized by 
              domain and proficiency levels.
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            {skillCategories.length > visibleCount && (
              <div className="flex items-center gap-2 p-1 bg-secondary/30 backdrop-blur-md rounded-xl border border-border/50">
                <button 
                  onClick={movePrev} 
                  className="p-2.5 rounded-lg bg-background/50 border border-border/50 hover:bg-background hover:text-primary transition-all duration-300 shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={moveNext} 
                  className="p-2.5 rounded-lg bg-background/50 border border-border/50 hover:bg-background hover:text-primary transition-all duration-300 shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            <Button asChild variant="ghost" className="text-accent hover:text-accent/80 hover:bg-accent/10 gap-2 h-12 px-6 font-bold uppercase tracking-widest text-[10px]">
              <Link to="/skills">
                Discover All
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Carousel Content */}
        <div className="relative -mx-4 px-4 h-full min-h-[420px]">
          <div className={cn(
            "grid gap-6 h-full",
            visibleCount === 1 ? "grid-cols-1" : 
            visibleCount === 2 ? "grid-cols-2" : 
            visibleCount === 3 ? "grid-cols-3" : "grid-cols-4"
          )}>
            <AnimatePresence mode="popLayout" initial={false}>
              {getVisibleCategories().map((item, idx) => (
                <motion.div
                  key={`${item.data.category}-${item.originalIndex}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -30 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: idx * 0.05,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="h-full"
                >
                  <div className="bg-card/40 backdrop-blur-xl rounded-3xl border border-border/50 p-8 h-full flex flex-col group transition-all duration-500 hover:border-primary/30 hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                      <h3 className="font-display text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {item.data.category}
                      </h3>
                      <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors animate-pulse" />
                    </div>
                    
                    <ul className="space-y-6 flex-grow">
                      {item.data.skills.slice(0, 5).map((skill) => (
                        <li key={skill.name} className="flex flex-col gap-2 group/skill">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground/90 group-hover/skill:text-primary transition-colors tracking-wide">{skill.name}</span>
                              <span className="text-[10px] font-black text-muted-foreground/40 uppercase tabular-nums">{skill.years}Y</span>
                            </div>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all duration-300",
                              levelColors[skill.level] || levelColors.Advance
                            )}>
                              {skill.level}
                            </span>
                          </div>
                          <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ 
                                    width: skill.level === 'Expert' ? '100%' : 
                                           skill.level === 'Advance' ? '85%' : 
                                           skill.level === 'Intermediate' ? '60%' : '35%' 
                                }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    skill.level === 'Expert' ? 'bg-sky-500' : 
                                    skill.level === 'Advance' ? 'bg-emerald-500' : 
                                    skill.level === 'Intermediate' ? 'bg-amber-500' : 'bg-rose-500'
                                )}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    {item.data.skills.length > 5 && (
                      <p className="mt-6 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">
                        + {item.data.skills.length - 5} more technologies
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
