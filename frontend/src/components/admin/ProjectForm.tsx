import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Sparkles
} from 'lucide-react';
import { ProjectService } from '@/services/project-service';
import { Project } from '@/types';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from './ImageUpload';

const projectSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  tagline: z.string().min(5, 'Tagline is required'),
  heroImage: z.string().url('Must be a valid URL'),
  overview: z.string().min(20, 'Overview is too short'),
  status: z.string().default('Completed'),
  techStack: z.array(z.string()).min(1, 'Add at least one technology'),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  featured: z.boolean().default(false),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!id && id !== 'new';

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      techStack: ['React', 'TypeScript'],
      status: 'Completed',
      featured: false
    }
  });

  const techStack = watch('techStack');

  const loadProject = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const project = await ProjectService.getById(id!);
      if (project) {
        reset({
          title: project.title,
          slug: project.slug,
          tagline: project.tagline,
          heroImage: project.heroImage,
          overview: project.overview,
          status: project.status,
          techStack: project.techStack,
          githubUrl: project.githubUrl || '',
          liveUrl: project.liveUrl || '',
          featured: project.featured || false,
        });
      }
    } catch (error) {
      toast.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isEditMode) {
      loadProject();
    }
  }, [isEditMode, loadProject]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      setIsLoading(true);
      if (isEditMode) {
        await ProjectService.update(id!, data);
        toast.success('Project updated successfully');
      } else {
        await ProjectService.create(data);
        toast.success('Project created successfully');
      }
      navigate('/admin/projects');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Operation failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      setIsLoading(true);
      await ProjectService.delete(id!);
      toast.success('Project deleted successfully');
      navigate('/admin/projects');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTech = () => {
    const tech = prompt('Enter tech name (e.g. Next.js)');
    if (tech) {
      setValue('techStack', [...techStack, tech]);
    }
  };

  const removeTech = (index: number) => {
    setValue('techStack', techStack.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-white/10"
          onClick={() => navigate('/admin/projects')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="text-muted-foreground italic">
            "Build your digital legacy, one project at a time."
          </p>
        </div>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          className="ml-auto bg-accent hover:bg-accent/90 text-black font-bold px-8 shadow-[0_0_30px_rgba(255,184,0,0.1)]"
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Project'}
        </Button>
        {isEditMode && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:bg-red-500/10"
            onClick={onDelete}
            disabled={isLoading}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="w-4 h-4 text-accent" />
                Project Essentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <Input 
                    {...register('title')}
                    placeholder="e.g. Portfolio v3" 
                    className="bg-white/5 border-white/10 focus:ring-accent"
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Slug (URL)</label>
                  <Input 
                    {...register('slug')}
                    placeholder="e.g. portfolio-v3" 
                    className="bg-white/5 border-white/10"
                  />
                  {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tagline</label>
                <Input 
                  {...register('tagline')}
                  placeholder="A short punchy description..." 
                  className="bg-white/5 border-white/10"
                />
                {errors.tagline && <p className="text-xs text-red-500">{errors.tagline.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Detailed Overview</label>
                <Textarea 
                  {...register('overview')}
                  placeholder="Describe the project goals, tech, and outcomes..." 
                  className="bg-white/5 border-white/10 min-h-[200px] resize-none"
                />
                {errors.overview && <p className="text-xs text-red-500">{errors.overview.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                Technical Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {techStack.map((tech, index) => (
                  <div key={tech} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 animate-in zoom-in-95 duration-200">
                    <span className="text-sm font-medium">{tech}</span>
                    <button 
                      type="button"
                      onClick={() => removeTech(index)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={addTech}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-white/20 hover:border-accent hover:text-accent transition-all text-sm text-muted-foreground"
                >
                  <Plus className="w-4 h-4" /> Add Tech
                </button>
              </div>
              {errors.techStack && <p className="text-xs text-red-500">{errors.techStack.message}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assets & Links */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent" />
                Featured Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <ImageUpload 
                value={watch('heroImage')} 
                onChange={(url) => setValue('heroImage', url)} 
                label="Project Hero Image"
              />
              {errors.heroImage && <p className="text-xs text-red-500">{errors.heroImage.message}</p>}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                External Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input {...register('liveUrl')} placeholder="Live Demo URL" className="pl-10 bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Github className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input {...register('githubUrl')} placeholder="Repository URL" className="pl-10 bg-white/5 border-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Featured Project</span>
                </div>
                <input 
                  type="checkbox" 
                  {...register('featured')}
                  className="w-4 h-4 accent-accent rounded bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Publication Status</label>
                <select 
                  {...register('status')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-accent outline-none"
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Exploration">Exploration</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
