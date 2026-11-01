import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API is blocked in some embedded/insecure contexts.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function PromptHeader({ block }: { block: HTMLElement }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const label = block.dataset.label?.trim() || "Prompt";
  const onCopy = async () => {
    const text = block.querySelector("pre")?.textContent ?? "";
    if (!(await copyText(text))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <span className="label truncate text-fg-3">{label}</span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium leading-none transition-colors duration-200",
          copied
            ? "border-accent/50 bg-accent/[0.12] text-accent"
            : "border-line-2 text-fg-2 hover:border-line-3 hover:bg-surface-2 hover:text-fg",
        )}
      >
        {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </>
  );
}

/**
 * Renders CMS HTML. Prompt blocks (`<div data-prompt data-label>…<pre>`) from
 * the admin editor get a label bar with a copy button.
 */
export function CmsContent({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<{ block: HTMLElement; host: HTMLElement }[]>([]);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const next = [...root.querySelectorAll<HTMLElement>("[data-prompt]")].map((block) => {
      const host = document.createElement("div");
      host.className = "prompt-bar";
      block.prepend(host);
      return { block, host };
    });
    setSlots(next);
    return () => next.forEach(({ host }) => host.remove());
  }, [html]);

  return (
    <>
      <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
      {slots.map(({ block, host }, i) => createPortal(<PromptHeader block={block} />, host, String(i)))}
    </>
  );
}
