import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronDown, Mail, Search, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { SEO } from "@/components/SEO";
import {
  Button,
  CountUp,
  Empty,
  Eyebrow,
  FilterPill,
  PageHero,
  Reveal,
  RisingWords,
  SectionHeader,
  Skeleton,
  Tag,
} from "@/components/ui";
import { BlogCard, FeaturedPostCard } from "@/components/article/BlogCard";
import { useBlogPosts, useBlogSettings, useSeries } from "@/hooks/useBlog";
import {
  articleTypeLabel,
  blogSchema,
  CATEGORY_MIN_POSTS,
  categoriesOf,
  featuredPosts,
  readingMinutesOf,
  seriesParts,
  slugify,
  stripHtml,
  updatedAtOf,
} from "@/lib/article-core";
import { monthYear } from "@/lib/format";
import { PAGE_SEO, BASE_URL, PERSON_ID, categoryDescriptionOf } from "@/lib/seo-content";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types";
import NotFound from "./NotFound";

const INTRO =
  "Field notes from building companies and software: AI engineering, startups, and the Sri Lanka tech scene. Practical, from things I've actually shipped.";

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

/** Newest "last touched" date across posts, for the hero. */
function lastUpdated(posts: BlogPost[]) {
  const times = posts.map((p) => Date.parse(updatedAtOf(p) ?? "") || 0);
  const max = Math.max(0, ...times);
  return max ? new Date(max).toISOString() : "";
}

const BlogsPage = () => {
  const { category: categorySlug } = useParams();
  const [params, setParams] = useSearchParams();
  const { data = [], isLoading } = useBlogPosts();
  const { data: allSeries = [] } = useSeries();
  const { settings } = useBlogSettings();
  const [visible, setVisible] = useState(settings.postsPerPage);
  const [topicsOpen, setTopicsOpen] = useState(false);

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
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [data]);
  const series = useMemo(() => {
    const byId = new Map(data.map((p) => [p.id, p]));
    return allSeries
      .map((s) => ({ series: s, parts: seriesParts(s, byId) }))
      .filter((s) => s.parts.length > 0);
  }, [allSeries, data]);

  const typeOf = (p: BlogPost) => articleTypeLabel(p.articleType, settings.articleTypes);
  const filtering = !!(categorySlug || q || type || tag);
  const filtered = data.filter(
    (p) =>
      (!categorySlug || slugify(p.category) === categorySlug) &&
      (!type || p.articleType === type) &&
      (!tag || p.tags?.includes(tag)) &&
      matches(p, q),
  );
  const featured = filtering ? [] : featuredPosts(data);
  // The top featured pick (or, without one, the latest post) leads; everything else is in the library.
  const lead = filtering ? null : (featured[0] ?? data[0] ?? null);
  const list = filtered.filter((p) => p.id !== lead?.id);

  if (categorySlug && !isLoading && !category) return <NotFound />;

  const seo = category
    ? {
        title: `${category.label} articles`,
        description: categoryDescriptionOf(category.label, category.description),
        url: `${BASE_URL}/blog/category/${category.slug}`,
      }
    : { ...PAGE_SEO["/blog"], url: `${BASE_URL}/blog` };
  const categoryPosts = category ? data.filter((p) => slugify(p.category) === category.slug) : data;
  // Same rule as the prerendered copy and the blog sitemap.
  const thinCategory = !!category && categoryPosts.length < CATEGORY_MIN_POSTS;

  const updated = lastUpdated(data);
  const stats = [
    { label: "Articles", value: categoryPosts.length },
    { label: "Topics", value: categories.length },
    {
      label: "Minutes of reading",
      value: categoryPosts.reduce((n, p) => n + readingMinutesOf(p, settings.readingWpm), 0),
    },
  ].filter((s) => s.value > 0);

  return (
    <Layout>
      <SEO
        title={seo.title}
        description={seo.description}
        url={seo.url}
        noIndex={thinCategory ? "follow" : false}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: seo.title,
            description: seo.description,
            url: seo.url,
            isPartOf: { "@type": "WebSite", name: "Saad Mazhar", url: BASE_URL },
          },
          ...(categoryPosts.length
            ? [
                blogSchema(categoryPosts, {
                  baseUrl: BASE_URL,
                  name: category ? `${category.label} · Saad Mazhar's blog` : "Saad Mazhar's blog",
                  description: seo.description,
                  url: seo.url,
                  publisher: { name: "Saad Mazhar", id: PERSON_ID },
                }),
              ]
            : []),
        ]}
        breadcrumbs={[
          { name: "Blog", url: `${BASE_URL}/blog` },
          ...(category ? [{ name: category.label, url: seo.url }] : []),
        ]}
      />

      <PageHero
        ambient
        className="mb-0"
        band={
          <span className="truncate">
            Saad Mazhar · Blog{updated ? ` · Updated ${monthYear(updated)}` : ""}
          </span>
        }
      >
        <div>
          <div className="max-w-[760px]">
            <div className="animate-rise">
              <Eyebrow>{category ? "Blog · Topic" : "Blog"}</Eyebrow>
            </div>
            <h1 className="mt-8 text-display-xl font-medium md:mt-10">
              {category ? (
                <RisingWords text={category.label} />
              ) : (
                <>
                  <RisingWords text="Notes from" /> <RisingWords text="the build" from={2} className="soft" />
                </>
              )}
            </h1>
            <p className="mt-8 max-w-[580px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
              {category?.description || INTRO}
            </p>
            <div className="mt-8 flex animate-rise flex-wrap items-center gap-3 [animation-delay:400ms]">
              <Button to="/newsletters" icon={false}>
                <Mail aria-hidden className="size-4" /> Subscribe
              </Button>
              <SocialLinks size="sm" />
            </div>
            {stats.length > 0 && (
              <dl className="mt-12 grid max-w-[560px] animate-rise grid-cols-3 gap-6 [animation-delay:450ms]">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse gap-2 border-l border-line-2 pl-4">
                    <dt className="label text-fg-3">{s.label}</dt>
                    <dd className="text-display-m font-medium leading-none">
                      <CountUp value={s.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </PageHero>

      {isLoading ? (
        <div className="wrap py-16">
          <Skeleton className="h-80 w-full rounded-media" />
        </div>
      ) : data.length === 0 ? (
        <section className="section border-t-0">
          <div className="wrap">
            <Empty>Posts will appear here soon.</Empty>
          </div>
        </section>
      ) : (
        <>
          {lead && (
            <section className="section border-t-0" aria-labelledby="start-here">
              <div className="wrap">
                <Reveal>
                  <SectionHeader
                    id="start-here"
                    label={featured.length ? "Featured" : "Latest"}
                    title="Start"
                    soft="here"
                  />
                </Reveal>
                <Reveal>
                  <FeaturedPostCard
                    post={lead}
                    wpm={settings.readingWpm}
                    typeLabel={typeOf(lead)}
                    label={featured.length ? "Featured" : "Latest"}
                  />
                </Reveal>
              </div>
            </section>
          )}

          {series.length > 0 && !filtering && (
            <section className="section" aria-labelledby="series">
              <div className="wrap">
                <Reveal>
                  <SectionHeader id="series" label="Series" title="Read it" soft="in order" />
                </Reveal>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {series.map(({ series: s, parts }) => (
                    <Reveal key={s.id}>
                      <Link
                        to={`/blog/series/${s.slug}`}
                        className="group flex h-full flex-col gap-4 rounded-card border border-line-2 bg-surface p-6 transition-colors hover:border-accent"
                      >
                        <span className="label text-fg-3">
                          {parts.length} {parts.length === 1 ? "part" : "parts"}
                        </span>
                        <span className="text-h4 font-medium transition-colors group-hover:text-accent">
                          {s.title}
                        </span>
                        {s.description && <p className="line-clamp-3 text-fg-2">{s.description}</p>}
                        <ol className="mt-auto flex flex-col gap-1.5 border-t border-line pt-4 text-sm text-fg-2">
                          {parts.slice(0, 3).map((p, i) => (
                            <li key={p.id} className="flex gap-3">
                              <span className="font-mono text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                              <span className="line-clamp-1">{p.title}</span>
                            </li>
                          ))}
                        </ol>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className={cn("section", !lead && "border-t-0")} aria-labelledby="all-writing">
            <div className="wrap">
              <Reveal>
                <SectionHeader id="all-writing" label="Library" title="All" soft="writing" />
              </Reveal>

              {/* One filter bar: search, topics as tabs, type as a select. */}
              <div className="flex flex-col gap-4 rounded-[28px] border border-line bg-surface/50 p-4 backdrop-blur md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative w-full md:flex-1">
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
                      className="h-12 w-full rounded-full border border-line-2 bg-base pl-11 pr-4 text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
                    />
                  </div>
                  {types.length > 1 && (
                    <label className="relative w-full md:w-52">
                      <span className="sr-only">Article type</span>
                      <select
                        value={type}
                        onChange={(e) => setParam("type", e.target.value)}
                        className="h-12 w-full appearance-none rounded-full border border-line-2 bg-base pl-4 pr-10 text-fg focus:border-accent focus:outline-none"
                      >
                        <option value="">All types</option>
                        {types.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden
                        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-fg-3"
                      />
                    </label>
                  )}
                </div>

                {categories.length > 1 && (
                  <nav
                    aria-label="Topics"
                    className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden"
                  >
                    <Link
                      to={{ pathname: "/blog", search: params.toString() }}
                      aria-current={!categorySlug ? "page" : undefined}
                      className="shrink-0"
                    >
                      <Tag active={!categorySlug}>All</Tag>
                    </Link>
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        to={{ pathname: `/blog/category/${c.slug}`, search: params.toString() }}
                        aria-current={categorySlug === c.slug ? "page" : undefined}
                        className="shrink-0"
                      >
                        <Tag active={categorySlug === c.slug}>{c.label}</Tag>
                      </Link>
                    ))}
                  </nav>
                )}

                {tags.length > 0 && (
                  <div>
                    <button
                      type="button"
                      aria-expanded={topicsOpen || !!tag}
                      onClick={() => setTopicsOpen((o) => !o)}
                      className="inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-fg"
                    >
                      Browse by tag ({tags.length})
                      <ChevronDown
                        aria-hidden
                        className={cn("size-4 transition-transform", (topicsOpen || tag) && "rotate-180")}
                      />
                    </button>
                    {(topicsOpen || tag) && (
                      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Tags">
                        {tags.map(([t, n]) => (
                          <FilterPill
                            key={t}
                            active={tag === t}
                            onClick={() => setParam("tag", tag === t ? "" : t)}
                          >
                            {t.replace(/-/g, " ")} <span className="text-fg-3">{n}</span>
                          </FilterPill>
                        ))}
                      </div>
                    )}
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
                  : list.length
                    ? `${list.length} more ${list.length === 1 ? "article" : "articles"}`
                    : "Every article is above"}
              </p>
              {list.length === 0 ? (
                filtering && <Empty>No articles match these filters.</Empty>
              ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {list.slice(0, visible).map((p) => (
                    <BlogCard key={p.id} post={p} wpm={settings.readingWpm} typeLabel={typeOf(p)} />
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
            </div>
          </section>
        </>
      )}
    </Layout>
  );
};

export default BlogsPage;
