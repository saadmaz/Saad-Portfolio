import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, 
  User, 
  Clock, 
  Trash2, 
  CheckCircle, 
  Circle, 
  ExternalLink,
  Search,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { CommonService } from '@/shared/services/common-service';
import { Message } from '@/types';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => CommonService.getMessages()
  });

  const markReadMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => 
      CommonService.updateMessage(id, { read }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success('Message status updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CommonService.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success('Message deleted permanently');
    }
  });

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    try {
      // Handle Firestore Timestamp
      const d = date.toDate ? date.toDate() : new Date(date);
      return format(d, 'MMM d, h:mm a');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-white/5 animate-pulse rounded-lg" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 w-full bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-accent" />
            Contact <span className="text-accent">Messages</span>
          </h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">
            Manage inquiries and messages from the portal
          </p>
        </div>

        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search name, email or content..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-accent/40 focus:bg-white/[0.05] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-red-500/5 rounded-3xl border border-red-500/10 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">Error Loading Messages</h3>
          <p className="text-white/40">{(error as any).message || 'Failed to fetch messages'}</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 text-center">
          <Mail className="w-16 h-16 text-white/5 mb-4" />
          <h3 className="text-xl font-bold mb-2">No messages found</h3>
          <p className="text-white/40">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMessages.map((msg) => (
            <div 
              key={msg.id}
              className={`group relative bg-[#0a0a0a] border ${msg.read ? 'border-white/5' : 'border-accent/30 bg-accent/[0.02]'} rounded-2xl p-6 transition-all duration-300 hover:border-white/20`}
            >
              {!msg.read && (
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(255,184,0,0.5)]" />
              )}

              <div className="flex flex-col md:flex-row gap-6">
                {/* Meta info */}
                <div className="md:w-64 space-y-3">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/30 transition-colors">
                      <User className="w-5 h-5 text-accent/60" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold truncate">{msg.name}</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest truncate">{msg.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(msg.created_at)}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 rounded-lg flex-1 text-[10px] uppercase font-bold tracking-widest transition-all ${msg.read ? 'hover:bg-accent/10 hover:text-accent' : 'bg-accent/20 text-accent hover:bg-accent/30'}`}
                      onClick={() => markReadMutation.mutate({ id: msg.id, read: !msg.read })}
                    >
                      {msg.read ? <Circle className="w-3.5 h-3.5 mr-2" /> : <CheckCircle className="w-3.5 h-3.5 mr-2" />}
                      {msg.read ? 'Mark Unread' : 'Mark Read'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-lg flex-shrink-0 hover:bg-red-500/10 hover:text-red-500 transition-all"
                      onClick={() => {
                        if (confirm('Delete this message permanently?')) {
                          deleteMutation.mutate(msg.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {msg.subject && (
                    <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">
                      Subject: {msg.subject}
                    </div>
                  )}
                  <p className="text-white/70 leading-relaxed text-sm whitespace-pre-wrap italic">
                    "{msg.message}"
                  </p>
                </div>

                <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={`mailto:${msg.email}`}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-accent hover:bg-accent/10 transition-all flex items-center justify-center"
                    title="Reply via Email"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
