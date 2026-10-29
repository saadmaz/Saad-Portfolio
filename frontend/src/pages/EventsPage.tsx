import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { Mic2, Users, Calendar, MapPin, ChevronDown, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/useContent";

const roleFilters = [
  { label: "All", value: "all" },
  { label: "Host / Compere", value: "host" },
  { label: "Speaker", value: "speaker" },
  { label: "Organizer", value: "organizer" },
  { label: "Attended", value: "attended" },
];

const roleColors: Record<string, string> = {
  host: "bg-accent text-accent-foreground",
  compere: "bg-accent text-accent-foreground",
  speaker: "bg-success text-success-foreground",
  organizer: "bg-secondary text-secondary-foreground",
  attended: "bg-muted text-muted-foreground",
};

const getRoleColor = (role: string) => roleColors[role?.toLowerCase()] ?? roleColors.attended;

const EventsPage = () => {
  const { data: events = [], isLoading } = useEvents();
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const filteredEvents = events.filter((event) => {
    if (activeFilter === "all") return true;
    const r = event.role?.toLowerCase() ?? "";
    if (activeFilter === "host") return r === "host" || r === "compere";
    return r === activeFilter;
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="section-container space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-secondary/30 animate-pulse" />
            ))}
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/events"].title}
        description={PAGE_SEO["/events"].description}
        url={`${BASE_URL}/events`}
      />
      <section className="section-padding">
        <div className="section-container">
          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="section-title">Public Presence</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Events &amp; Hosting
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              From hosting tech conferences to speaking at industry events - building community, sharing
              knowledge, and connecting with brilliant minds.
            </p>
          </m.div>

          {/* Filters */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {roleFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeFilter === filter.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {filter.label}
              </button>
            ))}
          </m.div>

          {/* Empty state */}
          {filteredEvents.length === 0 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-muted-foreground"
            >
              <p className="text-lg mb-4">No events found.</p>
              <button
                onClick={() => setActiveFilter("all")}
                className="px-5 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted text-sm font-medium transition-colors"
              >
                Clear filter
              </button>
            </m.div>
          )}

          {/* Events list */}
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, index) => {
                const gallery = event.images ?? [];
                return (
                  <m.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div className="bg-card rounded-xl border border-border overflow-hidden card-hover">
                      <div className="grid lg:grid-cols-5 gap-0">
                        {/* Event image */}
                        <div className="lg:col-span-2 relative h-64 lg:h-auto bg-muted">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary/50" />
                          )}
                          {/* Role badge */}
                          {event.role && (
                            <div className="absolute top-4 left-4">
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
                          {/* Gallery indicator */}
                          {gallery.length > 0 && (
                            <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5" />
                              {gallery.length} photos
                            </div>
                          )}
                        </div>

                        {/* Event content */}
                        <div className="lg:col-span-3 p-6 lg:p-8 flex flex-col">
                          <div className="flex-1">
                            <h3 className="font-display text-xl lg:text-2xl font-semibold text-foreground mb-3">
                              {event.title}
                            </h3>
                            <p className="text-muted-foreground mb-4 leading-relaxed">{event.description}</p>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {event.date}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            )}
                          </div>

                          {/* Gallery preview */}
                          {gallery.length > 0 && (
                            <div className="pt-4 border-t border-border">
                              <button
                                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                              >
                                View Gallery
                                <ChevronDown
                                  className={cn(
                                    "w-4 h-4 transition-transform duration-300",
                                    expandedEvent === event.id && "rotate-180",
                                  )}
                                />
                              </button>

                              <AnimatePresence>
                                {expandedEvent === event.id && (
                                  <m.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                      {gallery.map((img, idx) => (
                                        <img
                                          key={idx}
                                          src={img}
                                          alt={`${event.title} gallery ${idx + 1}`}
                                          className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                                          loading="lazy"
                                        />
                                      ))}
                                    </div>
                                  </m.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </m.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventsPage;
