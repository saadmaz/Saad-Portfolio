import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Github, ExternalLink, Filter } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { dataManager, Project } from "@/lib/dataManager";

const allProjects: Project[] = dataManager.getProjects();


// derive categories dynamically from data
const categories = [
  "All",
  ...Array.from(new Set(allProjects.map((p) => p.category || "").filter(Boolean)))
];

const ProjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All"
    ? allProjects
    : allProjects.filter(p => p.category === activeCategory);

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
            <span className="section-title">Projects</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Things I've Built
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              A collection of projects ranging from web applications to CLI tools.
              Each one represents a problem I wanted to solve or a technology I wanted to explore.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
                <Link to={`/projects/${project.slug || project.id}`} className="block h-full">
                  <div className="h-full bg-card rounded-xl border border-border card-hover overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {project.featured && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                              Featured
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {project.category}
                          </span>
                        </div>
                        <span className={`status-badge ${project.status === 'Live' ? 'status-live' :
                          project.status === 'MVP' ? 'status-mvp' :
                            'status-progress'
                          }`}>
                          {project.status}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                        {project.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(project.technologies || []).slice(0, 4).map((tech) => (
                          <span key={tech} className="tech-chip">
                            {tech}
                          </span>
                        ))}
                        {(project.technologies?.length || 0) > 4 && (
                          <span className="tech-chip">+{(project.technologies?.length || 0) - 4}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border">
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
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectsPage;
