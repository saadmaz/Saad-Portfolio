import { m } from "framer-motion";
import { ArrowRight, Mic2, Users, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const featuredEvents = [
  {
    id: 1,
    title: "TechCrunch Disrupt 2024",
    role: "Host",
    roleColor: "bg-accent text-accent-foreground",
    description: "Hosted the main stage startup pitch competition with 2,000+ attendees",
    date: "October 2024",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  },
  {
    id: 2,
    title: "Google Developer Summit",
    role: "Speaker",
    roleColor: "bg-success text-success-foreground",
    description: "Delivered keynote on AI-first product development strategies",
    date: "September 2024",
    location: "Mountain View, CA",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
  },
  {
    id: 3,
    title: "HackMIT 2024",
    role: "Organizer",
    roleColor: "bg-secondary text-secondary-foreground",
    description: "Led organization of 800+ participant hackathon with $50K in prizes",
    date: "September 2024",
    location: "Cambridge, MA",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  },
];

export function EventsPreview() {
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
                Events & Hosting
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event, index) => (
            <m.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/events/${event.id}`} className="group block h-full">
                <div className="bg-card rounded-xl border border-border overflow-hidden h-full card-hover">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${event.roleColor} shadow-lg`}>
                        {(event.role === "Host" || event.role === "Speaker") && <Mic2 className="w-3 h-3" />}
                        {event.role === "Organizer" && <Users className="w-3 h-3" />}
                        {event.role}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    {/* Dark cinematic overlay on hover */}
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
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{event.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
