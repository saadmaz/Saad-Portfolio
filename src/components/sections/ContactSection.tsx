import { motion } from "framer-motion"; // Library for smooth, high-performance scroll and state animations
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Github, Linkedin, X, Calendar } from "lucide-react"; // Modern SVG icon set for clear communication
import { Link } from "react-router-dom"; // Essential for single-page application navigation without refreshing

export function ContactSection() {
  return (
    // MAIN SECTION WRAPPER: 
    // py-12: Standard vertical padding.
    // background: Custom linear gradient ensures a consistent brand feel regardless of light/dark mode settings.
    <section 
      className="py-12" 
      style={{ 
        background: 'linear-gradient(135deg, hsl(222 47% 20%) 0%, hsl(222 47% 11%) 100%)' 
      }}
    >
      <div className="section-container"> {/* Utility class to keep content centered with standard responsive gutters */}
        <div className="grid lg:grid-cols-2 gap-12 items-center"> {/* Two-column layout on desktop, single-column on mobile */}
          
          {/* --- LEFT COLUMN: BRANDING AND DIRECT CONTACT --- */}
          {/* motion.div: Animates the left side content sliding in as the user scrolls down */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} // Starts transparent and slightly offset to the left
            whileInView={{ opacity: 1, x: 0 }} // Smoothly fades in and moves to its final position
            viewport={{ once: true }} // Animation only triggers once per page load for a cleaner experience
            transition={{ duration: 0.5 }} // Animation speed of 500ms
          >
            {/* SUBTITLE: Highly visible uppercase text to anchor the section */}
            <span className="inline-block text-2xl font-bold uppercase tracking-wider text-accent mb-2">
              Get in Touch
            </span>
            
            {/* PRIMARY HEADING: White text used here specifically to pop against the dark HSL background */}
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight text-white">
              Let's Build Something Great Together
            </h2>
            
            {/* SUPPORTING TEXT: Muted slate color provides good contrast without being overwhelming */}
            <p className="text-slate-300 mb-6 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to say hello, I'd love to hear from you.
            </p>

            {/* CONTACT METHOD LIST: A collection of interactive links for direct communication */}
            <div className="space-y-3 mb-6">
              {/* EMAIL: Opens the system's default mail client */}
              <a
                href="mailto:saadmazaa@gmail.com"
                className="flex items-center gap-3 text-slate-300 hover:text-accent transition-colors group text-sm"
              >
                <Mail className="w-4 h-4 text-accent" />
                <span>saadmazaa@gmail.com</span>
              </a>

              {/* PHONE: Allows mobile users to click and dial directly */}
              <a
                href="tel:+94720135801"
                className="flex items-center gap-3 text-slate-300 hover:text-accent transition-colors group text-sm"
              >
                <Phone className="w-4 h-4 text-accent" />
                <span>+94 72 01 358 01</span>
              </a>

              {/* LOCATION: Static information with a consistent icon style */}
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* SOCIAL MEDIA LINKS: Branded icons with customized hover states */}
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
                  // CHANGES: Icons are text-white. Hover triggers text-accent (blue) and a subtle glow shadow.
                  // bg-white/5: Low-opacity background to create depth on the gradient.
                  className="p-2 rounded-md bg-white/5 border border-white/10 text-white hover:text-accent hover:bg-white/10 hover:border-accent/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: CALL-TO-ACTION CARDS --- */}
          {/* motion.div: Staggered entrance animation coming from the right side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* SEND MESSAGE CARD: Internal navigation card */}
              <Link
                to="/contact"
                className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                      <Mail className="w-4 h-4 text-accent" />
                      Send a Message
                    </h3>
                    <p className="text-slate-400 text-xs group-hover:text-slate-200 transition-colors">
                      Get a response within 24 hours.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
                </div>
              </Link>

              {/* SCHEDULE CALL CARD: External booking card */}
              <a
                href="https://cal.com/saad-mazhar"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                      <Calendar className="w-4 h-4 text-accent" />
                      Schedule a Call
                    </h3>
                    <p className="text-slate-400 text-xs group-hover:text-slate-200 transition-colors">
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
