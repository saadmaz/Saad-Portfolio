import { Link, Navigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { Button, Eyebrow, Skeleton, Tag } from "@/components/ui";
import { Mark, Row } from "@/components/cards";
import { useCertificate, useCertificates } from "@/hooks/useContent";
import { monthYear, year } from "@/lib/format";
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

  const related = all.filter((c) => c.id !== cert.id && c.issuer === cert.issuer).slice(0, 4);
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
      <header className="wrap pb-14 pt-12 md:pt-20">
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
      </header>

      <section className="wrap grid gap-12 pb-24 md:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5 rounded-[24px] border border-line bg-surface p-5 md:p-8">
          {/* The CSP blocks embedded PDFs (object-src 'none'), so this is a typeset card; the PDF opens in a tab. */}
          <div className="flex aspect-[1.414] w-full flex-col items-center justify-center gap-3 rounded-lg bg-[#F5F2ED] px-6 text-center text-fg-inverse shadow-[0_24px_48px_-12px_rgb(0_0_0/0.5)]">
            <span className="label opacity-60">Certificate of completion</span>
            <span className="text-h1 font-medium">Saad Mazhar</span>
            <span className="max-w-md text-h4 font-medium">{cert.title}</span>
            <span className="mt-4 font-mono text-meta opacity-60">
              {[monthYear(cert.issue_date), cert.issuer].filter(Boolean).join(" · ")}
            </span>
          </div>
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
        <section className="section">
          <div className="wrap">
            <Eyebrow>More from {cert.issuer}</Eyebrow>
            <div className="mt-10 grid border-b border-line-2 md:grid-cols-2 md:gap-x-6">
              {related.map((c) => (
                <Row
                  key={c.id}
                  to={certificatePath(c)}
                  mark={<Mark src={c.issuer_logo} label={c.issuer} />}
                  title={<span className="block text-[1rem] md:text-h4">{c.title}</span>}
                  sub={c.issuer}
                  trail={year(c.issue_date)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default CertificateDetailPage;
