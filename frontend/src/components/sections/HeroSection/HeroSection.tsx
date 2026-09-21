import React from "react";
// framer-motion: `m` is the lightweight version of `motion`, hooks drive the photo tilt effect
import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Download, Phone, Mail, Linkedin, Github, Instagram, Facebook, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/profile-photo.webp";
import { useRef } from "react";
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf";

// Each social entry holds the lucide icon, the link target, an accessible label,
// and two HSL color values: `brandColor` is the icon's hover color,
// `glowColor` is the same color at low opacity used for the CSS glow/shadow.
const socials = [
  {
    icon: Phone,
    href: "tel:+94720135801",
    label: "Phone",
    brandColor: "hsl(142 70% 49%)",       // green
    glowColor: "hsl(142 70% 49% / 0.35)",
  },
  {
    icon: Mail,
    href: "mailto:saadmazaa@gmail.com",
    label: "Email",
    brandColor: "hsl(4 90% 58%)",          // Gmail red
    glowColor: "hsl(4 90% 58% / 0.35)",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/saadmaz/",
    label: "LinkedIn",
    brandColor: "hsl(210 91% 40%)",        // LinkedIn blue
    glowColor: "hsl(210 91% 40% / 0.35)",
  },
  {
    icon: Github,
    href: "https://github.com/saadmaz/",
    label: "GitHub",
    brandColor: "hsl(262 55% 52%)",        // purple (GitHub dark theme accent)
    glowColor: "hsl(262 55% 52% / 0.35)",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/saaadmaz/",
    label: "Instagram",
    brandColor: "hsl(340 74% 54%)",        // Instagram pink
    glowColor: "hsl(340 74% 54% / 0.35)",
  },
  {
    icon: Facebook,
    href: "https://facebook.com/saadmazhar03",
    label: "Facebook",
    brandColor: "hsl(214 94% 52%)",        // Facebook blue
    glowColor: "hsl(214 94% 52% / 0.35)",
  },
  {
    icon: X,
    href: "https://x.com/SaadMazhar_",
    label: "X",
    brandColor: "hsl(0 0% 63%)",           // X (Twitter) neutral grey
    glowColor: "hsl(0 0% 63% / 0.40)",
  },
];

// Splits a name string into individual characters and animates each one in
// with a stagger (0.04s between letters). Each letter slides up from y:8 and
// expands from compressed letter-spacing to normal. The underline highlight
// bar scales in from the left after all letters have appeared (delay: 0.9s).
function AnimatedName({ name }: { name: string }) {
  return (
    <m.span
      initial="hidden"
      animate="visible"
      variants={{
        // `staggerChildren` fires each child's animation 0.04s after the previous one
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.25 } },
        hidden: {},
      }}
      className="relative inline-block"
    >
      {name.split("").map((char, i) => (
        <m.span
          key={i}
          variants={{
            hidden: { opacity: 0, letterSpacing: "-0.08em", y: 8 },
            visible: {
              opacity: 1,
              letterSpacing: "normal",
              y: 0,
              // Custom ease curve — fast start, smooth settle (similar to spring)
              transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          className="inline-block"
          // Preserve spaces as visible characters rather than collapsing them
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </m.span>
      ))}

      {/* Accent highlight bar that sweeps in under the name after letters finish */}
      <m.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-1 md:bottom-2 left-0 w-full h-2 md:h-2 bg-accent/25 origin-left -z-0"
      />
    </m.span>
  );
}

// Renders a single social link with:
//  - staggered entrance animation (each icon appears 0.08s after the previous)
//  - a lift (-4px) on hover
//  - brand-colored icon and glow on hover, driven by CSS custom properties
//    so the color logic stays in CSS (see .social-icon-branded in the stylesheet)
//  - a pulse ring (`<span className="social-icon-ring">`) purely decorative
function SocialIcon({
  icon: Icon,
  href,
  label,
  brandColor,
  glowColor,
  index,
}: (typeof socials)[0] & { index: number }) {
  return (
    <m.a
      href={href}
      // Phone/email links open natively; external URLs open in a new tab
      target={href.startsWith("tel:") || href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      aria-label={label}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 1.15 + index * 0.08, // cascade: each icon waits 80ms longer than the last
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
      whileTap={{ y: 0 }} // snap back on click
      className="social-icon-branded group relative"
      // Expose brand colors as CSS variables so the stylesheet can use them
      // without needing inline style for every hover rule
      style={
        {
          "--brand-color": brandColor,
          "--glow-color": glowColor,
        } as React.CSSProperties
      }
    >
      {/* Animated ring that pulses outward on hover (CSS keyframe) */}
      <span className="social-icon-ring" />
      <Icon className="w-5 h-5 relative z-10 transition-colors duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] text-muted-foreground group-hover:text-[var(--brand-color)]" />
    </m.a>
  );
}

export function HeroSection() {
  // `ref` points to the photo container — needed to measure its position
  // so mouse coordinates can be converted to a -0.5 → 0.5 range
  const ref = useRef<HTMLDivElement>(null);

  // Raw motion values updated directly on mousemove (no re-renders)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // `useSpring` smooths out sudden mouse jumps into a fluid follow motion
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map the normalized -0.5 → 0.5 position to CSS rotation angles so the
  // photo tilts toward the cursor (rotateX inverts Y so moving up tilts forward)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  // Convert raw pixel mouse position to a fraction of the element's dimensions,
  // then center around 0 (subtract 0.5) so the neutral position is no tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section aria-labelledby="hero-heading" className="relative min-h-screen md:min-h-[90vh] flex items-center pt-24 md:pt-0 overflow-hidden">

      {/* ── Layered background ─────────────────────────────────────────────────
          Three layers stacked via `absolute inset-0 -z-10`:
          1. Hero gradient from CSS variable (adapts to light/dark theme)
          2. Soft accent gradient from the right edge
          3. Dot grid overlay at 2.5% opacity for subtle texture
          4 & 5. Two blurred accent blobs visible only in dark mode          */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 via-accent/5 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="hidden dark:block absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="hidden dark:block absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/8 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="section-container w-full">
        {/* Two-column grid: text left, photo right on large screens.
            On mobile the photo appears first (order-1) above the text (order-2). */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT COLUMN: Text content ───────────────────────────────────── */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1 text-center lg:text-left mx-auto">

            {/* "Currently building" badge — fades in first (no delay) */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-2"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs md:text-sm font-medium border border-accent/20">
                {/* Pulsing green dot to signal active status */}
                <span className="w-2 h-2 rounded-full bg-success animate-status-pulse" />
                Currently building Tank Sudda &amp; Stopwash
              </span>
            </m.div>

            {/* Main heading — "Hi, I'm" fades in, then AnimatedName staggers each letter */}
            <div className="space-y-4">
              <h1 id="hero-heading" className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] md:whitespace-nowrap">
                <m.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mr-2"
                >
                  Hi, I'm
                </m.span>{" "}
                <AnimatedName name="Saad Mazhar" />
              </h1>

              {/* Subtitle — delayed so it follows the name animation */}
              <m.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-base sm:text-lg md:text-2xl text-muted-foreground font-light md:whitespace-nowrap"
              >
                • Startup Founder • Tech Speaker • Compere
              </m.p>
            </div>

            {/* Short bio paragraph */}
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              I build solutions that solve real problems. Passionate about the intersection
              of technology, design, and business. Always learning, always shipping.
            </m.p>

            {/* CTA row: three action levels
                1. Primary  — "See My Work" (filled, shimmer on hover via hero-btn-primary CSS)
                2. Outline  — "Get in Touch" (border only, fills on hover via hero-btn-outline CSS)
                3. Ghost    — "Resume" download (text-only, no background)
                Mobile: two main CTAs sit side-by-side via grid-cols-2; sm:contents dissolves
                the wrapper so all three buttons flow into the parent flex row on sm+.        */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3"
            >
              {/* grid-cols-2 on mobile only; sm:contents makes this div invisible to layout on sm+ */}
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <Link
                  to="/projects"
                  className="hero-btn-primary group inline-flex items-center justify-center gap-2 sm:w-auto"
                >
                  See My Work
                  {/* Arrow nudges right on hover via group-hover utility */}
                  <ArrowRight className="w-4 h-4 transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/contact"
                  className="hero-btn-outline group inline-flex items-center justify-center gap-2 sm:w-auto"
                >
                  Get in Touch
                </Link>
              </div>

              {/* `download` attribute tells the browser to save the file with the given name */}
              <a
                href={myResume}
                download="Saad_Mazhar_Resume.pdf"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              >
                <Download className="w-4 h-4" />
                Resume
              </a>
            </m.div>

            {/* Social icons row — label fades in at delay 1.1, each icon cascades after */}
            <div className="flex flex-col items-center lg:items-start gap-4 pt-4">
              <m.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-sm text-muted-foreground"
              >
                Connect with me:
              </m.span>
              <div className="flex flex-wrap justify-center gap-2">
                {socials.map((social, i) => (
                  // `index={i}` drives the stagger delay inside SocialIcon
                  <SocialIcon key={i} {...social} index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Profile photo with 3-D tilt + floating stat cards ── */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative order-1 lg:order-2 flex justify-center mb-8 lg:mb-0"
          >
            {/* Mouse-tracking wrapper — `perspective` enables CSS 3-D space so
                rotateX/rotateY actually look like a 3-D tilt, not a 2-D skew */}
            <div
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => { x.set(0); y.set(0); }} // reset tilt when cursor leaves
              className="relative"
              style={{ perspective: "1000px" }}
            >
              {/* Decorative blurred accent circles behind the photo */}
              <div className="absolute -top-8 -left-8 w-48 h-48 md:w-72 md:h-72 bg-accent/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 md:w-64 md:h-64 bg-accent/10 rounded-full blur-2xl" />

              {/* This div receives the spring-animated rotateX / rotateY transforms */}
              <m.div style={{ rotateX, rotateY }} className="relative">

                {/* Photo frame */}
                <div
                  className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border border-accent/20 group"
                  style={{ boxShadow: "0 0 0 1px hsl(174 72% 44% / 0.15), 0 20px 40px -10px hsl(196 60% 4% / 0.4)" }}
                >
                  {/* fetchpriority="high" + loading="eager" ensures LCP image loads ASAP.
                      Lowercase attribute name: framer-motion forwards props verbatim to the
                      DOM node, and React only recognizes the lowercase HTML attribute spelling. */}
                  <m.img
                    src={profilePhoto}
                    alt="Saad Mazhar"
                    {...{ fetchpriority: 'high' }}
                    loading="eager"
                    decoding="sync"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Accent gradient overlay that fades in on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Floating stat card — bottom-left: years of experience + project count */}
                <m.div
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
                    {/* Vertical divider between the two stats */}
                    <div className="w-px h-8 md:h-10 bg-border" />
                    <div className="text-center">
                      <p className="text-xl md:text-2xl font-display font-bold text-foreground">20+</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Projects</p>
                    </div>
                  </div>
                </m.div>

                {/* Floating badge — top-right: current project name */}
                <m.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -top-4 -right-2 md:-right-8 bg-card rounded-xl border border-border p-2 md:p-3 backdrop-blur-sm max-w-[140px] md:max-w-none"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-center gap-2">
                    {/* "S" avatar — hidden on very small screens (xs breakpoint) */}
                    <div
                      className="hidden xs:flex w-8 h-8 rounded-lg items-center justify-center text-white font-bold text-sm"
                      style={{ background: "var(--gradient-accent)" }}
                    >
                      S
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-medium text-foreground">Building</p>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground truncate">TankSudda &amp; Stopwash</p>
                    </div>
                  </div>
                </m.div>
              </m.div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
