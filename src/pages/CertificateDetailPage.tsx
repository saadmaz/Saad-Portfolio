import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, ExternalLink, Calendar, Award, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { certificatesData } from "@/data";

/**
 * CERTIFICATE DETAIL PAGE
 * 
 * This page displays the full details of a selected certificate with:
 * - Full certificate metadata
 * - Embedded PDF preview (if available)
 * - All skills/tags from JSON
 * - External verification link
 * - Responsive layout for mobile and desktop
 */
const CertificateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * DATA LOADING & LOOKUP:
   * Load certificate data from JSON and find the matching certificate by ID
   */
  useEffect(() => {
    // Ensure data is an array
    const raw = Array.isArray(certificatesData) ? certificatesData : [certificatesData];
    
    // Find certificate matching the URL ID parameter
    const found = raw.find((x) => String(x.id) === String(id));
    
    setCert(found || null);
    setLoading(false);
  }, [id]);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
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
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  /**
   * HELPER: Format date to readable format
   */
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          
          {/* --- HEADER WITH BACK BUTTON --- */}
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
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Issued {formatDate(cert.issue_date)}
                {cert.expiry_date && !cert.does_not_expire && ` • Expires ${formatDate(cert.expiry_date)}`}
                {cert.does_not_expire && " • No expiration"}
              </p>
            </div>
          </div>

          {/* --- MAIN CONTENT GRID: 2 columns on desktop, 1 on mobile --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* LEFT SIDE: Certificate Info Card (1 column) */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-20">
                
                {/* Issuer Logo */}
                {cert.issuer_logo && (
                  <div className="mb-6 flex justify-center">
                    <img 
                      src={cert.issuer_logo} 
                      alt={cert.issuer} 
                      className="w-24 h-24 object-contain" 
                    />
                  </div>
                )}

                {/* Verifiable Badge */}
                {cert.is_verifiable && (
                  <div className="mb-6 flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-full">
                    <BadgeCheck className="w-5 h-5" />
                    <span className="font-bold text-sm">Verifiable Credential</span>
                  </div>
                )}

                {/* Credential ID */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-muted-foreground mb-2 uppercase">Credential ID</p>
                  <p className="font-mono text-sm bg-secondary/50 p-3 rounded-lg break-all">
                    {cert.credential_id}
                  </p>
                </div>

                {/* Category & Type */}
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {cert.category && (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">Category</p>
                      <p className="bg-secondary/50 px-3 py-2 rounded text-sm font-medium">{cert.category}</p>
                    </div>
                  )}
                  {cert.type && (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">Type</p>
                      <p className="bg-secondary/50 px-3 py-2 rounded text-sm font-medium capitalize">{cert.type}</p>
                    </div>
                  )}
                </div>

                {/* Skills / Tags */}
                {(cert.skills?.length > 0 || cert.tags?.length > 0) && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(cert.skills || []).map((skill: string, idx: number) => (
                        <span key={idx} className="text-xs bg-accent/20 text-accent px-3 py-1.5 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                      {!cert.skills?.length && cert.tags && cert.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs bg-accent/20 text-accent px-3 py-1.5 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verify Button */}
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold py-2.5 px-4 rounded-lg transition-all duration-200"
                  >
                    Verify on {cert.issuer}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Description + PDF Preview (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description Section */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold mb-4 text-foreground">About This Certification</h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {cert.description}
                </p>
              </div>

              {/* PDF Preview Section */}
              {cert.pdf_document_link && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
                  <div className="border-b border-border px-6 py-4">
                    <h2 className="text-lg font-bold text-foreground">Certificate Document</h2>
                  </div>
                  <div className="flex-1 bg-secondary/30 min-h-[500px] md:min-h-[700px]">
                    <iframe
                      src={cert.pdf_document_link}
                      title={`${cert.title} - Certificate PDF`}
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}

              {/* Fallback if no PDF */}
              {!cert.pdf_document_link && (
                <div className="bg-secondary/30 rounded-2xl border border-dashed border-border p-8 text-center">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No PDF document available for this certificate.</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can verify this credential using the button on the left.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CertificateDetailPage;
