import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const skillCategories = [
  {
    title: "Languages",
    skills: [
      { name: "TypeScript", level: "Expert" },
      { name: "JavaScript", level: "Expert" },
      { name: "Python", level: "Advanced" },
      { name: "Go", level: "Intermediate" },
      { name: "SQL", level: "Advanced" },
    ],
  },
  {
    title: "Frontend",
    skills: [
      { name: "React", level: "Expert" },
      { name: "Next.js", level: "Advanced" },
      { name: "Tailwind CSS", level: "Expert" },
      { name: "Vue.js", level: "Intermediate" },
      { name: "Framer Motion", level: "Advanced" },
    ],
  },
  {
    title: "Backend",
    skills: [
      { name: "Node.js", level: "Expert" },
      { name: "FastAPI", level: "Advanced" },
      { name: "PostgreSQL", level: "Advanced" },
      { name: "MongoDB", level: "Intermediate" },
      { name: "Redis", level: "Intermediate" },
    ],
  },
  {
    title: "DevOps & Tools",
    skills: [
      { name: "AWS", level: "Advanced" },
      { name: "Docker", level: "Advanced" },
      { name: "Git", level: "Expert" },
      { name: "CI/CD", level: "Advanced" },
      { name: "Kubernetes", level: "Intermediate" },
    ],
  },
];

const levelColors: Record<string, string> = {
  Expert: "bg-accent text-accent-foreground",
  Advanced: "bg-success/20 text-success",
  Intermediate: "bg-warning/20 text-warning",
};

export function SkillsSection() {
  return (
    <section className="section-padding bg-secondary/30">
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

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-card rounded-xl border border-border p-6 h-full">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  {category.title}
                </h3>
                <ul className="space-y-3">
                  {category.skills.map((skill) => (
                    <li 
                      key={skill.name}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-sm text-foreground">{skill.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[skill.level]}`}>
                        {skill.level}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
