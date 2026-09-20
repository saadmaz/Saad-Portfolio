/**
 * SkillsSection.tsx
 * ─────────────────────────────────────────────────────────────
 * Replaced auto-rotating carousel with a static tabbed layout.
 * Users click a category tab to see all skills in that category
 * at once - no more spinning that users can't control.
 *
 * Visual highlights:
 *  - Animated tab underline that glides between tabs
 *  - Skills animate in via stagger when tab switches
 *  - Proficiency bars fill on enter-viewport (Framer Motion)
 *  - Color-coded level badges
 */

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSkills } from "@/shared/hooks/useCommon";

const levelColors: Record<string, { badge: string; bar: string }> = {
  Beginner:     { badge: "bg-red-500/10    text-red-500    border-red-500/20",    bar: "bg-red-500" },
  Intermediate: { badge: "bg-amber-500/10  text-amber-500  border-amber-500/20",  bar: "bg-amber-500" },
  Advance:      { badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", bar: "bg-emerald-500" },
  Expert:       { badge: "bg-accent/10     text-accent     border-accent/20",     bar: "bg-accent" },
};

const levelToPercent: Record<string, number> = {
  Beginner: 30,
  Intermediate: 60,
  Advance: 85,
  Expert: 100,
};

export function SkillsSection() {
  const { data: skillCategories = [], isLoading } = useSkills();
  const [activeTab, setActiveTab] = useState(0);

  if (isLoading) {
    return (
      <section className="section-padding bg-secondary/30">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (skillCategories.length === 0) return null;

  const activeCategory = skillCategories[activeTab];

  return (
    <section className="section-padding bg-secondary/30 overflow-hidden">
      <div className="section-container">

        {/* ── Section header ─────────────────────────────────────── */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
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
            <Button asChild className="bg-accent text-accent-foreground gap-1 shrink-0">
              <Link to="/skills">
                View All Skills <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </m.div>

        {/* ── Category tabs ──────────────────────────────────────── */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative mb-8"
        >
          {/* Scrollable tab bar */}
          <div role="tablist" aria-label="Skill categories" className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {skillCategories.map((cat, i) => (
              <button
                key={cat.category}
                role="tab"
                id={`skills-tab-${i}`}
                aria-selected={activeTab === i}
                aria-controls="skills-tabpanel"
                onClick={() => setActiveTab(i)}
                className={`
                  relative shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200
                  ${activeTab === i
                    ? "text-accent-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent/30"
                  }
                `}
              >
                {activeTab === i && (
                  <m.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-accent shadow-md shadow-accent/20 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat.category}</span>
              </button>
            ))}
          </div>
        </m.div>

        {/* ── Skills grid for active category ────────────────────── */}
        <AnimatePresence mode="wait">
          <m.div
            key={activeTab}
            id="skills-tabpanel"
            role="tabpanel"
            aria-labelledby={`skills-tab-${activeTab}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Category summary line */}
            <p className="text-xs text-muted-foreground mb-6 uppercase tracking-widest font-semibold">
              {activeCategory.skills.length} skills in {activeCategory.category}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCategory.skills.map((skill, i) => {
                const colors = levelColors[skill.level] || levelColors.Advance;
                const pct    = levelToPercent[skill.level] || 75;

                return (
                  <m.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 hover:shadow-sm transition-all duration-300 group"
                  >
                    {/* Skill name + level badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                          {skill.name}
                        </span>
                        {skill.startYear > 0 && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                            {new Date().getFullYear() - skill.startYear}y
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${colors.badge}`}>
                        {skill.level}
                      </span>
                    </div>

                    {/* Proficiency bar */}
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <m.div
                        className={`h-full rounded-full ${colors.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.04 + 0.15, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </m.div>
                );
              })}
            </div>
          </m.div>
        </AnimatePresence>

        {/* ── Legend ─────────────────────────────────────────────── */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap gap-4 justify-end"
        >
          {Object.entries(levelColors).map(([level, colors]) => (
            <div key={level} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${colors.bar}`} />
              <span className="text-xs text-muted-foreground">{level}</span>
            </div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
