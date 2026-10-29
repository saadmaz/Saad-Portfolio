import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, PageHeader, Skeleton } from "@/components/ui";
import { Row } from "@/components/cards";
import { useNewsletters } from "@/hooks/useContent";
import { monthYear } from "@/lib/format";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const NewslettersPage = () => {
  const { data = [], isLoading } = useNewsletters();
  const issues = [...data].reverse();

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/newsletters"].title}
        description={PAGE_SEO["/newsletters"].description}
        url={`${BASE_URL}/newsletters`}
      />
      <PageHeader
        label="Newsletters"
        title="Notes from"
        soft="the build"
        intro="Issues on shipping products, applied AI and the Sri Lankan startup scene."
      />
      <section className="wrap pb-32">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : issues.length === 0 ? (
          <Empty>Issues will appear here soon.</Empty>
        ) : (
          <div className="border-b border-line-2">
            {issues.map((n) => (
              <Row
                key={n.id}
                href={n.content_url}
                lead={monthYear(n.date)}
                title={n.title}
                sub={n.description}
                trail={n.type === "founder" ? "Founder" : n.type === "cse" ? "Engineering" : n.type}
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default NewslettersPage;
