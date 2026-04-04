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

// ─── Nav structure ────────────────────────────────────────────────
const navGroups = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    ],
  },
  {
    label: 'Content',
    items: [
      { icon: Code,         label: 'Projects',      path: '/admin/projects' },
      { icon: BookOpen,     label: 'Blog Posts',    path: '/admin/blogs' },
      { icon: Briefcase,    label: 'Experience',    path: '/admin/experience' },
      { icon: Zap,          label: 'Skills & Tools',path: '/admin/skills' },
      { icon: FileCheck,    label: 'Certifications',path: '/admin/certificates' },
    ],
  },
  {
    label: 'Metadata',
    items: [
      { icon: Award,        label: 'Awards',        path: '/admin/awards' },
      { icon: CalendarDays, label: 'Events',        path: '/admin/events' },
      { icon: Newspaper,    label: 'Newsletters',   path: '/admin/newsletters' },
      { icon: Globe,        label: 'Languages',     path: '/admin/languages' },
      { icon: Trophy,       label: 'Hackathons',    path: '/admin/hackathons' },
      { icon: Quote,        label: 'Testimonials',  path: '/admin/testimonials' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: Heart,          label: 'Volunteer',     path: '/admin/volunteer' },
      { icon: GraduationCap,  label: 'Education',     path: '/admin/education' },
      { icon: Mail,           label: 'Messages',      path: '/admin/messages', badge: true },
      { icon: History,        label: 'Activity Logs', path: '/admin/logs' },
    ],
  },
];

const SIDEBAR_KEY = 'admin_sidebar_collapsed';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; }
    catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  // Auth guard
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
    });
    return unsubscribe;
  }, [navigate, location.pathname]);

  // Fetch unread message count
  useEffect(() => {
    CommonService.getMessages().then((msgs) => {
      setUnreadCount(msgs.filter((m) => !m.read).length);
    }).catch(() => {});
  }, [location.pathname]); // re-fetch on page change

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Firebase signout error:', error);
    }
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo + collapse toggle */}
      <div className={cn(
        "flex items-center h-16 border-b border-white/5 bg-white/[0.02] flex-shrink-0 transition-all duration-300",
        collapsed ? "justify-center px-0" : "justify-between px-4"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase italic text-white">Saad.Dev</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden md:flex items-center justify-center w-6 h-6 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0",
            collapsed && "absolute left-[52px] top-[22px] z-10 bg-[#0a0a0a] border border-white/10 shadow-xl w-5 h-5 rounded-full"
          )}
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 custom-scrollbar px-2">
        <TooltipProvider delayDuration={0}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              {/* Group heading — only in expanded mode */}
              {!collapsed && (
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-3 pt-3 pb-1.5">
                  {group.label}
                </p>
              )}
              {collapsed && (
                <div className="my-1 border-t border-white/5 mx-1" />
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                const hasBadge = (item as any).badge && unreadCount > 0;

                const linkEl = (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
                      collapsed ? "justify-center px-0 py-2.5 mx-0" : "px-3 py-2.5",
                      isActive
                        ? "bg-accent/10 text-accent shadow-[inset_0_0_20px_rgba(255,184,0,0.05)]"
                        : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                    )}

                    {/* Icon + optional badge */}
                    <div className="relative flex-shrink-0">
                      <item.icon className={cn(
                        "w-[17px] h-[17px] transition-all duration-200",
                        isActive ? "text-accent" : "group-hover:scale-105"
                      )} />
                      {hasBadge && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center leading-none">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Label — hidden when collapsed */}
                    {!collapsed && (
                      <span className={cn(
                        "text-[11px] uppercase tracking-widest font-bold truncate transition-all duration-200",
                        isActive ? "text-accent" : ""
                      )}>
                        {item.label}
                      </span>
                    )}

                    {/* Unread count next to label when expanded */}
                    {!collapsed && hasBadge && (
                      <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500/20 text-red-400 text-[9px] font-black flex items-center justify-center border border-red-500/20">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}

                    {/* Chevron for active item in expanded mode */}
                    {!collapsed && isActive && (
                      <ChevronRight className="w-3 h-3 ml-auto opacity-40 flex-shrink-0" />
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#1a1a1a] border-white/10 text-white text-xs font-bold flex items-center gap-2">
                        {item.label}
                        {hasBadge && (
                          <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
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

      {/* Sign out */}
      <div className={cn(
        "border-t border-white/5 bg-white/[0.01] flex-shrink-0",
        collapsed ? "p-2" : "p-3"
      )}>
        <TooltipProvider delayDuration={0}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-2.5 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-500 transition-all"
                >
                  <LogOut className="w-[17px] h-[17px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1a1a1a] border-white/10 text-white text-xs font-bold">
                Sign Out
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-500 transition-all group"
            >
              <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
              <span className="text-[11px] uppercase tracking-widest font-bold">Sign Out</span>
            </button>
          )}
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* ── Desktop Sidebar ── */}
      <aside className={cn(
        "hidden md:flex flex-col flex-shrink-0 bg-[#0a0a0a]/95 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 ease-in-out relative",
        collapsed ? "w-[60px]" : "w-60"
      )}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 bg-[#0a0a0a] border-r border-white/5 transition-all duration-300 ease-in-out md:hidden flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-40 flex-shrink-0">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-white/5 rounded-xl w-8 h-8"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>

          {/* Breadcrumb / title */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
            <ShieldCheck className="w-3 h-3 text-accent" />
            <span>Admin Control Center</span>
            <span className="text-white/10">·</span>
            <span className="text-white/40">{navGroups.flatMap(g => g.items).find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))?.label ?? 'Dashboard'}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* View live site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full bg-white/5 text-white/40 border border-white/10 font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              View Site
            </a>

            {/* Live badge */}
            <div className="hidden sm:flex items-center text-[10px] px-3 py-1.5 rounded-full bg-green-500/5 text-green-500 border border-green-500/10 gap-2 font-black uppercase tracking-widest shadow-inner shadow-green-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 flex items-center justify-center hover:border-accent/50 transition-colors cursor-pointer group relative">
              <span className="text-[11px] font-black text-accent">SM</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center border border-[#050505]">
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
