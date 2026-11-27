import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Bot,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Hammer,
  MessageCircle,
  Mic,
  PenLine,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button, Eyebrow, Field, FilterPill, Reveal, RisingWords } from "@/components/ui";
import { useContactMutation, useContactSettings, useEvents } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { CONTACT, SOCIALS, type SocialId } from "@/lib/site";
import { SocialIcon } from "@/components/brand/SocialLinks";
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

/** Profiles listed on this page, with a line on what each is for. Facebook stays in the footer only. */
const ELSEWHERE: { id: SocialId; note: string }[] = [
  { id: "linkedin", note: "Work, projects and professional updates" },
  { id: "github", note: "Things I've built and experimented with" },
  { id: "instagram", note: "A little more of everyday life" },
  { id: "x", note: "Random thoughts and conversations" },
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

/** Optional single-choice pills: clicking the active one clears it. */
function OptionalPills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="label mb-3 text-fg-3">
        {label} <span className="normal-case tracking-normal">(optional)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <FilterPill key={o} active={value === o} onClick={() => onChange(value === o ? "" : o)}>
            {o}
          </FilterPill>
        ))}
      </div>
    </fieldset>
  );
}

const EMPTY = { name: "", email: "", company: "", message: "", website: "", eventDate: "", audience: "" };

const ContactPage = () => {
  const { search } = useLocation();
  const [topic, setTopic] = useState<Topic>(() => topicFromQuery(search));
  const [form, setForm] = useState(EMPTY);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
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
      budget,
      timeline,
      eventDate: form.eventDate,
      audience: form.audience,
      message: form.message,
    });
    mutation.mutate(
      { name: form.name, email: form.email, website: form.website, subject, message },
      {
        onSuccess: () => {
          setForm(EMPTY);
          setBudget("");
          setTimeline("");
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

      {/* Hero + form */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_8%_10%,rgb(255_95_0/0.14),transparent_70%),radial-gradient(ellipse_40%_50%_at_95%_60%,rgb(255_95_0/0.07),transparent_70%)]"
        />
        <div className="wrap relative grid gap-12 pb-20 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-20 lg:pb-28 lg:pt-16">
          <div className="flex flex-col gap-8 lg:sticky lg:top-32 lg:self-start">
            <div className="animate-rise">
              <Eyebrow>Contact</Eyebrow>
            </div>
            <h1 className="text-display-m font-medium">
              <RisingWords text="Got something" /> <RisingWords text="brewing?" from={2} className="soft" />
            </h1>
            <span className="inline-flex w-fit animate-rise items-center gap-2.5 rounded-full border border-line-2 bg-surface/60 px-4 py-2 text-sm backdrop-blur [animation-delay:250ms]">
              <span className="relative flex size-2">
                <span
                  aria-hidden
                  className={cn("absolute inset-0 animate-ping rounded-full opacity-60", status.dot)}
                />
                <span aria-hidden className={cn("relative size-2 rounded-full", status.dot)} />
              </span>
              <span className={status.text}>{settings?.message?.trim() || status.fallback}</span>
              <span className="hidden text-fg-3 sm:inline">· replies {replyTime}</span>
            </span>
            <div className="flex max-w-[520px] animate-rise flex-col gap-4 [animation-delay:350ms]">
              <p className="text-body-l text-fg">{CONTACT_INTRO[0]}</p>
              <p className="text-fg-2">{CONTACT_INTRO[1]}</p>
            </div>
            <div className="grid max-w-[560px] animate-rise gap-3 [animation-delay:450ms] sm:grid-cols-[1.4fr_1fr]">
              <div className="flex flex-col gap-3 rounded-[20px] border border-line-2 bg-surface/50 p-5 backdrop-blur">
                <span className="label text-fg-3">Write to me</span>
                <CopyEmail />
                <a href={CONTACT.phoneHref} className="tap w-fit text-sm text-fg-2 hover:text-accent">
                  {CONTACT.phone}
                </a>
              </div>
              <div className="flex flex-col gap-1 rounded-[20px] border border-line-2 bg-surface/50 p-5 backdrop-blur">
                <span className="label text-fg-3">Colombo time</span>
                <span className="mt-2 font-mono text-[1.75rem] leading-none tracking-tight tabular-nums">
                  {time}
                </span>
                <span className="mt-1 text-sm text-fg-2">Sri Lanka · working globally</span>
              </div>
            </div>
          </div>

          <div id="message" className="relative h-fit scroll-mt-28 animate-rise [animation-delay:200ms]">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-[29px] bg-gradient-to-b from-accent/40 via-line-2/40 to-transparent"
            />
            <div className="relative rounded-[28px] bg-surface p-6 shadow-[0_40px_100px_-50px_rgb(255_95_0/0.45)] md:p-9">
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
                <form onSubmit={submit} noValidate className="flex flex-col gap-7">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-h3 font-medium">Tell me what's on your mind.</h2>
                    <p className="text-sm text-fg-2">
                      No perfectly written brief needed. Give me the context and we'll take it from there.
                    </p>
                  </div>
                  <fieldset>
                    <legend className="label mb-3 text-fg-3">What are you reaching out about?</legend>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
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
                              "inline-flex min-h-10 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-[13px] leading-tight sm:rounded-full sm:px-4 sm:text-sm transition-[color,border-color,background-color] duration-200",
                              active
                                ? "border-accent bg-accent/[0.12] text-fg"
                                : "border-line-2 text-fg-2 hover:border-line-3 hover:text-fg",
                            )}
                          >
                            <Icon
                              aria-hidden
                              className={cn("size-4 shrink-0", active ? "text-accent" : "text-fg-3")}
                            />
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div className="grid gap-4 sm:grid-cols-2">
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
                    label="Company / organisation (optional)"
                    name="company"
                    value={form.company}
                    onChange={set("company")}
                    placeholder="Where you're from, if it helps"
                    autoComplete="organization"
                    maxLength={120}
                  />
                  {topic.kind === "build" && (
                    <div
                      key="build"
                      className="flex animate-rise flex-col gap-6 rounded-2xl border border-line-2 p-5 [animation-duration:300ms]"
                    >
                      <OptionalPills
                        label="Estimated budget"
                        options={BUDGETS}
                        value={budget}
                        onChange={setBudget}
                      />
                      <OptionalPills
                        label="Expected timeline"
                        options={TIMELINES}
                        value={timeline}
                        onChange={setTimeline}
                      />
                    </div>
                  )}
                  {topic.kind === "event" && (
                    <div
                      key="event"
                      className="grid animate-rise gap-4 [animation-duration:300ms] sm:grid-cols-2"
                    >
                      <Field
                        label="Event date (optional)"
                        name="eventDate"
                        value={form.eventDate}
                        onChange={set("eventDate")}
                        placeholder="e.g. 14 March 2027"
                        maxLength={60}
                      />
                      <Field
                        label="Expected audience (optional)"
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
      <section aria-labelledby="help-heading" className="wrap border-t border-line-2 py-20 lg:py-28">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow index="01">What I can help with</Eyebrow>
            <h2 id="help-heading" className="mt-6 text-h1 font-medium">
              What can we <span className="soft">work on?</span>
            </h2>
          </div>
          <p className="max-w-[400px] text-fg-2">
            A few things I spend my time doing. Not an exhaustive list, though. I'm open to interesting ideas.
          </p>
        </Reveal>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
                      "group relative flex h-full flex-col gap-4 overflow-hidden rounded-[24px] border border-line bg-surface p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/50",
                      feature && "lg:min-h-[300px] lg:p-9",
                    )}
                  >
                    {feature && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_0%,rgb(255_95_0/0.12),transparent_70%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    )}
                    <span className="relative flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-2xl border border-line-2 bg-surface-2 text-accent">
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <span className="font-mono text-meta text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                    </span>
                    <h3
                      className={cn(
                        "relative mt-2 font-medium group-hover:text-accent",
                        feature ? "text-h2" : "text-h3",
                      )}
                    >
                      {s.title}
                    </h3>
                    <p className="relative text-fg-2">{s.body}</p>
                    <span className="relative mt-auto flex items-center justify-between gap-4 border-t border-line-2 pt-4 font-mono text-meta text-fg-3">
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
      </section>

      {/* Booking band */}
      <section aria-labelledby="call-heading" className="wrap pb-20 lg:pb-28">
        <Reveal className="relative overflow-hidden rounded-[32px] border border-line bg-surface">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgb(255_95_0/0.35),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgb(255_95_0/0.12),transparent_60%)]"
          />
          <div className="relative grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-14">
            <div className="flex flex-col gap-4">
              <span className="label inline-flex items-center gap-2 text-accent">
                <CalendarDays aria-hidden className="size-4" /> Free · 30 minutes
              </span>
              <h2 id="call-heading" className="text-h1 font-medium">
                Prefer a <span className="soft">conversation?</span>
              </h2>
              <p className="max-w-[520px] text-fg-2">
                Sometimes it's easier to talk things through than type out a whole brief. Grab a slot and
                let's figure out what you're working on.
              </p>
            </div>
            <Button href={CONTACT.bookingUrl} size="lg" className="w-full md:w-auto">
              Book a call
            </Button>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section aria-labelledby="process-heading" className="wrap border-t border-line-2 py-20 lg:py-28">
        <Reveal>
          <Eyebrow index="02">How it works</Eyebrow>
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
          <ol className="relative grid gap-10 md:grid-cols-3">
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
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="wrap border-t border-line-2 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-20">
          <div className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
            <Eyebrow index="03">FAQ</Eyebrow>
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

      {/* Around the internet + sign-off */}
      <section aria-labelledby="elsewhere-heading" className="wrap border-t border-line-2 py-20 lg:py-28">
        <Reveal>
          <Eyebrow index="04">Around the internet</Eyebrow>
          <h2 id="elsewhere-heading" className="mt-6 text-h1 font-medium">
            Find me <span className="soft">around the internet.</span>
          </h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {ELSEWHERE.map(({ id, note }, i) => {
            const s = SOCIALS.find((x) => x.id === id);
            if (!s) return null;
            return (
              <li key={id}>
                <Reveal delay={i * 60} className="h-full">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col gap-4 rounded-[20px] border border-line bg-surface p-4 sm:gap-6 sm:p-5 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/50"
                  >
                    <span className="flex items-center justify-between">
                      <SocialIcon
                        id={id}
                        className="size-5 text-fg-2 transition-colors group-hover:text-accent"
                      />
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">
                        {s.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </span>
                      <span className="text-sm text-fg-2">{note}</span>
                    </span>
                  </a>
                </Reveal>
              </li>
            );
          })}
          <li className="col-span-2 lg:col-span-1">
            <Reveal delay={ELSEWHERE.length * 60} className="h-full">
              <Link
                to="/blog"
                className="group flex h-full flex-col gap-4 rounded-[20px] border border-line bg-surface p-4 sm:gap-6 sm:p-5 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/50"
              >
                <span className="flex items-center justify-between">
                  <PenLine
                    aria-hidden
                    className="size-5 text-fg-2 transition-colors group-hover:text-accent"
                  />
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-medium">Blog</span>
                  <span className="text-sm text-fg-2">
                    Longer thoughts on technology, startups and building things
                  </span>
                </span>
              </Link>
            </Reveal>
          </li>
        </ul>

        <Reveal className="mt-24 flex flex-col items-center gap-8 text-center">
          <p className="max-w-[820px] text-h1 font-medium">
            Made something interesting? <span className="soft">I'd love to hear about it.</span>
          </p>
          <Button href="#message" size="lg">
            Drop me a message
          </Button>
          <nav
            aria-label="More about Saad"
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-meta text-fg-2"
          >
            {MORE_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="tap hover:text-accent">
                {l.label} →
              </Link>
            ))}
          </nav>
        </Reveal>
      </section>
    </Layout>
  );
};

export default ContactPage;
