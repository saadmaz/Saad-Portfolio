import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import skillsData from "@/data/skills.json";

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
    Advance: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    Expert: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
};

const SkillsOnlyPage = () => {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSkillCategories(skillsData);
    setLoading(false);
  }, []);

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="section-title">Professional Development</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Skills
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              A comprehensive overview of my expertise across multiple domains.
              I'm continuously learning and expanding my capabilities.
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <div className="h-12 w-12 border-4 border-accent border-t-transparent rounded-full"></div>
              </div>
            </div>
          )}

          {/* Skills Grid */}
          {!loading && skillCategories.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillCategories.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div className="bg-card rounded-xl border border-border p-6 h-full hover:border-accent/50 transition-colors">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                      {category.category}
                    </h3>
                    <ul className="space-y-3">
                      {category.skills.map((skill) => (
                        <li
                          key={skill.name}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm text-foreground">{skill.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {skill.years}y
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              levelColors[skill.level] ||
                              "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {skill.level}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && skillCategories.length === 0 && (
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
