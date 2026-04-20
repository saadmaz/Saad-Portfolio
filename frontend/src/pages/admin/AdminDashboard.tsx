import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Code, BookOpen, Zap, Award,
  Mail, FileCheck, History, ExternalLink, Clock, Shield,
  ChevronRight, ArrowUpRight, Layers,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ProjectService } from '@/services/project-service';
import { BlogService } from '@/services/blog-service';
import { CommonService } from '@/shared/services/common-service';
import { ActivityLog } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { AdminMode } from '@/components/admin/AdminLayout';

/* ─── Palette ────────────────────────────────────────────────── */
const IV    = '#EDE9E3';
const IV85  = 'rgba(237,233,227,0.85)';
const IV55  = 'rgba(237,233,227,0.55)';
const IV35  = 'rgba(237,233,227,0.35)';
const IV22  = 'rgba(237,233,227,0.22)';
const IV12  = 'rgba(237,233,227,0.12)';
const EM    = '#10b981';
const SURF  = '#101726';
const SURFH = '#151F2E';
const BDR   = 'rgba(255,255,255,0.055)';
const BDRH  = 'rgba(255,255,255,0.10)';

/* ─── Helpers ────────────────────────────────────────────────── */
const spark = (seed: number) =>
  Array.from({ length: 10 }, (_, i) => ({
    v: Math.max(1, Math.round(seed * 0.55 + Math.sin(i * seed * 0.7) * seed * 0.35 + i * 0.5)),
  }));

const Sparkline = ({ data, color }: { data: { v: number }[]; color: string }) => (
  <ResponsiveContainer width="100%" height={34}>
    <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
        fill={`url(#sg-${color.replace('#', '')})`} dot={false} isAnimationActive={false} />
      <RechartsTooltip contentStyle={{ display: 'none' }} cursor={false} />
    </AreaChart>
  </ResponsiveContainer>
);

const Card = ({ children, style = {}, className = '' }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string;
}) => (
  <div
    className={`rounded-xl overflow-hidden ${className}`}
    style={{ background: SURF, border: `1px solid ${BDR}`, ...style }}
  >
    {children}
  </div>
);

const actionStyle = (action: string) => {
  switch (action) {
    case 'CREATE': return { text: '#6DB88A', bg: 'rgba(109,184,138,0.08)' };
    case 'UPDATE': return { text: '#6B8ED6', bg: 'rgba(107,142,214,0.08)' };
    case 'DELETE': return { text: '#D06B6B', bg: 'rgba(208,107,107,0.08)' };
    default:       return { text: EM,        bg: 'rgba(16,185,129,0.08)' };
  }
};

/* ─── Stat config ────────────────────────────────────────────── */
interface Stat {
  key: string; label: string; value: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string; path: string; alert?: boolean;
}

const makeStats = (): Stat[] => [
  { key: 'projects',  label: 'Projects',       value: '-', icon: Code,          color: '#6B8ED6', path: '/admin/projects' },
  { key: 'blogs',     label: 'Blog Posts',      value: '-', icon: BookOpen,      color: '#9B7FD4', path: '/admin/blogs' },
  { key: 'skills',    label: 'Skills',          value: '-', icon: Zap,           color: EM,        path: '/admin/skills' },
  { key: 'certs',     label: 'Certificates',    value: '-', icon: FileCheck,     color: '#6DB88A', path: '/admin/certificates' },
  { key: 'awards',    label: 'Awards',          value: '-', icon: Award,         color: '#D4956A', path: '/admin/awards' },
  { key: 'messages',  label: 'Unread Messages', value: '-', icon: Mail,          color: '#D06B6B', path: '/admin/messages', alert: true },
];

/* ─── Data shape ─────────────────────────────────────────────── */
interface DashData {
  stats: Stat[];
  logs: ActivityLog[];
  recentProjects: { id: string; title: string; status?: string; slug?: string; category?: string }[];
  recentBlogs: { id: string; title: string; status?: string; slug?: string }[];
  messages: { id: string; name: string; subject?: string; createdAt?: unknown; read?: boolean }[];
}

/* ══════════════════════════════════════════════════════════════
   EDITORIAL MODE
   ══════════════════════════════════════════════════════════════ */
const EditorialView = ({ data, loading }: { data: DashData; loading: boolean }) => {
  const now = new Date();
  const dayName  = format(now, 'EEEE').toUpperCase();
  const dateStr  = format(now, 'd MMMM, yyyy').toUpperCase();
  const volumeN  = Math.floor((now.getTime() - new Date('2024-01-01').getTime()) / (7 * 86400000));
  const hour     = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const unread   = data.messages.filter(m => !m.read).length;
  const drafts   = data.recentProjects.filter(p => p.status === 'draft').length
                 + data.recentBlogs.filter(b => b.status !== 'live').length;

  const latestDraft = data.recentProjects.find(p => p.status === 'draft')
                   ?? data.recentProjects[0];

  const upNext = [
    unread > 0 && `Reply to ${unread} unread message${unread > 1 ? 's' : ''}`,
    drafts > 0 && `Publish ${drafts} draft${drafts > 1 ? 's' : ''}`,
    'Update portfolio certifications',
    'Review activity logs',
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Masthead */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-medium tracking-[0.22em] mb-4" style={{ color: IV22 }}>
            {dayName} · {dateStr} · VOLUME {volumeN}
          </p>
          <h1 className="admin-editorial text-4xl md:text-5xl font-semibold mb-3 leading-[1.08]"
              style={{ color: IV85 }}>
            {greeting}, Saad.
          </h1>
          <p className="text-[13.5px] leading-relaxed max-w-xl" style={{ color: IV35 }}>
            {loading ? 'Loading your portfolio…' : [
              unread > 0 && `You have <strong>${unread} unread message${unread > 1 ? 's' : ''}</strong>`,
              drafts  > 0 && `${drafts} draft${drafts > 1 ? 's' : ''} waiting to ship`,
            ].filter(Boolean).join(', ') || 'Everything looks great today.'}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full self-start"
          style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
          <span className="text-[10px] font-medium tracking-wide" style={{ color: 'rgba(52,211,153,0.70)' }}>
            All systems nominal
          </span>
        </div>
      </div>

      {/* Three-column editorial grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* NOW SHIPPING */}
        <Card className="lg:col-span-1">
          <div className="px-4 pt-4 pb-1">
            <span className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: EM }}>
              Now Shipping
            </span>
            {latestDraft && (
              <span className="ml-2 text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(212,149,106,0.12)', color: '#D4956A', border: '1px solid rgba(212,149,106,0.2)' }}>
                {latestDraft.status ?? 'Draft'}
              </span>
            )}
          </div>
          {loading ? (
            <div className="h-28 mx-4 my-3 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ) : latestDraft ? (
            <>
              <div className="mx-4 my-3 h-28 rounded-xl overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, rgba(107,142,214,0.12) 0%, rgba(16,185,129,0.08) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="absolute bottom-2 left-3">
                  <span className="text-[8px] font-semibold tracking-[0.2em] uppercase" style={{ color: IV22 }}>
                    {latestDraft.category ?? 'Project'}
                  </span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <h3 className="admin-editorial text-xl font-semibold mb-1" style={{ color: IV85 }}>
                  {latestDraft.title}
                </h3>
                <div className="flex gap-2 mt-3">
                  <Link to={`/admin/projects`}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                    style={{ background: EM, color: '#080C18' }}>
                    Continue editing <ArrowUpRight className="w-3 h-3" />
                  </Link>
                  {latestDraft.slug && (
                    <Link to={`/projects/${latestDraft.slug}`} target="_blank"
                      className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', color: IV55, border: '1px solid rgba(255,255,255,0.08)' }}>
                      Preview
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="px-4 pb-4 pt-2">
              <p className="text-[12px]" style={{ color: IV22 }}>No drafts in progress.</p>
              <Link to="/admin/projects/new"
                className="mt-3 inline-flex text-[11px] font-medium px-3 py-1.5 rounded-lg items-center gap-1.5"
                style={{ background: EM, color: '#080C18' }}>
                Start a project <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </Card>

        {/* UP NEXT */}
        <Card className="lg:col-span-1">
          <div className="px-4 pt-4 pb-1">
            <span className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: IV22 }}>
              Up Next
            </span>
          </div>
          <div className="px-4 pb-4 space-y-1 mt-2">
            {upNext.slice(0, 5).map((task, i) => {
              const urgent = i < 2 && (unread > 0 || drafts > 0);
              return (
                <div key={i} className="flex items-start gap-2.5 py-2.5"
                  style={{ borderBottom: i < upNext.length - 1 ? `1px solid ${BDR}` : 'none' }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: urgent ? EM : IV22 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium leading-snug" style={{ color: urgent ? IV85 : IV55 }}>
                      {task}
                    </p>
                  </div>
                  {urgent && (
                    <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: IV22 }} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* SITE PULSE */}
        <Card className="lg:col-span-1">
          <div className="px-4 pt-4 pb-1 flex items-center justify-between">
            <span className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: IV22 }}>
              Site Pulse · 14D
            </span>
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" style={{ color: IV22 }} />
            </a>
          </div>
          <div className="px-4 pt-2 pb-1">
            <div className="flex items-end gap-2">
              <span className="admin-editorial text-4xl font-semibold leading-none" style={{ color: IV85 }}>
                {loading ? '—' : `${data.stats.find(s => s.key === 'projects')?.value ?? '—'}`}
              </span>
              <span className="text-[11px] font-medium mb-1" style={{ color: EM }}>projects live</span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: IV22 }}>visitors via Google Analytics</p>
          </div>
          <div className="px-2 pb-3">
            <Sparkline data={spark(14)} color={EM} />
          </div>
          <div className="px-4 pb-4 space-y-1.5">
            {[
              { label: 'Messages',    val: data.stats.find(s => s.key === 'messages')?.value ?? '-', color: '#D06B6B' },
              { label: 'Blog Posts',  val: data.stats.find(s => s.key === 'blogs')?.value ?? '-',   color: '#9B7FD4' },
              { label: 'Certificates', val: data.stats.find(s => s.key === 'certs')?.value ?? '-',  color: '#6DB88A' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: IV35 }}>{row.label}</span>
                <span className="text-[12px] font-semibold tabular-nums" style={{ color: row.color }}>{row.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity log */}
      <Card>
        <div className="flex items-center justify-between py-3.5 px-5" style={{ borderBottom: `1px solid ${BDR}` }}>
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5" style={{ color: EM }} />
            <span className="admin-editorial text-[13px] font-semibold" style={{ color: IV55 }}>
              Recent Activity
            </span>
          </div>
          <Link to="/admin/logs" className="text-[10px] font-medium flex items-center gap-1 uppercase tracking-wider"
            style={{ color: IV22 }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = EM}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = IV22}>
            View All <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
          </div>
        ) : data.logs.length > 0 ? (
          <div>
            {data.logs.slice(0, 6).map((log) => {
              const s  = actionStyle(log.action);
              const ts = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
              return (
                <div key={log.id} className="flex items-center gap-3.5 px-5 py-3 border-l-2 transition-colors"
                  style={{ borderLeftColor: s.text, borderBottom: '1px solid rgba(255,255,255,0.028)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.015)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}>
                  <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: s.bg }}>
                    <Shield className="w-3 h-3" style={{ color: s.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-medium" style={{ color: IV85 }}>{log.entityType}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase"
                        style={{ color: s.text, background: s.bg, border: '1px solid rgba(255,255,255,0.05)' }}>
                        {log.action}
                      </span>
                    </div>
                    <p className="text-[10.5px] truncate max-w-sm" style={{ color: IV22 }}>
                      {log.details || log.adminEmail}
                    </p>
                  </div>
                  <div className="text-[10px] flex-shrink-0 text-right" style={{ color: IV22 }}>
                    <div className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{format(ts, 'h:mm a')}</div>
                    <div style={{ color: 'rgba(237,233,227,0.12)' }}>{format(ts, 'MMM d')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="admin-editorial text-sm" style={{ color: IV22 }}>No activity yet.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   WORKBENCH MODE
   ══════════════════════════════════════════════════════════════ */
const WorkbenchView = ({ data, loading }: { data: DashData; loading: boolean }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedProject = data.recentProjects.find(p => p.id === selected);

  return (
    <div className="animate-in fade-in duration-400">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: IV22 }}>
            Workbench · Dashboard
          </p>
          <h1 className="text-3xl font-bold" style={{ color: IV85 }}>Today</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/projects/new"
            className="text-[11.5px] font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            style={{ background: EM, color: '#080C18' }}>
            + New
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {data.stats.map((stat, i) => (
          <Link key={stat.key} to={stat.path}>
            <div
              className="rounded-xl p-4 transition-all duration-150 cursor-pointer group"
              style={{
                background: stat.alert ? 'rgba(208,107,107,0.05)' : SURF,
                border: `1px solid ${stat.alert ? 'rgba(208,107,107,0.18)' : BDR}`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = SURFH; (e.currentTarget as HTMLDivElement).style.borderColor = BDRH; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = stat.alert ? 'rgba(208,107,107,0.05)' : SURF; (e.currentTarget as HTMLDivElement).style.borderColor = stat.alert ? 'rgba(208,107,107,0.18)' : BDR; }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: `${stat.color}14` }}>
                  <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                </div>
                {stat.alert && <span className="text-[8.5px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(208,107,107,0.12)', color: '#D06B6B' }}>NEW</span>}
              </div>
              <div className="admin-editorial text-2xl font-semibold mb-0.5" style={{ color: IV85 }}>
                {loading ? <span className="inline-block w-8 h-5 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} /> : stat.value}
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: IV22 }}>
                {stat.label}
              </p>
              <div className="mt-2 opacity-50 group-hover:opacity-90 transition-opacity">
                <Sparkline data={spark(i + 3)} color={stat.color} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Projects table + detail panel */}
      <div className="flex gap-5">
        <Card className={`flex-1 min-w-0 transition-all duration-300 ${selected ? 'lg:flex-[0_0_55%]' : ''}`}>
          <div className="flex items-center justify-between py-3 px-4" style={{ borderBottom: `1px solid ${BDR}` }}>
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" style={{ color: EM }} />
              <span className="text-[12px] font-semibold" style={{ color: IV55 }}>Projects</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest" style={{ color: IV22 }}>
              sort: updated ↓
            </div>
          </div>
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_100px_60px] gap-3 px-4 py-2.5"
            style={{ borderBottom: `1px solid ${BDR}` }}>
            {['Name', 'Status', 'Tags', 'Updated'].map(h => (
              <span key={h} className="text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: IV22 }}>
                {h}
              </span>
            ))}
          </div>
          {loading ? (
            <div className="p-4 space-y-2.5">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
            </div>
          ) : data.recentProjects.map(p => {
            const isSelected = selected === p.id;
            const statusColor = p.status === 'live' ? EM : p.status === 'draft' ? '#D4956A' : IV22;
            return (
              <div
                key={p.id}
                onClick={() => setSelected(isSelected ? null : p.id)}
                className="grid grid-cols-[1fr_80px_100px_60px] gap-3 px-4 py-3 cursor-pointer transition-all duration-150"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.028)',
                  background: isSelected ? 'rgba(16,185,129,0.05)' : undefined,
                  borderLeft: isSelected ? `2px solid ${EM}` : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = ''; }}
              >
                <span className="text-[12.5px] font-medium truncate" style={{ color: IV85 }}>{p.title}</span>
                <div className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0" style={{ background: statusColor }} />
                  <span className="text-[10.5px] font-medium" style={{ color: statusColor }}>
                    {p.status ?? 'live'}
                  </span>
                </div>
                <span className="text-[10px] truncate" style={{ color: IV22 }}>
                  {p.category ?? '—'}
                </span>
                <span className="text-[10px]" style={{ color: IV22 }}>—</span>
              </div>
            );
          })}
        </Card>

        {/* Detail panel */}
        {selectedProject && (
          <Card className="hidden lg:flex flex-col w-[280px] flex-shrink-0 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between py-3 px-4" style={{ borderBottom: `1px solid ${BDR}` }}>
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: IV22 }}>
                Project Detail
              </span>
              <button onClick={() => setSelected(null)} style={{ color: IV22 }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = IV85}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = IV22}>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 flex-1">
              {/* Cover placeholder */}
              <div className="h-28 rounded-xl mb-3 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(107,142,214,0.15) 0%, rgba(16,185,129,0.10) 100%)', border: `1px solid ${BDR}` }}>
                <div className="absolute bottom-2 left-2.5">
                  <span className="text-[8px] font-semibold tracking-[0.2em] uppercase" style={{ color: IV22 }}>
                    {selectedProject.category ?? 'Project'}.cover
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: selectedProject.status === 'live' ? EM : '#D4956A' }} />
                <span className="text-[9.5px] font-semibold uppercase tracking-wider"
                  style={{ color: selectedProject.status === 'live' ? EM : '#D4956A' }}>
                  {selectedProject.status ?? 'live'}
                </span>
              </div>
              <h3 className="admin-editorial text-xl font-semibold mb-1" style={{ color: IV85 }}>
                {selectedProject.title}
              </h3>
              <p className="text-[11px] mb-4" style={{ color: IV22 }}>
                {selectedProject.category}
              </p>
              <Link to="/admin/projects"
                className="text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 w-full transition-all"
                style={{ background: EM, color: '#080C18' }}>
                Edit Project <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   COMMAND MODE
   ══════════════════════════════════════════════════════════════ */
const CommandView = ({ data, loading }: { data: DashData; loading: boolean }) => {
  const now = new Date();
  const unread = data.messages.filter(m => !m.read).length;
  const urgent = [
    unread > 0 && `${unread} unread message${unread > 1 ? 's' : ''}`,
    data.recentProjects.filter(p => p.status === 'draft').length > 0 && 'drafts awaiting publish',
  ].filter(Boolean);

  return (
    <div className="admin-mono animate-in fade-in duration-300">

      {/* Terminal status bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-6 text-[10.5px] font-medium tracking-wide"
        style={{ background: '#0C1121', border: `1px solid ${BDR}` }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span style={{ color: EM }}>READY</span>
          </div>
          <span style={{ color: IV22 }}>host: saadmaz.com</span>
          <span style={{ color: IV22 }}>uptime: live</span>
          <span style={{ color: IV22 }}>env: prod</span>
        </div>
        <span style={{ color: IV22 }}>{format(now, 'yyyy-MM-dd · HH:mm:ss')} UTC</span>
      </div>

      {/* Prompt + summary */}
      <div className="mb-6">
        <p className="text-[11.5px] mb-2" style={{ color: IV22 }}>
          <span style={{ color: EM }}>saad@studio</span>
          <span style={{ color: IV35 }}> ~/admin $ </span>
          dashboard --today
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold leading-[1.1] mb-2" style={{ color: IV85 }}>
          {loading ? '> loading…' : urgent.length > 0
            ? `> ${urgent.length} thing${urgent.length > 1 ? 's' : ''} need you${urgent.length > 1 ? `, ${urgent.length} urgent.` : '.'}`
            : '> all clear. nothing urgent.'}
        </h1>
        <p className="text-[10.5px]" style={{ color: IV22 }}>
          press <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: IV12, border: `1px solid rgba(255,255,255,0.08)` }}>?</kbd> for shortcuts ·{' '}
          <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: IV12, border: `1px solid rgba(255,255,255,0.08)` }}>⌘K</kbd> command palette ·{' '}
          <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: IV12, border: `1px solid rgba(255,255,255,0.08)` }}>G</kbd> then{' '}
          <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: IV12, border: `1px solid rgba(255,255,255,0.08)` }}>I</kbd> go to inbox
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'VISITORS 14D',   val: '—',   delta: '+%',  color: EM,        seed: 8  },
          { label: 'PAGEVIEWS 14D',  val: '—',   delta: '+%',  color: '#6B8ED6', seed: 12 },
          { label: 'UNREAD',         val: String(unread || '0'), delta: unread > 0 ? `+${unread}` : '0', color: unread > 0 ? '#D06B6B' : IV35, seed: 6 },
          { label: 'DRAFTS',         val: String(data.recentProjects.filter(p => p.status === 'draft').length), delta: '', color: '#D4956A', seed: 4 },
        ].map((s, i) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: SURF, border: `1px solid ${BDR}` }}>
            <p className="text-[9px] font-semibold tracking-[0.16em] mb-2" style={{ color: IV22 }}>{s.label}</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-bold tabular-nums" style={{ color: IV85 }}>{loading ? '—' : s.val}</span>
              {s.delta && <span className="text-[11px] font-medium mb-0.5" style={{ color: s.color }}>{s.delta}</span>}
            </div>
            <Sparkline data={spark(s.seed + i)} color={s.color} />
          </div>
        ))}
      </div>

      {/* Two-column: inbox + projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Inbox queue */}
        <Card>
          <div className="py-3 px-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BDR}` }}>
            <span className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: IV22 }}>
              // Queue · Inbox
            </span>
            <span className="text-[9.5px]" style={{ color: IV22 }}>
              {unread} unread / {data.messages.length} total
            </span>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
            </div>
          ) : data.messages.slice(0, 5).map(msg => (
            <Link key={msg.id} to="/admin/messages"
              className="flex items-start gap-3 px-4 py-3 transition-all"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.028)' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = ''}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                style={{ background: 'rgba(107,142,214,0.12)', color: '#6B8ED6' }}
              >
                {msg.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold truncate" style={{ color: !msg.read ? IV85 : IV35 }}>
                    {msg.name}
                  </span>
                  {!msg.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: EM }} />}
                </div>
                <p className="text-[10.5px] truncate" style={{ color: IV22 }}>
                  {msg.subject ?? 'No subject'}
                </p>
              </div>
            </Link>
          ))}
          {data.messages.length === 0 && !loading && (
            <p className="px-4 py-8 text-center text-[11px]" style={{ color: IV22 }}>Inbox is clear.</p>
          )}
        </Card>

        {/* Projects table */}
        <Card>
          <div className="py-3 px-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BDR}` }}>
            <span className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: IV22 }}>
              // Table · Projects
            </span>
            <span className="text-[9.5px]" style={{ color: IV22 }}>sort:updated ↓</span>
          </div>
          <div className="grid grid-cols-[1fr_60px_90px_50px] gap-2 px-4 py-2" style={{ borderBottom: `1px solid ${BDR}` }}>
            {['Name', 'Status', 'Tags', 'Views'].map(h => (
              <span key={h} className="text-[8.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: IV22 }}>{h}</span>
            ))}
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
            </div>
          ) : data.recentProjects.slice(0, 6).map(p => {
            const sc = p.status === 'live' ? EM : p.status === 'draft' ? '#D4956A' : IV22;
            return (
              <div key={p.id}
                className="grid grid-cols-[1fr_60px_90px_50px] gap-2 px-4 py-2.5 transition-all"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.028)' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: sc }} />
                  <span className="text-[12px] font-medium truncate" style={{ color: IV85 }}>{p.title}</span>
                </div>
                <span className="text-[10px]" style={{ color: sc }}>{p.status ?? 'live'}</span>
                <span className="text-[10px] truncate" style={{ color: IV22 }}>{p.category ?? '—'}</span>
                <span className="text-[10px]" style={{ color: IV22 }}>—</span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   ROOT DASHBOARD — reads mode from outlet context
   ══════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { mode } = useOutletContext<{ mode: AdminMode }>();
  const [data, setData] = useState<DashData>({
    stats: makeStats(), logs: [], recentProjects: [], recentBlogs: [], messages: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, blogs, awards, testimonials, logs, messages, experience, skills, certs] =
          await Promise.all([
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

        const unread = messages.filter(m => !m.read).length;

        setData({
          stats: [
            { key: 'projects', label: 'Projects',       value: String(projects.length),     icon: Code,          color: '#6B8ED6', path: '/admin/projects' },
            { key: 'blogs',    label: 'Blog Posts',      value: String(blogs.length),        icon: BookOpen,      color: '#9B7FD4', path: '/admin/blogs' },
            { key: 'skills',   label: 'Skills',          value: String(skills.length),       icon: Zap,           color: EM,        path: '/admin/skills' },
            { key: 'certs',    label: 'Certificates',    value: String(certs.length),        icon: FileCheck,     color: '#6DB88A', path: '/admin/certificates' },
            { key: 'awards',   label: 'Awards',          value: String(awards.length),       icon: Award,         color: '#D4956A', path: '/admin/awards' },
            { key: 'messages', label: 'Unread Messages', value: String(unread),              icon: Mail,          color: '#D06B6B', path: '/admin/messages', alert: unread > 0 },
          ],
          logs:           logs.slice(0, 10),
          recentProjects: projects.slice(0, 8).map(p => ({
            id:       p.id ?? p.slug ?? p.title,
            title:    p.title,
            status:   p.status,
            slug:     p.slug,
            category: p.category,
          })),
          recentBlogs: blogs.slice(0, 6).map(b => ({
            id:     b.id ?? b.slug ?? b.title,
            title:  b.title,
            status: b.published ? 'live' : 'draft',
            slug:   b.slug,
          })),
          messages: messages.slice(0, 8).map(m => ({
            id:        m.id ?? '',
            name:      m.name,
            subject:   m.subject,
            createdAt: m.created_at,
            read:      m.read,
          })),
        });
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (mode === 'workbench') return <WorkbenchView data={data} loading={loading} />;
  if (mode === 'command')   return <CommandView   data={data} loading={loading} />;
  return                           <EditorialView  data={data} loading={loading} />;
};

export default AdminDashboard;
