import React, { useEffect, useState } from 'react';
import { CommonService } from '@/shared/services/common-service';
import { Event } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Calendar, MapPin, Edit2, Trash2, ExternalLink, Globe } from 'lucide-react';
import { toast } from "sonner";
import AdminEntityDialog from '@/components/admin/AdminEntityDialog';
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await CommonService.deleteEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Delete failed');
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Events</h1>
          <p className="text-muted-foreground">Manage your past and upcoming events, workshops, and speaking engagements.</p>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add New Event
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search events..."
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
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Card key={event.id} className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-all group overflow-hidden">
              <CardContent className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <Globe className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg group-hover:text-accent transition-colors truncate">{event.title}</h3>
                  <p className="text-white/60 font-semibold">{event.organizer} • {event.type}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 mt-1">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent" /> {event.date}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" /> {event.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} className="hover:bg-white/10">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="hover:bg-red-500/10 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
            <h3 className="text-lg font-medium text-white mb-1">No events found</h3>
            <p className="text-muted-foreground">Click the button above to add your first event.</p>
          </div>
        )}
      </div>

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
