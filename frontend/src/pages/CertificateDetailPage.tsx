import { Link, Navigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { Button, Eyebrow, PageHero, Skeleton, Tag } from "@/components/ui";
import { Mark } from "@/components/cards";
import { CertPaper } from "@/components/CertPaper";
import { areaColors } from "@/lib/certAreas";
import { useCertificate, useCertificates } from "@/hooks/useContent";
import { monthYear } from "@/lib/format";
import { BASE_URL } from "@/lib/seo-content";
import { certificatePath } from "@/lib/paths";

const CertificateDetailPage = () => {
  const { id } = useParams();
  const { data: cert, isLoading } = useCertificate(id);
  const { data: all = [] } = useCertificates();

  if (isLoading)
    return (
      <Layout>
        <div className="wrap py-24">
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      </Layout>
    );
  // A real "not found" (the server already answered 404), not a silent jump to the list.
  if (!cert) return <NotFound />;
  // Old ID links land on the readable URL.
  if (cert.slug && id !== cert.slug) return <Navigate to={certificatePath(cert)} replace />;

  // Nearly every certificate shares an issuer, so related means the same learning area.
  const related = all
    .filter(
      (c) => c.id !== cert.id && (cert.category ? c.category === cert.category : c.issuer === cert.issuer),
    )
    .slice(0, 3);
  const color = areaColors(all).get(cert.category) ?? "#ff5f00";
  const pdf = cert.pdf_document_link;
  const meta = [
    [
      "Issuer",
      cert.platform && cert.platform !== cert.issuer ? `${cert.issuer} · ${cert.platform}` : cert.issuer,
    ],
    ["Issued", monthYear(cert.issue_date)],
    ["Credential ID", cert.credential_id],
    ["Expires", cert.does_not_expire ? "Does not expire" : cert.expiry_date && monthYear(cert.expiry_date)],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <Layout>
      <SEO
        title={cert.title}
        description={cert.description || `${cert.title}, issued by ${cert.issuer}.`}
        url={`${BASE_URL}${certificatePath(cert)}`}
        // Thin pages kept out of search; the /certifications list is indexed.
        noIndex="follow"
      />
      <PageHero ambient className="mb-8" band="Saad Mazhar · Certificates">
        <div className="">
          <Link to="/certifications" className="text-sm text-fg-2 hover:text-fg">
            ← All certificates
          </Link>
          <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center">
            <Mark src={cert.issuer_logo} label={cert.issuer} className="size-20 rounded-[20px] text-sm" />
            <div className="flex flex-col gap-3">
              {cert.category && <span className="font-mono text-meta text-fg-3">{cert.category}</span>}
              <h1 className="text-display-m font-medium">{cert.title}</h1>
            </div>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-line-2 pt-8 md:grid-cols-4">
            {meta.map(([k, v]) => (
              <div key={k} className="flex min-w-0 flex-col gap-2.5">
                <dt className="label text-fg-3">{k}</dt>
                <dd className="break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PageHero>

      <section className="wrap grid grid-cols-1 gap-12 pb-24 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5 rounded-[24px] border border-line bg-surface p-5 md:p-8">
          {/* The CSP blocks embedded PDFs (object-src 'none'), so this is a drawn certificate; the PDF opens in a tab. */}
          <CertPaper cert={cert} color={color} />
          <div className="flex flex-wrap gap-3">
            {cert.credential_url && <Button href={cert.credential_url}>Verify credential</Button>}
            {pdf && (
              <Button href={pdf} variant="secondary" icon={false}>
                Open PDF
              </Button>
            )}
          </div>
        </div>
        <aside className="flex flex-col gap-10">
          {cert.skills?.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="label text-fg-3">Skills covered</span>
              <div className="flex flex-wrap gap-2">
                {cert.skills.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          )}
          {cert.description && (
            <div className="flex flex-col gap-4">
              <span className="label text-fg-3">About</span>
              <p className="text-fg-2">{cert.description}</p>
            </div>
          )}
        </aside>
      </section>

      {related.length > 0 && (
        <section className="section screen theme-light border-t-0">
          <div className="wrap">
            <Eyebrow>More in {cert.category || cert.issuer}</Eyebrow>
            <ul className="mt-10 grid gap-5 grid-cols-1 md:grid-cols-3">
              {related.map((c) => (
                <li key={c.id}>
                  <Link to={certificatePath(c)} className="block h-full">
                    <CertPaper cert={c} color={color} className="h-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default CertificateDetailPage;
