/**
 * Build-time data in the page, so content renders as soon as the app starts
 * instead of after the Firestore SDK loads and queries.
 *
 * scripts/prerender.mjs embeds, per route, the query results that page needs
 * (same shapes as the services return) in
 *   <script type="application/json" id="query-snapshot">{ builtAt, entries: [[queryKey, data], …] }</script>
 * They seed the TanStack Query cache, stamped with the build time: once that
 * is older than the cache's staleTime, the hooks still refetch live from
 * Firestore in the background, so CMS edits show without a rebuild.
 */

import type { QueryClient } from "@tanstack/react-query";

export const SNAPSHOT_ELEMENT_ID = "query-snapshot";

interface Snapshot {
  builtAt: number;
  entries: [readonly unknown[], unknown][];
}

/** The slice of Document this needs (structural, so it also type-checks without the DOM lib). */
interface DocLike {
  getElementById(id: string): { textContent: string | null; remove(): void } | null;
}

export function seedQueryCache(
  client: QueryClient,
  doc: DocLike | undefined = (globalThis as { document?: DocLike }).document,
): number {
  const el = doc?.getElementById(SNAPSHOT_ELEMENT_ID);
  if (!el?.textContent) return 0;
  try {
    const snap = JSON.parse(el.textContent) as Snapshot;
    const updatedAt = Number(snap.builtAt) || 0;
    let seeded = 0;
    for (const [key, data] of snap.entries ?? []) {
      if (!Array.isArray(key) || data === undefined) continue;
      client.setQueryData(key, data, { updatedAt });
      seeded++;
    }
    return seeded;
  } catch {
    // A malformed snapshot only costs the speed-up; the hooks fetch live as before.
    return 0;
  } finally {
    el.remove();
  }
}
