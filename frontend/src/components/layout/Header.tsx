import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { Menu, ChevronDown, Download, Phone, Mail, Linkedin, Github, Instagram, Facebook, 
  X, Moon, Sun } from "lucide-react"; 
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useTheme } from "@/shared/hooks/useTheme";
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf";

const workItems = [
  { title: "Work Experience", href: "/experience", description: "Professional journey and roles" },
  { title: "Featured Projects", href: "/projects", description: "Highlighted work and ventures" },
];

const skillsItems = [
  { title: "Skills Overview", href: "/skills", description: "Technical competencies" },
  { title: "Licenses & Certificates", href: "/certifications", description: "Professional certifications" },
];

const aboutItems = [
  { title: "Education", href: "/about#education", description: "Academic background" },
  { title: "Events & Hosting", href: "/events", description: "Speaking and hosting" },
  { title: "Volunteer", href: "/about#volunteer", description: "Community involvement" },
  { title: "Extra-Curricular", href: "/about#extracurricular", description: "Activities and interests" },
  { title: "Sports", href: "/about#sports", description: "Athletic pursuits" },
  { title: "Languages", href: "/about#languages", description: "Communication abilities" },
  { title: "Awards", href: "/about#awards", description: "Recognition and honors" },
];

const insightsItems = [
  { title: "Blog / Thoughts", href: "/blog", description: "Articles and perspectives" },
  { title: "Newsletters", href: "/newsletters", description: "Knowledge hub subscriptions" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    mobileNavRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-transparent"
        )}>
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 relative z-[60]">
              <span className="font-display text-xl font-bold text-foreground">Saad Mazhar</span>
            </Link>

            <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/" className="nav-link px-4 py-2">Home</Link>
                  </NavigationMenuItem>

                  {[
                    { label: "About", items: aboutItems, wide: true },
                    { label: "Work", items: workItems },
                    { label: "Skills", items: skillsItems },
                    { label: "Insights", items: insightsItems }
                  ].map((menu) => (
                    <NavigationMenuItem key={menu.label}>
                      <NavigationMenuTrigger className={cn(
                          "nav-link bg-none transition-all duration-300 px-4 py-2",
                          "hover:text-accent active:text-accent hover:bg-transparent focus:bg-transparent",
                          "data-[state=open]:bg-transparent data-[state=open]:text-accent",
                          "focus:text-accent outline-none border-none shadow-none"
                        )}>
                        {menu.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className={cn(
                          "grid gap-1 p-3 bg-popover rounded-lg shadow-lg border border-border",
                          menu.wide ? "w-[450px] md:grid-cols-2" : "w-[300px]"
                        )}>
                          {menu.items.map((item) => (
                            <li key={item.href}>
                              <NavigationMenuLink asChild>
                                <Link to={item.href} className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 focus:bg-accent/10">
                                  <div className="text-sm font-medium text-foreground">{item.title}</div>
                                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}

                  <NavigationMenuItem>
                    <Link to="/contact" className="nav-link px-4 py-2">Contact</Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-lg bg-transparent text-foreground/70 hover:text-accent transition-all duration-300 hover:scale-110" aria-label="Toggle theme">
                <m.div initial={false} animate={{ rotate: theme === "dark" ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </m.div>
              </button>
              
              <Button asChild variant="ghost" size="sm" className="btn-accent gap-2 h-auto">
                <a href={myResume} download="Saad_Mazhar_Resume.pdf"><Download className="w-4 h-4" />Download Resume</a>
              </Button>
            </div>

            <div className="flex lg:hidden items-center gap-2 relative z-[60]">
              <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-lg bg-transparent text-foreground/70 hover:text-accent transition-all">
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                ref={menuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav"
                className="p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[45] lg:hidden">
            <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />
            <m.nav id="mobile-nav" ref={mobileNavRef} tabIndex={-1} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="relative pt-24 px-6 pb-20 h-full flex flex-col justify-between overflow-y-auto z-[50] focus:outline-none">
              <div className="space-y-6">
                <MobileNavSection title="Home" href="/" />
                <MobileNavSection title="About" items={aboutItems} />
                <MobileNavSection title="Work" items={workItems} />
                <MobileNavSection title="Skills" items={skillsItems} />
                <MobileNavSection title="Insights" items={insightsItems} />
                <MobileNavSection title="Contact" href="/contact" />
              </div>

              <div className="mt-12 pt-6 border-t border-border">
                <div className="flex flex-wrap items-center gap-6">
                  <a href="tel:+94720135801" aria-label="Call Saad" className="p-2.5 text-muted-foreground hover:text-accent transition-colors"><Phone className="w-6 h-6" /></a>
                  <a href="mailto:saadmazaa@gmail.com" aria-label="Email Saad" className="p-2.5 text-muted-foreground hover:text-accent transition-colors"><Mail className="w-6 h-6" /></a>
                  <a href="https://linkedin.com/in/saadmaz" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="p-2.5 text-muted-foreground hover:text-accent transition-colors"><Linkedin className="w-6 h-6" /></a>
                  <a href="https://github.com/saadmaz" target="_blank" rel="noreferrer" aria-label="GitHub" className="p-2.5 text-muted-foreground hover:text-accent transition-colors"><Github className="w-6 h-6" /></a>
                  <a href="https://instagram.com/saaadmaz/" target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2.5 text-muted-foreground hover:text-accent transition-colors"><Instagram className="w-6 h-6" /></a>
                  <a href="https://facebook.com/saadmazhar03/" target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2.5 text-muted-foreground hover:text-accent transition-colors"><Facebook className="w-6 h-6" /></a>
                  <a href="https://x.com/SaadMazhar_" target="_blank" rel="noreferrer" aria-label="X (Twitter)" className="p-2.5 text-muted-foreground hover:text-accent transition-colors"><X className="w-6 h-6" /></a>
                </div>
              </div>
            </m.nav>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavSection({ title, href, items }: { title: string; href?: string; items?: { title: string; href: string; description: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  if (href) {
    return (
      <Link to={href} className="relative block text-2xl font-bold text-foreground hover:text-accent transition-colors py-2 z-[55]">{title}</Link>
    );
  }

  return (
    <div className="border-b border-border/50 pb-2 relative z-[51]">
      <button onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} className="flex items-center justify-between w-full text-2xl font-bold text-foreground py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
        {title}
        <ChevronDown className={cn("w-6 h-6 transition-transform duration-300", isOpen && "rotate-180 text-accent")} />
      </button>
      <AnimatePresence>
        {isOpen && items && (
          <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="pt-3 pl-4 space-y-4 border-l-2 border-accent/20 ml-1">
              {items.map((item) => (
                <Link key={item.href} to={item.href} className="block text-lg text-muted-foreground hover:text-accent active:text-accent transition-colors py-1 z-[55]">{item.title}</Link>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}