import { motion } from "framer-motion"; // Imports motion for scroll-triggered and state-based animations
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Github, Linkedin, X, Calendar } from "lucide-react"; // SVG icons for contact methods and social media
import { Link } from "react-router-dom"; // Hook for client-side routing within the application

/**
 * ContactSection Component
 * * UPDATED: Now uses 'bg-contact-blue' to maintain the original vibrant blue theme.
 * * UI FIX: Added 'text-white' to ensure readability against the primary blue background.
 */
export function ContactSection() {
  return (
    // MAIN SECTION WRAPPER: 
    // 1. py-16 provides vertical breathing room.
    // 2. bg-contact-blue applies your specifically preserved legacy blue.
    // 3. text-white ensures all nested text inherits a light color for high contrast.
    <section className="py-16 bg-contact-blue text-white overflow-hidden"> 
      <div className="section-container"> {/* Standardized container for horizontal centering and gutters */}
        
        <div className="grid lg:grid-cols-2 gap-16 items-center"> {/* 2-column grid: Info on left, CTAs on right */}
          
          {/* --- LEFT COLUMN: CONTACT IDENTITY --- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} // Starts invisible and slightly to the left
            whileInView={{ opacity: 1, x: 0 }} // Fades in and slides to position on scroll
            viewport={{ once: true }} // Animation only triggers once for better UX
            transition={{ duration: 0.6, ease: "easeOut" }} // Smooth deceleration
          >
            {/* SUBTITLE: Highly visible uppercase label */}
            <span className="inline-block text-sm font-black uppercase tracking-[0.3em] text-white/80 mb-4">
              Get in Touch
            </span>
            
            {/* PRIMARY HEADING: Bold and high-impact */}
            <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-6 leading-[1.1] tracking-tighter">
              Let's Build Something <br /> Great Together
            </h2>
            
            {/* SUPPORTING TEXT: Slightly transparent to keep hierarchy focused on the heading */}
            <p className="text-white/70 mb-10 max-w-md text-lg leading-relaxed font-medium">
              Whether you're looking to collaborate on a project or just want to say hello, I'd love to hear from you.
            </p>

            {/* INTERACTIVE CONTACT LIST */}
            <div className="space-y-5 mb-10">
              {/* Email Link: Uses hover:translate-x to give interactive feedback */}
              <a 
                href="mailto:saadmazaa@gmail.com" 
                className="flex items-center gap-4 text-white/90 hover:text-white transition-all group w-fit"
              >
                <div className="p-2.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-semibold tracking-tight">saadmazaa@gmail.com</span>
              </a>

              {/* Phone Link */}
              <a 
                href="tel:+94720135801" 
                className="flex items-center gap-4 text-white/90 hover:text-white transition-all group w-fit"
              >
                <div className="p-2.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="font-semibold tracking-tight">+94 72 01 358 01</span>
              </a>

              {/* Geographic Context */}
              <div className="flex items-center gap-4 text-white/80 cursor-default">
                <div className="p-2.5 rounded-lg bg-white/10">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-medium">Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* SOCIAL ROW: Branded glass-effect buttons */}
            <div className="flex items-center gap-4">
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
                  className="p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white hover:text-contact-blue hover:-translate-y-1 transition-all duration-300" 
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: QUICK ACTION CARDS --- */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} // Slides in from the right
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }} // Delayed entry for staggered effect
            className="space-y-6"
          >
            {/* GRID FOR ACTION CARDS */}
            <div className="grid grid-cols-1 gap-6">

              {/* MESSAGE CARD: Glassmorphism effect to look premium on blue */}
              <Link 
                to="/contact" 
                className="block p-8 rounded-3xl bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-[1.02] transition-all group backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-contact-blue transition-all duration-500">
                      <Mail className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 tracking-tight">Send a Message</h3>
                      <p className="text-white/60 text-sm">Response within 24 hours.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform opacity-50 group-hover:opacity-100" />
                </div>
              </Link>

              {/* BOOKING CARD */}
              <a 
                href="https://cal.com/saad-mazhar" 
                target="_blank"
                rel="noopener noreferrer"
                className="block p-8 rounded-3xl bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-[1.02] transition-all group backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-contact-blue transition-all duration-500">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 tracking-tight">Schedule a Call</h3>
                      <p className="text-white/60 text-sm">Book a 30-minute chat via Cal.com</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform opacity-50 group-hover:opacity-100" />
                </div>
              </a>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}