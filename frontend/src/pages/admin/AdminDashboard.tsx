import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Code,
  BookOpen,
  Briefcase,
  TrendingUp,
  Clock,
  Zap,
  Award,
  MessageSquare,
  History,
  Shield,
  ExternalLink,
  Mail,
  FileCheck,
  CalendarDays,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ProjectService } from '@/services/project-service';
import { BlogService } from '@/services/blog-service';
import { CommonService } from '@/shared/services/common-service';
import { ActivityLog } from '@/types';
import { toast } from "sonner";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// ── Tiny sparkline placeholder data ──────────────────────────────
const spark = (seed: number) =>
  Array.from({ length: 7 }, (_, i) => ({
    v: Math.max(1, Math.round(seed * 0.6 + Math.sin(i * seed * 0.8) * seed * 0.3 + i * 0.4)),
  }));

const Sparkline = ({ data, color }: { data: { v: number }[]; color: string }) => (
  <ResponsiveContainer width="100%" height={40}>
    <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`g-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="v"
        stroke={color}
        strokeWidth={1.5}
        fill={`url(#g-${color.replace('#', '')})`}
        dot={false}
        isAnimationActive={false}
      />
      <RechartsTooltip
        contentStyle={{ display: 'none' }}
        cursor={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// ── Stat card config ──────────────────────────────────────────────
interface StatCard {
  key: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  path: string;
  alert?: boolean;
}

const makeStats = (): StatCard[] => [
  { key: 'projects',     label: 'Projects',       value: '-', icon: Code,       color: '#3b82f6', path: '/admin/projects' },
  { key: 'blogs',        label: 'Blog Posts',      value: '-', icon: BookOpen,   color: '#a855f7', path: '/admin/blogs' },
  { key: 'experience',   label: 'Experience',      value: '-', icon: Briefcase,  color: '#22d3ee', path: '/admin/experience' },
  { key: 'skills',       label: 'Skill Sets',      value: '-', icon: Zap,        color: '#2dd4bf', path: '/admin/skills' },
  { key: 'certificates', label: 'Certificates',    value: '-', icon: FileCheck,  color: '#10b981', path: '/admin/certificates' },
  { key: 'awards',       label: 'Awards',          value: '-', icon: Award,      color: '#f59e0b', path: '/admin/awards' },
  { key: 'testimonials', label: 'Testimonials',    value: '-', icon: MessageSquare, color: '#ec4899', path: '/admin/testimonials' },
  { key: 'messages',     label: 'Unread Messages', value: '-', icon: Mail,       color: '#ef4444', path: '/admin/messages', alert: true },
];

const getActionColor = (action: string) => {
  switch (action) {
    case 'CREATE': return { text: 'text-emerald-400', border: 'border-l-emerald-500', bg: 'bg-emerald-500/10' };
    case 'UPDATE': return { text: 'text-blue-400',    border: 'border-l-blue-500',    bg: 'bg-blue-500/10' };
    case 'DELETE': return { text: 'text-red-400',     border: 'border-l-red-500',     bg: 'bg-red-500/10' };
    default:       return { text: 'text-amber-400',   border: 'border-l-amber-500',   bg: 'bg-amber-500/10' };
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatCard[]>(makeStats());
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projects, blogs, awards, testimonials, logs, messages, experience, skills, certificates] = await Promise.all([
          ProjectService.getAll(),
          BlogService.getAll(),
          CommonService.getAwards(),
          CommonService.getTestimonials(),
          CommonService.getActivityLogs(),
          CommonService.getMessages(),
          CommonService.getWorkExperience(),
          CommonService.getSkills(),
          CommonService.getCertificates(),
        ]);

        const unread = messages.filter((m) => !m.read).length;

        setStats([
          { key: 'projects',     label: 'Projects',       value: String(projects.length),     icon: Code,          color: '#3b82f6', path: '/admin/projects' },
          { key: 'blogs',        label: 'Blog Posts',      value: String(blogs.length),        icon: BookOpen,      color: '#a855f7', path: '/admin/blogs' },
          { key: 'experience',   label: 'Experience',      value: String(experience.length),   icon: Briefcase,     color: '#22d3ee', path: '/admin/experience' },
          { key: 'skills',       label: 'Skill Sets',      value: String(skills.length),       icon: Zap,           color: '#2dd4bf', path: '/admin/skills' },
          { key: 'certificates', label: 'Certificates',    value: String(certificates.length), icon: FileCheck,     color: '#10b981', path: '/admin/certificates' },
          { key: 'awards',       label: 'Awards',          value: String(awards.length),       icon: Award,         color: '#f59e0b', path: '/admin/awards' },
          { key: 'testimonials', label: 'Testimonials',    value: String(testimonials.length), icon: MessageSquare, color: '#ec4899', path: '/admin/testimonials' },
          { key: 'messages',     label: 'Unread Messages', value: String(unread),              icon: Mail,          color: '#ef4444', path: '/admin/messages', alert: unread > 0 },
        ]);

        setRecentLogs(logs.slice(0, 10));
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-white/40 text-sm mt-1">Welcome back, Saad. Here's your portfolio at a glance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest">System Live</span>
        </div>
      </div>

      {/* Stats Grid — 2×4 */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {stats.map((stat, i) => (
          <Link key={stat.key} to={stat.path}>
            <Card className={`bg-white/[0.03] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 group relative overflow-hidden h-full cursor-pointer ${stat.alert ? 'border-red-500/30 hover:border-red-500/50' : ''}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-1 pt-4 px-4 space-y-0">
                <div className="p-2 rounded-xl" style={{ backgroundColor: stat.color + '15' }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                {stat.alert && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                    New
                  </span>
                )}
              </CardHeader>
              <CardContent className="px-4 pb-2">
                <div className="text-2xl font-black text-white mb-0.5">
                  {isLoading ? (
                    <span className="inline-block w-8 h-6 bg-white/10 rounded animate-pulse" />
                  ) : stat.value}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{stat.label}</p>
              </CardContent>
              {/* Sparkline */}
              <div className="px-2 pb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                <Sparkline data={spark(i + 2)} color={stat.color} />
              </div>
              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-full"
                style={{ backgroundColor: stat.color + '60' }}
              />
            </Card>
          </Link>
        ))}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Activity */}
        <Card className="lg:col-span-8 bg-white/[0.03] border-white/[0.07] overflow-hidden">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between py-4 px-5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm font-black uppercase tracking-widest">Recent Activity</CardTitle>
            </div>
            <Link to="/admin/logs" className="text-[10px] font-bold text-white/30 hover:text-accent transition-colors flex items-center gap-1 uppercase tracking-wider">
              View All <ExternalLink className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 w-full bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {recentLogs.map((log) => {
                  const c = getActionColor(log.action);
                  return (
                    <div key={log.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-all border-l-2 ${c.border}`}>
                      <div className={`p-2 rounded-lg ${c.bg} flex-shrink-0`}>
                        <Shield className={`w-3.5 h-3.5 ${c.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-white/90">{log.entityType}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-tight ${c.text} ${c.bg}`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-xs text-white/35 truncate max-w-xs md:max-w-sm">
                          {log.details || `${log.adminEmail} · ${log.action.toLowerCase()}`}
                        </p>
                      </div>
                      <div className="text-[10px] text-white/25 font-medium flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {format(log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp), 'h:mm a')}
                        </span>
                        <span className="text-white/15">
                          {format(log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <History className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30 italic">No activity yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Actions */}
          <Card className="bg-accent border-0 overflow-hidden">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-base font-black text-black flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 grid gap-2">
              {[
                { label: 'New Blog Post',        icon: BookOpen,  path: '/admin/blogs/new' },
                { label: 'Add Project',          icon: Code,      path: '/admin/projects/new' },
                { label: 'Add Experience',       icon: Briefcase, path: '/admin/experience/new' },
                { label: 'View Messages',        icon: Mail,      path: '/admin/messages' },
              ].map((action) => (
                <Link key={action.path} to={action.path}>
                  <button className="w-full text-left px-3.5 py-2.5 rounded-xl bg-black/10 hover:bg-black/20 transition-all font-bold text-sm text-black flex items-center justify-between group">
                    <span className="flex items-center gap-2.5">
                      <action.icon className="w-3.5 h-3.5" />
                      {action.label}
                    </span>
                    <TrendingUp className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* System status */}
          <Card className="bg-white/[0.03] border-white/[0.07]">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" /> System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2.5">
              {[
                { label: 'Firebase', status: 'Operational' },
                { label: 'Vercel Deploy', status: 'Operational' },
                { label: 'Auth', status: 'Active' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium">{item.label}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
