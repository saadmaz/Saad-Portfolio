import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  Mic2, 
  Users, 
  Calendar, 
  MapPin, 
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Event data - in real app, this would come from an API or CMS
const eventsData: Record<string, {
  id: string;
  title: string;
  role: string;
  type: string;
  description: string;
  fullDescription: string;
  date: string;
  location: string;
  image: string;
  gallery: string[];
  highlights: string[];
  attendees?: string;
  organizer?: string;
}> = {
  "1": {
    id: "1",
    title: "TechCrunch Disrupt 2024",
    role: "Host",
    type: "host",
    description: "Hosted the main stage startup pitch competition with 2,000+ attendees.",
    fullDescription: "As the main stage host for TechCrunch Disrupt 2024, I had the privilege of facilitating one of the most anticipated startup events of the year. I introduced keynote speakers, moderated panel discussions on AI and the future of startups, and conducted live Q&A sessions with top-tier venture capitalists. The event brought together founders, investors, and tech enthusiasts from around the world.",
    date: "October 15-17, 2024",
    location: "Moscone Center, San Francisco, CA",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
      "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&q=80",
      "https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=800&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    ],
    highlights: [
      "Hosted main stage for 3 consecutive days",
      "Facilitated Q&A with 15+ VCs and founders",
      "Moderated 5 panel discussions on emerging tech",
      "Introduced keynote speakers including industry leaders",
    ],
    attendees: "2,000+",
    organizer: "TechCrunch",
  },
  "2": {
    id: "2",
    title: "Google Developer Summit",
    role: "Speaker",
    type: "speaker",
    description: "Delivered keynote on AI-first product development strategies.",
    fullDescription: "Invited as a keynote speaker at Google Developer Summit, I shared insights on building AI-first products and integrating machine learning into existing applications. The talk covered practical strategies for developers looking to leverage AI, including best practices for ML pipelines, model deployment, and user experience considerations.",
    date: "September 22, 2024",
    location: "Google Campus, Mountain View, CA",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
      "https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=800&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
      "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    ],
    highlights: [
      "45-minute keynote presentation",
      "Live coding demonstration",
      "500+ developers in attendance",
      "Q&A session with audience",
    ],
    attendees: "500+",
    organizer: "Google Developers",
  },

  
  "3": {
    id: "3",
    title: "HackMIT 2024",
    role: "Organizer",
    type: "organizer",
    description: "Led organization of 800+ participant hackathon with $50K in prizes.",
    fullDescription: "As lead organizer for HackMIT 2024, I coordinated all aspects of MIT's premier hackathon. This included managing sponsor relations with major tech companies, coordinating logistics for 800+ participants, organizing judging panels, and ensuring smooth execution of the 36-hour event. The hackathon featured $50K in prizes and workshops from industry experts.",
    date: "September 14-15, 2024",
    location: "MIT Campus, Cambridge, MA",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
      "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&q=80",
      "https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=800&q=80",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    ],
    highlights: [
      "Managed 50+ sponsors and partners",
      "Coordinated 100+ mentor volunteers",
      "Organized judging with 30 industry experts",
      "36-hour event with zero major incidents",
    ],
    attendees: "800+",
    organizer: "MIT",
  },
};

const roleColors: Record<string, string> = {
  Host: "bg-accent text-accent-foreground",
  Compere: "bg-accent text-accent-foreground",
  Speaker: "bg-green-600 text-white",
  Organizer: "bg-purple-600 text-white",
  Attended: "bg-secondary text-secondary-foreground",
};

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const event = id ? eventsData[id] : null;

  if (!event) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="section-container text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Event Not Found
            </h1>
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 section-container pb-12">
          <motion.div
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
            
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg mb-4",
              roleColors[event.role] || roleColors.Attended
            )}>
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
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  About This Event
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {event.fullDescription}
                </p>
              </motion.div>

              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  Highlights
                </h3>
                <ul className="space-y-3">
                  {event.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Photo Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <ImageIcon className="w-5 h-5 text-accent" />
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    Event Gallery
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    ({event.gallery.length} photos)
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {event.gallery.slice(0, 10).map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
                    >
                      <img
                        src={img}
                        alt={`${event.title} - Photo ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Event Details
                </h3>
                
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
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Attendees</span>
                      <p className="text-foreground font-medium">{event.attendees}</p>
                    </div>
                  )}
                  
                  {event.organizer && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Organizer</span>
                      <p className="text-foreground font-medium">{event.organizer}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventDetailPage;
