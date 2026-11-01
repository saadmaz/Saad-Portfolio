import { Link, Navigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Eyebrow, Media, Skeleton, Tag } from "@/components/ui";
import { Row } from "@/components/cards";
import { CmsContent } from "@/components/CmsContent";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlog";
import { fullDate, monthYear, readingTime } from "@/lib/format";
import { BASE_URL } from "@/lib/seo-content";

const BlogDetailPage = () => {
  const { slug = "" } = useParams();
  const { data: post, isLoading } = useBlogPost(slug);
  const { data: all = [] } = useBlogPosts();

  if (isLoading)
    return (
      <Layout>
        <div className="mx-auto flex max-w-prose flex-col gap-6 px-5 py-24">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="aspect-[2/1] w-full rounded-media" />
        </div>
      </Layout>
    );
  if (!post) return <Navigate to="/blog" replace />;

  const url = `${BASE_URL}/blog/${post.slug || post.id}`;
  const related = all.filter((p) => p.id !== post.id).slice(0, 2);
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.image,
    datePublished: post.publishedAt || post.date,
    dateModified: post.lastUpdatedAt || post.date,
    author: { "@type": "Person", name: post.author || "Saad Mazhar", url: BASE_URL },
    mainEntityOfPage: url,
  };

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.metaDescription || post.excerpt}
        url={url}
        image={post.image}
        type="article"
        structuredData={schema}
        breadcrumbs={[
          { name: "Blog", url: `${BASE_URL}/blog` },
          { name: post.title, url },
        ]}
      />
      <header className="mx-auto flex max-w-[760px] flex-col items-center gap-7 px-5 pb-14 pt-12 text-center md:pt-20">
        <Link to="/blog" className="text-sm text-fg-2 hover:text-fg">
          ← All writing
        </Link>
        <span className="font-mono text-meta text-fg-3">
          {[post.category, fullDate(post.date), `${readingTime(post.content)} read`]
            .filter(Boolean)
            .join(" · ")}
        </span>
        <h1 className="text-display-m font-medium">{post.title}</h1>
        {post.excerpt && <p className="text-body-l text-fg-2">{post.excerpt}</p>}
      </header>

      {post.image && (
        <div className="wrap">
          <Media src={post.image} alt={post.title} className="aspect-[2/1]" priority />
        </div>
      )}

      <article className="mx-auto max-w-prose px-5 py-20 md:py-24">
        <CmsContent className="prose-cms" html={post.content ?? ""} />
        {(post.tags?.length || post.ctaUrl) && (
          <div className="mt-16 flex flex-col gap-6 border-t border-line-2 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            {post.ctaUrl && <Button href={post.ctaUrl}>{post.ctaText || "Learn more"}</Button>}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="section">
          <div className="wrap">
            <Eyebrow>Keep reading</Eyebrow>
            <div className="mt-8 border-b border-line-2">
              {related.map((p) => (
                <Row
                  key={p.id}
                  to={`/blog/${p.slug || p.id}`}
                  lead={monthYear(p.date)}
                  title={p.title}
                  trail={[p.category, readingTime(p.content)].filter(Boolean).join(" · ")}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BlogDetailPage;
