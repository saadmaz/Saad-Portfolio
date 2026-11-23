import { SOCIALS, type SocialId } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BRAND_PATHS, type BrandId } from "@/lib/brand-icons";

/** A filled brand mark (social profiles and share targets). */
export function SocialIcon({ id, className }: { id: SocialId | BrandId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={cn("size-[18px]", className)}>
      <path fillRule="evenodd" d={BRAND_PATHS[id]} />
    </svg>
  );
}

/** Round icon links to every social profile. */
export function SocialLinks({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2.5", className)} aria-label="Social profiles">
      {SOCIALS.map((s) => (
        <li key={s.id}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label} (opens in a new tab)`}
            title={s.label}
            className={cn(
              "flex items-center justify-center rounded-full border border-line-2 text-fg-2 transition-[color,background-color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-3 hover:bg-surface-2 hover:text-fg active:translate-y-0",
              size === "sm" ? "size-10" : "size-11",
            )}
          >
            <SocialIcon id={s.id} className={size === "sm" ? "size-4" : undefined} />
          </a>
        </li>
      ))}
    </ul>
  );
}
