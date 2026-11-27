import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { SubscribeService, type NewsletterSeries } from "@/services/subscribe-service";
import { SERIES } from "@/lib/newsletter";
import { cn } from "@/lib/utils";

/**
 * Email sign-up for the newsletter. `compact` hides the series choice
 * (subscribes to both) for bands and footers.
 */
export function SubscribeForm({
  compact,
  source = "site",
  className,
  onAccent,
}: {
  compact?: boolean;
  source?: string;
  className?: string;
  /** On an orange band: an outlined button so it doesn't vanish into the background. */
  onAccent?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [topics, setTopics] = useState<NewsletterSeries[]>(["founder", "cse"]);
  const [error, setError] = useState("");
  const m = useMutation({
    mutationFn: () => SubscribeService.subscribe(email, topics, { website, source }),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S{2,}$/.test(email.trim())) return setError("Please enter a valid email");
    if (!topics.length) return setError("Pick at least one series");
    setError("");
    m.mutate();
  };

  if (m.isSuccess)
    return (
      <div
        role="status"
        className={cn(
          "flex items-start gap-3 rounded-2xl border border-live/30 bg-live/[0.08] p-4",
          className,
        )}
      >
        <MailCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-live" />
        <p className="text-sm">
          <span className="font-medium">Check your inbox.</span>{" "}
          <span className="text-fg-2">
            Click the link in the email to confirm. It may take a minute to arrive.
          </span>
        </p>
      </div>
    );

  const message = error || (m.isError ? (m.error as Error).message : "");
  return (
    <form onSubmit={submit} noValidate className={cn("flex flex-col gap-3", className)}>
      {!compact && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Series</legend>
          {SERIES.map((s) => {
            const on = topics.includes(s.id);
            return (
              <label
                key={s.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  on ? "border-fg/30 text-fg" : "border-line-2 text-fg-3",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => setTopics((t) => (on ? t.filter((x) => x !== s.id) : [...t, s.id]))}
                />
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ background: on ? s.color : "transparent", boxShadow: `0 0 0 1.5px ${s.color}` }}
                />
                {s.label}
              </label>
            );
          })}
        </fieldset>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`sub-${source}`}>
          Email address
        </label>
        <input
          id={`sub-${source}`}
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={!!message}
          className="h-12 min-w-0 shrink-0 rounded-full border border-line-2 sm:flex-1 sm:shrink bg-surface px-5 text-[1rem] text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
        />
        {/* Honeypot: hidden from people, bots fill it in. */}
        <input
          tabIndex={-1}
          aria-hidden
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute -left-[9999px]"
        />
        <Button
          type="submit"
          size="lg"
          variant={onAccent ? "secondary" : undefined}
          disabled={m.isPending}
          className={cn("h-12 shrink-0", onAccent && "border-fg/40")}
        >
          {m.isPending ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>
      {message && (
        <p className="font-mono text-meta text-danger" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
