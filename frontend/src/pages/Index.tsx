import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";
import { Button, Eyebrow, Reveal, SectionHeader, Skeleton } from "@/components/ui";
import { ProjectTile, Row } from "@/components/cards";
import { eventPath } from "@/lib/paths";
import { eventPhotoAlt } from "@/lib/imageAlt";
import type { Event } from "@/types";
import { ToolsMarquee } from "@/components/ToolsMarquee";
import { CertificationsShowcase } from "@/components/CertificationsShowcase";
import { useFeaturedProjects, useProjects } from "@/hooks/useProjects";
import { useBlogPosts } from "@/hooks/useBlog";
import { useCertificates, useEvents, useExperience, useSkills } from "@/hooks/useContent";
import { normalizeExperience, companyPeriod } from "@/lib/experience";
import { monthYear } from "@/lib/format";
import { featuredPosts, readingMinutesOf } from "@/lib/article-core";
import { CONTACT } from "@/lib/site";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { PAGE_SEO, BASE_URL, homeSchemas } from "@/lib/seo-content";
import portrait from "@/assets/profile-photo.webp";
import { resizedUrl } from "@/lib/images";

function Hero({
  projects,
  events,
  certificates,
}: {
  projects?: number;
  events?: number;
  certificates?: number;
}) {
  const stats = [
    { value: "5+", label: "Years building", short: "Years" },
    // Every project, prototypes and coursework included, so "built" rather than "shipped".
    { value: projects ? `${projects}` : "20+", label: "Projects built", short: "Built" },
    { value: events ? `${events}` : "40+", label: "Stages & events", short: "Stages" },
    { value: certificates ? `${certificates}` : "99", label: "Certifications", short: "Certs" },
  ];
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative -mt-[72px] flex h-[100svh] flex-col overflow-hidden lg:-mt-[88px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_78%_35%,rgb(255_95_0/0.16),transparent_70%)]"
      />

      {/* Everything above the stats band; the portrait and copy share it so nothing spills below the fold. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="wrap relative flex min-h-0 flex-1 flex-col justify-end pb-[clamp(16px,4svh,56px)] pt-[72px] lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-x-12 lg:pb-0 lg:pt-[88px]">
          <img
            src={portrait}
            alt=""
            aria-hidden
            fetchPriority="high"
            className="pointer-events-none absolute right-[-24%] top-[48px] aspect-square h-[min(46%,96vw)] w-auto max-w-none opacity-75 mix-blend-lighten [mask-image:linear-gradient(to_bottom,black_35%,transparent_80%)] sm:right-[-8%] sm:h-[min(70%,80vw)] sm:opacity-90 sm:[mask-image:linear-gradient(to_bottom,black_50%,transparent_92%)] lg:static lg:col-start-2 lg:row-start-1 lg:h-full lg:min-h-0 lg:w-full lg:max-w-full lg:self-end lg:origin-bottom lg:scale-[1.32] lg:object-contain lg:object-bottom lg:[mask-image:linear-gradient(to_bottom,black_62%,transparent_98%)]"
          />
          <div className="relative lg:col-start-1 lg:row-start-1 lg:self-center lg:pb-[clamp(16px,3svh,40px)]">
            <span className="mb-[clamp(12px,2.6svh,24px)] inline-flex w-fit items-center gap-2.5 rounded-full border border-line-2 bg-surface px-3 py-2 font-mono text-meta text-fg-2 [@media(max-height:719px)]:hidden">
              <span className="size-2 rounded-full bg-live shadow-[0_0_8px_rgb(74_222_128/0.6)]" />
              Currently building TankSudda & Stopwash
            </span>
            <h1 id="hero-heading" className="text-hero font-medium lg:text-hero-lg">
              {/* The name leads the H1: it's the query this page has to win. */}
              <span className="mb-[clamp(8px,1.8svh,16px)] block font-mono text-meta font-normal text-fg-2">
                Saad Mazhar
              </span>
              Building
              <br />
              products that
              <br />
              solve <span className="font-light text-accent">real</span>
              <br />
              problems.
            </h1>
            <p className="mt-[clamp(12px,3svh,32px)] max-w-[520px] text-[clamp(15px,2.2svh,19px)] leading-[1.55] text-fg-2 [@media(max-height:620px)]:hidden">
              Founder, full-stack engineer and tech speaker from Colombo. I turn rough ideas into products
              people pay for, then go on stage and explain how.
            </p>
            <div className="mt-[clamp(14px,3.4svh,36px)] flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button to="/projects" size="lg" className="h-[clamp(44px,6svh,52px)] px-5 sm:px-6">
                <span className="sm:hidden">See my work</span>
                <span className="hidden sm:inline">See selected work</span>
              </Button>
              <SocialLinks size="sm" className="gap-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative shrink-0 border-t border-line bg-base/60 backdrop-blur-sm">
        <dl className="wrap grid grid-cols-4 gap-x-3 py-[clamp(12px,3svh,36px)] sm:gap-x-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col-reverse items-center gap-[clamp(4px,1svh,10px)] text-center"
            >
              <dt className="label text-fg-3">
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </dt>
              <dd className="text-[clamp(1.375rem,min(6.4vw,5.2svh),4rem)] font-medium leading-none tracking-[-0.035em]">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Statement() {
  // One idea, one accent: "what if?" gets a highlighter swipe that sweeps in on view.
  return (
    <section className="section screen theme-orange border-t-0" aria-label="About">
      <Reveal className="wrap flex flex-col items-center text-center">
        <Eyebrow counted>About</Eyebrow>
        <p className="mt-[clamp(20px,4svh,40px)] max-w-[1040px] text-balance text-[clamp(2rem,min(4.6vw,7svh),4.25rem)] font-medium leading-[1.1] tracking-[-0.04em] text-fg">
          Hey, I’m Saad. I have a habit of turning random{" "}
          <span className="relative inline-block whitespace-nowrap px-[0.18em]">
            <span
              aria-hidden
              className="highlight-swipe absolute inset-x-0 inset-y-[0.08em] -rotate-1 rounded-[0.18em] bg-[#FFF4E0]"
            />
            <span className="relative">what if?</span>
          </span>{" "}
          ideas into actual projects.
        </p>
        <p className="mt-[clamp(18px,3.6svh,36px)] max-w-[620px] text-pretty text-[clamp(1rem,min(1.5vw,2.6svh),1.25rem)] leading-[1.6] text-fg-2">
          I’m into tech, business, AI and building things that probably started as a late-night idea. I’ve
          started businesses, built products, written plenty of code and chased more ideas than I can count.
          Always curious, always experimenting, and probably already thinking about the next thing.
        </p>
        <div className="mt-[clamp(22px,4.4svh,48px)]">
          <Button to="/about" size="lg">
            Get to know me a little more
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

function SelectedWork() {
  const { data: featured = [], isLoading: loadingFeatured } = useFeaturedProjects();
  const { data: all = [], isLoading: loadingAll } = useProjects();
  const isLoading = loadingFeatured && loadingAll;
  // Featured first, then the rest by order, so the strip has enough to keep moving.
  const projects = useMemo(() => {
    const byOrder = (a: { order_index?: number }, b: { order_index?: number }) =>
      (a.order_index ?? 999) - (b.order_index ?? 999);
    const lead = [...featured].sort(byOrder);
    const seen = new Set(lead.map((p) => p.slug));
    const rest = [...all].sort(byOrder).filter((p) => !seen.has(p.slug));
    // A blank tile in a showcase reads as broken, so only projects with an image make the strip.
    return [...lead, ...rest].filter((p) => p.cardImage || p.heroImage || p.image).slice(0, 10);
  }, [featured, all]);
  if (!isLoading && projects.length === 0) return null;
  // Two copies so the -50% loop is seamless; speed stays constant however many there are.
  const loop = [...projects, ...projects];
  const tile = "w-[clamp(240px,min(28vw,calc(100svh-370px)),400px)]";
  return (
    // White section; tiles stay square and are capped to what fits one screen.
    <section className="section screen theme-light border-t-0" aria-labelledby="work-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader
            counted
            id="work-heading"
            label="Selected work"
            title="Things I’ve"
            soft="built"
            action={<Button to="/projects">All projects</Button>}
          />
        </Reveal>
      </div>
      {isLoading ? (
        <div className="wrap flex gap-6 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className={cn("aspect-square shrink-0 rounded-[24px] bg-surface", tile)} />
          ))}
        </div>
      ) : (
        <Reveal>
          {/* Pauses on hover or keyboard focus; with reduced motion it becomes a plain swipeable row. */}
          <div className="group/work overflow-hidden motion-reduce:overflow-x-auto">
            <ul
              className="flex w-max animate-marquee group-hover/work:[animation-play-state:paused] group-focus-within/work:[animation-play-state:paused]"
              style={{ animationDuration: `${projects.length * 7}s` }}
            >
              {loop.map((p, i) => {
                const copy = i >= projects.length;
                return (
                  <li
                    key={`${p.id}-${i}`}
                    aria-hidden={copy || undefined}
                    className={cn("shrink-0 pr-6", tile, copy && "motion-reduce:hidden")}
                  >
                    <ProjectTile project={p} tabIndex={copy ? -1 : undefined} />
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      )}
    </section>
  );
}

function ExperienceList() {
  const { data = [], isLoading } = useExperience();
  const companies = useMemo(() => normalizeExperience(data).slice(0, 4), [data]);
  if (!isLoading && companies.length === 0) return null;
  return (
    <section className="section screen" aria-labelledby="experience-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader
            counted
            id="experience-heading"
            label="Experience"
            title="Where I’ve"
            soft="worked"
            action={
              <Button to="/experience" variant="ghost">
                Full timeline
              </Button>
            }
          />
        </Reveal>
        <div className="border-b border-line-2">
          {companies.map((c) => (
            <Row
              key={c.key}
              to="/experience"
              lead={companyPeriod(c)}
              title={c.roles[0]?.title}
              sub={c.name}
              trail={c.meta.split(" · ").pop()}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Full-bleed stage photo with the story overlaid; a lit poster when there's no photo yet. */
function StageCard({ event, tabIndex }: { event: Event; tabIndex?: number }) {
  const cover = event.image || event.images?.[0];
  return (
    <Link
      to={eventPath(event)}
      tabIndex={tabIndex}
      className="group/stage relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-[rgb(17_17_19)] sm:aspect-[5/6]"
    >
      {cover ? (
        <img
          src={resizedUrl(cover, 960)}
          alt={eventPhotoAlt(event, cover)}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover/stage:scale-[1.05]"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgb(255_95_0/0.45),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgb(255_95_0/0.15),transparent_60%)]"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/0 transition-opacity duration-500 group-hover/stage:opacity-95"
      />
      <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
        {event.role ? (
          <span className="label inline-flex h-7 items-center gap-2 rounded-full bg-black/55 px-3 text-white backdrop-blur-md">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {event.role}
          </span>
        ) : (
          <span />
        )}
        <span
          aria-hidden
          className="flex size-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors duration-300 group-hover/stage:bg-accent"
        >
          <ArrowUpRight className="size-[18px] transition-transform duration-200 ease-out group-hover/stage:-translate-y-0.5 group-hover/stage:translate-x-0.5" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-white md:p-6">
        <span className="font-mono text-meta text-white/70">
          {[monthYear(event.date), event.location].filter(Boolean).join(" · ")}
        </span>
        <h3 className="line-clamp-2 text-h4 font-medium leading-snug md:text-h3">{event.title}</h3>
        {event.organizer && <span className="text-sm text-white/70">{event.organizer}</span>}
      </div>
    </Link>
  );
}

function Speaking() {
  // Every event, newest first (sorted by the service), looping in one strip.
  const { data: events = [] } = useEvents();
  if (events.length === 0) return null;
  // Two copies so the -50% loop is seamless; speed stays constant however many there are.
  const loop = [...events, ...events];
  return (
    <section className="section screen theme-light border-t-0" aria-labelledby="speaking-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader
            counted
            id="speaking-heading"
            label="Speaking & hosting"
            title="Every stage,"
            soft="a new story"
            action={<Button to="/events">All events</Button>}
          />
        </Reveal>
      </div>
      <Reveal>
        {/* Pauses on hover, keyboard focus or a press (touch); reduced motion gets a swipeable row. */}
        <div className="group/stages overflow-hidden motion-reduce:overflow-x-auto">
          <ul
            className="flex w-max animate-marquee group-focus-within/stages:[animation-play-state:paused] group-hover/stages:[animation-play-state:paused] group-active/stages:[animation-play-state:paused]"
            style={{ animationDuration: `${events.length * 8}s` }}
          >
            {loop.map((e, i) => {
              const copy = i >= events.length;
              return (
                <li
                  key={`${e.id}-${i}`}
                  aria-hidden={copy || undefined}
                  className={cn(
                    "w-[clamp(260px,30vw,400px)] shrink-0 pr-4 md:pr-6",
                    copy && "motion-reduce:hidden",
                  )}
                >
                  <StageCard event={e} tabIndex={copy ? -1 : undefined} />
                </li>
              );
            })}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

function Capabilities() {
  const { data: skillSets = [] } = useSkills();
  // Logos come from the CMS (skills with an icon and "In tools strip" on).
  const tools = useMemo(() => {
    const seen = new Set<string>();
    return skillSets
      .flatMap((g) => g.skills ?? [])
      .filter((s) => s.showInTools && s.icon && !seen.has(s.name) && seen.add(s.name))
      .map((s) => ({ id: s.name, src: s.icon!, label: s.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [skillSets]);
  return (
    <section
      className="section screen theme-light overflow-hidden border-t-0"
      aria-labelledby="capabilities-heading"
    >
      <div className="wrap">
        <Reveal className="mb-12 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-7 [@media(min-width:768px)_and_(max-height:799px)]:mb-8">
          <div className="flex flex-col gap-6 md:gap-7">
            <Eyebrow counted>Capabilities</Eyebrow>
            <h2 id="capabilities-heading" className="text-display-m font-medium">
              Tools I <span className="soft">build with</span>
            </h2>
          </div>
          <Button to="/skills">All skills</Button>
        </Reveal>
      </div>
      <Reveal>
        <ToolsMarquee tools={tools} />
      </Reveal>
    </section>
  );
}

function Certifications() {
  const { data: certs = [] } = useCertificates();
  if (certs.length === 0) return null;
  return (
    <section className="section screen" aria-labelledby="certifications-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader
            id="certifications-heading"
            counted
            label="Credentials"
            title={`${certs.length}`}
            soft="certifications"
            action={
              <Button to="/certifications" variant="secondary">
                View all credentials
              </Button>
            }
          />
        </Reveal>
        <CertificationsShowcase certs={certs} />
      </div>
    </section>
  );
}

function Writing() {
  const { data = [] } = useBlogPosts();
  // Featured picks (CMS order) lead; the latest posts fill the remaining slots.
  const featured = featuredPosts(data);
  const posts = [...featured, ...data.filter((p) => !featured.includes(p))].slice(0, 3);
  if (posts.length === 0) return null;
  return (
    <section className="section screen theme-orange border-t-0" aria-labelledby="writing-heading">
      <div className="wrap">
        <Reveal>
          <SectionHeader
            counted
            id="writing-heading"
            label="Writing"
            title="Notes from"
            soft="the build"
            action={
              <Button to="/blog" variant="ghost">
                All writing
              </Button>
            }
          />
        </Reveal>
        <div className="border-b border-line-2">
          {posts.map((p) => (
            <Row
              key={p.id}
              to={`/blog/${p.slug || p.id}`}
              lead={monthYear(p.publishedAt || p.date)}
              title={p.title}
              trail={[p.featured ? "Featured" : p.category, `${readingMinutesOf(p)} min`]
                .filter(Boolean)
                .join(" · ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Pulls its child a few pixels toward the cursor while the pointer is over it. */
function Magnetic({ children, strength = 0.25 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) * strength;
    const dy = (e.clientY - r.top - r.height / 2) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <span
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      className="inline-flex transition-transform duration-300 ease-out motion-reduce:transform-none"
    >
      {children}
    </span>
  );
}

const CONTACT_WORDS = ["a conversation.", "what’s next.", "something real.", "something good."];

/** Cycles the second headline line; each word slides up through a mask. Static under reduced motion. */
function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % CONTACT_WORDS.length), 2800);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className="relative -mb-[0.22em] block overflow-hidden pb-[0.22em]">
      <span key={i} className="soft block animate-word-in">
        {CONTACT_WORDS[i]}
      </span>
      {/* Every option for screen readers, once, instead of a changing announcement. */}
      <span className="sr-only">{CONTACT_WORDS.join(" ")}</span>
    </span>
  );
}

/** Email link that also copies the address, with a brief "Copied" badge. The mailto still opens. */
function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = () => {
    navigator.clipboard
      ?.writeText(CONTACT.email)
      .then(() => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };
  return (
    <div className="flex items-center gap-3">
      <a
        href={`mailto:${CONTACT.email}`}
        onClick={copy}
        className="group relative w-fit break-all text-h2 font-medium text-fg"
        title="Click to email (address is copied too)"
      >
        {CONTACT.email}
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 h-[3px] w-full origin-left scale-x-0 rounded-full bg-fg transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
      </a>
      <span
        role="status"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-fg px-2.5 py-1 font-mono text-[12px] text-white transition-all duration-300",
          copied ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
        )}
      >
        <Check aria-hidden className="size-3.5" />
        {copied ? "Copied" : ""}
      </span>
    </div>
  );
}

/** Local time in Colombo with a status dot (green during waking hours). Client-only, so prerender stays stable. */
function ColomboTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    now ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", ...o }).format(now) : "";
  const hour = now ? Number(fmt({ hour: "numeric", hour12: false })) : 12;
  const awake = hour >= 8 && hour < 23;
  return (
    <p className="flex items-center gap-2.5 font-mono text-meta text-fg-2">
      <span className="relative flex size-2">
        {awake && <span className="absolute inset-0 animate-ping rounded-full bg-[#1f7a3a] opacity-60" />}
        <span className={cn("relative size-2 rounded-full", awake ? "bg-[#1f7a3a]" : "bg-fg/40")} />
      </span>
      Colombo, Sri Lanka
      {now && (
        <>
          <span aria-hidden>·</span>
          <span>{fmt({ hour: "numeric", minute: "2-digit", hour12: true })} local</span>
        </>
      )}
    </p>
  );
}

const CHAT_TOPICS = [
  "AI & product craft",
  "Founder & builder notes",
  "Student & community initiatives",
  "Random rabbit holes",
];

/**
 * Contact as an open door rather than a client pitch: a headline whose second
 * line cycles, a human line, copy-on-click email, low-stakes actions, what I'm
 * happy to talk about, and local time. Lines rise in when the section enters view.
 */
function ContactCTA() {
  return (
    <section className="section screen theme-orange border-t-0" aria-labelledby="contact-heading">
      <Reveal className="wrap contact-stagger">
        <Eyebrow counted>Contact</Eyebrow>
        <h2
          id="contact-heading"
          // The rotating word would otherwise read as every option in a row.
          aria-label="Let’s build what’s next"
          className="mt-[clamp(16px,3svh,36px)] text-[clamp(3.25rem,min(8.6vw,13.5svh),8.5rem)] font-medium leading-[0.95] tracking-[-0.05em]"
        >
          <span className="rise block">Let’s build</span>
          <span className="block">
            <span className="rise block" style={{ animationDelay: "110ms" }}>
              <RotatingWord />
            </span>
          </span>
        </h2>
        <p
          className="rise mt-[clamp(16px,3svh,32px)] max-w-[560px] text-body-l text-fg-2"
          style={{ animationDelay: "220ms" }}
        >
          Whether you have a rough idea, a question, or just want to compare notes, my inbox is open.
        </p>

        <div
          className="rise mt-[clamp(20px,4svh,44px)] flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
          style={{ animationDelay: "330ms" }}
        >
          <CopyEmail />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Magnetic>
              <Button href={CONTACT.bookingUrl} variant="secondary" size="lg">
                Quick chat
              </Button>
            </Magnetic>
            <Magnetic>
              <Button to="/contact" size="lg">
                Say hello
              </Button>
            </Magnetic>
          </div>
        </div>

        <div
          className="rise mt-[clamp(24px,4.4svh,52px)] flex flex-col gap-4 border-t border-line-3 pt-[clamp(16px,3svh,28px)] md:flex-row md:items-center md:justify-between"
          style={{ animationDelay: "440ms" }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <span className="label shrink-0 text-fg-2">Open to chatting about</span>
            <ul className="flex flex-wrap gap-2">
              {CHAT_TOPICS.map((t) => (
                <li key={t} className="rounded-full border border-line-3 px-3 py-1.5 text-[13px] text-fg">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <ColomboTime />
        </div>

        <SocialLinks className="rise mt-[clamp(16px,3svh,28px)]" />
      </Reveal>
    </section>
  );
}

const Index = () => {
  const { data: projects } = useProjects();
  const { data: events } = useEvents();
  const { data: certs } = useCertificates();
  return (
    <Layout>
      <SEO
        fullTitle={PAGE_SEO["/"].fullTitle}
        description={PAGE_SEO["/"].description}
        url={BASE_URL}
        structuredData={homeSchemas()}
      />
      <Hero projects={projects?.length} events={events?.length} certificates={certs?.length} />
      {/* Sections hide when their data is empty; the counter keeps the numbering gapless. */}
      <div className="counted">
        <Statement />
        <SelectedWork />
        <ExperienceList />
        <Speaking />
        <Writing />
        <Capabilities />
        <Certifications />
        <ContactCTA />
      </div>
    </Layout>
  );
};

export default Index;
