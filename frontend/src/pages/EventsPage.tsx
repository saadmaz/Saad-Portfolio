import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Users } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import {
  Button,
  CountUp,
  Empty,
  Eyebrow,
  Media,
  PageHero,
  Reveal,
  RisingWords,
  SectionHeader,
  Skeleton,
} from "@/components/ui";
import { EventCard } from "@/components/cards";
import { useEvents } from "@/hooks/useContent";
import { useScrollFill } from "@/hooks/useScrollFill";
import { eventDateLabel, parseEventDate } from "@/lib/eventDates";
import { eventStats, featuredEvents, roleColor, roleCounts } from "@/lib/eventStats";
import { eventPhotoAlt } from "@/lib/imageAlt";
import { eventPath } from "@/lib/paths";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n));

/** Big photo card for the featured row. */
function Feature({ event, big }: { event: Event; big?: boolean }) {
  const cover = (event.image || event.images?.[0]) as string;
  return (
    <Link
      to={eventPath(event)}
      className={cn(
        "group relative flex h-full overflow-hidden rounded-media border border-line",
        big ? "min-h-[420px] md:min-h-[560px]" : "min-h-[260px]",
      )}
    >
      <Media
        src={cover}
        alt={eventPhotoAlt(event, cover)}
        className="absolute inset-0 [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
      />
      <span className="relative mt-auto flex w-full flex-col gap-3 p-6 text-white md:p-8">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className="label rounded-full px-3 py-1.5 text-white"
            style={{ background: `${roleColor(event.role)}cc` }}
          >
            {event.role}
          </span>
          {event.attendees && (
            <span className="label inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              <Users aria-hidden className="size-3.5" /> {event.attendees}
            </span>
          )}
        </span>
        <span className={cn("font-medium leading-tight", big ? "text-h1" : "text-h3")}>{event.title}</span>
        <span className="font-mono text-meta text-white/70">
          {[eventDateLabel(event.date), event.organizer].filter(Boolean).join(" · ")}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden
        className="absolute right-6 top-6 size-6 text-white opacity-0 transition-opacity group-hover:opacity-100"
      />
    </Link>
  );
}

/** Role tabs with a coloured underline that slides to the active tab. */
function RoleTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: [string, number][];
  value: string;
  onChange: (r: string) => void;
}) {
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const [bar, setBar] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const el = refs.current.get(value);
    if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, tabs]);
  return (
    <div className="relative -mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
      <div
        role="tablist"
        aria-label="Filter by role"
        className="relative flex min-w-max gap-1 border-b border-line-2"
      >
        {tabs.map(([r, n]) => (
          <button
            key={r}
            ref={(el) => {
              if (el) refs.current.set(r, el);
            }}
            type="button"
            role="tab"
            aria-selected={value === r}
            onClick={() => onChange(r)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm transition-colors",
              value === r ? "text-fg" : "text-fg-3 hover:text-fg-2",
            )}
          >
            {r !== "All" && (
              <span aria-hidden className="size-2 rounded-full" style={{ background: roleColor(r) }} />
            )}
            {r}
            <span className="font-mono text-meta text-fg-3">{n}</span>
          </button>
        ))}
        <span
          aria-hidden
          className="absolute -bottom-px h-0.5 rounded-full transition-all duration-300 ease-out"
          style={{
            left: bar.left,
            width: bar.width,
            background: value === "All" ? "rgb(var(--accent))" : roleColor(value),
          }}
        />
      </div>
    </div>
  );
}

const EventsPage = () => {
  const { data = [], isLoading } = useEvents();
  const [role, setRole] = useState("All");
  const [rail, fill] = useScrollFill<HTMLDivElement>();
  // Already newest-first from the service.
  const events = data;
  const stats = useMemo(() => eventStats(events), [events]);
  const featured = useMemo(() => featuredEvents(events), [events]);
  const tabs = useMemo<[string, number][]>(() => [["All", events.length], ...roleCounts(events)], [events]);
  const groups = useMemo(() => {
    const shown = role === "All" ? events : events.filter((e) => e.role === role);
    const byYear = new Map<string, Event[]>();
    for (const e of shown) {
      const key = String(parseEventDate(e.date).year ?? "Undated");
      byYear.set(key, [...(byYear.get(key) ?? []), e]);
    }
    return [...byYear];
  }, [events, role]);
  const photos = useMemo(
    () =>
      events
        .flatMap((e) =>
          [e.image, ...(e.images ?? [])]
            .filter(Boolean)
            .slice(0, 2)
            .map((src) => ({ e, src: src as string })),
        )
        .filter((p, i, a) => a.findIndex((q) => q.src === p.src) === i)
        .slice(0, 12),
    [events],
  );

  const heroStats = [
    { label: "Events", value: stats.count, text: undefined },
    {
      label: "People reached",
      value: stats.audience,
      text: stats.audience ? `${compact(stats.audience)}+` : undefined,
    },
    { label: "On stage", value: stats.onStage, text: undefined },
    { label: "Years active", value: stats.years, text: undefined },
  ].filter((s) => s.value > 0);

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/events"].title}
        description={PAGE_SEO["/events"].description}
        url={`${BASE_URL}/events`}
      />

      <PageHero
        ambient
        className="mb-0"
        band={<span className="truncate">Saad Mazhar · Events & hosting</span>}
      >
        <div className="relative max-w-[760px]">
          <div className="animate-rise">
            <Eyebrow>Events & hosting</Eyebrow>
          </div>
          <h1 className="mt-8 text-display-xl font-medium md:mt-10">
            <RisingWords text="Every stage," /> <RisingWords text="a new story" from={2} className="soft" />
          </h1>
          <p className="mt-8 max-w-[580px] animate-rise text-body-l text-fg-2 [animation-delay:350ms]">
            Hosting, compering, speaking and organising: the rooms I’ve held, the crowds I’ve met and the
            events I helped bring to life.
          </p>
          {heroStats.length > 0 && (
            <dl className="mt-12 grid max-w-[680px] animate-rise grid-cols-2 gap-6 [animation-delay:450ms] sm:grid-cols-4">
              {heroStats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-2 border-l border-line-2 pl-4">
                  <dt className="label text-fg-3">{s.label}</dt>
                  <dd className="text-display-m font-medium leading-none">
                    {s.text ?? <CountUp value={s.value} />}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </PageHero>

      {featured.length > 0 && (
        <section className="section screen theme-light border-t-0" aria-labelledby="featured">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="featured" label="Featured" title="Biggest" soft="rooms" />
            </Reveal>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 md:gap-6">
              {featured.map((e, i) => (
                <Reveal key={e.id} delay={i * 100} className={i === 0 ? "md:row-span-2" : undefined}>
                  <Feature event={e} big={i === 0} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section screen border-t-0" aria-labelledby="all-events">
        <div className="wrap">
          <Reveal>
            <SectionHeader id="all-events" label="Timeline" title="All" soft="events" />
          </Reveal>
          {tabs.length > 2 && <RoleTabs tabs={tabs} value={role} onChange={setRole} />}
          {isLoading ? (
            <Skeleton className="mt-10 aspect-video w-full rounded-media" />
          ) : groups.length === 0 ? (
            <Empty>No events here yet.</Empty>
          ) : (
            <div ref={rail} className="relative mt-12 flex flex-col gap-20 md:pl-14">
              <span
                aria-hidden
                className="absolute bottom-0 left-[11px] top-2 hidden w-0.5 rounded-full bg-line-2 md:block"
              />
              <span
                aria-hidden
                className="absolute left-[11px] top-2 hidden w-0.5 origin-top rounded-full bg-gradient-to-b from-accent via-accent to-accent/30 md:block"
                style={{ height: "calc(100% - 0.5rem)", transform: `scaleY(${fill})` }}
              />
              {groups.map(([year, list]) => (
                <section key={year} aria-labelledby={`events-${year}`} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[51px] top-3 hidden size-4 rounded-full border-2 border-accent bg-base md:block"
                  />
                  <div className="mb-10 flex items-center gap-4">
                    <h2 id={`events-${year}`} className="text-h2 font-medium tabular-nums">
                      {year}
                    </h2>
                    <span className="label text-fg-3">
                      {list.length} {list.length === 1 ? "event" : "events"}
                    </span>
                    <div className="h-px flex-1 bg-line-2" aria-hidden="true" />
                  </div>
                  <div className="grid gap-x-6 gap-y-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((e, i) => (
                      <Reveal key={e.id} delay={(i % 3) * 80}>
                        <EventCard event={e} />
                      </Reveal>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      {photos.length >= 6 && (
        <section className="section screen theme-light border-t-0" aria-labelledby="wall">
          <div className="wrap">
            <Reveal>
              <SectionHeader id="wall" label="Photo wall" title="From the" soft="floor" />
            </Reveal>
            <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
              {photos.map(({ e, src }, i) => (
                <Reveal key={src} delay={(i % 4) * 60} className="break-inside-avoid">
                  <Link to={eventPath(e)} className="group relative block overflow-hidden rounded-card">
                    <img
                      src={src}
                      alt={eventPhotoAlt(e, src)}
                      loading="lazy"
                      className="w-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {e.title}
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section screen theme-orange border-t-0">
        <div className="wrap flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <h2 className="text-display-m font-medium">
            Want me to host or speak <span className="soft">at your event?</span>
          </h2>
          <Button to="/contact?topic=speaking" size="lg">
            Send an invite
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default EventsPage;
