import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Empty, Meter, PageHeader, Reveal, Skeleton, Tag } from "@/components/ui";
import { useLanguages } from "@/hooks/useContent";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const LanguagesPage = () => {
  const { data = [], isLoading } = useLanguages();
  const languages = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/languages"].title}
        description={PAGE_SEO["/languages"].description}
        url={`${BASE_URL}/languages`}
      />
      <PageHeader
        label="Languages"
        title="Languages"
        soft="I speak"
        intro="I host and speak in each of these, which helps when a room mixes founders, students and first-time attendees."
      />
      <section className="wrap pb-24">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : languages.length === 0 ? (
          <Empty>Languages will appear here soon.</Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {languages.map((l, i) => (
              <Reveal key={l.id}>
                <article className="flex h-full flex-col gap-8 rounded-[24px] border border-line bg-surface p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-h2 font-medium">{l.name}</h2>
                    <Tag active={i === 0}>{l.level}</Tag>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-line-2 pt-6">
                    <span className="text-sm text-fg-2">Proficiency</span>
                    <Meter value={Math.max(1, Math.round(l.percentage / 20))} max={5} />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>
      <section className="section">
        <div className="wrap flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <h2 className="text-display-m font-medium">
            Need a host for <span className="soft">your event?</span>
          </h2>
          <Button to="/contact" size="lg">
            Send an invite
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default LanguagesPage;
