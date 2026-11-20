import { useEffect, useState, type CSSProperties } from "react";
import { Check, Link2, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { shareLinks } from "@/lib/share";
import { BRAND_COLORS, type BrandId } from "@/lib/brand-icons";
import { SocialIcon } from "@/components/brand/SocialLinks";

/** Hex → "r g b" so the brand colour can be used at any opacity. */
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

const round =
  "relative flex size-11 items-center justify-center rounded-full border border-line-2 bg-base/40 text-fg-2 transition-[color,background-color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95";

/**
 * Brand-mark share buttons. Each lights up in its network's colour on
 * hover; X stays monochrome. On devices with a native share sheet a
 * "Share" button opens it with the title and link pre-filled.
 */
export function ShareButtons({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  useEffect(() => setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked: the share links still work.
    }
  };

  const nativeShare = () => navigator.share?.({ title, url }).catch(() => undefined);

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <p className="text-[0.9375rem] text-fg-2">Share this article</p>
      <ul className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {shareLinks(url, title).map((s) => {
          const color = BRAND_COLORS[s.id as BrandId];
          const style = color
            ? ({ "--brand": rgb(color) } as CSSProperties)
            : ({ "--brand": "237 237 234" } as CSSProperties);
          return (
            <li key={s.id}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`Share on ${s.label}`}
                aria-label={`Share on ${s.label} (opens in a new tab)`}
                style={style}
                className={cn(
                  round,
                  "hover:border-[rgb(var(--brand)/0.45)] hover:bg-[rgb(var(--brand)/0.12)] hover:text-[rgb(var(--brand))] focus-visible:text-[rgb(var(--brand))]",
                )}
              >
                <SocialIcon id={s.id as BrandId} className="size-[18px]" />
              </a>
            </li>
          );
        })}
        <li className="sm:ml-1.5">
          <button
            type="button"
            onClick={copy}
            className={cn(
              "inline-flex size-11 items-center justify-center gap-2 rounded-full border text-[13px] font-medium transition-colors duration-200 sm:w-auto sm:px-4",
              copied
                ? "border-live/40 bg-live/10 text-live"
                : "border-line-2 bg-base/40 text-fg-2 hover:border-line-3 hover:bg-surface-2 hover:text-fg",
            )}
          >
            <span className="relative size-4" aria-hidden>
              <Link2
                className={cn(
                  "absolute inset-0 size-4 transition-all duration-200",
                  copied ? "scale-50 opacity-0" : "scale-100 opacity-100",
                )}
              />
              <Check
                className={cn(
                  "absolute inset-0 size-4 transition-all duration-200",
                  copied ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
              />
            </span>
            <span aria-live="polite" className="sr-only sm:not-sr-only">
              {copied ? "Link copied" : "Copy link"}
            </span>
          </button>
        </li>
        {canNativeShare && (
          <li className="sm:hidden">
            <button
              type="button"
              onClick={nativeShare}
              aria-label="More sharing options"
              className={cn(round, "hover:text-fg")}
            >
              <Share className="size-[18px]" aria-hidden />
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
