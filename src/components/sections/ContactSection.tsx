import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Github, Linkedin, Twitter, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function ContactSection() {
  return (
    // Root section uses primary branding colors with consistent vertical padding.
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="section-container">
        {/* Responsive Grid: Stacks on mobile, splits 50/50 on large screens with a deep gap. */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* --- LEFT COLUMN: CONTACT DETAILS --- */}
          {/* Animates in from the left when the user scrolls into view. */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Increased text size for the 'Get in Touch' label for better hierarchy. */}
            <span className="inline-block text-lg font-semibold uppercase tracking-widest text-accent mb-4">
              Get in Touch
            </span>
            
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Let's Build Something Great Together
            </h2>
            
            <p className="text-primary-foreground/80 mb-10 max-w-md text-lg leading-relaxed">
              Whether you're looking to collaborate on a project, discuss an opportunity, 
              or just want to say hello — I'd love to hear from you.
            </p>

            {/* CONTACT LIST: Uses hover states to highlight interactive email and phone links. */}
            <div className="space-y-6 mb-10">
              <a 
                href="mailto:saadmazaa@gmail.com" 
                className="flex items-center gap-4 text-primary-foreground/80 hover:text-white transition-colors group"
              >
                <div className="p-3 rounded-full bg-white/5 group-hover:bg-accent/20 transition-colors">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <span className="text-lg">saadmazaa@gmail.com</span>
              </a>

              <a 
                href="tel:+94720135801" 
                className="flex items-center gap-4 text-primary-foreground/80 hover:text-white transition-colors group"
              >
                <div className="p-3 rounded-full bg-white/5 group-hover:bg-accent/20 transition-colors">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <span className="text-lg">+94 72-01-358-01</span>
              </a>

              <div className="flex items-center gap-4 text-primary-foreground/80 group">
                <div className="p-3 rounded-full bg-white/5">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <span className="text-lg">Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* SOCIAL LINKS: Icon buttons with a subtle background and hover lift effect. */}
            <div className="flex items-center gap-4">
              {[
                { Icon: Github, href: "https://github.com/saadmaz", label: "GitHub" },
                { Icon: Linkedin, href: "https://linkedin.com/in/saadmazhar-", label: "LinkedIn" },
                { Icon: Twitter, href: "https://x.com/SaadMazhar_", label: "Twitter" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-accent hover:text-white transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: CALL-TO-ACTION CARDS --- */}
          {/* Features larger, card-style buttons for the most important actions. */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* MESSAGE CARD: Leads the user to the dedicated /contact page. */}
            <Link 
              to="/contact" 
              className="block p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-semibold mb-3">Send a Message</h3>
                  <p className="text-primary-foreground/70 leading-relaxed">
                    Fill out the contact form and I'll get back to you within 24 hours.
                  </p>
                </div>
                <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent group-hover:text-white transition-all">
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* SCHEDULING CARD: Connects to Cal.com for direct meeting bookings. */}
            <a 
              href="https://cal.com/saad-mazhar" 
              target="_blank"
              rel="noopener noreferrer"
              className="block p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-semibold mb-3 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-accent" />
                    Schedule a Call
                  </h3>
                  <p className="text-primary-foreground/70 leading-relaxed">
                    Book a 30-minute chat to discuss potential collaboration.
                  </p>
                </div>
                <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent group-hover:text-white transition-all">
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}