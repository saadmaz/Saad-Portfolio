import { motion } from "framer-motion";
import { Layout } from "../components/layout/Layout";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useProjects } from "@/shared/hooks/useProjects";
import { ProjectCard } from "@/components/projects/ProjectCard";

const ProjectsPage = () => {
  const { data: projects = [], isLoading } = useProjects();
  const [activeCategory, setActiveCategory] = useState("All");

  // derive categories dynamically from data
  const categories = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.category || "").filter(Boolean)))
  ];

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  if (isLoading) {
    return (
      <Layout>
        <div className="section-padding flex items-center justify-center min-vh-50">
          <div className="animate-pulse text-muted-foreground">Loading projects...</div>
        </div>
      </Layout>
    );
  }

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
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectsPage;
