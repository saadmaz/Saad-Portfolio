import { m } from "framer-motion";
import { Layout } from "../components/layout/Layout";
import { SEO } from "@/components/SEO";
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
        <section className="section-padding">
          <div className="section-container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-xl bg-secondary/30 animate-pulse aspect-[4/3]" />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Projects | AI, Web & Mobile Apps by Saad Mazhar"
        description="View case studies and live projects by Saad Mazhar — full-stack web apps, AI integrations, Flutter mobile apps, and startup products. Available for hire in Colombo, Sri Lanka."
        url="https://saadmaz.com/projects"
        keywords="full-stack developer portfolio Sri Lanka, React projects, Flutter apps, AI developer Colombo, hire developer Sri Lanka"
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
            <span className="section-title">Projects</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Things I've Built
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              A collection of projects ranging from web applications to CLI tools.
              Each one represents a problem I wanted to solve or a technology I wanted to explore.
            </p>
          </m.div>

          {/* Filters */}
          <m.div
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
          </m.div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {filteredProjects.map((project, index) => (
              <m.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
                <ProjectCard project={project} />
              </m.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectsPage;
