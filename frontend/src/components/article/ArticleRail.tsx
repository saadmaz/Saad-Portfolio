import { useEffect, useState, type RefObject } from "react";
import { Check, Link2 } from "lucide-react";
import { SocialIcon } from "@/components/brand/SocialLinks";
import { copyText } from "@/lib/clipboard";
import { shareLinks } from "@/lib/share";
import { cn } from "@/lib/utils";

/** Whole-number percentage of the article read (0–100). */
function useReadPercent(target: RefObject<HTMLElement>) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = target.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total <= 0 ? (r.top < 0 ? 1 : 0) : Math.min(1, Math.max(0, -r.top / total));
      setPct(Math.round(p * 100));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target]);
  return pct;
}

function useCopy(url: string) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (await copyText(url)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };
  return [copied, copy] as const;
}

const iconBtn =
  "flex size-10 items-center justify-center rounded-full border border-line-2 text-fg-3 transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent";

/**
 * Sticky left rail on wide screens (date, read %, share, copy link) and a
 * slim floating bar on smaller ones once reading has started.
 */
export function ArticleRail({
  target,
  url,
  title,
  date,
  shareable,
}: {
  target: RefObject<HTMLElement>;
  url: string;
  title: string;
  date?: string;
  shareable: boolean;
}) {
  const pct = useReadPercent(target);
  const [copied, copy] = useCopy(url);
  const d = date ? new Date(date) : null;
  const valid = d && !Number.isNaN(d.getTime());
  const links = shareLinks(url, title).filter((l) => l.id !== "whatsapp");

  return (
    <>
      <aside className="hidden xl:col-start-1 xl:row-start-1 xl:block">
        <div className="sticky top-28 flex w-16 flex-col items-center gap-6">
          {valid && (
            <time dateTime={date} className="flex flex-col items-center gap-1 text-center">
              <span className="text-h1 font-medium leading-none">{d.getDate()}</span>
              <span className="label text-fg-3">
                {d.toLocaleString("en-US", { month: "short" })} {d.getFullYear()}
              </span>
            </time>
          )}
          <span aria-hidden className="h-10 w-px bg-line-3" />
          <span className="font-mono text-meta tabular-nums text-accent" aria-label={`${pct}% read`}>
            {pct}%
          </span>
          {shareable && (
            <div className="flex flex-col gap-2.5">
              {links.map((l) => (
                <a
                  key={l.id}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${l.label}`}
                  className={iconBtn}
                >
                  <SocialIcon id={l.id} className="size-4" />
                </a>
              ))}
              <button type="button" onClick={copy} aria-label="Copy link" className={iconBtn}>
                {copied ? <Check className="size-4 text-live" /> : <Link2 className="size-4" />}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Phones and tablets: a floating pill appears once reading starts and leaves at the end. */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-[opacity,transform] duration-300 xl:hidden",
          pct > 0 && pct < 100 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        <div className="flex items-center gap-1.5 rounded-full border border-line-2 bg-surface/85 p-1.5 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.5)] backdrop-blur-xl">
          <span className="relative flex size-10 items-center justify-center">
            <svg aria-hidden viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(var(--ink) / 0.12)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="rgb(var(--accent))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={94.2}
                strokeDashoffset={94.2 * (1 - pct / 100)}
              />
            </svg>
            <span className="font-mono text-[10px] tabular-nums text-fg">{pct}</span>
          </span>
          {shareable &&
            links.map((l) => (
              <a
                key={l.id}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${l.label}`}
                className="flex size-10 items-center justify-center rounded-full text-fg-2 hover:text-accent"
              >
                <SocialIcon id={l.id} className="size-4" />
              </a>
            ))}
          {shareable && (
            <button
              type="button"
              onClick={copy}
              aria-label="Copy link"
              className="flex size-10 items-center justify-center rounded-full text-fg-2 hover:text-accent"
            >
              {copied ? <Check className="size-4 text-live" /> : <Link2 className="size-4" />}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
