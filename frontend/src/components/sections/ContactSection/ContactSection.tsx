import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Github, Linkedin, X, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function ContactSection() {
  return (
    <section 
      className="py-12" 
      style={{ 
        background: 'linear-gradient(135deg, hsl(222 47% 20%) 0%, hsl(222 47% 11%) 100%)' 
      }}
    >
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
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
                  className="p-2 rounded-md bg-muted/10 border border-border text-foreground hover:text-accent hover:bg-muted/20 hover:border-accent/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

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
                className="block p-5 rounded-xl bg-muted/10 border border-border hover:border-accent/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2 text-foreground group-hover:text-accent transition-colors">
                      <Mail className="w-4 h-4 text-accent" />
                      Send a Message
                    </h3>
                    <p className="text-muted-foreground text-xs group-hover:text-foreground transition-colors">
                      Get a response within 24 hours.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-accent" />
                </div>
              </Link>

              <a
                href="https://cal.com/saad-mazhar"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-xl bg-muted/10 border border-border hover:border-accent/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all group"
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
