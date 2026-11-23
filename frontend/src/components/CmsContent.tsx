import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { assignHeadingIds, sameText } from "@/lib/article-core";
import { sanitizeArticle, sanitizeHtmlBlock } from "@/lib/sanitize";
import { embedSrc, EMBED_PROVIDERS } from "@/lib/embeds";
import { Chart } from "@/components/article/Chart";
import { parseChartData, type ChartData } from "@/lib/chart";
import { copyText } from "@/lib/clipboard";
import { PROMPT_VARIABLE_RE, promptNumber, promptVariables, type ArticlePrompt } from "@/lib/prompts";
import { PromptCard, type PromptHosts } from "@/components/article/PromptCard";
import { VideoCard } from "@/components/article/VideoCard";
import { isBareUrl, youTubeId } from "@/lib/youtube";

export interface ContentHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** The element holding a block's text: `<pre>`, or `.prompt-body` for structured prompts. */
const contentOf = (block: HTMLElement) => block.querySelector<HTMLElement>(".prompt-body, pre");

/**
 * Plain-text version of a structured prompt, Markdown-flavoured so it pastes
 * cleanly into an AI chat: `## Heading`, `- item`, `1. item`, `---`.
 */
function promptText(body: Element): string {
  const clean = (s: string | null) => (s ?? "").replace(/\s+/g, " ").trim();
  const list = (el: Element, indent: string): string =>
    [...el.children]
      .filter((li) => li.tagName === "LI")
      .map((li, i) => {
        const marker = el.tagName === "OL" ? `${i + 1}.` : "-";
        const own = [...li.childNodes]
          .filter((n) => !(n instanceof Element && /^(UL|OL)$/.test(n.tagName)))
          .map((n) => n.textContent)
          .join(" ");
        const nested = [...li.children]
          .filter((c) => /^(UL|OL)$/.test(c.tagName))
          .map((c) => `\n${list(c, `${indent}  `)}`)
          .join("");
        return `${indent}${marker} ${clean(own)}${nested}`;
      })
      .join("\n");

  return [...body.children]
    .map((el) => {
      const heading = el.tagName.match(/^H([1-6])$/);
      if (heading) return `${"#".repeat(Number(heading[1]))} ${clean(el.textContent)}`;
      if (el.tagName === "UL" || el.tagName === "OL") return list(el, "");
      if (el.tagName === "HR") return "---";
      if (el.tagName === "PRE") return el.textContent ?? "";
      return clean(el.textContent);
    })
    .filter(Boolean)
    .join("\n\n");
}

/** Label + copy button bar shown above a code block. */
function CopyBar({ block, label }: { block: HTMLElement; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    const text = block.querySelector("pre")?.textContent ?? "";
    if (!(await copyText(text))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <span className="label min-w-0 truncate text-fg-3">{label}</span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied to clipboard" : label === "Code" ? "Copy code" : `Copy ${label} code`}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium leading-none transition-colors duration-200",
          copied ? "bg-accent/[0.12] text-accent" : "text-fg-2 hover:bg-surface-2 hover:text-fg",
        )}
      >
        {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}

/** `language-ts` → "ts"; plain code blocks are just "Code". */
function codeLabel(pre: HTMLElement) {
  const lang = pre.querySelector("code")?.className.match(/language-([\w+#-]+)/)?.[1];
  return lang && lang !== "plaintext" ? lang : "Code";
}

/** True when every bit of text in `el` sits inside an inline `<code>` (the whole block was marked as code). */
function isAllCode(el: Element) {
  if (el.tagName === "PRE" || el.hasAttribute("data-prompt") || !el.querySelector("code")) return false;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.textContent?.trim() && !n.parentElement?.closest("code")) return false;
  }
  return true;
}

/**
 * Prompts pasted into the editor and marked with inline code render as a
 * stack of separately-boxed lines. Merge each run of such blocks (paragraphs,
 * headings, lists, with dividers between them) into one prompt card that keeps
 * its structure; a single short line becomes a code block instead. Works on
 * clones and returns a function that restores the original DOM.
 */
function upgradeCodeRuns(root: HTMLElement) {
  const runs: Element[][] = [];
  let run: Element[] = [];
  const flush = () => {
    while (run.length && run[run.length - 1].tagName === "HR") run.pop();
    if (run.length) runs.push(run);
    run = [];
  };
  for (const el of [...root.children]) {
    if (isAllCode(el)) run.push(el);
    else if (el.tagName === "HR" && run.length) run.push(el);
    else flush();
  }
  flush();

  const undo = runs.map((els) => {
    let replacement: HTMLElement;
    const only = els[0];
    if (els.length === 1 && only.tagName === "P" && (only.textContent ?? "").length <= 160) {
      replacement = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = only.textContent;
      replacement.append(code);
    } else {
      replacement = document.createElement("div");
      replacement.dataset.prompt = "";
      replacement.dataset.label = "Prompt";
      const body = document.createElement("div");
      body.className = "prompt-body";
      for (const el of els) {
        const copy = el.cloneNode(true) as Element;
        copy.querySelectorAll("code").forEach((c) => c.replaceWith(...c.childNodes));
        body.append(copy);
      }
      replacement.append(body);
    }
    els[0].before(replacement);
    els.forEach((el) => el.remove());
    return () => replacement.replaceWith(...els);
  });
  return () => undo.reverse().forEach((fn) => fn());
}

type CodeSlot = { block: HTMLElement; host: HTMLElement; label: string; undo: () => void };
type PromptSlot = { prompt: ArticlePrompt; hosts: PromptHosts; undo: () => void };

/** Prompt languages that are code: shown monospaced and syntax-highlighted. */
const CODE_PROMPT_LANGUAGES = new Set(["bash", "json", "yaml", "typescript", "javascript", "python", "sql"]);

/** Wraps every [VARIABLE] in the prompt's text nodes in a <mark> (live fill-in preview). */
function markVariables(content: HTMLElement) {
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    PROMPT_VARIABLE_RE.lastIndex = 0;
    if (PROMPT_VARIABLE_RE.test(n.textContent ?? "")) nodes.push(n as Text);
  }
  PROMPT_VARIABLE_RE.lastIndex = 0;
  for (const node of nodes) {
    const text = node.textContent ?? "";
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(PROMPT_VARIABLE_RE)) {
      const at = m.index ?? 0;
      if (at > last) frag.append(text.slice(last, at));
      const mark = document.createElement("mark");
      mark.className = "prompt-var";
      mark.dataset.var = m[1];
      mark.textContent = m[0];
      frag.append(mark);
      last = at + m[0].length;
    }
    if (last < text.length) frag.append(text.slice(last));
    node.replaceWith(frag);
  }
}

/**
 * Turns each `[data-prompt]` block into a numbered, anchored prompt card:
 * reads its fields, adds hosts for <PromptCard>, marks variables and, for
 * code-language prompts, prepares syntax highlighting.
 */
function enhancePrompts(root: HTMLElement): PromptSlot[] {
  const taken = new Set([...root.querySelectorAll<HTMLElement>("[id]")].map((el) => el.id));
  return [...root.querySelectorAll<HTMLElement>("[data-prompt]")].flatMap((block, i): PromptSlot[] => {
    const content = contentOf(block);
    if (!content) return [];
    const before = content.innerHTML;
    const field = (name: string) => block.querySelector(`[data-prompt-${name}]`)?.textContent?.trim() ?? "";
    const text = content.tagName === "PRE" ? (content.textContent ?? "") : promptText(content);
    const number = i + 1;
    const language = block.dataset.language ?? "";
    const label = block.dataset.label?.trim();

    const hadId = !!block.id;
    if (!hadId) {
      let id = `prompt-${promptNumber(number)}`;
      for (let n = 2; taken.has(id); n++) id = `prompt-${promptNumber(number)}-${n}`;
      taken.add(id);
      block.id = id;
    }

    const isCode =
      CODE_PROMPT_LANGUAGES.has(language) && content.tagName === "PRE" && !content.children.length;
    if (isCode) {
      const code = document.createElement("code");
      code.className = `language-${language}`;
      code.textContent = text;
      content.replaceChildren(code);
      block.classList.add("is-code");
    } else {
      markVariables(content);
    }

    const make = (className: string) => {
      const el = document.createElement("div");
      el.className = className;
      return el;
    };
    const head = make("prompt-head");
    const vars = make("prompt-vars");
    const foot = make("prompt-foot");
    block.prepend(head);
    content.before(vars);
    content.after(foot);

    const prompt: ArticlePrompt = {
      id: block.id,
      number,
      title: label && label !== "Prompt" ? label : `Prompt ${promptNumber(number)}`,
      stage: block.dataset.stage?.trim() ?? "",
      language,
      text,
      description: field("description"),
      usage: field("usage"),
      note: field("note"),
      variables: promptVariables(text),
    };
    return [
      {
        prompt,
        hosts: { block, content, head, vars, foot },
        undo: () => {
          head.remove();
          vars.remove();
          foot.remove();
          content.innerHTML = before;
          block.classList.remove("is-code");
          if (!hadId) block.removeAttribute("id");
        },
      },
    ];
  });
}

type Extra =
  | { kind: "chart"; host: HTMLElement; chartType: "bar" | "line"; data: ChartData; title: string }
  | { kind: "carousel"; host: HTMLElement; track: HTMLElement }
  | { kind: "video"; host: HTMLElement; id: string; title: string }
  | { kind: "toc"; host: HTMLElement }
  | { kind: "sources"; host: HTMLElement };

/**
 * Articles often start with their own title (and subtitle) pasted into the
 * body; the page header already shows them. Hides that repeat so the title
 * isn't read twice and doesn't head the table of contents. Returns an undo.
 */
function hideRepeatedTitle(root: HTMLElement, title?: string, subtitle?: string) {
  const first = root.firstElementChild as HTMLElement | null;
  if (!first || !/^H[1-3]$/.test(first.tagName) || !sameText(first.textContent, title)) return () => {};
  const removed: Element[] = [first];
  const next = first.nextElementSibling;
  if (next?.tagName === "P" && subtitle && sameText(next.textContent, subtitle)) removed.push(next);
  removed.forEach((el) => el.remove());
  return () => root.prepend(...removed);
}

/** Wraps `el` in a new element and returns a function that unwraps it. */
function wrap(el: Element, className: string) {
  const wrapper = document.createElement("div");
  wrapper.className = className;
  el.replaceWith(wrapper);
  wrapper.append(el);
  return () => wrapper.replaceWith(el);
}

/** Scroll-snap carousel controls; the track itself works with touch/trackpad alone. */
function CarouselControls({ track }: { track: HTMLElement }) {
  const step = (dir: 1 | -1) => track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: "smooth" });
  const cls =
    "inline-flex size-9 items-center justify-center rounded-full border border-line-2 text-fg-2 transition-colors hover:border-line-3 hover:text-fg";
  return (
    <>
      <button type="button" className={cls} onClick={() => step(-1)} aria-label="Previous image">
        <ChevronLeft aria-hidden className="size-4" />
      </button>
      <button type="button" className={cls} onClick={() => step(1)} aria-label="Next image">
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </>
  );
}

/**
 * Enhances the CMS editor's structured blocks in place: heading ids, lazy
 * images, scrollable tables, trusted embeds, custom HTML, charts, carousels
 * and the inline TOC / sources placeholders. Returns extra portal slots and
 * an undo function.
 */
function enhanceBlocks(root: HTMLElement, onHeadings?: (h: ContentHeading[]) => void) {
  const undo: (() => void)[] = [];
  const extras: Extra[] = [];

  // Headings: stable ids for the TOC and deep links; author anchors win.
  const headingEls = [...root.querySelectorAll<HTMLElement>("h2, h3")];
  const reserved = [...root.querySelectorAll<HTMLElement>("[id]")]
    .filter((el) => !headingEls.includes(el))
    .map((el) => el.id);
  const ids = assignHeadingIds(
    headingEls.map((h) => ({ text: h.textContent ?? "", id: h.id || null })),
    reserved,
  );
  headingEls.forEach((h, i) => {
    if (!h.id) {
      h.id = ids[i];
      undo.push(() => h.removeAttribute("id"));
    }
  });
  onHeadings?.(
    headingEls
      .map((h, i) => ({
        id: ids[i],
        text: (h.textContent ?? "").trim(),
        level: (h.tagName === "H2" ? 2 : 3) as 2 | 3,
      }))
      .filter((h) => h.text),
  );

  // Images below the fold never block the first paint.
  root.querySelectorAll("img").forEach((img) => {
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    if (img.hasAttribute("srcset") && !img.hasAttribute("sizes"))
      img.setAttribute("sizes", "(min-width: 760px) 680px, 100vw");
  });

  // Tables scroll sideways on small screens instead of breaking the layout.
  root.querySelectorAll("table").forEach((table) => {
    if (!table.closest("[data-chart]")) undo.push(wrap(table, "table-wrap"));
  });

  // Embeds: iframes are rebuilt from provider + id, never taken from content.
  root.querySelectorAll<HTMLElement>("[data-embed]").forEach((fig) => {
    const provider = fig.dataset.provider ?? "";
    const src = embedSrc(provider, fig.dataset.embedId);
    if (!src) return;
    const frame = document.createElement("div");
    frame.className = "embed-frame";
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = fig.dataset.title || `${EMBED_PROVIDERS[provider]?.label ?? "Embedded"} content`;
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation allow-popups");
    iframe.allowFullscreen = true;
    frame.append(iframe);
    fig.prepend(frame);
    fig.classList.add("is-enhanced");
    undo.push(() => (frame.remove(), fig.classList.remove("is-enhanced")));
  });

  // Custom HTML blocks: stored escaped in data-html, sanitised strictly here.
  root.querySelectorAll<HTMLElement>("[data-html-block]").forEach((el) => {
    const before = el.innerHTML;
    el.innerHTML = sanitizeHtmlBlock(el.dataset.html ?? "");
    undo.push(() => (el.innerHTML = before));
  });

  // Charts: SVG over the fallback table, which stays for screen readers.
  root.querySelectorAll<HTMLElement>("[data-chart]").forEach((fig) => {
    const data = parseChartData(fig.dataset.chart);
    if (!data) return;
    const host = document.createElement("div");
    fig.prepend(host);
    const table = fig.querySelector("table");
    table?.classList.add("sr-only");
    extras.push({
      kind: "chart",
      host,
      data,
      chartType: fig.dataset.chartType === "line" ? "line" : "bar",
      title: fig.querySelector("figcaption")?.textContent?.trim() ?? "",
    });
    undo.push(() => (host.remove(), table?.classList.remove("sr-only")));
  });

  // Carousels: native scroll-snap plus previous/next buttons.
  root.querySelectorAll<HTMLElement>('[data-gallery][data-layout="carousel"]').forEach((track) => {
    const host = document.createElement("div");
    host.className = "carousel-controls";
    track.after(host);
    extras.push({ kind: "carousel", host, track });
    undo.push(() => host.remove());
  });

  // YouTube links: each video gets a thumbnail card (played in place) below
  // the block that links to it, once per article. A paragraph that is only a
  // pasted URL is replaced by its card. The link itself stays in the HTML.
  const embedded = new Set(
    [...root.querySelectorAll<HTMLElement>('[data-embed][data-provider="youtube"]')].map(
      (e) => e.dataset.embedId,
    ),
  );
  const lastHost = new Map<Element, Element>();
  root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
    if (a.closest("[data-embed], [data-prompt], pre, [data-resources], [data-html-block], [data-attachment]"))
      return;
    const id = youTubeId(a.getAttribute("href"));
    if (!id || embedded.has(id)) return;
    embedded.add(id);
    let block: Element = a;
    while (block.parentElement && block.parentElement !== root) block = block.parentElement;
    if (block.parentElement !== root) return;
    const text = (a.textContent ?? "").trim();
    const host = document.createElement("div");
    host.className = "video-host";
    (lastHost.get(block) ?? block).after(host);
    lastHost.set(block, host);
    const onlyUrl = block.tagName === "P" && isBareUrl(text) && (block.textContent ?? "").trim() === text;
    if (onlyUrl) (block as HTMLElement).hidden = true;
    extras.push({ kind: "video", host, id, title: isBareUrl(text) ? "" : text });
    undo.push(() => {
      host.remove();
      if (onlyUrl) (block as HTMLElement).hidden = false;
    });
  });

  // Placeholders the author dropped into the body.
  root.querySelectorAll<HTMLElement>("[data-toc]").forEach((host) => extras.push({ kind: "toc", host }));
  root
    .querySelectorAll<HTMLElement>("[data-sources]")
    .forEach((host) => extras.push({ kind: "sources", host }));

  return { extras, undo: () => undo.reverse().forEach((fn) => fn()) };
}

/** Lazy-loads highlight.js (article pages only) and colours declared-language code blocks. */
function highlightCode(root: HTMLElement) {
  const blocks = [...root.querySelectorAll<HTMLElement>('pre code[class*="language-"]')].filter(
    (code) =>
      !/language-(plaintext|text)\b/.test(code.className) && !code.closest("[data-prompt]:not(.is-code)"),
  );
  if (!blocks.length) return;
  import("highlight.js/lib/common")
    .then(({ default: hljs }) => {
      for (const code of blocks) {
        if (!code.isConnected || code.dataset.highlighted) continue;
        const lang = code.className.match(/language-([\w+#-]+)/)?.[1];
        if (lang && hljs.getLanguage(lang)) hljs.highlightElement(code);
      }
    })
    .catch(() => undefined);
}

interface CmsContentProps {
  html: string;
  className?: string;
  /** Headings found in the content (h2/h3), with the ids assigned to them. */
  onHeadings?: (headings: ContentHeading[]) => void;
  /** Prompt blocks found in the content, numbered in reading order. */
  onPrompts?: (prompts: ArticlePrompt[]) => void;
  /** The page's title and subtitle: a copy of them at the start of the body is hidden. */
  title?: string;
  subtitle?: string;
  /** Rendered where the author placed a "Table of contents" block. */
  toc?: ReactNode;
  /** Rendered where the author placed a "Sources & references" block. */
  sources?: ReactNode;
}

/**
 * Renders CMS HTML, sanitised. Prompt blocks (`<div data-prompt>…<pre>`) become
 * numbered prompt cards (<PromptCard>); code blocks (`<pre>`) get a label bar
 * with a copy button and their wrap / line-number options. The editor's other
 * structured blocks are enhanced by enhanceBlocks().
 */
export function CmsContent({
  html,
  className,
  onHeadings,
  onPrompts,
  title,
  subtitle,
  toc,
  sources,
}: CmsContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [codeSlots, setCodeSlots] = useState<CodeSlot[]>([]);
  const [promptSlots, setPromptSlots] = useState<PromptSlot[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const safeHtml = useMemo(() => sanitizeArticle(html), [html]);
  const headingsCb = useRef(onHeadings);
  const promptsCb = useRef(onPrompts);
  useEffect(() => {
    headingsCb.current = onHeadings;
    promptsCb.current = onPrompts;
  });

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const restoreLead = hideRepeatedTitle(root, title, subtitle);
    const restoreParagraphs = upgradeCodeRuns(root);
    const enhanced = enhanceBlocks(root, (h) => headingsCb.current?.(h));

    const prompts = enhancePrompts(root);
    promptsCb.current?.(prompts.map((p) => p.prompt));

    // Wrap each code block so the bar sits outside the horizontally-scrolling <pre>.
    const codes = [...root.querySelectorAll<HTMLElement>("pre")]
      .filter((pre) => !pre.closest("[data-prompt]"))
      .map((pre): CodeSlot => {
        const block = document.createElement("div");
        block.className = "code-block";
        const host = document.createElement("div");
        host.className = "code-bar";
        pre.replaceWith(block);
        block.append(host);
        // Line numbers sit in a gutter beside the code; wrapped lines can't line up with one.
        if (pre.hasAttribute("data-line-numbers") && !pre.hasAttribute("data-wrap")) {
          const scroll = document.createElement("div");
          scroll.className = "code-scroll";
          const gutter = document.createElement("div");
          gutter.className = "code-lines";
          gutter.setAttribute("aria-hidden", "true");
          const count = (pre.textContent ?? "").replace(/\n$/, "").split("\n").length;
          gutter.textContent = Array.from({ length: count }, (_, n) => n + 1).join("\n");
          scroll.append(gutter, pre);
          block.append(scroll);
        } else {
          block.append(pre);
        }
        return { block, host, label: codeLabel(pre), undo: () => block.replaceWith(pre) };
      });

    highlightCode(root);
    setPromptSlots(prompts);
    setCodeSlots(codes);
    setExtras(enhanced.extras);
    return () => {
      codes.forEach(({ undo }) => undo());
      prompts.forEach(({ undo }) => undo());
      enhanced.undo();
      restoreParagraphs();
      restoreLead();
    };
  }, [safeHtml, title, subtitle]);

  return (
    <>
      <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />
      {promptSlots.map(({ prompt, hosts }) => (
        <PromptCard key={prompt.id} prompt={prompt} hosts={hosts} />
      ))}
      {codeSlots.map(({ block, host, label }, i) => (
        <Fragment key={i}>{createPortal(<CopyBar block={block} label={label} />, host)}</Fragment>
      ))}
      {extras.map((x, i) => {
        const key = `x${i}`;
        if (x.kind === "chart")
          return (
            <Fragment key={key}>
              {createPortal(<Chart type={x.chartType} data={x.data} title={x.title} />, x.host)}
            </Fragment>
          );
        if (x.kind === "video")
          return (
            <Fragment key={key}>{createPortal(<VideoCard id={x.id} title={x.title} />, x.host)}</Fragment>
          );
        if (x.kind === "carousel")
          return <Fragment key={key}>{createPortal(<CarouselControls track={x.track} />, x.host)}</Fragment>;
        if (x.kind === "toc" && toc) return <Fragment key={key}>{createPortal(toc, x.host)}</Fragment>;
        if (x.kind === "sources" && sources)
          return <Fragment key={key}>{createPortal(sources, x.host)}</Fragment>;
        return null;
      })}
    </>
  );
}
