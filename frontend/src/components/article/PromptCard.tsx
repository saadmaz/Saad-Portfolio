import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Copy, RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/clipboard";
import { fillVariables, promptNumber, type ArticlePrompt } from "@/lib/prompts";

const LANGUAGE_LABELS: Record<string, string> = {
  markdown: "Markdown",
  bash: "Bash",
  json: "JSON",
  yaml: "YAML",
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  sql: "SQL",
};

const btn =
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";

/** Host elements CmsContent inserts into a `[data-prompt]` block for this card. */
export interface PromptHosts {
  block: HTMLElement;
  /** The element holding the prompt text (`<pre>` or `.prompt-body`). */
  content: HTMLElement;
  head: HTMLElement;
  vars: HTMLElement;
  foot: HTMLElement;
}

/**
 * Reader UI for one prompt, rendered into the article's own markup so the
 * prompt text stays real, visible, indexable content. Adds the number,
 * title, badges and copy button; a fill-in panel for [VARIABLES] (copying
 * the customised or original text); and a collapse toggle for long prompts.
 */
export function PromptCard({ prompt, hosts }: { prompt: ArticlePrompt; hosts: PromptHosts }) {
  const { block, content, head, vars, foot } = hosts;
  const [values, setValues] = useState<Record<string, string>>({});
  const [customising, setCustomising] = useState(false);
  const [copied, setCopied] = useState<"custom" | "original" | null>(null);
  const [status, setStatus] = useState("");
  const timer = useRef<number>();
  const panelId = useId();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const filled = prompt.variables.some((v) => values[v]?.trim());
  const customText = fillVariables(prompt.text, values);

  // Live preview: variable marks in the prompt show what the reader typed.
  useEffect(() => {
    content.querySelectorAll<HTMLElement>("mark[data-var]").forEach((m) => {
      const name = m.dataset.var ?? "";
      const v = values[name]?.trim();
      m.textContent = v || `[${name}]`;
      m.classList.toggle("is-filled", !!v);
    });
  }, [content, values]);

  const copy = async (which: "custom" | "original") => {
    if (!(await copyText(which === "custom" ? customText : prompt.text))) {
      setStatus("Copy failed. Select the text and copy it manually.");
      return;
    }
    setCopied(which);
    setStatus(which === "custom" ? "Customised prompt copied to clipboard" : "Copied to clipboard");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => (setCopied(null), setStatus("")), 2200);
  };

  const language = LANGUAGE_LABELS[prompt.language];
  const copyLabel = filled ? "Copy customised" : "Copy prompt";

  return (
    <>
      {createPortal(
        <>
          <span className="prompt-num" aria-hidden>
            {promptNumber(prompt.number)}
          </span>
          <div className="prompt-main">
            {(prompt.stage || language) && (
              <div className="prompt-badges flex flex-wrap items-center gap-1.5 sm:mb-1">
                {prompt.stage && <span className="prompt-badge">{prompt.stage}</span>}
                {language && <span className="prompt-badge is-muted">{language}</span>}
              </div>
            )}
            <h3 className="prompt-title">
              <span className="sr-only">Prompt {promptNumber(prompt.number)}: </span>
              {prompt.title}
            </h3>
          </div>
          <div className="prompt-actions flex shrink-0 flex-wrap items-center justify-end gap-1">
            {prompt.variables.length > 0 && (
              <button
                type="button"
                aria-expanded={customising}
                aria-controls={panelId}
                onClick={() => setCustomising((c) => !c)}
                className={cn(
                  btn,
                  customising ? "bg-surface-2 text-fg" : "text-fg-2 hover:bg-surface-2 hover:text-fg",
                )}
              >
                <SlidersHorizontal aria-hidden className="size-3.5" />
                <span className="hidden sm:inline">Customise</span>
                <span className="sr-only sm:hidden">Customise variables</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => copy(filled ? "custom" : "original")}
              aria-label={`${copyLabel}: ${prompt.title}`}
              className={cn(
                btn,
                copied ? "bg-accent/[0.12] text-accent" : "bg-accent text-fg-inverse hover:bg-accent-hover",
              )}
            >
              {copied ? (
                <Check aria-hidden className="size-3.5" />
              ) : (
                <Copy aria-hidden className="size-3.5" />
              )}
              {copied ? "Copied" : filled ? "Copy customised" : "Copy"}
            </button>
          </div>
          <span className="sr-only" role="status" aria-live="polite">
            {status}
          </span>
        </>,
        head,
      )}

      {customising &&
        createPortal(
          <div id={panelId} className="prompt-vars-panel">
            <p className="text-[13px] text-fg-3">
              Fill in what applies to you. Blank fields keep their placeholder. Nothing you type leaves this
              page.
            </p>
            <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2">
              {prompt.variables.map((v) => (
                <VariableInput
                  key={v}
                  name={v}
                  value={values[v] ?? ""}
                  onChange={(val) => setValues((cur) => ({ ...cur, [v]: val }))}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => copy("custom")}
                disabled={!filled}
                className={cn(btn, "bg-accent text-fg-inverse hover:bg-accent-hover disabled:opacity-40")}
              >
                {copied === "custom" ? (
                  <Check aria-hidden className="size-3.5" />
                ) : (
                  <Copy aria-hidden className="size-3.5" />
                )}
                {copied === "custom" ? "Copied" : "Copy customised"}
              </button>
              <button
                type="button"
                onClick={() => copy("original")}
                className={cn(btn, "text-fg-2 hover:bg-surface-2 hover:text-fg")}
              >
                {copied === "original" ? (
                  <Check aria-hidden className="size-3.5" />
                ) : (
                  <Copy aria-hidden className="size-3.5" />
                )}
                {copied === "original" ? "Copied" : "Copy original"}
              </button>
              {filled && (
                <button
                  type="button"
                  onClick={() => setValues({})}
                  className={cn(btn, "text-fg-3 hover:text-fg")}
                >
                  <RotateCcw aria-hidden className="size-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>,
          vars,
        )}

      {createPortal(<CollapseToggle block={block} content={content} />, foot)}
    </>
  );
}

function VariableInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="font-mono text-[11px] uppercase tracking-wider text-fg-3">{name}</span>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={name.toLowerCase()}
        autoComplete="off"
        spellCheck
        className="h-10 rounded-lg border border-line-2 bg-base px-3 text-[0.9375rem] text-fg outline-none transition-colors placeholder:text-fg-3/60 focus:border-accent"
      />
    </label>
  );
}

/** "Show full prompt" toggle for long prompts; renders nothing when the prompt fits. */
function CollapseToggle({ block, content }: { block: HTMLElement; content: HTMLElement }) {
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    block.classList.add("is-collapsed");
    const tall = content.scrollHeight > content.clientHeight + 8;
    setOverflows(tall);
    if (!tall) block.classList.remove("is-collapsed");
    return () => block.classList.remove("is-collapsed");
  }, [block, content]);

  useLayoutEffect(() => {
    if (overflows) block.classList.toggle("is-collapsed", !open);
  }, [block, open, overflows]);

  if (!overflows) return null;
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => {
        setOpen((o) => !o);
        // Collapsing a long prompt would otherwise leave the reader far below it.
        if (open) block.scrollIntoView({ block: "start", behavior: "smooth" });
      }}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {open ? "Show less" : "Show full prompt"}
      <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", open && "rotate-180")} />
    </button>
  );
}
