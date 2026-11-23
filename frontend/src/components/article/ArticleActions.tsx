import { useEffect, useRef, useState } from "react";
import { Check, ClipboardCopy, FileDown, Link2, Share, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyText, downloadText } from "@/lib/clipboard";
import {
  copyAllText,
  promptsFileName,
  promptsMarkdown,
  promptsText,
  type ArticlePrompt,
} from "@/lib/prompts";

const btn =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";
const quiet = "border-line-2 bg-base/40 text-fg-2 hover:border-line-3 hover:bg-surface-2 hover:text-fg";
const done = "border-accent/40 bg-accent/10 text-accent";

type Done = "all" | "link" | "md" | "txt" | null;

/**
 * Toolbar near the top of articles that contain prompts: copy every prompt
 * at once, download them as Markdown or plain text (built in the browser),
 * and share / copy the article link.
 */
export function ArticleActions({
  prompts,
  title,
  author,
  url,
  shareable = true,
  className,
}: {
  prompts: ArticlePrompt[];
  title: string;
  author?: string;
  url: string;
  shareable?: boolean;
  className?: string;
}) {
  const [doneWith, setDoneWith] = useState<Done>(null);
  const [status, setStatus] = useState("");
  const [canShare, setCanShare] = useState(false);
  const timer = useRef<number>();
  useEffect(() => setCanShare(typeof navigator !== "undefined" && "share" in navigator), []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!prompts.length) return null;
  const stages = new Set(prompts.map((p) => p.stage).filter(Boolean)).size;
  const meta = { title, author, url };

  const flash = (which: Done, message: string) => {
    setDoneWith(which);
    setStatus(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => (setDoneWith(null), setStatus("")), 2200);
  };

  const copyAll = async () => {
    if (await copyText(copyAllText(prompts)))
      flash("all", `All ${prompts.length} prompts copied to clipboard`);
    else setStatus("Copy failed. Try downloading the prompts instead.");
  };
  const copyLink = async () => {
    if (await copyText(url)) flash("link", "Link copied to clipboard");
  };
  const download = (ext: "md" | "txt") => {
    downloadText(
      promptsFileName(title, ext),
      ext === "md" ? promptsMarkdown(meta, prompts) : promptsText(meta, prompts),
      ext === "md" ? "text/markdown" : "text/plain",
    );
    flash(ext, `Downloaded ${prompts.length} prompts as ${ext === "md" ? "Markdown" : "text"}`);
  };

  const icon = (which: Done, Icon: typeof Link2) =>
    doneWith === which ? (
      <Check aria-hidden className="size-3.5" />
    ) : (
      <Icon aria-hidden className="size-3.5" />
    );

  return (
    <section
      aria-label="Prompt tools"
      className={cn(
        "flex flex-col gap-4 rounded-card border border-line-2 bg-surface/70 p-4 sm:p-5",
        className,
      )}
    >
      <p className="flex items-center gap-2.5 text-[0.9375rem] text-fg-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Sparkles aria-hidden className="size-4" />
        </span>
        <span>
          <span className="font-medium text-fg">{prompts.length}</span> copyable prompt
          {prompts.length === 1 ? "" : "s"}
          {stages > 1 && ` across ${stages} stages`}
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copyAll}
          className={cn(
            btn,
            doneWith === "all" ? done : "border-accent bg-accent text-fg-inverse hover:bg-accent-hover",
          )}
        >
          {icon("all", ClipboardCopy)}
          {doneWith === "all" ? "Copied" : prompts.length === 1 ? "Copy prompt" : "Copy all prompts"}
        </button>
        <button
          type="button"
          onClick={() => download("md")}
          className={cn(btn, doneWith === "md" ? done : quiet)}
        >
          {icon("md", FileDown)}
          <span>
            <span className="sr-only">Download prompts as </span>.md
          </span>
        </button>
        <button
          type="button"
          onClick={() => download("txt")}
          className={cn(btn, doneWith === "txt" ? done : quiet)}
        >
          {icon("txt", FileDown)}
          <span>
            <span className="sr-only">Download prompts as </span>.txt
          </span>
        </button>
        {shareable && canShare && (
          <button
            type="button"
            onClick={() => navigator.share?.({ title, url }).catch(() => undefined)}
            className={cn(btn, quiet)}
          >
            <Share aria-hidden className="size-3.5" />
            Share
          </button>
        )}
        {shareable && (
          <button type="button" onClick={copyLink} className={cn(btn, doneWith === "link" ? done : quiet)}>
            {icon("link", Link2)}
            {doneWith === "link" ? "Copied" : "Copy link"}
          </button>
        )}
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </section>
  );
}
