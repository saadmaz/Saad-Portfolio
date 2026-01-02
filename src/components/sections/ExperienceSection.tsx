import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const experiences = [
  {
    id: 1,
    role: "Co-Founder & CTO",
    company: "Startup XYZ",
    period: "2023 - Present",
    description: "Leading technical strategy and product development for an AI-powered productivity platform serving 10K+ users.",
    highlights: [
      "Built core product from 0 to 1 with 99.9% uptime",
      "Scaled infrastructure to handle 1M+ daily requests",
      "Led a team of 5 engineers across frontend and backend"
    ],
    tech: ["React", "Node.js", "AWS", "PostgreSQL", "OpenAI"],
  },
  {
    id: 2,
    role: "Software Engineer Intern",
    company: "Tech Corp",
    period: "Summer 2023",
    description: "Developed key features for the customer-facing dashboard used by Fortune 500 clients.",
    highlights: [
      "Reduced page load time by 40% through optimization",
      "Implemented real-time collaboration features",
      "Contributed to open-source internal tools"
    ],
    tech: ["TypeScript", "React", "GraphQL", "Redis"],
  },
  {
    id: 3,
    role: "Founding Engineer",
    company: "PreviousStartup",
    period: "2022 - 2023",
    description: "First engineering hire at an early-stage startup focused on developer tools.",
    highlights: [
      "Architected the entire backend infrastructure",
      "Integrated with 15+ third-party APIs",
      "Helped raise $500K seed funding"
    ],
    tech: ["Python", "FastAPI", "Docker", "MongoDB"],
  },
];

export function ExperienceSection() {
  return (
    <section className="section-padding">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="section-title">Work Experience</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Where I've Worked
            </h2>
            <Button asChild variant="ghost" className="text-accent hover:text-accent gap-1 w-fit">
              <Link to="/experience">
                View Full History
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Experience Cards */}
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card rounded-xl border border-border card-hover p-6 md:p-8">
                <div className="grid md:grid-cols-[1fr_2fr] gap-6">
                  {/* Left - Meta Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {exp.period}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="w-4 h-4" />
                      {exp.company}
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                      {exp.role}
                    </h3>
                  </div>

                  {/* Right - Content */}
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      {exp.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {exp.tech.map((tech) => (
                        <span key={tech} className="tech-chip">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
