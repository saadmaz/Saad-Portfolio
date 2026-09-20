import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
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

const SkillsOnlyPage = () => {
  const { data: skillCategories = [], isLoading } = useSkills();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/skills"].title}
        description={PAGE_SEO["/skills"].description}
        url={`${BASE_URL}/skills`}
      />
      <section className="section-padding">
        <div className="section-container">

          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="section-title">Professional Development</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Skills & Expertise
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              A comprehensive overview of my expertise across multiple domains.
              I'm continuously learning and expanding my capabilities.
            </p>
          </m.div>

          {/* Loading */}
          {isLoading && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-card animate-pulse" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
                ))}
              </div>
            </>
          )}

          {!isLoading && skillCategories.length > 0 && (() => {
            const activeCategory = skillCategories[activeTab];
            return (
              <>
                {/* Category tabs */}
                <m.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative mb-8"
                >
                  <div className="flex gap-1 flex-wrap">
                    {skillCategories.map((cat, i) => (
                      <button
                        key={cat.category}
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
                            layoutId="tab-pill-page"
                            className="absolute inset-0 rounded-xl bg-accent shadow-md shadow-accent/20 -z-10"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{cat.category}</span>
                      </button>
                    ))}
                  </div>
                </m.div>

                {/* Skills grid */}
                <AnimatePresence mode="wait">
                  <m.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
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

                {/* Legend */}
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
              </>
            );
          })()}

          {!isLoading && skillCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No skills data available.</p>
            </div>
          )}

        </div>
      </section>
    </Layout>
  );
};

export default SkillsOnlyPage;
