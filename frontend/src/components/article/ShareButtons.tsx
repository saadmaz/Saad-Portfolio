import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { shareLinks } from "@/lib/share";

const pill =
  "inline-flex h-9 items-center gap-2 rounded-full border border-line-2 px-3.5 text-[13px] font-medium text-fg-2 transition-colors hover:border-line-3 hover:text-fg";

export function ShareButtons({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the share links still work.
    }
  };
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="label mr-1 text-fg-3">Share</span>
      {shareLinks(url, title).map((s) => (
        <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" className={pill}>
          {s.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
      <button type="button" onClick={copy} className={cn(pill, copied && "border-accent/40 text-accent")}>
        {copied ? <Check aria-hidden className="size-3.5" /> : <Link2 aria-hidden className="size-3.5" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
