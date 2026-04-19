import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Github, Linkedin, X, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const socialLinks = [
  { Icon: Linkedin, href: "https://linkedin.com/in/saadmaz" },
  { Icon: Github, href: "https://github.com/saadmaz" },
  { Icon: Instagram, href: "https://instagram.com/saadmazhar_" },
  { Icon: Facebook, href: "https://facebook.com/saadmazhar" },
  { Icon: X, href: "https://x.com/SaadMazhar_" },
];

export function ContactSection() {
  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(196 55% 8%) 0%, hsl(180 50% 12%) 100%)",
      }}
    >
      {/* Ambient teal glow blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── LEFT: Info Column ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-teal-400 mb-3">
              Get in Touch
            </span>

            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight text-white">
              Let's Build Something{" "}
              <span className="text-teal-400">Great</span> Together
            </h2>

            <p className="text-white/60 mb-8 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to
              say hello, I'd love to hear from you.
            </p>

            {/* Contact details */}
            <div className="space-y-3 mb-8">
              <a
                href="mailto:saadmazaa@gmail.com"
                className="flex items-center gap-3 text-white/70 hover:text-teal-400 transition-colors group text-sm"
              >
                <Mail className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>saadmazaa@gmail.com</span>
              </a>

              <a
                href="tel:+94720135801"
                className="flex items-center gap-3 text-white/70 hover:text-teal-400 transition-colors group text-sm"
              >
                <Phone className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>+94 72 01 358 01</span>
              </a>

              <div className="flex items-center gap-3 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-teal-400/70" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* Social Icons - Staggered entrance with spring bounce */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
                hidden: {},
              }}
              className="flex items-center gap-3"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={{
                    hidden: { opacity: 0, y: 15, scale: 0.8 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 400, damping: 15 },
                    },
                  }}
                  whileHover={{
                    y: -4,
                    scale: 1.2,
                    transition: { type: "spring", stiffness: 400, damping: 10 },
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-lg bg-white/8 border border-white/10 text-white/70 hover:text-teal-400 hover:bg-white/15 hover:border-teal-400/40 transition-colors duration-200"
                >
                  <social.Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: CTA Cards ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Send a Message - Glass card */}
              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Link
                  to="/contact"
                  className="block p-6 rounded-xl backdrop-blur-md bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.12] hover:border-teal-400/40 transition-all duration-300 group h-full"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1.5 flex items-center gap-2 text-white group-hover:text-teal-400 transition-colors">
                        <Mail className="w-4 h-4 text-teal-400" />
                        Send a Message
                      </h3>
                      <p className="text-white/50 text-xs group-hover:text-white/70 transition-colors">
                        Get a response within 24 hours.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-teal-400 group-hover:translate-x-2 transition-all duration-300 mt-1" />
                  </div>
                </Link>
              </motion.div>

              {/* Schedule a Call - Glass card */}
              <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <a
                  href="https://cal.com/saad-mazhar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 rounded-xl backdrop-blur-md bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.12] hover:border-teal-400/40 transition-all duration-300 group h-full"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1.5 flex items-center gap-2 text-white group-hover:text-teal-400 transition-colors">
                        <Calendar className="w-4 h-4 text-teal-400" />
                        Schedule a Call
                      </h3>
                      <p className="text-white/50 text-xs group-hover:text-white/70 transition-colors">
                        Book a 30-minute chat via Cal.com
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-teal-400 group-hover:translate-x-2 transition-all duration-300 mt-1" />
                  </div>
                </a>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
