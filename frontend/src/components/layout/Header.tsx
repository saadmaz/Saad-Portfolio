import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  Briefcase,
  ChevronDown,
  Code,
  Globe,
  GraduationCap,
  Heart,
  Layers,
  Mail,
  Menu,
  Mic,
  Minus,
  PenLine,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui";
import { NAV_MENUS, type NavMenu } from "@/lib/site";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { cn } from "@/lib/utils";
import { useFeaturedProjects } from "@/hooks/useProjects";
import { useLatestBlogPost } from "@/hooks/useBlog";
import { useCertificates } from "@/hooks/useContent";
import portrait from "@/assets/profile-photo.webp";
import windowEmber from "@/assets/cover/window-ember.svg";
import windowGraphite from "@/assets/cover/window-graphite.svg";

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/** Which top-level menu owns the current route, for the active state. */
function activeMenu(pathname: string): string | null {
  const menu = NAV_MENUS.find((m) =>
    m.items.some((i) => pathname.startsWith(i.href.split("#")[0]) && i.href !== "/"),
  );
  if (menu) return menu.label;
  if (pathname.startsWith("/about")) return "About";
  return null;
}

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-[15px] font-medium" aria-label="Saad Mazhar, home">
      <LogoMark />
      Saad Mazhar
    </Link>
  );
}

// Icon per link, as in the Figma Nav/Dropdown (Lucide set).
const ITEM_ICONS: Record<string, LucideIcon> = {
  Education: GraduationCap,
  "Events & Hosting": Mic,
  Volunteer: Heart,
  Languages: Globe,
  Awards: Award,
  "Work Experience": Briefcase,
  "Featured Projects": Layers,
  "Tech Stack & Skills": Code,
  "Licenses & Certificates": BadgeCheck,
  "Blog / Thoughts": PenLine,
  Newsletters: Mail,
};

const COVER = {
  ember: { glow: "255 107 61", base: "153 36 15", art: windowEmber },
  graphite: { glow: "229 229 219", base: "89 89 97", art: windowGraphite },
};

/** Media/Cover art scaled into the 200x120 feature slot: colour field + floating product window. */
function CoverArt({ theme }: { theme: keyof typeof COVER }) {
  const { glow, base, art } = COVER[theme];
  return (
    <div className="absolute inset-0 overflow-hidden bg-surface">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 80% at 90% 0%, rgb(${glow} / 0.7), rgb(${glow} / 0.245) 55%, transparent), radial-gradient(65% 75% at 8% 100%, rgb(${base} / 0.85), rgb(${base} / 0.3) 55%, transparent)`,
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-base/0 to-base/55" />
      <div className="absolute inset-[20.83%_15%_6.94%_15%]">
        <div className="absolute inset-[-5.77%_-8.33%_-21.15%_-8.33%]">
          <img src={art} alt="" className="block size-full max-w-none" />
        </div>
      </div>
    </div>
  );
}

interface FeatureContent {
  media: ReactNode;
  label: string;
  text: string;
  cta: string;
  to: string;
}

function useFeature(menu: string): FeatureContent | null {
  const { data: featured = [] } = useFeaturedProjects();
  const { data: latestPost } = useLatestBlogPost();
  const { data: certs = [] } = useCertificates();

  if (menu === "About")
    return {
      media: (
        <img
          src={portrait}
          alt=""
          className="absolute -left-2.5 -top-5 size-[220px] max-w-none object-cover mix-blend-lighten"
        />
      ),
      label: "About Saad",
      text: "Founder by trade, engineer by habit, host by accident.",
      cta: "Read the story",
      to: "/about",
    };
  if (menu === "Work") {
    const p = [...featured].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999))[0];
    const img = p?.heroImage || p?.image;
    return {
      media: img ? (
        <img src={img} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <CoverArt theme="ember" />
      ),
      label: p ? `Latest · ${p.title}` : "Selected work",
      text: p?.tagline || "Products I\u2019ve founded, built and shipped.",
      cta: "View case study",
      to: p ? `/projects/${p.slug}` : "/projects",
    };
  }
  if (menu === "Skills") {
    const n = certs.length || 99;
    return {
      media: (
        <div className="absolute inset-0 bg-surface bg-[radial-gradient(50%_43%_at_60%_79%,rgb(255_107_61/0.35),transparent)]">
          <span className="absolute left-4 top-6 text-[64px] font-medium leading-none tracking-[-0.035em] text-fg">
            {n}
          </span>
        </div>
      ),
      label: `${n} certifications`,
      text: "Across AI, security, cloud and leadership.",
      cta: "See all skills",
      to: "/skills",
    };
  }
  if (menu === "Insights")
    return {
      media: latestPost?.image ? (
        <img src={latestPost.image} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <CoverArt theme="graphite" />
      ),
      label: "Latest article",
      text: latestPost?.title || "Notes from building products and companies.",
      cta: "Read article",
      to: latestPost ? `/blog/${latestPost.slug}` : "/blog",
    };
  return null;
}

/** Left panel of the mega-menu, promoting the latest item in the section. */
function FeaturePanel({ menu, onClose }: { menu: string; onClose: () => void }) {
  const feature = useFeature(menu);
  if (!feature) return null;
  return (
    <div className="flex w-[232px] shrink-0 flex-col gap-3 self-stretch overflow-hidden rounded-[14px] border border-line bg-base p-4">
      <div className="relative h-[120px] w-[200px] shrink-0 overflow-hidden rounded-[10px] bg-surface">
        {feature.media}
      </div>
      <p className="label line-clamp-1 text-accent">{feature.label}</p>
      <p className="line-clamp-3 text-sm leading-[1.5] tracking-[-0.002em] text-fg-2">{feature.text}</p>
      <Link
        to={feature.to}
        onClick={onClose}
        className="group/cta flex w-fit items-center gap-1.5 text-sm leading-[1.5] tracking-[-0.002em] text-fg transition-colors hover:text-accent"
      >
        {feature.cta}
        <ArrowUpRight
          aria-hidden
          className="size-3.5 transition-transform duration-200 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
        />
      </Link>
    </div>
  );
}

function Dropdown({
  menu,
  open,
  mounted,
  onClose,
}: {
  menu: NavMenu;
  open: boolean;
  mounted: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const grid = menu.items.length > 4;

  // Left-aligned to the trigger (Figma), nudged left only if it would run off-screen.
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const overflow = rect.right - shift - (window.innerWidth - 16);
    setShift(overflow > 0 ? -overflow : 0);
    // shift is read, not tracked: recompute only when the menu opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      ref={ref}
      style={{ transform: `translateX(${shift}px)` }}
      className={cn(
        "absolute left-0 top-full z-50 pt-3 transition-[opacity,visibility] duration-200 ease-out",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div
        className={cn(
          "flex items-start gap-2 rounded-[20px] border border-line-2 bg-[rgb(33_33_36/0.96)] p-2 shadow-[0_24px_32px_rgb(0_0_0/0.5)] backdrop-blur-[12px] transition-transform duration-200 ease-out",
          open ? "translate-y-0" : "-translate-y-1",
        )}
      >
        {mounted && <FeaturePanel menu={menu.label} onClose={onClose} />}
        <div className={cn("py-1", grid ? "w-[548px]" : "w-[300px]")}>
          <ul className={grid ? "flex flex-wrap gap-x-1 gap-y-0.5" : "flex flex-col gap-0.5"}>
            {menu.items.map((item) => {
              const Icon = ITEM_ICONS[item.title] ?? ArrowUpRight;
              return (
                <li key={item.title} className={grid ? "w-[272px]" : "w-full"}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="group/item relative flex items-center gap-3.5 rounded-xl p-3 outline-none transition-colors duration-200 hover:bg-surface-2 focus-visible:bg-surface-2"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-line bg-surface-2 text-fg-2 transition-colors duration-200 group-hover/item:bg-accent/[0.12] group-hover/item:text-accent group-focus-visible/item:bg-accent/[0.12] group-focus-visible/item:text-accent">
                      <Icon aria-hidden className="size-[18px]" strokeWidth={1.75} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                      <span className="truncate text-[15px] font-medium leading-none tracking-[-0.003em] text-fg">
                        {item.title}
                      </span>
                      <span className="truncate text-sm leading-[1.5] tracking-[-0.002em] text-fg-3">
                        {item.description}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-2 opacity-0 transition-opacity duration-200 group-hover/item:opacity-100 group-focus-visible/item:opacity-100"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
          {menu.note && (
            <p className="mt-0.5 border-t border-line px-3 pb-1 pt-3 font-mono text-meta text-fg-3">
              {menu.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopNav({ current }: { current: string | null }) {
  const [open, setOpen] = useState<string | null>(null);
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);

  // Feature panels fetch their data on first open only.
  useEffect(() => {
    if (open && !opened.has(open)) setOpened((prev) => new Set(prev).add(open));
  }, [open, opened]);
  const closeTimer = useRef<number>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const enter = (label: string) => {
    window.clearTimeout(closeTimer.current);
    setOpen(label);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setOpen(null), 150);
  };

  return (
    <nav ref={navRef} aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-8">
        {NAV_MENUS.map((menu) => (
          <li
            key={menu.label}
            className="relative"
            onMouseEnter={() => enter(menu.label)}
            onMouseLeave={leave}
          >
            <button
              type="button"
              aria-expanded={open === menu.label}
              onClick={() => setOpen(open === menu.label ? null : menu.label)}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-fg",
                current === menu.label || open === menu.label ? "text-fg" : "text-fg-2",
              )}
            >
              {menu.label}
              <ChevronDown
                aria-hidden
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  open === menu.label ? "rotate-180 text-accent" : "text-fg-3",
                )}
              />
            </button>
            <Dropdown
              menu={menu}
              open={open === menu.label}
              mounted={opened.has(menu.label)}
              onClose={() => setOpen(null)}
            />
          </li>
        ))}
        <li>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              cn("text-sm font-medium transition-colors hover:text-fg", isActive ? "text-fg" : "text-fg-2")
            }
          >
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(NAV_MENUS[0].label);
  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-base pt-[72px] lg:hidden">
      <nav aria-label="Mobile" className="gutter">
        {NAV_MENUS.map((menu, i) => {
          const isOpen = expanded === menu.label;
          return (
            <div key={menu.label} className="border-t border-line-2">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : menu.label)}
                className="flex w-full items-center justify-between py-[18px]"
              >
                <span className="flex items-center gap-3.5">
                  <span className={cn("label", isOpen ? "text-accent" : "text-fg-3")}>0{i + 1}</span>
                  <span className="text-h2 font-medium">{menu.label}</span>
                </span>
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border border-line-2",
                    isOpen && "bg-surface-2",
                  )}
                >
                  {isOpen ? <Minus className="size-4 text-accent" /> : <Plus className="size-4 text-fg-2" />}
                </span>
              </button>
              {isOpen && (
                <ul className="pb-4">
                  {menu.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className="block rounded-xl px-3 py-2.5 text-fg-2 hover:bg-surface hover:text-fg"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        <Link
          to="/contact"
          onClick={onClose}
          className="flex items-center justify-between border-y border-line-2 py-[18px]"
        >
          <span className="flex items-center gap-3.5">
            <span className="label text-fg-3">05</span>
            <span className="text-h2 font-medium">Contact</span>
          </span>
          <span className="flex size-9 items-center justify-center rounded-full border border-line-2">
            <ArrowUpRight className="size-4 text-fg-2" />
          </span>
        </Link>
      </nav>
      <div className="gutter mt-auto flex flex-col gap-5 pb-8 pt-10">
        <Button to="/contact" size="lg" className="w-full">
          Let’s talk
        </Button>
        <SocialLinks className="justify-center gap-3" />
      </div>
    </div>
  );
}

export function Header() {
  const scrolled = useScrolled();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="gutter fixed inset-x-0 top-0 z-50 flex justify-center pt-3 lg:pt-4">
        {/*
          Shape and inner padding stay the same in both states; only width, spacing and
          the surface fade. At the top the pill is invisible and pulled out by its own
          padding plus border (-ml-[13px]/-mr-[9px]) so the logo and button sit on the page gutter.
        */}
        <div
          className={cn(
            "flex items-center justify-between rounded-full border pl-3 pr-2 transition-[width,max-width,margin,padding,background-color,border-color,box-shadow] duration-300 ease-out",
            scrolled && !mobileOpen
              ? "mx-0 w-full max-w-[920px] border-line-2 bg-surface/75 py-2 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.4)] backdrop-blur-xl"
              : "-ml-[13px] -mr-[9px] w-[calc(100%+22px)] max-w-[calc(theme(maxWidth.wrap)+22px)] border-transparent bg-transparent py-3 shadow-none lg:py-4",
          )}
        >
          <Wordmark />
          <DesktopNav current={activeMenu(pathname)} />
          <div className="hidden lg:block">
            <Button to="/contact">Let’s talk</Button>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="relative z-50 flex size-11 items-center justify-center rounded-full border border-line-2 lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </>
  );
}
