import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, PageHeader, Skeleton } from "@/components/ui";
import { Row } from "@/components/cards";
import { usePublications } from "@/hooks/useContent";
import { year } from "@/lib/format";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const PublicationsPage = () => {
  const { data = [], isLoading } = usePublications();
  const pubs = [...data].reverse();

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/publications"].title}
        description={PAGE_SEO["/publications"].description}
        url={`${BASE_URL}/publications`}
      />
      <PageHeader label="Publications" title="Published" soft="work" />
      <section className="wrap pb-32">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : pubs.length === 0 ? (
          <Empty>Publications will appear here soon.</Empty>
        ) : (
          <div className="border-b border-line-2">
            {pubs.map((p) => (
              <Row
                key={p.id}
                href={p.link}
                lead={year(p.date)}
                title={p.title}
                sub={p.description}
                trail={p.publisher}
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default PublicationsPage;
