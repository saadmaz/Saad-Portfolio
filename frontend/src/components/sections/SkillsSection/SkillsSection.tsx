import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSkills } from "@/shared/hooks/useCommon";
import { SkillSet } from "@/types";

const levelColors: Record<string, string> = {
    Beginner: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/80",
    Intermediate: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning/80",
    Advance: "bg-success/10 text-success dark:bg-success/20 dark:text-success/80",
    Expert: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent/80",
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
      else setVisibleCount(4);
    };
    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, []);

  const moveNext = useCallback(() => {
    setDirection(1);
    const len = skillCategories.length || 1;
    setCurrentIndex((prev) => (prev + 1) % len);
  }, [skillCategories.length]);

  const movePrev = useCallback(() => {
    setDirection(-1);
    const len = skillCategories.length || 1;
    setCurrentIndex((prev) => (prev - 1 + len) % len);
  }, [skillCategories.length]);

  useEffect(() => {
    if (skillCategories.length === 0) return;
    const timer = setInterval(moveNext, 3500);
    return () => clearInterval(timer);
  }, [moveNext, skillCategories.length]);

  const getVisibleCategories = () => {
    if (skillCategories.length === 0) return [];
    const items: { data: SkillSet; originalIndex: number }[] = [];
    for (let i = 0; i < visibleCount; i++) {
      const idx = (currentIndex + i) % skillCategories.length;
      items.push({ data: skillCategories[idx], originalIndex: idx });
    }
    return items;
  };

  if (isLoading) {
    return (
      <section className="section-padding bg-secondary/30">
        <div className="section-container text-center text-muted-foreground">
          Loading skills...
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-secondary/30 overflow-hidden">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="section-title">Technical Skills</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Tech Stack & Skills
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Technologies I've worked with across the full stack.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <button onClick={movePrev} className="p-2 rounded-md bg-card border border-border hover:border-accent/50 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={moveNext} className="p-2 rounded-md bg-card border border-border hover:border-accent/50 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <Button asChild className="bg-accent text-accent-foreground gap-1">
                <Link to="/skills">
                  View All Skills <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[380px]">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              {getVisibleCategories().map((item) => (
                <motion.div
                  key={`${item.data.category}-${item.originalIndex}`}
                  layout
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.4 }
                  }}
                  className="h-full"
                >
                  <div className="bg-card rounded-xl border border-border p-6 h-full flex flex-col backdrop-blur-sm hover:border-accent/30 transition-all duration-300 relative overflow-hidden group/card">
                    {/* Shimmer sweep on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      {item.data.category}
                    </h3>
                    <ul className="space-y-4 flex-grow">
                      {item.data.skills.map((skill) => (
                        <li key={skill.name} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground font-medium">{skill.name}</span>
                            <span className="text-[11px] text-muted-foreground">{skill.years}y</span>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold border border-current/10 ${levelColors[skill.level] || levelColors.Advance}`}>
                            {skill.level}
                          </span>
                        </li>
                      ))}
                    </ul>
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
