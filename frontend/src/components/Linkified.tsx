import { splitLinks } from "@/lib/linkify";

/** Plain CMS text with any typed URLs turned into links. */
export function Linkified({ text }: { text: string }) {
  return (
    <>
      {splitLinks(text).map((p, i) =>
        typeof p === "string" ? (
          p
        ) : (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
          >
            {p.label}
          </a>
        ),
      )}
    </>
  );
}
