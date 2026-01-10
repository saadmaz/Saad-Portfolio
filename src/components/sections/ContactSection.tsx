import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Github, Linkedin, Twitter, Calendar } from "lucide-react";
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
                { Icon: Github, href: "https://github.com/saadmaz" },
                { Icon: Linkedin, href: "https://linkedin.com/in/saadmazhar-" },
                { Icon: Twitter, href: "https://x.com/SaadMazhar_" }
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
            {/* SEND MESSAGE CARD */}
            <Link 
              to="/contact" 
              className="block p-5 rounded-xl bg-card border border-border hover:border-accent/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1 text-foreground">Send a Message</h3>
                  <p className="text-muted-foreground text-xs">
                    Get a response within 24 hours.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
              </div>
            </Link>

            {/* SCHEDULE CARD */}
            <a 
              href="https://cal.com/saad-mazhar" 
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 rounded-xl bg-card border border-border hover:border-accent/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-foreground group-hover:text-accent transition-colors">
                    <Calendar className="w-4 h-4 text-accent" />
                    Schedule a Call
                  </h3>
                  <p className="text-muted-foreground text-xs group-hover:text-foreground transition-colors">
                    Book a 30-minute chat via Cal.com
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all text-accent" />
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}