import React from "react";
import { m } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Instagram,
  Facebook,
  Github,
  Linkedin,
  X,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

const socialLinks = [
  {
    Icon: Linkedin,
    href: "https://linkedin.com/in/saadmaz",
    label: "LinkedIn",
    brandColor: "hsl(210 91% 40%)",
    glowColor: "hsl(210 91% 40% / 0.40)",
  },
  {
    Icon: Github,
    href: "https://github.com/saadmaz",
    label: "GitHub",
    brandColor: "hsl(262 93% 76%)",
    glowColor: "hsl(262 93% 76% / 0.40)",
  },
  {
    Icon: Instagram,
    href: "https://instagram.com/saaadmaz/",
    label: "Instagram",
    brandColor: "hsl(340 74% 54%)",
    glowColor: "hsl(340 74% 54% / 0.40)",
  },
  {
    Icon: Facebook,
    href: "https://facebook.com/saadmazhar03",
    label: "Facebook",
    brandColor: "hsl(214 94% 52%)",
    glowColor: "hsl(214 94% 52% / 0.40)",
  },
  {
    Icon: X,
    href: "https://x.com/SaadMazhar_",
    label: "X",
    brandColor: "hsl(0 0% 63%)",
    glowColor: "hsl(0 0% 63% / 0.40)",
  },
];

export function ContactSection() {
  return (
    <section
      aria-labelledby="contact-heading"
      className="py-16 relative overflow-hidden"
      style={{
        background: "var(--gradient-contact)",
        // This section is always dark regardless of site theme, so pin --accent
        // to the dark-theme value (light-theme's darker teal fails contrast here).
        // --card/--border/--card-foreground are pinned too: .social-icon-branded
        // reads --card for its background and --border for its outline, and in
        // light theme those otherwise resolve to white, rendering the social
        // icons below as white-on-white (icon color is derived from
        // --card-foreground, so it stays paired with whatever surface color
        // the button actually gets).
        ["--accent" as string]: "174 72% 44%",
        ["--accent-foreground" as string]: "196 60% 4%",
        ["--card" as string]: "196 55% 7%",
        ["--card-foreground" as string]: "174 20% 95%",
        ["--border" as string]: "196 50% 15%",
      }}
    >
      {/* Ambient teal glow blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[140px] pointer-events-none"
        style={{ background: "hsl(var(--accent) / 0.08)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[120px] pointer-events-none"
        style={{ background: "hsl(var(--accent) / 0.06)" }}
      />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* ── LEFT: Info Column ──────────────────────────────────── */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Get in Touch
            </span>

            <h2
              id="contact-heading"
              className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight text-white"
            >
              Let's Build Something <span className="text-accent">Great</span> Together
            </h2>

            <p className="text-white/60 mb-8 max-w-md text-sm leading-relaxed">
              Whether you're looking to collaborate on a project or just want to say hello, I'd love to hear
              from you.
            </p>

            {/* Contact details */}
            <div className="space-y-3 mb-8">
              <a
                href="mailto:saadmazaa@gmail.com"
                className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors group text-sm"
              >
                <Mail className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                <span>saadmazaa@gmail.com</span>
              </a>

              <a
                href="tel:+94720135801"
                className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors group text-sm"
              >
                <Phone className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                <span>+94 72 01 358 01</span>
              </a>

              <div className="flex items-center gap-3 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-accent opacity-70" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* Social Icons - Staggered entrance with spring bounce */}
            <m.div
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
                <m.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  variants={{
                    hidden: { opacity: 0, y: 15, scale: 0.8 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 400, damping: 15 },
                    },
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
                  whileTap={{ y: 0 }}
                  className="social-icon-branded group"
                  style={
                    {
                      "--brand-color": social.brandColor,
                      "--glow-color": social.glowColor,
                    } as React.CSSProperties
                  }
                >
                  <span className="social-icon-ring" />
                  <social.Icon className="w-5 h-5 relative z-10 text-[hsl(var(--card-foreground)/0.7)] transition-colors duration-[250ms] group-hover:text-[var(--brand-color)]" />
                </m.a>
              ))}
            </m.div>
          </m.div>

          {/* ── RIGHT: CTA Cards ──────────────────────────────────── */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Send a Message - Glass card */}
              <m.div
                whileHover={{ scale: 1.02, y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to="/contact"
                  className="block p-6 rounded-xl backdrop-blur-md bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.12] hover:border-[hsl(var(--accent)/0.40)] transition-all duration-300 group h-full"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1.5 flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                        <Mail className="w-4 h-4 text-accent" />
                        Send a Message
                      </h3>
                      <p className="text-white/50 text-xs group-hover:text-white/70 transition-colors">
                        Get a response within 24 hours.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-accent group-hover:translate-x-2 transition-all duration-300 mt-1" />
                  </div>
                </Link>
              </m.div>

              {/* Schedule a Call - Glass card */}
              <m.div
                whileHover={{ scale: 1.02, y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <a
                  href="https://cal.com/saad-mazhar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 rounded-xl backdrop-blur-md bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.12] hover:border-[hsl(var(--accent)/0.40)] transition-all duration-300 group h-full"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1.5 flex items-center gap-2 text-white group-hover:text-accent transition-colors">
                        <Calendar className="w-4 h-4 text-accent" />
                        Schedule a Call
                      </h3>
                      <p className="text-white/50 text-xs group-hover:text-white/70 transition-colors">
                        Book a 30-minute chat via Cal.com
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-accent group-hover:translate-x-2 transition-all duration-300 mt-1" />
                  </div>
                </a>
              </m.div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
