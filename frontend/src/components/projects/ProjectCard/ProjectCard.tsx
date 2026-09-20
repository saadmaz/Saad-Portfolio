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
      <Link to={`/projects/${project.slug}`} className="block group shrink-0 w-[200px]">
        <div className="rounded-lg border border-border bg-card overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-lg hover:border-accent/50">
          <div className="relative h-28 overflow-hidden bg-muted">
            {project.heroImage && (
              <img
                src={project.heroImage}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-[11px] font-semibold truncate">{project.title}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative group">
      <Link to={`/projects/${project.slug}`} className="block">
        <div
          className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-[5px] group-hover:scale-[1.01]"
          style={{ boxShadow: "var(--shadow-card)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 0 0 1.5px hsl(var(--accent)), 0 12px 32px rgba(0,0,0,0.10)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)";
          }}
        >
          {/* Thumbnail — fixed short height */}
          <div className="relative h-36 overflow-hidden bg-muted">
            <img
              src={project.heroImage}
              alt={`${project.title} - ${project.tagline || "project preview"}`}
              loading="lazy"
              decoding="async"
              className="object-cover w-full h-full transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06]"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]" />

            {/* "View Project" pill */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 text-foreground text-[11px] font-semibold shadow-md whitespace-nowrap">
                View Project <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>

          {/* Card body — compact */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="font-display text-sm font-bold text-foreground group-hover:text-accent transition-colors duration-[250ms] leading-snug">
                {project.title}
              </h3>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground shrink-0 ml-2">
                {project.status}
              </span>
            </div>

            <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
              {project.tagline}
            </p>

            <div className="flex flex-wrap gap-1">
              {(project.techStack || []).slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
              {(project.techStack || []).length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{(project.techStack || []).length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* External links — siblings of the card Link (not nested inside it) */}
      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 z-10">
        {project.githubUrl && project.githubUrl !== "none" && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} on GitHub`}
            className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Github className="w-3 h-3 text-white" />
          </a>
        )}
        {project.liveUrl && project.liveUrl !== "none" && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} live preview`}
            className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ExternalLink className="w-3 h-3 text-white" />
          </a>
        )}
      </div>
    </div>
  );
}
