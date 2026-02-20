import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { dataManager, Project } from "@/lib/dataManager";
import { ProjectCard } from "@/components/projects/ProjectCard";

// use the three most recent projects regardless of featured flag
const featuredProjects: Project[] = dataManager.getRecentProjects(3);

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
              <ProjectCard project={project} />
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