/**
 * Newsletter sign-up through /api/subscribe (double opt-in).
 * The browser never touches the `subscribers` collection directly.
 */

export type NewsletterSeries = "founder" | "cse";

type Body =
  | { action: "subscribe"; email: string; topics: NewsletterSeries[]; website?: string; source?: string }
  | { action: "confirm" | "unsubscribe"; token: string };

async function post(body: Body): Promise<void> {
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
}

export const SubscribeService = {
  subscribe: (email: string, topics: NewsletterSeries[], extra: { website?: string; source?: string } = {}) =>
    post({ action: "subscribe", email, topics, ...extra }),
  confirm: (token: string) => post({ action: "confirm", token }),
  unsubscribe: (token: string) => post({ action: "unsubscribe", token }),
};
