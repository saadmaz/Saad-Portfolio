import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Code, BookOpen, FileCheck,
  LogOut, Menu, X, ShieldCheck, Zap, Award, Globe, Trophy,
  Mail, Heart, GraduationCap, CalendarDays, Newspaper,
  Quote, ChevronLeft, ChevronRight, ExternalLink,
  BookMarked, FileText, Lightbulb, Building2,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { auth } from '@/lib/firebase';
import { CommonService } from '@/shared/services/common-service';
import { ProjectService } from '@/services/project-service';
import { BlogService } from '@/services/blog-service';

/* ─── Nav definition ─────────────────────────────────────────── */
interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  countKey?: string;
  badge?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin/dashboard' },
    ],
  },
  {
    label: 'Content',
    items: [
      { icon: Code,         label: 'Projects',       path: '/admin/projects',     countKey: 'projects' },
      { icon: BookOpen,     label: 'Blog Posts',      path: '/admin/blogs',        countKey: 'blogs' },
      { icon: Briefcase,    label: 'Experience',      path: '/admin/experience',   countKey: 'experience' },
      { icon: Zap,          label: 'Skills & Tools',  path: '/admin/skills',       countKey: 'skills' },
      { icon: FileCheck,    label: 'Certifications',  path: '/admin/certificates', countKey: 'certificates' },
    ],
  },
  {
    label: 'Metadata',
    items: [
      { icon: Award,        label: 'Awards',       path: '/admin/awards',       countKey: 'awards' },
      { icon: CalendarDays, label: 'Events',        path: '/admin/events',       countKey: 'events' },
      { icon: Newspaper,    label: 'Newsletters',   path: '/admin/newsletters',  countKey: 'newsletters' },
      { icon: Globe,        label: 'Languages',     path: '/admin/languages',    countKey: 'languages' },
      { icon: Trophy,       label: 'Hackathons',    path: '/admin/hackathons',   countKey: 'hackathons' },
      { icon: Quote,        label: 'Testimonials',  path: '/admin/testimonials', countKey: 'testimonials' },
    ],
  },
  {
    label: 'Profile',
    items: [
      { icon: BookMarked,    label: 'Courses',         path: '/admin/courses',       countKey: 'courses' },
      { icon: FileText,      label: 'Publications',    path: '/admin/publications',  countKey: 'publications' },
      { icon: Lightbulb,     label: 'Patents',         path: '/admin/patents',       countKey: 'patents' },
      { icon: Building2,     label: 'Organizations',   path: '/admin/organizations', countKey: 'organizations' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: Heart,         label: 'Volunteer',      path: '/admin/volunteer',   countKey: 'volunteer' },
      { icon: GraduationCap, label: 'Education',      path: '/admin/education',   countKey: 'education' },
      { icon: Mail,          label: 'Messages',        path: '/admin/messages',    countKey: 'messages', badge: true },
    ],
  },
];

/* ─── Palette ────────────────────────────────────────────────── */
const EMERALD     = '#10b981';
const SIDEBAR_KEY = 'admin_sidebar_collapsed';

/* ─── Main layout ────────────────────────────────────────────── */
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [navCounts, setNavCounts] = useState<Record<string, number>>({});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch {}
  }, [collapsed]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user && location.pathname !== '/admin/login') navigate('/admin/login');
    });
    return unsub;
  }, [navigate, location.pathname]);

  useEffect(() => {
    Promise.all([
      ProjectService.getAll(),
      BlogService.getAll(),
      CommonService.getMessages(),
      CommonService.getWorkExperience(),
      CommonService.getSkills(),
      CommonService.getCertificates(),
      CommonService.getAwards(),
      CommonService.getEvents(),
      CommonService.getTestimonials(),
      CommonService.getCourses(),
      CommonService.getPublications(),
      CommonService.getPatents(),
      CommonService.getOrganizations(),
    ]).then(([projects, blogs, messages, experience, skills, certs, awards, events, testimonials, courses, publications, patents, organizations]) => {
      const unread = messages.filter((m) => !m.read).length;
      setUnreadCount(unread);
      setNavCounts({
        projects:      projects.length,
        blogs:         blogs.length,
        experience:    experience.length,
        skills:        skills.length,
        certificates:  certs.length,
        awards:        awards.length,
        events:        events.length,
        testimonials:  testimonials.length,
        messages:      unread,
        courses:       courses.length,
        publications:  publications.length,
        patents:       patents.length,
        organizations: organizations.length,
      });
    }).catch(() => {});
  }, [location.pathname]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const currentPageLabel = navGroups
    .flatMap(g => g.items)
    .find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
    ?.label ?? 'Dashboard';

  /* ── Sidebar content ────────────────────────────────────────── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo / brand */}
      <div className={cn(
        "flex items-center h-14 border-b flex-shrink-0 transition-all duration-300",
        "border-[rgba(255,255,255,0.055)]",
        collapsed ? "justify-center px-0" : "justify-between px-4"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.22)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: EMERALD }} />
            </div>
            <span
              className="text-[13px] font-semibold"
              style={{ color: 'rgba(237,233,227,0.90)' }}
            >
              Admin
            </span>
          </div>
        )}
        {collapsed && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.22)' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: EMERALD }} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden md:flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200 flex-shrink-0",
            "text-[rgba(237,233,227,0.22)] hover:text-[rgba(237,233,227,0.60)] hover:bg-white/[0.06]",
            collapsed && "absolute left-[52px] top-[20px] z-10 border shadow-xl rounded-full"
          )}
          style={collapsed ? { background: '#0C1121', borderColor: 'rgba(255,255,255,0.08)' } : {}}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-2 space-y-0">
        <TooltipProvider delayDuration={0}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p
                  className="text-[9px] font-semibold px-2.5 pb-1.5 pt-0.5 tracking-[0.14em] uppercase select-none"
                  style={{ color: 'rgba(237,233,227,0.18)' }}
                >
                  {group.label}
                </p>
              )}
              {collapsed && (
                <div className="my-2 mx-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />
              )}

              {group.items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                const hasBadge = Boolean(item.badge) && unreadCount > 0;
                const count = item.countKey ? navCounts[item.countKey] : undefined;

                const linkEl = (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative mb-0.5 outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/40",
                      collapsed ? "justify-center px-0 py-2.5" : "px-2.5 py-2"
                    )}
                    style={{
                      background: isActive ? 'rgba(16,185,129,0.08)' : undefined,
                      color: isActive ? EMERALD : 'rgba(237,233,227,0.40)',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = '';
                    }}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
                        style={{ background: EMERALD }}
                      />
                    )}

                    <div className="relative flex-shrink-0">
                      <item.icon className="w-[15px] h-[15px] transition-transform duration-150 group-hover:scale-105" />
                      {hasBadge && collapsed && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[13px] h-[13px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>

                    {!collapsed && (
                      <>
                        <span
                          className="text-[12.5px] font-medium tracking-[0.005em] truncate flex-1 transition-colors duration-150"
                          style={{ color: isActive ? EMERALD : 'rgba(237,233,227,0.48)' }}
                        >
                          {item.label}
                        </span>
                        {hasBadge ? (
                          <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold flex items-center justify-center border border-red-500/20">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        ) : count !== undefined ? (
                          <span
                            className="ml-auto text-[10px] font-semibold tabular-nums"
                            style={{ color: isActive ? 'rgba(16,185,129,0.55)' : 'rgba(237,233,227,0.15)' }}
                          >
                            {count}
                          </span>
                        ) : null}
                      </>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="text-xs font-medium flex items-center gap-2"
                        style={{ background: '#0C1121', borderColor: 'rgba(255,255,255,0.10)', color: '#EDE9E3' }}
                      >
                        {item.label}
                        {count !== undefined && (
                          <span style={{ color: 'rgba(237,233,227,0.35)' }}>{count}</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return linkEl;
              })}
            </div>
          ))}
        </TooltipProvider>
      </nav>

      {/* User profile + sign out */}
      <div
        className="flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}
      >
        {/* User row */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
              style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)', color: EMERALD }}
            >
              SM
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold truncate" style={{ color: 'rgba(237,233,227,0.80)' }}>
                Saad Mazhar
              </p>
              <p className="text-[9.5px] truncate" style={{ color: 'rgba(237,233,227,0.22)' }}>
                saadmazaa@gmail.com
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)', color: EMERALD }}
            >
              SM
            </div>
          </div>
        )}

        {/* Sign out */}
        <div className={cn("pb-3", collapsed ? "px-2" : "px-3")}>
          <TooltipProvider delayDuration={0}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={async () => { try { await auth.signOut(); } catch {} navigate('/admin/login'); }}
                    className="w-full flex items-center justify-center p-2 rounded-lg transition-all"
                    style={{ color: 'rgba(237,233,227,0.22)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgb(248,113,113)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,233,227,0.22)'; }}
                  >
                    <LogOut className="w-[15px] h-[15px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs" style={{ background: '#0C1121', borderColor: 'rgba(255,255,255,0.10)', color: '#EDE9E3' }}>
                  Sign Out
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={async () => { try { await auth.signOut(); } catch {} navigate('/admin/login'); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all group text-[12px] font-medium"
                style={{ color: 'rgba(237,233,227,0.25)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgb(248,113,113)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,233,227,0.25)'; }}
              >
                <LogOut className="w-[14px] h-[14px] flex-shrink-0" />
                Sign Out
              </button>
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  /* ── Root render ──────────────────────────────────────────── */
  return (
    <div className="admin-panel min-h-screen flex" style={{ background: '#080C18', color: '#EDE9E3' }}>

        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative",
            collapsed ? "w-[60px]" : "w-[220px]"
          )}
          style={{ background: '#0C1121', borderRight: '1px solid rgba(255,255,255,0.055)' }}
        >
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm md:hidden"
            style={{ background: 'rgba(8,12,24,0.75)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[220px] transition-all duration-300 ease-in-out md:hidden flex flex-col",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ background: '#0C1121', borderRight: '1px solid rgba(255,255,255,0.055)' }}
        >
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top bar */}
          <header
            className="h-12 flex items-center justify-between px-4 md:px-5 z-40 flex-shrink-0 backdrop-blur-xl gap-3"
            style={{ background: 'rgba(12,17,33,0.80)', borderBottom: '1px solid rgba(255,255,255,0.055)' }}
          >
            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg w-7 h-7 hover:bg-white/[0.06] flex-shrink-0"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            </Button>

            {/* Breadcrumb */}
            <div
              className="hidden md:flex items-center gap-1.5 text-[10.5px] font-medium flex-shrink-0"
              style={{ color: 'rgba(237,233,227,0.25)' }}
            >
              <ShieldCheck className="w-3 h-3" style={{ color: 'rgba(16,185,129,0.55)' }} />
              <span>Admin</span>
              <span style={{ color: 'rgba(237,233,227,0.12)' }}>›</span>
              <span style={{ color: 'rgba(237,233,227,0.48)' }}>{currentPageLabel}</span>
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-medium tracking-wide transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(237,233,227,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(237,233,227,0.65)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(237,233,227,0.35)'; }}
              >
                <ExternalLink className="w-2.5 h-2.5" />
                View site
              </a>

              <div
                className="hidden sm:flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(16,185,129,0.06)', color: 'rgba(52,211,153,0.75)', border: '1px solid rgba(16,185,129,0.12)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
                Live
              </div>

              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer relative transition-all duration-150 text-[10px] font-bold"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: EMERALD }}
              >
                SM
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[7px] font-bold flex items-center justify-center"
                    style={{ border: '1.5px solid #080C18' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{ background: '#F0F4F8' }}
          >
            <div className="p-5 md:p-7 max-w-[1400px] mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
  );
};

export default AdminLayout;
