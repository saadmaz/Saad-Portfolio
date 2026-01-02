import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Github, Linkedin, Twitter, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function ContactSection() {
  return (
    // Reduced vertical padding (py-12 instead of section-padding) to make the section smaller.
    <section className="py-12 bg-primary text-primary-foreground">
      {/* section-container keeps everything centered and width-restricted */}
      <div className="section-container">
        {/* Adjusted gap from 20 to 12 to make the split-view more compact */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* --- LEFT COLUMN: COMPACT CONTACT INFO --- */}
          {/* Animates in from the left when the user scrolls into view. */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Significant font increase: text-2xl and bold weight for "Get in Touch" */}
            <span className="inline-block text-2xl font-bold uppercase tracking-wider text-accent mb-2">
              Get in Touch
            </span>
            
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
              Let's Build Something Great Together
            </h2>
            
            <p className="text-primary-foreground/80 mb-6 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to say hello — I'd love to hear from you.
            </p>

            {/* CONTACT LIST: Space reduced between items (space-y-3) */}
            <div className="space-y-3 mb-6">
              <a 
                href="mailto:saadmazaa@gmail.com" 
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-white transition-colors group text-sm"
              >
                <Mail className="w-4 h-4 text-accent" />
                <span>saadmazaa@gmail.com</span>
              </a>

              <a 
                href="tel:+94720135801" 
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-white transition-colors group text-sm"
              >
                <Phone className="w-4 h-4 text-accent" />
                <span>+94 72-01-358-01</span>
              </a>

              <div className="flex items-center gap-3 text-primary-foreground/80 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* SOCIAL LINKS: Small, clean icon buttons for a contained feel. */}
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
                  className="p-2 rounded-md bg-white/5 border border-white/10 hover:bg-accent transition-all"
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
            {/* SEND MESSAGE CARD: Reduced padding to p-5 for a smaller section footprint. */}
            <Link 
              to="/contact" 
              className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1">Send a Message</h3>
                  <p className="text-primary-foreground/70 text-xs">
                    Get a response within 24 hours.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
              </div>
            </Link>

            {/* SCHEDULE CARD: Direct link to Cal.com for booking. */}
            {/* The card container uses 'group' so we can trigger text changes when the whole box is hovered */}
            <a 
              href="https://cal.com/saad-mazhar" 
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-900 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  {/* text-white ensures it starts pure white. group-hover:text-blue-900 changes it on hover */}
                  <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-white transition-colors group-hover:text-blue-900">
                    {/* The icon also transitions to blue to match the text */}
                    <Calendar className="w-4 h-4 text-accent group-hover:text-blue-900 transition-colors" />
                    Schedule a Call
                  </h3>
                  <p className="text-primary-foreground/70 text-xs group-hover:text-blue-900/80 transition-colors">
                    Book a 30-minute chat via Cal.com
                  </p>
                </div>
                {/* The arrow icon also turns blue and slides right */}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-hover:text-blue-900 transition-all text-accent" />
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}