import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CommonService } from '@/shared/services/common-service';
import { Education } from '@/types';
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap, Edit2, Calendar } from 'lucide-react';
import { toast } from "sonner";
import AdminEntityDialog from '@/components/admin/AdminEntityDialog';
import BackButton from '@/components/admin/BackButton';
import { LightboxModal } from '@/components/ui/LightboxModal';
import * as z from 'zod';

const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  institution: z.string().min(1, 'Institution is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().min(1, 'Institution logo is required'),
});

type EducationFormData = z.infer<typeof educationSchema>;

const educationFields = [
  { name: 'logo', label: 'Institution Logo', type: 'logo' as const, required: true },
  { name: 'degree', label: 'Degree / Certificate', type: 'text' as const, placeholder: 'e.g. Bachelor of Science' },
  { name: 'fieldOfStudy', label: 'Field of Study', type: 'text' as const, placeholder: 'e.g. Computer Science' },
  { name: 'institution', label: 'Institution / School', type: 'text' as const, placeholder: 'e.g. University of Toronto' },
  { name: 'startDate', label: 'Start Date', type: 'text' as const, placeholder: 'e.g. Sept 2020' },
  { name: 'endDate', label: 'End Date (Optional)', type: 'text' as const, placeholder: 'e.g. May 2024' },
  { name: 'grade', label: 'Grade / GPA (Optional)', type: 'text' as const, placeholder: 'e.g. 3.9/4.0' },
  { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Key achievements, clubs, etc.' },
] as const;

const AdminEducation = () => {
  const [education, setEducation] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEd, setCurrentEd] = useState<Education | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => { fetchEducation(); }, []);

  const fetchEducation = async () => {
    setIsLoading(true);
    try {
      const data = await CommonService.getEducation();
      setEducation(data);
    } catch {
      toast.error('Failed to load education history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => { setCurrentEd(null); setIsDialogOpen(true); };
  const handleEdit = (ed: Education) => { setCurrentEd(ed); setIsDialogOpen(true); };

  const handleDeleteRequest = () => {
    if (!currentEd) return;
    setIsDialogOpen(false);
    setDeleteTarget({ id: currentEd.id, label: currentEd.degree });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await CommonService.deleteEducation(deleteTarget.id);
      toast.success('Education deleted successfully');
      fetchEducation();
    } catch { toast.error('Failed to delete education'); }
    finally { setDeleteTarget(null); }
  };

  const handleSubmit = async (data: EducationFormData) => {
    try {
      if (currentEd) {
        await CommonService.updateEducation(currentEd.id, data);
        toast.success('Education updated successfully');
      } else {
        await CommonService.createEducation(data);
        toast.success('Education created successfully');
      }
      fetchEducation();
    } catch (error) {
      toast.error('Failed to save education');
      throw error;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-3">
          <BackButton to="/admin/dashboard" className="mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-accent mb-2">ACADEMIC</p>
            <h1 className="text-4xl font-black tracking-tight mb-1 text-foreground" style={{ fontFamily: 'DM Sans' }}>Education</h1>
            <p className="text-sm text-muted-foreground font-medium">Manage your academic background and degrees.</p>
          </div>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-black font-black h-11 px-6 rounded-lg flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Education
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && !isDialogOpen ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-[240px] w-full bg-secondary border border-border rounded-xl animate-pulse" />
          ))
        ) : education.length > 0 ? (
          education.map((edu, index) => (
            <button
              key={edu.id}
              type="button"
              onClick={() => handleEdit(edu)}
              className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:border-accent/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left h-[240px] flex flex-col cursor-pointer animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms`, animationDuration: '300ms', animationFillMode: 'both' }}
            >
              {/* Hover tint overlay */}
              <div className="absolute inset-0 bg-accent/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

              {/* Edit icon badge */}
              <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-7 h-7 rounded-lg bg-card/90 backdrop-blur-sm border border-border/80 flex items-center justify-center text-accent shadow-sm">
                  <Edit2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Logo area — fixed 96px height */}
              <div className="h-[96px] bg-secondary border-b border-border flex items-center justify-center p-4 flex-shrink-0">
                {edu.logo ? (
                  <img
                    src={edu.logo}
                    alt={`${edu.institution} logo`}
                    className="h-12 w-12 object-contain"
                    onClick={(e) => { e.stopPropagation(); setLightbox(edu.logo!); }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-purple-400" />
                  </div>
                )}
              </div>

              {/* Content — fills remaining height */}
              <div className="p-4 flex flex-col flex-1 min-h-0">
                <h3
                  className="font-black text-foreground text-sm line-clamp-2 group-hover:text-accent transition-colors leading-snug"
                  style={{ fontFamily: 'DM Sans' }}
                >
                  {edu.degree} in {edu.fieldOfStudy}
                </h3>
                <p className="text-xs text-accent font-semibold mt-0.5 truncate">{edu.institution}</p>

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground/70 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-accent/70" />
                    {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                  </span>
                  {edu.grade && (
                    <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded border border-border text-foreground">
                      {edu.grade}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-base font-black text-muted-foreground" style={{ fontFamily: 'DM Sans' }}>No education history</h3>
            <p className="text-sm text-muted-foreground/60 mt-1 font-medium">Add your degrees and institutions to complete your profile.</p>
            <Button onClick={handleAdd} className="mt-4 bg-accent hover:bg-accent/90 text-black font-black h-10 px-5 rounded-lg">
              <Plus className="w-4 h-4 mr-1.5" /> Add Education
            </Button>
          </div>
        )}
      </div>

      <LightboxModal
        images={lightbox ? [lightbox] : []}
        currentIndex={0}
        isOpen={!!lightbox}
        onClose={() => setLightbox(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Education?"
        description={`"${deleteTarget?.label}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />

      <AdminEntityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={currentEd ? 'Edit Education' : 'Add Education'}
        fields={educationFields}
        schema={educationSchema}
        defaultValues={currentEd || {}}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onDelete={currentEd ? handleDeleteRequest : undefined}
      />
    </div>
  );
};

export default AdminEducation;
