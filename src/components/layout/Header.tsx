import { useState, useEffect } from "react"; // React hooks for state and lifecycle management
import { Link, useLocation } from "react-router-dom"; // Hooks for routing and detecting current URL
import { motion, AnimatePresence } from "framer-motion"; // Library for smooth React animations
import { 
  Menu, 
  ChevronDown, 
  Download,
  Phone,
  Mail,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  X,
  Moon,
  Sun,
  X as LucideX
} from "lucide-react"; // Icons for various UI elements
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"; // Shadcn UI components for the dropdown system
import { Button } from "@/components/ui/button"; // Standardized button component
import { cn } from "@/lib/utils"; // Utility to merge Tailwind classes conditionally
import { useTheme } from "@/hooks/useTheme"; // Custom hook to manage Dark/Light mode
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf"; // Importing PDF asset for download

// NAVIGATION DATA OBJECTS:
// We define these outside the component to prevent them from being 
// recreated in memory on every single render.

const workItems = [
  { title: "Work Experience", href: "/experience", description: "Professional journey and roles" }, // Main work experience page
  { title: "Featured Projects", href: "/projects", description: "Highlighted work and ventures" }, // Projects overview
];

const skillsItems = [ // Skills-related navigation links
  { title: "Skills Overview", href: "/skills", description: "Technical competencies" }, // Main skills page
  { title: "Licenses & Courses", href: "/skills#courses", description: "Certifications and learning" },  // Courses and licenses
];

const aboutItems = [
  { title: "Education", href: "/about#education", description: "Academic background" }, //  Education section
  { title: "Events & Hosting", href: "/events", description: "Speaking and hosting" }, // Events page
  { title: "Volunteer", href: "/about#volunteer", description: "Community involvement" }, // Volunteer section
  { title: "Extra-Curricular", href: "/about#extracurricular", description: "Activities and interests" },   // Extra-curriculars
  { title: "Sports", href: "/about#sports", description: "Athletic pursuits" }, // Sports section
  { title: "Languages", href: "/about#languages", description: "Communication abilities" }, // Languages section
  { title: "Awards", href: "/about#awards", description: "Recognition and honors" }, // Awards section
];

const insightsItems = [
  { title: "Blog / Thoughts", href: "/blog", description: "Articles and perspectives" }, // Blog main page
  { title: "Newsletters", href: "/newsletters", description: "Knowledge hub subscriptions" }, // Newsletters overview
];

export function Header() {
  // STATE: Tracks if the user has scrolled down (to change header style)
  const [isScrolled, setIsScrolled] = useState(false);
  // STATE: Controls the visibility of the full-screen mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const location = useLocation(); // Detects URL changes
  const { theme, toggleTheme } = useTheme(); // Accesses theme state and toggle function

  // SCROLL LISTENER: 
  //   Adds an event listener to the window. If the user scrolls more than 10px, 
  //   'isScrolled' becomes true, triggering the glass-morphism effect.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup on unmount
  }, []);

  /** * NAVIGATION SYNC: 
   * Closes the mobile menu automatically whenever the URL path changes.
   */
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [location]);

  /** * BODY SCROLL LOCK: 
   * Prevents the background content from scrolling when the mobile menu is open.
   */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset"; // Ensure scroll is restored if component breaks
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* HEADER WRAPPER: Fixed to top. Switches from transparent to blurred background on scroll. */}
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
            
            {/* BRANDING: Logo link. z-[60] keeps it above the mobile menu overlay. */}
            <Link to="/" className="flex items-center gap-2 relative z-[60]">
              <span className="font-display text-xl font-bold text-foreground">
                Saad Mazhar
              </span>
            </Link>

            {/* --- DESKTOP NAVIGATION --- */}
            {/* Hidden on mobile (lg:flex). gap-1 provides spacing between nav items. */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Static link for Home */}
                  <NavigationMenuItem>
                    <Link to="/" className="nav-link px-4 py-2">
                      Home
                    </Link>
                  </NavigationMenuItem>

                  {/* DROP-DOWN RENDERER: Iterates through menu data to build complex dropdowns. */}
                  {[
                    { label: "About", items: aboutItems, wide: true },
                    { label: "Work", items: workItems },
                    { label: "Skills", items: skillsItems },
                    { label: "Insights", items: insightsItems }
                  ].map((menu) => (
                    <NavigationMenuItem key={menu.label}>
                      {/* Trigger: The clickable text that opens the dropdown. */}
                      <NavigationMenuTrigger 
                        className={cn(
                          // 1. Remove 'bg-transparent' and replace with 'bg-none' to ensure no hidden backgrounds.
                          // 2. Remove standard Shadcn hover backgrounds.
                          "nav-link bg-none transition-all duration-300 px-4 py-2", 
                          
                          // HOVER STATE: Only change the text color. 
                          // We use a slightly darker version of your accent color or the foreground.
                          "hover:text-accent active:text-accent hover:bg-transparent focus:bg-transparent",
                          
                          // OPEN STATE (When the dropdown is active):
                          // We remove the 'bg-black/5' or 'bg-blue' container entirely.
                          // Instead, we just keep the text highlighted in the accent color.
                          "data-[state=open]:bg-transparent data-[state=open]:text-accent",
                          
                          // OPTIONAL: If you want a VERY subtle darkening of the text area 
                          // without a sharp "container" look, you can use a text-shadow 
                          // or a very faint bottom border instead.
                          "focus:text-accent outline-none border-none shadow-none"
                        )}
                      >
                        {menu.label}
                      </NavigationMenuTrigger>
                      
                      {/* Content: The actual dropdown box containing sub-links. */}
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

                  {/* Static link for Contact */}
                  <NavigationMenuItem>
                    <Link to="/contact" className="nav-link px-4 py-2">
                      Contact
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* DESKTOP RIGHT ACTIONS */}
            <div className="hidden lg:flex items-center gap-3">
              {/* THEME TOGGLE: Animates a 180-degree rotation when clicked. */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-transparent text-foreground/70 hover:text-foreground transition-all duration-300 hover:scale-110"
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
              
              {/* RESUME BUTTON: Renders as an 'a' tag to allow native PDF downloading. */}
              <Button asChild variant="default" size="sm" className="btn-primary gap-2">
                <a href={myResume} download="Saad_Mazhar_Resume.pdf">
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
              </Button>
            </div>

            {/* --- MOBILE TOGGLES --- */}
            {/* relative z-[60] ensures buttons stay clickable on top of the menu overlay. */}
            <div className="flex lg:hidden items-center gap-2 relative z-[60]">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-transparent text-foreground/70 hover:text-foreground transition-all"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <Button asChild variant="default" size="sm" className="btn-primary gap-2 px-3">
                <a href={myResume} download="Saad_Mazhar_Resume.pdf">
                  <Download className="w-4 h-4" />
                  Resume
                </a>
              </Button>

              {/* HAMBURGER BUTTON: Toggles the boolean state of 'isMobileMenuOpen'. */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground focus:outline-none"
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[45] lg:hidden"
          >
            {/* BACKDROP: Provides the blurred dark/light background. */}
            <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />
            
            {/* NAV CONTENT: Animates sliding in from the top. */}
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative pt-24 px-6 pb-20 h-full flex flex-col justify-between overflow-y-auto z-[50]"
            >
              {/* MOBILE ACCORDIONS: Renders the sub-menus for mobile users. */}
              <div className="space-y-6">
                <MobileNavSection title="Home" href="/" />
                <MobileNavSection title="About" items={aboutItems} />
                <MobileNavSection title="Work" items={workItems} />
                <MobileNavSection title="Skills" items={skillsItems} />
                <MobileNavSection title="Insights" items={insightsItems} />
                <MobileNavSection title="Contact" href="/contact" />
              </div>

              {/* SOCIAL FOOTER: Links for quick social access at the bottom of the menu. */}
              <div className="mt-12 pt-6 border-t border-border">
                <div className="flex items-center gap-6">
                  <a href="tel:+94720135801" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <Phone className="w-6 h-6" />
                  </a>
                  <a href="mailto:saadmazaa@gmail.com" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <Mail className="w-6 h-6" />
                  </a>
                  <a href="https://linkedin.com/in/saadmaz" target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a href="https://github.com/saadmaz" target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <Github className="w-6 h-6" />
                  </a>
                  <a href="https://instagram.com/saaadmaz/" target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="https://facebook.com/saadmazhar03/" target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="https://x.com/SaadMazhar_" target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-accent transition-colors">
                    <X className="w-6 h-6" />
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

// MOBILE NAV SECTION COMPONENT: 
//  Handles logic for mobile links. If it has 'items', it renders an expandable 
//  accordion. If it has an 'href', it renders a direct link.
function MobileNavSection({ 
  title, 
  href, 
  items 
}: { 
  title: string; 
  href?: string; 
  items?: { title: string; href: string; description: string }[] 
}) {
  const [isOpen, setIsOpen] = useState(false); // Controls local accordion state

  // DIRECT LINK VERSION
  if (href) {
    return (
      <Link 
        to={href} 
        className="relative block text-2xl font-bold text-foreground hover:text-accent transition-colors py-2 z-[55]"
      >
        {title}
      </Link>
    );
  }

  // ACCORDION VERSION
  return (
    <div className="border-b border-border/50 pb-2 relative z-[51]">
      {/* Category Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-2xl font-bold text-foreground py-2 focus:outline-none"
      >
        {title}
        {/* Chevron icon rotates 180deg when the section is open */}
        <ChevronDown className={cn("w-6 h-6 transition-transform duration-300", isOpen && "rotate-180 text-accent")} />
      </button>
      <AnimatePresence>
        {/* Animated Sub-links list */}
        {isOpen && items && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pl-4 space-y-4 border-l-2 border-accent/20 ml-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block text-lg text-muted-foreground hover:text-accent active:text-accent transition-colors py-1 z-[55]"
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