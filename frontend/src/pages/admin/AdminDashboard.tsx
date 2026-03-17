import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, BookOpen, Briefcase, TrendingUp, Clock, Zap } from 'lucide-react';
import { ProjectService } from '@/services/project-service';
import { BlogService } from '@/services/blog-service';
import { CommonService } from '@/shared/services/common-service';
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: '-', icon: Code, color: 'text-blue-500' },
    { label: 'Blog Posts', value: '-', icon: BookOpen, color: 'text-purple-500' },
    { label: 'Experience Items', value: '-', icon: Briefcase, color: 'text-green-500' },
    { label: 'Skills & Tools', value: '-', icon: Zap, color: 'text-orange-500' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, blogs, experience, skills] = await Promise.all([
          ProjectService.getAll(),
          BlogService.getAll(),
          CommonService.getWorkExperience(),
          CommonService.getSkills()
        ]);

        setStats([
          { label: 'Total Projects', value: projects.length.toString(), icon: Code, color: 'text-blue-500' },
          { label: 'Blog Posts', value: blogs.length.toString(), icon: BookOpen, color: 'text-purple-500' },
          { label: 'Experience Items', value: experience.length.toString(), icon: Briefcase, color: 'text-green-500' },
          { label: 'Skills & Tools', value: skills.length.toString(), icon: Zap, color: 'text-orange-500' },
        ]);
      } catch (error) {
        toast.error('Failed to fetch dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, Saad. Here's what's happening with your portfolio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white/5 border-white/10 hover:border-white/20 transition-all group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active content on your site
              </p>
            </CardContent>
            {/* Subtle glow effect on hover */}
            <div className={`absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r from-transparent via-white to-transparent blur-xl pointer-events-none`} />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Backend API</span>
                </div>
                <span className="text-xs text-muted-foreground">Online & Secure</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Firestore Database</span>
                </div>
                <span className="text-xs text-muted-foreground">Connected</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-medium">Memory Cache</span>
                </div>
                <span className="text-xs text-muted-foreground">Optimized</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-accent text-black font-semibold hover:bg-accent/90 transition-colors flex items-center justify-between group">
              Post to Blog
              <Zap className="w-4 h-4 opacity-50 group-hover:opacity-100" />
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
              Add Project
            </button>
            <button className="w-full text-left px-4 py-4 rounded-lg border border-white/10 border-dashed hover:bg-white/5 transition-colors text-center text-sm text-muted-foreground">
              Configure Storage
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
