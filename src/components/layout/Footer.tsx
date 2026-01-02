import { Link } from "react-router-dom";
import { 
  Github, 
  Linkedin, 
  Twitter, 
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
  { title: "Events", href: "/about#events" },
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
                John Doe
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
                    href="mailto:john@example.com" 
                    className="footer-link flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    john@example.com
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:+1234567890" 
                    className="footer-link flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    +1 (234) 567-890
                  </a>
                </li>
              </ul>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 mt-6">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} John Doe</span>
              <span className="mx-2">·</span>
              <span className="flex items-center gap-1">
                Built with <Heart className="w-3 h-3 text-destructive" /> using React & Tailwind
              </span>
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
