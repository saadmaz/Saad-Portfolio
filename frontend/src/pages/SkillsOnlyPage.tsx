import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
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
    Beginner: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/80",
    Intermediate: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning/80",
    Advance: "bg-success/10 text-success dark:bg-success/20 dark:text-success/80",
    Expert: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent/80",
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
      <SEO
        title="Skills | Saad Mazhar's Technical Stack & Expertise"
        description="Explore the full technical skill set of Saad Mazhar — proficiency in React, TypeScript, Flutter, Python, AI tools, cloud platforms, and more. Based in Sri Lanka."
        url="https://saadmaz.com/skills"
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
            Skills
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              A comprehensive overview of my expertise across multiple domains.
              I'm continuously learning and expanding my capabilities.
            </p>
          </m.div>

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
                <m.div
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
                </m.div>
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
