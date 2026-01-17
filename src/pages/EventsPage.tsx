import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  Mic2, 
  Users, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Filter,
  ChevronDown,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const events = [
  {
    id: 1,
    title: "TechCrunch Disrupt 2024",
    role: "Host",
    type: "host",
    description: "Hosted the main stage startup pitch competition with 2,000+ attendees. Facilitated Q&A sessions with top VCs and moderated panel discussions on the future of AI startups.",
    date: "October 2024",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
    ],
  },
  {
    id: 2,
    title: "Google Developer Summit",
    role: "Speaker",
    type: "speaker",
    description: "Delivered keynote on AI-first product development strategies to 500+ developers. Shared insights on building scalable ML pipelines and integrating AI into existing products.",
    date: "September 2024",
    location: "Mountain View, CA",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
      "https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=800&q=80",
    ],
  },
  {
    id: 3,
    title: "HackMIT 2024",
    role: "Organizer",
    type: "organizer",
    description: "Led organization of 800+ participant hackathon with $50K in prizes. Managed sponsor relations, logistics, and judging coordination for MIT's premier hackathon.",
    date: "September 2024",
    location: "Cambridge, MA",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    ],
  },
  {
    id: 4,
    title: "ProductCon San Francisco",
    role: "Compere",
    type: "host",
    description: "Master of ceremonies for the largest product management conference in the Bay Area. Introduced keynote speakers and facilitated networking sessions.",
    date: "August 2024",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    ],
  },
  {
    id: 5,
    title: "AWS re:Invent 2023",
    role: "Attended",
    type: "attended",
    description: "Participated in workshops on serverless architecture and modern cloud-native development patterns. Networked with cloud architects from Fortune 500 companies.",
    date: "November 2023",
    location: "Las Vegas, NV",
    image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1200&q=80",
    gallery: [],
  },
  {
    id: 6,
    title: "YC Startup School Demo Day",
    role: "Speaker",
    type: "speaker",
    description: "Presented our startup to 200+ investors and fellow founders. Shared our journey from idea to MVP and lessons learned along the way.",
    date: "October 2023",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=800&q=80",
    ],
  },
];

const roleFilters = [
  { label: "All", value: "all" },
  { label: "Host / Compere", value: "host" },
  { label: "Speaker", value: "speaker" },
  { label: "Organizer", value: "organizer" },
  { label: "Attended", value: "attended" },
];

const roleColors: Record<string, string> = {
  Host: "bg-accent text-accent-foreground",
  Compere: "bg-accent text-accent-foreground",
  Speaker: "bg-green-600 text-white",
  Organizer: "bg-purple-600 text-white",
  Attended: "bg-secondary text-secondary-foreground",
};

const EventsPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const filteredEvents = events.filter((event) => {
    if (activeFilter === "all") return true;
    return event.type === activeFilter;
  });

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="section-title">Public Presence</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Events & Hosting
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              From hosting tech conferences to speaking at industry events,
              building community, sharing knowledge, and connecting with brilliant minds.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
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
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {filter.label}
              </button>
            ))}
          </motion.div>

          {/* Events Grid */}
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="bg-card rounded-xl border border-border overflow-hidden card-hover">
                    <div className="grid lg:grid-cols-5 gap-0">
                      {/* Event Image */}
                      <div className="lg:col-span-2 relative h-64 lg:h-auto">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Role Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg",
                            roleColors[event.role] || roleColors.Attended
                          )}>
                            {(event.role === "Host" || event.role === "Compere") && <Mic2 className="w-3 h-3" />}
                            {event.role === "Speaker" && <Mic2 className="w-3 h-3" />}
                            {event.role === "Organizer" && <Users className="w-3 h-3" />}
                            {event.role}
                          </span>
                        </div>
                        
                        {/* Gallery indicator */}
                        {event.gallery.length > 0 && (
                          <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            {event.gallery.length} photos
                          </div>
                        )}
                      </div>

                      {/* Event Content */}
                      <div className="lg:col-span-3 p-6 lg:p-8 flex flex-col">
                        <div className="flex-1">
                          <h3 className="font-display text-xl lg:text-2xl font-semibold text-foreground mb-3">
                            {event.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                        
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        </div>

                        {/* Gallery Preview */}
                        {event.gallery.length > 0 && (
                          <div className="pt-4 border-t border-border">
                            <button
                              onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                              className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                            >
                              View Gallery
                              <ChevronDown className={cn(
                                "w-4 h-4 transition-transform duration-300",
                                expandedEvent === event.id && "rotate-180"
                              )} />
                            </button>
                            
                            <AnimatePresence>
                              {expandedEvent === event.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="grid grid-cols-3 gap-2 mt-4">
                                    {event.gallery.map((img, idx) => (
                                      <img
                                        key={idx}
                                        src={img}
                                        alt={`${event.title} gallery ${idx + 1}`}
                                        className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                                      />
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventsPage;
