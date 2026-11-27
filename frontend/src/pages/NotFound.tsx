import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui";
import { track } from "@/services/track-service";
import { useLatestBlogPost } from "@/hooks/useBlog";
import { articlePath } from "@/lib/article-core";

/** Where most visitors are heading; shown so a 404 isn't a dead end. */
const POPULAR = [
  { to: "/projects", label: "Projects" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Talks & events" },
  { to: "/certifications", label: "Certifications" },
  { to: "/contact", label: "Contact" },
];

const NotFound = () => {
  const { pathname } = useLocation();
  const { data: latest } = useLatestBlogPost();
  // Feeds the CMS's 404 monitor (path + referrer host only).
  useEffect(() => {
    track({ t: "404", path: pathname, ref: document.referrer || undefined });
  }, [pathname]);

  return (
    <Layout>
      <SEO title="Page not found" noIndex />
      <section className="relative -mt-[72px] flex min-h-[100svh] flex-col justify-center overflow-hidden pt-[72px] lg:-mt-[88px] lg:pt-[88px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_50%_45%,rgb(255_95_0/0.16),transparent_70%)]"
        />
        <div className="wrap relative flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          {/* Giant numerals; the glass card overlaps their lower half so the blur has something to frost. */}
          <div aria-hidden className="relative select-none">
            <div className="pointer-events-none absolute left-1/2 top-[55%] h-[45%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-[90px]" />
            <p className="relative bg-gradient-to-br from-fg via-fg/70 to-fg/15 bg-clip-text text-[clamp(11.5rem,40vw,28rem)] font-normal leading-[0.85] tracking-[-0.06em] text-transparent">
              404
            </p>
          </div>

          <div className="relative -mt-[clamp(2.75rem,10vw,8.5rem)] w-full max-w-[520px] rounded-[28px] border border-fg/10 bg-surface/40 p-7 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-2xl md:p-10">
            <span className="label text-accent">Error 404</span>
            <h1 className="mt-4 text-h2 font-medium">Oops, page not found</h1>
            <p className="mx-auto mt-3 max-w-[380px] text-fg-2">
              The page you’re after moved, or never existed. Let’s get you back on track.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button to="/">Back to homepage</Button>
              <Button to="/projects" variant="secondary" icon={false}>
                See my work
              </Button>
            </div>
          </div>

          <nav aria-label="Popular pages" className="mt-12 flex flex-col items-center gap-4">
            <span className="label text-fg-3">Or try</span>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {POPULAR.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            {latest && (
              <Link
                to={articlePath(latest)}
                className="group mt-2 inline-flex items-center gap-2 rounded-full border border-line-2 px-4 py-2 text-sm text-fg-2 transition-colors hover:border-accent hover:text-fg"
              >
                <span className="label text-accent">Latest</span>
                <span className="line-clamp-1 max-w-[420px]">{latest.title}</span>
                <ArrowUpRight aria-hidden className="size-4 shrink-0" />
              </Link>
            )}
          </nav>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
