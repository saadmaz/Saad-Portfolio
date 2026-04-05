import React, { useEffect, useState } from 'react';
import { CommonService } from '@/shared/services/common-service';
import { Newsletter } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Mail, Edit2, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { toast } from "sonner";
import AdminEntityDialog from '@/components/admin/AdminEntityDialog';
import * as z from 'zod';

const newsletterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Type is required'),
  content_url: z.string().url('Must be a valid URL'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional(),
});

const newsletterFields = [
  { name: 'title', label: 'Newsletter Title', type: 'text', placeholder: 'e.g. Founder Journey #1' },
  { name: 'date', label: 'Publication Date', type: 'text', placeholder: 'e.g. March 2024' },
  { 
    name: 'type', 
    label: 'Newsletter Type', 
    type: 'select', 
    placeholder: 'Select type...',
    options: [
      { label: 'Founder Weekly', value: 'founder' },
      { label: 'CSE Insights', value: 'cse' },
      { label: 'General', value: 'general' }
    ]
  },
  { name: 'content_url', label: 'Content URL (Link to Newsletter)', type: 'text', placeholder: 'https://...' },
  { name: 'description', label: 'Brief Description', type: 'textarea', placeholder: 'What was this newsletter about?' },
  { name: 'image', label: 'Cover Image URL (Optional)', type: 'text', placeholder: 'https://...' },
] as const;

const AdminNewsletters = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNewsletter, setCurrentNewsletter] = useState<Newsletter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    setIsLoading(true);
    try {
      const data = await CommonService.getNewsletters();
      setNewsletters(data);
    } catch (error) {
      toast.error('Failed to load newsletters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentNewsletter(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (newsletter: Newsletter) => {
    setCurrentNewsletter(newsletter);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this newsletter?')) return;
    try {
      await CommonService.deleteNewsletter(id);
      toast.success('Newsletter deleted');
      fetchNewsletters();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (currentNewsletter) {
        await CommonService.updateNewsletter(currentNewsletter.id, data);
        toast.success('Newsletter updated');
      } else {
        await CommonService.createNewsletter(data);
        toast.success('Newsletter created');
      }
      fetchNewsletters();
    } catch (error) {
      toast.error('Failed to save newsletter');
      throw error;
    }
  };

  const filteredNewsletters = newsletters.filter(n =>
    (n.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.type?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Newsletters</h1>
          <p className="text-muted-foreground">Manage your newsletter publications and content links.</p>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add New Newsletter
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search newsletters..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-accent/50 outline-none transition-all text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading && !isDialogOpen ? (
          [1, 2].map(i => (
            <div key={i} className="h-28 w-full bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : filteredNewsletters.length > 0 ? (
          filteredNewsletters.map((newsletter) => (
            <Card key={newsletter.id} className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-all group overflow-hidden">
              <CardContent className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <Mail className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-lg group-hover:text-accent transition-colors truncate">{newsletter.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/20">{newsletter.type}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent" /> {newsletter.date}</span>
                    <a href={newsletter.content_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-accent hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> View Content
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(newsletter)} className="hover:bg-white/10">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(newsletter.id)} className="hover:bg-red-500/10 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
            <h3 className="text-lg font-medium text-white mb-1">No newsletters found</h3>
            <p className="text-muted-foreground">Click the button above to publish your first newsletter.</p>
          </div>
        )}
      </div>

      <AdminEntityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={currentNewsletter ? 'Edit Newsletter' : 'Add New Newsletter'}
        fields={newsletterFields}
        schema={newsletterSchema}
        defaultValues={currentNewsletter || {}}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminNewsletters;
