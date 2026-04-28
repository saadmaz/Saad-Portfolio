import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code, BookOpen, Zap, Award,
  Mail, FileCheck, Shield, Clock, ArrowUpRight,
} from 'lucide-react';
import { ProjectService } from '@/services/project-service';
import { BlogService } from '@/services/blog-service';
import { CommonService } from '@/shared/services/common-service';
import { ActivityLog } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

/* ─── Palette ────────────────────────────────────────────────── */
const IV85  = 'rgba(237,233,227,0.85)';
const IV55  = 'rgba(237,233,227,0.55)';
const IV35  = 'rgba(237,233,227,0.35)';
const IV22  = 'rgba(237,233,227,0.22)';
const EM    = '#10b981';
const SURF  = '#101726';
const SURFH = '#151F2E';
const BDR   = 'rgba(255,255,255,0.055)';
const BDRH  = 'rgba(255,255,255,0.10)';

/* ─── Helpers ────────────────────────────────────────────────── */
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

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [stats, setStats] = useState<Stat[]>([
    { key: 'projects',  label: 'Projects',       value: '-', icon: Code,      color: '#6B8ED6', path: '/admin/projects' },
    { key: 'blogs',     label: 'Blog Posts',      value: '-', icon: BookOpen,  color: '#9B7FD4', path: '/admin/blogs' },
    { key: 'skills',    label: 'Skills',          value: '-', icon: Zap,       color: EM,        path: '/admin/skills' },
    { key: 'certs',     label: 'Certificates',    value: '-', icon: FileCheck, color: '#6DB88A', path: '/admin/certificates' },
    { key: 'awards',    label: 'Awards',          value: '-', icon: Award,     color: '#D4956A', path: '/admin/awards' },
    { key: 'messages',  label: 'Unread Messages', value: '-', icon: Mail,      color: '#D06B6B', path: '/admin/messages', alert: false },
  ]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, blogs, awards, logs, messages, skills, certs] =
          await Promise.all([
            ProjectService.getAll(),
            BlogService.getAll(),
            CommonService.getAwards(),
            CommonService.getActivityLogs(),
            CommonService.getMessages(),
            CommonService.getSkills(),
            CommonService.getCertificates(),
          ]);

        const unread = messages.filter(m => !m.read).length;

        setStats([
          { key: 'projects', label: 'Projects',       value: String(projects.length), icon: Code,      color: '#6B8ED6', path: '/admin/projects' },
          { key: 'blogs',    label: 'Blog Posts',      value: String(blogs.length),    icon: BookOpen,  color: '#9B7FD4', path: '/admin/blogs' },
          { key: 'skills',   label: 'Skills',          value: String(skills.length),   icon: Zap,       color: EM,        path: '/admin/skills' },
          { key: 'certs',    label: 'Certificates',    value: String(certs.length),    icon: FileCheck, color: '#6DB88A', path: '/admin/certificates' },
          { key: 'awards',   label: 'Awards',          value: String(awards.length),   icon: Award,     color: '#D4956A', path: '/admin/awards' },
          { key: 'messages', label: 'Unread Messages', value: String(unread),          icon: Mail,      color: '#D06B6B', path: '/admin/messages', alert: unread > 0 },
        ]);
        setLogs(logs.slice(0, 8));
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const now      = new Date();
  const hour     = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr  = format(now, 'EEEE, d MMMM yyyy');

  return (
    <div className="space-y-7 animate-in fade-in duration-400">

      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase mb-2" style={{ color: IV22 }}>
            {dateStr}
          </p>
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: IV85 }}>
            {greeting}, Saad.
          </h1>
        </div>
        <Link
          to="/admin/projects/new"
          className="flex items-center gap-1.5 text-[11.5px] font-semibold px-4 py-1.5 rounded-lg flex-shrink-0 transition-all"
          style={{ background: EM, color: '#080C18' }}
        >
          + New Project
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <Link key={stat.key} to={stat.path}>
            <div
              className="rounded-xl p-4 transition-all duration-150 cursor-pointer"
              style={{
                background: stat.alert ? 'rgba(208,107,107,0.05)' : SURF,
                border: `1px solid ${stat.alert ? 'rgba(208,107,107,0.20)' : BDR}`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = SURFH; (e.currentTarget as HTMLDivElement).style.borderColor = BDRH; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = stat.alert ? 'rgba(208,107,107,0.05)' : SURF; (e.currentTarget as HTMLDivElement).style.borderColor = stat.alert ? 'rgba(208,107,107,0.20)' : BDR; }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 rounded-lg" style={{ background: `${stat.color}14` }}>
                  <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                </div>
                {stat.alert && (
                  <span className="text-[8.5px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(208,107,107,0.12)', color: '#D06B6B' }}>
                    NEW
                  </span>
                )}
              </div>
              <div className="text-2xl font-semibold mb-0.5 tabular-nums" style={{ color: IV85 }}>
                {loading
                  ? <span className="inline-block w-8 h-5 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  : stat.value}
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: IV22 }}>
                {stat.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <div className="flex items-center justify-between py-3.5 px-5" style={{ borderBottom: `1px solid ${BDR}` }}>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" style={{ color: EM }} />
            <span className="text-[13px] font-semibold" style={{ color: IV55 }}>
              Recent Activity
            </span>
          </div>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : logs.length > 0 ? (
          <div>
            {logs.map((log) => {
              const s  = actionStyle(log.action);
              const ts = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3.5 px-5 py-3 border-l-2 transition-colors"
                  style={{ borderLeftColor: s.text, borderBottom: '1px solid rgba(255,255,255,0.028)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.015)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                >
                  <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: s.bg }}>
                    <Shield className="w-3 h-3" style={{ color: s.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-medium" style={{ color: IV85 }}>{log.entityType}</span>
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase"
                        style={{ color: s.text, background: s.bg, border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        {log.action}
                      </span>
                    </div>
                    <p className="text-[10.5px] truncate max-w-sm" style={{ color: IV22 }}>
                      {log.details || log.adminEmail}
                    </p>
                  </div>
                  <div className="text-[10px] flex-shrink-0 text-right" style={{ color: IV22 }}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {format(ts, 'h:mm a')}
                    </div>
                    <div style={{ color: 'rgba(237,233,227,0.12)' }}>{format(ts, 'MMM d')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: IV22 }}>No activity yet.</p>
          </div>
        )}
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New Blog Post',     path: '/admin/blogs/new' },
          { label: 'Add Certificate',   path: '/admin/certificates/new' },
          { label: 'Add Experience',    path: '/admin/experience/new' },
          { label: 'View Messages',     path: '/admin/messages' },
        ].map(item => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-[12px] font-medium transition-all"
            style={{ background: SURF, border: `1px solid ${BDR}`, color: IV35 }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = SURFH; (e.currentTarget as HTMLAnchorElement).style.color = IV55; (e.currentTarget as HTMLAnchorElement).style.borderColor = BDRH; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = SURF; (e.currentTarget as HTMLAnchorElement).style.color = IV35; (e.currentTarget as HTMLAnchorElement).style.borderColor = BDR; }}
          >
            {item.label}
            <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
