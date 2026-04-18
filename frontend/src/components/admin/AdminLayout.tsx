import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Code,
  BookOpen,
  FileCheck,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Award,
  Globe,
  Trophy,
  Mail,
  Heart,
  GraduationCap,
  History,
  CalendarDays,
  Newspaper,
  Quote,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { auth } from '@/lib/firebase';
import { CommonService } from '@/shared/services/common-service';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
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
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    ],
  },
  {
    label: 'Content',
    items: [
      { icon: Code,         label: 'Projects',       path: '/admin/projects' },
      { icon: BookOpen,     label: 'Blog Posts',     path: '/admin/blogs' },
      { icon: Briefcase,    label: 'Experience',     path: '/admin/experience' },
      { icon: Zap,          label: 'Skills & Tools', path: '/admin/skills' },
      { icon: FileCheck,    label: 'Certifications', path: '/admin/certificates' },
    ],
  },
  {
    label: 'Metadata',
    items: [
      { icon: Award,        label: 'Awards',         path: '/admin/awards' },
      { icon: CalendarDays, label: 'Events',         path: '/admin/events' },
      { icon: Newspaper,    label: 'Newsletters',    path: '/admin/newsletters' },
      { icon: Globe,        label: 'Languages',      path: '/admin/languages' },
      { icon: Trophy,       label: 'Hackathons',     path: '/admin/hackathons' },
      { icon: Quote,        label: 'Testimonials',   path: '/admin/testimonials' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: Heart,         label: 'Volunteer',      path: '/admin/volunteer' },
      { icon: GraduationCap, label: 'Education',      path: '/admin/education' },
      { icon: Mail,          label: 'Messages',       path: '/admin/messages', badge: true },
      { icon: History,       label: 'Activity Logs',  path: '/admin/logs' },
    ],
  },
];

const SIDEBAR_KEY = 'admin_sidebar_collapsed';

/* Editorial gold accent — used throughout admin panel */
const GOLD = '#C4A86A';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; }
    catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
    });
    return unsubscribe;
  }, [navigate, location.pathname]);

  useEffect(() => {
    CommonService.getMessages().then((msgs) => {
      setUnreadCount(msgs.filter((m) => !m.read).length);
    }).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try { await auth.signOut(); }
    catch (error) { console.error('Firebase signout error:', error); }
    navigate('/admin/login');
  };

  const currentPageLabel = navGroups
    .flatMap(g => g.items)
    .find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
    ?.label ?? 'Dashboard';

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Logo area ── */}
      <div className={cn(
        "flex items-center h-16 border-b flex-shrink-0 transition-all duration-300",
        "border-[rgba(255,255,255,0.055)]",
        collapsed ? "justify-center px-0" : "justify-between px-5"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(196,168,106,0.10)', border: '1px solid rgba(196,168,106,0.22)' }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: GOLD }} />
            </div>
            <span
              className="admin-editorial text-[15px] font-semibold italic tracking-wide"
              style={{ color: 'rgba(237,233,227,0.88)' }}
            >
              Saad.Dev
            </span>
          </div>
        )}
        {collapsed && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(196,168,106,0.10)', border: '1px solid rgba(196,168,106,0.22)' }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: GOLD }} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden md:flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 flex-shrink-0",
            "text-[rgba(237,233,227,0.22)] hover:text-[rgba(237,233,227,0.60)] hover:bg-white/[0.06]",
            collapsed && "absolute left-[52px] top-[22px] z-10 border shadow-xl w-5 h-5 rounded-full"
          )}
          style={collapsed ? { background: '#0C1121', borderColor: 'rgba(255,255,255,0.08)' } : {}}
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-5 custom-scrollbar px-2.5 space-y-0">
        <TooltipProvider delayDuration={0}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              {!collapsed && (
                <p
                  className="admin-editorial text-[10px] italic font-normal px-2.5 pb-2 pt-0.5 tracking-wide select-none"
                  style={{ color: 'rgba(237,233,227,0.22)' }}
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

                const linkEl = (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg transition-all duration-200 group relative mb-0.5",
                      collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                      isActive
                        ? "text-[#C4A86A]"
                        : "hover:text-[rgba(237,233,227,0.75)]"
                    )}
                    style={{
                      background: isActive
                        ? 'rgba(196,168,106,0.08)'
                        : undefined,
                      color: isActive ? GOLD : 'rgba(237,233,227,0.42)',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.035)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = '';
                    }}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full"
                        style={{ background: GOLD }}
                      />
                    )}

                    <div className="relative flex-shrink-0">
                      <item.icon className="w-[16px] h-[16px] transition-all duration-200 group-hover:scale-105" />
                      {hasBadge && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>

                    {!collapsed && (
                      <span className="text-[13px] font-medium tracking-[0.01em] truncate transition-all duration-200">
                        {item.label}
                      </span>
                    )}

                    {!collapsed && hasBadge && (
                      <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold flex items-center justify-center border border-red-500/20">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}

                    {!collapsed && isActive && !hasBadge && (
                      <ChevronRight
                        className="w-3 h-3 ml-auto flex-shrink-0"
                        style={{ color: 'rgba(196,168,106,0.35)' }}
                      />
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
                        {hasBadge && (
                          <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
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

      {/* ── Sign out ── */}
      <div
        className={cn("flex-shrink-0", collapsed ? "p-2" : "p-3")}
        style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}
      >
        <TooltipProvider delayDuration={0}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg transition-all"
                  style={{ color: 'rgba(237,233,227,0.25)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgb(248,113,113)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,233,227,0.25)';
                  }}
                >
                  <LogOut className="w-[16px] h-[16px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="text-xs font-medium"
                style={{ background: '#0C1121', borderColor: 'rgba(255,255,255,0.10)', color: '#EDE9E3' }}
              >
                Sign Out
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group"
              style={{ color: 'rgba(237,233,227,0.28)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgb(248,113,113)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,233,227,0.28)';
              }}
            >
              <LogOut className="w-[16px] h-[16px] flex-shrink-0" />
              <span className="text-[13px] font-medium tracking-[0.01em]">Sign Out</span>
            </button>
          )}
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <div className="admin-panel min-h-screen flex" style={{ background: '#080C18', color: '#EDE9E3' }}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative",
          collapsed ? "w-[64px]" : "w-64"
        )}
        style={{ background: '#0C1121', borderRight: '1px solid rgba(255,255,255,0.055)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          style={{ background: 'rgba(8,12,24,0.75)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transition-all duration-300 ease-in-out md:hidden flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: '#0C1121', borderRight: '1px solid rgba(255,255,255,0.055)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header
          className="h-14 flex items-center justify-between px-4 md:px-6 z-40 flex-shrink-0 backdrop-blur-xl"
          style={{
            background: 'rgba(12,17,33,0.70)',
            borderBottom: '1px solid rgba(255,255,255,0.055)',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-lg w-8 h-8 hover:bg-white/[0.06]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>

          {/* Breadcrumb */}
          <div
            className="hidden md:flex items-center gap-2 text-[11px] font-medium"
            style={{ color: 'rgba(237,233,227,0.28)' }}
          >
            <ShieldCheck className="w-3 h-3" style={{ color: 'rgba(196,168,106,0.65)' }} />
            <span>Admin Panel</span>
            <span className="mx-0.5" style={{ color: 'rgba(237,233,227,0.15)' }}>·</span>
            <span style={{ color: 'rgba(237,233,227,0.50)' }}>{currentPageLabel}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-medium tracking-wide transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(237,233,227,0.38)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(237,233,227,0.65)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(237,233,227,0.38)';
              }}
            >
              <ExternalLink className="w-3 h-3" />
              View Site
            </a>

            <div
              className="hidden sm:flex items-center text-[10px] px-3 py-1.5 rounded-full font-medium tracking-wide gap-2"
              style={{
                background: 'rgba(52,211,153,0.06)',
                color: 'rgba(52,211,153,0.80)',
                border: '1px solid rgba(52,211,153,0.12)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
              Live
            </div>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer relative transition-all duration-200"
              style={{
                background: 'rgba(196,168,106,0.08)',
                border: '1px solid rgba(196,168,106,0.20)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(196,168,106,0.38)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(196,168,106,0.20)';
              }}
            >
              <span className="text-[11px] font-semibold" style={{ color: GOLD }}>SM</span>
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center"
                  style={{ border: '1.5px solid #080C18' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-5 md:p-8 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
