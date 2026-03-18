import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Eye
} from 'lucide-react';
import { ProjectService } from '@/services/project-service';
import { Project } from '@/types';
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await ProjectService.getAll();
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">Projects</h1>
          <p className="text-muted-foreground">Manage your portfolio projects and showcase your best work.</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/projects/new')}
          className="bg-accent hover:bg-accent/90 text-black font-bold shadow-[0_0_20px_rgba(255,184,0,0.2)] rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search projects by title or tagline..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent/50 outline-none transition-all shadow-xl shadow-black/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto border-white/10 hover:bg-white/5 rounded-xl px-6">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card key={project.id} className="bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="flex items-center p-4 sm:p-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5 mr-5 flex-shrink-0 shadow-2xl">
                    <img 
                      src={project.heroImage} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Project';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-white text-lg truncate group-hover:text-accent transition-colors">{project.title}</h3>
                      {project.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/20">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-white/50 truncate mb-3 leading-relaxed group-hover:text-white/70 transition-colors">{project.tagline}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="text-[10px] px-2.5 py-0.5 rounded-lg bg-white/5 text-muted-foreground border border-white/5 font-medium">{tech}</span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="text-[10px] px-2.5 py-0.5 text-muted-foreground font-medium bg-white/5 rounded-lg border border-white/5">+{project.techStack.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-all active:scale-90"
                      title="View on site"
                      onClick={() => window.open(`/projects/${project.slug}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 active:scale-90">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0f0f0f] border-white/10 text-white rounded-xl shadow-2xl p-1">
                        <DropdownMenuItem 
                          className="hover:bg-accent hover:text-black cursor-pointer rounded-lg m-1 py-2 font-semibold"
                          onClick={() => navigate(`/admin/projects/${project.id}`)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="hover:bg-red-500/20 hover:text-red-500 cursor-pointer text-red-400 rounded-lg m-1 py-2 font-semibold"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No projects found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? "Try searching for something else." : "Start building your portfolio by adding your first project."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
