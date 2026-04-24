import { m } from "framer-motion";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors group">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.heroImage}
          alt={`${project.title} - ${project.tagline || "project preview"}`}
          loading="lazy"
          decoding="async"
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          {project.githubUrl && project.githubUrl !== "none" && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
              <Github className="w-5 h-5 text-white" />
            </a>
          )}
          {project.liveUrl && project.liveUrl !== "none" && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
          )}
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display text-xl font-bold group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {project.status}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {project.tagline}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {(project.techStack || []).slice(0, 3).map((tech) => (
            <Badge key={tech} variant="secondary" className="bg-secondary/50 text-[10px]">
              {tech}
            </Badge>
          ))}
          {(project.techStack || []).length > 3 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{(project.techStack || []).length - 3} more
            </span>
          )}
        </div>
        <Link
          to={`/projects/${project.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all"
        >
          View Details <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
