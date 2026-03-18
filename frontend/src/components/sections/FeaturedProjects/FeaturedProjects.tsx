import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Grid, List } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFeaturedProjects } from "@/shared/hooks/useProjects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }
  },
};

export function FeaturedProjects() {
  const { data: featuredProjects, isLoading } = useFeaturedProjects();
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  if (isLoading) {
    return (
      <section className="section-padding bg-secondary/10">
        <div className="section-container text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Loading featured excellence...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-secondary/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      
      <div className="section-container">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-left max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Selected Works</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Featured <span className="text-primary italic">Projects</span>
            </h2>
            <p className="text-muted-foreground/80 md:text-lg leading-relaxed font-medium">
              A curated selection of my most meaningful contributions, where design 
              meets high-performance engineering.
            </p>
          </motion.div>

          {/* VIEW TOGGLE */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center p-1.5 bg-background/50 backdrop-blur-sm border rounded-xl shadow-sm"
          >
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                viewMode === 'grid' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Grid className="w-3.5 h-3.5" />
              Detailed
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                viewMode === 'compact' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <List className="w-4 h-4" />
              Condensed
            </button>
          </motion.div>
        </div>

        {/* --- PROJECTS GRID --- */}
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={cn(
            "grid gap-6 lg:gap-8",
            viewMode === 'grid' ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}
        >
          <AnimatePresence mode="popLayout">
            {featuredProjects?.map((project) => (
              <motion.div
                key={project.id}
                layout
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                className="group"
              >
                <ProjectCard project={project} isCompact={viewMode === 'compact'} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* --- VIEW ALL BUTTON --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-20"
        >
          <Button asChild variant="outline" className="btn-outline h-14 px-10 rounded-2xl group border-accent/20 hover:border-accent">
            <Link to="/projects" className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
              Explore All Projects
              <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
