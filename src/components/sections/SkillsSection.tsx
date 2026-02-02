import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Skill {
  name: string;
  level: string;
  years: number;
}

interface SkillCategory {
  category: string;
  skills: Skill[];
}

const levelColors: Record<string, string> = {
  Beginner: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  Intermediate: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
  Advanced: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  Expert: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
};

export function SkillsSection() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch from /data/skills.json
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/data/skills.json");
        const data = await response.json();
        setSkillCategories(data);
      } catch (error) {
        console.error("Error loading skills.json:", error);
      }
    };
    fetchSkills();
  }, []);

  // Auto-move logic: Change index every 1.5 seconds
  useEffect(() => {
    if (skillCategories.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % skillCategories.length);
    }, 1500);

    return () => clearInterval(timer);
  }, [skillCategories]);

  // Determine which categories to show (e.g., 4 at a time on desktop)
  const getVisibleCategories = () => {
    if (skillCategories.length === 0) return [];
    const visibleCount = 4;
    const items = [];
    for (let i = 0; i < visibleCount; i++) {
      items.push(skillCategories[(currentIndex + i) % skillCategories.length]);
    }
    return items;
  };

  return (
    <section className="section-padding bg-secondary/30 overflow-hidden">
      <div className="section-container">
        {/* Section Header */}
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
                Technologies I've worked with across the full stack, from frontend 
                interfaces to backend infrastructure.
              </p>
            </div>
            <Button asChild variant="ghost" className="text-accent hover:text-accent gap-1 w-fit">
              <Link to="/skills">
                View All Skills
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Sliding Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[350px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {getVisibleCategories().map((category, idx) => (
              <motion.div
                key={`${category.category}-${currentIndex}-${idx}`}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="bg-card rounded-xl border border-border p-6 h-full backdrop-blur-sm border-white/5 hover:border-blue-500/30 transition-colors">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    {category.category}
                  </h3>
                  <ul className="space-y-3">
                    {category.skills.map((skill) => (
                      <li 
                        key={skill.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">{skill.name}</span>
                          <span className="text-xs text-muted-foreground">{skill.years}y</span>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border border-current/10 ${levelColors[skill.level]}`}>
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
    </section>
  );
}