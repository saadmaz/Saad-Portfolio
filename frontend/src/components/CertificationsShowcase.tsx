import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { Certificate } from "@/types";
import { Mark } from "@/components/cards";
import { monthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

const time = (c: Certificate) => {
  const t = new Date(c.issue_date).getTime();
  return Number.isNaN(t) ? 0 : t;
};

/** Field breakdown + featured credentials for the home page. */
export function CertificationsShowcase({ certs }: { certs: Certificate[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fields = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of certs) {
      const key = c.category?.trim() || "Other";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [certs]);
  const max = fields[0]?.[1] ?? 1;

  const featured = useMemo(
    () =>
      [...certs]
        .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || time(b) - time(a))
        .slice(0, 5),
    [certs],
  );

  const verifiable = certs.filter((c) => c.credential_url?.trim()).length;
  const issuers = new Set(certs.map((c) => c.issuer?.trim()).filter(Boolean)).size;

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-5">
      {/* By field */}
      <div className="flex flex-col rounded-media border border-line bg-surface/60 p-5 md:p-7">
        <p className="label text-fg-3">By field</p>
        <ul className="mt-[clamp(14px,2.6svh,24px)] flex flex-col gap-[clamp(10px,1.8svh,16px)]">
          {fields.map(([field, n], i) => (
            <li key={field} className={cn(i >= 4 && "hidden md:block")}>
              <div className="flex items-baseline justify-between gap-4 text-[15px]">
                <span className="truncate text-fg">{field}</span>
                <span className="font-mono text-meta text-fg-3">{n}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line-2">
                <div
                  className={cn(
                    "h-full origin-left rounded-full bg-gradient-to-r from-accent/60 to-accent",
                    inView ? "animate-fill-x" : "scale-x-0",
                  )}
                  style={{
                    width: `${(n / max) * 100}%`,
                    animationDelay: `${i * 110}ms`,
                    animationDuration: "900ms",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-[clamp(14px,2.4svh,20px)] font-mono text-meta text-fg-3">
          <span>
            <span className="text-fg">{verifiable}</span> verifiable online
          </span>
          <span>
            <span className="text-fg">{issuers}</span> issuers
          </span>
        </div>
      </div>

      {/* Featured */}
      <div className="rounded-media border border-line bg-surface/60 p-2 md:p-3">
        <p className="label px-3 pb-2 pt-3 text-fg-3 md:px-4 md:pt-4">Featured</p>
        <ul>
          {featured.map((c, i) => (
            <li
              key={c.id}
              className={cn(
                "group relative",
                i >= 3 && "hidden md:block",
                inView ? "animate-rise" : "opacity-0",
              )}
              style={{ animationDelay: `${150 + i * 80}ms` }}
            >
              <Link
                to={`/certifications/${c.id}`}
                className="flex items-center gap-4 rounded-xl px-3 py-[clamp(10px,1.8svh,14px)] pr-16 transition-colors duration-200 hover:bg-surface-2 sm:pr-32 md:px-4 md:pr-36"
              >
                <Mark src={c.issuer_logo} label={c.issuer || c.title} />
                <span className="min-w-0">
                  <span className="line-clamp-1 font-medium tracking-[-0.01em] text-fg">{c.title}</span>
                  <span className="mt-0.5 line-clamp-1 font-mono text-meta text-fg-3">
                    {[c.issuer, monthYear(c.issue_date)].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </Link>
              {c.credential_url?.trim() ? (
                <a
                  href={c.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Verify ${c.title} (opens in a new tab)`}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-full border border-line-2 p-2 sm:px-3 sm:py-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-fg-2 transition-colors duration-200 hover:border-accent/60 hover:text-accent md:right-4"
                >
                  <BadgeCheck className="size-3.5" aria-hidden />
                  <span className="hidden sm:inline">Verify</span>
                </a>
              ) : (
                <ArrowUpRight
                  className="pointer-events-none absolute right-5 top-1/2 size-4 -translate-y-1/2 text-fg-3 transition-colors group-hover:text-fg md:right-6"
                  aria-hidden
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
