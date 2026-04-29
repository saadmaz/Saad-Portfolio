import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Briefcase,
  Calendar,
  MapPin
} from 'lucide-react';
import { CommonService } from '@/shared/services/common-service';
import { Experience } from '@/types';
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminExperience = () => {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExperience();
  }, []);

  const fetchExperience = async () => {
    try {
      const data = await CommonService.getWorkExperience();
      setExperience(data);
    } catch (error) {
      toast.error('Failed to load experience');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Delete this experience?')) return;
    try {
      await CommonService.deleteExperience(id);
      toast.success('Experience deleted');
      fetchExperience();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-accent mb-3">CAREER</p>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground" style={{ fontFamily: 'DM Sans' }}>Experience</h1>
          <p className="text-sm text-muted-foreground font-medium">Manage your professional career timeline and roles.</p>
        </div>
        <Button
          onClick={() => navigate('/admin/experience/new')}
          className="bg-accent hover:bg-accent/90 text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Experience
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-28 bg-secondary border border-border rounded-2xl animate-pulse" />)
        ) : experience.length > 0 ? (
          experience.map((exp) => (
            <Card key={exp.id} className="bg-card border-border hover:bg-secondary hover:border-accent/30 transition-all group overflow-hidden rounded-2xl shadow-sm">
              <CardContent className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0 shadow-sm">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground text-lg group-hover:text-accent transition-colors truncate">{exp.position}</h3>
                    {exp.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Current</span>
                    )}
                  </div>
                  <p className="text-muted-foreground font-semibold mb-2">{exp.company}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground/70 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent" /> {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" /> {exp.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary active:scale-90 transition-all">
                        <MoreVertical className="w-4 h-4 text-muted-foreground/70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border text-foreground rounded-xl shadow-xl p-1">
                      <DropdownMenuItem
                        className="hover:bg-accent/10 hover:text-accent cursor-pointer rounded-lg m-1 py-2 font-semibold"
                        onClick={() => navigate(`/admin/experience/${exp.id}`)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-red-500/10 hover:text-red-500 cursor-pointer text-red-400 rounded-lg m-1 py-2 font-semibold"
                        onClick={() => handleDelete(exp.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-card shadow-sm">
            <p className="text-muted-foreground font-medium">No experience items yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExperience;
