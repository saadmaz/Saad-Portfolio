import { useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, PageHeader, Skeleton, Stat } from "@/components/ui";
import { ExperienceJourney } from "@/components/ExperienceJourney";
import { useExperience } from "@/hooks/useContent";
import { normalizeExperience } from "@/lib/experience";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const ExperiencePage = () => {
  const { data = [], isLoading } = useExperience();
  const companies = useMemo(() => normalizeExperience(data), [data]);
  const roles = companies.reduce((n, c) => n + c.roles.length, 0);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/experience"].title}
        description={PAGE_SEO["/experience"].description}
        url={`${BASE_URL}/experience`}
      />
      <PageHeader
        label="Work experience"
        title="Where I’ve"
        soft="worked"
        aside={
          companies.length > 0 && (
            <div className="flex gap-14">
              <Stat value={companies.length} label="Companies" />
              <Stat value={roles} label="Roles" />
            </div>
          )
        }
      />

      <section className="wrap pb-32">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-card" />
        ) : companies.length === 0 ? (
          <Empty>Experience will appear here soon.</Empty>
        ) : (
          <ExperienceJourney companies={companies} />
        )}
      </section>
    </Layout>
  );
};

export default ExperiencePage;
