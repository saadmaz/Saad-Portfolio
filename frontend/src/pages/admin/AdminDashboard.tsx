import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code, BookOpen, Briefcase, Zap, FileCheck, Award,
  CalendarDays, Newspaper, Globe, Trophy, Quote,
  BookMarked, FileText, Lightbulb, Building2, Heart,
  GraduationCap, Mail, Clock, ArrowRight,
} from 'lucide-react';
import { ProjectService } from '@/services/project-service';
import { BlogService } from '@/services/blog-service';
import { CommonService } from '@/shared/services/common-service';
import type { ActivityLog } from '@/types';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

/* ── All 18 stat cards ─────────────────────────────────────────── */
const STAT_CARDS = [
  { key: 'projects',      label: 'Projects',        icon: Code,         path: '/admin/projects',      gradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)' },
  { key: 'blogs',         label: 'Blog Posts',       icon: BookOpen,     path: '/admin/blogs',         gradient: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)' },
  { key: 'experience',    label: 'Experience',       icon: Briefcase,    path: '/admin/experience',    gradient: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)' },
  { key: 'skills',        label: 'Skills & Tools',   icon: Zap,          path: '/admin/skills',        gradient: 'linear-gradient(135deg, #5B21B6 0%, #8B5CF6 100%)' },
  { key: 'certs',         label: 'Certifications',   icon: FileCheck,    path: '/admin/certificates',  gradient: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)' },
  { key: 'awards',        label: 'Awards',           icon: Award,        path: '/admin/awards',        gradient: 'linear-gradient(135deg, #C2410C 0%, #F97316 100%)' },
  { key: 'events',        label: 'Events',           icon: CalendarDays, path: '/admin/events',        gradient: 'linear-gradient(135deg, #9F1239 0%, #F43F5E 100%)' },
  { key: 'newsletters',   label: 'Newsletters',      icon: Newspaper,    path: '/admin/newsletters',   gradient: 'linear-gradient(135deg, #3730A3 0%, #6366F1 100%)' },
  { key: 'languages',     label: 'Languages',        icon: Globe,        path: '/admin/languages',     gradient: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)' },
  { key: 'hackathons',    label: 'Hackathons',       icon: Trophy,       path: '/admin/hackathons',    gradient: 'linear-gradient(135deg, #78350F 0%, #EAB308 100%)' },
  { key: 'testimonials',  label: 'Testimonials',     icon: Quote,        path: '/admin/testimonials',  gradient: 'linear-gradient(135deg, #9D174D 0%, #EC4899 100%)' },
  { key: 'courses',       label: 'Courses',          icon: BookMarked,   path: '/admin/courses',       gradient: 'linear-gradient(135deg, #14532D 0%, #22C55E 100%)' },
  { key: 'publications',  label: 'Publications',     icon: FileText,     path: '/admin/publications',  gradient: 'linear-gradient(135deg, #164E63 0%, #06B6D4 100%)' },
  { key: 'patents',       label: 'Patents',          icon: Lightbulb,    path: '/admin/patents',       gradient: 'linear-gradient(135deg, #4C1D95 0%, #A855F7 100%)' },
  { key: 'organizations', label: 'Organizations',    icon: Building2,    path: '/admin/organizations', gradient: 'linear-gradient(135deg, #3F6212 0%, #84CC16 100%)' },
  { key: 'volunteer',     label: 'Volunteer',        icon: Heart,        path: '/admin/volunteer',     gradient: 'linear-gradient(135deg, #7F1D1D 0%, #EF4444 100%)' },
  { key: 'education',     label: 'Education',        icon: GraduationCap,path: '/admin/education',     gradient: 'linear-gradient(135deg, #1E3A5F 0%, #60A5FA 100%)' },
  { key: 'messages',      label: 'Unread Messages',  icon: Mail,         path: '/admin/messages',      gradient: 'linear-gradient(135deg, #450A0A 0%, #DC2626 100%)' },
] as const;

/* ── Quick actions ─────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: 'Add Project',      sub: 'Upload a new project entry',        icon: Code,         color: '#2563EB', bg: '#EFF6FF',  path: '/admin/projects/new' },
  { label: 'Write Blog',       sub: 'Publish an article',                 icon: BookOpen,     color: '#D97706', bg: '#FFFBEB',  path: '/admin/blogs/new' },
  { label: 'Add Event',        sub: 'Log a speaking or attended event',   icon: CalendarDays, color: '#059669', bg: '#ECFDF5',  path: '/admin/events' },
  { label: 'Add Hackathon',    sub: 'Record a hackathon entry',           icon: Trophy,       color: '#7C3AED', bg: '#F5F3FF',  path: '/admin/hackathons' },
  { label: 'Add Experience',   sub: 'Add a work experience entry',        icon: Briefcase,    color: '#0D9488', bg: '#F0FDFA',  path: '/admin/experience/new' },
  { label: 'Manage Education', sub: 'Edit your academic background',      icon: GraduationCap,color: '#E11D48', bg: '#FFF1F2',  path: '/admin/education' },
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
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          projects, blogs, experience, skills, certs, awards,
          events, newsletters, languages, hackathons, testimonials,
          courses, publications, patents, organizations, volunteer,
          education, messages, activityLogs,
        ] = await Promise.all([
          ProjectService.getAll(),
          BlogService.getAll(),
          CommonService.getWorkExperience(),
          CommonService.getSkills(),
          CommonService.getCertificates(),
          CommonService.getAwards(),
          CommonService.getEvents(),
          CommonService.getNewsletters(),
          CommonService.getLanguages(),
          CommonService.getHackathons(),
          CommonService.getTestimonials(),
          CommonService.getCourses(),
          CommonService.getPublications(),
          CommonService.getPatents(),
          CommonService.getOrganizations(),
          CommonService.getVolunteerExperience(),
          CommonService.getEducation(),
          CommonService.getMessages(),
          CommonService.getActivityLogs(),
        ]);

        setCounts({
          projects:      projects.length,
          blogs:         blogs.length,
          experience:    experience.length,
          skills:        skills.length,
          certs:         certs.length,
          awards:        awards.length,
          events:        events.length,
          newsletters:   newsletters.length,
          languages:     languages.length,
          hackathons:    hackathons.length,
          testimonials:  testimonials.length,
          courses:       courses.length,
          publications:  publications.length,
          patents:       patents.length,
          organizations: organizations.length,
          volunteer:     volunteer.length,
          education:     education.length,
          messages:      messages.filter((m) => !(m as any).read).length,
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
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981' }} />
          Portfolio Live
        </div>
      </div>

      {/* ── Stat cards (all 18) ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {STAT_CARDS.map((card) => (
          <Link key={card.key} to={card.path}>
            <div
              className="relative rounded-2xl p-4 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl select-none h-full"
              style={{
                background: card.gradient,
                boxShadow: '0 4px 18px rgba(0,0,0,0.14)',
              }}
            >
              {/* Decorative blobs */}
              <div
                className="absolute -right-4 -top-4 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              />
              <div
                className="absolute right-2 -bottom-3 w-10 h-10 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              />

              {/* Icon */}
              <div
                className="relative z-10 w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(255,255,255,0.22)' }}
              >
                <card.icon className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Label + count + arrow */}
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <p
                    className="text-[9.5px] font-medium mb-0.5 leading-tight"
                    style={{ color: 'rgba(255,255,255,0.72)' }}
                  >
                    {card.label}
                  </p>
                  <p className="text-[26px] font-bold text-white leading-none tabular-nums">
                    {loading ? (
                      <span
                        className="inline-block w-7 h-6 rounded-md animate-pulse align-middle"
                        style={{ background: 'rgba(255,255,255,0.25)' }}
                      />
                    ) : (
                      counts[card.key] ?? 0
                    )}
                  </p>
                </div>
                <ArrowRight
                  className="w-3.5 h-3.5 mb-0.5 flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.50)' }}
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
