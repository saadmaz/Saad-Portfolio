import { motion } from "framer-motion"; // Imports motion for scroll-triggered and state-based animations
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Github, Linkedin, X, Calendar } from "lucide-react"; // SVG icons for contact methods and social media
import { Link } from "react-router-dom"; // Hook for client-side routing within the application

export function ContactSection() {
  return (
    // MAIN SECTION WRAPPER: 
    // py-12 provides vertical padding.
    // Fixed linear gradient ensures the background remains the same regardless of Light/Dark mode.
    <section 
      className="py-12" 
      style={{ 
        background: 'linear-gradient(135deg, hsl(222 47% 20%) 0%, hsl(222 47% 11%) 100%)' 
      }}
    >
      <div className="section-container"> {/* Utility class for centered horizontal alignment and standard gutters */}
        <div className="grid lg:grid-cols-2 gap-12 items-center"> {/* Establishes a 2-column grid on large screens, centered vertically */}
          
          {/* --- LEFT COLUMN: COMPACT CONTACT INFO --- */}
          {/* motion.div: Handles the entry animation (fading in and sliding from the left) when the section enters the viewport */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} // Animation start state
            whileInView={{ opacity: 1, x: 0 }} // Animation end state triggered by scroll
            viewport={{ once: true }} // Ensures the animation only plays the first time the section is seen
            transition={{ duration: 0.5 }} // Half-second animation speed
          >
            {/* SUBTITLE: Small, bold, uppercase accent text to introduce the section */}
            <span className="inline-block text-2xl font-bold uppercase tracking-wider text-accent mb-2">
              Get in Touch
            </span>
            
            {/* PRIMARY HEADING: Uses font-display for brand-consistent typography; set to text-white for the dark gradient */}
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight text-white">
              Let's Build Something Great Together
            </h2>
            
            {/* SUPPORTING TEXT: Using a light slate color to ensure readability on the dark background */}
            <p className="text-slate-300 mb-6 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to say hello, I'd love to hear from you.
            </p>

            {/* CONTACT METHOD LIST: Vertical list of interactive communication links */}
            <div className="space-y-3 mb-6">
              {/* Email Link: Uses 'mailto' protocol to trigger default email clients */}
              <a
                href="mailto:saadmazaa@gmail.com"
                className="flex items-center gap-3 text-slate-300 hover:text-accent transition-colors group text-sm"
              >
                <Mail className="w-4 h-4 text-accent" />
                <span>saadmazaa@gmail.com</span>
              </a>

              {/* Phone Link: Uses 'tel' protocol for mobile interactivity */}
              <a
                href="tel:+94720135801"
                className="flex items-center gap-3 text-slate-300 hover:text-accent transition-colors group text-sm"
              >
                <Phone className="w-4 h-4 text-accent" />
                <span>+94 72 01 358 01</span>
              </a>

              {/* Physical Location: Non-link item providing geographic context */}
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* SOCIAL MEDIA LINKS: Horizontal row of branded icon buttons */}
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
                  target="_blank" // Opens link in a new browser tab
                  rel="noopener noreferrer" // Essential security attribute for external links
                  // CHANGE APPLIED: Icons are white by default (text-white) and blue on hover (hover:text-accent)
                  // bg-white/5 and border-white/10 provide a subtle "glass" effect on the dark gradient
                  className="p-2 rounded-md bg-white/5 border border-white/10 text-white hover:text-accent hover:bg-white/10 transition-all"
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: COMPACT CTA CARDS --- */}
          {/* motion.div: Animates in from the right with a slight delay after the left column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* GRID FOR CTA CARDS: Stacks on mobile, side-by-side on tablet/medium screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* SEND MESSAGE CARD: Navigates to a deeper contact form page within the React app */}
              <Link
                to="/contact"
                className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    {/* Header: Changes color smoothly when the parent card is hovered via 'group-hover' */}
                    <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                      <Mail className="w-4 h-4 text-accent" />
                      Send a Message
                    </h3>
                    <p className="text-slate-400 text-xs group-hover:text-slate-200 transition-colors">
                      Get a response within 24 hours.
                    </p>
                  </div>
                  {/* Visual Cue: Arrow translates 4 pixels to the right on hover to indicate forward motion */}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
                </div>
              </Link>

              {/* SCHEDULE CALL CARD: External link to an appointment booking service (Cal.com) */}
              <a
                href="https://cal.com/saad-mazhar"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all group"
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
