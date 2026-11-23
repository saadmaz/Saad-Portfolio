import { useMemo, useRef, useState } from "react";
import { EyeOff } from "lucide-react";
import { Button, Eyebrow, Tag } from "@/components/ui";
import { CmsContent, type ContentHeading } from "@/components/CmsContent";
import { useAuthorOf, useBlogSettings, useSeries } from "@/hooks/useBlog";
import { useArticleTracking } from "@/hooks/useArticleTracking";
import {
  adjacentPosts,
  articleTypeLabel,
  relatedPosts,
  seriesPosition,
  slugify,
  updatedAtOf,
  wasUpdated,
} from "@/lib/article-core";
import { BASE_URL } from "@/lib/seo-content";
import { hasNavigation, withoutPromptHeadings, type ArticlePrompt } from "@/lib/prompts";
import type { BlogPost } from "@/types";
import {
  ArticleCard,
  ArticlePager,
  AuthorCard,
  Breadcrumbs,
  Byline,
  CoverFigure,
  SeriesNav,
  SourcesList,
} from "./ArticleParts";
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

  return (
    <>
      <ReadingProgress target={articleRef} />
      <header className="mx-auto flex max-w-[820px] flex-col items-center gap-7 px-5 pb-12 pt-12 text-center md:pt-20">
        <Breadcrumbs
          items={[
            { label: "Blog", to: "/blog" },
            ...(post.category
              ? [{ label: post.category, to: `/blog/category/${slugify(post.category)}` }]
              : []),
            { label: post.title },
          ]}
        />
        {post.unlisted && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1 text-[13px] text-fg-3">
            <EyeOff aria-hidden className="size-3.5" />
            Unlisted · only people with the link can see this
          </span>
        )}
        {typeLabel && <span className="label text-accent">{typeLabel}</span>}
        <h1 className="text-display-m font-medium">{post.title}</h1>
        {(post.subtitle || post.excerpt) && (
          <p className="text-body-l text-fg-2">{post.subtitle || post.excerpt}</p>
        )}
        <Byline post={post} author={author} updated={updated} wpm={settings.readingWpm} />
      </header>

      <CoverFigure post={post} />

      <div className="wrap grid gap-x-12 py-16 md:py-20 xl:grid-cols-[minmax(0,1fr)_minmax(0,680px)_minmax(0,1fr)]">
        <article ref={articleRef} className="mx-auto w-full min-w-0 max-w-prose xl:col-start-2">
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
            className="prose-cms"
            html={post.content ?? ""}
            onHeadings={setHeadings}
            onPrompts={setPrompts}
            title={post.title}
            subtitle={post.subtitle || post.excerpt}
            toc={showToc ? <TableOfContents headings={headings} prompts={prompts} variant="inline" /> : null}
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
            {author && <AuthorCard author={author} />}
            {!series && !preview && <ArticlePager previous={adjacent.previous} next={adjacent.next} />}
          </div>
        </article>

        {showNav && (
          <aside className="hidden xl:col-start-3 xl:block">
            <TableOfContents
              headings={tocHeadings}
              prompts={prompts}
              variant="sidebar"
              className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto"
            />
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section className="section" aria-labelledby="related-heading">
          <div className="wrap">
            <Eyebrow>Keep reading</Eyebrow>
            <h2 id="related-heading" className="sr-only">
              Related articles
            </h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ArticleCard
                  key={p.id}
                  post={p}
                  wpm={settings.readingWpm}
                  typeLabel={articleTypeLabel(p.articleType, settings.articleTypes)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
