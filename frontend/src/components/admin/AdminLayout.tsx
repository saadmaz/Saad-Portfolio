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
  ChevronRight,
  Award,
  Globe,
  Trophy,
  MessageSquare,
  Heart,
  GraduationCap,
  History
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { auth } from '@/services/firebase';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
  { icon: Code, label: 'Projects', path: '/admin/projects' },
  { icon: BookOpen, label: 'Blog Posts', path: '/admin/blogs' },
  { icon: Briefcase, label: 'Experience', path: '/admin/experience' },
  { icon: Zap, label: 'Skills & Tools', path: '/admin/skills' },
  { icon: FileCheck, label: 'Certifications', path: '/admin/certificates' },
  { icon: Award, label: 'Awards', path: '/admin/awards' },
  { icon: Globe, label: 'Events', path: '/admin/events' },
  { icon: MessageSquare, label: 'Newsletters', path: '/admin/newsletters' },
  { icon: Globe, label: 'Languages', path: '/admin/languages' },
  { icon: Trophy, label: 'Hackathons', path: '/admin/hackathons' },
  { icon: MessageSquare, label: 'Testimonials', path: '/admin/testimonials' },
  { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
  { icon: Heart, label: 'Volunteer', path: '/admin/volunteer' },
  { icon: GraduationCap, label: 'Education', path: '/admin/education' },
  { icon: History, label: 'Activity Logs', path: '/admin/logs' },
];

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Basic Auth Check
  useEffect(() => {
    const secret = localStorage.getItem('admin_secret');
    if (!secret && location.pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Firebase signout error:', error);
    }
    localStorage.removeItem('admin_secret');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a]/95 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 ease-in-out md:relative md:translate-x-0",
          !isSidebarOpen && "-translate-x-full md:w-0 md:opacity-0"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic">Saad.Dev</span>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
                    isActive 
                      ? "bg-accent/10 text-accent font-bold shadow-[inset_0_0_20px_rgba(255,184,0,0.05)]" 
                      : "text-white/40 hover:bg-white/[0.03] hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-[18px] h-[18px] transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span className="text-xs uppercase tracking-widest font-bold">{item.label}</span>
                  
                  {isActive && (
                    <div className="absolute left-0 w-1 h-1/2 bg-accent rounded-r-full animate-in fade-in slide-in-from-left duration-500" />
                  )}
                  {isActive && (
                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-white/40 font-bold text-xs uppercase tracking-widest transition-all"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl flex items-center justify-between px-6 z-40">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden hover:bg-white/5 rounded-xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <LayoutDashboard className="w-3 h-3" />
            <span>Admin Control Center v2.0</span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center text-[10px] px-3 py-1.5 rounded-full bg-green-500/5 text-green-500 border border-green-500/10 gap-2 font-black uppercase tracking-widest shadow-inner shadow-green-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Secure Link Active
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:border-accent/40 transition-colors cursor-pointer group">
              <span className="text-xs font-black text-white/40 group-hover:text-accent transition-colors">SM</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
