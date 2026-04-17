import React, { useEffect, useState } from 'react';
import { CommonService } from '@/shared/services/common-service';
import { ActivityLog } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { History, Shield, Info, AlertCircle, Clock, Search, Filter } from 'lucide-react';
import BackButton from '@/components/admin/BackButton';
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

  const getTimestamp = (timestamp: ActivityLog['timestamp']) => {
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-3">
          <BackButton to="/admin/dashboard" className="mt-1 flex-shrink-0" />
          <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-accent mb-3">LOG HISTORY</p>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-white" style={{ fontFamily: 'DM Sans' }}>
            Activity Logs
          </h1>
          <p className="text-sm text-white/50 font-medium max-w-md">
            Monitor administrative actions and security events across your portfolio platform.
          </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          placeholder="Search by admin email, action, or entity type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-11 bg-white/[0.04] border border-white/10 focus:border-accent/50 transition-all rounded-xl text-white placeholder:text-white/25 font-medium"
        />
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 w-full bg-white/[0.02] border border-white/5 rounded-xl animate-pulse" />
          ))
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card key={log.id} className="bg-white/[0.02] border border-white/5 hover:border-accent/30 hover:bg-white/[0.04] transition-all overflow-hidden group rounded-xl">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`p-2.5 rounded-lg border flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${getActionColor(log.action)}`}>
                    <Shield className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row: Admin + Action Type + Entity */}
                    <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                      <span className="font-semibold text-white text-sm truncate">{log.adminEmail}</span>
                      <span className={`text-[9px] px-2.5 py-1 rounded-full border font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[9px] text-accent font-black px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-full uppercase tracking-wider">
                        {log.entityType}
                      </span>
                    </div>

                    {/* Details text */}
                    <p className="text-xs text-white/40 line-clamp-1 group-hover:text-white/50 transition-colors leading-relaxed">
                      {log.details || `Performed ${log.action?.toLowerCase() || 'action'} on ${log.entityType || 'entry'}.`}
                    </p>
                  </div>
                </div>

                {/* Right side: Timestamp + ID */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 text-right">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-medium uppercase tracking-wider">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="hidden sm:inline">{getTimestamp(log.timestamp)}</span>
                    <span className="sm:hidden">{getTimestamp(log.timestamp).split(',')[0]}</span>
                  </div>
                  <span className="text-[9px] text-white/30 font-mono bg-white/[0.03] px-2 py-1 rounded border border-white/5">
                    {log.entityId ? log.entityId.slice(0, 8) : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/5">
              <History className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-black text-white/80 mb-2" style={{ fontFamily: 'DM Sans' }}>
              No logs found
            </h3>
            <p className="text-sm text-white/40 max-w-xs mx-auto">
              {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "Administrative actions will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
