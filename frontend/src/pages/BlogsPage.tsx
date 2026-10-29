import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, FilterPill, Media, PageHeader, Reveal, Skeleton, Tag } from "@/components/ui";
import { Row } from "@/components/cards";
import { useBlogPosts } from "@/hooks/useBlog";
import { monthYear, readingTime } from "@/lib/format";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const BlogsPage = () => {
  const { data = [], isLoading } = useBlogPosts();
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(data.map((p) => p.category).filter(Boolean))], [data]);
  const posts = category === "All" ? data : data.filter((p) => p.category === category);
  const [featured, ...rest] = posts;

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/blog"].title}
        description={PAGE_SEO["/blog"].description}
        url={`${BASE_URL}/blog`}
      />
      <PageHeader label="Blog" title="Notes from" soft="the build" />

      <section className="wrap pb-32">
        {isLoading ? (
          <Skeleton className="h-80 w-full rounded-media" />
        ) : !featured ? (
          <Empty>Posts will appear here soon.</Empty>
        ) : (
          <>
            <Reveal>
              <Link
                to={`/blog/${featured.slug || featured.id}`}
                className="group grid items-center gap-8 md:grid-cols-[640px_1fr] md:gap-16"
              >
                <Media src={featured.image} alt={featured.title} className="aspect-[16/10]" priority />
                <div className="flex flex-col gap-5">
                  <Tag active className="w-fit">
                    Latest
                  </Tag>
                  <h2 className="text-h1 font-medium transition-colors group-hover:text-accent">
                    {featured.title}
                  </h2>
                  {featured.excerpt && <p className="text-body-l text-fg-2">{featured.excerpt}</p>}
                  <span className="font-mono text-meta text-fg-3">
                    {[monthYear(featured.date), featured.category, `${readingTime(featured.content)} read`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              </Link>
            </Reveal>

            {categories.length > 2 && (
              <div className="mt-24 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <FilterPill key={c} active={category === c} onClick={() => setCategory(c)}>
                    {c}
                  </FilterPill>
                ))}
              </div>
            )}
            {rest.length > 0 && (
              <div className="mt-10 border-b border-line-2">
                {rest.map((p) => (
                  <Row
                    key={p.id}
                    to={`/blog/${p.slug || p.id}`}
                    lead={monthYear(p.date)}
                    title={p.title}
                    trail={[p.category, readingTime(p.content)].filter(Boolean).join(" · ")}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
};

export default BlogsPage;
