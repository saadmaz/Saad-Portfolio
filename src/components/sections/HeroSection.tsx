import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Download, Phone, Mail, Linkedin, Github, Instagram, Facebook, X,} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/profile-photo.png";
import { useRef } from "react";

export function HeroSection() {
  // --- 1. REF & MOTION VALUES ---
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  // --- 2. EVENT HANDLERS ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    /**
     * ALIGNMENT FIX: Added 'pt-24 md:pt-0' 
     * This ensures the Hero content starts below your fixed header on mobile 
     * and centers vertically on larger desktops.
     */
    <section className="relative min-h-screen md:min-h-[90vh] flex items-center pt-24 md:pt-0 overflow-hidden">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-soft/30 to-transparent" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="section-container w-full">
        {/* MOBILE FIX: Changed gap-8 to gap-12 for better vertical breathing room.
          Elements are ordered so Text (Left) comes after Image (Right) on mobile 
          for a more standard landing page flow.
        */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* --- LEFT COLUMN: TEXT & CONTENT --- */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1 text-center lg:text-left">
            
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center lg:justify-start"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs md:text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Currently building Tank Sudda & Stopwash
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
                Hi, I'm{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-blue-900">Saad Mazhar</span>    
                  <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-2 md:h-2 bg-accent/20 -z-0" />
                </span>
              </h1>
              
              <p className="text-lg md:text-2xl text-muted-foreground font-light">
                • Startup Founder • Tech Speaker • Compere
              </p>
            </motion.div>

            {/* Short Bio */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              I build solutions that solve real problems. Passionate about the intersection 
              of technology, design, and business. Always learning, always shipping.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            >
              <Button asChild className="btn-primary gap-2 w-full sm:w-auto">
                <a href="/resume.pdf" download>
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
              </Button>

              <Button 
                asChild 
                variant="outline" 
                className="btn-outline gap-2 w-full sm:w-auto transition-all duration-300 hover:bg-blue-900 hover:text-white hover:border-blue-900"
              >
                <Link to="/contact">
                  Get in Touch
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Social Media Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center lg:items-start gap-4 pt-4"
            >
              <span className="text-sm text-muted-foreground">Connect with me:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: Phone, href: "tel:+94720135801" , label: "Phone" },
                  { icon: Mail, href: "mailto:saadmazaa@gmail.com", label: "Email" },
                  { icon: Linkedin, href: "https://linkedin.com/in/saadmaz/", label: "LinkedIn" },
                  { icon: Github, href: "https://github.com/saadmaz/", label: "GitHub" },                  
                  { icon: Instagram, href: "https://instagram.com/saaadmaz/", label: "Instagram" },
                  { icon: Facebook, href: "https://facebook.com/saadmazhar03", label: "Facebook" },
                  { icon: X, href: "https://x.com/SaadMazhar_", label: "X" },
                ].map((social, i) => (
                  <a 
                    key={i}
                    href={social.href}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg text-muted-foreground transition-all hover:text-white hover:bg-blue-900 active:scale-95"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN: INTERACTIVE PROFILE IMAGE --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            /* ALIGNMENT FIX: Added mb-8 on mobile to prevent text from hitting the image */
            className="relative order-1 lg:order-2 flex justify-center lg:justify-end mb-8 lg:mb-0"
          >
            <div 
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative"
              style={{ perspective: "1000px" }}
            >
              {/* Soft colorful glows */}
              <div className="absolute -top-8 -left-8 w-48 h-48 md:w-72 md:h-72 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 md:w-64 md:h-64 bg-blue-soft rounded-full blur-2xl" />
              
              <motion.div
                style={{ rotateX, rotateY }}
                className="relative"
              >
                {/* MOBILE IMAGE SIZE: Slightly reduced for mobile (w-64) 
                  to ensure the stats cards don't overflow the screen width.
                */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-background group">
                  <motion.img
                    src={profilePhoto}
                    alt="Saad Mazhar"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Floating Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-10 bg-card rounded-xl shadow-xl border border-border p-3 md:p-4 backdrop-blur-sm"
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

                {/* Building Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -top-4 -right-2 md:-right-8 bg-card rounded-xl shadow-xl border border-border p-2 md:p-3 backdrop-blur-sm max-w-[140px] md:max-w-none"
                >
                  <div className="flex items-center gap-2">
                    <div className="hidden xs:flex w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 items-center justify-center text-accent-foreground font-bold text-sm">
                      S
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-medium text-foreground">Building</p>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground truncate">TankSudda & Stopwash</p>
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