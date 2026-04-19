import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Download, Phone, Mail, Linkedin, Github, Instagram, Facebook, X, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/profile-photo.png";
import { useRef } from "react";
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf";

// ─── Letter-by-letter span builder ───────────────────────────────────────────
function AnimatedName({ name }: { name: string }) {
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.25 } },
        hidden: {},
      }}
      className="relative inline-block"
    >
      {name.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, letterSpacing: "-0.08em", y: 8 },
            visible: {
              opacity: 1,
              letterSpacing: "normal",
              y: 0,
              transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
      {/* Teal underline accent */}
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-1 md:bottom-2 left-0 w-full h-2 md:h-2 bg-accent/25 origin-left -z-0"
      />
    </motion.span>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const socials = [
    { icon: Phone,     href: "tel:+94720135801",                     label: "Phone" },
    { icon: Mail,      href: "mailto:saadmazaa@gmail.com",           label: "Email" },
    { icon: Linkedin,  href: "https://linkedin.com/in/saadmaz/",     label: "LinkedIn" },
    { icon: Github,    href: "https://github.com/saadmaz/",          label: "GitHub" },
    { icon: Instagram, href: "https://instagram.com/saaadmaz/",      label: "Instagram" },
    { icon: Facebook,  href: "https://facebook.com/saadmazhar03",    label: "Facebook" },
    { icon: X,         href: "https://x.com/SaadMazhar_",            label: "X" },
  ];

  return (
    <section className="relative min-h-screen md:min-h-[90vh] flex items-center pt-24 md:pt-0 overflow-hidden">
      {/* ── Background ─────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient: uses the CSS var so it adapts to light/dark */}
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        {/* Teal radial bloom on the right */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 via-accent/5 to-transparent" />
        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Dark-mode only: ambient teal particle shimmer blobs */}
        <div className="hidden dark:block absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="hidden dark:block absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/8 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="section-container w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto justify-center">

          {/* ── LEFT COLUMN: Text ───────────────────────────────────────────── */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1 text-center lg:text-left mx-auto">

            {/* Status badges row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-2"
            >
              {/* Currently building badge */}
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs md:text-sm font-medium border border-accent/20">
                <span className="w-2 h-2 rounded-full bg-success animate-status-pulse" />
                Currently building Tank Sudda &amp; Stopwash
              </span>
              {/* Open to Work badge */}
              {/* <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-xs md:text-sm font-semibold border border-emerald-500/25">
                <Briefcase className="w-3.5 h-3.5" />
                Open to Opportunities
              </span> */}
            </motion.div>

            {/* Heading: "Hi, I'm" fades, then name tracks in letter-by-letter */}
            <div className="space-y-4">
              <h1 className="font-display whitespace-nowrap text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mr-2"
                >
                  Hi, I'm
                </motion.span>{" "}
                <AnimatedName name="Saad Mazhar" />
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="whitespace-nowrap text-base sm:text-lg md:text-2xl text-muted-foreground font-light"
              >
                • Startup Founder • Tech Speaker • Compere
              </motion.p>
            </div>

            {/* Body copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              I build solutions that solve real problems. Passionate about the intersection
              of technology, design, and business. Always learning, always shipping.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3"
            >
              {/* Primary: See My Work */}
              <Button asChild className="btn-primary gap-2 w-full sm:w-auto">
                <Link to="/projects">
                  See My Work
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              {/* Secondary: Get in Touch */}
              <Button
                asChild
                variant="outline"
                className="btn-outline gap-2 w-full sm:w-auto"
              >
                <Link to="/contact">
                  Get in Touch
                </Link>
              </Button>

              {/* Tertiary: Resume download - icon-only on small screens */}
              <Button
                asChild
                variant="ghost"
                className="gap-2 w-full sm:w-auto text-muted-foreground hover:text-foreground"
              >
                <a href={myResume} download="Saad_Mazhar_Resume.pdf">
                  <Download className="w-4 h-4" />
                  <span>Resume</span>
                </a>
              </Button>
            </motion.div>

            {/* Social Icons with custom bounce effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.15 }}
              className="flex flex-col items-center lg:items-start gap-4 pt-4"
            >
              <span className="text-sm text-muted-foreground">Connect with me:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {socials.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="social-icon"
                    whileHover={{
                      y: -5,
                      scale: 1.15,
                      transition: { type: "spring", stiffness: 400, damping: 10 },
                    }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: Photo ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative order-1 lg:order-2 flex justify-center mb-8 lg:mb-0"
          >
            <div
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative"
              style={{ perspective: "1000px" }}
            >
              {/* Teal ambient blobs behind photo */}
              <div className="absolute -top-8 -left-8 w-48 h-48 md:w-72 md:h-72 bg-accent/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 md:w-64 md:h-64 bg-accent/10 rounded-full blur-2xl" />

              <motion.div style={{ rotateX, rotateY }} className="relative">
                {/* Main photo card */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border border-accent/20 group"
                  style={{ boxShadow: "0 0 0 1px hsl(174 72% 44% / 0.15), 0 20px 40px -10px hsl(196 60% 4% / 0.4)" }}
                >
                  <motion.img
                    src={profilePhoto}
                    alt="Saad Mazhar"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Teal overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Stats card (bottom-left) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-10 bg-card rounded-xl border border-border p-3 md:p-4 backdrop-blur-sm"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-center">
                      <p className="text-xl md:text-2xl font-display font-bold text-foreground">5+</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Years Coding</p>
                    </div>
                    <div className="w-px h-8 md:h-10 bg-border" />
                    <div className="text-center">
                      <p className="text-xl md:text-2xl font-display font-bold text-foreground">20+</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Projects</p>
                    </div>
                  </div>
                </motion.div>

                {/* Innovation card (top-right) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -top-4 -right-2 md:-right-8 bg-card rounded-xl border border-border p-2 md:p-3 backdrop-blur-sm max-w-[140px] md:max-w-none"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="hidden xs:flex w-8 h-8 rounded-lg items-center justify-center text-white font-bold text-sm"
                      style={{ background: "var(--gradient-accent)" }}
                    >
                      S
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-medium text-foreground">Building</p>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground truncate">TankSudda &amp; Stopwash</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
