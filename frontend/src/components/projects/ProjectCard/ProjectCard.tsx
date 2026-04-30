import { m } from "framer-motion";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  if (compact) {
    return (
      <Link to={`/projects/${project.slug}`} className="block group shrink-0 w-[260px]">
        <div className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-xl hover:border-accent/50">
          <div className="relative h-36 overflow-hidden bg-muted">
            {project.heroImage && (
              <img
                src={project.heroImage}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3 right-3">
              <p className="text-white text-xs font-semibold truncate">{project.title}</p>
              {(project.techStack || [])[0] && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-medium">
                  {project.techStack[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/projects/${project.slug}`} className="block group">
      <div
        className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-[6px] group-hover:scale-[1.01]"
        style={{
          boxShadow: "var(--shadow-card)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 0 0 1.5px hsl(var(--accent)), 0 16px 40px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)";
        }}
      >
        {/* Thumbnail — zooms on card hover */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={project.heroImage}
            alt={`${project.title} - ${project.tagline || "project preview"}`}
            loading="lazy"
            decoding="async"
            className="object-cover w-full h-full transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06]"
          />

          {/* Gradient overlay — fades in on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]" />

          {/* External links shown on hover (top-right) */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            {project.githubUrl && project.githubUrl !== "none" && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
              >
                <Github className="w-4 h-4 text-white" />
              </a>
            )}
            {project.liveUrl && project.liveUrl !== "none" && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </a>
            )}
          </div>

          {/* "View Project →" pill — slides up from bottom on hover */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 text-foreground text-xs font-semibold shadow-lg whitespace-nowrap">
              View Project <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-accent transition-colors duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
              {project.title}
            </h3>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground shrink-0 ml-2">
              {project.status}
            </span>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {project.tagline}
          </p>

          {/* Tech stack — stagger on hover */}
          <div className="flex flex-wrap gap-1.5">
            {(project.techStack || []).slice(0, 4).map((tech, i) => (
              <m.span
                key={tech}
                initial={false}
                className="tech-chip transition-all duration-[200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {tech}
              </m.span>
            ))}
            {(project.techStack || []).length > 4 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{(project.techStack || []).length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
