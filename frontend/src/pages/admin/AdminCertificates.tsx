import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Award,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { CommonService } from '@/shared/services/common-service';
import { Certificate } from '@/types';
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; label: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await CommonService.getCertificates();
      setCertificates(data);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string | number, label: string) => setDeleteTarget({ id, label });
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await CommonService.deleteCertificate(deleteTarget.id);
      toast.success('Certificate deleted');
      fetchCertificates();
    } catch { toast.error('Delete failed'); }
    finally { setDeleteTarget(null); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">Certificates</h1>
          <p className="text-muted-foreground">Showcase your verified achievements and professional learning.</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/certificates/new')}
          className="bg-accent hover:bg-accent/90 text-black font-bold shadow-[0_0_20px_rgba(255,184,0,0.2)] rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Certificate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />)
        ) : certificates.length > 0 ? (
          certificates.map((cert) => (
            <Card key={cert.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-all group relative rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10 bg-black/60 backdrop-blur-md border-white/10">
                                <MoreVertical className="w-4 h-4 text-white" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0f0f0f] border-white/10 text-white rounded-xl shadow-2xl p-1">
                            <DropdownMenuItem 
                                className="hover:bg-accent hover:text-black cursor-pointer rounded-lg m-1 py-1.5 font-semibold"
                                onClick={() => navigate(`/admin/certificates/${cert.id}`)}
                            >
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="hover:bg-red-500/20 hover:text-red-500 cursor-pointer text-red-400 rounded-lg m-1 py-1.5 font-semibold"
                                onClick={() => handleDelete(cert.id, cert.title)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="aspect-[16/9] bg-white/[0.02] border-b border-white/5 flex items-center justify-center p-10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {cert.issuer_logo ? (
                        <img 
                          src={cert.issuer_logo} 
                          alt={cert.issuer} 
                          className="w-24 h-24 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 z-10" 
                        />
                    ) : (
                        <Award className="w-16 h-16 text-accent/20 group-hover:text-accent/40 transition-colors z-10" />
                    )}
                </div>

                <CardContent className="p-5 flex flex-col h-full">
                  <h3 className="font-bold text-white text-lg line-clamp-1 mb-1 group-hover:text-accent transition-colors">{cert.title}</h3>
                  <p className="text-sm font-medium text-white/50 mb-4">{cert.issuer}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-accent" /> {cert.issue_date}
                    </span>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-[11px] font-black uppercase tracking-wider hover:text-accent p-2 rounded-lg hover:bg-white/5 group-hover:translate-x-1 transition-all"
                        onClick={() => window.open(cert.credential_url, '_blank')}
                    >
                        Verify <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
            <p className="text-muted-foreground italic">No certificates added yet.</p>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Certificate?" description={`"${deleteTarget?.label}" will be permanently deleted.`} confirmLabel="Delete" onConfirm={handleConfirmDelete} />
    </div>
  );
};

export default AdminCertificates;
