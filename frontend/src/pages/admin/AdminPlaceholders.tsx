import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">{title}</h1>
        <p className="text-muted-foreground">Manage your {title.toLowerCase()} from here.</p>
      </div>
      <Button className="bg-accent hover:bg-accent/90 text-black font-semibold">
        <Plus className="w-4 h-4 mr-2" /> Add New
      </Button>
    </div>
    
    <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-white mb-1">No items yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Start building your portfolio by adding your first {title.toLowerCase()}.
      </p>
    </div>
  </div>
);

export const AdminProjects = () => <AdminPlaceholder title="Projects" />;
export const AdminBlogs = () => <AdminPlaceholder title="Blog Posts" />;
export const AdminExperience = () => <AdminPlaceholder title="Experience" />;
export const AdminSkills = () => <AdminPlaceholder title="Skills" />;
export const AdminCertificates = () => <AdminPlaceholder title="Certifications" />;
