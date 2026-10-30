import { Link } from "react-router-dom";
import { CONTACT, SOCIALS } from "@/lib/site";
import myResume from "@/assets/Resume/Saad_Mazhar_Resume.pdf";

const COLUMNS = [
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
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-4 sm:gap-6">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3.5 sm:w-40">
                <span className="label text-fg-3">{col.title}</span>
                {col.links.map((l) => (
                  <Link key={l.label} to={l.to} className="text-sm text-fg hover:text-accent">
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="flex flex-col gap-3.5 sm:w-40">
              <span className="label text-fg-3">Elsewhere</span>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-fg hover:text-accent"
                >
                  {s.label}
                </a>
              ))}
              <a
                href={myResume}
                download="Saad_Mazhar_Resume.pdf"
                className="text-sm text-fg hover:text-accent"
              >
                Résumé
              </a>
            </div>
          </div>
        </div>

        <p
          aria-hidden
          className="mt-16 select-none whitespace-nowrap text-[clamp(3.6rem,15.6vw,13.5rem)] font-medium leading-[0.8] tracking-[-0.06em] text-fg/[0.06] md:mt-24"
        >
          Saad Mazhar
        </p>

        <div className="mt-10 flex flex-col gap-2.5 border-t border-line pt-6 font-mono text-meta text-fg-3 sm:grid sm:grid-cols-3">
          <span>© {new Date().getFullYear()} Saad Mazhar</span>
          <span className="sm:text-center">{CONTACT.location}</span>
          <a href="#top" className="hover:text-fg sm:text-right">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
