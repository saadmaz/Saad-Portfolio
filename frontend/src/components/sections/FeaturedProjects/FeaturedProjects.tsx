import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeaturedProjects } from "@/shared/hooks/useProjects";
import { ProjectCard } from "@/components/projects/ProjectCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturedProjects() {
  const { data: featuredProjects = [], isLoading } = useFeaturedProjects();

  // Sort by most recent (order_index asc), show max 3 in grid, overflow → marquee
  const sorted = [...featuredProjects].sort(
    (a, b) => (a.order_index ?? 999) - (b.order_index ?? 999)
  );
  const gridProjects = sorted.slice(0, 3);
  const marqueeProjects = sorted.length > 3 ? sorted.slice(3) : [];
  // Duplicate for seamless loop
  const marqueeItems = [...marqueeProjects, ...marqueeProjects];

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl bg-card animate-pulse aspect-[4/3]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (gridProjects.length === 0) return null;

  return (
    <section aria-labelledby="featured-work-heading" className="py-16 bg-secondary/30 overflow-hidden">
      <div className="section-container">

        {/* Section header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="section-title">Featured Work</span>
          <h2 id="featured-work-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Projects I'm Proud Of
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A selection of my most impactful work. Each project represents a unique challenge
            solved with thoughtful design and robust engineering.
          </p>
        </m.div>

        {/* Marquee strip — shown when >3 featured projects */}
        {marqueeProjects.length > 0 && (
          <div className="relative mb-10 overflow-hidden">
            {/* Fade masks on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-secondary/30 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-secondary/30 to-transparent pointer-events-none" />

            <div className="marquee-track gap-4 px-2">
              {marqueeItems.map((project, i) => (
                <div key={`${project.id}-${i}`} className="px-2">
                  <ProjectCard project={project} compact />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main 3-column grid */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {gridProjects.map((project) => (
            <m.div key={project.id} variants={itemVariants}>
              <ProjectCard project={project} />
            </m.div>
          ))}
        </m.div>

        {/* View All — centered below, fill-left on hover */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/projects" className="btn-view-all">
            View All Projects
            <ArrowRight className="w-4 h-4 btn-arrow" />
          </Link>
        </m.div>
      </div>
    </section>
  );
}
