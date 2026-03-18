import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ExternalLink
} from 'lucide-react';
import { ProjectService } from '@/services/project-service';
import { BlogService } from '@/services/blog-service';
import { CommonService } from '@/shared/services/common-service';
import { ActivityLog } from '@/types';
import { toast } from "sonner";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Projects', value: '-', icon: Code, color: 'text-blue-500', path: '/admin/projects' },
    { label: 'Blog Posts', value: '-', icon: BookOpen, color: 'text-purple-500', path: '/admin/blogs' },
    { label: 'Awards', value: '-', icon: Award, color: 'text-yellow-500', path: '/admin/awards' },
    { label: 'Testimonials', value: '-', icon: MessageSquare, color: 'text-pink-500', path: '/admin/testimonials' },
  ]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projects, blogs, awards, testimonials, logs] = await Promise.all([
          ProjectService.getAll(),
          BlogService.getAll(),
          CommonService.getAwards(),
          CommonService.getTestimonials(),
          CommonService.getActivityLogs()
        ]);

        setStats([
          { label: 'Projects', value: projects.length.toString(), icon: Code, color: 'text-blue-500', path: '/admin/projects' },
          { label: 'Blog Posts', value: blogs.length.toString(), icon: BookOpen, color: 'text-purple-500', path: '/admin/blogs' },
          { label: 'Awards', value: awards.length.toString(), icon: Award, color: 'text-yellow-400', path: '/admin/awards' },
          { label: 'Testimonials', value: testimonials.length.toString(), icon: MessageSquare, color: 'text-pink-500', path: '/admin/testimonials' },
        ]);

        setRecentLogs(logs.slice(0, 5));
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-500';
      case 'UPDATE': return 'text-blue-500';
      case 'DELETE': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-lg italic">Welcome back, Saad. Here's a snapshot of your digital domain.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-white/80">System Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.path}>
            <Card className="bg-white/5 border-white/10 hover:border-accent/40 hover:bg-white/[0.08] transition-all group relative overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color} group-hover:scale-125 transition-transform duration-500`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{isLoading ? '...' : stat.value}</div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground group-hover:text-accent transition-colors">
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Activity */}
        <Card className="lg:col-span-8 bg-white/5 border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-accent" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <Link to="/admin/logs" className="text-xs text-muted-foreground hover:text-white transition-colors underline underline-offset-4">
              View All Logs
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 w-full bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${getActionColor(log.action)}`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white/90">{log.entityType}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-tighter ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-md truncate">
                          {log.details || `Admin ${log.adminEmail} performed ${log.action.toLowerCase()}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp), 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground text-sm italic">
                No recent activity to display.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Tips */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-accent border-accent/20 text-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Zap className="w-5 h-5 fill-current" /> Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link to="/admin/blogs" className="w-full">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-black/10 hover:bg-black/20 transition-all font-bold flex items-center justify-between group">
                  New Blog Post
                  <TrendingUp className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </Link>
              <Link to="/admin/projects" className="w-full">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-black/5 hover:bg-black/15 transition-all font-bold flex items-center justify-between group">
                  Add Showcase Project
                  <Code className="w-4 h-4" />
                </button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Pro Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/80 leading-relaxed italic">
                "Regularly updating your 'Testimonials' and 'Awards' sections helps build trust with potential clients and employers. Keep them fresh!"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
