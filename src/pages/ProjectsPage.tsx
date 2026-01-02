import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ArrowUpRight, Github, ExternalLink, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const allProjects = [
  {
    id: 1,
    title: "TechFlow Analytics",
    description: "A real-time analytics dashboard for SaaS businesses. Track user behavior, revenue metrics, and growth trends with beautiful visualizations.",
    tech: ["React", "TypeScript", "Node.js", "PostgreSQL", "D3.js"],
    category: "Web App",
    status: "Live",
    liveUrl: "https://techflow.app",
    githubUrl: "https://github.com/johndoe/techflow",
    featured: true,
  },
  {
    id: 2,
    title: "DevConnect Platform",
    description: "A networking platform for developers to connect, collaborate, and find opportunities. Features real-time chat and project matching.",
    tech: ["Next.js", "Prisma", "Tailwind", "Socket.io", "AWS"],
    category: "Web App",
    status: "MVP",
    liveUrl: "https://devconnect.io",
    githubUrl: "https://github.com/johndoe/devconnect",
    featured: true,
  },
  {
    id: 3,
    title: "AI Code Assistant",
    description: "An intelligent code review tool powered by GPT-4. Provides suggestions, identifies bugs, and improves code quality automatically.",
    tech: ["Python", "FastAPI", "OpenAI", "React", "Docker"],
    category: "AI/ML",
    status: "In Progress",
    liveUrl: null,
    githubUrl: "https://github.com/johndoe/ai-code",
    featured: true,
  },
  {
    id: 4,
    title: "CLI Task Manager",
    description: "A beautiful command-line task manager with kanban-style organization, time tracking, and Git integration.",
    tech: ["Go", "Cobra", "SQLite"],
    category: "CLI Tool",
    status: "Live",
    liveUrl: null,
    githubUrl: "https://github.com/johndoe/cli-tasks",
    featured: false,
  },
  {
    id: 5,
    title: "React Component Library",
    description: "A collection of 50+ reusable React components with full TypeScript support, accessibility features, and Storybook documentation.",
    tech: ["React", "TypeScript", "Storybook", "Jest"],
    category: "Library",
    status: "Live",
    liveUrl: "https://components.johndoe.dev",
    githubUrl: "https://github.com/johndoe/react-components",
    featured: false,
  },
  {
    id: 6,
    title: "Budget Tracker API",
    description: "A RESTful API for personal finance management with bank integration, categorization, and spending insights.",
    tech: ["Node.js", "Express", "MongoDB", "Plaid API"],
    category: "API",
    status: "Live",
    liveUrl: null,
    githubUrl: "https://github.com/johndoe/budget-api",
    featured: false,
  },
];

const categories = ["All", "Web App", "AI/ML", "CLI Tool", "Library", "API"];

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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
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
                      <span className={`status-badge ${
                        project.status === 'Live' ? 'status-live' :
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
                      {project.tech.slice(0, 4).map((tech) => (
                        <span key={tech} className="tech-chip">
                          {tech}
                        </span>
                      ))}
                      {project.tech.length > 4 && (
                        <span className="tech-chip">+{project.tech.length - 4}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Live
                        </a>
                      )}
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectsPage;
