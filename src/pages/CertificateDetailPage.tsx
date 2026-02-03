import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  Award, 
  BadgeCheck, 
  FileText, 
  ShieldCheck, 
  Tag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { certificatesData } from "@/data";

/**
 * CERTIFICATE DETAIL PAGE
 * * A comprehensive view for individual certificates featuring:
 * - Professional Sidebar with blue-themed issuer branding
 * - Verified status indicators
 * - Landscape-optimized PDF viewer
 * - Detailed skill taxonomy
 */
const CertificateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * DATA INITIALIZATION
   * Syncs the URL ID with your central data store.
   */
  useEffect(() => {
    // Standardizing data source as an array for search
    const raw = Array.isArray(certificatesData) ? certificatesData : [certificatesData];
    const found = raw.find((x) => String(x.id) === String(id));
    
    setCert(found || null);
    setLoading(false);
  }, [id]);

  /**
   * FORMATTER: Date to Long String
   */
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  // --- RENDER: LOADING STATE ---
  if (loading) {
    return (
      <Layout>
        <div className="section-container py-32 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground animate-pulse">Loading credential details...</p>
        </div>
      </Layout>
    );
  }

  // --- RENDER: NOT FOUND STATE ---
  if (!cert) {
    return (
      <Layout>
        <div className="section-container py-32 text-center">
          <Award className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h2 className="text-2xl font-bold mb-2">Credential Not Found</h2>
          <p className="text-muted-foreground mb-8">The certificate you are looking for does not exist or has been moved.</p>
          <Button variant="outline" onClick={() => navigate("/certifications")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Certifications
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding bg-secondary/10 min-h-screen">
        <div className="section-container">
          
          {/* --- TOP NAVIGATION & TITLE --- */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center gap-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)} 
              className="w-fit border-border hover:bg-background transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-widest text-accent">Official Certification</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                {cert.title}
              </h1>
            </div>
          </div>

          {/* --- MAIN PAGE GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: BRANDING & METADATA (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-card rounded-3xl border border-border p-8 sticky top-24 shadow-sm">
                
                {/* Issuer Branding with Blue Ring Aesthetic */}
                <div className="mb-8 flex flex-col items-center">
                  <div className="relative p-2 rounded-full border-4 border-blue-500/10 bg-blue-500/5 mb-4">
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center border-2 border-blue-200 shadow-md overflow-hidden">
                      {cert.issuer_logo ? (
                        <img src={cert.issuer_logo} alt={cert.issuer} className="w-20 h-20 object-contain" />
                      ) : (
                        <Award className="w-14 h-14 text-blue-500" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center">{cert.issuer}</h3>
                  <p className="text-sm text-muted-foreground">{cert.platform}</p>
                </div>

                {/* Status Badges */}
                <div className="space-y-4 mb-8">
                  {cert.is_verifiable && (
                    <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-5 py-3 rounded-2xl border border-emerald-500/20 shadow-sm">
                      <BadgeCheck className="w-6 h-6 animate-pulse" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-tighter leading-none mb-0.5">Verified</p>
                        <p className="text-[10px] opacity-80">Authenticity Guaranteed</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata Details */}
                <div className="space-y-6 border-t border-border pt-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Issued On</span>
                    <span className="font-bold">{formatDate(cert.issue_date)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Expires</span>
                    <span className="font-bold">{cert.does_not_expire ? "Never" : formatDate(cert.expiry_date)}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest block mb-2">Credential ID</span>
                    <code className="block w-full text-center py-2 bg-secondary/50 rounded-lg text-xs font-mono border border-border/40">
                      {cert.credential_id || "ID-NOT-SPECIFIED"}
                    </code>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest block mb-3">Skills & Competencies</span>
                    <div className="flex flex-wrap gap-2">
                      {(cert.skills || cert.tags || []).map((skill: string, idx: number) => (
                        <span key={idx} className="flex items-center gap-1.5 text-[10px] bg-accent/10 text-accent border border-accent/20 px-3 py-1.5 rounded-lg font-bold uppercase tracking-tighter">
                          <Tag className="w-3 h-3" /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {cert.credential_url && (
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-7 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                        Verify on Provider Site <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CONTENT & PREVIEW (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Context / About Section */}
              <div className="bg-card rounded-3xl border border-border p-8 md:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-accent" /> Professional Context
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {cert.description}
                </p>
              </div>

              {/* Landscape PDF Viewer Container */}
              <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex flex-col">
                <div className="border-b border-border px-8 py-5 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-bold">Credential Document</h2>
                  </div>
                  {cert.pdf_document_link && (
                    <Button variant="secondary" size="sm" asChild className="font-bold">
                      <a href={cert.pdf_document_link} target="_blank" rel="noopener noreferrer">
                        Full View
                      </a>
                    </Button>
                  )}
                </div>
                
                {/* LANDSCAPE OPTIMIZATION:
                  Using Aspect Ratio padding (pt-[70%]) ensures the container stays 
                  proportional to landscape PDF dimensions regardless of device width.
                */}
                <div className="bg-secondary/30 relative w-full pt-[70%]">
                  {cert.pdf_document_link ? (
                    <iframe
                      src={`${cert.pdf_document_link}#view=FitH&toolbar=0`}
                      title="Certification PDF Preview"
                      className="absolute inset-0 w-full h-full border-0 shadow-inner"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                      <FileText className="w-20 h-20 text-muted-foreground mb-6 opacity-10" />
                      <p className="text-muted-foreground font-semibold text-xl">Preview Unavailable</p>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                        This credential does not have an associated PDF preview. Please use the verification link.
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-8 py-4 bg-muted/10 text-[11px] text-muted-foreground text-center italic border-t border-border">
                  Note: Document loading depends on your network speed and browser PDF capabilities.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CertificateDetailPage;
