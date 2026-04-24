import { m } from "framer-motion";
import { ArrowRight, Mic2, Users, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/shared/hooks/useCommon";
import { cn } from "@/shared/lib/utils";

const getRoleColor = (role?: string): string => {
  const r = role?.toLowerCase() ?? "";
  if (r === "host" || r === "compere") return "bg-accent text-accent-foreground";
  if (r === "speaker")  return "bg-success text-success-foreground";
  if (r === "organizer") return "bg-secondary text-secondary-foreground";
  return "bg-muted text-muted-foreground";
};

export function EventsPreview() {
  const { data: events = [], isLoading } = useEvents();
  const featured = events.slice(0, 3);

  return (
    <section className="section-padding">
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
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Events &amp; Hosting
              </h2>
              <p className="text-muted-foreground max-w-xl">
                From hosting tech conferences to speaking at industry events -
                building community and sharing knowledge.
              </p>
            </div>
            <Link to="/events" className="btn-ghost-arrow w-fit">
              See All Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </m.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl bg-secondary/30 animate-pulse aspect-[4/3]" />
            ))}
          </div>
        ) : featured.length === 0 ? null : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((event, index) => (
              <m.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/events/${event.id}`} className="group block h-full">
                  <div className="bg-card rounded-xl border border-border overflow-hidden h-full card-hover">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {event.image && (
                        <img
                          src={event.image}
                          alt={event.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      {event.role && (
                        <div className="absolute top-4 left-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg",
                            getRoleColor(event.role)
                          )}>
                            {(event.role.toLowerCase() === "host" || event.role.toLowerCase() === "compere" || event.role.toLowerCase() === "speaker") && (
                              <Mic2 className="w-3 h-3" />
                            )}
                            {event.role.toLowerCase() === "organizer" && (
                              <Users className="w-3 h-3" />
                            )}
                            {event.role}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />{event.date}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />{event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </m.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
