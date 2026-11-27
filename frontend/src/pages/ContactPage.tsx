import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Bot,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Hammer,
  Mail,
  MessageCircle,
  Mic,
  PenLine,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Eyebrow, Field, Reveal, RisingWords } from "@/components/ui";
import { useContactMutation, useContactSettings, useEvents } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { CONTACT } from "@/lib/site";
import {
  PAGE_SEO,
  BASE_URL,
  CONTACT_FAQ,
  CONTACT_INTRO,
  CONTACT_PAGE_SCHEMA,
  CONTACT_SERVICES,
} from "@/lib/seo-content";
import { copyText } from "@/lib/clipboard";
import { eventStats } from "@/lib/eventStats";
import { MESSAGE_MAX, TOPICS, composeMessage, topicFromQuery, type Topic } from "@/lib/contactForm";
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
  startup: Rocket,
  speaking: Mic,
  consulting: Briefcase,
  other: MessageCircle,
};

const STATUS: Record<
  NonNullable<ContactSettings["status"]>,
  { dot: string; text: string; fallback: string }
> = {
  available: {
    dot: "bg-live shadow-[0_0_10px_rgb(74_222_128/0.7)]",
    text: "text-live",
    fallback: "Open to interesting projects",
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

/** Card icons, same order as CONTACT_SERVICES. */
const SERVICE_ICONS: LucideIcon[] = [Hammer, Bot, Rocket, Mic, Briefcase];

const MORE_LINKS = [
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/experience", label: "Experience" },
  { to: "/blog", label: "Blog" },
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

function CopyEmailButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (await copyText(CONTACT.email)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }
        }}
        aria-label={copied ? "Email copied" : "Copy email address"}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full border border-line-2 text-fg-3 transition-colors hover:border-accent hover:text-accent",
          className,
        )}
      >
        {copied ? <Check className="size-3.5 text-live" /> : <Copy className="size-3.5" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
}

function CopyEmail() {
  return (
    <span className="inline-flex items-center gap-3">
      <a href={`mailto:${CONTACT.email}`} className="hover:text-accent">
        {CONTACT.email}
      </a>
      <CopyEmailButton />
    </span>
  );
}

const TILE =
  "group relative flex min-h-[116px] flex-col justify-between gap-6 md:min-h-[clamp(108px,15svh,140px)] md:gap-[clamp(16px,3svh,32px)] overflow-hidden rounded-[24px] border p-6 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1";
const TILE_TITLE = "block text-[1.25rem] font-medium leading-tight tracking-[-0.02em] lg:text-[1.5rem]";

/** Full-screen opener: a big promise, then three ways to reach me. */
function ContactHero({
  status,
  statusLabel,
  replyTime,
  time,
}: {
  status: (typeof STATUS)[keyof typeof STATUS];
  statusLabel: string;
  replyTime: string;
  time: string;
}) {
  const facts = [
    { label: "Colombo time", value: time, mono: true },
    { label: "Replies", value: replyTime.charAt(0).toUpperCase() + replyTime.slice(1) },
    { label: "Based in", value: "Colombo, Sri Lanka" },
    { label: "Working with", value: "Teams worldwide" },
  ];
  return (
    <section
      aria-labelledby="contact-hero-heading"
      className="relative -mt-[72px] flex min-h-[100svh] flex-col overflow-clip lg:-mt-[88px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_85%_15%,rgb(255_95_0/0.18),transparent_70%),radial-gradient(ellipse_45%_50%_at_0%_100%,rgb(255_95_0/0.10),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgb(var(--ink)/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--ink)/0.045)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]"
      />

      <div className="wrap relative flex flex-1 flex-col justify-center pb-[clamp(20px,4svh,48px)] pt-[clamp(96px,12svh,124px)]">
        <div className="flex animate-rise flex-wrap items-center justify-between gap-4">
          <Eyebrow>Contact</Eyebrow>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-surface/60 px-4 py-2 text-sm backdrop-blur">
            <span className="relative flex size-2">
              <span
                aria-hidden
                className={cn("absolute inset-0 animate-ping rounded-full opacity-60", status.dot)}
              />
              <span aria-hidden className={cn("relative size-2 rounded-full", status.dot)} />
            </span>
            <span className={status.text}>{statusLabel}</span>
          </span>
        </div>

        <h1
          id="contact-hero-heading"
          className="mt-[clamp(20px,4svh,48px)] text-[clamp(3.25rem,min(12vw,13svh),10.5rem)] font-medium leading-[0.92] tracking-[-0.055em]"
        >
          <span className="block">
            <RisingWords text="Have an idea?" />
          </span>
          <span className="block">
            <RisingWords text="Let's" from={3} />{" "}
            <RisingWords text="build it." from={4} className="font-light text-accent" />
          </span>
        </h1>

        <p className="mt-[clamp(16px,3svh,32px)] max-w-[720px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
          {CONTACT_INTRO[0]}
        </p>

        <div className="mt-[clamp(20px,4svh,56px)] grid animate-rise grid-cols-1 gap-3 [animation-delay:450ms] md:grid-cols-3">
          <a href="#message" className={cn(TILE, "border-accent bg-accent text-fg-inverse")}>
            <span className="flex items-center justify-between">
              <PenLine aria-hidden className="size-5" />
              <ArrowDown
                aria-hidden
                className="size-5 transition-transform duration-300 group-hover:translate-y-1"
              />
            </span>
            <span>
              <span className={TILE_TITLE}>Send a message</span>
              <span className="mt-1.5 block text-sm opacity-80">Takes about two minutes</span>
            </span>
          </a>
          <a
            href={CONTACT.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(TILE, "border-line-2 bg-surface/60 backdrop-blur hover:border-accent/60")}
          >
            <span className="flex items-center justify-between">
              <CalendarDays aria-hidden className="size-5 text-accent" />
              <ArrowUpRight
                aria-hidden
                className="size-5 text-fg-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </span>
            <span>
              <span className={TILE_TITLE}>
                Book a 30-min call<span className="sr-only"> (opens in a new tab)</span>
              </span>
              <span className="mt-1.5 block text-sm text-fg-2">Free · pick a time that suits you</span>
            </span>
          </a>
          <div className={cn(TILE, "border-line-2 bg-surface/60 backdrop-blur hover:border-accent/60")}>
            <span className="flex items-center justify-between">
              <Mail aria-hidden className="size-5 text-accent" />
              <CopyEmailButton className="relative z-10" />
            </span>
            <span>
              <a
                href={`mailto:${CONTACT.email}`}
                className={cn(TILE_TITLE, "after:absolute after:inset-0 group-hover:text-accent")}
              >
                {CONTACT.email}
              </a>
              <span className="mt-1.5 block text-sm text-fg-2">Or copy it and write when you're ready</span>
            </span>
          </div>
        </div>
      </div>

      <div className="relative shrink-0 border-t border-line bg-base/60 backdrop-blur-sm">
        <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-5 py-[clamp(16px,3svh,28px)] md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <dt className="label text-fg-3">{f.label}</dt>
              <dd className={cn("font-medium", f.mono && "font-mono tabular-nums")}>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Shared selected / idle look for every choice control in the form. */
const choiceCls = (active: boolean) =>
  cn(
    "border transition-[color,border-color,background-color,box-shadow] duration-200",
    active
      ? "border-accent/70 bg-accent/[0.08] text-fg shadow-[0_0_0_3px_rgb(255_95_0/0.08)]"
      : "border-line-2 bg-base/40 text-fg-2 hover:border-line-3 hover:text-fg",
  );

const EMPTY = { name: "", email: "", company: "", message: "", website: "", eventDate: "", audience: "" };

const ContactPage = () => {
  const { search } = useLocation();
  const [topic, setTopic] = useState<Topic>(() => topicFromQuery(search));
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const mutation = useContactMutation();
  const { data: settings } = useContactSettings();
  const { data: events = [] } = useEvents();
  const { data: projects = [] } = useProjects();
  const time = useColomboTime();

  useEffect(() => setTopic(topicFromQuery(search)), [search]);

  const status = STATUS[settings?.status ?? "available"];
  const replyTime = settings?.reply_time?.trim() || "within one working day";
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
      company: form.company,
      eventDate: form.eventDate,
      audience: form.audience,
      message: form.message,
    });
    mutation.mutate(
      { name: form.name, email: form.email, website: form.website, subject, message },
      {
        onSuccess: () => {
          setForm(EMPTY);
        },
      },
    );
  };

  /** Where each "What can we work on?" card points, with a line of proof. Same order as CONTACT_SERVICES. */
  const proof = [
    { to: "/projects", meta: projects.length ? `${projects.length} projects shipped` : "See projects" },
    { to: "/projects", meta: "AI tools & integrations" },
    { to: "/experience", meta: "Companies I've started" },
    {
      to: "/events",
      meta: ev.count
        ? `${ev.count} events${ev.audience ? ` · ${ev.audience.toLocaleString("en-US")}+ people` : ""}`
        : "See events",
    },
    { to: "/about", meta: "More about me" },
  ];

  return (
    <Layout>
      <SEO
        fullTitle={PAGE_SEO["/contact"].fullTitle}
        description={PAGE_SEO["/contact"].description}
        url={`${BASE_URL}/contact`}
        structuredData={[FAQ_SCHEMA, CONTACT_PAGE_SCHEMA]}
        breadcrumbs={[{ name: "Contact", url: `${BASE_URL}/contact` }]}
      />

      <ContactHero
        status={status}
        statusLabel={settings?.message?.trim() || status.fallback}
        replyTime={replyTime}
        time={time}
      />

      {/* Message form */}
      <section
        id="message"
        aria-labelledby="message-heading"
        className="section screen theme-light scroll-mt-0 border-t-0"
      >
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-20">
          <Reveal className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
            <Eyebrow index="01">Send a message</Eyebrow>
            <h2 id="message-heading" className="text-h1 font-medium">
              Tell me what's <span className="soft">on your mind.</span>
            </h2>
            <p className="max-w-[460px] text-fg-2">{CONTACT_INTRO[1]}</p>
            <ul className="mt-2 flex flex-col gap-3 border-t border-line-2 pt-6">
              {[`Replies ${replyTime}`, "No perfectly written brief needed", "No mailing lists, ever"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-3 text-fg-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/[0.12] text-accent">
                      <Check aria-hidden className="size-3.5" />
                    </span>
                    {t}
                  </li>
                ),
              )}
            </ul>
          </Reveal>

          <div className="relative h-fit">
            <div className="relative overflow-hidden rounded-[28px] border border-line-2 bg-surface p-6 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)] md:p-9">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
              />
              {mutation.isSuccess ? (
                <div className="flex flex-col items-start gap-6 py-6">
                  <span className="flex size-14 animate-rise items-center justify-center rounded-full bg-live/10">
                    <CheckCircle2 aria-hidden className="size-7 text-live" />
                  </span>
                  <h2 className="text-h2 font-medium">That's on its way!</h2>
                  <p className="text-fg-2">
                    Thanks for reaching out. I'll get back to you {replyTime}. Here's what happens next:
                  </p>
                  <ol className="flex flex-col gap-3">
                    {STEPS.map((s, i) => (
                      <li key={s.title} className="flex gap-3">
                        <span className="font-mono text-meta text-accent">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <span className="font-medium">{s.title}</span>
                          <span className="text-fg-2"> - {s.body}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <Button variant="secondary" icon={false} onClick={() => mutation.reset()}>
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="relative flex flex-col gap-7">
                  <fieldset>
                    <legend className="label mb-3 text-fg-3">What are you reaching out about?</legend>
                    <div className="grid grid-cols-2 gap-2">
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
                              "flex min-h-12 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm leading-tight sm:px-3",
                              choiceCls(active),
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                                active ? "bg-accent text-fg-inverse" : "bg-surface-2 text-fg-3",
                              )}
                            >
                              <Icon aria-hidden className="size-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">{t.label}</span>
                            <span
                              aria-hidden
                              className={cn(
                                "hidden size-4 shrink-0 items-center justify-center rounded-full border sm:flex",
                                active ? "border-accent" : "border-line-3",
                              )}
                            >
                              {active && <span className="size-2 rounded-full bg-accent" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <Field
                      label="Your name"
                      name="name"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Jane Perera"
                      autoComplete="name"
                      maxLength={100}
                      error={errors.name}
                    />
                    <Field
                      label="Email address"
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
                  <Field
                    label="Company or organisation"
                    optional
                    name="company"
                    value={form.company}
                    onChange={set("company")}
                    placeholder="Where you're from, if it helps"
                    autoComplete="organization"
                    maxLength={120}
                  />
                  {topic.kind === "event" && (
                    <div
                      key="event"
                      className="grid animate-rise gap-4 [animation-duration:300ms] grid-cols-1 sm:grid-cols-2"
                    >
                      <Field
                        label="Event date"
                        optional
                        name="eventDate"
                        value={form.eventDate}
                        onChange={set("eventDate")}
                        placeholder="e.g. 14 March 2027"
                        maxLength={60}
                      />
                      <Field
                        label="Expected audience"
                        optional
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
                      label="Tell me a little more"
                      name="message"
                      value={form.message}
                      onChange={set("message")}
                      placeholder={
                        topic.kind === "event"
                          ? "The event, the format and what you'd like from me"
                          : "I've been thinking about…"
                      }
                      multiline
                      maxLength={MESSAGE_MAX}
                      error={errors.message}
                    />
                    {form.message.length > MESSAGE_MAX * 0.8 && (
                      <span className="self-end font-mono text-meta text-accent">
                        {form.message.length}/{MESSAGE_MAX}
                      </span>
                    )}
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
                  <div className="flex flex-col gap-3">
                    <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
                      {mutation.isPending ? "Sending…" : "Send it my way"}
                    </Button>
                    <p className="text-center text-meta text-fg-3">
                      Goes straight to my inbox. No mailing lists, ever.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What can we work on? */}
      <section aria-labelledby="help-heading" className="section screen border-t-0">
        <div className="wrap">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow index="02">What I can help with</Eyebrow>
              <h2 id="help-heading" className="mt-6 text-h1 font-medium">
                What can we <span className="soft">work on?</span>
              </h2>
            </div>
            <p className="max-w-[400px] text-fg-2">
              A few things I spend my time doing. Not an exhaustive list, though. I'm open to interesting
              ideas.
            </p>
          </Reveal>
          <ul className="mt-8 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
            {CONTACT_SERVICES.map((s, i) => {
              const Icon = SERVICE_ICONS[i] ?? Hammer;
              const feature = i < 2;
              return (
                <li
                  key={s.title}
                  className={cn(
                    feature ? "lg:col-span-3" : "lg:col-span-2",
                    i === 4 && "md:col-span-2 lg:col-span-2",
                  )}
                >
                  <Reveal delay={i * 70} className="h-full">
                    <Link
                      to={proof[i]?.to ?? "/projects"}
                      className={cn(
                        "group relative flex h-full flex-col gap-3 overflow-hidden rounded-[24px] border border-line bg-surface p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/50",
                        feature && "lg:p-8",
                      )}
                    >
                      {feature && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_0%,rgb(255_95_0/0.12),transparent_70%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                        />
                      )}
                      <span className="relative flex items-center justify-between">
                        <span className="flex size-10 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-accent">
                          <Icon aria-hidden className="size-5" />
                        </span>
                        <span className="font-mono text-meta text-fg-3">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </span>
                      <h3 className={cn("relative font-medium group-hover:text-accent", "text-h3")}>
                        {s.title}
                      </h3>
                      <p className="relative text-[15px] leading-relaxed text-fg-2">{s.body}</p>
                      <span className="relative mt-auto flex items-center justify-between gap-4 border-t border-line-2 pt-3 font-mono text-meta text-fg-3">
                        {proof[i]?.meta}
                        <ArrowUpRight
                          aria-hidden
                          className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                        />
                      </span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Booking card */}
      <section aria-labelledby="call-heading" className="section screen theme-light border-t-0">
        <div className="wrap">
          <Reveal className="theme-dark relative overflow-hidden rounded-[32px] border border-line-2 bg-[linear-gradient(135deg,#1d1612_0%,#17171a_55%,#222226_100%)] px-6 py-16 text-center shadow-[0_50px_100px_-40px_rgb(0_0_0/0.45)] md:px-12 md:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_0%_0%,rgb(255_95_0/0.28),transparent_70%),radial-gradient(ellipse_45%_60%_at_100%_100%,rgb(255_95_0/0.12),transparent_70%)]"
            />
            <div className="relative mx-auto flex max-w-[760px] flex-col items-center gap-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-line-3 bg-surface/60 px-3.5 py-1.5 text-sm font-medium backdrop-blur">
                <CalendarDays aria-hidden className="size-4 text-accent" /> Free · 30 minutes
              </span>
              <h2
                id="call-heading"
                className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.04em]"
              >
                Prefer a conversation?
              </h2>
              <p className="max-w-[600px] text-body-l text-fg-2">
                Sometimes it's easier to talk things through than type out a whole brief. Grab a slot and
                let's figure out what you're working on.
              </p>
              <div className="mt-2 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
                <a
                  href={CONTACT.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-[#fff] px-7 font-medium text-[rgb(17_17_19)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Book a call
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <a
                  href="#message"
                  className="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-line-3 bg-surface/50 px-7 font-medium text-fg backdrop-blur transition-colors hover:border-accent/60"
                >
                  Or send a message
                </a>
              </div>
              <p className="text-sm text-fg-3">No prep needed. Pick any time that suits you.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="process-heading" className="section screen border-t-0">
        <div className="wrap">
          <Reveal>
            <Eyebrow index="03">How it works</Eyebrow>
            <h2 id="process-heading" className="mt-6 text-h1 font-medium">
              From hello <span className="soft">to kickoff</span>
            </h2>
          </Reveal>
          <Reveal className="group relative mt-14">
            <span aria-hidden className="absolute left-0 right-0 top-[19px] hidden h-px bg-line-2 md:block" />
            <span
              aria-hidden
              className="absolute left-0 right-0 top-[18px] hidden h-[3px] origin-left scale-x-0 rounded-full bg-accent transition-transform duration-[1400ms] ease-out group-data-[in=true]:scale-x-100 md:block"
            />
            <ol className="relative grid gap-10 grid-cols-1 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex flex-col gap-4">
                  <span className="flex size-10 items-center justify-center rounded-full border-2 border-accent bg-base font-mono text-meta text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-h3 font-medium">{s.title}</h3>
                  <p className="max-w-[320px] text-fg-2">
                    {i === 0 ? `${s.body} Usually ${replyTime}.` : s.body}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="section screen theme-light border-t-0">
        <div className="wrap grid gap-12 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-20">
          <div className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
            <Eyebrow index="04">FAQ</Eyebrow>
            <h2 id="faq-heading" className="text-h1 font-medium">
              A few things <span className="soft">you might be wondering</span>
            </h2>
            <p className="text-fg-2">Something else on your mind? Just ask.</p>
            <CopyEmail />
          </div>
          <div className="border-b border-line-2">
            {CONTACT_FAQ.map(({ q, a }, i) => (
              <details key={q} open={i === 0} className="group border-t border-line-2 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-body-l font-medium transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                  {q}
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg-3 transition-[transform,background-color,color,border-color] duration-300 group-open:rotate-45 group-open:border-accent group-open:bg-accent group-open:text-fg-inverse"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[640px] text-fg-2">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Sign-off card */}
      <section aria-labelledby="signoff-heading" className="section screen border-t-0">
        <div className="wrap">
          <Reveal className="theme-orange relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#ff7a26_0%,#ff5f00_50%,#e04e00_100%)] px-6 py-16 text-center shadow-[0_50px_100px_-40px_rgb(255_95_0/0.45)] md:px-12 md:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_100%_0%,rgb(255_255_255/0.22),transparent_70%),radial-gradient(ellipse_45%_60%_at_0%_100%,rgb(0_0_0/0.14),transparent_70%)]"
            />
            <div className="relative mx-auto flex max-w-[760px] flex-col items-center gap-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(17_17_19/0.2)] bg-[rgb(255_255_255/0.18)] px-3.5 py-1.5 text-sm font-medium backdrop-blur">
                <PenLine aria-hidden className="size-4" /> Replies {replyTime}
              </span>
              <h2
                id="signoff-heading"
                className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.04em]"
              >
                Made something interesting?
              </h2>
              <p className="max-w-[600px] text-body-l text-fg-2">
                I'd love to hear about it. A rough idea, a finished product or just a question, my inbox is
                open.
              </p>
              <div className="mt-2 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
                <a
                  href="#message"
                  className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-[rgb(17_17_19)] px-7 font-medium text-[#fff] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Drop me a message
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-[rgb(17_17_19/0.25)] bg-[rgb(255_255_255/0.15)] px-7 font-medium transition-colors hover:bg-[rgb(255_255_255/0.28)]"
                >
                  <Mail aria-hidden className="size-4" />
                  {CONTACT.email}
                </a>
              </div>
              <nav
                aria-label="More about Saad"
                className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-meta text-fg-2"
              >
                {MORE_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className="tap underline-offset-4 hover:text-fg hover:underline">
                    {l.label} →
                  </Link>
                ))}
              </nav>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
