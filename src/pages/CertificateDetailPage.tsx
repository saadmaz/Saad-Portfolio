import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, ExternalLink, Calendar, Award, BadgeCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { certificatesData } from "@/data";

/**
 * CERTIFICATE DETAIL PAGE
 * Displays full metadata and embedded PDF preview.
 */
const CertificateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * DATA LOOKUP: Find matching cert by ID
   */
  useEffect(() => {
    const raw = Array.isArray(certificatesData) ? certificatesData : [certificatesData];
    const found = raw.find((x) => String(x.id) === String(id));
    
    setCert(found || null);
    setLoading(false);
  }, [id]);

  // --- HELPER: Format date ---
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto" />
        </div>
      </Layout>
    );
  }

  // --- NOT FOUND STATE ---
  if (!cert) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground mb-6">Certificate not found.</p>
          <Button variant="outline" onClick={() => navigate("/certifications")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Certifications
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          
          {/* --- HEADER --- */}
          <div className="mb-8 flex items-start gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="px-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{cert.title}</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {cert.issuer} {cert.platform && `• ${cert.platform}`}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Issued {formatDate(cert.issue_date)}
                </span>
                {cert.does_not_expire ? (
                  <span>• No expiration</span>
                ) : cert.expiry_date && (
                  <span>• Expires {formatDate(cert.expiry_date)}</span>
                )}
              </div>
            </div>
          </div>

          {/* --- MAIN GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* LEFT SIDE: Info Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                
                {/* Issuer Logo with Blue Border */}
                <div className="mb-8 flex justify-center">
                  <div className="relative p-1 rounded-full border-2 border-blue-500/30 bg-blue-50/50">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center border border-blue-100 overflow-hidden shadow-inner">
                      {cert.issuer_logo ? (
                        <img src={cert.issuer_logo} alt={cert.issuer} className="w-16 h-16 object-contain" />
                      ) : (
                        <Award className="w-12 h-12 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Verifiable Badge */}
                {cert.is_verifiable && (
                  <div className="mb-6 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-500/20">
                    <BadgeCheck className="w-5 h-5 animate-pulse" />
                    <span className="font-bold text-sm uppercase tracking-tight">Verifiable Credential</span>
                  </div>
                )}

                {/* Metadata Sections */}
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest text-center lg:text-left">Credential ID</p>
                    <p className="font-mono text-xs bg-secondary/40 p-3 rounded-lg break-all border border-border/50 text-center lg:text-left">
                      {cert.credential_id || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category</p>
                      <p className="text-sm font-semibold text-foreground">{cert.category || "General"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</p>
                      <p className="text-sm font-semibold text-foreground capitalize">{cert.type || "Certification"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-muted-foreground mb-3 uppercase tracking-widest">Key Skills Validated</p>
                    <div className="flex flex-wrap gap-2">
                      {(cert.skills || cert.tags || []).map((skill: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {cert.credential_url && (
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6">
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                        Verify Externally <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Details & PDF */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* About Section */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" /> Description
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {cert.description}
                </p>
              </div>

              {/* PDF Preview Section */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
                <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-muted/30">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" /> Certificate Document
                  </h2>
                  {cert.pdf_document_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={cert.pdf_document_link} target="_blank" rel="noopener noreferrer">
                        Open in New Tab
                      </a>
                    </Button>
                  )}
                </div>
                
                <div className="bg-secondary/20 min-h-[500px] md:min-h-[750px] relative">
                  {cert.pdf_document_link ? (
                    <iframe
                      src={`${cert.pdf_document_link}#toolbar=0`}
                      title="Certificate PDF"
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                      <p className="text-muted-foreground font-medium">Digital document preview unavailable.</p>
                      <p className="text-xs text-muted-foreground mt-2">Please use the verification link to view this credential.</p>
                    </div>
                  )}
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