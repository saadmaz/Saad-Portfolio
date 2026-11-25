import { useMemo, useRef, useState } from "react";
import { SubscribeForm } from "@/components/SubscribeForm";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, EyeOff, Mail } from "lucide-react";
import { Button, Media, Reveal, SectionHeader, Tag } from "@/components/ui";
import { CmsContent, type ContentHeading } from "@/components/CmsContent";
import { useAuthorOf, useBlogSettings, useSeries } from "@/hooks/useBlog";
import { useArticleTracking } from "@/hooks/useArticleTracking";
import {
  adjacentPosts,
  articlePath,
  articleTypeLabel,
  coverOf,
  readingMinutesOf,
  relatedPosts,
  seriesPosition,
  slugify,
  updatedAtOf,
  wasUpdated,
} from "@/lib/article-core";
import { BASE_URL } from "@/lib/seo-content";
import { hasNavigation, withoutPromptHeadings, type ArticlePrompt } from "@/lib/prompts";
import type { BlogPost, ImageAsset } from "@/types";
import { monthYear } from "@/lib/format";
import { AuthorCard, Breadcrumbs, Byline, SeriesNav, SourcesList } from "./ArticleParts";
import { ArticleHero } from "./ArticleHero";
import { ArticleRail } from "./ArticleRail";
import { ReadingProgress } from "./ReadingProgress";
import { TableOfContents } from "./TableOfContents";
import { ArticleActions } from "./ArticleActions";
import { ShareButtons } from "./ShareButtons";
import { Reactions } from "./Reactions";

interface ArticleViewProps {
  post: BlogPost;
  /** Live, listed posts: for related articles and series navigation. */
  livePosts: BlogPost[];
  /** Draft preview: no tracking, reactions read-only. */
  preview?: boolean;
}

/** "Keep reading" card: cropped cover, meta and title; lifts on hover. */
function RelatedCard({ post, wpm, delay }: { post: BlogPost; wpm: number; delay: number }) {
  const cover = coverOf(post);
  return (
    <Reveal delay={delay} className="h-full">
      <Link
        to={articlePath(post)}
        className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface/40 transition-[border-color,transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-line-3 hover:shadow-[0_24px_60px_-28px_rgb(0_0_0/0.8)]"
      >
        <div className="p-2 pb-0">
          <Media
            asset={cover as ImageAsset | null}
            alt={cover?.alt || ""}
            className="aspect-[16/10] rounded-[16px]"
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <span className="font-mono text-meta text-fg-3">
            {[post.category, monthYear(post.publishedAt || post.date), `${readingMinutesOf(post, wpm)} min`]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <h3 className="text-h4 font-medium transition-colors group-hover:text-accent">{post.title}</h3>
          {(post.subtitle || post.excerpt) && (
            <p className="line-clamp-2 text-[0.9375rem] text-fg-2">{post.subtitle || post.excerpt}</p>
          )}
        </div>
      </Link>
    </Reveal>
  );
}

/** The complete public article layout. Used by /blog/:slug and /preview/:id. */
export function ArticleView({ post, livePosts, preview = false }: ArticleViewProps) {
  const articleRef = useRef<HTMLElement>(null);
  const [headings, setHeadings] = useState<ContentHeading[]>([]);
  const [prompts, setPrompts] = useState<ArticlePrompt[]>([]);
  const author = useAuthorOf(post);
  const { settings } = useBlogSettings();
  const { data: allSeries = [] } = useSeries();
  useArticleTracking(post.id, articleRef, !preview && post.published);

  const url = `${BASE_URL}/blog/${post.slug || post.id}`;
  const typeLabel = articleTypeLabel(post.articleType, settings.articleTypes);
  const updated = wasUpdated(post) ? updatedAtOf(post) : null;
  const showToc = post.tableOfContents !== false;
  // Turning the TOC off hides section links; prompt navigation stays.
  const tocHeadings = useMemo(
    () => (showToc ? withoutPromptHeadings(headings, prompts) : []),
    [showToc, headings, prompts],
  );
  const showNav = hasNavigation(tocHeadings, prompts);
  const inlineToc = post.content?.includes("data-toc");
  const inlineSources = post.content?.includes("data-sources");
  const sources = post.sources?.filter((s) => s.title?.trim()) ?? [];
  const reactionsOn = settings.reactionsEnabled && post.reactionsEnabled !== false;
  const showShare = post.socialShareEnabled !== false && !post.unlisted;

  const series = allSeries.find((s) => s.id === post.seriesId) ?? null;
  const position = useMemo(() => {
    if (!series) return null;
    // A preview of a not-yet-live part still shows where it will sit.
    const byId = new Map(livePosts.map((p) => [p.id, p]));
    if (preview) byId.set(post.id, post);
    return seriesPosition(series, post, byId);
  }, [series, livePosts, post, preview]);
  const related = useMemo(() => relatedPosts(post, livePosts, 3), [post, livePosts]);
  const adjacent = useMemo(() => adjacentPosts(post, livePosts), [post, livePosts]);

  const nextUp = adjacent.next ?? adjacent.previous;
  const nextCover = nextUp ? coverOf(nextUp) : null;

  return (
    <>
      <ReadingProgress target={articleRef} />
      <ArticleHero
        post={post}
        eyebrow={typeLabel || post.category}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Blog", to: "/blog" },
              ...(post.category
                ? [{ label: post.category, to: `/blog/category/${slugify(post.category)}` }]
                : []),
              { label: post.title },
            ]}
          />
        }
        notice={
          post.unlisted && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-[13px] text-white/70">
              <EyeOff aria-hidden className="size-3.5" />
              Unlisted · only people with the link can see this
            </span>
          )
        }
        byline={<Byline post={post} author={author} updated={updated} wpm={settings.readingWpm} />}
      />

      {/* Rail · article · contents. The fixed side columns keep the contents list readable. */}
      <div className="wrap relative grid gap-x-10 py-10 md:py-16 xl:grid-cols-[64px_minmax(0,1fr)_240px] xl:gap-x-12">
        <ArticleRail
          target={articleRef}
          url={url}
          title={post.title}
          date={post.publishedAt || post.date}
          shareable={showShare}
        />

        <article
          ref={articleRef}
          className="mx-auto w-full min-w-0 max-w-[780px] pb-8 sm:rounded-[28px] sm:border sm:border-line sm:bg-surface/30 sm:px-10 sm:pb-12 sm:pt-12 md:px-14 xl:col-start-2 xl:row-start-1"
        >
          <div className="mx-auto max-w-prose">
            {showNav && !(inlineToc && showToc) && (
              <TableOfContents
                headings={tocHeadings}
                prompts={prompts}
                variant="inline"
                className="mb-8 xl:hidden"
              />
            )}
            <ArticleActions
              prompts={prompts}
              title={post.title}
              author={author?.name || post.author}
              url={url}
              shareable={showShare}
              downloadable={post.promptDownloads !== false}
              className="mb-12"
            />
            <CmsContent
              className="prose-cms article-body"
              html={post.content ?? ""}
              onHeadings={setHeadings}
              onPrompts={setPrompts}
              title={post.title}
              subtitle={post.subtitle || post.excerpt}
              toc={
                showToc ? <TableOfContents headings={headings} prompts={prompts} variant="inline" /> : null
              }
              sources={<SourcesList sources={sources} />}
            />
            {!inlineSources && sources.length > 0 && <SourcesList sources={sources} className="mt-16" />}

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

            <div className="mt-12 flex flex-col gap-10">
              {(reactionsOn || showShare) && (
                <div className="rounded-card border border-line-2 bg-surface/60 p-5 sm:p-7">
                  {reactionsOn && <Reactions postId={post.id} disabled={preview || !post.published} />}
                  {showShare && (
                    <ShareButtons
                      url={url}
                      title={post.title}
                      className={reactionsOn ? "mt-7 border-t border-line pt-6" : undefined}
                    />
                  )}
                </div>
              )}
              {series && position && <SeriesNav series={series} position={position} current={post} />}
              {author && <AuthorCard author={author} className="border-l-4 border-l-accent" />}
            </div>
          </div>
        </article>

        {showNav && (
          <aside className="hidden xl:col-start-3 xl:row-start-1 xl:block">
            <TableOfContents
              headings={tocHeadings}
              prompts={prompts}
              variant="sidebar"
              className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto"
            />
          </aside>
        )}
      </div>

      {/* Subscribe band. */}
      {!preview && (
        <section
          className="theme-orange relative overflow-hidden py-20 md:py-28"
          aria-labelledby="subscribe-heading"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-[460px] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.25),transparent_65%)]"
          />
          <Reveal className="wrap relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-[640px] flex-col gap-4">
              <span className="label flex items-center gap-2 text-fg-2">
                <Mail aria-hidden className="size-4" /> Newsletter
              </span>
              <h2 id="subscribe-heading" className="text-display-m font-medium">
                New posts, <span className="font-light text-fg-2">straight to your inbox.</span>
              </h2>
            </div>
            <SubscribeForm compact onAccent source="blog" className="w-full md:max-w-[460px]" />
          </Reveal>
        </section>
      )}

      {related.length > 0 && (
        <section className="section border-t-0" aria-labelledby="related-heading">
          <div className="wrap">
            <Reveal>
              <SectionHeader
                id="related-heading"
                label="Keep reading"
                title="More"
                soft="like this"
                action={
                  <Button to="/blog" variant="ghost">
                    All writing
                  </Button>
                }
              />
            </Reveal>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <li key={p.id}>
                  <RelatedCard post={p} wpm={settings.readingWpm} delay={i * 100} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {!series && !preview && nextUp && (
        <section className="section">
          <div className="wrap">
            <Link
              to={articlePath(nextUp)}
              rel={adjacent.next ? "next" : "prev"}
              className="group grid items-center gap-6 overflow-hidden rounded-[28px] border border-line bg-surface/40 p-2 transition-colors hover:border-accent/40 md:grid-cols-[1fr_380px] md:p-3"
            >
              <div className="flex flex-col gap-4 p-5 md:p-8">
                <span className="label text-fg-3">{adjacent.next ? "Next article" : "Previous article"}</span>
                <span className="text-h1 font-medium transition-colors group-hover:text-accent">
                  {nextUp.title}{" "}
                  <ArrowRight
                    aria-hidden
                    className="inline size-[0.7em] text-accent transition-transform duration-200 group-hover:translate-x-2"
                  />
                </span>
                {(nextUp.subtitle || nextUp.excerpt) && (
                  <span className="line-clamp-2 text-body-l text-fg-2">
                    {nextUp.subtitle || nextUp.excerpt}
                  </span>
                )}
              </div>
              {nextCover ? (
                <Media
                  asset={nextCover as ImageAsset}
                  alt=""
                  className="aspect-[16/10] rounded-[20px]"
                  sizes="(min-width: 768px) 380px, 100vw"
                />
              ) : (
                <span className="flex aspect-[16/10] items-center justify-center rounded-[20px] bg-[radial-gradient(ellipse_at_85%_0%,rgb(255_95_0/0.35),transparent_60%)]">
                  <ArrowUpRight aria-hidden className="size-10 text-accent" />
                </span>
              )}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
