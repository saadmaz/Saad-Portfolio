import type { ReactNode } from "react";
import { Media, RisingWords } from "@/components/ui";
import { coverOf } from "@/lib/article-core";
import type { BlogPost, ImageAsset } from "@/types";

type Cover = ImageAsset & { caption?: string; credit?: string; creditUrl?: string };

/**
 * Article opening. Covers are often designed images with their own text, so
 * the title never sits on top of one: it gets a calm backdrop tinted by a
 * heavily blurred copy of the cover, and the cover itself is shown whole,
 * uncropped, in a frame underneath.
 */
export function ArticleHero({
  post,
  eyebrow,
  breadcrumbs,
  byline,
  notice,
}: {
  post: BlogPost;
  eyebrow?: string;
  breadcrumbs: ReactNode;
  byline: ReactNode;
  notice?: ReactNode;
}) {
  const cover = coverOf(post) as Cover | null;

  return (
    <section className="relative -mt-[72px] overflow-hidden lg:-mt-[88px]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {cover?.url ? (
          <img
            src={cover.url}
            alt=""
            className="absolute inset-0 size-full scale-125 object-cover opacity-25 blur-3xl saturate-150"
          />
        ) : (
          <div className="absolute -right-[10%] -top-[20%] size-[70vmax] animate-drift rounded-full bg-[radial-gradient(circle,rgb(255_95_0/0.22),transparent_62%)] blur-2xl" />
        )}
        <div className="absolute inset-0 [background-image:linear-gradient(rgb(var(--ink)/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--ink)/0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_30%,black,transparent_80%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-base/40 via-base/70 to-base" />
        <div className="grain absolute inset-0 opacity-[0.05] mix-blend-overlay" />
      </div>

      <div className="wrap relative flex flex-col items-center pb-12 pt-32 text-center md:pb-16 md:pt-44">
        <div className="flex max-w-[860px] flex-col items-center gap-5 md:gap-6">
          <div className="animate-rise">{breadcrumbs}</div>
          {notice}
          {eyebrow && (
            <span className="label inline-flex h-7 animate-rise items-center gap-2 rounded-full border border-line-2 bg-surface/60 px-3 text-fg-2 backdrop-blur-md [animation-delay:80ms]">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {eyebrow}
            </span>
          )}
          <h1 className="text-balance text-[clamp(2.125rem,5.2vw,4rem)] font-medium leading-[1.05] tracking-[-0.035em]">
            <RisingWords text={post.title} />
          </h1>
          {(post.subtitle || post.excerpt) && (
            <p className="max-w-[680px] animate-rise text-pretty text-body-l text-fg-2 [animation-delay:400ms]">
              {post.subtitle || post.excerpt}
            </p>
          )}
          <div className="mt-2 animate-rise [animation-delay:520ms]">{byline}</div>
        </div>
      </div>

      {cover?.url && (
        <figure className="wrap relative animate-rise pb-4 [animation-delay:600ms]">
          <div className="mx-auto max-w-[1040px]">
            <Media
              asset={cover}
              alt={cover.alt || post.title}
              natural
              priority
              sizes="(min-width: 1100px) 1040px, 100vw"
              className="rounded-[20px] shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)] md:rounded-[28px]"
            />
            {(cover.caption || cover.credit) && (
              <figcaption className="mt-4 text-center text-sm text-fg-3">
                {cover.caption}
                {cover.caption && cover.credit && " · "}
                {cover.credit &&
                  (cover.creditUrl ? (
                    <a
                      href={cover.creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-fg"
                    >
                      {cover.credit}
                    </a>
                  ) : (
                    cover.credit
                  ))}
              </figcaption>
            )}
          </div>
        </figure>
      )}
    </section>
  );
}
