/**
 * YouTube links in articles: id extraction and thumbnail URLs. Pure, so the
 * article renderer can turn any YouTube link into a video card.
 */

const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = /^(?:www\.|m\.|music\.)?(?:youtube\.com|youtube-nocookie\.com)$/i;

/** The video id in a YouTube URL (watch, youtu.be, shorts, embed, live), or null. */
export function youTubeId(href: string | null | undefined): string | null {
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  let id: string | null = null;
  if (/^(?:www\.)?youtu\.be$/i.test(url.hostname)) id = url.pathname.split("/")[1] ?? null;
  else if (HOSTS.test(url.hostname)) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const m = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
      id = m?.[1] ?? null;
    }
  }
  return id && ID.test(id) ? id : null;
}

/** Thumbnail images, best first: 1280×720 (most videos), then 480×360 (always exists). */
export const youTubeThumbnails = (id: string) => [
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
];

export const youTubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Privacy-enhanced player, started by the reader's click. */
export const youTubePlayerUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

/** Link text that is just the URL itself isn't a useful title. */
export const isBareUrl = (text: string) => /^\s*(?:https?:\/\/|www\.)\S+\s*$/i.test(text);
