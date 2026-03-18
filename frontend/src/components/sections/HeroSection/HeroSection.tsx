import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Download, Phone, Mail, Linkedin, Github, Instagram, Facebook, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/profile-photo.png";
import { useRef } from "react";
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf";

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
    <section className="relative min-h-screen md:min-h-[90vh] flex items-center pt-20 md:pt-0 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-accent/5 to-transparent" />
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="section-container w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center lg:justify-start"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] md:text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                Currently building Tank Sudda & Stopwash
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
                Hi, I'm{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary dark:text-white">Saad Mazhar</span>    
                  <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-3 md:h-4 bg-accent/20 -z-10 rounded-sm" />
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide lg:max-w-none max-w-md mx-auto">
                • Startup Founder • Tech Speaker • Compere
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground/80 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              I build products that bridge the gap between people and technology. 
              Currently crafting digital experiences that matter for global users.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2"
            >
              <Button asChild className="btn-primary gap-2 h-12 shadow-xl shadow-primary/10">
                <a href={myResume} download="Saad_Mazhar_Resume.pdf">
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
              </Button>

              <Button 
                asChild 
                variant="outline" 
                className="btn-outline gap-2 h-12 border-accent/30 hover:border-accent"
              >
                <Link to="/contact">
                  Get in Touch
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center lg:items-start gap-4 pt-6 border-t border-white/5"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Connect & Network</span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: Mail, href: "mailto:saadmazaa@gmail.com", label: "Email" },
                  { icon: Linkedin, href: "https://linkedin.com/in/saadmaz/", label: "LinkedIn" },
                  { icon: Github, href: "https://github.com/saadmaz/", label: "GitHub" },           
                  { icon: X, href: "https://x.com/SaadMazhar_", label: "X" },
                  { icon: Phone, href: "tel:+94720135801" , label: "Phone" },
                ].map((social, i) => (
                  <a 
                    key={i}
                    href={social.href}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-muted-foreground transition-all hover:text-accent hover:border-accent/40 hover:bg-accent/5 active:scale-90"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-1 lg:order-2 flex justify-center mb-0 lg:mb-0"
          >
            <div 
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative"
              style={{ perspective: "1000px" }}
            >
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-soft/20 rounded-full blur-3xl animate-pulse" />
              
              <motion.div
                style={{ rotateX, rotateY }}
                className="relative"
              >
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white/5 group ring-1 ring-white/10">
                  <motion.img
                    src={profilePhoto}
                    alt="Saad Mazhar"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-12 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-white/10 p-4 md:p-6 backdrop-blur-xl z-20 group-hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-display font-black text-foreground">5+</p>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Years</p>
                    </div>
                    <div className="w-px h-10 md:h-12 bg-white/10" />
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-display font-black text-foreground">50+</p>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Projects</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute top-8 -right-4 md:-right-12 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-white/10 p-3 md:p-5 backdrop-blur-xl z-20 group-hover:-translate-y-2 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-white shadow-lg shadow-accent/20">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-foreground">Innovating</p>
                      <p className="text-[9px] font-medium text-muted-foreground mt-0.5">@ Stopwash / TankSudda</p>
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
