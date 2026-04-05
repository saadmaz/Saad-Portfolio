import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CommonService } from '@/shared/services/common-service';
import { Hackathon } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trophy, Edit2, Trash2, Calendar, Layout } from 'lucide-react';
import { toast } from "sonner";
import AdminEntityDialog from '@/components/admin/AdminEntityDialog';
import BackButton from '@/components/admin/BackButton';
import * as z from 'zod';

const hackathonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  organizer: z.string().min(1, 'Organizer is required'),
  date: z.string().min(1, 'Date is required'),
  role: z.string().min(1, 'Role is required'),
  projectTitle: z.string().optional(),
  achievement: z.string().optional(),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const hackathonFields = [
  { name: 'name', label: 'Hackathon Name', type: 'text', placeholder: 'e.g. Hack The North' },
  { name: 'organizer', label: 'Organizer', type: 'text', placeholder: 'e.g. University of Waterloo' },
  { name: 'date', label: 'Date', type: 'text', placeholder: 'e.g. September 2023' },
  { name: 'role', label: 'Your Role', type: 'text', placeholder: 'e.g. Lead Developer' },
  { name: 'projectTitle', label: 'Project Built (Optional)', type: 'text', placeholder: 'e.g. AgriGuard' },
  { name: 'achievement', label: 'Achievement / Award (Optional)', type: 'text', placeholder: 'e.g. First Place' },
  { name: 'link', label: 'Project/Event Link (Optional)', type: 'text', placeholder: 'https://...' },
] as const;

const AdminHackathons = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentHackathon, setCurrentHackathon] = useState<Hackathon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    setIsLoading(true);
    try {
      const data = await CommonService.getHackathons();
      setHackathons(data);
    } catch (error) {
      toast.error('Failed to load hackathons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentHackathon(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (hack: Hackathon) => {
    setCurrentHackathon(hack);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, label: string) => setDeleteTarget({ id, label });
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await CommonService.deleteHackathon(deleteTarget.id);
      toast.success('Hackathon deleted successfully');
      fetchHackathons();
    } catch { toast.error('Failed to delete hackathon'); }
    finally { setDeleteTarget(null); }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (currentHackathon) {
        await CommonService.updateHackathon(currentHackathon.id, data);
        toast.success('Hackathon updated successfully');
      } else {
        await CommonService.createHackathon(data);
        toast.success('Hackathon created successfully');
      }
      fetchHackathons();
    } catch (error) {
      toast.error('Failed to save hackathon');
      throw error;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton to="/admin/dashboard" className="flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Hackathons</h1>
            <p className="text-muted-foreground">Manage your hackathon participations and achievements.</p>
          </div>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add Hackathon
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading && !isDialogOpen ? (
          [1, 2].map(i => (
            <div key={i} className="h-32 w-full bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : hackathons.length > 0 ? (
          hackathons.map((hack) => (
            <Card key={hack.id} className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-all overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-lg">{hack.name}</h3>
                        {hack.achievement && (
                          <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                            {hack.achievement}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Layout className="w-3.5 h-3.5" /> {hack.role}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {hack.date}</span>
                        <span className="text-accent/80">{hack.organizer}</span>
                      </div>
                      {hack.projectTitle && (
                        <p className="mt-3 text-sm text-white/80 font-medium">
                          Project: <span className="text-white">{hack.projectTitle}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(hack)} className="hover:bg-white/10">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(hack.id, hack.name)} className="hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
            <h3 className="text-lg font-medium text-white mb-1">No hackathons listed</h3>
            <p className="text-muted-foreground">Add your hackathon experiences to highlight your rapid prototyping skills.</p>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Hackathon?" description={`"${deleteTarget?.label}" will be permanently deleted.`} confirmLabel="Delete" onConfirm={handleConfirmDelete} />
      <AdminEntityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={currentHackathon ? 'Edit Hackathon' : 'Add Hackathon'}
        fields={hackathonFields}
        schema={hackathonSchema}
        defaultValues={currentHackathon || {}}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminHackathons;
