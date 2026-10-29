import { useState, useEffect, useRef } from "react";
import { m } from "framer-motion";
import { ArrowRight, Mic2, Users, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/hooks/useContent";
import { Event } from "@/types";
import { cn } from "@/lib/utils";

const getRoleColor = (role?: string): string => {
  const r = role?.toLowerCase() ?? "";
  if (r === "host" || r === "compere") return "bg-accent text-accent-foreground";
  if (r === "speaker") return "bg-success text-success-foreground";
  if (r === "organizer") return "bg-secondary text-secondary-foreground";
  return "bg-muted text-muted-foreground";
};

function EventCard({ event, index }: { event: Event; index: number }) {
  const images = [event.image, ...(event.images || [])].filter(Boolean) as string[];
  const [imgIndex, setImgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [dateBadgeVisible, setDateBadgeVisible] = useState(false);

  const startCycle = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setImgIndex((i) => (i + 1) % images.length);
    }, 1200);
  };

  const stopCycle = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setImgIndex(0);
  };

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/events/${event.id}`}
        className="group block h-full"
        onMouseEnter={() => {
          startCycle();
          setDateBadgeVisible(true);
        }}
        onMouseLeave={() => {
          stopCycle();
          setDateBadgeVisible(false);
        }}
      >
        <div
          className="bg-card rounded-xl border border-border overflow-hidden h-full transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-[5px]"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 0 0 1.5px hsl(var(--accent)), 0 16px 40px rgba(0,0,0,0.10)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "";
          }}
        >
          {/* Image container */}
          <div className="relative h-52 overflow-hidden bg-muted">
            {images.length > 0 &&
              images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={event.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    opacity: i === imgIndex ? 1 : 0,
                    transform: i === imgIndex ? "scale(1.06)" : "scale(1)",
                  }}
                />
              ))}

            {/* Date badge — top-left, fully opaque on hover */}
            <div
              className={cn(
                "absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm text-xs font-semibold text-white shadow-lg transition-all duration-300",
                dateBadgeVisible ? "opacity-100 bg-black/75" : "opacity-60 bg-black/50",
              )}
            >
              <Calendar className="w-3 h-3" />
              {event.date}
            </div>

            {/* Role badge — top-right */}
            {event.role && (
              <div className="absolute top-3 right-3 z-10">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg",
                    getRoleColor(event.role),
                  )}
                >
                  {(event.role.toLowerCase() === "host" ||
                    event.role.toLowerCase() === "compere" ||
                    event.role.toLowerCase() === "speaker") && <Mic2 className="w-3 h-3" />}
                  {event.role.toLowerCase() === "organizer" && <Users className="w-3 h-3" />}
                  {event.role}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

            {/* "View Details →" pill — slides up on hover */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 text-foreground text-xs font-semibold shadow-lg whitespace-nowrap">
                View Details <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors duration-[250ms]">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
            {event.location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </div>
            )}
          </div>
        </div>
      </Link>
    </m.div>
  );
}

export function EventsPreview() {
  const { data: events = [], isLoading } = useEvents();
  const featured = events.slice(0, 3);

  if (!isLoading && featured.length === 0) return null;

  return (
    <section aria-labelledby="events-heading" className="section-padding">
      <div className="section-container">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="section-title">Public Presence</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2
                id="events-heading"
                className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2"
              >
                Events &amp; Hosting
              </h2>
              <p className="text-muted-foreground max-w-xl">
                From hosting tech conferences to speaking at industry events — building community and sharing
                knowledge.
              </p>
            </div>
            <Link to="/events" className="btn-view-all shrink-0">
              See All Events
              <ArrowRight className="w-4 h-4 btn-arrow" />
            </Link>
          </div>
        </m.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-secondary/30 animate-pulse aspect-[4/3]" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
