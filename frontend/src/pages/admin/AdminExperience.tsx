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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Experience</h1>
          <p className="text-muted-foreground">Manage your career timeline and roles.</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/experience/new')}
          className="bg-accent hover:bg-accent/90 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Experience
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
        ) : experience.length > 0 ? (
          experience.map((exp) => (
            <Card key={exp.id} className="bg-white/5 border-white/10 overflow-hidden group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/20">
                  <Briefcase className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{exp.position}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{exp.company}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.location}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-white/10">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 text-white">
                    <DropdownMenuItem 
                      className="hover:bg-accent hover:text-black cursor-pointer"
                      onClick={() => navigate(`/admin/experience/${exp.id}`)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-red-500 hover:text-white cursor-pointer text-red-400"
                      onClick={() => handleDelete(exp.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
            <p className="text-muted-foreground italic">No experience items yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExperience;
