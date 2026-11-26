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

export function Footer({ hideSubscribe = false }: { hideSubscribe?: boolean }) {
  const { data: pubs } = usePublications();
  const { data: patents } = usePatents();
  // Hide the link while there's nothing to show (unknown while loading → keep it).
  const hidePubs = pubs !== undefined && patents !== undefined && !pubs.length && !patents.length;
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="wrap pb-6 pt-10 md:pt-14">
        <div className="w-full">
          {!hideSubscribe && (
            <div className="grid items-center gap-4 rounded-2xl border border-line bg-surface/40 p-4 md:grid-cols-[minmax(0,1fr)_380px] md:gap-8 md:p-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-h4 font-medium">Notes from the build</p>
                <p className="text-sm text-fg-2">
                  Shipping products, applied AI and startups. A couple of issues a month, at most.
                </p>
              </div>
              <SubscribeForm compact source="footer" />
            </div>
          )}

          <div
            className={`grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12 ${hideSubscribe ? "" : "mt-8 md:mt-10"}`}
          >
            <div className="flex max-w-[300px] flex-col gap-2.5">
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
              <SocialLinks size="sm" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 sm:gap-x-8">
              {COLUMNS.map((col) => (
                <div key={col.title} className="flex flex-col gap-2.5">
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

        {/* Sized off the container's width (text is ~5.5em wide) so it spans the footer. */}
        <div className="mt-10 w-full [container-type:inline-size]">
          <p
            aria-hidden
            className="select-none whitespace-nowrap text-center text-[calc(100cqi/5.6)] font-medium leading-[0.8] tracking-[-0.06em] text-fg/[0.06]"
          >
            Saad Mazhar
          </p>
        </div>

        <div className="mt-6 flex w-full items-center justify-center gap-2 whitespace-nowrap border-t border-line pt-6 font-mono text-meta text-fg-3 sm:gap-3">
          <span>© {new Date().getFullYear()} Saad Mazhar</span>
          <span aria-hidden>·</span>
          <span>{CONTACT.location}</span>
        </div>
      </div>
    </footer>
  );
}
