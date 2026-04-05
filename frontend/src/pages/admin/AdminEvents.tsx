import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

import { CommonService } from '@/shared/services/common-service';
import { Event } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Calendar, MapPin, Edit2, Trash2, ExternalLink, Globe } from 'lucide-react';
import { toast } from "sonner";
import AdminEntityDialog from '@/components/admin/AdminEntityDialog';
import BackButton from '@/components/admin/BackButton';
import * as z from 'zod';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  organizer: z.string().min(1, 'Organizer is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image: z.string().optional(),
});

const eventFields = [
  { name: 'title', label: 'Event Title', type: 'text', placeholder: 'e.g. Google I/O 2024' },
  { name: 'organizer', label: 'Organizer', type: 'text', placeholder: 'e.g. Google' },
  { name: 'date', label: 'Event Date', type: 'text', placeholder: 'e.g. May 14, 2024' },
  { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Mountain View, CA or Online' },
  { name: 'type', label: 'Event Type', type: 'text', placeholder: 'e.g. Workshop, Conference' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Details about the event...' },
  { name: 'link', label: 'Registration Link (Optional)', type: 'text', placeholder: 'https://...' },
  { name: 'image', label: 'Image URL (Optional)', type: 'text', placeholder: 'https://...' },
] as const;

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await CommonService.getEvents();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentEvent(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setCurrentEvent(event);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, label: string) => setDeleteTarget({ id, label });
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await CommonService.deleteEvent(deleteTarget.id);
      toast.success('Event deleted');
      fetchEvents();
    } catch { toast.error('Delete failed'); }
    finally { setDeleteTarget(null); }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (currentEvent) {
        await CommonService.updateEvent(currentEvent.id, data);
        toast.success('Event updated');
      } else {
        await CommonService.createEvent(data);
        toast.success('Event created');
      }
      fetchEvents();
    } catch (error) {
      toast.error('Failed to save event');
      throw error;
    }
  };

  const filteredEvents = events.filter(e =>
    (e.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.organizer?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-3">
          <BackButton to="/admin/dashboard" className="mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-accent mb-3">SCHEDULE</p>
            <h1 className="text-4xl font-black tracking-tight mb-2 text-white" style={{ fontFamily: 'DM Sans' }}>
              Events
            </h1>
            <p className="text-sm text-white/50 font-medium">
              Manage past and upcoming events, workshops, and speaking engagements.
            </p>
          </div>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-black font-black h-11 px-6 rounded-lg flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Event
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-lg border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search events..."
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
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Card key={event.id} className="bg-white/[0.02] border-white/5 hover:border-accent/30 hover:bg-white/[0.04] transition-all group rounded-lg">
              <CardContent className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <Globe className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-base group-hover:text-accent transition-colors truncate" style={{ fontFamily: 'DM Sans' }}>
                    {event.title}
                  </h3>
                  <p className="text-white/60 font-semibold text-sm">{event.organizer} • {event.type}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/40 font-medium mt-1.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent/60" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent/60" /> {event.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} className="h-9 w-9 hover:bg-white/10 text-white/30 hover:text-white rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id, event.title)} className="h-9 w-9 hover:bg-red-500/10 text-red-500/70 hover:text-red-400 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12 text-center">
            <h3 className="text-lg font-black text-white/70" style={{ fontFamily: 'DM Sans' }}>
              No events found
            </h3>
            <p className="text-sm text-white/40 mt-1 font-medium">
              {searchQuery ? 'Try a different search.' : 'Add your first event to get started.'}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Event?" description={`"${deleteTarget?.label}" will be permanently deleted.`} confirmLabel="Delete" onConfirm={handleConfirmDelete} />
      <AdminEntityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={currentEvent ? 'Edit Event' : 'Add New Event'}
        fields={eventFields}
        schema={eventSchema}
        defaultValues={currentEvent || {}}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminEvents;
