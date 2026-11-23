import { Navigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui";
import { ArticleView } from "@/components/article/ArticleView";
import { useAuthorOf, useBlogPost, useBlogPosts, useRedirectFor, useSeries } from "@/hooks/useBlog";
import {
  articleSchema,
  canonicalOf,
  countWords,
  publishedAtOf,
  seoDescriptionOf,
  seoTitleOf,
  slugify,
  socialImageOf,
  stripHtml,
  updatedAtOf,
} from "@/lib/article-core";
import { BASE_URL, PERSON_ID, SITE_NAME } from "@/lib/seo-content";
import type { BlogPost } from "@/types";
import NotFound from "./NotFound";

/** Head tags for a live article: canonical, OG/Twitter card, BlogPosting + breadcrumbs. */
export function ArticleSeo({ post }: { post: BlogPost }) {
  const author = useAuthorOf(post);
  const { data: allSeries = [] } = useSeries();
  const url = `${BASE_URL}/blog/${post.slug || post.id}`;
  const image = socialImageOf(post);
  const hidden = post.unlisted || post.noIndex;
  const series = allSeries.find((s) => s.id === post.seriesId);
  const schema = articleSchema(post, {
    baseUrl: BASE_URL,
    author,
    publisher: { name: SITE_NAME, logo: "/icons/logo-v3-512.png", id: PERSON_ID },
    series,
    wordCount: countWords(stripHtml(post.content)),
  });

  return (
    <SEO
      title={seoTitleOf(post)}
      description={seoDescriptionOf(post)}
      url={url}
      canonical={canonicalOf(post, BASE_URL)}
      type="article"
      noIndex={hidden}
      // Uploaded images carry their real size; the generated card is used otherwise.
      {...(image?.url
        ? {
            image: image.url,
            imageWidth: image.width ?? 1200,
            imageHeight: image.height ?? 630,
            imageAlt: image.alt,
          }
        : {})}
      article={{
        publishedTime: publishedAtOf(post),
        modifiedTime: updatedAtOf(post),
        author: author?.name || post.author,
        section: post.category,
        tags: post.tags,
      }}
      structuredData={hidden ? undefined : schema}
      breadcrumbs={[
        { name: "Blog", url: `${BASE_URL}/blog` },
        ...(post.category
          ? [{ name: post.category, url: `${BASE_URL}/blog/category/${slugify(post.category)}` }]
          : []),
        { name: post.title, url },
      ]}
    />
  );
}

const BlogDetailPage = () => {
  const { slug = "" } = useParams();
  const { data: post, isLoading } = useBlogPost(slug);
  const { data: all = [] } = useBlogPosts();
  // Only consulted when the article doesn't exist (e.g. its slug changed since the last build).
  const redirect = useRedirectFor(`/blog/${slug}`, !isLoading && !post);

  if (isLoading || (!post && redirect.isLoading))
    return (
      <Layout>
        <div className="mx-auto flex max-w-prose flex-col gap-6 px-5 py-24">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="aspect-[2/1] w-full rounded-media" />
        </div>
      </Layout>
    );
  if (!post) {
    const to = redirect.data?.to;
    if (to && to !== `/blog/${slug}`) return <Navigate to={to} replace />;
    return <NotFound />;
  }

  return (
    <Layout>
      <ArticleSeo post={post} />
      <ArticleView post={post} livePosts={all} />
    </Layout>
  );
};

export default BlogDetailPage;
