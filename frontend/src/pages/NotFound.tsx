import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui";
import { track } from "@/services/track-service";

const NotFound = () => {
  const { pathname } = useLocation();
  // Feeds the CMS's 404 monitor (path + referrer host only).
  useEffect(() => {
    track({ t: "404", path: pathname, ref: document.referrer || undefined });
  }, [pathname]);

  return (
    <Layout>
      <SEO title="Page not found" noIndex />
      <section className="relative -mt-[72px] overflow-hidden pt-[72px] lg:-mt-[88px] lg:pt-[88px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_50%_45%,rgb(255_122_77/0.16),transparent_70%)]"
        />
        <div className="wrap relative flex min-h-[70vh] flex-col items-center justify-center gap-8 py-24 text-center">
          <span className="label text-accent">Error 404</span>
          <h1 className="text-display-xl font-medium">
            Lost, <span className="soft">beautifully.</span>
          </h1>
          <p className="text-body-l text-fg-2">The page you’re after moved, or never existed.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to="/" size="lg">
              Back home
            </Button>
            <Button to="/projects" variant="secondary" size="lg" icon={false}>
              See my work
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
