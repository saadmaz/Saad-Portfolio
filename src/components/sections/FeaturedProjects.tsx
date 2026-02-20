import { motion } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { dataManager, Project } from "@/lib/dataManager";

const featuredProjects: Project[] = dataManager.getFeaturedProjects(3);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  },
};

export function FeaturedProjects() {
  return (
    <section className="py-12 bg-secondary/30">
      <div className="section-container">
        
        {/* --- SECTION HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="section-title">Featured Work</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Projects I'm Proud Of
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A selection of my most impactful work. Each project represents a unique challenge 
            solved with thoughtful design and robust engineering.
          </p>
        </motion.div>

        {/* --- PROJECTS GRID --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-center"
        >
          {featuredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className="group"
            >
              <Link to={`/projects/${project.slug || project.id}`} className="block h-full">
                <div className="h-full bg-card rounded-xl border border-border card-hover overflow-hidden flex flex-col">
                  <div className={`h-2 bg-gradient-to-r ${project.colour || project.gradient || 'from-accent to-blue-accent'}`} />
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                      <span className={`status-badge ${
                        project.status === 'Live' ? 'status-live' :
                        project.status === 'MVP' ? 'status-mvp' :
                        'status-progress'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(project.technologies || []).map((tech) => (
                        <span key={tech} className="tech-chip">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Live
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* --- VIEW ALL BUTTON --- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          {/* FIX: Tight syntax for asChild to prevent hydration/child errors */}
          <Button asChild variant="outline" className="btn-outline gap-2">
            <Link to="/projects">View All Projects<ArrowUpRight className="w-4 h-4" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}