import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, Media, PageHeader, Skeleton } from "@/components/ui";
import { useBlogPosts, useBlogSettings, useSeries } from "@/hooks/useBlog";
import { articlePath, readingMinutesOf, seriesParts } from "@/lib/article-core";
import { BASE_URL } from "@/lib/seo-content";
import NotFound from "./NotFound";

/** /blog/series/:slug - a content series with its parts in order. */
const SeriesPage = () => {
  const { slug = "" } = useParams();
  const { data: allSeries = [], isLoading } = useSeries();
  const { data: posts = [] } = useBlogPosts();
  const { settings } = useBlogSettings();
  const series = allSeries.find((s) => s.slug === slug);

  if (isLoading)
    return (
      <Layout>
        <div className="wrap py-24">
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  if (!series) return <NotFound />;

  const parts = seriesParts(series, new Map(posts.map((p) => [p.id, p])));
  const url = `${BASE_URL}/blog/series/${series.slug}`;
  const minutes = parts.reduce((sum, p) => sum + readingMinutesOf(p, settings.readingWpm), 0);

  return (
    <Layout>
      <SEO
        title={`${series.title} - series`}
        description={series.description || `A ${parts.length}-part series by Saad Mazhar.`}
        url={url}
        {...(series.cover?.url
          ? { image: series.cover.url, imageWidth: series.cover.width, imageHeight: series.cover.height }
          : {})}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CreativeWorkSeries",
          name: series.title,
          description: series.description,
          url,
          hasPart: parts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${BASE_URL}${articlePath(p)}`,
          })),
        }}
        breadcrumbs={[
          { name: "Blog", url: `${BASE_URL}/blog` },
          { name: series.title, url },
        ]}
      />
      <PageHeader
        label={`Series · ${parts.length} parts · ${minutes} min`}
        title={series.title}
        intro={series.description}
      />
      {series.cover?.url && (
        <div className="wrap">
          <Media asset={series.cover} alt={series.cover.alt || ""} className="aspect-[3/1]" priority />
        </div>
      )}
      <section className="wrap py-16 md:py-20">
        {parts.length === 0 ? (
          <Empty>The first part is coming soon.</Empty>
        ) : (
          <ol className="border-b border-line-2">
            {parts.map((p, i) => (
              <li key={p.id}>
                <Link
                  to={articlePath(p)}
                  className="group flex flex-col gap-2 border-t border-line-2 py-7 md:flex-row md:items-baseline md:gap-10"
                >
                  <span className="font-mono text-meta text-accent md:w-24">Part {i + 1}</span>
                  <span className="flex-1">
                    <span className="block text-h3 font-medium transition-colors group-hover:text-accent">
                      {p.title}
                    </span>
                    {p.excerpt && <span className="mt-2 block text-fg-2">{p.excerpt}</span>}
                  </span>
                  <span className="font-mono text-meta text-fg-3">
                    {readingMinutesOf(p, settings.readingWpm)} min
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Layout>
  );
};

export default SeriesPage;
