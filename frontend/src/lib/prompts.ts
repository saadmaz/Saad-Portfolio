/**
 * Copyable prompts in articles: variable detection, fill-in, and the
 * "Copy all prompts" / download formats. Pure functions (no DOM) so they're
 * unit-tested and identical wherever they run.
 *
 * Variables are UPPERCASE placeholders in square brackets, e.g.
 * [PROJECT IDEA] or [TASK / FEATURE]. The pattern matches the admin's
 * src/shared/lib/prompts.ts so what the author sees detected is what readers
 * get as inputs. Markdown checkboxes ([ ], [x]), links ([text](url)),
 * lowercase brackets and single letters are never variables.
 */

export const PROMPT_VARIABLE_RE = /\[([A-Z][A-Z0-9 /&_.'-]{0,48}[A-Z0-9])\]/g;

/** Unique variable names in order of first appearance. */
export function promptVariables(text: string): string[] {
  const seen = new Set<string>();
  for (const m of text.matchAll(PROMPT_VARIABLE_RE)) seen.add(m[1]);
  return [...seen];
}

/** Replaces each filled-in variable; blanks keep their [PLACEHOLDER]. */
export function fillVariables(text: string, values: Record<string, string>): string {
  return text.replace(PROMPT_VARIABLE_RE, (whole, name: string) => {
    const v = values[name]?.trim();
    return v ? v : whole;
  });
}

export interface ArticlePrompt {
  /** Anchor id of the prompt card (for navigation). */
  id: string;
  /** 1-based position in the article. */
  number: number;
  title: string;
  stage: string;
  /** "" for a plain-language prompt, else a code language (markdown, bash…). */
  language: string;
  /** The exact prompt text, whitespace preserved. */
  text: string;
  description: string;
  usage: string;
  note: string;
  variables: string[];
}

/** 1 → "01". */
export const promptNumber = (n: number) => String(n).padStart(2, "0");

/** Runs of consecutive prompts sharing a stage, in article order. */
export function groupByStage<T extends { stage: string }>(prompts: T[]): { stage: string; items: T[] }[] {
  const groups: { stage: string; items: T[] }[] = [];
  for (const p of prompts) {
    const last = groups[groups.length - 1];
    if (last && last.stage === p.stage) last.items.push(p);
    else groups.push({ stage: p.stage, items: [p] });
  }
  return groups;
}

/**
 * Every prompt in the article as one paste-ready block:
 *
 *   # Stage 1: Planning
 *
 *   ## Prompt 01: PRD Creation
 *
 *   <prompt>
 *
 *   ---
 */
export function copyAllText(prompts: ArticlePrompt[]): string {
  const out: string[] = [];
  for (const group of groupByStage(prompts)) {
    if (group.stage) out.push(`# ${group.stage}`);
    for (const p of group.items) {
      out.push(`## Prompt ${promptNumber(p.number)}: ${p.title}`, p.text, "---");
    }
  }
  return out.join("\n\n") + "\n";
}

/** A code fence longer than any backtick run inside the text, so prompts containing ``` stay intact. */
function fence(text: string): string {
  const longest = Math.max(2, ...[...text.matchAll(/`+/g)].map((m) => m[0].length));
  return "`".repeat(longest + 1);
}

export interface PromptExportMeta {
  title: string;
  author?: string;
  url?: string;
}

/** Markdown download: article title + author, stages as H2, numbered prompts as H3, prompts fenced verbatim. */
export function promptsMarkdown(meta: PromptExportMeta, prompts: ArticlePrompt[]): string {
  const out: string[] = [`# ${meta.title}`];
  const byline = [meta.author && `By ${meta.author}`, meta.url && `<${meta.url}>`]
    .filter(Boolean)
    .join(" · ");
  if (byline) out.push(byline);
  for (const group of groupByStage(prompts)) {
    if (group.stage) out.push(`## ${group.stage}`);
    for (const p of group.items) {
      const level = group.stage ? "###" : "##";
      out.push(`${level} Prompt ${promptNumber(p.number)}: ${p.title}`);
      if (p.description) out.push(p.description);
      const f = fence(p.text);
      out.push(`${f}${p.language}\n${p.text}\n${f}`);
      if (p.usage) out.push(`**How to use:** ${p.usage}`);
      if (p.note) out.push(`**Note:** ${p.note}`);
    }
  }
  return out.join("\n\n") + "\n";
}

/** Plain-text download: same structure without Markdown syntax; prompt text untouched. */
export function promptsText(meta: PromptExportMeta, prompts: ArticlePrompt[]): string {
  const rule = "=".repeat(60);
  const out: string[] = [meta.title.toUpperCase()];
  if (meta.author) out.push(`By ${meta.author}`);
  if (meta.url) out.push(meta.url);
  for (const group of groupByStage(prompts)) {
    if (group.stage) out.push(`${rule}\n${group.stage.toUpperCase()}\n${rule}`);
    for (const p of group.items) {
      const head = `PROMPT ${promptNumber(p.number)}: ${p.title}`;
      const parts = [`${head}\n${"-".repeat(head.length)}`];
      if (p.description) parts.push(p.description);
      parts.push(p.text);
      if (p.usage) parts.push(`How to use: ${p.usage}`);
      if (p.note) parts.push(`Note: ${p.note}`);
      out.push(parts.join("\n\n"));
    }
  }
  return out.join("\n\n") + "\n";
}

/** "My Article: Part 2" → "my-article-part-2-prompts". */
export function promptsFileName(title: string, ext: "md" | "txt"): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return `${base || "article"}-prompts.${ext}`;
}

/** Whether an article has enough to navigate: two sections, or any prompt. */
export const hasNavigation = (headings: unknown[], prompts: unknown[] = []) =>
  headings.length >= 2 || prompts.length > 0;

/**
 * Section headings that only repeat a prompt's title ("Prompt 01: PRD"
 * above the PRD prompt) are dropped from navigation, which lists the
 * prompts themselves; every other heading stays.
 */
export function withoutPromptHeadings<T extends { text: string }>(
  headings: T[],
  prompts: { title: string }[],
): T[] {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const titles = prompts.map((p) => norm(p.title)).filter((t) => t.length >= 3);
  if (!titles.length) return headings;
  return headings.filter((h) => {
    const text = norm(h.text);
    return !titles.some((t) => text === t || text.endsWith(` ${t}`));
  });
}
