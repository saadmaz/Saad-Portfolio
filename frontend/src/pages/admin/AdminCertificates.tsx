import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await CommonService.deleteCertificate(id);
      toast.success('Certificate deleted');
      fetchCertificates();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Certificates</h1>
          <p className="text-muted-foreground">Showcase your verified achievements and learning.</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/certificates/new')}
          className="bg-accent hover:bg-accent/90 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Certificate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)
        ) : certificates.length > 0 ? (
          certificates.map((cert) => (
            <Card key={cert.id} className="bg-white/5 border-white/10 overflow-hidden hover:border-accent/40 transition-all group relative">
                <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 bg-black/50 backdrop-blur-sm">
                                <MoreVertical className="w-4 h-4 text-white" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 text-white">
                            <DropdownMenuItem 
                                className="hover:bg-accent hover:text-black cursor-pointer"
                                onClick={() => navigate(`/admin/certificates/${cert.id}`)}
                            >
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="hover:bg-red-500 hover:text-white cursor-pointer text-red-400"
                                onClick={() => handleDelete(cert.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="aspect-[4/3] bg-white/3 border-b border-white/5 flex items-center justify-center p-8">
                    {cert.issuer_logo ? (
                        <img src={cert.issuer_logo} alt={cert.issuer} className="w-20 h-20 object-contain grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                        <Award className="w-12 h-12 text-accent/40" />
                    )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-white line-clamp-1 mb-1">{cert.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{cert.issuer}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {cert.issue_date}
                    </span>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-[10px] hover:text-accent p-0"
                        onClick={() => window.open(cert.credential_url, '_blank')}
                    >
                        Verify <ExternalLink className="w-3 h-3 ml-1" />
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
    </div>
  );
};

export default AdminCertificates;
