import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  Star,
} from 'lucide-react';
import { ProjectService } from '@/services/project-service';
import { Project } from '@/types';
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

type SortKey = 'newest' | 'oldest' | 'az';
type FilterKey = 'all' | 'featured' | 'regular';

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; title: string }>({
    open: false, id: null, title: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const data = await ProjectService.getAll();
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...projects];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus === 'featured') result = result.filter(p => p.featured);
    if (filterStatus === 'regular') result = result.filter(p => !p.featured);

    // Sort
    if (sortKey === 'az') result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortKey === 'newest') result.sort((a, b) => (b.order_index ?? 0) - (a.order_index ?? 0));
    else if (sortKey === 'oldest') result.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    return result;
  }, [projects, searchQuery, filterStatus, sortKey]);

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id) return;
    setIsDeleting(true);
    try {
      await ProjectService.delete(deleteDialog.id);
      setProjects(prev => prev.filter(p => p.id !== deleteDialog.id));
      toast.success(`"${deleteDialog.title}" deleted`);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, id: null, title: '' });
    }
  };

  const filterPills: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'featured', label: 'Featured' },
    { key: 'regular', label: 'Regular' },
  ];

  const sortLabels: Record<SortKey, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    az: 'A → Z',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Projects</h1>
          <p className="text-white/40 text-sm mt-1">Manage your portfolio showcase.</p>
        </div>
        <Button
          onClick={() => navigate('/admin/projects/new')}
          className="bg-accent hover:bg-accent/90 text-black font-black shadow-[0_0_20px_rgba(255,184,0,0.15)] rounded-xl transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      {/* Search + Filter row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by title or tagline..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-xl p-1">
          {filterPills.map(pill => (
            <button
              key={pill.key}
              onClick={() => setFilterStatus(pill.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                filterStatus === pill.key
                  ? "bg-accent text-black shadow-sm"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl text-white/50 text-xs font-black uppercase tracking-widest gap-2 h-[42px]">
              {sortLabels[sortKey]} <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl p-1 min-w-[160px]">
            {(Object.keys(sortLabels) as SortKey[]).map(k => (
              <DropdownMenuItem
                key={k}
                onClick={() => setSortKey(k)}
                className={cn(
                  "rounded-lg m-0.5 py-2 text-xs font-bold cursor-pointer",
                  sortKey === k ? "bg-accent/10 text-accent" : "hover:bg-white/5"
                )}
              >
                {sortLabels[k]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Count badge */}
      {!isLoading && (
        <p className="text-[11px] text-white/25 font-bold uppercase tracking-widest">
          {filtered.length} project{filtered.length !== 1 ? 's' : ''} shown
        </p>
      )}

      {/* List */}
      <div className="grid gap-3">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-white/[0.04] border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((project) => (
            <Card key={project.id} className="bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 transition-all group overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="flex items-center p-4 gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 shadow-xl">
                    <img
                      src={project.heroImage}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Project';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-white truncate group-hover:text-accent transition-colors">{project.title}</h3>
                      {project.featured && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[9px] font-black uppercase tracking-widest border border-accent/20 flex-shrink-0">
                          <Star className="w-2.5 h-2.5 fill-current" /> Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 truncate mb-2">{project.tagline}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 4).map(tech => (
                        <span key={tech} className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-white/35 border border-white/[0.06] font-medium">{tech}</span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-white/25 border border-white/[0.06] font-medium">+{project.techStack.length - 4}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-white/10 text-white/30 hover:text-white transition-all"
                      title="Preview"
                      onClick={() => window.open(`/projects/${project.slug}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10 active:scale-90">
                          <MoreVertical className="w-4 h-4 text-white/30" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl p-1">
                        <DropdownMenuItem
                          className="hover:bg-accent/10 hover:text-accent cursor-pointer rounded-lg m-0.5 py-2 text-xs font-bold"
                          onClick={() => navigate(`/admin/projects/${project.id}`)}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:bg-red-500/15 hover:text-red-400 cursor-pointer text-red-500/70 rounded-lg m-0.5 py-2 text-xs font-bold"
                          onClick={() => setDeleteDialog({ open: true, id: project.id, title: project.title })}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Plus className="w-7 h-7 text-white/20" />
            </div>
            <h3 className="text-base font-bold text-white/60 mb-1">No projects found</h3>
            <p className="text-sm text-white/30">
              {searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first project to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog(d => ({ ...d, open }))}>
        <AlertDialogContent className="bg-[#111] border-white/10 text-white rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm">
              <span className="text-white/80 font-bold">"{deleteDialog.title}"</span> will be permanently removed from your portfolio. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-black border-0 shadow-lg shadow-red-500/20"
            >
              {isDeleting ? 'Deleting…' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProjects;
