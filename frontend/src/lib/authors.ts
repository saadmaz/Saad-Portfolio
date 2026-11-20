import type { Author } from "@/types";

const AUTHOR_LINKS: { key: keyof Author; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X" },
  { key: "github", label: "GitHub" },
];

export function authorLinks(author: Author) {
  return [
    ...AUTHOR_LINKS.map(({ key, label }) => ({ label, url: author[key] as string | undefined })),
    ...(author.links ?? []),
  ].filter((l): l is { label: string; url: string } => !!l.url && /^https?:\/\//i.test(l.url));
}
