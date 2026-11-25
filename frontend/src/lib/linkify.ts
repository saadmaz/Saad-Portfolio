export type TextPart = string | { url: string; label: string };

// Trailing punctuation stays outside the link ("see tanksudda.com." → link + ".").
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"]*[^\s<>".,;:!?)\]'’]/gi;

/** Splits plain text into strings and links, so typed URLs become clickable. */
export function splitLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const m of text.matchAll(URL_RE)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    const label = m[0];
    parts.push({ url: label.startsWith("www.") ? `https://${label}` : label, label });
    last = at + label.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
