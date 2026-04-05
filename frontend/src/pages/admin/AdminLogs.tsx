import React, { useEffect, useState } from 'react';
import { CommonService } from '@/shared/services/common-service';
import { ActivityLog } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { History, Shield, Info, AlertCircle, Clock, Search, Filter } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";

const AdminLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredLogs(
      logs.filter(log =>
        (log.adminEmail?.toLowerCase().includes(query)) ||
        (log.action?.toLowerCase().includes(query)) ||
        (log.entityType?.toLowerCase().includes(query)) ||
        (log.details?.toLowerCase().includes(query))
      )
    );
  }, [searchQuery, logs]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await CommonService.getActivityLogs();
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'UPDATE': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'DELETE': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'LOGIN': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, h:mm a');
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">Activity Logs</h1>
          <p className="text-muted-foreground">Monitor administrative actions and security events across the platform.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus:border-accent/50 transition-all rounded-xl shadow-2xl shadow-black/20"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 w-full bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card key={log.id} className="bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all overflow-hidden group">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${getActionColor(log.action)}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-bold text-white truncate max-w-[200px]">{log.adminEmail}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-widest ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-accent font-semibold px-2 py-0.5 bg-accent/5 border border-accent/10 rounded-full">
                        {log.entityType}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 line-clamp-1 group-hover:text-white/70 transition-colors">
                      {log.details || `Performed ${log.action?.toLowerCase() || 'action'} on ${log.entityType || 'entry'}.`}
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {getTimestamp(log.timestamp)}
                  </div>
                  <span className="text-[10px] text-muted-foreground/40 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                    ID: {log.entityId ? log.entityId.slice(0, 8) : 'unknown'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-20 text-center">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner">
              <History className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No logs found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "Administrative actions will appear here once you start managing your content."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
