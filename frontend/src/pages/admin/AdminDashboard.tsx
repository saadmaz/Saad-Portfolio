import React, { useEffect, useState } from 'react';
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

/* ─ Shared palette tokens ─────────────────────────────────────── */
const IVORY       = '#EDE9E3';
const IVORY_85    = 'rgba(237,233,227,0.85)';
const IVORY_55    = 'rgba(237,233,227,0.55)';
const IVORY_35    = 'rgba(237,233,227,0.35)';
const IVORY_22    = 'rgba(237,233,227,0.22)';
const EMERALD        = '#10b981';
const EMERALD_BG     = 'rgba(16,185,129,0.09)';
const EMERALD_BORDER = 'rgba(16,185,129,0.22)';
const SURFACE     = '#101726';
const SURFACE_H   = '#151F2E';
const BORDER      = 'rgba(255,255,255,0.055)';
const BORDER_H    = 'rgba(255,255,255,0.105)';

/* ─ Tiny sparkline ──────────────────────────────────────────────── */
const spark = (seed: number) =>
  Array.from({ length: 7 }, (_, i) => ({
    v: Math.max(1, Math.round(seed * 0.6 + Math.sin(i * seed * 0.8) * seed * 0.3 + i * 0.4)),
  }));

const Sparkline = ({ data, color }: { data: { v: number }[]; color: string }) => (
  <ResponsiveContainer width="100%" height={38}>
    <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`g-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
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
      <RechartsTooltip contentStyle={{ display: 'none' }} cursor={false} />
    </AreaChart>
  </ResponsiveContainer>
);

/* ─ Stat card config ──────────────────────────────────────────── */
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
  { key: 'projects',     label: 'Projects',        value: '-', icon: Code,            color: '#6B8ED6', path: '/admin/projects' },
  { key: 'blogs',        label: 'Blog Posts',       value: '-', icon: BookOpen,        color: '#9B7FD4', path: '/admin/blogs' },
  { key: 'experience',   label: 'Experience',       value: '-', icon: Briefcase,       color: '#5BAAB0', path: '/admin/experience' },
  { key: 'skills',       label: 'Skill Sets',       value: '-', icon: Zap,             color: '#10b981', path: '/admin/skills' },
  { key: 'certificates', label: 'Certificates',     value: '-', icon: FileCheck,       color: '#6DB88A', path: '/admin/certificates' },
  { key: 'awards',       label: 'Awards',           value: '-', icon: Award,           color: '#D4956A', path: '/admin/awards' },
  { key: 'testimonials', label: 'Testimonials',     value: '-', icon: MessageSquare,   color: '#C47A9B', path: '/admin/testimonials' },
  { key: 'messages',     label: 'Unread Messages',  value: '-', icon: Mail,            color: '#D06B6B', path: '/admin/messages', alert: true },
];

const getActionStyle = (action: string) => {
  switch (action) {
    case 'CREATE': return { text: '#6DB88A', border: '#6DB88A', bg: 'rgba(109,184,138,0.08)' };
    case 'UPDATE': return { text: '#6B8ED6', border: '#6B8ED6', bg: 'rgba(107,142,214,0.08)' };
    case 'DELETE': return { text: '#D06B6B', border: '#D06B6B', bg: 'rgba(208,107,107,0.08)' };
    default:       return { text: '#10b981', border: '#10b981', bg: 'rgba(16,185,129,0.08)' };
  }
};

/* ─ Reusable surface card ─────────────────────────────────────── */
const SurfaceCard = ({
  children,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`rounded-xl overflow-hidden ${className}`}
    style={{ background: SURFACE, border: `1px solid ${BORDER}`, ...style }}
  >
    {children}
  </div>
);

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
          { key: 'projects',     label: 'Projects',        value: String(projects.length),     icon: Code,          color: '#6B8ED6', path: '/admin/projects' },
          { key: 'blogs',        label: 'Blog Posts',       value: String(blogs.length),        icon: BookOpen,      color: '#9B7FD4', path: '/admin/blogs' },
          { key: 'experience',   label: 'Experience',       value: String(experience.length),   icon: Briefcase,     color: '#5BAAB0', path: '/admin/experience' },
          { key: 'skills',       label: 'Skill Sets',       value: String(skills.length),       icon: Zap,           color: '#10b981', path: '/admin/skills' },
          { key: 'certificates', label: 'Certificates',     value: String(certificates.length), icon: FileCheck,     color: '#6DB88A', path: '/admin/certificates' },
          { key: 'awards',       label: 'Awards',           value: String(awards.length),       icon: Award,         color: '#D4956A', path: '/admin/awards' },
          { key: 'testimonials', label: 'Testimonials',     value: String(testimonials.length), icon: MessageSquare, color: '#C47A9B', path: '/admin/testimonials' },
          { key: 'messages',     label: 'Unread Messages',  value: String(unread),              icon: Mail,          color: '#D06B6B', path: '/admin/messages', alert: unread > 0 },
        ]);

        setRecentLogs(logs.slice(0, 10));
      } catch {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em] mb-2"
            style={{ color: IVORY_22 }}
          >
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <h1
            className="admin-editorial text-3xl md:text-4xl font-semibold italic"
            style={{ color: IVORY_85, letterSpacing: '-0.01em' }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-1.5 font-normal" style={{ color: IVORY_35 }}>
            Welcome back, Saad. Here's your portfolio at a glance.
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl self-start md:self-auto"
          style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.10)' }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse" />
          <span className="text-xs font-medium tracking-wide" style={{ color: 'rgba(52,211,153,0.70)' }}>
            System Live
          </span>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────── */}
      <div className="grid gap-3.5 grid-cols-2 md:grid-cols-4">
        {stats.map((stat, i) => (
          <Link key={stat.key} to={stat.path}>
            <div
              className="rounded-xl overflow-hidden cursor-pointer transition-all duration-250 group relative h-full"
              style={{
                background: stat.alert ? 'rgba(208,107,107,0.05)' : SURFACE,
                border: `1px solid ${stat.alert ? 'rgba(208,107,107,0.22)' : BORDER}`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = stat.alert ? 'rgba(208,107,107,0.08)' : SURFACE_H;
                (e.currentTarget as HTMLDivElement).style.borderColor = stat.alert ? 'rgba(208,107,107,0.35)' : BORDER_H;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = stat.alert ? 'rgba(208,107,107,0.05)' : SURFACE;
                (e.currentTarget as HTMLDivElement).style.borderColor = stat.alert ? 'rgba(208,107,107,0.22)' : BORDER;
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between pt-4 px-4 pb-1">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `${stat.color}14` }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                {stat.alert && (
                  <span
                    className="text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(208,107,107,0.15)', color: '#D06B6B', border: '1px solid rgba(208,107,107,0.25)' }}
                  >
                    New
                  </span>
                )}
              </div>

              {/* Count + label */}
              <div className="px-4 pb-2">
                <div
                  className="admin-editorial text-2xl font-semibold mb-0.5"
                  style={{ color: IVORY_85 }}
                >
                  {isLoading ? (
                    <span
                      className="inline-block w-8 h-6 rounded animate-pulse"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    />
                  ) : stat.value}
                </div>
                <p
                  className="text-[10px] font-medium uppercase tracking-widest"
                  style={{ color: IVORY_35 }}
                >
                  {stat.label}
                </p>
              </div>

              {/* Sparkline */}
              <div className="px-2 pb-3 opacity-50 group-hover:opacity-90 transition-opacity duration-300">
                <Sparkline data={spark(i + 2)} color={stat.color} />
              </div>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-500 rounded-full"
                style={{ background: `${stat.color}50` }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Activity + Quick Actions ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">

        {/* Recent Activity */}
        <SurfaceCard className="lg:col-span-8">
          {/* Card header */}
          <div
            className="flex items-center justify-between py-4 px-5"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4" style={{ color: EMERALD }} />
              <span
                className="admin-editorial text-[13px] font-semibold italic"
                style={{ color: IVORY_55 }}
              >
                Recent Activity
              </span>
            </div>
            <Link
              to="/admin/logs"
              className="text-[10px] font-medium flex items-center gap-1 uppercase tracking-wider transition-colors duration-200"
              style={{ color: IVORY_22 }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = EMERALD}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = IVORY_22}
            >
              View All <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Entries */}
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-14 w-full rounded-xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                />
              ))}
            </div>
          ) : recentLogs.length > 0 ? (
            <div>
              {recentLogs.map((log) => {
                const s = getActionStyle(log.action);
                const ts = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-all duration-150 border-l-2"
                    style={{
                      borderLeftColor: s.border,
                      borderBottom: `1px solid rgba(255,255,255,0.03)`,
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.018)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                  >
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ background: s.bg }}
                    >
                      <Shield className="w-3.5 h-3.5" style={{ color: s.text }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-medium" style={{ color: IVORY_85 }}>
                          {log.entityType}
                        </span>
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-tight"
                          style={{ color: s.text, background: s.bg, border: `1px solid rgba(255,255,255,0.06)` }}
                        >
                          {log.action}
                        </span>
                      </div>
                      <p className="text-[11px] truncate max-w-xs md:max-w-sm" style={{ color: IVORY_35 }}>
                        {log.details || `${log.adminEmail} · ${log.action.toLowerCase()}`}
                      </p>
                    </div>
                    <div
                      className="text-[10px] font-medium flex flex-col items-end gap-0.5 flex-shrink-0"
                      style={{ color: IVORY_22 }}
                    >
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {format(ts, 'h:mm a')}
                      </span>
                      <span style={{ color: 'rgba(237,233,227,0.15)' }}>
                        {format(ts, 'MMM d')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <History className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(237,233,227,0.10)' }} />
              <p className="admin-editorial text-sm italic" style={{ color: IVORY_22 }}>
                No activity yet.
              </p>
            </div>
          )}
        </SurfaceCard>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-4">

          {/* Quick Actions */}
          <SurfaceCard style={{ border: `1px solid ${EMERALD_BORDER}` }}>
            <div className="pt-5 pb-2 px-5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: EMERALD }} />
                <span
                  className="admin-editorial text-[14px] font-semibold italic"
                  style={{ color: IVORY_85 }}
                >
                  Quick Actions
                </span>
              </div>
            </div>
            <div className="px-5 pb-5 grid gap-2 mt-1">
              {[
                { label: 'New Blog Post',  icon: BookOpen,  path: '/admin/blogs/new' },
                { label: 'Add Project',    icon: Code,      path: '/admin/projects/new' },
                { label: 'Add Experience', icon: Briefcase, path: '/admin/experience/new' },
                { label: 'View Messages',  icon: Mail,      path: '/admin/messages' },
              ].map((action) => (
                <Link key={action.path} to={action.path}>
                  <button
                    className="w-full text-left px-3.5 py-2.5 rounded-lg transition-all duration-200 text-[13px] font-medium flex items-center justify-between group"
                    style={{
                      background: 'rgba(255,255,255,0.035)',
                      border: '1px solid rgba(255,255,255,0.055)',
                      color: IVORY_55,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = EMERALD_BG;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = EMERALD_BORDER;
                      (e.currentTarget as HTMLButtonElement).style.color = EMERALD;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.035)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.055)';
                      (e.currentTarget as HTMLButtonElement).style.color = IVORY_55;
                    }}
                  >
                    <span className="flex items-center gap-2.5">
                      <action.icon className="w-3.5 h-3.5" />
                      {action.label}
                    </span>
                    <TrendingUp
                      className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </button>
                </Link>
              ))}
            </div>
          </SurfaceCard>

          {/* System Status */}
          <SurfaceCard>
            <div className="pb-2 pt-4 px-5">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" style={{ color: IVORY_22 }} />
                <span
                  className="admin-editorial text-[10px] font-normal italic uppercase tracking-widest"
                  style={{ color: IVORY_22 }}
                >
                  System Status
                </span>
              </div>
            </div>
            <div className="px-5 pb-5 space-y-2.5">
              {[
                { label: 'Firebase',      status: 'Operational' },
                { label: 'Vercel Deploy', status: 'Operational' },
                { label: 'Auth',          status: 'Active' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[12px] font-medium" style={{ color: IVORY_35 }}>
                    {item.label}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest"
                    style={{ color: '#6DB88A' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6DB88A' }} />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
