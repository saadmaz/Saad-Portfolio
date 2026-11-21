import { Link, Navigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import NotFound from "./NotFound";
import { Button, Eyebrow, Media, Skeleton, Tag } from "@/components/ui";
import { EventCard } from "@/components/cards";
import { Gallery } from "@/components/Gallery";
import { useEvents } from "@/hooks/useContent";
import { fullDate } from "@/lib/format";
import { eventPhotoAlt } from "@/lib/imageAlt";
import { BASE_URL } from "@/lib/seo-content";
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
  // data is newest-first.
  const more = data.filter((e) => e.id !== event.id).slice(0, 3);
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
        description={event.description?.slice(0, 160)}
        url={`${BASE_URL}${eventPath(event)}`}
      />
      <header className="wrap pb-14 pt-12 md:pt-20">
        <Link to="/events" className="text-sm text-fg-2 hover:text-fg">
          ← All events
        </Link>
        <div className="mt-10 flex flex-wrap gap-2">
          {event.role && <Tag active>{event.role}</Tag>}
          {event.type && event.type !== "Other" && <Tag>{event.type}</Tag>}
        </div>
        <h1 className="mt-6 max-w-[1000px] text-display-l font-medium">{event.title}</h1>
        <p className="mt-6 text-h2 font-light text-fg-2">{event.organizer}</p>
      </header>

      <div className="wrap">
        {/* Capped to the viewport so the photo never fills a laptop screen; crop leans high to keep faces. */}
        <Media
          src={cover}
          alt={cover ? eventPhotoAlt(event, cover) : event.title}
          className="aspect-[4/3] max-h-[70svh] w-full sm:aspect-[2/1] [&_img]:object-[50%_30%]"
          priority
        />
      </div>

      <section className="wrap grid gap-14 py-24 md:grid-cols-[320px_1fr] md:gap-24">
        <aside className="flex flex-col">
          {details.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1.5 border-t border-line-2 py-4">
              <span className="label text-fg-3">{k}</span>
              <span>{v}</span>
            </div>
          ))}
          {event.link && (
            <div className="border-t border-line-2 pt-6">
              <Button href={event.link} variant="secondary">
                Event page
              </Button>
            </div>
          )}
        </aside>
        <article className="flex max-w-prose flex-col gap-8">
          <span className="label text-accent">About</span>
          <p className="whitespace-pre-line text-body-l text-fg-2">{event.description}</p>
          {event.highlights?.length ? (
            <div className="flex flex-col gap-4 pt-4">
              <span className="label text-fg-3">Highlights</span>
              <ul className="flex flex-col gap-3">
                {event.highlights.map((h) => (
                  <li key={h} className="flex gap-3.5">
                    <span aria-hidden className="mt-[11px] size-1.5 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </section>

      {gallery.length > 0 && (
        <Gallery
          images={gallery}
          title={event.title}
          alts={gallery.map((src) => eventPhotoAlt(event, src))}
        />
      )}

      {more.length > 0 && (
        <section className="section">
          <div className="wrap">
            <Eyebrow>More on stage</Eyebrow>
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
