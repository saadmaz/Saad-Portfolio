import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Github, Linkedin, X, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function ContactSection() {
  return (
    // Reduced vertical padding (py-12 instead of section-padding) to make the section smaller.
    <section className="py-12 bg-secondary">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* --- LEFT COLUMN: COMPACT CONTACT INFO --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-2xl font-bold uppercase tracking-wider text-accent mb-2">
              Get in Touch
            </span>
            
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight text-foreground">
              Let's Build Something Great Together
            </h2>
            
            <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to say hello, I'd love to hear from you.
            </p>

            {/* CONTACT LIST */}
            <div className="space-y-3 mb-6">
              <a 
                href="mailto:saadmazaa@gmail.com" 
                className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors group text-sm"
              >
                <Mail className="w-4 h-4 text-accent" />
                <span>saadmazaa@gmail.com</span>
              </a>

              <a 
                href="tel:+94720135801" 
                className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors group text-sm"
              >
                <Phone className="w-4 h-4 text-accent" />
                <span>+94 72 01 358 01</span>
              </a>

              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* SOCIAL LINKS */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Instagram, href: "https://instagram.com/saadmazhar_" },
                { Icon: Facebook, href: "https://facebook.com/saadmazhar" },
                { Icon: Github, href: "https://github.com/saadmaz" },
                { Icon: Linkedin, href: "https://linkedin.com/in/saadmazhar-" },
                { Icon: X, href: "https://x.com/SaadMazhar_" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-all"
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
            {/* --- CONTACT INTERACTION SECTION --- */}
            {/* These cards provide two distinct ways for users to reach out. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* SEND MESSAGE CARD: Internal route to the Contact Page */}
              {/* We use 'group' to trigger coordinated hover animations for the icon, title, and arrow. */}
              <Link 
                to="/contact" 
                className="block p-5 rounded-xl bg-card border border-border hover:border-accent/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    {/* Title: Standard text-foreground that shifts to the accent color on parent hover */}
                    <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-foreground group-hover:text-accent transition-colors">
                      <Mail className="w-4 h-4 text-accent" />
                      Send a Message
                    </h3>
                    {/* Description: Subtext providing expectation of response time */}
                    <p className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors">
                      Get a response within 24 hours.
                    </p>
                  </div>
                  {/* Directional Arrow: Slides slightly to the right on hover to signal interactivity */}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
                </div>
              </Link>

              {/* SCHEDULE CALL CARD: External link to Cal.com scheduling page */}
              {/* rel="noopener noreferrer" is included for security when opening external tabs. */}
              <a 
                href="https://cal.com/saad-mazhar" 
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-xl bg-card border border-border hover:border-accent/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    {/* Title: Synchronized with the 'Send Message' card for visual consistency */}
                    <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-foreground group-hover:text-accent transition-colors">
                      <Calendar className="w-4 h-4 text-accent" />
                      Schedule a Call
                    </h3>
                    {/* Description: Clearly states the platform and meeting duration */}
                    <p className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors">
                      Book a 30-minute chat via Cal.com
                    </p>
                  </div>
                  {/* Directional Arrow: Synchronized animation with the internal link card */}
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