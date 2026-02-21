import { motion } from "framer-motion"; // Imports motion for scroll-triggered and state-based animations
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Github, Linkedin, X, Calendar } from "lucide-react"; // SVG icons for contact methods and social media
import { Link } from "react-router-dom"; // Hook for client-side routing within the application

/**
 * ContactSection Component
 * * UI RESTORED: Reverted to the original 2-column layout structure.
 * * UPGRADED: Added 'bg-contact-gradient' for a professional Navy depth.
 * * REFINED: Enhanced glassmorphism for a high-end SaaS aesthetic.
 */
export function ContactSection() {
  return (
    // MAIN SECTION WRAPPER: 
    // 1. py-12 vertical padding restored.
    // 2. bg-contact-gradient applies the deep professional Navy you requested.
    // 3. overflow-hidden prevents animation jitters.
    <section className="py-12 bg-contact-gradient text-white overflow-hidden border-t border-white/5"> 
      <div className="section-container"> {/* Standardized container for horizontal centering and gutters */}
        
        <div className="grid lg:grid-cols-2 gap-12 items-center"> {/* Establishes a 2-column grid as per your previous UI */}
          
          {/* --- LEFT COLUMN: COMPACT CONTACT INFO --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} // Restored original animation offset
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5 }} 
          >
            {/* SUBTITLE: Restored 2xl font size and accent coloring */}
            <span className="inline-block text-2xl font-bold uppercase tracking-wider text-accent mb-2">
              Get in Touch
            </span>
            
            {/* PRIMARY HEADING: Restored 3xl size and leading-tight */}
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
              Let's Build Something Great Together
            </h2>
            
            {/* SUPPORTING TEXT: Slightly muted opacity to look better on Navy */}
            <p className="text-white/60 mb-6 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to say hello, I'd love to hear from you.
            </p>

            {/* CONTACT METHOD LIST */}
            <div className="space-y-3 mb-6">
              <a 
                href="mailto:saadmazaa@gmail.com" 
                className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors group text-sm"
              >
                <Mail className="w-4 h-4 text-accent" />
                <span>saadmazaa@gmail.com</span>
              </a>

              <a 
                href="tel:+94720135801" 
                className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors group text-sm"
              >
                <Phone className="w-4 h-4 text-accent" />
                <span>+94 72 01 358 01</span>
              </a>

              <div className="flex items-center gap-3 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* SOCIAL MEDIA LINKS: Restored original card-themed icons */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Linkedin, href: "https://linkedin.com/in/saadmaz" },
                { Icon: Github, href: "https://github.com/saadmaz" },
                { Icon: Instagram, href: "https://instagram.com/saadmazhar_" },
                { Icon: Facebook, href: "https://facebook.com/saadmazhar" },
                { Icon: X, href: "https://x.com/SaadMazhar_" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-white/5 border border-white/10 hover:bg-accent hover:text-white transition-all shadow-sm" 
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: COMPACT CTA CARDS --- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* SEND MESSAGE CARD: Glassmorphism refined for Dark Navy background */}
              <Link 
                to="/contact" 
                className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all group backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                      <Mail className="w-4 h-4 text-accent" />
                      Send a Message
                    </h3>
                    <p className="text-white/40 text-xs group-hover:text-white/70 transition-colors">
                      Get a response within 24 hours.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
                </div>
              </Link>

              {/* SCHEDULE CALL CARD */}
              <a 
                href="https://cal.com/saad-mazhar" 
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all group backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                      <Calendar className="w-4 h-4 text-accent" />
                      Schedule a Call
                    </h3>
                    <p className="text-white/40 text-xs group-hover:text-white/70 transition-colors">
                      Book a 30-minute chat via Cal.com
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
                </div>
              </a>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
