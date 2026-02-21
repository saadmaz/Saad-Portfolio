import { motion } from "framer-motion"; // Library for smooth, high-performance web animations
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Github, Linkedin, X, Calendar } from "lucide-react"; // Consistent, high-quality SVG icon set
import { Link } from "react-router-dom"; // Component for optimized, zero-refresh client-side navigation

export function ContactSection() {
  return (
    // MAIN SECTION WRAPPER: 
    // Uses py-12 for consistent vertical padding.
    // The 'style' attribute applies your specific linear gradient directly to ensure it remains constant 
    // even if the user toggles between Dark and Light mode (bypassing the 'bg-secondary' utility).
    <section 
      className="py-12" 
      style={{ 
        background: 'linear-gradient(135deg, hsl(222 47% 20%) 0%, hsl(222 47% 11%) 100%)' 
      }}
    >
      {/* SECTION CONTAINER: Centers content horizontally and provides responsive horizontal padding */}
      <div className="section-container"> 
        
        {/* GRID LAYOUT: Switches from a single column on mobile to two columns on 'lg' (large) screens */}
        <div className="grid lg:grid-cols-2 gap-12 items-center"> 
          
          {/* --- LEFT COLUMN: CONTACT INFORMATION & SOCIALS --- */}
          {/* motion.div: Animates the container as it enters the user's viewport */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} // Starts invisible and 20px to the left
            whileInView={{ opacity: 1, x: 0 }} // Fades in and slides to its natural position on scroll
            viewport={{ once: true }} // Ensures the animation doesn't repeat every time you scroll past it
            transition={{ duration: 0.5 }} // Sets the animation timing to 500ms
          >
            {/* ACCENT SUBTITLE: Uses bold, uppercase styling to catch the eye immediately */}
            <span className="inline-block text-2xl font-bold uppercase tracking-wider text-accent mb-2">
              Get in Touch
            </span>
            
            {/* MAIN HEADING: Uses font-display for a professional look and leading-tight for better line spacing */}
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight text-white">
              Let's Build Something Great Together
            </h2>
            
            {/* DESCRIPTION: Muted text color for visual hierarchy, max-width prevents lines from getting too long */}
            <p className="text-slate-300 mb-6 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to say hello, I'd love to hear from you.
            </p>

            {/* CONTACT METHODS LIST: Flexbox column for vertical alignment of contact points */}
            <div className="space-y-3 mb-6">
              {/* EMAIL: mailto link to open the user's default email client */}
              <a
                href="mailto:saadmazaa@gmail.com"
                className="flex items-center gap-3 text-slate-300 hover:text-accent transition-colors group text-sm"
              >
                <Mail className="w-4 h-4 text-accent" />
                <span>saadmazaa@gmail.com</span>
              </a>

              {/* PHONE: tel link for mobile users to call directly */}
              <a
                href="tel:+94720135801"
                className="flex items-center gap-3 text-slate-300 hover:text-accent transition-colors group text-sm"
              >
                <Phone className="w-4 h-4 text-accent" />
                <span>+94 72 01 358 01</span>
              </a>

              {/* LOCATION: Informational block using the MapPin icon */}
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* SOCIAL MEDIA ICON ROW: Dynamically generates icon buttons from an array */}
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
                  target="_blank" // Opens the link in a new tab
                  rel="noopener noreferrer" // Security best practice for external links
                  // Style: bg-white/5 provides a subtle glass effect that looks great over the gradient
                  className="p-2 rounded-md bg-white/5 border border-white/10 hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: INTERACTIVE ACTION CARDS --- */}
          {/* motion.div: Slides in from the right with a 200ms delay for a staggered effect */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* SUB-GRID: Stacks cards on mobile, spreads them on tablets (md) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* MESSAGE CARD: Links to an internal React route */}
              <Link
                to="/contact"
                className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    {/* group-hover: Changes the title color when any part of the card is hovered */}
                    <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                      <Mail className="w-4 h-4 text-accent" />
                      Send a Message
                    </h3>
                    <p className="text-slate-400 text-xs group-hover:text-slate-200 transition-colors">
                      Get a response within 24 hours.
                    </p>
                  </div>
                  {/* group-hover:translate-x-1: Creates a subtle "push" animation on the arrow icon */}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
                </div>
              </Link>

              {/* BOOKING CARD: Links to an external scheduler (Cal.com) */}
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
