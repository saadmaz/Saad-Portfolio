import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { internalPath, isExternalHref } from "@/lib/siteLinks";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface Props {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Internal route. */
  to?: string;
  /** External URL, mailto: or tel:. */
  href?: string;
  download?: string | boolean;
  icon?: boolean;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: () => void;
  disabled?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-fg-inverse hover:bg-accent-hover",
  secondary: "border border-line-3 text-fg hover:bg-surface-2",
  ghost: "text-fg hover:text-accent px-0",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-[18px] text-sm gap-2",
  lg: "h-[52px] px-6 text-[15px] gap-2.5",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  download,
  icon = true,
  className,
  type = "button",
  onClick,
  disabled,
}: Props) {
  const cls = cn(
    "group inline-flex shrink-0 items-center justify-center rounded-full font-medium tracking-[-0.01em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
    sizes[size],
    variants[variant],
    variant === "ghost" && "px-0",
    className,
  );
  const content = (
    <>
      {children}
      {icon && (
        <ArrowUpRight
          aria-hidden
          className={cn(
            "transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
            size === "lg" ? "size-[18px]" : "size-4",
          )}
        />
      )}
    </>
  );

  const route = to ?? (href && !download ? internalPath(href) : null);
  if (route)
    return (
      <Link to={route} className={cls}>
        {content}
      </Link>
    );
  if (href) {
    const external = isExternalHref(href);
    return (
      <a
        href={href}
        className={cls}
        download={download}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
