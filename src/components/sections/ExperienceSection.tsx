import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Building, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { dataManager, WorkExperience } from "@/lib/dataManager";

const experiences: WorkExperience[] = dataManager.getWorkExperience();

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
          className="mb-10"
        >
          <span className="section-title">Work Experience</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Where I've Worked
            </h2>
            <Button asChild variant="ghost" className="text-accent hover:text-accent/80 hover:bg-accent/10 gap-1 w-fit">
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
              <Link to="/experience" className="block">
                <div className="bg-card rounded-xl border border-border card-hover p-6 md:p-8">
                  <div className="grid md:grid-cols-[1fr_2fr] gap-6">
                    {/* Left - Meta Info */}
                    <div className="space-y-4">
                      {/* Company Logo */}
                      <a 
                        href={exp.companyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border hover:border-accent transition-colors"
                      >
                        <img 
                          src={exp.companyLogo} 
                          alt={`${exp.company} logo`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {exp.startDate}{exp.isCurrent ? " - Present" : exp.endDate ? ` - ${exp.endDate}` : ""}
                          {exp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {exp.location}
                            </span>
                          )}
                          {exp.employmentType && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                              {exp.employmentType}
                            </span>
                          )}
                        </div>
                        <a 
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                        >
                          <Building className="w-4 h-4" />
                          {exp.company}
                          <ExternalLink className="w-3 h-3" />
                        </a>
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
                        {(exp.highlights || []).map((highlight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {(exp.technologies || []).map((tech) => (
                          <span key={tech} className="tech-chip">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
