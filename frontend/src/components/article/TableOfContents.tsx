import { useMemo, useState } from "react";
import { useActiveHeading } from "@/hooks/useActiveHeading";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentHeading } from "@/components/CmsContent";
import { groupByStage, hasNavigation, promptNumber, type ArticlePrompt } from "@/lib/prompts";

const linkCls = (activeNow: boolean) =>
  cn(
    "-ml-px block border-l py-1.5 pr-2 text-[0.9375rem] leading-snug transition-colors",
    activeNow ? "border-accent text-fg" : "border-transparent text-fg-3 hover:text-fg",
  );

function TocList({
  headings,
  active,
  onNavigate,
}: {
  headings: ContentHeading[];
  active: string | null;
  onNavigate?: () => void;
}) {
  return (
    <ol className="flex flex-col gap-1 border-l border-line-2">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={onNavigate}
            aria-current={active === h.id ? "location" : undefined}
            className={cn(linkCls(active === h.id), h.level === 3 ? "pl-7" : "pl-4")}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Numbered prompt links, grouped under their stage. */
function PromptList({
  prompts,
  active,
  onNavigate,
}: {
  prompts: ArticlePrompt[];
  active: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {groupByStage(prompts).map((group, gi) => (
        <div key={`${group.stage}-${gi}`}>
          {group.stage && <p className="mb-1.5 text-[13px] font-medium text-fg-2">{group.stage}</p>}
          <ol className="flex flex-col gap-0.5 border-l border-line-2">
            {group.items.map((p) => (
              <li key={p.id}>
                <a
                  href={`#${p.id}`}
                  onClick={onNavigate}
                  aria-current={active === p.id ? "location" : undefined}
                  className={cn(linkCls(active === p.id), "flex gap-2.5 pl-4")}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "font-mono text-[12px] leading-[1.6rem]",
                      active === p.id ? "text-accent" : "text-fg-3",
                    )}
                  >
                    {promptNumber(p.number)}
                  </span>
                  <span className="min-w-0">
                    <span className="sr-only">Prompt {promptNumber(p.number)}: </span>
                    {p.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

/**
 * Table of contents from the article's H2/H3s, plus its prompts (numbered,
 * grouped by stage) when it has any. `variant="sidebar"` is the sticky
 * desktop column; `variant="inline"` is a collapsible block for small
 * screens (and for the author's in-body TOC block).
 */
export function TableOfContents({
  headings,
  prompts = [],
  variant,
  className,
}: {
  headings: ContentHeading[];
  prompts?: ArticlePrompt[];
  variant: "sidebar" | "inline";
  className?: string;
}) {
  const tracked = useMemo(() => [...headings, ...prompts], [headings, prompts]);
  const active = useActiveHeading(tracked);
  const [open, setOpen] = useState(false);
  if (!hasNavigation(headings, prompts)) return null;
  const showHeadings = headings.length >= 2;

  const body = (onNavigate?: () => void) => (
    <>
      {showHeadings && <TocList headings={headings} active={active} onNavigate={onNavigate} />}
      {prompts.length > 0 && (
        <div className={cn(showHeadings && "mt-7")}>
          <p className="label mb-3 text-fg-3">Prompts · {prompts.length}</p>
          <PromptList prompts={prompts} active={active} onNavigate={onNavigate} />
        </div>
      )}
    </>
  );

  if (variant === "sidebar")
    return (
      <nav aria-label="Table of contents" className={className}>
        {showHeadings && <p className="label mb-4 text-fg-3">On this page</p>}
        {body()}
      </nav>
    );

  const summary = [
    showHeadings && `${headings.length} sections`,
    prompts.length > 0 && `${prompts.length} prompt${prompts.length === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <nav
      aria-label="Table of contents"
      className={cn("rounded-card border border-line-2 bg-surface", className)}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="label text-fg-2">On this page · {summary}</span>
        <ChevronDown
          aria-hidden
          className={cn("size-4 text-fg-3 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="max-h-[60vh] overflow-y-auto px-5 pb-4">{body(() => setOpen(false))}</div>}
    </nav>
  );
}
