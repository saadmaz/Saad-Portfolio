import { useState } from "react";
import { useActiveHeading } from "@/hooks/useActiveHeading";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentHeading } from "@/components/CmsContent";

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
            className={cn(
              "-ml-px block border-l py-1.5 pr-2 text-[0.9375rem] leading-snug transition-colors",
              h.level === 3 ? "pl-7" : "pl-4",
              active === h.id ? "border-accent text-fg" : "border-transparent text-fg-3 hover:text-fg",
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Table of contents from the article's H2/H3s. `variant="sidebar"` is the
 * sticky desktop column; `variant="inline"` is a collapsible block for small
 * screens (and for the author's in-body TOC block).
 */
export function TableOfContents({
  headings,
  variant,
  className,
}: {
  headings: ContentHeading[];
  variant: "sidebar" | "inline";
  className?: string;
}) {
  const active = useActiveHeading(headings);
  const [open, setOpen] = useState(false);
  if (headings.length < 2) return null;

  if (variant === "sidebar")
    return (
      <nav aria-label="Table of contents" className={className}>
        <p className="label mb-4 text-fg-3">On this page</p>
        <TocList headings={headings} active={active} />
      </nav>
    );

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
        <span className="label text-fg-2">On this page · {headings.length} sections</span>
        <ChevronDown
          aria-hidden
          className={cn("size-4 text-fg-3 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <TocList headings={headings} active={active} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </nav>
  );
}
