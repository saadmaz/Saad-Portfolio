import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { REACTIONS } from "@/lib/article-core";
import { ReactionService } from "@/services/blog-service";
import { useReactionCounts } from "@/hooks/useBlog";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import type { ReactionCounts } from "@/types";

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

/** Anonymous reader reactions. The server is the source of truth for counts and duplicates. */
export function Reactions({ postId, disabled }: { postId: string; disabled?: boolean }) {
  const { data: counts = {} } = useReactionCounts(postId, !disabled);
  const qc = useQueryClient();
  const [reacted, setReacted] = useState<string[]>(() => readReacted(postId));
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  const toggle = async (id: string) => {
    if (disabled || pending) return;
    setPending(id);
    setError("");
    const was = reacted.includes(id);
    const key = queryKeys.blog.reactions(postId);
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
      qc.invalidateQueries({ queryKey: key });
      setError(err instanceof Error ? err.message : "Could not save your reaction");
    } finally {
      setPending(null);
    }
  };

  return (
    <section aria-labelledby="reactions-heading" className="flex flex-col gap-4">
      <h2 id="reactions-heading" className="label text-fg-3">
        Was this useful?
      </h2>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((r) => {
          const on = reacted.includes(r.id);
          const n = counts[r.id as keyof ReactionCounts] ?? 0;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={on}
              disabled={disabled || pending === r.id}
              onClick={() => toggle(r.id)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors disabled:opacity-60",
                on
                  ? "border-accent/50 bg-accent/[0.1] text-fg"
                  : "border-line-2 text-fg-2 hover:border-line-3 hover:text-fg",
              )}
            >
              <span aria-hidden>{r.emoji}</span>
              {r.label}
              {n > 0 && <span className="font-mono text-meta text-fg-3">{n}</span>}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
