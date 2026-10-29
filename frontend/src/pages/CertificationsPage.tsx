import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Empty, FilterPill, PageHeader, Skeleton, Stat } from "@/components/ui";
import { Mark, Row } from "@/components/cards";
import { useCertificates } from "@/hooks/useContent";
import { year } from "@/lib/format";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";

const PAGE = 24;

const CertificationsPage = () => {
  const { data = [], isLoading } = useCertificates();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const certs = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime(),
      ),
    [data],
  );
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of certs) if (c.category) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [certs]);
  const issuers = new Set(certs.map((c) => c.issuer).filter(Boolean)).size;

  const q = query.trim().toLowerCase();
  const shown = certs.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (!q || `${c.title} ${c.issuer} ${(c.skills ?? []).join(" ")}`.toLowerCase().includes(q)),
  );

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/certifications"].title}
        description={PAGE_SEO["/certifications"].description}
        url={`${BASE_URL}/certifications`}
      />
      <PageHeader
        label="Certificates"
        title="Always"
        soft="learning"
        aside={
          certs.length > 0 && (
            <div className="flex gap-14">
              <Stat value={certs.length} label="Certificates" />
              <Stat value={issuers} label="Issuers" />
            </div>
          )
        }
      >
        <div className="mt-12 flex flex-col gap-5 border-t border-line-2 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterPill active={category === "All"} onClick={() => setCategory("All")}>
              All · {certs.length}
            </FilterPill>
            {categories.map(([c, n]) => (
              <FilterPill key={c} active={category === c} onClick={() => setCategory(c)}>
                {c} · {n}
              </FilterPill>
            ))}
          </div>
          <label className="flex h-11 items-center gap-2.5 rounded-full border border-line-2 bg-surface px-4 lg:w-80">
            <Search aria-hidden className="size-4 text-fg-3" />
            <span className="sr-only">Search certificates</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${certs.length || ""} credentials`}
              className="w-full bg-transparent text-sm placeholder:text-fg-3 focus:outline-none"
            />
          </label>
        </div>
      </PageHeader>

      <section className="wrap pb-32">
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-card" />
        ) : shown.length === 0 ? (
          <Empty>No certificates match that search.</Empty>
        ) : (
          <>
            <div className="grid border-b border-line-2 md:grid-cols-2 md:gap-x-6">
              {shown.slice(0, limit).map((c) => (
                <Row
                  key={c.id}
                  to={`/certifications/${c.id}`}
                  mark={<Mark src={c.issuer_logo} label={c.issuer} />}
                  title={<span className="block text-[1rem] md:text-h4">{c.title}</span>}
                  sub={c.issuer}
                  trail={year(c.issue_date)}
                />
              ))}
            </div>
            {shown.length > limit && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => setLimit(limit + PAGE)}
                  className="h-[52px] rounded-full border border-line-3 px-6 font-medium hover:bg-surface-2"
                >
                  Show more · {shown.length - limit} left
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
};

export default CertificationsPage;
