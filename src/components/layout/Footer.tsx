import { Link } from "react-router-dom";
import { 
  Instagram,
  Facebook,
  Github, 
  Linkedin, 
  X, 
  Mail, 
  Phone,
  ArrowUp,
  Heart
} from "lucide-react";

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
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="section-container">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Identity Column */}
            <div className="lg:col-span-1">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                Saad Mazhar
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                CS Undergraduate. Startup Operator. Tech Entrepreneur.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Building at the intersection of technology and impact. 
                Passionate about creating solutions that matter.
              </p>
            </div>

            {/* Explore Column */}
            <div>
              <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Explore
              </h4>
              <ul className="space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="footer-link">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Personal & Community Column */}
            <div>
              <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Personal
              </h4>
              <ul className="space-y-3">
                {personalLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="footer-link">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Knowledge Hub Column */}
            <div>
              <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Knowledge Hub
              </h4>
              <ul className="space-y-3">
                {knowledgeLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="footer-link">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Connect
              </h4>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="mailto:saad@example.com" 
                    className="footer-link flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    saadmazaa@gmail.com
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:+94720135801" 
                    className="footer-link flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    +94 72-01-358-01
                  </a>
                </li>
              </ul>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 mt-6">

                <a 
                  href="https://www.instagram.com/saaadmaz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="w-5 h-5" />
                </a>  

                <a 
                  href="https://facebook.com/saadmazhar03" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Facebook Profile"
                >
                  <Facebook className="w-5 h-5" />
                </a>

                <a 
                  href="https://github.com/saadmaz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>

                <a 
                  href="https://linkedin.com/in/saadmazhar-" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5" />
                </a>

                <a 
                  href="https://x.com/SaadMazhar_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="X Profile"
                >
                  <X className="w-5 h-5" />
                </a>

              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <div className="hidden md:block"></div>
            <div className="flex justify-center items-center text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Saad Mazhar</span>
              <span className="mx-2">·</span>
            </div>
            
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
