import { cn } from "@/lib/utils";
import { SubscribeForm } from "@/components/SubscribeForm";
import { Link } from "react-router-dom";
import { CONTACT } from "@/lib/site";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { usePatents, usePublications } from "@/hooks/useContent";

type FooterLink = { label: string; to?: string; href?: string; download?: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "About",
    links: [
      { label: "Education", to: "/education" },
      { label: "Events & Hosting", to: "/events" },
      { label: "Awards", to: "/about#awards" },
    ],
  },
  {
    title: "Work",
    links: [
      { label: "Experience", to: "/experience" },
      { label: "Projects", to: "/projects" },
      { label: "Skills", to: "/skills" },
      { label: "Certificates", to: "/certifications" },
    ],
  },
  {
    title: "Insights",
    links: [
      { label: "Blog", to: "/blog" },
      { label: "Newsletters", to: "/newsletters" },
      { label: "Publications", to: "/publications" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export function Footer({ screen = false }: { screen?: boolean }) {
  const { data: pubs } = usePublications();
  const { data: patents } = usePatents();
  // Hide the link while there's nothing to show (unknown while loading → keep it).
  const hidePubs = pubs !== undefined && patents !== undefined && !pubs.length && !patents.length;
  return (
    <footer
      className={cn(
        "overflow-hidden border-t border-line",
        screen && "md:flex md:min-h-[100svh] md:flex-col",
      )}
    >
      <div
        className={cn(
          "wrap pb-8 pt-14 md:pt-20",
          screen && "md:flex md:flex-1 md:flex-col md:justify-between md:pt-[112px]",
        )}
      >
        {/* Capped and centred so the footer doesn't sprawl on wide screens. */}
        <div className="mx-auto w-full max-w-[1040px]">
          <div className="grid items-center gap-5 rounded-2xl border border-line bg-surface/40 p-5 md:grid-cols-[minmax(0,1fr)_400px] md:gap-10 md:p-7">
            <div className="flex flex-col gap-1.5">
              <p className="text-h4 font-medium">Notes from the build</p>
              <p className="text-sm text-fg-2">
                Shipping products, applied AI and startups. A couple of issues a month, at most.
              </p>
            </div>
            <SubscribeForm compact source="footer" />
          </div>

          <div className="mt-12 grid gap-10 md:mt-14 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
            <div className="flex max-w-[340px] flex-col gap-3">
              <p className="text-h4 font-medium">Have something in mind?</p>
              <p className="text-sm text-fg-2">
                Product builds, AI work, speaking and hosting. I reply within a day.
              </p>
              <a
                href={`mailto:${CONTACT.email}`}
                className="w-fit text-fg underline decoration-accent underline-offset-4"
              >
                {CONTACT.email}
              </a>
              <SocialLinks size="sm" className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-10">
              {COLUMNS.map((col) => (
                <div key={col.title} className="flex flex-col gap-3">
                  <span className="label text-fg-3">{col.title}</span>
                  {col.links
                    .filter((l) => !(hidePubs && l.to === "/publications"))
                    .map((l) =>
                      l.to ? (
                        <Link key={l.label} to={l.to} className="text-sm text-fg hover:text-accent">
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          key={l.label}
                          href={l.href}
                          download={l.download}
                          className="text-sm text-fg hover:text-accent"
                        >
                          {l.label}
                        </a>
                      ),
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sized off the container's width (text is ~5.5em wide) but capped, so it fits without dominating. */}
        <div className="mx-auto mt-14 w-full max-w-[1040px] [container-type:inline-size] md:mt-16">
          <p
            aria-hidden
            className="select-none whitespace-nowrap text-center text-[min(calc(100cqi/5.6),10rem)] font-medium leading-[0.8] tracking-[-0.06em] text-fg/[0.06]"
          >
            Saad Mazhar
          </p>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[1040px] flex-col items-center gap-1.5 border-t border-line pt-6 text-center font-mono text-meta text-fg-3 sm:flex-row sm:justify-center sm:gap-3">
          <span>© {new Date().getFullYear()} Saad Mazhar</span>
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <span>{CONTACT.location}</span>
        </div>
      </div>
    </footer>
  );
}
