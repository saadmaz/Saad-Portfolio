import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CommonService } from '@/shared/services/common-service';
import { Education } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, GraduationCap, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { toast } from "sonner";
import AdminEntityDialog from '@/components/admin/AdminEntityDialog';
import BackButton from '@/components/admin/BackButton';
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
});

type EducationFormData = z.infer<typeof educationSchema>;

const educationFields = [
  { name: 'degree', label: 'Degree / Certificate', type: 'text', placeholder: 'e.g. Bachelor of Science' },
  { name: 'fieldOfStudy', label: 'Field of Study', type: 'text', placeholder: 'e.g. Computer Science' },
  { name: 'institution', label: 'Institution / School', type: 'text', placeholder: 'e.g. University of Toronto' },
  { name: 'startDate', label: 'Start Date', type: 'text', placeholder: 'e.g. Sept 2020' },
  { name: 'endDate', label: 'End Date (Optional)', type: 'text', placeholder: 'e.g. May 2024' },
  { name: 'grade', label: 'Grade / GPA (Optional)', type: 'text', placeholder: 'e.g. 3.9/4.0' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Key achievements, clubs, etc.' },
] as const;

const AdminEducation = () => {
  const [education, setEducation] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEd, setCurrentEd] = useState<Education | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    setIsLoading(true);
    try {
      const data = await CommonService.getEducation();
      setEducation(data);
    } catch (error) {
      toast.error('Failed to load education history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentEd(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (ed: Education) => {
    setCurrentEd(ed);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, label: string) => setDeleteTarget({ id, label });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton to="/admin/dashboard" className="flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Education</h1>
            <p className="text-muted-foreground">Manage your academic background and degrees.</p>
          </div>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add Education
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading && !isDialogOpen ? (
          [1, 2].map(i => (
            <div key={i} className="h-32 w-full bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : education.length > 0 ? (
          education.map((edu) => (
            <Card key={edu.id} className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-all overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 flex-shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{edu.degree} in {edu.fieldOfStudy}</h3>
                      <p className="text-accent font-medium">{edu.institution}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {edu.startDate} - {edu.isCurrent ? 'Present' : edu.endDate}</span>
                        {edu.grade && <span className="text-white/80 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">Grade: {edu.grade}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(edu)} className="hover:bg-white/10">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id, edu.degree)} className="hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
            <h3 className="text-lg font-medium text-white mb-1">No education history</h3>
            <p className="text-muted-foreground">Add your degrees and institutions to complete your profile.</p>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Education?" description={`"${deleteTarget?.label}" will be permanently deleted.`} confirmLabel="Delete" onConfirm={handleConfirmDelete} />
      <AdminEntityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={currentEd ? 'Edit Education' : 'Add Education'}
        fields={educationFields}
        schema={educationSchema}
        defaultValues={currentEd || {}}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminEducation;
