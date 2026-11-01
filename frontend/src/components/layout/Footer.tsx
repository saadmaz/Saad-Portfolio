import { Link } from "react-router-dom";
import { CONTACT } from "@/lib/site";
import { SocialLinks } from "@/components/brand/SocialLinks";
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf";

type FooterLink = { label: string; to?: string; href?: string; download?: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "About",
    links: [
      { label: "Education", to: "/education" },
      { label: "Events & Hosting", to: "/events" },
      { label: "Languages", to: "/languages" },
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
      { label: "Résumé", href: myResume, download: "Saad_Mazhar_Resume.pdf" },
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

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="wrap pb-8 pt-16 md:pt-24">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="flex max-w-[384px] flex-col gap-4">
            <p className="text-h4 font-medium">Have something in mind?</p>
            <p className="text-sm text-fg-2">
              Product builds, AI work, speaking and hosting. I reply within a day.
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-fg underline decoration-accent underline-offset-4"
            >
              {CONTACT.email}
            </a>
            <SocialLinks size="sm" className="mt-2" />
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-6">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3.5 sm:w-40">
                <span className="label text-fg-3">{col.title}</span>
                {col.links.map((l) =>
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

        {/* Sized off the container's width (text is ~5.5em wide), so it always fits and centres. */}
        <div className="mt-16 [container-type:inline-size] md:mt-24">
          <p
            aria-hidden
            className="select-none whitespace-nowrap text-center text-[calc(100cqi/5.6)] font-medium leading-[0.8] tracking-[-0.06em] text-fg/[0.06]"
          >
            Saad Mazhar
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-1.5 border-t border-line pt-6 text-center font-mono text-meta text-fg-3 sm:flex-row sm:justify-center sm:gap-3">
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
