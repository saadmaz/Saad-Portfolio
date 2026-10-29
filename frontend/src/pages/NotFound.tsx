/**
 * NotFound.tsx - 404 Page
 * ─────────────────────────────────────────────────────────────
 * Branded 404 that matches the portfolio's design language:
 *  - Large animated "404" with a teal glow
 *  - Witty copy
 *  - Quick-nav links so visitors don't bounce
 *  - Logs the bad path to console for debugging
 */
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { m } from "framer-motion";
import { Home, Briefcase, Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const quickLinks = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Briefcase, label: "Projects", href: "/projects" },
  { icon: BookOpen, label: "Blog", href: "/blog" },
  { icon: Mail, label: "Contact", href: "/contact" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 - route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO
        title="404 - Page Not Found"
        description="This page doesn't exist. Head back to Saad Mazhar's portfolio."
        noIndex
      />

      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
        {/* ── Background ambient blobs ────────────────────────────── */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="hidden dark:block absolute top-1/4 right-1/4 w-72 h-72 bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

        {/* ── Main content ────────────────────────────────────────── */}
        <div className="relative z-10 text-center max-w-lg w-full">
          {/* Giant 404 */}
          <m.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6"
          >
            <span
              className="font-display text-[8rem] sm:text-[10rem] font-black leading-none tracking-tighter select-none"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--accent)) 60%, hsl(var(--accent)/0.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              404
            </span>
            {/* Teal glow behind the number */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-24 bg-accent/20 blur-3xl rounded-full" />
            </div>
          </m.div>

          {/* Heading */}
          <m.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3"
          >
            Lost in the void
          </m.h1>

          {/* Subtext */}
          <m.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-muted-foreground mb-2 leading-relaxed"
          >
            The page at{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-accent text-sm font-mono">
              {location.pathname}
            </code>{" "}
            doesn't exist.
          </m.p>
          <m.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-sm text-muted-foreground mb-10"
          >
            It may have been moved, deleted, or never existed in the first place.
          </m.p>

          {/* Primary CTA */}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.4 }}
            className="mb-10"
          >
            <Button asChild className="btn-primary gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </m.div>

          {/* Quick nav grid */}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.4 }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">
              Or jump to
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickLinks.map(({ icon: Icon, label, href }) => (
                <Link
                  key={href}
                  to={href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-accent/40 hover:bg-accent/5 transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </m.div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
