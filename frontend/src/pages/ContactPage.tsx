import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Hammer,
  Mic,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Eyebrow, Field, FilterPill, Reveal, RisingWords } from "@/components/ui";
import { useContactMutation, useContactSettings, useEvents } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { CONTACT } from "@/lib/site";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { PAGE_SEO, BASE_URL, CONTACT_FAQ, CONTACT_PAGE_SCHEMA, CONTACT_SERVICES } from "@/lib/seo-content";
import { copyText } from "@/lib/clipboard";
import { eventStats } from "@/lib/eventStats";
import {
  BUDGETS,
  MESSAGE_MAX,
  TIMELINES,
  TOPICS,
  composeMessage,
  topicFromQuery,
  type Topic,
} from "@/lib/contactForm";
import { cn } from "@/lib/utils";
import type { ContactSettings } from "@/types";

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: CONTACT_FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const TOPIC_ICONS: Record<Topic["id"], LucideIcon> = {
  build: Hammer,
  ai: Bot,
  speaking: Mic,
  hosting: Sparkles,
  other: MessageCircle,
};

const STATUS: Record<
  NonNullable<ContactSettings["status"]>,
  { dot: string; text: string; fallback: string }
> = {
  available: {
    dot: "bg-live shadow-[0_0_10px_rgb(74_222_128/0.7)]",
    text: "text-live",
    fallback: "Available for new projects",
  },
  limited: {
    dot: "bg-[#f5a524] shadow-[0_0_10px_rgb(245_165_36/0.7)]",
    text: "text-[#f5a524]",
    fallback: "Limited availability",
  },
  booked: { dot: "bg-danger", text: "text-danger", fallback: "Fully booked right now" },
};

const STEPS = [
  { title: "I reply", body: "A real answer from me, not an autoresponder." },
  { title: "Short call", body: "15–30 minutes to understand the goal, constraints and timeline." },
  { title: "Plan & go", body: "A clear proposal for builds, or a confirmed brief for events." },
];

/** Live clock for Colombo so visitors know when a reply is likely. */
function useColomboTime() {
  const fmt = useMemo(
    () => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Colombo" }),
    [],
  );
  const [now, setNow] = useState(() => fmt.format(new Date()));
  useEffect(() => {
    const t = setInterval(() => setNow(fmt.format(new Date())), 30_000);
    return () => clearInterval(t);
  }, [fmt]);
  return now;
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex items-center gap-3">
      <a href={`mailto:${CONTACT.email}`} className="hover:text-accent">
        {CONTACT.email}
      </a>
      <button
        type="button"
        onClick={async () => {
          if (await copyText(CONTACT.email)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }
        }}
        aria-label={copied ? "Email copied" : "Copy email address"}
        className="inline-flex size-8 items-center justify-center rounded-full border border-line-2 text-fg-3 transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? <Check className="size-3.5 text-live" /> : <Copy className="size-3.5" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </span>
  );
}

const EMPTY = { name: "", email: "", message: "", website: "", eventDate: "", audience: "" };

const ContactPage = () => {
  const { search } = useLocation();
  const [topic, setTopic] = useState<Topic>(() => topicFromQuery(search));
  const [form, setForm] = useState(EMPTY);
  const [budget, setBudget] = useState(BUDGETS[3]);
  const [timeline, setTimeline] = useState(TIMELINES[3]);
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const mutation = useContactMutation();
  const { data: settings } = useContactSettings();
  const { data: events = [] } = useEvents();
  const { data: projects = [] } = useProjects();
  const time = useColomboTime();

  useEffect(() => setTopic(topicFromQuery(search)), [search]);

  const status = STATUS[settings?.status ?? "available"];
  const replyTime = settings?.reply_time?.trim() || "within a day";
  const ev = eventStats(events);

  const set = (k: keyof typeof EMPTY) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Please add your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Please add a valid email";
    if (form.message.trim().length < 10) next.message = "A sentence or two helps (10+ characters)";
    setErrors(next);
    if (Object.keys(next).length) return;
    const { subject, message } = composeMessage({
      topic,
      budget,
      timeline,
      eventDate: form.eventDate,
      audience: form.audience,
      message: form.message,
    });
    mutation.mutate(
      { name: form.name, email: form.email, website: form.website, subject, message },
      { onSuccess: () => setForm(EMPTY) },
    );
  };

  const proof = [
    { to: "/projects", meta: projects.length ? `${projects.length} projects shipped` : "See projects" },
    { to: "/projects", meta: "AI tools & integrations" },
    {
      to: "/events",
      meta: ev.count
        ? `${ev.count} events${ev.audience ? ` · ${ev.audience.toLocaleString("en-US")}+ people` : ""}`
        : "See events",
    },
  ];

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/contact"].title}
        description={PAGE_SEO["/contact"].description}
        url={`${BASE_URL}/contact`}
        structuredData={[FAQ_SCHEMA, CONTACT_PAGE_SCHEMA]}
        breadcrumbs={[{ name: "Contact", url: `${BASE_URL}/contact` }]}
      />
      <section className="relative -mt-[72px] flex min-h-[100svh] flex-col justify-center overflow-hidden pt-[72px] lg:-mt-[88px] lg:pt-[88px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_10%_20%,rgb(255_95_0/0.14),transparent_70%)]"
        />
        <div className="wrap relative grid gap-16 pb-16 pt-12 lg:grid-cols-[1fr_560px] lg:gap-24 lg:pb-8 lg:pt-2">
          <div className="flex flex-col gap-8">
            <div className="animate-rise">
              <Eyebrow>Contact</Eyebrow>
            </div>
            <h1 className="text-display-m font-medium xl:text-display-l">
              <RisingWords text="Let’s build" />{" "}
              <RisingWords text="something good." from={2} className="soft" />
            </h1>
            <span className="inline-flex w-fit animate-rise items-center gap-2.5 rounded-full border border-line-2 bg-surface/60 px-4 py-2 text-sm [animation-delay:250ms]">
              <span aria-hidden className={cn("size-2 rounded-full", status.dot)} />
              <span className={status.text}>{settings?.message?.trim() || status.fallback}</span>
              <span className="text-fg-3">· replies {replyTime}</span>
            </span>
            <p className="max-w-[520px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
              Product builds, AI integrations, speaking and hosting. Tell me what you’re working on and I’ll
              get back to you {replyTime}.
            </p>
            <dl className="animate-rise border-b border-line-2 [animation-delay:450ms]">
              {[
                ["Email", <CopyEmail key="e" />],
                [
                  "Phone",
                  <a key="p" href={CONTACT.phoneHref} className="hover:text-accent">
                    {CONTACT.phone}
                  </a>,
                ],
                [
                  "Based in",
                  <span key="l">
                    {CONTACT.location}
                    <span className="ml-2 font-mono text-meta text-fg-3">{time} local</span>
                  </span>,
                ],
                ["Elsewhere", <SocialLinks key="s" size="sm" />],
              ].map(([k, v]) => (
                <div
                  key={k as string}
                  className="flex flex-col gap-1.5 border-t border-line-2 py-5 sm:flex-row sm:items-center sm:gap-0"
                >
                  <dt className="label text-fg-3 sm:w-36">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="h-fit animate-rise rounded-[28px] border border-line bg-surface p-6 [animation-delay:200ms] md:p-10">
            {mutation.isSuccess ? (
              <div className="flex flex-col items-start gap-6 py-6">
                <CheckCircle2 aria-hidden className="size-12 animate-rise text-live" />
                <h2 className="text-h2 font-medium">Message sent.</h2>
                <p className="text-fg-2">Thanks for reaching out. Here’s what happens next:</p>
                <ol className="flex flex-col gap-3">
                  {STEPS.map((s, i) => (
                    <li key={s.title} className="flex gap-3">
                      <span className="font-mono text-meta text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="font-medium">{s.title}</span>
                        <span className="text-fg-2"> {i === 0 ? `${replyTime}.` : `- ${s.body}`}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <Button variant="secondary" icon={false} onClick={() => mutation.reset()}>
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-6">
                <h2 className="text-h3 font-medium">What can I help with?</h2>
                <fieldset>
                  <legend className="sr-only">Topic</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {TOPICS.map((t) => {
                      const Icon = TOPIC_ICONS[t.id];
                      const active = topic.id === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setTopic(t)}
                          className={cn(
                            "flex flex-col items-start gap-3 rounded-2xl border p-4 text-left text-sm transition-colors",
                            active
                              ? "border-accent bg-accent/[0.08] text-fg"
                              : "border-line-2 text-fg-2 hover:border-fg/30 hover:text-fg",
                          )}
                        >
                          <Icon aria-hidden className={cn("size-5", active ? "text-accent" : "text-fg-3")} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Jane Perera"
                    autoComplete="name"
                    maxLength={100}
                    error={errors.name}
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="jane@company.com"
                    autoComplete="email"
                    maxLength={254}
                    error={errors.email}
                  />
                </div>
                {topic.kind === "build" && (
                  <div key="build" className="flex animate-rise flex-col gap-6 [animation-duration:300ms]">
                    {[
                      ["Budget", BUDGETS, budget, setBudget],
                      ["Timeline", TIMELINES, timeline, setTimeline],
                    ].map(([label, opts, value, setter]) => (
                      <fieldset key={label as string} className="flex flex-col gap-3">
                        <legend className="label mb-3 text-fg-3">{label as string}</legend>
                        <div className="flex flex-wrap gap-2">
                          {(opts as string[]).map((o) => (
                            <FilterPill
                              key={o}
                              active={value === o}
                              onClick={() => (setter as (v: string) => void)(o)}
                            >
                              {o}
                            </FilterPill>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                )}
                {topic.kind === "event" && (
                  <div
                    key="event"
                    className="grid animate-rise gap-4 [animation-duration:300ms] sm:grid-cols-2"
                  >
                    <Field
                      label="Event date"
                      name="eventDate"
                      value={form.eventDate}
                      onChange={set("eventDate")}
                      placeholder="e.g. 14 March 2026"
                      maxLength={60}
                    />
                    <Field
                      label="Expected audience"
                      name="audience"
                      value={form.audience}
                      onChange={set("audience")}
                      placeholder="e.g. 300 people"
                      maxLength={60}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Field
                    label={topic.kind === "event" ? "About the event" : "Details"}
                    name="message"
                    value={form.message}
                    onChange={set("message")}
                    placeholder={
                      topic.kind === "event"
                        ? "The event, the format and what you need from me"
                        : "What you’re building, where it’s at and what you need"
                    }
                    multiline
                    maxLength={MESSAGE_MAX}
                    error={errors.message}
                  />
                  <span
                    className={cn(
                      "self-end font-mono text-meta",
                      form.message.length > MESSAGE_MAX * 0.9 ? "text-accent" : "text-fg-3",
                    )}
                  >
                    {form.message.length}/{MESSAGE_MAX}
                  </span>
                </div>
                {/* Honeypot: hidden from people, bots fill it in. */}
                <label className="absolute -left-[9999px]" aria-hidden>
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => set("website")(e.target.value)}
                  />
                </label>
                {mutation.isError && (
                  <p role="alert" className="rounded-xl bg-danger/[0.12] px-4 py-3 text-sm text-danger">
                    {mutation.error instanceof Error
                      ? mutation.error.message
                      : "Couldn’t send. Please try again."}
                  </p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Sending…" : "Send message"}
                </Button>
                <a
                  href={CONTACT.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap font-mono text-meta text-fg-2 hover:text-fg"
                >
                  Or book a 30-min call →
                </a>
              </form>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="help-heading" className="wrap border-t border-line-2 py-16 lg:py-24">
        <Reveal>
          <Eyebrow>What I can help with</Eyebrow>
          <h2 id="help-heading" className="mt-6 max-w-[720px] text-h2 font-medium">
            Hire a full-stack developer <span className="soft">who has shipped his own products.</span>
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {CONTACT_SERVICES.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 100} className="h-full">
                <Link
                  to={proof[i]?.to ?? "/projects"}
                  className="group flex h-full flex-col gap-3 rounded-[20px] border border-line bg-surface p-6 transition-colors hover:border-accent/50"
                >
                  <span className="flex items-start justify-between gap-4">
                    <h3 className="text-h3 font-medium group-hover:text-accent">{s.title}</h3>
                    <ArrowUpRight aria-hidden className="size-5 shrink-0 text-fg-3 group-hover:text-accent" />
                  </span>
                  <p className="text-fg-2">{s.body}</p>
                  {proof[i] && (
                    <span className="mt-auto pt-4 font-mono text-meta text-fg-3">{proof[i].meta}</span>
                  )}
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="process-heading" className="wrap border-t border-line-2 py-16 lg:py-24">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2 id="process-heading" className="mt-6 text-h2 font-medium">
            From hello <span className="soft">to kickoff</span>
          </h2>
        </Reveal>
        <Reveal className="group relative mt-12">
          <span aria-hidden className="absolute left-0 right-0 top-[15px] hidden h-px bg-line-2 md:block" />
          <span
            aria-hidden
            className="absolute left-0 right-0 top-[14px] hidden h-[3px] origin-left scale-x-0 rounded-full bg-accent transition-transform duration-[1400ms] ease-out group-data-[in=true]:scale-x-100 md:block"
          />
          <ol className="relative grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-4">
                <span className="flex size-8 items-center justify-center rounded-full border-2 border-accent bg-base font-mono text-meta text-accent">
                  {i + 1}
                </span>
                <h3 className="text-h3 font-medium">{s.title}</h3>
                <p className="max-w-[320px] text-fg-2">
                  {i === 0 ? `${s.body} Usually ${replyTime}.` : s.body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section aria-labelledby="faq-heading" className="wrap border-t border-line-2 py-16 lg:py-24">
        <Eyebrow>FAQ</Eyebrow>
        <h2 id="faq-heading" className="mt-6 text-h2 font-medium">
          Before you <span className="soft">get in touch</span>
        </h2>
        <div className="mt-10 max-w-[820px] border-b border-line-2">
          {CONTACT_FAQ.map(({ q, a }, i) => (
            <details key={q} open={i === 0} className="group border-t border-line-2 py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-body-l font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg-3 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[680px] text-fg-2">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
