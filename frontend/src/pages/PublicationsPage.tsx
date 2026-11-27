import { useMemo, useState } from "react";
import { ArrowUpRight, Check, FileText, Quote } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
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
} from "@/components/ui";
import { Mark } from "@/components/cards";
import { usePatents, usePublications } from "@/hooks/useContent";
import { copyText } from "@/lib/clipboard";
import { monthYear } from "@/lib/format";
import {
  PUB_TYPES,
  citeApa,
  citeBibtex,
  publicationSchema,
  pubType,
  type PubTypeId,
} from "@/lib/publications.js";
import { PAGE_SEO, BASE_URL, PERSON_REF } from "@/lib/seo-content";
import { cn } from "@/lib/utils";
import type { Patent, Publication } from "@/types";

const SELF = "Saad Mazhar";
const time = (d?: string) => {
  const t = Date.parse(d ?? "");
  return Number.isNaN(t) ? 0 : t;
};

function Authors({ list }: { list?: string[] }) {
  if (!list?.length) return null;
  return (
    <span className="text-sm text-fg-2">
      {list.map((a, i) => (
        <span key={a}>
          {i > 0 && ", "}
          <span className={cn(a === SELF && "font-medium text-fg")}>{a}</span>
        </span>
      ))}
    </span>
  );
}

function CiteButton({ pub }: { pub: Publication }) {
  const [copied, setCopied] = useState<"" | "apa" | "bib">("");
  const copy = async (kind: "apa" | "bib") => {
    if (await copyText(kind === "apa" ? citeApa(pub) : citeBibtex(pub))) {
      setCopied(kind);
      setTimeout(() => setCopied(""), 1600);
    }
  };
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line-2 p-0.5 text-[13px]">
      <Quote aria-hidden className="ml-2 size-3.5 text-fg-3" />
      {(["apa", "bib"] as const).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => copy(k)}
          aria-label={`Copy ${k === "apa" ? "APA" : "BibTeX"} citation`}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
        >
          {copied === k ? <Check aria-hidden className="size-3.5 text-live" /> : null}
          {k === "apa" ? "APA" : "BibTeX"}
        </button>
      ))}
      <span aria-live="polite" className="sr-only">
        {copied ? "Citation copied" : ""}
      </span>
    </span>
  );
}

function PubCard({ pub, large }: { pub: Publication; large?: boolean }) {
  const t = PUB_TYPES[pubType(pub)];
  const abstract = pub.abstract || pub.description;
  return (
    <article
      className={cn(
        "flex h-full flex-col gap-5 rounded-media border border-line bg-surface/50 p-6 md:p-8",
        large && "md:p-10",
      )}
      style={
        large
          ? { background: `radial-gradient(ellipse at 100% 0%, ${t.color}22, transparent 60%)` }
          : undefined
      }
    >
      <header className="flex items-center gap-3">
        <Mark src={pub.logo} label={pub.publisher || t.label} className="size-10" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{pub.publisher}</span>
          <span className="font-mono text-meta text-fg-3">{monthYear(pub.date) || pub.date}</span>
        </span>
        <span
          className="label ml-auto shrink-0 rounded-full px-2.5 py-1 text-white"
          style={{ background: t.color }}
        >
          {t.label}
        </span>
      </header>
      <h3 className={cn("font-medium leading-tight", large ? "text-h1" : "text-h3")}>{pub.title}</h3>
      <Authors list={pub.authors} />
      {abstract &&
        (large ? (
          <p className="max-w-[760px] text-body-l text-fg-2">{abstract}</p>
        ) : (
          <details className="group">
            <summary className="cursor-pointer list-none font-mono text-meta text-fg-3 hover:text-fg [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Show abstract +</span>
              <span className="hidden group-open:inline">Hide abstract −</span>
            </summary>
            <p className="mt-3 text-fg-2">{abstract}</p>
          </details>
        ))}
      {pub.tags?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {pub.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] text-fg-2">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <footer className="mt-auto flex flex-wrap items-center gap-3 pt-2">
        {(pub.link || pub.doi) && (
          <a
            href={pub.link || `https://doi.org/${pub.doi}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
          >
            Read <ArrowUpRight aria-hidden className="size-4" />
          </a>
        )}
        {pub.pdf && (
          <a
            href={pub.pdf}
            target="_blank"
            rel="noopener"
            className="tap inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-fg"
          >
            <FileText aria-hidden className="size-4" /> PDF
          </a>
        )}
        <span className="ml-auto">
          <CiteButton pub={pub} />
        </span>
      </footer>
    </article>
  );
}

const PATENT_STATUS: Record<string, string> = {
  granted: "#2fbf71",
  issued: "#2fbf71",
  pending: "#f5a524",
  filed: "#7c8db5",
};

function PatentCard({ patent: p }: { patent: Patent }) {
  const color = PATENT_STATUS[p.status?.toLowerCase()] ?? "#9aa0aa";
  const steps = [
    ["Filed", p.filingDate],
    ["Issued", p.issueDate],
  ].filter(([, d]) => d) as [string, string][];
  return (
    <article className="flex h-full flex-col gap-5 rounded-media border border-line bg-surface/50 p-6 md:p-8">
      <header className="flex flex-wrap items-center gap-3">
        <span className="label rounded-full px-2.5 py-1 text-white" style={{ background: color }}>
          {p.status}
        </span>
        <span className="font-mono text-meta text-fg-3">
          {[p.patentOffice, p.patentNumber].filter(Boolean).join(" · ")}
        </span>
      </header>
      <h3 className="text-h3 font-medium leading-tight">{p.title}</h3>
      {p.description && <p className="text-fg-2">{p.description}</p>}
      {steps.length > 0 && (
        <ol className="relative mt-auto flex gap-10 pt-4">
          <span aria-hidden className="absolute left-1.5 right-0 top-[21px] h-px bg-line-2" />
          {steps.map(([k, d]) => (
            <li key={k} className="relative flex flex-col gap-2">
              <span className="size-3 rounded-full border-2 bg-base" style={{ borderColor: color }} />
              <span className="label text-fg-3">{k}</span>
              <span className="text-sm">{monthYear(d) || d}</span>
            </li>
          ))}
        </ol>
      )}
      {p.link && (
        <a
          href={p.link}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
        >
          View patent <ArrowUpRight aria-hidden className="size-4" />
        </a>
      )}
    </article>
  );
}

type Tab = "all" | PubTypeId;

const PublicationsPage = () => {
  const { data: pubData = [], isLoading } = usePublications();
  const { data: patents = [] } = usePatents();
  const [tab, setTab] = useState<Tab>("all");
  const [tag, setTag] = useState<string | null>(null);

  const pubs = useMemo(() => [...pubData].sort((a, b) => time(b.date) - time(a.date)), [pubData]);
  const featured = useMemo(() => pubs.find((p) => p.featured) ?? pubs[0], [pubs]);
  const tabs = useMemo(() => {
    const counts = new Map<PubTypeId, number>();
    pubs.forEach((p) => counts.set(pubType(p), (counts.get(pubType(p)) ?? 0) + 1));
    if (patents.length) counts.set("patent", patents.length);
    return [["all", pubs.length + patents.length] as [Tab, number], ...counts];
  }, [pubs, patents]);
  const inTab = useMemo(() => (tab === "all" ? pubs : pubs.filter((p) => pubType(p) === tab)), [pubs, tab]);
  const tags = useMemo(() => [...new Set(inTab.flatMap((p) => p.tags ?? []))].sort(), [inTab]);
  const shown = useMemo(
    () => inTab.filter((p) => (!tag || p.tags?.includes(tag)) && !(tab === "all" && !tag && p === featured)),
    [inTab, tag, tab, featured],
  );
  const showPatents = patents.length > 0 && (tab === "all" || tab === "patent") && !tag;
  const empty = !isLoading && pubs.length === 0 && patents.length === 0;

  const coAuthors = new Set(pubs.flatMap((p) => p.authors ?? []).filter((a) => a !== SELF)).size;
  const stats = [
    { label: "Publications", value: pubs.length },
    { label: "Patents", value: patents.length },
    { label: "Co-authors", value: coAuthors },
    { label: "Publishers", value: new Set(pubs.map((p) => p.publisher).filter(Boolean)).size },
  ].filter((s) => s.value > 0);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/publications"].title}
        description={PAGE_SEO["/publications"].description}
        url={`${BASE_URL}/publications`}
        noIndex={empty ? "follow" : false}
        structuredData={
          pubs.length
            ? {
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: "Publications - Saad Mazhar",
                url: `${BASE_URL}/publications`,
                numberOfItems: pubs.length,
                itemListElement: pubs.map((p, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: publicationSchema(p, PERSON_REF),
                })),
              }
            : undefined
        }
      />

      <PageHero ambient className="mb-0" band={<span className="truncate">Saad Mazhar · Publications</span>}>
        <div className="relative max-w-[760px]">
          <div className="animate-rise">
            <Eyebrow>Publications</Eyebrow>
          </div>
          <h1 className="mt-8 text-display-xl font-medium md:mt-10">
            <RisingWords text="Published" /> <RisingWords text="work" from={1} className="soft" />
          </h1>
          <p className="mt-8 max-w-[580px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
            Papers, articles, talks and patents: the ideas I’ve put on the record. Every entry can be cited in
            one click.
          </p>
          {stats.length > 0 && (
            <dl className="mt-12 grid max-w-[640px] animate-rise grid-cols-2 gap-6 [animation-delay:450ms] sm:grid-cols-4">
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
      </PageHero>

      {isLoading ? (
        <div className="wrap py-16">
          <Skeleton className="h-64 w-full rounded-media" />
        </div>
      ) : empty ? (
        <section className="section screen border-t-0">
          <div className="wrap flex flex-col items-start gap-6">
            <Empty>Publications will appear here soon.</Empty>
            <Button to="/blog" variant="secondary">
              Read the blog meanwhile
            </Button>
          </div>
        </section>
      ) : (
        <>
          {featured && tab === "all" && !tag && (
            <section className="section screen border-t-0" aria-labelledby="featured">
              <div className="wrap">
                <Reveal>
                  <SectionHeader id="featured" label="Featured" title="Start" soft="here" />
                </Reveal>
                <Reveal>
                  <PubCard pub={featured} large />
                </Reveal>
              </div>
            </section>
          )}

          <section className="section screen border-t-0" aria-labelledby="all-work">
            <div className="wrap">
              <Reveal>
                <SectionHeader id="all-work" label="Library" title="Everything" soft="on record" />
              </Reveal>
              {tabs.length > 2 && (
                <div role="tablist" aria-label="Filter by type" className="mb-6 flex flex-wrap gap-2">
                  {tabs.map(([id, n]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={tab === id}
                      onClick={() => {
                        setTab(id);
                        setTag(null);
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                        tab === id ? "border-fg/40 text-fg" : "border-line-2 text-fg-3 hover:text-fg-2",
                      )}
                    >
                      {id !== "all" && (
                        <span
                          aria-hidden
                          className="size-2 rounded-full"
                          style={{ background: PUB_TYPES[id].color }}
                        />
                      )}
                      {id === "all" ? "All" : `${PUB_TYPES[id].label}s`}
                      <span className="font-mono text-meta text-fg-3">{n}</span>
                    </button>
                  ))}
                </div>
              )}
              {tab !== "patent" && tags.length > 1 && (
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
              {tab !== "patent" && shown.length > 0 && (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 md:gap-6">
                  {shown.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 2) * 80} className="h-full">
                      <PubCard pub={p} />
                    </Reveal>
                  ))}
                </div>
              )}
              {tab !== "patent" && shown.length === 0 && !(tab === "all" && featured && !tag) && (
                <p className="text-fg-3">Nothing matches this filter.</p>
              )}
            </div>
          </section>

          {showPatents && (
            <section className="section screen border-t-0" aria-labelledby="patents">
              <div className="wrap">
                <Reveal>
                  <SectionHeader id="patents" label="Patents" title="Inventions" soft="on file" />
                </Reveal>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 md:gap-6">
                  {patents.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 2) * 80} className="h-full">
                      <PatentCard patent={p} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </Layout>
  );
};

export default PublicationsPage;
