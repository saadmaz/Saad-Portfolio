import { Link } from "react-router-dom";
import { 
  Instagram,
  Facebook,
  Github, 
  Linkedin, 
  X, 
  Mail, 
  Phone,
  ArrowUp
} from "lucide-react";

/** * DATA ARRAYS: We define these outside the component to keep the 
 * JSX clean and make it easier to add/remove links in the future.
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

export function Footer() {
  /** * HELPER FUNCTION: Scrolls the user back to the top of the page 
   * with a smooth animation rather than a sudden jump.
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  {/* Root footer uses a solid dark grey hex (#1a1a1a) and forces white text. */}
  {/* The border-t uses white with 10% opacity to create a subtle separation line. */}
  return (
    <footer className="bg-[#1a1a1a] text-white border-t border-white/10">
      <div className="section-container">
        
        {/* MAIN CONTENT GRID: 5 columns on desktop, stacking on mobile. */}
        {/* We use py-12 to py-20 to give the content plenty of professional "breathing room." */}
        <div className="py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            
            {/* COLUMN 1: BRAND IDENTITY */}
            {/* Highlights your name and roles with high-contrast white and soft grey text. */}
            <div className="lg:col-span-1">
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Saad Mazhar
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                CS Undergraduate. Startup Operator. Tech Entrepreneur.
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Building at the intersection of technology and impact. 
                Passion for creating solutions that matter.
              </p>
            </div>

            {/* COLUMN 2: EXPLORE NAVIGATION */}
            {/* Maps through the exploreLinks array to create consistent, hoverable navigation. */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Explore
              </h4>
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

            {/* COLUMN 3: PERSONAL LINKS */}
            {/* Showcases your diversity of interests using the same clean vertical list style. */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Personal
              </h4>
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

            {/* COLUMN 4: KNOWLEDGE HUB */}
            {/* Highlights your newsletters and blog, critical for building authority. */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Knowledge Hub
              </h4>
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

            {/* COLUMN 5: CONTACT & SOCIALS */}
            {/* Directly links to your email and phone, followed by branded icon buttons. */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Connect
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:saadmazaa@gmail.com" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    saadmazaa@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+94720135801" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    +94 72-01-358-01
                  </a>
                </li>
              </ul>
              
              {/* SOCIAL BUTTON BAR: These use the white-icon-on-dark-blue hover effect. */}
              <div className="flex items-center gap-3 mt-6">
                
                {/* Instagram: Inverts from grey to white text with a blue-900 background. */}
                {/* The 'rounded-lg' and 'p-2' ensure the blue background looks like a clean tile. */}
                <a 
                  href="https://www.instagram.com/saaadmaz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-blue-900"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="w-5 h-5" />
                </a>

                {/* GitHub: Standardizes the tech profile link with the same interaction logic. */}
                {/* Uses 'transition-colors' to prevent a jarring visual snap when hovering. */}
                <a 
                  href="https://github.com/saadmaz/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-blue-900" 
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>

                {/* LinkedIn: Professional profile link that matches the secondary brand color. */}
                {/* The 'text-zinc-400' provides a muted state that doesn't distract from the main content. */}
                <a 
                  href="https://linkedin.com/in/saadmazhar-" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-blue-900" 
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5" />
                </a>

                {/* X (Twitter): Updated social icon with the dark blue hover background. */}
                {/* Uses a w-5 h-5 size to ensure optical alignment with other icons. */}
                <a 
                  href="https://x.com/SaadMazhar_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-lg text-zinc-400 transition-colors hover:text-white hover:bg-blue-900" 
                  aria-label="X Profile"
                >
                  <X className="w-5 h-5" />
                </a>

              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: COPYRIGHT & UTILITY */}
        {/* We use a grid-cols-3 to keep the copyright perfectly centered in the layout. */}
        <div className="py-6 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            
            {/* Empty column for grid balancing on desktop. */}
            <div className="hidden md:block"></div>
            
            {/* Copyright: Centered on screen, showing the current dynamic year. */}
            <div className="flex justify-center items-center text-sm text-zinc-500">
              <span>© {new Date().getFullYear()} Saad Mazhar</span>
              <span className="mx-2">·</span>
            </div>
            
            {/* Back to top: Positioned to the right with a Lucide ArrowUp icon. */}
            {/* On click, it triggers the scrollToTop function defined at the start. */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors md:justify-self-end"
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