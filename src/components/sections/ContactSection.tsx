import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Github, Linkedin, Twitter, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-sm font-semibold uppercase tracking-wider text-accent mb-3">
              Get in Touch
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Let's Build Something Great Together
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md">
              Whether you're looking to collaborate on a project, discuss an opportunity, 
              or just want to say hello — I'd love to hear from you.
            </p>

            <div className="space-y-4 mb-8">
              <a 
                href="mailto:john@example.com" 
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
                john@example.com
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Phone className="w-5 h-5" />
                +1 (234) 567-890
              </a>
              <span className="flex items-center gap-3 text-primary-foreground/80">
                <MapPin className="w-5 h-5" />
                San Francisco, CA
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Right Content - CTA Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <Link 
              to="/contact" 
              className="block p-6 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2">Send a Message</h3>
                  <p className="text-primary-foreground/70 text-sm">
                    Fill out the contact form and I'll get back to you within 24 hours.
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <a 
              href="#" 
              className="block p-6 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Schedule a Call
                  </h3>
                  <p className="text-primary-foreground/70 text-sm">
                    Book a 30-minute chat to discuss potential collaboration.
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
