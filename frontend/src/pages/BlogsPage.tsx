import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Empty, FilterPill, PageHeader, Reveal, Skeleton, Tag } from "@/components/ui";
import { ArticleCard } from "@/components/article/ArticleParts";
import { useBlogPosts, useBlogSettings } from "@/hooks/useBlog";
import { articleTypeLabel, categoriesOf, featuredPosts, slugify, stripHtml } from "@/lib/article-core";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types";
import NotFound from "./NotFound";

/** Case-insensitive match on title, subtitle, excerpt, tags and category. */
function matches(post: BlogPost, q: string) {
  if (!q) return true;
  const hay = [post.title, post.subtitle, post.excerpt, post.category, ...(post.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word) || stripHtml(post.content).toLowerCase().includes(word));
}

const BlogsPage = () => {
  const { category: categorySlug } = useParams();
  const [params, setParams] = useSearchParams();
  const { data = [], isLoading } = useBlogPosts();
  const { settings } = useBlogSettings();
  const [visible, setVisible] = useState(settings.postsPerPage);

  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "";
  const tag = params.get("tag") ?? "";
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setVisible(settings.postsPerPage);
  };

  const categories = useMemo(() => {
    const fromPosts = categoriesOf(data);
    // Central labels/descriptions from blog settings win over the raw post value.
    return fromPosts.map((c) => settings.categories.find((s) => s.slug === c.slug) ?? c);
  }, [data, settings.categories]);
  const category = categories.find((c) => c.slug === categorySlug);
  const types = settings.articleTypes.filter((t) => data.some((p) => p.articleType === t.id));
  const tags = useMemo(() => {
    const count = new Map<string, number>();
    data.forEach((p) => p.tags?.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([t]) => t);
  }, [data]);

  const filtering = !!(categorySlug || q || type || tag);
  const filtered = data.filter(
    (p) =>
      (!categorySlug || slugify(p.category) === categorySlug) &&
      (!type || p.articleType === type) &&
      (!tag || p.tags?.includes(tag)) &&
      matches(p, q),
  );
  const featured = filtering ? [] : featuredPosts(data).slice(0, 3);
  // Without featured picks, the latest post leads the page as before.
  const lead = filtering ? [] : featured.length ? featured : data.slice(0, 1);
  const leadIds = new Set(lead.map((p) => p.id));
  const list = filtered.filter((p) => !leadIds.has(p.id));

  if (categorySlug && !isLoading && !category) return <NotFound />;

  const seo = category
    ? {
        title: `${category.label} articles`,
        description: category.description || `Articles about ${category.label} by Saad Mazhar.`,
        url: `${BASE_URL}/blog/category/${category.slug}`,
      }
    : { ...PAGE_SEO["/blog"], url: `${BASE_URL}/blog` };

  return (
    <Layout>
      <SEO
        title={seo.title}
        description={seo.description}
        url={seo.url}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: seo.title,
          description: seo.description,
          url: seo.url,
          isPartOf: { "@type": "WebSite", name: "Saad Mazhar", url: BASE_URL },
        }}
        breadcrumbs={[
          { name: "Blog", url: `${BASE_URL}/blog` },
          ...(category ? [{ name: category.label, url: seo.url }] : []),
        ]}
      />
      <PageHeader
        label={category ? "Blog · Category" : "Blog"}
        title={category ? category.label : "Notes from"}
        soft={category ? undefined : "the build"}
        intro={category?.description}
      />

      <section className="wrap pb-32">
        {isLoading ? (
          <Skeleton className="h-80 w-full rounded-media" />
        ) : data.length === 0 ? (
          <Empty>Posts will appear here soon.</Empty>
        ) : (
          <>
            {lead.length > 0 && (
              <Reveal>
                <div
                  className={cn(
                    "grid gap-10",
                    lead.length > 1 && "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]",
                  )}
                >
                  <div className="flex flex-col gap-4">
                    <Tag active className="w-fit">
                      {featured.length ? "Featured" : "Latest"}
                    </Tag>
                    <ArticleCard
                      post={lead[0]}
                      wpm={settings.readingWpm}
                      typeLabel={articleTypeLabel(lead[0].articleType, settings.articleTypes)}
                      priority
                      large
                    />
                  </div>
                  {lead.length > 1 && (
                    <div className="flex flex-col gap-10 lg:pt-11">
                      {lead.slice(1).map((p) => (
                        <ArticleCard
                          key={p.id}
                          post={p}
                          wpm={settings.readingWpm}
                          typeLabel={articleTypeLabel(p.articleType, settings.articleTypes)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            )}

            {/* Filters */}
            <div className={cn("flex flex-col gap-5", lead.length && "mt-24")}>
              <div className="relative max-w-md">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-3"
                />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setParam("q", e.target.value)}
                  placeholder="Search articles"
                  aria-label="Search articles"
                  className="h-11 w-full rounded-full border border-line-2 bg-surface pl-11 pr-4 text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
                />
              </div>
              {categories.length > 1 && (
                <nav aria-label="Categories" className="flex flex-wrap gap-2">
                  <Link
                    to={{ pathname: "/blog", search: params.toString() }}
                    aria-current={!categorySlug ? "page" : undefined}
                  >
                    <Tag active={!categorySlug}>All</Tag>
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      to={{ pathname: `/blog/category/${c.slug}`, search: params.toString() }}
                      aria-current={categorySlug === c.slug ? "page" : undefined}
                    >
                      <Tag active={categorySlug === c.slug}>{c.label}</Tag>
                    </Link>
                  ))}
                </nav>
              )}
              {types.length > 1 && (
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Article type">
                  <span className="label mr-1 text-fg-3">Type</span>
                  {types.map((t) => (
                    <FilterPill
                      key={t.id}
                      active={type === t.id}
                      onClick={() => setParam("type", type === t.id ? "" : t.id)}
                    >
                      {t.label}
                    </FilterPill>
                  ))}
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Tags">
                  <span className="label mr-1 text-fg-3">Tags</span>
                  {tags.map((t) => (
                    <FilterPill
                      key={t}
                      active={tag === t}
                      onClick={() => setParam("tag", tag === t ? "" : t)}
                    >
                      #{t}
                    </FilterPill>
                  ))}
                </div>
              )}
              {(q || type || tag) && (
                <button
                  type="button"
                  onClick={() => setParams(new URLSearchParams(), { replace: true })}
                  className="inline-flex w-fit items-center gap-1.5 text-sm text-fg-2 hover:text-fg"
                >
                  <X aria-hidden className="size-4" /> Clear filters
                </button>
              )}
            </div>

            <p className="mt-10 font-mono text-meta text-fg-3" aria-live="polite">
              {filtering
                ? `${filtered.length} ${filtered.length === 1 ? "article" : "articles"}`
                : "Latest articles"}
            </p>
            {list.length === 0 ? (
              <Empty>{filtering ? "No articles match these filters." : "More posts are on the way."}</Empty>
            ) : (
              <div className="mt-6 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {list.slice(0, visible).map((p) => (
                  <ArticleCard
                    key={p.id}
                    post={p}
                    wpm={settings.readingWpm}
                    typeLabel={articleTypeLabel(p.articleType, settings.articleTypes)}
                  />
                ))}
              </div>
            )}
            {list.length > visible && (
              <div className="mt-16 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setVisible((v) => v + settings.postsPerPage)}
                  icon={false}
                >
                  Load more ({list.length - visible} more)
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
};

export default BlogsPage;
