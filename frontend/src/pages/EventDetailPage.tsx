import { useParams, Link } from "react-router-dom";
import { m } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Mic2, Users, Calendar, MapPin, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/useContent";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { SEO } from "@/components/SEO";
import { BASE_URL } from "@/lib/seo-content.js";

const roleColors: Record<string, string> = {
  Host: "bg-accent text-accent-foreground",
  Compere: "bg-accent text-accent-foreground",
  Speaker: "bg-success text-success-foreground",
  Organizer: "bg-secondary text-secondary-foreground",
  Attended: "bg-muted text-muted-foreground",
};

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: firestoreEvents = [] } = useEvents();

  const firestoreEvent = firestoreEvents.find((e) => e.id === id);

  // Normalise to a common shape for rendering
  const event = firestoreEvent
    ? {
        ...firestoreEvent,
        role: firestoreEvent.role ?? firestoreEvent.type ?? "",
        fullDescription: firestoreEvent.description,
        gallery:
          firestoreEvent.images && firestoreEvent.images.length > 0
            ? firestoreEvent.images
            : firestoreEvent.image
              ? [firestoreEvent.image]
              : [],
        highlights: firestoreEvent.highlights ?? [],
        attendees: firestoreEvent.attendees,
      }
    : null;

  if (!event) {
    return (
      <Layout>
        <SEO title="Event Not Found" noIndex />
        <section className="section-padding">
          <div className="section-container text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.fullDescription,
    startDate: event.date,
    location: { "@type": "Place", name: event.location },
    image: event.image ?? event.gallery?.[0],
    performer: { "@type": "Person", name: "Saad Mazhar", url: BASE_URL },
    organizer: event.organizer ? { "@type": "Organization", name: event.organizer } : undefined,
  };

  return (
    <Layout>
      <SEO
        title={`${event.title} | Event`}
        description={event.description || event.fullDescription}
        image={event.image ?? event.gallery?.[0]}
        url={`${BASE_URL}/events/${id}`}
        type="article"
        structuredData={eventSchema}
        breadcrumbs={[
          { name: "Events", url: `${BASE_URL}/events` },
          { name: event.title, url: `${BASE_URL}/events/${id}` },
        ]}
      />
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          {(event.image || (event.gallery && event.gallery[0])) && (
            <img
              src={event.image ?? event.gallery![0]}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 section-container pb-12">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg mb-4",
                roleColors[event.role] || roleColors.Attended,
              )}
            >
              {(event.role === "Host" || event.role === "Compere") && <Mic2 className="w-3 h-3" />}
              {event.role === "Speaker" && <Mic2 className="w-3 h-3" />}
              {event.role === "Organizer" && <Users className="w-3 h-3" />}
              {event.role}
            </span>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {event.date}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
              {event.attendees && (
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {event.attendees} attendees
                </span>
              )}
            </div>
          </m.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed">{event.fullDescription}</p>
              </m.div>

              {/* Highlights */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">Highlights</h3>
                <ul className="space-y-3">
                  {event.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </m.div>

              {/* Photo Gallery */}
              {event.gallery && event.gallery.length > 0 && (
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-accent" />
                    <h3 className="font-display text-xl font-semibold text-foreground">Event Gallery</h3>
                    <span className="text-sm text-muted-foreground">
                      ({event.gallery.length} photo{event.gallery.length !== 1 ? "s" : ""})
                    </span>
                  </div>

                  {/* Swipeable carousel with lightbox */}
                  <ImageCarousel
                    images={event.gallery}
                    alt={event.title}
                    className="rounded-2xl overflow-hidden"
                  />

                  {/* Scrollable thumbnail strip for multiple images */}
                  {event.gallery.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
                      {event.gallery.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`${event.title} thumbnail ${i + 1}`}
                          className="h-16 w-24 flex-shrink-0 object-cover rounded-lg border border-border opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                      ))}
                    </div>
                  )}
                </m.div>
              )}
            </div>

            {/* Sidebar */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Event Details</h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Role</span>
                    <p className="text-foreground font-medium">{event.role}</p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Date</span>
                    <p className="text-foreground font-medium">{event.date}</p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Location</span>
                    <p className="text-foreground font-medium">{event.location}</p>
                  </div>

                  {event.attendees && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Attendees
                      </span>
                      <p className="text-foreground font-medium">{event.attendees}</p>
                    </div>
                  )}

                  {event.organizer && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Organizer
                      </span>
                      <p className="text-foreground font-medium">{event.organizer}</p>
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventDetailPage;
