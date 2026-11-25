/**
 * Trusted embed providers. The CMS stores an embed as provider + id; the
 * iframe URL is built here from a fixed template, and ids must match a
 * strict pattern, so stored content can never point a frame anywhere else.
 * Keep in sync with frame-src in src/lib/security-headers.js and the CMS's embed parser.
 */

export interface EmbedProvider {
  label: string;
  idPattern: RegExp;
  src: (id: string) => string;
  /** Canonical page URL, used for the no-JS link fallback. */
  page: (id: string) => string;
}

export const EMBED_PROVIDERS: Record<string, EmbedProvider> = {
  youtube: {
    label: "YouTube",
    idPattern: /^[A-Za-z0-9_-]{11}$/,
    src: (id) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    page: (id) => `https://www.youtube.com/watch?v=${id}`,
  },
  vimeo: {
    label: "Vimeo",
    idPattern: /^\d{6,12}$/,
    src: (id) => `https://player.vimeo.com/video/${id}?dnt=1`,
    page: (id) => `https://vimeo.com/${id}`,
  },
  loom: {
    label: "Loom",
    idPattern: /^[a-f0-9]{32}$/,
    src: (id) => `https://www.loom.com/embed/${id}`,
    page: (id) => `https://www.loom.com/share/${id}`,
  },
  codepen: {
    label: "CodePen",
    // user/pen-id
    idPattern: /^[A-Za-z0-9_-]{1,40}\/[A-Za-z0-9]{5,12}$/,
    src: (id) => {
      const [user, pen] = id.split("/");
      return `https://codepen.io/${user}/embed/${pen}?default-tab=result`;
    },
    page: (id) => {
      const [user, pen] = id.split("/");
      return `https://codepen.io/${user}/pen/${pen}`;
    },
  },
};

/** The iframe src for a stored embed, or null if the provider/id isn't trusted. */
export function embedSrc(provider: string | undefined, id: string | undefined): string | null {
  const p = provider ? EMBED_PROVIDERS[provider] : undefined;
  if (!p || !id || !p.idPattern.test(id)) return null;
  return p.src(id);
}
