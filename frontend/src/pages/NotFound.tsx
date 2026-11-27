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
    <Layout hideFooter>
      <SEO title="Page not found" noIndex />
      {/* One screen, no footer. --n sizes the numerals by width and height so numerals + card always fit. */}
      <section className="relative -mt-[72px] flex h-[100dvh] flex-col overflow-hidden pt-[72px] [--n:min(50vw,40svh,28rem)] [@media(max-height:500px)]:[--n:24svh] lg:-mt-[88px] lg:pt-[88px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_50%_45%,rgb(255_95_0/0.16),transparent_70%)]"
        />
        <div className="wrap relative flex flex-1 flex-col items-center justify-center py-6 text-center md:py-8 [@media(max-height:500px)]:py-2">
          {/* The glass card overlaps the numerals' lower part so the blur has something to frost. */}
          <div aria-hidden className="relative select-none">
            <div className="pointer-events-none absolute left-1/2 top-[55%] h-[45%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-[90px]" />
            <p className="relative bg-gradient-to-br from-fg via-fg/70 to-fg/15 bg-clip-text text-[length:var(--n)] font-normal leading-[0.85] tracking-[-0.06em] text-transparent">
              404
            </p>
          </div>

          <div className="relative mt-[calc(var(--n)*-0.18)] w-full max-w-[560px] rounded-[28px] border border-fg/10 bg-surface/40 px-6 py-8 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-2xl sm:px-10 md:py-10 [@media(max-height:500px)]:py-5">
            <span className="label text-accent [@media(max-height:500px)]:hidden">Error 404</span>
            <h1 className="mt-4 text-h2 font-medium [@media(max-height:500px)]:mt-0 [@media(max-height:500px)]:text-h3">
              Oops! Page not found
            </h1>
            <p className="mx-auto mt-3 max-w-[400px] text-fg-2 [@media(max-height:500px)]:mt-1.5 [@media(max-height:500px)]:text-sm">
              The page you’re looking for has moved or doesn’t exist. Let’s get you back on track.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row [@media(max-height:500px)]:mt-4">
              <Button to="/">Back to homepage</Button>
              <Button to="/projects" variant="secondary" icon={false}>
                See my work
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
