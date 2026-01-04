import { motion } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const featuredProjects = [
  {
    id: 1,
    title: "TechFlow Analytics",
    description: "A real-time analytics dashboard for SaaS businesses. Track user behavior, revenue metrics, and growth trends with beautiful visualizations.",
    tech: ["React", "TypeScript", "Node.js", "PostgreSQL", "D3.js"],
    status: "Live",
    liveUrl: "https://techflow.app",
    githubUrl: "https://github.com/saadmaz/techflow",
    gradient: "from-accent to-blue-accent",
  },
  {
    id: 2,
    title: "DevConnect Platform",
    description: "A networking platform for developers to connect, collaborate, and find opportunities. Features real-time chat and project matching.",
    tech: ["Next.js", "Prisma", "Tailwind", "Socket.io", "AWS"],
    status: "MVP",
    liveUrl: "https://devconnect.io",
    githubUrl: "https://github.com/johndoe/devconnect",
    gradient: "from-success to-accent",
  },
  {
    id: 3,
    title: "AI Code Assistant",
    description: "An intelligent code review tool powered by GPT-4. Provides suggestions, identifies bugs, and improves code quality automatically.",
    tech: ["Python", "FastAPI", "OpenAI", "React", "Docker"],
    status: "In Progress",
    liveUrl: null,
    githubUrl: "https://github.com/johndoe/ai-code",
    gradient: "from-warning to-destructive",
  },
];

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
    <section className="section-padding bg-secondary/30">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
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

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {featuredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className="group"
            >
              <div className="h-full bg-card rounded-xl border border-border card-hover overflow-hidden flex flex-col">
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${project.gradient}`} />
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Title & Status */}
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

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((tech) => (
                      <span key={tech} className="tech-chip">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
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
        </motion.div>

        {/* View All Projects CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button asChild variant="outline" className="btn-outline gap-2">
            <Link to="/projects">
              View All Projects
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
