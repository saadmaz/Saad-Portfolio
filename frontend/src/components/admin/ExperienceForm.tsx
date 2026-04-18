import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Briefcase,
  MapPin,
  Calendar,
  Building2,
  Sparkles,
  Plus
} from 'lucide-react';
import { CommonService } from '@/shared/services/common-service';
import { Experience } from '@/types';
import { toast } from "sonner";

const experienceSchema = z.object({
  company: z.string().min(2, 'Company is required'),
  position: z.string().min(2, 'Position is required'),
  employmentType: z.string().default('Full-time'),
  startDate: z.string().min(4, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  isCurrent: z.boolean().default(false),
  location: z.string().min(2, 'Location is required'),
  workMode: z.string().default('Remote'),
  description: z.string().min(10, 'Description is too short'),
  responsibilities: z.array(z.string()).min(1, 'Add at least one responsibility'),
  technologies: z.array(z.string()).min(1, 'Add at least one technology'),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

const ExperienceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newTech, setNewTech] = useState('');
  const isEditMode = !!id && id !== 'new';

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      employmentType: 'Full-time',
      workMode: 'Remote',
      isCurrent: false,
      responsibilities: [''],
      technologies: []
    }
  });

  const responsibilities = watch('responsibilities') || [];
  const technologies = watch('technologies') || [];

  const loadExperience = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await CommonService.getWorkExperience();
      const item = data.find(exp => exp.id.toString() === id);
      if (item) {
        reset({
          company: item.company,
          position: item.position,
          employmentType: item.employmentType,
          startDate: item.startDate,
          endDate: item.endDate || '',
          isCurrent: item.isCurrent,
          location: item.location,
          workMode: item.workMode,
          description: item.description,
          responsibilities: item.responsibilities ?? [''],
          technologies: item.technologies ?? [],
        });
      }
    } catch (error) {
      toast.error('Failed to load experience');
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isEditMode) {
      loadExperience();
    }
  }, [isEditMode, loadExperience]);

  const onSubmit = async (data: ExperienceFormValues) => {
    try {
      setIsLoading(true);
      if (isEditMode) {
        await CommonService.updateExperience(id!, data);
        toast.success('Experience updated');
      } else {
        await CommonService.createExperience(data);
        toast.success('Experience added');
      }
      navigate('/admin/experience');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Operation failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-white/10"
          onClick={() => navigate('/admin/experience')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Experience' : 'New Role'}
          </h1>
          <p className="text-muted-foreground italic">
            "Your journey is a testament to your growth."
          </p>
        </div>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          className="ml-auto bg-accent hover:bg-accent/90 text-black font-bold px-8"
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Experience
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-accent" />
                    Role Details
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Position</label>
                  <Input {...register('position')} placeholder="e.g. Senior Frontend Engineer" className="bg-white/5 border-white/10" />
                  {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Company</label>
                  <Input {...register('company')} placeholder="e.g. Google" className="bg-white/5 border-white/10" />
                  {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                  <Input {...register('startDate')} placeholder="e.g. June 2021" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">End Date</label>
                  <Input 
                    {...register('endDate')} 
                    placeholder="e.g. Present" 
                    disabled={watch('isCurrent')}
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" {...register('isCurrent')} className="w-4 h-4 accent-accent" />
                <label className="text-sm">I currently work here</label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Overview Description</label>
                <Textarea {...register('description')} className="bg-white/5 border-white/10" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Responsibilities
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {responsibilities.map((_, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder={`Responsibility ${index + 1}`} 
                    className="bg-white/5 border-white/10"
                    {...register(`responsibilities.${index}`)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500"
                    onClick={() => setValue('responsibilities', responsibilities.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full border-dashed border-white/20"
                onClick={() => setValue('responsibilities', [...responsibilities, ''])}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Responsibility
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    Location & Mode
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Location</label>
                  <Input {...register('location')} className="bg-white/5 border-white/10 h-8" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Work Mode</label>
                  <select {...register('workMode')} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm">
                    <option value="Remote">Remote</option>
                    <option value="In-Office">In-Office</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
               </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-accent" />
                    Technologies
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
               <div className="flex flex-wrap gap-2">
                  {technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-white/10 text-xs border border-white/10 flex items-center gap-1">
                        {tech}
                        <button onClick={() => setValue('technologies', technologies.filter((_, idx) => idx !== i))}><Trash2 className="w-2 h-2" /></button>
                    </span>
                  ))}
                  <div className="flex gap-1.5 w-full mt-1">
                    <input
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const t = newTech.trim();
                          if (t && !technologies.includes(t)) {
                            setValue('technologies', [...technologies, t]);
                            setNewTech('');
                          }
                        }
                      }}
                      placeholder="e.g. React, Node.js…"
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/25 focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none min-w-0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/50 hover:text-white rounded-lg h-8 px-2.5 text-xs font-bold flex-shrink-0"
                      onClick={() => {
                        const t = newTech.trim();
                        if (t && !technologies.includes(t)) {
                          setValue('technologies', [...technologies, t]);
                          setNewTech('');
                        }
                      }}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExperienceForm;
