import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Github, Linkedin, X, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * CONTACT SECTION - PROFESSIONAL NAVY EDITION
 * * FEATURES:
 * 1. FIXED: Uses 'bg-contact-gradient' to stay Navy Blue in Light Mode.
 * 2. FIXED: Forces 'text-white' for readability on dark background.
 * 3. STYLE: Premium glassmorphism cards and original 2-column layout.
 */
export function ContactSection() {
  return (
    // MAIN WRAPPER: Forced to Navy Gradient from index.css
    <section className="py-16 bg-contact-gradient text-white overflow-hidden border-t border-white/5"> 
      <div className="section-container">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* --- LEFT COLUMN: INFO --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-2xl font-bold uppercase tracking-wider text-accent mb-2">
              Get in Touch
            </span>
            
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight text-white">
              Let's Build Something Great Together
            </h2>
            
            <p className="text-white/60 mb-8 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to say hello, I'd love to hear from you.
            </p>

            {/* CONTACT LINKS */}
            <div className="space-y-4 mb-8">
              <a href="mailto:saadmazaa@gmail.com" className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors group text-sm">
                <Mail className="w-4 h-4 text-accent" />
                <span className="font-medium">saadmazaa@gmail.com</span>
              </a>
              <a href="tel:+94720135801" className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors group text-sm">
                <Phone className="w-4 h-4 text-accent" />
                <span className="font-medium">+94 72 01 358 01</span>
              </a>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* SOCIAL ICONS */}
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
                  className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-accent hover:text-white transition-all shadow-sm group" 
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: CARDS --- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/contact" 
                className="block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all group backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                      <Mail className="w-4 h-4 text-accent" />
                      Send a Message
                    </h3>
                    <p className="text-white/40 text-xs group-hover:text-white/70 transition-colors">
                      Response within 24 hours.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
                </div>
              </Link>

              <a 
                href="https://cal.com/saad-mazhar" 
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all group backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                      <Calendar className="w-4 h-4 text-accent" />
                      Schedule a Call
                    </h3>
                    <p className="text-white/40 text-xs group-hover:text-white/70 transition-colors">
                      Book a chat via Cal.com
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
