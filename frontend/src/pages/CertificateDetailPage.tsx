import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import {
  ArrowLeft,
  ExternalLink,
  Award,
  BadgeCheck,
  FileText,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/types";
import { CommonService } from "@/shared/services/common-service";

const CertificateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const data = await CommonService.getCertificates();
        const found = data.find((x) => String(x.id) === String(id));
        setCert(found || null);
      } catch (error) {
        console.error("Failed to load certificate", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canonicalUrl = `https://saadmaz.com/certifications/${id}`;

  if (loading) {
    return (
      <Layout>
        <SEO
          title="Loading Certification"
          url={canonicalUrl}
          noIndex={true}
        />
        <div className="section-container py-32 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground animate-pulse">Loading credential details...</p>
        </div>
      </Layout>
    );
  }

  if (!cert) {
    return (
      <Layout>
        <SEO
          title="Certification Not Found"
          url={canonicalUrl}
          noIndex={true}
        />
        <div className="section-container py-32 text-center">
          <Award className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h2 className="text-2xl font-bold mb-2">Credential Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The certificate you are looking for does not exist or has been moved.
          </p>
          <Button variant="outline" onClick={() => navigate("/certifications")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Certifications
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={cert.title}
        description={cert.description || `${cert.title} — issued by ${cert.issuer} on ${cert.platform}. Verified professional credential.`}
        url={canonicalUrl}
        image={cert.issuer_logo || undefined}
        type="article"
        breadcrumbs={[
          { name: "Certifications", url: "https://saadmaz.com/certifications" },
          { name: cert.title, url: canonicalUrl },
        ]}
      />
      <section className="section-padding min-h-screen overflow-x-hidden">
        <div className="section-container">

          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="w-fit text-muted-foreground hover:text-foreground -ml-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                  Official Certification
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                {cert.title}
              </h1>
            </div>
          </div>

          {/* Two-panel layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT - credential card */}
            <div className="lg:col-span-4">
              <div className="bg-card rounded-2xl border border-border shadow-sm sticky top-24 overflow-hidden">

                {/* Logo + issuer */}
                <div className="flex flex-col items-center py-8 px-6 border-b border-border">
                  <div className="w-20 h-20 rounded-full bg-background border-2 border-border shadow-sm flex items-center justify-center mb-4 overflow-hidden">
                    {cert.issuer_logo ? (
                      <img
                        src={cert.issuer_logo}
                        alt={cert.issuer}
                        className="w-14 h-14 object-contain"
                      />
                    ) : (
                      <Award className="w-10 h-10 text-accent" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-center">{cert.issuer}</h3>
                  <p className="text-xs text-muted-foreground">{cert.platform}</p>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">

                  {/* Verified badge */}
                  {cert.is_verifiable && (
                    <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-500/20">
                      <BadgeCheck className="w-5 h-5 shrink-0 animate-pulse" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight leading-none mb-0.5">
                          Verified
                        </p>
                        <p className="text-[10px] opacity-75">Authenticity Guaranteed</p>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Issued On
                      </span>
                      <span className="text-sm font-bold">{formatDate(cert.issue_date)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Expires
                      </span>
                      <span className="text-sm font-bold">
                        {cert.does_not_expire ? "Never" : formatDate(cert.expiry_date)}
                      </span>
                    </div>
                  </div>

                  {/* Credential ID */}
                  {cert.credential_id && (
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                        Credential ID
                      </span>
                      <code
                        className="block w-full py-2.5 px-3 bg-secondary/50 rounded-lg text-[11px] font-mono border border-border/50"
                        style={{ wordBreak: "break-all", overflowWrap: "anywhere", whiteSpace: "normal" }}
                      >
                        {cert.credential_id}
                      </code>
                    </div>
                  )}

                  {/* Skills */}
                  {cert.skills?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
                        Skills &amp; Competencies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cert.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1 text-[10px] bg-accent/10 text-accent border border-accent/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-tight"
                          >
                            <Tag className="w-2.5 h-2.5" /> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verify button */}
                  {cert.credential_url && (
                    <Button
                      asChild
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-xl shadow-lg shadow-accent/20 active:scale-95 transition-all"
                    >
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                        Verify on Provider Site <ExternalLink className="w-3.5 h-3.5 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT - credential document */}
            <div className="lg:col-span-8">
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full">

                {/* Document header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold">Credential Document</span>
                  </div>
                  {cert.pdf_document_link && (
                    <Button variant="secondary" size="sm" asChild className="text-xs font-semibold">
                      <a href={cert.pdf_document_link} target="_blank" rel="noopener noreferrer">
                        Full View
                      </a>
                    </Button>
                  )}
                </div>

                {/* PDF viewer */}
                <div className="relative w-full" style={{ paddingTop: "72%" }}>
                  {cert.pdf_document_link ? (
                    <iframe
                      src={`${cert.pdf_document_link}#view=FitH&toolbar=0`}
                      title="Certification PDF Preview"
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                      <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-10" />
                      <p className="text-muted-foreground font-semibold">Preview Unavailable</p>
                    </div>
                  )}
                </div>

                <div className="px-6 py-3 bg-muted/10 border-t border-border text-[10px] text-muted-foreground text-center italic">
                  Note: Browser PDF support is required for internal preview.
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
