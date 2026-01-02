import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Pattern */}
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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Currently building at Startup XYZ
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Hi, I'm{" "}
                <span className="relative">
                  <span className="relative z-10">John Doe</span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-accent/20 -z-0" />
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light">
                CS Undergraduate. Startup Operator. Tech Entrepreneur.
              </p>
            </motion.div>

            {/* Mission Statement */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              I build products that solve real problems. Passionate about the intersection 
              of technology, design, and business — always learning, always shipping.
            </motion.p>

            {/* CTA Buttons */}
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

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-4 pt-4"
            >
              <span className="text-sm text-muted-foreground">Connect:</span>
              <div className="flex items-center gap-2">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="mailto:john@example.com"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Profile Image / Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-blue-soft rounded-full blur-2xl" />
              
              {/* Main Card */}
              <div className="relative bg-card rounded-2xl shadow-xl border border-border overflow-hidden p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <StatCard number="5+" label="Years Coding" />
                  <StatCard number="15+" label="Projects Built" />
                  <StatCard number="3" label="Startups Founded" />
                  <StatCard number="10+" label="Technologies" />
                </div>

                {/* Now Building Section */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Currently building:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-accent-foreground font-bold">
                      S
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Startup XYZ</p>
                      <p className="text-xs text-muted-foreground">AI-powered productivity tool</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center p-4 rounded-xl bg-secondary/50">
      <p className="text-3xl font-display font-bold text-foreground">{number}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
