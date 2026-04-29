import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code, CalendarDays, Trophy, Briefcase, Heart,
  Clock, ArrowRight, BookOpen, GraduationCap,
} from 'lucide-react';
import { ProjectService } from '@/services/project-service';
import { CommonService } from '@/shared/services/common-service';
import type { ActivityLog } from '@/types';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

/* ── Stat card config ──────────────────────────────────────────── */
const STAT_CARDS = [
  {
    key: 'projects',
    label: 'Total Projects',
    icon: Code,
    gradient: 'linear-gradient(135deg, #1D4ED8 0%, #60A5FA 100%)',
    path: '/admin/projects',
  },
  {
    key: 'hackathons',
    label: 'Hackathons',
    icon: Trophy,
    gradient: 'linear-gradient(135deg, #B45309 0%, #FCD34D 100%)',
    path: '/admin/hackathons',
  },
  {
    key: 'events',
    label: 'Events',
    icon: CalendarDays,
    gradient: 'linear-gradient(135deg, #065F46 0%, #34D399 100%)',
    path: '/admin/events',
  },
  {
    key: 'experience',
    label: 'Work Experience',
    icon: Briefcase,
    gradient: 'linear-gradient(135deg, #5B21B6 0%, #C4B5FD 100%)',
    path: '/admin/experience',
  },
  {
    key: 'volunteers',
    label: 'Volunteers',
    icon: Heart,
    gradient: 'linear-gradient(135deg, #0F766E 0%, #5EEAD4 100%)',
    path: '/admin/volunteer',
  },
] as const;

/* ── Quick action config ───────────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    label: 'Add Project',
    sub: 'Upload a new project entry',
    icon: Code,
    color: '#2563EB',
    bg: '#EFF6FF',
    path: '/admin/projects/new',
  },
  {
    label: 'Write Blog',
    sub: 'Publish an article',
    icon: BookOpen,
    color: '#D97706',
    bg: '#FFFBEB',
    path: '/admin/blogs/new',
  },
  {
    label: 'Add Event',
    sub: 'Log a speaking or attended event',
    icon: CalendarDays,
    color: '#059669',
    bg: '#ECFDF5',
    path: '/admin/events',
  },
  {
    label: 'Add Hackathon',
    sub: 'Record a hackathon entry',
    icon: Trophy,
    color: '#7C3AED',
    bg: '#F5F3FF',
    path: '/admin/hackathons',
  },
  {
    label: 'Add Experience',
    sub: 'Add a work experience entry',
    icon: Briefcase,
    color: '#0D9488',
    bg: '#F0FDFA',
    path: '/admin/experience/new',
  },
  {
    label: 'Manage Education',
    sub: 'Edit your academic background',
    icon: GraduationCap,
    color: '#E11D48',
    bg: '#FFF1F2',
    path: '/admin/education',
  },
];

/* ── Helpers ───────────────────────────────────────────────────── */
const actionDotColor = (action: string) => {
  if (action === 'CREATE') return '#10B981';
  if (action === 'UPDATE') return '#3B82F6';
  if (action === 'DELETE') return '#EF4444';
  return '#8B5CF6';
};

const actionVerb = (action: string) => {
  if (action === 'CREATE') return 'Added';
  if (action === 'UPDATE') return 'Updated';
  if (action === 'DELETE') return 'Deleted';
  return action;
};

/* ══════════════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [counts, setCounts] = useState<Record<string, number>>({
    projects: 0, hackathons: 0, events: 0, experience: 0, volunteers: 0,
  });
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, hackathons, events, experience, volunteers, activityLogs] =
          await Promise.all([
            ProjectService.getAll(),
            CommonService.getHackathons(),
            CommonService.getEvents(),
            CommonService.getWorkExperience(),
            CommonService.getVolunteerExperience(),
            CommonService.getActivityLogs(),
          ]);
        setCounts({
          projects: projects.length,
          hackathons: hackathons.length,
          events: events.length,
          experience: experience.length,
          volunteers: volunteers.length,
        });
        setLogs([...activityLogs].reverse().slice(0, 8));
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = format(now, 'EEEE, MMMM d').toUpperCase();

  return (
    <div className="space-y-6">

      {/* ── Greeting ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 pt-0.5">
        <div>
          <p
            className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-1.5"
            style={{ color: '#94A3B8' }}
          >
            {dateStr}
          </p>
          <h1 className="text-[27px] font-bold leading-tight" style={{ color: '#0F172A' }}>
            {greeting}, Saad.
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#64748B' }}>
            Here's an overview of your portfolio content.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0 mt-1"
          style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: '#10B981' }}
          />
          Portfolio Live
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map((card) => (
          <Link key={card.key} to={card.path}>
            <div
              className="relative rounded-2xl p-5 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl select-none"
              style={{
                background: card.gradient,
                boxShadow: '0 4px 22px rgba(0,0,0,0.15)',
              }}
            >
              {/* Decorative blobs */}
              <div
                className="absolute -right-5 -top-5 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              />
              <div
                className="absolute right-3 -bottom-4 w-12 h-12 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              />

              {/* Icon */}
              <div
                className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.22)' }}
              >
                <card.icon className="w-4 h-4 text-white" />
              </div>

              {/* Label + count + arrow */}
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <p
                    className="text-[10.5px] font-medium mb-0.5"
                    style={{ color: 'rgba(255,255,255,0.72)' }}
                  >
                    {card.label}
                  </p>
                  <p className="text-[30px] font-bold text-white leading-none tabular-nums">
                    {loading ? (
                      <span
                        className="inline-block w-8 h-7 rounded-lg animate-pulse align-middle"
                        style={{ background: 'rgba(255,255,255,0.25)' }}
                      />
                    ) : (
                      counts[card.key] ?? 0
                    )}
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 mb-0.5 flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Bottom row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">

        {/* Quick Actions */}
        <div
          className="rounded-2xl p-6"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 10px rgba(0,0,0,0.06)' }}
        >
          <h2 className="text-[15px] font-bold mb-0.5" style={{ color: '#0F172A' }}>
            Quick Actions
          </h2>
          <p className="text-[12px] mb-5" style={{ color: '#94A3B8' }}>
            Jump to the most common tasks
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.path} to={action.path}>
                <div
                  className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                  style={{ background: action.bg }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${action.color}1A` }}
                  >
                    <action.icon className="w-4 h-4" style={{ color: action.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold" style={{ color: '#0F172A' }}>
                      {action.label}
                    </p>
                    <p className="text-[10.5px] truncate" style={{ color: '#94A3B8' }}>
                      {action.sub}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 10px rgba(0,0,0,0.06)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #F1F5F9' }}
          >
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: '#0F172A' }}>
                Recent Activity
              </h2>
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>
                Latest events across the platform
              </p>
            </div>
            <Link
              to="/admin/messages"
              className="text-[11px] font-semibold flex items-center gap-0.5 transition-opacity hover:opacity-70"
              style={{ color: '#3B82F6' }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex-shrink-0 animate-pulse"
                    style={{ background: '#F1F5F9' }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-2.5 rounded-full animate-pulse"
                      style={{ background: '#F1F5F9', width: '65%' }}
                    />
                    <div
                      className="h-2 rounded-full animate-pulse"
                      style={{ background: '#F1F5F9', width: '40%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length > 0 ? (
            <div>
              {logs.map((log) => {
                const dotColor = actionDotColor(log.action);
                const ts = (log.timestamp as any)?.toDate
                  ? (log.timestamp as any).toDate()
                  : new Date(log.timestamp as any);
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 px-5 py-3.5"
                    style={{ borderBottom: '1px solid #F8FAFC' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-[5px]"
                      style={{ background: dotColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium" style={{ color: '#1E293B' }}>
                        {actionVerb(log.action)}{' '}
                        <span style={{ color: dotColor }}>{log.entityType}</span>
                      </p>
                      {log.details && (
                        <p
                          className="text-[10.5px] truncate mt-0.5"
                          style={{ color: '#94A3B8' }}
                        >
                          {log.details}
                        </p>
                      )}
                      <p
                        className="text-[10px] mt-0.5 flex items-center gap-1"
                        style={{ color: '#CBD5E1' }}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(ts, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: '#94A3B8' }}>No activity yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
