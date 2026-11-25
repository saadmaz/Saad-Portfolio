import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { Button, Eyebrow, Media, PageHero, Reveal, Skeleton, Tag } from "@/components/ui";
import { EventCard } from "@/components/cards";
import { Gallery } from "@/components/Gallery";
import { useEvents } from "@/hooks/useContent";
import { fullDate } from "@/lib/format";
import { roleColor } from "@/lib/eventStats";
import { eventPhotoAlt } from "@/lib/imageAlt";
import { isEventIndexable } from "@/lib/indexing";
import { BASE_URL, eventDescriptionOf } from "@/lib/seo-content";
import { eventPath, matchesKey } from "@/lib/paths";

const EventDetailPage = () => {
  const { id } = useParams();
  const { data = [], isLoading } = useEvents();

  if (isLoading)
    return (
      <Layout>
        <div className="wrap flex flex-col gap-8 py-24">
          <Skeleton className="h-24 w-2/3" />
          <Skeleton className="aspect-[4/3] max-h-[70svh] w-full rounded-media sm:aspect-[2/1]" />
        </div>
      </Layout>
    );
  const event = data.find((e) => matchesKey(e, id));
  // A real "not found" (the server already answered 404), not a silent jump to the list.
  if (!event) return <NotFound />;
  // Old ID links land on the readable URL.
  if (event.slug && id !== event.slug) return <Navigate to={eventPath(event)} replace />;

  const cover = event.image || event.images?.[0];
  const gallery = (event.images ?? []).filter((src) => src !== cover);
  // data is newest-first: "newer" is the previous index, "older" the next.
  const at = data.indexOf(event);
  const newer = at > 0 ? data[at - 1] : undefined;
  const older = at < data.length - 1 ? data[at + 1] : undefined;
  const others = data.filter((e) => e.id !== event.id);
  const more = [
    ...others.filter((e) => e.role === event.role),
    ...others.filter((e) => e.role !== event.role),
  ].slice(0, 3);
  const details = [
    ["Role", event.role],
    ["Date", fullDate(event.date)],
    ["Location", event.location],
    ["Audience", event.attendees],
    ["Organiser", event.organizer],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <Layout>
      <SEO
        title={event.title}
        description={eventDescriptionOf(event)}
        url={`${BASE_URL}${eventPath(event)}`}
        // Thin write-ups stay out of search (same rule as the prerendered copy).
        noIndex={isEventIndexable(event) ? false : "follow"}
      />
      <PageHero
        band="Saad Mazhar · Events"
        media={
          <Media
            src={cover}
            alt={cover ? eventPhotoAlt(event, cover) : event.title}
            className="absolute inset-0 [&_img]:object-[50%_30%]"
            priority
          />
        }
      >
        <Link to="/events" className="text-sm text-fg-2 hover:text-fg">
          ← All events
        </Link>
        <div className="mt-8 flex flex-wrap gap-2">
          {event.role && (
            <span
              className="label rounded-full px-3 py-1.5 text-white"
              style={{ background: roleColor(event.role) }}
            >
              {event.role}
            </span>
          )}
          {event.type && event.type !== "Other" && <Tag>{event.type}</Tag>}
        </div>
        <h1 className="mt-6 max-w-[1100px] text-[clamp(2.25rem,min(5.6vw,6.8svh),6rem)] font-medium leading-[0.95] tracking-[-0.045em]">
          {event.title}
        </h1>
        <p className="mt-6 text-h2 font-light text-fg-2">{event.organizer}</p>
      </PageHero>

      {details.length > 0 && (
        <section className="wrap pt-12" aria-label="Key facts">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line-2 bg-line-2 md:grid-cols-5">
            {details.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1.5 bg-base p-5">
                <dt className="label text-fg-3">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="wrap grid gap-14 py-20 md:grid-cols-[minmax(0,1fr)_280px] md:gap-24">
        <article className="flex max-w-prose flex-col gap-8">
          <span className="label text-accent">About</span>
          <p className="whitespace-pre-line text-body-l text-fg-2">{event.description}</p>
        </article>
        <aside className="flex flex-col gap-4">
          {event.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          ) : null}
          {event.link && (
            <Button href={event.link} variant="secondary">
              Event page
            </Button>
          )}
          <Button to="/contact?topic=hosting" variant="ghost">
            Invite me to host
          </Button>
        </aside>
      </section>

      {event.highlights?.length ? (
        <section className="wrap pb-20" aria-labelledby="highlights">
          <h2 id="highlights" className="label mb-6 text-fg-3">
            Highlights
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.highlights.map((h, i) => (
              <li key={h}>
                <Reveal
                  delay={i * 80}
                  className="flex h-full flex-col gap-4 rounded-card border border-line bg-surface/50 p-6"
                >
                  <span className="font-mono text-display-m font-medium leading-none text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-fg-2">{h}</span>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {gallery.length > 0 && (
        <Gallery
          images={gallery}
          title={event.title}
          alts={gallery.map((src) => eventPhotoAlt(event, src))}
        />
      )}

      {(newer || older) && (
        <nav className="wrap grid gap-4 border-t border-line-2 py-10 sm:grid-cols-2" aria-label="More events">
          {older ? (
            <Link to={eventPath(older)} className="group flex flex-col gap-2">
              <span className="label inline-flex items-center gap-2 text-fg-3">
                <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-1" />{" "}
                Earlier
              </span>
              <span className="font-medium group-hover:text-accent">{older.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link to={eventPath(newer)} className="group flex flex-col items-end gap-2 text-right">
              <span className="label inline-flex items-center gap-2 text-fg-3">
                Later{" "}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="font-medium group-hover:text-accent">{newer.title}</span>
            </Link>
          )}
        </nav>
      )}

      {more.length > 0 && (
        <section className="section">
          <div className="wrap">
            <Eyebrow>{event.role ? `More as ${event.role.toLowerCase()}` : "More on stage"}</Eyebrow>
            <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default EventDetailPage;
