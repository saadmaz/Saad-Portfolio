import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Globe,
  Github,
  Layout,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { ProjectService } from '@/services/project-service';
import { toast } from "sonner";
import ImageUpload from './ImageUpload';
import { cn } from "@/shared/lib/utils";

// ── Schema ────────────────────────────────────────────────────────
const projectSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  tagline: z.string().min(5, 'Tagline is required'),
  heroImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  overview: z.string().min(20, 'Overview must be at least 20 characters'),
  status: z.string().default('Completed'),
  techStack: z.array(z.string()).min(1, 'Add at least one technology'),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  featured: z.boolean().default(false),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// ── Slug helper ───────────────────────────────────────────────────
const toSlug = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

const FIELD_CLS = "bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:ring-2 focus:ring-accent/30 focus:border-accent/40 rounded-lg h-10";
const LABEL_CLS = "text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5 block";

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTech, setNewTech] = useState('');
  const isEditMode = !!id && id !== 'new';

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      techStack: [],
      status: 'Completed',
      featured: false,
    },
  });

  // ── Safe array watches ─────────────────────────────────────────
  const techStack = watch('techStack') ?? [];
  const titleValue = watch('title');
  const slugValue = watch('slug');

  // Auto-slug on new projects
  useEffect(() => {
    if (!isEditMode && titleValue && !slugValue) {
      setValue('slug', toSlug(titleValue));
    }
  }, [titleValue, isEditMode]);

  const loadProject = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const project = await ProjectService.getById(id!);
      if (project) {
        reset({
          title: project.title,
          slug: project.slug,
          tagline: project.tagline,
          heroImage: project.heroImage || '',
          overview: project.overview,
          status: project.status || 'Completed',
          techStack: project.techStack ?? [],       // ← safe fallback
          githubUrl: project.githubUrl || '',
          liveUrl: project.liveUrl || '',
          featured: project.featured ?? false,
        });
      }
    } catch {
      toast.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isEditMode) loadProject();
  }, [isEditMode, loadProject]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      setIsLoading(true);
      if (isEditMode) {
        await ProjectService.update(id!, data);
        toast.success('Project updated');
      } else {
        await ProjectService.create(data);
        toast.success('Project created');
      }
      navigate('/admin/projects');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await ProjectService.delete(id!);
      toast.success('Project deleted');
      navigate('/admin/projects');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const addTech = () => {
    const t = newTech.trim();
    if (!t) return;
    if (techStack.includes(t)) { toast.error('Already in stack'); return; }
    setValue('techStack', [...techStack, t]);
    setNewTech('');
  };

  const removeTech = (index: number) => {
    setValue('techStack', techStack.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Page header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-white/10 w-9 h-9"
          onClick={() => navigate('/admin/projects')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-0.5">Portfolio</p>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {isEditMode ? 'Edit Project' : 'New Project'}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 text-black font-black rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.2)] h-10 px-6"
          >
            <Save className="w-3.5 h-3.5 mr-2" />
            {isLoading ? 'Saving…' : 'Save Project'}
          </Button>
          {isEditMode && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500/60 hover:bg-red-500/10 hover:text-red-500 rounded-xl w-9 h-9"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Essentials */}
          <Card className="bg-white/[0.03] border-white/[0.07] overflow-hidden">
            <CardHeader className="border-b border-white/[0.06] py-3 px-5">
              <div className="flex items-center gap-2">
                <Layout className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Project Essentials</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Title</label>
                  <Input {...register('title')} placeholder="e.g. Portfolio v3" className={FIELD_CLS} />
                  {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className={LABEL_CLS}>Slug (URL)</label>
                  <Input {...register('slug')} placeholder="e.g. portfolio-v3" className={cn(FIELD_CLS, "font-mono text-sm")} />
                  {errors.slug && <p className="text-xs text-red-400 mt-1">{errors.slug.message}</p>}
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Tagline</label>
                <Input {...register('tagline')} placeholder="A short punchy description…" className={FIELD_CLS} />
                {errors.tagline && <p className="text-xs text-red-400 mt-1">{errors.tagline.message}</p>}
              </div>

              <div>
                <label className={LABEL_CLS}>Detailed Overview</label>
                <Textarea
                  {...register('overview')}
                  placeholder="Describe the project goals, tech choices, and outcomes…"
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:ring-2 focus:ring-accent/30 focus:border-accent/40 rounded-lg min-h-[160px] resize-none"
                />
                {errors.overview && <p className="text-xs text-red-400 mt-1">{errors.overview.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="bg-white/[0.03] border-white/[0.07] overflow-hidden">
            <CardHeader className="border-b border-white/[0.06] py-3 px-5">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Technical Stack</span>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {/* Existing tags */}
              <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
                {techStack.map((tech, index) => (
                  <div
                    key={`${tech}-${index}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-bold animate-in zoom-in-95 duration-150"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(index)}
                      className="text-accent/50 hover:text-red-400 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {techStack.length === 0 && (
                  <p className="text-xs text-white/25 italic">No technologies added yet</p>
                )}
              </div>

              {/* Add tech inline input */}
              <div className="flex gap-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                  placeholder="e.g. Next.js, TypeScript, Firebase…"
                  className={cn(FIELD_CLS, "flex-1")}
                />
                <Button
                  type="button"
                  onClick={addTech}
                  variant="outline"
                  className="border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/60 hover:text-white rounded-xl h-10 px-4 font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add
                </Button>
              </div>
              {errors.techStack && <p className="text-xs text-red-400 mt-2">{errors.techStack.message}</p>}
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Hero image */}
          <Card className="bg-white/[0.03] border-white/[0.07] overflow-hidden">
            <CardHeader className="border-b border-white/[0.06] py-3 px-5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Hero Image</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ImageUpload
                value={watch('heroImage')}
                onChange={(url) => setValue('heroImage', url)}
                label="Project Hero Image"
              />
              {errors.heroImage && <p className="text-xs text-red-400 mt-2">{errors.heroImage.message}</p>}
            </CardContent>
          </Card>

          {/* External links */}
          <Card className="bg-white/[0.03] border-white/[0.07] overflow-hidden">
            <CardHeader className="border-b border-white/[0.06] py-3 px-5">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">External Links</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <label className={LABEL_CLS}>Live Demo URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                  <Input {...register('liveUrl')} placeholder="https://example.com" className={cn(FIELD_CLS, "pl-9")} />
                </div>
                {errors.liveUrl && <p className="text-xs text-red-400 mt-1">{errors.liveUrl.message}</p>}
              </div>
              <div>
                <label className={LABEL_CLS}>GitHub Repository</label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                  <Input {...register('githubUrl')} placeholder="https://github.com/..." className={cn(FIELD_CLS, "pl-9")} />
                </div>
                {errors.githubUrl && <p className="text-xs text-red-400 mt-1">{errors.githubUrl.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-white/[0.03] border-white/[0.07] overflow-hidden">
            <CardHeader className="border-b border-white/[0.06] py-3 px-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Settings</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className={LABEL_CLS}>Status</label>
                <select
                  {...register('status')}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 h-10 text-sm text-white focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none"
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Exploration">Exploration</option>
                </select>
              </div>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">Featured Project</span>
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="w-4 h-4 rounded accent-teal-400 bg-white/5 border-white/10"
                />
              </label>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => !isLoading && setDeleteDialogOpen(open)}>
        <AlertDialogContent className="bg-[#111] border-white/10 text-white rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm">
              This project will be permanently removed from your portfolio. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isLoading} className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-black border-0 shadow-lg shadow-red-500/20"
            >
              {isLoading ? 'Deleting…' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectForm;
