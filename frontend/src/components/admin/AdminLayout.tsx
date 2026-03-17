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
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
  { icon: Code, label: 'Projects', path: '/admin/projects' },
  { icon: BookOpen, label: 'Blog Posts', path: '/admin/blogs' },
  { icon: Briefcase, label: 'Experience', path: '/admin/experience' },
  { icon: Zap, label: 'Skills & Tools', path: '/admin/skills' },
  { icon: FileCheck, label: 'Certifications', path: '/admin/certificates' },
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

  const handleLogout = () => {
    localStorage.removeItem('admin_secret');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a]/80 backdrop-blur-xl border-right border-white/5 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-white/5",
          !isSidebarOpen && "-translate-x-full md:absolute"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 px-2 mb-10 mt-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight">Saad.Admin</span>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-accent/10 text-accent font-medium shadow-[0_0_20px_rgba(255,255,255,0.02)]" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-[20px] h-[20px]", isActive ? "text-accent" : "text-muted-foreground group-hover:text-white")} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-1/2 bg-accent rounded-r-full" />
                  )}
                  {isActive && (
                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-white/5">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md flex items-center justify-between px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1.5 font-medium uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Mode
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">SM</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
