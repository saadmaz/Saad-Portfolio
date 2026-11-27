import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Search, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import {
  Button,
  CountUp,
  Empty,
  Eyebrow,
  PageHero,
  Reveal,
  RisingWords,
  SectionHeader,
  Skeleton,
  Tag,
} from "@/components/ui";
import { Mark } from "@/components/cards";
import { CertPaper } from "@/components/CertPaper";
import { useCertificates, useSkills } from "@/hooks/useContent";
import { areaColors } from "@/lib/certAreas";
import { monthYear, year } from "@/lib/format";
import { certificatePath } from "@/lib/paths";
import { skillKey } from "@/lib/skillUsage";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { cn } from "@/lib/utils";
import type { Certificate } from "@/types";

const PAGE = 12;
const time = (c: Certificate) => new Date(c.issue_date).getTime() || 0;

/** Side panel with one certificate's details and links. */
function CertPanel({ cert, color, onClose }: { cert: Certificate; color: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);
  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={cert.title}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-rise bg-black/60 backdrop-blur-sm [animation-duration:250ms]"
      />
      <aside className="relative flex h-full w-full max-w-[480px] animate-slide-in flex-col gap-6 overflow-y-auto border-l border-line-2 bg-base p-6 md:p-8">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full border border-line-2 bg-base text-fg-2 hover:text-fg"
        >
          <X className="size-5" />
        </button>
        <CertPaper cert={cert} color={color} still className="mt-10" />
        {cert.description && <p className="whitespace-pre-line text-fg-2">{cert.description}</p>}
        {cert.skills?.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="label text-fg-3">Skills</span>
            <div className="flex flex-wrap gap-2">
              {cert.skills.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </div>
        )}
        {cert.credential_id && (
          <p className="font-mono text-meta text-fg-3">Credential ID · {cert.credential_id}</p>
        )}
        <div className="mt-auto flex flex-wrap gap-3 border-t border-line-2 pt-6">
          {cert.credential_url && <Button href={cert.credential_url}>Verify</Button>}
          {cert.pdf_document_link && (
            <a
              href={cert.pdf_document_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line-3 px-[18px] text-sm font-medium hover:bg-surface-2"
            >
              <FileText aria-hidden className="size-4" /> PDF
            </a>
          )}
          <Button to={certificatePath(cert)} variant="ghost">
            Full page
          </Button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

const CertificationsPage = () => {
  const { data = [], isLoading } = useCertificates();
  const { data: skillSets = [] } = useSkills();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"new" | "az">("new");
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Certificate | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const library = useRef<HTMLElement>(null);

  const certs = useMemo(() => [...data].sort((a, b) => time(b) - time(a)), [data]);
  const colors = useMemo(() => areaColors(certs), [certs]);
  const colorOf = (c: Certificate) => colors.get(c.category) ?? "#ff5f00";
  const categories = [...colors.keys()].map((cat) => ({
    cat,
    color: colors.get(cat)!,
    count: certs.filter((c) => c.category === cat).length,
  }));

  // Professional certificates and certifications first, then anything featured.
  const headline = certs
    .filter((c) => (c.type && c.type.toLowerCase() !== "course") || c.is_featured)
    .sort((a, b) => Number(b.type?.toLowerCase() !== "course") - Number(a.type?.toLowerCase() !== "course"))
    .slice(0, 6);

  const skillCounts = useMemo(() => {
    const m = new Map<string, { name: string; count: number }>();
    for (const c of certs)
      for (const s of c.skills ?? []) {
        const k = skillKey(s);
        const cur = m.get(k);
        m.set(k, { name: cur?.name ?? s, count: (cur?.count ?? 0) + 1 });
      }
    return [...m.values()].sort((a, b) => b.count - a.count);
  }, [certs]);
  const onSkillsPage = useMemo(
    () => new Set(skillSets.flatMap((g) => g.skills.filter((s) => !s.toolOnly).map((s) => skillKey(s.name)))),
    [skillSets],
  );
  const cloud = skillCounts.slice(0, 36);
  const maxCount = cloud[0]?.count ?? 1;

  const byYear = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of certs) {
      const y = Number(year(c.issue_date));
      if (y) m.set(y, (m.get(y) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [certs]);
  const maxYear = Math.max(1, ...byYear.map(([, n]) => n));

  const q = query.trim().toLowerCase();
  const filtered = certs
    .filter(
      (c) =>
        (category === "All" || c.category === category) &&
        (!q || `${c.title} ${c.issuer} ${(c.skills ?? []).join(" ")}`.toLowerCase().includes(q)),
    )
    .sort((a, b) => (sort === "az" ? a.title.localeCompare(b.title) : time(b) - time(a)));
  const shown = filtered.slice(0, limit);

  const focusLibrary = (cat: string, search = "") => {
    setCategory(cat);
    setQuery(search);
    setLimit(PAGE);
    library.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stats = [
    { value: certs.length, label: "Credentials" },
    { value: categories.length, label: "Areas" },
    { value: skillCounts.length, label: "Skills covered" },
  ].filter((s) => s.value > 0);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/certifications"].title}
        description={PAGE_SEO["/certifications"].description}
        url={`${BASE_URL}/certifications`}
      />

      {/* 1 · Hero */}
      <PageHero ambient band={<span className="truncate">Saad Mazhar · Certifications</span>}>
        <div className="animate-rise">
          <Eyebrow>Certifications</Eyebrow>
        </div>
        <div className="mt-8 flex flex-col gap-10 md:mt-10 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="text-display-xl font-medium">
            <RisingWords text="Always" /> <RisingWords text="learning" from={1} className="soft" />
          </h1>
          {stats.length > 0 && (
            <dl className="flex animate-rise gap-8 [animation-delay:450ms] md:gap-12">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-2.5">
                  <dt className="label text-fg-3">{s.label}</dt>
                  <dd className="text-display-m font-medium leading-none">
                    <CountUp value={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <p className="mt-8 max-w-[600px] animate-rise text-body-l text-fg-2 [animation-delay:350ms] md:mt-10">
          Courses and credentials across AI, engineering, cloud and business. Every one links to the issuer so
          you can verify it.
        </p>
      </PageHero>

      {/* 2 · Headline credentials */}
      {headline.length > 0 && (
        <section className="section screen theme-orange border-t-0" aria-labelledby="headline">
          <div className="wrap">
            <Reveal>
              <SectionHeader
                id="headline"
                label="Headline credentials"
                title="The ones"
                soft="that count most"
              />
            </Reveal>
            <ul className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {headline.map((c, i) => (
                <li key={c.id}>
                  <Reveal delay={i * 100} className="h-full">
                    <button
                      type="button"
                      onClick={() => setOpen(c)}
                      className="block h-full w-full text-left"
                    >
                      <CertPaper cert={c} color={colorOf(c)} className="h-full" />
                    </button>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 3 · Learning map */}
      {categories.length > 1 && (
        <section className="section screen theme-light border-t-0" aria-labelledby="areas">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="areas" label="Learning map" title="Where the" soft="hours went" />
            </Reveal>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {categories.map((a, i) => (
                <li key={a.cat}>
                  <Reveal delay={i * 70} className="group h-full">
                    <button
                      type="button"
                      onClick={() => focusLibrary(a.cat)}
                      className="flex h-full w-full flex-col gap-4 rounded-[22px] border border-line-2 bg-surface/50 p-5 text-left transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 md:p-6"
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = a.color)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                    >
                      <span className="text-display-m font-medium leading-none" style={{ color: a.color }}>
                        {a.count}
                      </span>
                      <span className="text-[15px] font-medium leading-snug">{a.cat}</span>
                      <span className="mt-auto h-1.5 overflow-hidden rounded-full bg-line-2">
                        <span
                          className="block h-full origin-left scale-x-0 rounded-full transition-transform duration-1000 ease-out group-data-[in=true]:scale-x-100"
                          style={{
                            width: `${Math.max(6, (a.count / certs.length) * 100)}%`,
                            background: a.color,
                            transitionDelay: `${i * 90 + 200}ms`,
                          }}
                        />
                      </span>
                    </button>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 4 · Library */}
      <section ref={library} className="section screen border-t-0" aria-labelledby="library">
        <div className="wrap">
          <Reveal>
            <SectionHeader id="library" label="Library" title="Every" soft="credential" />
          </Reveal>
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-card" />
          ) : certs.length === 0 ? (
            <Empty>Certifications will appear here soon.</Empty>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
                  {[{ cat: "All", color: "#f5f5f2", count: certs.length }, ...categories].map((a) => {
                    const on = category === a.cat;
                    return (
                      <button
                        key={a.cat}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setCategory(a.cat);
                          setLimit(PAGE);
                        }}
                        className={cn(
                          "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-sm transition-colors",
                          on
                            ? "border-transparent text-[rgb(17_17_19)]"
                            : "border-line-2 text-fg-2 hover:text-fg",
                        )}
                        style={on ? { background: a.color } : undefined}
                      >
                        {a.cat !== "All" && (
                          <span
                            className="size-2 rounded-full"
                            style={{ background: on ? "rgb(17 17 19)" : a.color }}
                          />
                        )}
                        {a.cat}
                        <span className="font-mono text-[11px] opacity-60">{a.count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="relative flex items-center sm:w-[320px]">
                    <span className="sr-only">Search certificates</span>
                    <Search aria-hidden className="pointer-events-none absolute left-3.5 size-4 text-fg-3" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setLimit(PAGE);
                      }}
                      placeholder="Search title, skill or issuer"
                      className="h-10 w-full rounded-full border border-line-2 bg-surface/60 pl-10 pr-4 text-sm text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
                    />
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-meta text-fg-3" aria-live="polite">
                      {filtered.length} shown
                    </span>
                    <div
                      className="flex rounded-full border border-line-2 p-1"
                      role="group"
                      aria-label="Sort"
                    >
                      {(["new", "az"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={sort === s}
                          onClick={() => setSort(s)}
                          className={cn(
                            "h-8 rounded-full px-3 text-sm transition-colors",
                            sort === s ? "bg-fg text-fg-inverse" : "text-fg-2 hover:text-fg",
                          )}
                        >
                          {s === "new" ? "Newest" : "A–Z"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {shown.length === 0 ? (
                <p className="mt-10 text-fg-3">Nothing matches that search.</p>
              ) : (
                <ul key={category + q + sort} className="mt-8 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((c, i) => {
                    const color = colorOf(c);
                    return (
                      <li
                        key={c.id}
                        className="animate-rise"
                        style={{ animationDelay: `${(i % PAGE) * 35}ms` }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpen(c)}
                          className="group flex h-full w-full flex-col gap-4 rounded-[20px] border border-line bg-surface/50 p-5 text-left transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:bg-surface"
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                        >
                          <span className="flex items-center justify-between gap-3">
                            <Mark src={c.issuer_logo} label={c.issuer} className="size-9" />
                            <span className="flex items-center gap-2 font-mono text-meta text-fg-3">
                              <span className="size-2 rounded-full" style={{ background: color }} />
                              {monthYear(c.issue_date)}
                            </span>
                          </span>
                          <span className="line-clamp-2 text-h4 font-medium leading-snug transition-colors group-hover:text-fg">
                            {c.title}
                          </span>
                          <span className="mt-auto flex flex-wrap gap-1.5">
                            {(c.skills ?? []).slice(0, 3).map((s) => (
                              <Tag key={s} className="h-6 px-2 text-[10px]">
                                {s}
                              </Tag>
                            ))}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {filtered.length > limit && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setLimit((n) => n + PAGE)}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-line-3 px-6 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                  >
                    Show more · {filtered.length - limit} left
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 5 · Skills earned */}
      {cloud.length > 4 && (
        <section className="section screen theme-light border-t-0" aria-labelledby="earned">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="earned" label="Skills earned" title="What all that" soft="added up to" />
            </Reveal>
            <Reveal>
              <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
                {cloud.map((s, i) => {
                  const weight = s.count / maxCount;
                  return (
                    <li key={s.name} className="animate-rise" style={{ animationDelay: `${i * 25}ms` }}>
                      <button
                        type="button"
                        onClick={() => focusLibrary("All", s.name)}
                        className="font-medium leading-tight tracking-[-0.02em] transition-colors hover:text-accent"
                        style={{
                          fontSize: `${1 + weight * 1.75}rem`,
                          color: weight > 0.5 ? "rgb(var(--fg))" : "rgb(var(--fg-2))",
                        }}
                        title={`${s.count} certificate${s.count > 1 ? "s" : ""}`}
                      >
                        {s.name}
                        <sup className="ml-0.5 font-mono text-[11px] font-normal text-fg-3">{s.count}</sup>
                        {onSkillsPage.has(skillKey(s.name)) && <span className="ml-1 text-accent">•</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-8 font-mono text-meta text-fg-3">
                Click a skill to see its certificates. <span className="text-accent">•</span> also on my{" "}
                <Link to="/skills" className="underline underline-offset-4 hover:text-fg">
                  skills page
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* 6 · Pace by year */}
      {byYear.length > 1 && (
        <section className="section screen border-t-0" aria-labelledby="pace">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="pace" label="Pace" title="Certificates" soft="by year" />
            </Reveal>
            <Reveal className="group flex h-[260px] items-end gap-3 border-b border-line-2 md:gap-6">
              {byYear.map(([y, n], i) => (
                <div key={y} className="flex h-full flex-1 flex-col items-center justify-end gap-3">
                  <span className="font-mono text-meta text-fg-2">{n}</span>
                  <span
                    className="w-full max-w-[72px] origin-bottom scale-y-0 rounded-t-[10px] bg-gradient-to-t from-accent/50 to-accent transition-transform duration-700 ease-out group-data-[in=true]:scale-y-100"
                    style={{ height: `${(n / maxYear) * 80}%`, transitionDelay: `${i * 120}ms` }}
                  />
                </div>
              ))}
            </Reveal>
            <div className="mt-3 flex gap-3 md:gap-6">
              {byYear.map(([y]) => (
                <span key={y} className="flex-1 text-center font-mono text-meta text-fg-3">
                  {y}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7 · Call to action */}
      <section className="pb-24">
        <div className="wrap">
          <Reveal className="flex flex-col items-start gap-6 rounded-[28px] bg-gradient-to-br from-accent to-[#ff8a3d] p-8 text-[rgb(17_17_19)] md:flex-row md:items-center md:justify-between md:p-12">
            <h2 className="text-display-m font-medium">
              See these skills <span className="font-light opacity-70">in action.</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="inline-flex h-[52px] items-center gap-2.5 rounded-full bg-[rgb(17_17_19)] px-6 text-[15px] font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                View projects <ArrowUpRight aria-hidden className="size-[18px]" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-[52px] items-center rounded-full border border-[rgb(17_17_19)]/30 px-6 text-[15px] font-medium transition-colors hover:bg-[rgb(17_17_19)]/10"
              >
                Let’s talk
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {open && <CertPanel cert={open} color={colorOf(open)} onClose={close} />}
    </Layout>
  );
};

export default CertificationsPage;
