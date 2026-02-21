import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Mail, Phone, MapPin, ArrowRight, Instagram, 
  Facebook, Github, Linkedin, X, Calendar, LucideIcon 
} from "lucide-react";

// --- Types & Data ---

interface SocialLink {
  Icon: LucideIcon;
  href: string;
  label: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { Icon: Linkedin, href: "https://linkedin.com/in/saadmaz", label: "LinkedIn" },
  { Icon: Github, href: "https://github.com/saadmaz", label: "GitHub" },
  { Icon: Instagram, href: "https://instagram.com/saadmazhar_", label: "Instagram" },
  { Icon: Facebook, href: "https://facebook.com/saadmazhar", label: "Facebook" },
  { Icon: X, href: "https://x.com/SaadMazhar_", label: "X (Twitter)" },
];

// --- Sub-components ---

const ContactMethod = ({ icon: Icon, text, href }: { icon: LucideIcon, text: string, href?: string }) => {
  const className = "flex items-center gap-3 text-muted-foreground transition-colors group text-sm";
  const content = (
    <>
      <Icon className="w-4 h-4 text-accent" />
      <span>{text}</span>
    </>
  );

  return href ? (
    <a href={href} className={`${className} hover:text-accent`}>{content}</a>
  ) : (
    <div className={className}>{content}</div>
  );
};

// --- Main Component ---

export function ContactSection() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <section className="py-12 bg-secondary" aria-labelledby="contact-heading">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Information */}
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
            <span className="inline-block text-2xl font-bold uppercase tracking-wider text-accent mb-2">
              Get in Touch
            </span>
            <h2 id="contact-heading" className="font-display text-3xl font-bold mb-4 leading-tight text-foreground">
              Let's Build Something Great Together
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to say hello, I'd love to hear from you.
            </p>

            <div className="space-y-3 mb-6">
              <ContactMethod icon={Mail} text="saadmazaa@gmail.com" href="mailto:saadmazaa@gmail.com" />
              <ContactMethod icon={Phone} text="+94 72 01 358 01" href="tel:+94720135801" />
              <ContactMethod icon={MapPin} text="Colombo, Sri Lanka" />
            </div>

            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-md bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Interactive Cards */}
          <motion.div 
            {...fadeInUp} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Internal CTA */}
            <Link to="/contact" className="contact-card group">
              <CardContent 
                icon={Mail} 
                title="Send a Message" 
                description="Get a response within 24 hours." 
              />
            </Link>

            {/* External CTA */}
            <a href="https://cal.com/saad-mazhar" target="_blank" rel="noopener noreferrer" className="contact-card group">
              <CardContent 
                icon={Calendar} 
                title="Schedule a Call" 
                description="Book a 30-minute chat." 
              />
            </a>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}

// Helper for Card Layout
const CardContent = ({ icon: Icon, title, description }: { icon: LucideIcon, title: string, description: string }) => (
  <div className="flex items-center justify-between p-5 rounded-xl bg-card border border-border hover:border-accent/50 transition-all">
    <div className="space-y-1">
      <h3 className="font-display text-lg font-semibold flex items-center gap-2 text-foreground group-hover:text-accent transition-colors">
        <Icon className="w-4 h-4 text-accent" />
        {title}
      </h3>
      <p className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors">
        {description}
      </p>
    </div>
    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
  </div>
);
