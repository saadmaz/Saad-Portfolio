import { Link } from "react-router-dom";
import { 
  Linkedin, Github, Instagram, Facebook, X, Mail, Phone, ArrowUp
} from "lucide-react";

/** * DATA ARRAYS: Defined outside the component to prevent re-declaration.
 * These act as the "source of truth" for the navigation links.
 */
const exploreLinks = [
  { title: "Home", href: "/" },
  { title: "Featured Work", href: "/projects#featured" },
  { title: "All Projects", href: "/projects" },
  { title: "Work Experience", href: "/experience" },
  { title: "Skills & Tech Stack", href: "/skills" },
  { title: "Education", href: "/about#education" },
];

const personalLinks = [
  { title: "Events & Hosting", href: "/events" },
  { title: "Volunteer", href: "/about#volunteer" },
  { title: "Extra-Curricular", href: "/about#extracurricular" },
  { title: "Sports", href: "/about#sports" },
  { title: "Awards", href: "/about#awards" },
  { title: "Languages", href: "/about#languages" },
];

const knowledgeLinks = [
  { title: "Blog / Insights", href: "/blog" },
  { title: "Tech Newsletter", href: "/newsletters#tech" },
  { title: "Startup Newsletter", href: "/newsletters#startup" },
];

/**
 * SOCIAL MEDIA CONFIGURATION:
 * An array of objects to dynamically generate the social icon bar.
 */
const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com/in/saadmaz", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/saadmaz/", label: "GitHub" },
  { icon: Instagram, href: "https://www.instagram.com/saaadmaz/", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/saaadmazhar03/", label: "Facebook" },
  { icon: X, href: "https://x.com/SaadMazhar_", label: "X (Twitter)" },
];

export function Footer() { 
  /**
   * scrollToTop: Utility function using the window.scrollTo API 
   * to smoothly return the user to the top of the viewport.
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    /* Main wrapper: Deep dark background (#1a1a1a) with a subtle top border. */
    <footer className="bg-[#1a1a1a] text-white border-t border-white/10"> 
      <div className="section-container">
        
        {/* TOP SECTION: Information Grid */}
        <div className="py-12 md:py-16 lg:py-20">
          {/* Responsive Grid: 1 col on mobile, 2 on tablet, 5 on desktop. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            
            {/* COLUMN 1: BRAND IDENTITY - Brief summary of the persona. */}
            <div className="lg:col-span-1">
              <h3 className="font-display text-xl font-bold text-white mb-4">Saad Mazhar</h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                CS Undergraduate. Startup Founder. Tech Entrepreneur.
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Building at the intersection of technology and impact. 
              </p>
            </div>

            {/* COLUMNS 2, 3, 4: Mapping link arrays to generate vertical lists. */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Explore</h4>
              <ul className="space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-zinc-400 hover:text-white transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Personal</h4>
              <ul className="space-y-3">
                {personalLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-zinc-400 hover:text-white transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Knowledge</h4>
              <ul className="space-y-3">
                {knowledgeLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-zinc-400 hover:text-white transition-colors text-sm">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 5: CONNECT - Direct contact and social icon bar. */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Connect</h4>
              <div className="space-y-4">
                <a href="mailto:saadmazaa@gmail.com" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4" /> saadmazaa@gmail.com
                </a>
                <a href="tel:+94720135801" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" /> +(94) 72 01 358 01
                </a>
                
                {/* Social Bar: Uses active:scale-95 for haptic-like click feedback. */}
                <div className="flex flex-wrap items-center gap-2 mt-6">
                  {socialLinks.map((social) => (
                    <a 
                      key={social.label}
                      href={social.href}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 rounded-lg text-zinc-400 transition-all hover:text-white hover:bg-blue-900 active:scale-95" 
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: Legal & Utility */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
            {/* Dynamic Year rendering via the Date object. */}
            <div className="md:order-1">
              <span>© {new Date().getFullYear()} Saad Mazhar</span>
            </div>
            
            {/* Back to top trigger button. */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors md:order-2"
              aria-label="Scroll to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}