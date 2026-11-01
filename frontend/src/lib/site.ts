// Contact details and navigation, defined once for the header, footer and pages.

export const CONTACT = {
  email: "saadmazaa@gmail.com",
  phone: "+94 72 013 5801",
  phoneHref: "tel:+94720135801",
  location: "Colombo, Sri Lanka",
  bookingUrl: "https://calendly.com/saadmaz/30min",
};

export type SocialId = "linkedin" | "github" | "instagram" | "facebook" | "x";

export const SOCIALS: { id: SocialId; label: string; href: string }[] = [
  { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/in/saadmaz/" },
  { id: "github", label: "GitHub", href: "https://github.com/saadmaz/" },
  { id: "instagram", label: "Instagram", href: "https://instagram.com/saaadmaz/" },
  { id: "facebook", label: "Facebook", href: "https://facebook.com/saadmazhar03" },
  { id: "x", label: "X", href: "https://x.com/SaadMazhar_" },
];

export interface NavItem {
  title: string;
  href: string;
  description: string;
}

export interface NavMenu {
  label: string;
  items: NavItem[];
  /** Mono footnote under the links (Figma Nav/Dropdown "Footer note"). */
  note?: string;
}

export const NAV_MENUS: NavMenu[] = [
  {
    label: "About",
    items: [
      { title: "Education", href: "/education", description: "Academic background" },
      { title: "Events & Hosting", href: "/events", description: "Speaking and hosting" },
      { title: "Volunteer", href: "/about#volunteer", description: "Community involvement" },
      { title: "Languages", href: "/languages", description: "Communication abilities" },
      { title: "Awards", href: "/about#awards", description: "Recognition and honors" },
    ],
  },
  {
    label: "Work",
    items: [
      { title: "Work Experience", href: "/experience", description: "Professional journey and roles" },
      { title: "Featured Projects", href: "/projects", description: "Highlighted work and ventures" },
    ],
    note: "20+ products shipped since 2021",
  },
  {
    label: "Skills",
    items: [
      { title: "Tech Stack & Skills", href: "/skills", description: "Technical competencies" },
      {
        title: "Licenses & Certificates",
        href: "/certifications",
        description: "Professional certifications",
      },
    ],
    note: "Updated monthly",
  },
  {
    label: "Insights",
    items: [
      { title: "Blog / Thoughts", href: "/blog", description: "Articles and perspectives" },
      { title: "Newsletters", href: "/newsletters", description: "Knowledge hub subscriptions" },
    ],
    note: "New article every month",
  },
];
