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
  X as LucideX, // Renamed to avoid conflict with X (Twitter)
  Mail
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

/** * NAVIGATION DATA: Defined outside the component for cleaner JSX. 
 * These arrays power both the Desktop hover menus and Mobile accordions.
 */
const workItems = [
  { title: "Work Experience", href: "/experience", description: "Professional journey and roles" },
  { title: "Featured Projects", href: "/projects#featured", description: "Highlighted work and ventures" },
  { title: "All Projects", href: "/projects", description: "Complete project portfolio" },
];

const skillsItems = [
  { title: "Skills Overview", href: "/skills", description: "Technical competencies" },
  { title: "Tech Stack", href: "/skills#stack", description: "Tools and technologies" },
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

  /** * SCROLL SENSOR: Tracks window Y-offset to toggle the 
   * sticky header's transparency and background blur.
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** * NAVIGATION LOCK & CLEANUP: Closes menu on route change 
   * and prevents page scrolling when the mobile overlay is active.
   */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [location]);

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
            {/* LOGO: Always clickable to return to the root homepage. */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-foreground">
                Saad Mazhar
              </span>
            </Link>

            {/* --- DESKTOP NAV --- (Hidden below 1024px) */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Standard Link without Dropdown */}
                  <NavigationMenuItem>
                    <Link to="/" className="nav-link px-4 py-2">
                      Home
                    </Link>
                  </NavigationMenuItem>

                  {/* DROP-DOWN MENUS: Each uses NavigationMenuTrigger with custom hover color logic. */}
                  {/* WORK DROPDOWN */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="nav-link bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-colors hover:text-blue-900 active:text-blue-900 data-[state=open]:text-blue-900">
                      Work
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-1 p-3 bg-popover rounded-lg shadow-lg">
                        {workItems.map((item) => (
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

                  {/* SKILLS DROPDOWN */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="nav-link bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-colors hover:text-blue-900 active:text-blue-900 data-[state=open]:text-blue-900">
                      Skills
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-1 p-3 bg-popover rounded-lg shadow-lg">
                        {skillsItems.map((item) => (
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

                  {/* ABOUT DROPDOWN (2-Column Grid for larger item lists) */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="nav-link bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-colors hover:text-blue-900 active:text-blue-900 data-[state=open]:text-blue-900">
                      About
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[450px] gap-1 p-3 md:grid-cols-2 bg-popover rounded-lg shadow-lg">
                        {aboutItems.map((item) => (
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

                  {/* INSIGHTS DROPDOWN */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="nav-link bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-colors hover:text-blue-900 active:text-blue-900 data-[state=open]:text-blue-900">
                      Insights
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[280px] gap-1 p-3 bg-popover rounded-lg shadow-lg">
                        {insightsItems.map((item) => (
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

                  <NavigationMenuItem>
                    <Link to="/contact" className="nav-link px-4 py-2">
                      Contact
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* CTA BUTTON: Desktop only download action. */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="default" size="sm" className="btn-primary gap-2">
                <Download className="w-4 h-4" />
                Download Resume
              </Button>
            </div>

            {/* --- MOBILE TOGGLES --- (Visible on small/tablet screens) */}
            <div className="flex lg:hidden items-center gap-3">
              <Button variant="default" size="sm" className="btn-primary gap-2">
                <Download className="w-4 h-4" />
                Resume
              </Button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {/* Switches between Menu and Close icon based on state. */}
                {isMobileMenuOpen ? <LucideX className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE FULL-SCREEN MENU --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-background overflow-hidden"
          >
            {/* Blurred background for a premium feel. */}
            <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />
            
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative pt-24 px-6 pb-20 h-full flex flex-col justify-between overflow-y-auto"
            >
              {/* ACCORDION MENU: Renders expandable sections for long item lists. */}
              <div className="space-y-6">
                <MobileNavSection title="Home" href="/" />
                <MobileNavSection title="Work" items={workItems} />
                <MobileNavSection title="Skills" items={skillsItems} />
                <MobileNavSection title="About" items={aboutItems} />
                <MobileNavSection title="Insights" items={insightsItems} />
                <MobileNavSection title="Contact" href="/contact" />
              </div>

              {/* SOCIAL ICONS (Mobile Menu Footer): Provides touch-friendly social links. */}
              <div className="mt-12 pt-6 border-t border-border">
                <div className="flex items-center gap-6">
                  <a href="https://github.com/saadmaz" target="_blank" className="p-2 text-muted-foreground hover:text-blue-900 transition-colors">
                    <Github className="w-6 h-6" />
                  </a>
                  <a href="https://linkedin.com/in/saadmazhar-" target="_blank" className="p-2 text-muted-foreground hover:text-blue-900 transition-colors">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a href="https://x.com/SaadMazhar_" target="_blank" className="p-2 text-muted-foreground hover:text-blue-900 transition-colors">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="mailto:saadmazaa@gmail.com" className="p-2 text-muted-foreground hover:text-blue-900 transition-colors">
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

/** * MOBILE NAVIGATION SECTION: Functional component that handles 
 * either a single navigation Link or an expandable Accordion.
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

  // If a direct href is passed, it renders as a single bold link.
  if (href) {
    return (
      <Link 
        to={href} 
        className="block text-2xl font-bold text-foreground hover:text-blue-900 transition-colors py-2"
      >
        {title}
      </Link>
    );
  }

  // If items are passed, it renders a button that toggles the sub-list visibility.
  return (
    <div className="border-b border-border/50 pb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-2xl font-bold text-foreground py-2"
      >
        {title}
        {/* Chevron rotates 180deg when the accordion is open. */}
        <ChevronDown className={cn("w-6 h-6 transition-transform duration-300", isOpen && "rotate-180 text-blue-900")} />
      </button>
      <AnimatePresence>
        {isOpen && items && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pl-4 space-y-4 border-l-2 border-blue-900/10 ml-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block text-lg text-muted-foreground hover:text-blue-900 active:text-blue-900 transition-colors"
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