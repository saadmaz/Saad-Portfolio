import React, { useEffect, useState } from 'react';
import { CommonService } from '@/shared/services/common-service';
import { Award } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Award as AwardIcon, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { toast } from "sonner";
import AdminEntityDialog from '@/components/admin/AdminEntityDialog';
import * as z from 'zod';

const awardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const awardFields = [
  { name: 'title', label: 'Award Title', type: 'text', placeholder: 'e.g. Dean\'s List' },
  { name: 'issuer', label: 'Issuer / Organization', type: 'text', placeholder: 'e.g. University of Toronto' },
  { name: 'date', label: 'Date Received', type: 'text', placeholder: 'e.g. June 2023 or 2023-06' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Briefly describe the award...' },
  { name: 'link', label: 'Link (Optional)', type: 'text', placeholder: 'https://...' },
] as const;

const AdminAwards = () => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAward, setCurrentAward] = useState<Award | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    setIsLoading(true);
    try {
      const data = await CommonService.getAwards();
      setAwards(data);
    } catch (error) {
      toast.error('Failed to load awards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentAward(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (award: Award) => {
    setCurrentAward(award);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this award?')) return;
    try {
      await CommonService.deleteAward(id);
      toast.success('Award deleted successfully');
      fetchAwards();
    } catch (error) {
      toast.error('Failed to delete award');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (currentAward) {
        await CommonService.updateAward(currentAward.id, data);
        toast.success('Award updated successfully');
      } else {
        await CommonService.createAward(data);
        toast.success('Award created successfully');
      }
      fetchAwards();
    } catch (error) {
      toast.error('Failed to save award');
      throw error;
    }
  };

  const filteredAwards = awards.filter(a =>
    (a.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.issuer?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Awards & Recognition</h1>
          <p className="text-muted-foreground">Manage your honors, awards, and certifications.</p>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add New Award
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search awards..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-accent/50 outline-none transition-all text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading && !isDialogOpen ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : filteredAwards.length > 0 ? (
          filteredAwards.map((award) => (
            <Card key={award.id} className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-all group overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                      <AwardIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{award.title}</h3>
                      <p className="text-sm text-muted-foreground">{award.issuer} • {award.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(award)} className="hover:bg-white/10">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(award.id)} className="hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
            <h3 className="text-lg font-medium text-white mb-1">No awards found</h3>
            <p className="text-muted-foreground">Start adding your achievements to show them off!</p>
          </div>
        )}
      </div>

      <AdminEntityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={currentAward ? 'Edit Award' : 'Add New Award'}
        fields={awardFields}
        schema={awardSchema}
        defaultValues={currentAward || {}}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminAwards;
