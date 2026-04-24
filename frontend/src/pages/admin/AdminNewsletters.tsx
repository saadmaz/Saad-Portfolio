import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CommonService } from '@/shared/services/common-service';
import { Newsletter } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Mail, Edit2, Trash2, ExternalLink, Calendar, DatabaseZap } from 'lucide-react';
import { toast } from "sonner";
import AdminEntityDialog from '@/components/admin/AdminEntityDialog';
import BackButton from '@/components/admin/BackButton';
import * as z from 'zod';

const newsletterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Type is required'),
  content_url: z.string().url('Must be a valid URL'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;
type SeedNewsletter = Omit<Newsletter, 'id'>;

const SEED_DATA: SeedNewsletter[] = [
  { type: "cse", title: "CSE WEEKLY ROUNDUP – Week 05, 2026", date: "2026-01-31", description: "The Colombo Stock Exchange moved into a consolidation phase this week.", content_url: "https://www.linkedin.com/pulse/cse-weekly-roundup-week-05-2026-saad-mazhar--uxytc" },
  { type: "founder", title: "Building Startups in 2026", date: "2026-01-30", description: "Insights on building and scaling startups in the new year", content_url: "https://newsletter.saadmalik.dev/45" },
  { type: "cse", title: "Advanced TypeScript Patterns", date: "2026-01-28", description: "Deep dive into TypeScript's advanced type system", content_url: "https://newsletter.saadmalik.dev/cse/25" },
  { type: "founder", title: "Founders' Brief – Scaling Beyond Sri Lanka", date: "2026-01-24", description: "Deep dive into the journey of moving from a local MVP to a global product.", content_url: "https://www.linkedin.com/newsletters/your-founder-newsletter-id" },
  { type: "founder", title: "The Future of Funding", date: "2026-01-23", description: "How funding landscape is changing for startups", content_url: "https://newsletter.saadmalik.dev/44" },
  { type: "cse", title: "React 19 New Features", date: "2026-01-21", description: "Exploring the latest features in React 19", content_url: "https://newsletter.saadmalik.dev/cse/24" },
  { type: "cse", title: "CSE WEEKLY ROUNDUP – Week 04, 2026", date: "2026-01-26", description: "After touching fresh highs, the CSE took a breather as profit-taking surfaced, but the bigger picture stayed intact.", content_url: "https://www.linkedin.com/pulse/cse-weekly-roundup-week-04-2026-saad-mazhar--lwjhc" },
  { type: "founder", title: "10 Lessons from Failed Startups", date: "2026-01-16", description: "Critical lessons learned from startups that didn't make it", content_url: "https://newsletter.saadmalik.dev/43" },
  { type: "founder", title: "Founders' Brief – The Art of the Pivot", date: "2026-01-15", description: "How local startups are navigating the current funding winter.", content_url: "https://www.linkedin.com/pulse/cse-weekly-roundup-week-ending-january-09-2026-saad-mazhar--3d2uc" },
  { type: "cse", title: "Web Performance Tips", date: "2026-01-14", description: "Practical tips for optimizing web performance", content_url: "https://newsletter.saadmalik.dev/cse/23" },
  { type: "cse", title: "CSE WEEKLY ROUNDUP – Week 03, 2026", date: "2026-01-18", description: "The Colombo Stock Exchange moved into a more measured but confident phase this week.", content_url: "https://www.linkedin.com/pulse/cse-weekly-roundup-week-03-2026-saad-mazhar--1cznc" },
  { type: "cse", title: "CSE WEEKLY ROUNDUP – Week 02, 2026", date: "2026-01-11", description: "The Colombo Stock Exchange witnessed a roller-coaster week, starting with a dramatic market-wide halt but ending on a bullish high.", content_url: "https://www.linkedin.com/pulse/cse-weekly-roundup-week-ending-january-09-2026-saad-mazhar--3d2uc" },
];

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
  const [isSeedLoading, setIsSeedLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNewsletter, setCurrentNewsletter] = useState<Newsletter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

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

  const handleSeed = async () => {
    try {
      setIsSeedLoading(true);
      await Promise.all(SEED_DATA.map(n => CommonService.createNewsletter(n)));
      await fetchNewsletters();
      toast.success('12 newsletters seeded successfully');
    } catch {
      toast.error('Failed to seed newsletters');
    } finally {
      setIsSeedLoading(false);
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

  const handleDelete = (id: string, label: string) => setDeleteTarget({ id, label });
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await CommonService.deleteNewsletter(deleteTarget.id);
      toast.success('Newsletter deleted');
      fetchNewsletters();
    } catch { toast.error('Delete failed'); }
    finally { setDeleteTarget(null); }
  };

  const handleSubmit = async (data: NewsletterFormData) => {
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-3">
          <BackButton to="/admin/dashboard" className="mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-accent mb-3">PUBLICATIONS</p>
            <h1 className="text-4xl font-black tracking-tight mb-2 text-white" style={{ fontFamily: 'DM Sans' }}>
              Newsletters
            </h1>
            <p className="text-sm text-white/50 font-medium">
              Manage your newsletter publications and content links.
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          {!isLoading && newsletters.length === 0 && (
            <Button
              variant="outline"
              onClick={handleSeed}
              disabled={isSeedLoading}
              className="border-accent/30 hover:bg-accent/10 rounded-xl px-4 h-11 text-accent hover:text-accent transition-all shadow-lg"
            >
              <DatabaseZap className="w-4 h-4 mr-2" /> {isSeedLoading ? 'Seeding...' : 'Seed Default Data'}
            </Button>
          )}
          <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-black font-black h-11 px-6 rounded-lg">
            <Plus className="w-4 h-4 mr-2" /> Add Newsletter
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-lg border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search newsletters..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/50 outline-none transition-all text-white placeholder:text-white/25 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading && !isDialogOpen ? (
          [1, 2].map(i => (
            <div key={i} className="h-28 w-full bg-white/[0.02] border border-white/5 rounded-lg animate-pulse" />
          ))
        ) : filteredNewsletters.length > 0 ? (
          filteredNewsletters.map((newsletter) => (
            <Card key={newsletter.id} className="bg-white/[0.02] border-white/5 hover:border-accent/30 hover:bg-white/[0.04] transition-all group rounded-lg">
              <CardContent className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <Mail className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black text-white text-base group-hover:text-accent transition-colors truncate" style={{ fontFamily: 'DM Sans' }}>
                      {newsletter.title}
                    </h3>
                    <span className="px-2.5 py-1 rounded-md bg-accent/20 text-accent text-[9px] font-black uppercase tracking-wider border border-accent/20 flex-shrink-0">
                      {newsletter.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/40 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent/60" /> {newsletter.date}
                    </span>
                    <a href={newsletter.content_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-accent hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> View Content
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(newsletter)} className="h-9 w-9 hover:bg-white/10 text-white/30 hover:text-white rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(newsletter.id, newsletter.title)} className="h-9 w-9 hover:bg-red-500/10 text-red-500/70 hover:text-red-400 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12 text-center">
            <h3 className="text-lg font-black text-white/70" style={{ fontFamily: 'DM Sans' }}>
              No newsletters found
            </h3>
            <p className="text-sm text-white/40 mt-1 font-medium">
              {searchQuery ? 'Try a different search.' : 'Publish your first newsletter to get started.'}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Newsletter?" description={`"${deleteTarget?.label}" will be permanently deleted.`} confirmLabel="Delete" onConfirm={handleConfirmDelete} />
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
