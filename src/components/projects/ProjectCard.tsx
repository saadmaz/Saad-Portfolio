import React from "react";
import { Link } from "react-router-dom";
import { Github, ExternalLink } from "lucide-react";
import { Project } from "@/shared/lib/dataManager";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, className }) => {
  // determine gradient style using start/end or fallback to legacy colour
  let gradientStyle: React.CSSProperties | undefined;
  if (project.gradientStart && project.gradientEnd) {
    gradientStyle = { background: `linear-gradient(to right, ${project.gradientStart}, ${project.gradientEnd})` };
  } else if (project.colour || (project as any).gradient) {
    // legacy support: colour stored as tailwind classes like "from-blue-700 to-blue-500"
    // we can apply it using backgroundImage style for simplicity
    const legacy = String(project.colour || (project as any).gradient);
    gradientStyle = { backgroundImage: `linear-gradient(to right, ${legacy})` } as any;
  } else {
    gradientStyle = undefined;
  }

  const stackItems = project.techStack || project.technologies || [];
  const tagline = project.tagline || project.description || "";
  const status = project.status || "";

  const gradientClasses = !gradientStyle
    ? `bg-gradient-to-r ${project.colour || (project as any).gradient || 'from-accent to-blue-accent'}`
    : undefined;

  return (
    <div className={className}>
      <Link to={`/projects/${project.slug || project.id}`} className="block h-full">
        <div className="h-full bg-card rounded-xl border border-border card-hover overflow-hidden flex flex-col">
          <div className={`h-2 ${gradientClasses || ''}`} style={gradientStyle} />
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                {project.title}
              </h3>
              {status && (
                <span
                  className={`status-badge ${
                    status === "Live"
                      ? "status-live"
                      : status === "In Progress" || status === "MVP"
                      ? "status-mvp"
                      : "status-progress"
                  }`}
                >
                  {status}
                </span>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
              {tagline}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {stackItems.slice(0, 4).map((tech) => (
                <span key={tech} className="tech-chip">
                  {tech}
                </span>
              ))}
              {stackItems.length > 4 && (
                <span className="tech-chip">+{stackItems.length - 4}</span>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border flex-wrap">
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
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
            </div>
            {/* visual "View Project" cue; entire card is already wrapped in a link */}
            <div className="mt-4">
              <span className="text-sm font-medium text-accent">View Project →</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
