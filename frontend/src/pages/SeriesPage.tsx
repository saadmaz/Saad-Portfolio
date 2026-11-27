import { Link, useParams } from "react-router-dom";
import { Mail } from "lucide-react";
import { SubscribeForm } from "@/components/SubscribeForm";
import { SERIES } from "@/lib/newsletter";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, Media, PageHeader, Skeleton } from "@/components/ui";
import { useBlogPosts, useBlogSettings, useSeries } from "@/hooks/useBlog";
import { articlePath, readingMinutesOf, seriesKicker, seriesParts } from "@/lib/article-core";
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
  // Series that double as newsletter topics get a sign-up for just that series.
  const newsletter = SERIES.find((s) => s.id === series.id);

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
        label={[seriesKicker(series) || "Series", `${parts.length} parts`, `${minutes} min`].join(" · ")}
        title={series.title}
        intro={series.description}
      />
      {series.cover?.url && (
        <div className="wrap">
          <Media asset={series.cover} alt={series.cover.alt || ""} natural priority />
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
      {newsletter && (
        <section className="wrap pb-16 md:pb-20" aria-labelledby="series-subscribe">
          <div className="flex flex-col items-start gap-6 rounded-card border border-line-2 bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-9">
            <div className="flex max-w-[560px] flex-col gap-3">
              <span className="label flex items-center gap-2 text-fg-3">
                <Mail aria-hidden className="size-4" /> {newsletter.number} / {newsletter.label}
              </span>
              <h2 id="series-subscribe" className="text-h3 font-medium">
                Get new {series.title} posts by email.
              </h2>
              <p className="text-fg-2">{newsletter.blurb}</p>
            </div>
            <SubscribeForm
              compact
              topics={[newsletter.id]}
              source={`series-${series.slug}`}
              className="w-full md:max-w-[460px]"
            />
          </div>
        </section>
      )}
    </Layout>
  );
};

export default SeriesPage;
