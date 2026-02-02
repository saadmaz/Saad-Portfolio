import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { certificatesData } from "@/data";

const CertificateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState<any | null>(null);

  useEffect(() => {
    const raw = Array.isArray(certificatesData) ? certificatesData : [certificatesData];
    const normalized = raw.map((c: any) => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      issuerLogo: c.issuer_logo || c.issuerLogo || null,
      issueDate: c.issue_date || c.issueDate || c.issue || null,
      expiryDate: c.expiry_date || c.expiryDate || null,
      credentialId: c.credential_id || c.credentialId || "",
      credentialUrl: c.credential_url || c.credentialUrl || "",
      description: c.description || "",
      pdf: c.pdf_document_link || c.certificatePdfUrl || c.certificate_pdf || null,
      tags: c.tags || [],
      category: c.category || "",
    }));

    const found = normalized.find((x) => String(x.id) === String(id));
    setCert(found || null);
  }, [id]);

  if (!cert) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <p className="text-muted-foreground">Certificate not found.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          <div className="mb-6 flex items-start gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{cert.title}</h1>
              <p className="text-sm text-muted-foreground">
                {cert.issuer} • {cert.issueDate}
                {cert.expiryDate && ` — ${cert.expiryDate}`}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-card rounded-xl p-4">
              <div className="flex flex-col gap-3">
                {cert.issuerLogo && (
                  <img src={cert.issuerLogo} alt={cert.issuer} className="w-32 h-auto object-contain" />
                )}
                <p className="text-sm text-muted-foreground">{cert.description}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Credential ID</p>
                    <p className="font-mono bg-secondary p-2 rounded text-sm">{cert.credentialId}</p>
                  </div>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-sm inline-flex items-center gap-2 text-accent">
                      <ExternalLink className="w-4 h-4" /> Verify Credential
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-card rounded-xl overflow-hidden h-[600px] md:h-[800px]">
                {cert.pdf ? (
                  <iframe src={cert.pdf} title={cert.title} className="w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No PDF available for this certificate.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CertificateDetailPage;
