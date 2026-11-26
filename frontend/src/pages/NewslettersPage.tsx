import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { SEO } from "@/components/SEO";
import {
  Button,
  CountUp,
  Eyebrow,
  FilterPill,
  Media,
  PageHero,
  Reveal,
  RisingWords,
  SectionHeader,
  Skeleton,
} from "@/components/ui";
import { ArticleCard } from "@/components/article/ArticleParts";
import { SubscribeForm } from "@/components/SubscribeForm";
import { useNewsletters } from "@/hooks/useContent";
import { useBlogPosts } from "@/hooks/useBlog";
import { monthYear } from "@/lib/format";
import { SERIES, issuesByYear, seriesOf } from "@/lib/newsletter";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { SubscribeService } from "@/services/subscribe-service";
import { cn } from "@/lib/utils";
import type { Newsletter } from "@/types";

const READING_WPM = 220;

/** Handles the confirm / unsubscribe links from emails (?confirm=… / ?unsubscribe=…). */
function LinkAction() {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const confirmToken = params.get("confirm");
  const unsubToken = params.get("unsubscribe");
  const confirm = useMutation({ mutationFn: (t: string) => SubscribeService.confirm(t) });
  const unsub = useMutation({ mutationFn: (t: string) => SubscribeService.unsubscribe(t) });
  const fired = useRef(false);

  // Confirm runs on load (a person opened the link); unsubscribe waits for a click.
  useEffect(() => {
    if (confirmToken && !fired.current) {
      fired.current = true;
      confirm.mutate(confirmToken);
    }
  }, [confirmToken, confirm]);

  if (!confirmToken && !unsubToken) return null;
  const close = () => navigate(pathname, { replace: true });
  const m = confirmToken ? confirm : unsub;
  const ok = m.isSuccess;
  const failed = m.isError;

  return (
    <div className="wrap pt-6" role="status">
      <div
        className={cn(
          "flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between",
          ok
            ? "border-live/30 bg-live/[0.08]"
            : failed
              ? "border-danger/30 bg-danger/[0.08]"
              : "border-line-2 bg-surface",
        )}
      >
        <p className="flex items-start gap-3">
          {ok ? (
            <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-live" />
          ) : failed ? (
            <XCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
          ) : null}
          <span>
            {confirmToken
              ? ok
                ? "You’re subscribed. The next issue will land in your inbox."
                : failed
                  ? (m.error as Error).message
                  : "Confirming your subscription…"
              : ok
                ? "You’ve been unsubscribed. Sorry to see you go."
                : failed
                  ? (m.error as Error).message
                  : "Unsubscribe from Saad Mazhar’s newsletter?"}
          </span>
        </p>
        <div className="flex gap-2">
          {unsubToken && !ok && (
            <Button
              variant="secondary"
              icon={false}
              disabled={unsub.isPending}
              onClick={() => unsub.mutate(unsubToken)}
            >
              {unsub.isPending ? "Unsubscribing…" : "Unsubscribe"}
            </Button>
          )}
          <Button variant="ghost" icon={false} onClick={close}>
            {ok || failed ? "Close" : "Cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function IssueCover({ issue, className }: { issue: Newsletter; className?: string }) {
  const s = seriesOf(issue);
  if (issue.image) return <Media src={issue.image} alt={issue.title} className={className} />;
  return (
    <div
      className={cn("relative flex items-end overflow-hidden rounded-card border border-line p-4", className)}
      style={{
        background: `radial-gradient(ellipse at 85% 0%, ${s.color}55, transparent 60%), rgb(var(--surface))`,
      }}
    >
      <span className="label text-fg-2">{s.label}</span>
    </div>
  );
}

const NewslettersPage = () => {
  const { data = [], isLoading } = useNewsletters();
  const { data: posts = [] } = useBlogPosts();
  const [series, setSeries] = useState<string>("all");
  const [tag, setTag] = useState<string | null>(null);

  const inSeries = useMemo(
    () => (series === "all" ? data : data.filter((n) => seriesOf(n).id === series)),
    [data, series],
  );
  const tags = useMemo(() => [...new Set(inSeries.flatMap((n) => n.tags ?? []))].sort(), [inSeries]);
  const shown = useMemo(
    () => (tag ? inSeries.filter((n) => n.tags?.includes(tag)) : inSeries),
    [inSeries, tag],
  );
  const groups = useMemo(() => issuesByYear(shown), [shown]);
  const latest = useMemo(() => issuesByYear(data)[0]?.[1][0], [data]);

  const stats = [
    { label: "Issues", value: data.length },
    { label: "Series", value: SERIES.length },
    { label: "Topics", value: new Set(data.flatMap((n) => n.tags ?? [])).size },
  ].filter((s) => s.value > 0);

  return (
    <Layout hideFooterSubscribe>
      <SEO
        title={PAGE_SEO["/newsletters"].title}
        description={PAGE_SEO["/newsletters"].description}
        url={`${BASE_URL}/newsletters`}
        structuredData={
          data.length
            ? {
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: "Newsletter issues - Saad Mazhar",
                url: `${BASE_URL}/newsletters`,
                numberOfItems: data.length,
                itemListElement: data.map((n, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: n.title,
                  url: n.content_url,
                })),
              }
            : undefined
        }
      />

      <PageHero ambient className="mb-0" band={<span className="truncate">Saad Mazhar · Newsletter</span>}>
        <div className="relative grid gap-12 lg:grid-cols-[1fr_440px] lg:items-end lg:gap-20">
          <div className="max-w-[680px]">
            <div className="animate-rise">
              <Eyebrow>Newsletter</Eyebrow>
            </div>
            <h1 className="mt-8 text-display-xl font-medium md:mt-10">
              <RisingWords text="Notes from" /> <RisingWords text="the build" from={2} className="soft" />
            </h1>
            <p className="mt-8 max-w-[560px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
              Shipping products, applied AI and the Sri Lankan startup scene. Short, practical issues when
              there’s something worth sharing, never more than a couple a month.
            </p>
            {stats.length > 1 && (
              <dl className="mt-12 grid max-w-[480px] animate-rise grid-cols-3 gap-6 [animation-delay:450ms]">
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
          <div className="animate-rise rounded-[28px] border border-line bg-surface/70 p-6 backdrop-blur [animation-delay:250ms] md:p-8">
            <h2 className="text-h3 font-medium">Get the next issue</h2>
            <p className="mb-6 mt-2 text-sm text-fg-2">Pick a series, or both.</p>
            <SubscribeForm source="newsletters" />
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-5">
              <span className="font-mono text-meta text-fg-3">Or follow along</span>
              <SocialLinks size="sm" />
            </div>
          </div>
        </div>
      </PageHero>

      <LinkAction />

      {/* Series */}
      <section className="section border-t-0" aria-labelledby="series">
        <div className="wrap">
          <Reveal>
            <SectionHeader id="series" label="Two series" title="Pick" soft="your lane" />
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {SERIES.map((s, i) => {
              const count = data.filter((n) => seriesOf(n).id === s.id).length;
              const active = series === s.id;
              return (
                <Reveal key={s.id} delay={i * 100}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSeries(active ? "all" : s.id);
                      setTag(null);
                    }}
                    className={cn(
                      "group relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-media border p-7 text-left transition-colors md:p-9",
                      active ? "border-fg/40" : "border-line hover:border-fg/20",
                    )}
                    style={{
                      background: `radial-gradient(ellipse at 100% 0%, ${s.color}26, transparent 60%)`,
                    }}
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2.5">
                        <span aria-hidden className="size-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-h3 font-medium">{s.label}</span>
                      </span>
                      <span className="font-mono text-meta text-fg-3">
                        {count ? `${count} issue${count > 1 ? "s" : ""}` : "Coming soon"}
                      </span>
                    </span>
                    <span className="max-w-[440px] text-fg-2">{s.blurb}</span>
                    {data.length > 0 && (
                      <span className="mt-auto pt-2 font-mono text-meta text-fg-3 group-hover:text-fg">
                        {active ? "Showing this series · show all" : "Show only this series"}
                      </span>
                    )}
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="wrap pb-24">
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      ) : data.length === 0 ? (
        posts.length > 0 && (
          <section className="section border-t-0" aria-labelledby="meanwhile">
            <div className="wrap">
              <Reveal>
                <SectionHeader
                  id="meanwhile"
                  label="First issue soon"
                  title="Read this"
                  soft="meanwhile"
                  action={
                    <Button to="/blog" variant="ghost">
                      All posts
                    </Button>
                  }
                />
              </Reveal>
              <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {posts.slice(0, 3).map((p, i) => (
                  <Reveal key={p.id} delay={i * 80}>
                    <ArticleCard post={p} wpm={READING_WPM} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )
      ) : (
        <>
          {latest && series === "all" && !tag && (
            <section className="section border-t-0" aria-labelledby="latest">
              <div className="wrap">
                <Reveal>
                  <SectionHeader id="latest" label="Latest issue" title="Fresh" soft="off the press" />
                </Reveal>
                <Reveal>
                  <a
                    href={latest.content_url}
                    target="_blank"
                    rel="noopener"
                    className="group grid gap-8 rounded-media border border-line bg-surface/50 p-5 transition-colors hover:border-accent/40 md:grid-cols-[1.1fr_1fr] md:items-center md:p-8"
                  >
                    <IssueCover issue={latest} className="aspect-video" />
                    <span className="flex flex-col gap-4">
                      <span className="font-mono text-meta text-fg-3">
                        {[seriesOf(latest).label, monthYear(latest.date)].filter(Boolean).join(" · ")}
                      </span>
                      <span className="text-h1 font-medium leading-tight group-hover:text-accent">
                        {latest.title}
                      </span>
                      {latest.description && (
                        <span className="text-body-l text-fg-2">{latest.description}</span>
                      )}
                      <span className="inline-flex items-center gap-2 font-medium text-accent">
                        Read issue <ArrowUpRight aria-hidden className="size-4" />
                      </span>
                    </span>
                  </a>
                </Reveal>
              </div>
            </section>
          )}

          <section className="section border-t-0" aria-labelledby="archive">
            <div className="wrap">
              <Reveal>
                <SectionHeader id="archive" label="Archive" title="Every" soft="issue" />
              </Reveal>
              {tags.length > 1 && (
                <div className="mb-10 flex flex-wrap gap-2">
                  <FilterPill active={!tag} onClick={() => setTag(null)}>
                    All topics
                  </FilterPill>
                  {tags.map((t) => (
                    <FilterPill key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                      {t}
                    </FilterPill>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-16">
                {groups.map(([year, list]) => (
                  <section key={year} aria-labelledby={`issues-${year}`}>
                    <div className="mb-6 flex items-center gap-4">
                      <h3 id={`issues-${year}`} className="text-h2 font-medium tabular-nums">
                        {year}
                      </h3>
                      <span className="label text-fg-3">
                        {list.length} {list.length === 1 ? "issue" : "issues"}
                      </span>
                      <div className="h-px flex-1 bg-line-2" aria-hidden />
                    </div>
                    <ul className="flex flex-col border-b border-line-2">
                      {list.map((n) => {
                        const s = seriesOf(n);
                        return (
                          <li key={n.id} className="border-t border-line-2">
                            <a
                              href={n.content_url}
                              target="_blank"
                              rel="noopener"
                              className="group grid grid-cols-[96px_1fr] items-center gap-5 py-5 sm:grid-cols-[140px_1fr_auto]"
                            >
                              <IssueCover issue={n} className="aspect-[4/3]" />
                              <span className="flex min-w-0 flex-col gap-1.5">
                                <span className="flex items-center gap-2 font-mono text-meta text-fg-3">
                                  <span
                                    aria-hidden
                                    className="size-1.5 rounded-full"
                                    style={{ background: s.color }}
                                  />
                                  {[s.label, monthYear(n.date)].filter(Boolean).join(" · ")}
                                </span>
                                <span className="text-h4 font-medium group-hover:text-accent">{n.title}</span>
                                {n.description && (
                                  <span className="line-clamp-2 text-sm text-fg-2">{n.description}</span>
                                )}
                              </span>
                              <ArrowUpRight
                                aria-hidden
                                className="hidden size-5 text-fg-3 group-hover:text-accent sm:block"
                              />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
                {groups.length === 0 && <p className="text-fg-3">No issues match this filter.</p>}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="section theme-orange relative overflow-hidden" aria-labelledby="subscribe-cta">
        <div className="wrap flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <h2 id="subscribe-cta" className="max-w-[560px] text-display-m font-medium">
            Don’t miss <span className="font-light text-fg-2">the next one.</span>
          </h2>
          <SubscribeForm compact onAccent source="newsletters-cta" className="w-full md:max-w-[460px]" />
        </div>
      </section>
    </Layout>
  );
};

export default NewslettersPage;
