import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, Lightbulb, Sparkles, ThumbsUp, type LucideIcon } from "lucide-react";
import { REACTIONS } from "@/lib/article-core";
import { ReactionService } from "@/services/blog-service";
import { useReactionCounts } from "@/hooks/useBlog";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import type { ReactionCounts } from "@/types";

/** Drawn icons in the site's icon set (never emoji). */
const ICONS: Record<string, LucideIcon> = {
  helpful: ThumbsUp,
  insightful: Lightbulb,
  interesting: Sparkles,
  loved: Heart,
};

const storageKey = (postId: string) => `reacted:${postId}`;

function readReacted(postId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(postId)) ?? "[]");
  } catch {
    return [];
  }
}

function writeReacted(postId: string, ids: string[]) {
  try {
    localStorage.setItem(storageKey(postId), JSON.stringify(ids));
  } catch {
    // Private mode: the server still de-duplicates.
  }
}

/**
 * Anonymous reader reactions as four tiles. Counts update optimistically
 * and settle to the server's numbers; the server prevents duplicates.
 */
export function Reactions({ postId, disabled }: { postId: string; disabled?: boolean }) {
  const { data: counts = {} } = useReactionCounts(postId, !disabled);
  const qc = useQueryClient();
  const [reacted, setReacted] = useState<string[]>(() => readReacted(postId));
  const [pending, setPending] = useState<string | null>(null);
  const [popped, setPopped] = useState<string | null>(null);
  const [error, setError] = useState("");
  const count = (id: string) => Math.max(0, counts[id as keyof ReactionCounts] ?? 0);
  const total = REACTIONS.reduce((n, r) => n + count(r.id), 0);

  const toggle = async (id: string) => {
    if (disabled || pending) return;
    setPending(id);
    setError("");
    const was = reacted.includes(id);
    if (!was) {
      setPopped(id);
      window.setTimeout(() => setPopped(null), 450);
    }
    const key = queryKeys.blog.reactions(postId);
    const optimistic = was ? reacted.filter((r) => r !== id) : [...reacted, id];
    setReacted(optimistic);
    qc.setQueryData<ReactionCounts>(key, (c = {}) => ({
      ...c,
      [id]: Math.max(0, (c[id as keyof ReactionCounts] ?? 0) + (was ? -1 : 1)),
    }));
    try {
      const res = await ReactionService.toggle(postId, id);
      qc.setQueryData(key, res.counts);
      const next = res.reacted ? [...new Set([...reacted, id])] : reacted.filter((r) => r !== id);
      setReacted(next);
      writeReacted(postId, next);
    } catch (err) {
      setReacted(reacted);
      qc.invalidateQueries({ queryKey: key });
      setError(err instanceof Error ? err.message : "Could not save your reaction");
    } finally {
      setPending(null);
    }
  };

  return (
    <section aria-labelledby="reactions-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="reactions-heading" className="text-h4 font-medium">
          Was this useful?
        </h2>
        <p className="text-sm text-fg-3" aria-live="polite">
          {disabled
            ? "Reactions open once the article is live"
            : total > 0
              ? `${total.toLocaleString()} ${total === 1 ? "reaction" : "reactions"} so far`
              : "Be the first to react"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {REACTIONS.map((r) => {
          const Icon = ICONS[r.id] ?? ThumbsUp;
          const on = reacted.includes(r.id);
          const n = count(r.id);
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={on}
              aria-label={`${r.label}${n ? `, ${n}` : ""}`}
              disabled={disabled || pending === r.id}
              onClick={() => toggle(r.id)}
              className={cn(
                "group relative flex h-[88px] flex-col justify-between overflow-hidden rounded-[14px] border p-3.5 text-left transition-[background-color,border-color,transform,box-shadow] duration-200 ease-out",
                "active:scale-[0.97] disabled:cursor-default disabled:opacity-60",
                on
                  ? "border-accent/45 bg-accent/[0.09] shadow-[0_6px_20px_-12px_rgb(var(--accent)/0.7)]"
                  : "border-line-2 bg-base/40 hover:-translate-y-0.5 hover:border-line-3 hover:bg-surface-2",
              )}
            >
              <Icon
                aria-hidden
                strokeWidth={1.75}
                className={cn(
                  "size-5 transition-colors duration-200",
                  on ? "fill-accent/25 text-accent" : "text-fg-3 group-hover:text-fg",
                  on && r.id === "loved" && "fill-accent",
                  popped === r.id && "animate-react-pop",
                )}
              />
              <span className="flex w-full items-end justify-between gap-2">
                <span
                  className={cn(
                    "text-[0.9375rem] leading-none",
                    on ? "text-fg" : "text-fg-2 group-hover:text-fg",
                  )}
                >
                  {r.label}
                </span>
                {n > 0 && (
                  <span
                    key={n}
                    className={cn(
                      "animate-count-in font-mono text-meta leading-none tabular-nums",
                      on ? "text-accent" : "text-fg-3",
                    )}
                  >
                    {n.toLocaleString()}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
