import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Download, Instagram, Facebook, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/profile-photo.png";
import { useRef } from "react";

export function HeroSection() {
  // --- 1. REF & MOTION VALUES ---
  // useRef tracks the actual HTML element of the profile image for coordinate math
  const ref = useRef<HTMLDivElement>(null);
  
  // useMotionValue creates "reactive" numbers that Framer Motion can track without re-renders
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // useSpring smooths out the raw mouse numbers so the movement feels "organic" and bouncy
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  
  // useTransform maps the mouse position (-0.5 to 0.5) to a rotation degree (-5deg to 5deg)
  // This creates the 3D "tilt" effect based on where the cursor is
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  // --- 2. EVENT HANDLERS ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    // Calculate the bounding box of the image container
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to the center of the image
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert pixels to a percentage (-0.5 is left/top, 0.5 is right/bottom)
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    // Reset image to flat position when mouse leaves
    x.set(0);
    y.set(0);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 -z-10">
        {/* Main background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-soft/30 to-transparent" />
        
        {/* The Dot Grid Pattern using radial-gradient */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="section-container w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* --- LEFT COLUMN: TEXT & CONTENT --- */}
          <div className="space-y-8 order-2 lg:order-1">
            
            {/* Status Badge: Animates in from bottom with a pulse dot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Currently building Tank Sudda & Stopwash
              </span>
            </motion.div>

            {/* Main Heading: Uses a relative span to create a custom underline effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Hi, I'm{" "}
                <span className="relative">
                  {/* We add 'text-blue-900' (or text-secondary) here. 
                  'z-10' ensures the text sits on top of the decorative highlight.
                  */}
                  <span className="relative z-10 text-blue-900">Saad Mazhar</span>    
                  {/* Decorative highlight behind name - adjusted opacity to make the blue pop */}
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-accent/20 -z-0" />
                  </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground font-light">
                Startup Founder. Tech Speaker. Professional Compere.
              </p>
            </motion.div>

            {/* Short Bio Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              I build solutions that solve real problems. Passionate about the intersection 
              of technology, design, and business. Always learning, always shipping.
            </motion.p>

            {/* CTA Buttons: One Download and one Link to contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button asChild className="btn-primary gap-2">
                <a href="/resume.pdf" download>
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
              </Button>
              <Button asChild variant="outline" className="btn-outline gap-2">
                <Link to="/contact">
                  Get in Touch
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Social Media Links with hover transitions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-4 pt-4"
            >
              <span className="text-sm text-muted-foreground">Connect:</span>
              <div className="flex items-center gap-2">
                {/* Social Icon Template */}
                <a 
                  href="https://www.instagram.com/saaadmaz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="w-5 h-5" />
                </a> 
                {/* ... (Repeat for FB, GitHub, LinkedIn, Twitter, Mail) */}
                <a href="https://facebook.com/saadmazhar03" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Facebook Profile"><Facebook className="w-5 h-5" /></a>
                <a href="https://github.com/saadmaz/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="GitHub Profile"><Github className="w-5 h-5" /></a>
                <a href="https://linkedin.com/in/saadmazhar-" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="LinkedIn Profile"><Linkedin className="w-5 h-5" /></a>
                <a href="https://x.com/SaadMazhar_" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Twitter Profile"><Twitter className="w-5 h-5" /></a>
                <a href="mailto:saadmazaa@gmail.com" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Send Email"><Mail className="w-5 h-5" /></a>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN: INTERACTIVE PROFILE IMAGE --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div 
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative"
              style={{ perspective: "1000px" }} // Required for 3D CSS transforms to have depth
            >
              {/* Soft colorful glows behind the image */}
              <div className="absolute -top-8 -left-8 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-blue-soft rounded-full blur-2xl" />
              
              {/* The Container that actually tilts */}
              <motion.div
                style={{ rotateX, rotateY }}
                className="relative"
              >
                {/* Main Image with rounded corners and shadow */}
                <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-background group">
                  <motion.img
                    src={profilePhoto}
                    alt="Saad Mazhar"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay that appears only on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Floating Stats Card: Shows "Years Coding" and "Projects" */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute -bottom-6 -left-6 md:-left-10 bg-card rounded-xl shadow-xl border border-border p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-display font-bold text-foreground">5+</p>
                      <p className="text-xs text-muted-foreground">Years Coding</p>
                    </div>
                    {/* Vertical Divider */}
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-display font-bold text-foreground">10+</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                  </div>
                </motion.div>

                {/* Small Floating "Currently Building" Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -top-4 -right-4 md:-right-8 bg-card rounded-xl shadow-xl border border-border p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-accent-foreground font-bold text-sm">
                      S
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Building</p>
                      <p className="text-[10px] text-muted-foreground">TankSudda & Stopwash</p>
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