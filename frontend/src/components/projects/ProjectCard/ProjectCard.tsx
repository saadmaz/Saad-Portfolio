import { motion } from "framer-motion";
import { ExternalLink, Github, ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { cn } from "@/shared/lib/utils";

interface ProjectCardProps {
  project: Project;
  isCompact?: boolean;
}

export function ProjectCard({ project, isCompact = false }: ProjectCardProps) {
  if (isCompact) {
    return (
      <Card className="group overflow-hidden border-border/40 bg-card/40 hover:bg-card/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <div className="flex items-center p-4 gap-6">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-border/50">
            <img 
              src={project.heroImage} 
              alt={project.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-display text-lg font-bold truncate group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <Badge variant="outline" className="text-[9px] uppercase tracking-tighter py-0 h-4 border-primary/20 text-primary">
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs line-clamp-1 mb-3 font-medium">
              {project.tagline}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-[10px] text-muted-foreground/70 bg-secondary/30 px-2 py-0.5 rounded-md border border-border/50">
                    {tech}
                  </span>
                ))}
              </div>
              <Link 
                to={`/projects/${project.slug}`}
                className="p-2 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/40 bg-card/40 hover:bg-card/60 transition-all duration-500 group hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={project.heroImage} 
          alt={project.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
          <div className="flex gap-3">
            {project.githubUrl && project.githubUrl !== "none" && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-primary hover:text-white transition-all border border-white/10">
                <Github className="w-5 h-5" />
              </a>
            )}
            {project.liveUrl && project.liveUrl !== "none" && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-primary hover:text-white transition-all border border-white/10">
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-display text-xl md:text-2xl font-bold group-hover:text-primary transition-colors tracking-tight">
            {project.title}
          </h3>
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary px-2">
            {project.status}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 font-medium leading-relaxed flex-1">
          {project.tagline}
        </p>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="bg-secondary/40 text-[10px] font-bold border-border/50">
                {tech}
              </Badge>
            ))}
          </div>
          <Link 
            to={`/projects/${project.slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary group/link"
          >
            Project Deep Dive 
            <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
