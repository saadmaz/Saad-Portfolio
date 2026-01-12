import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  ChevronDown, 
  Download,
  Instagram,
  Facebook,
  Github,
  Linkedin,
  Mail,
  Moon,
  Sun,
  X as LucideX
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
// Vite handles the PDF asset and provides a URL for the final deployment
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf";

/** * MENU DATA: Arrays are defined outside the component to prevent 
 * re-declaration on every render and keep the JSX architecture clean.
 */
const workItems = [
  { title: "Work Experience", href: "/experience", description: "Professional journey and roles" },
  { title: "Featured Projects", href: "/projects", description: "Highlighted work and ventures" },
];

const skillsItems = [
  { title: "Skills Overview", href: "/skills", description: "Technical competencies" },
  { title: "Licenses & Courses", href: "/skills#courses", description: "Certifications and learning" },
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

  /** * SCROLL LISTENER: Monitors the Y-axis to toggle 
   * background blur and transparency on the header.
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** * NAVIGATION SYNC: Automatically closes the mobile menu 
   * when a user clicks a link and prevents body scrolling 
   * while the full-screen menu is active.
   */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [location, isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* BRANDING: Clickable logo leading back to index */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-foreground">
                Saad Mazhar
              </span>
            </Link>

            {/* --- DESKTOP NAVIGATION --- */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Home Link (Direct) */}
                  <NavigationMenuItem>
                    <Link to="/" className="nav-link px-4 py-2">
                      Home
                    </Link>
                  </NavigationMenuItem>

                  {/* DROP-DOWN RENDERER: We loop through menu groups to keep code DRY (Don't Repeat Yourself) */}
                  {[
                    { label: "About", items: aboutItems, wide: true },
                    { label: "Work", items: workItems },
                    { label: "Skills", items: skillsItems },
                    { label: "Insights", items: insightsItems }
                  ].map((menu) => (
                    <NavigationMenuItem key={menu.label}>
                      {/* MODIFICATION: Removed 'hover:bg-transparent'. 
                          ADDED: 'hover:bg-black/10' (adds a dark tint) or 'hover:bg-accent/10'.
                          The 'data-[state=open]:bg-accent/10' ensures it stays dark while the menu is active.
                      */}
                      <NavigationMenuTrigger 
                        className={cn(
                          "nav-link bg-transparent transition-colors",
                          // "hover:bg-black/5 dark:hover:bg-white/5", // Subtle darkening effect
                          "hover:text-accent active:text-accent",
                          "data-[state=open]:bg-black/5 dark:data-[state=open]:bg-white/5 data-[state=open]:text-accent",
                          "focus:bg-black/5 focus:text-accent outline-none"
                        )}
                      >
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
                                <Link 
                                  to={item.href} 
                                  className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 focus:bg-accent/10"
                                >
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
                    <Link to="/contact" className="nav-link px-4 py-2">
                      Contact
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* --- DESKTOP RIGHT ACTIONS --- */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme Toggle Button: Moon/Sun animation using Framer Motion */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-all duration-300 hover:scale-105"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === "dark" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </button>

              {/* PDF DOWNLOAD: Uses 'asChild' to merge Shadcn button styles with a standard HTML anchor link */}
              <Button asChild variant="default" size="sm" className="btn-primary gap-2">
                <a href={myResume} download="Saad_Mazhar_Resume.pdf">
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
              </Button>
            </div>

            {/* --- MOBILE TOGGLES --- */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Theme toggle for mobile */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Compact Resume Download for mobile */}
              <Button asChild variant="default" size="sm" className="btn-primary gap-2 px-3">
                <a href={myResume} download="Saad_Mazhar_Resume.pdf">
                  <Download className="w-4 h-4" />
                  Resume
                </a>
              </Button>

              {/* Hamburger Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <LucideX className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE FULL-SCREEN MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-background overflow-hidden"
          >
            {/* Frosted Glass Effect Backdrop */}
            <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />
            
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative pt-24 px-6 pb-20 h-full flex flex-col justify-between overflow-y-auto"
            >
              {/* Recursive Section rendering for mobile accordions */}
              <div className="space-y-6">
                <MobileNavSection title="Home" href="/" />
                <MobileNavSection title="About" items={aboutItems} />
                <MobileNavSection title="Work" items={workItems} />
                <MobileNavSection title="Skills" items={skillsItems} />
                <MobileNavSection title="Insights" items={insightsItems} />
                <MobileNavSection title="Contact" href="/contact" />
              </div>

              {/* MOBILE MENU FOOTER: Social icons integrated for easy access */}
              <div className="mt-12 pt-6 border-t border-border">
                <div className="flex items-center gap-6">
                  <a href="https://github.com/saadmaz" target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <Github className="w-6 h-6" />
                  </a>
                  <a href="https://linkedin.com/in/saadmaz" target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a href="mailto:saadmazaa@gmail.com" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <Mail className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** * MOBILE NAV SECTION: Handles the logic between a single-click 
 * navigation link and an expandable accordion menu.
 */
function MobileNavSection({ 
  title, 
  href, 
  items 
}: { 
  title: string; 
  href?: string; 
  items?: { title: string; href: string; description: string }[] 
}) {
  const [isOpen, setIsOpen] = useState(false);

  // If a direct href is provided, render a simple link
  if (href) {
    return (
      <Link 
        to={href} 
        className="block text-2xl font-bold text-foreground hover:text-accent transition-colors py-2"
      >
        {title}
      </Link>
    );
  }

  // If it's a category, render a button that triggers a Framer Motion height animation
  return (
    <div className="border-b border-border/50 pb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-2xl font-bold text-foreground py-2"
      >
        {title}
        <ChevronDown className={cn("w-6 h-6 transition-transform duration-300", isOpen && "rotate-180 text-accent")} />
      </button>
      <AnimatePresence>
        {isOpen && items && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Recursive list of links within the accordion */}
            <div className="pt-3 pl-4 space-y-4 border-l-2 border-accent/20 ml-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block text-lg text-muted-foreground hover:text-accent active:text-accent transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}