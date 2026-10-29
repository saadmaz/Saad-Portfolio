import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Menu, Minus, Plus, X } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui";
import { NAV_MENUS, SOCIALS, type NavMenu } from "@/lib/site";
import { cn } from "@/lib/utils";

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

function Dropdown({ menu, open, onClose }: { menu: NavMenu; open: boolean; onClose: () => void }) {
  return (
    <div
      className={cn(
        "absolute left-1/2 top-full z-50 pt-3 -translate-x-1/2 transition duration-200 ease-out",
        open ? "visible opacity-100" : "invisible -translate-y-1 opacity-0",
      )}
    >
      <ul
        className={cn(
          "grid gap-0.5 rounded-[20px] border border-line-2 bg-surface/95 p-2 shadow-[0_24px_64px_-12px_rgb(0_0_0/0.5)] backdrop-blur-xl",
          menu.items.length > 4 ? "w-[560px] grid-cols-2" : "w-[320px]",
        )}
      >
        {menu.items.map((item) => (
          <li key={item.title}>
            <Link
              to={item.href}
              onClick={onClose}
              className="group/item flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-fg">{item.title}</span>
                <span className="block text-sm text-fg-3">{item.description}</span>
              </span>
              <ArrowUpRight
                aria-hidden
                className="size-4 text-fg-3 opacity-0 transition-opacity group-hover/item:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DesktopNav({ current }: { current: string | null }) {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
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
            <Dropdown menu={menu} open={open === menu.label} onClose={() => setOpen(null)} />
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
      <nav aria-label="Mobile" className="px-5">
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
      <div className="mt-auto flex flex-col gap-5 px-5 pb-8 pt-10">
        <Button to="/contact" size="lg" className="w-full">
          Let’s talk
        </Button>
        <div className="flex justify-between font-mono text-meta text-fg-2">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </div>
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
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 lg:pt-4">
        <div
          className={cn(
            "flex w-full items-center justify-between transition-all duration-300 ease-out",
            scrolled && !mobileOpen
              ? "max-w-[920px] rounded-full border border-line-2 bg-surface/75 py-2 pl-3 pr-2 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.4)] backdrop-blur-xl"
              : "max-w-wrap py-3 lg:py-4",
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
