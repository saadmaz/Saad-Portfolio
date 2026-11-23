import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { youTubePlayerUrl, youTubeThumbnails, youTubeWatchUrl } from "@/lib/youtube";

/**
 * A YouTube video found in an article: its thumbnail and title, played in
 * place on click. Nothing loads from YouTube except the thumbnail until the
 * reader asks for the video (privacy-enhanced player).
 */
export function VideoCard({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(0);
  const sources = youTubeThumbnails(id);
  const label = title || "YouTube video";

  return (
    <figure className="video-card">
      <div className="video-frame">
        {playing ? (
          <iframe
            src={youTubePlayerUrl(id)}
            title={label}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${label}`}>
            <img
              src={sources[thumb]}
              alt=""
              loading="lazy"
              decoding="async"
              // YouTube serves a 120×90 placeholder (not an error) when the HD thumbnail doesn't exist.
              onLoad={(e) => {
                if (thumb === 0 && e.currentTarget.naturalWidth <= 120) setThumb(1);
              }}
              onError={() => thumb === 0 && setThumb(1)}
            />
            <span className="video-play" aria-hidden>
              <Play className="size-6 translate-x-0.5" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <span className="video-title">{label}</span>
        <a href={youTubeWatchUrl(id)} target="_blank" rel="noopener noreferrer" className="video-link">
          YouTube <ExternalLink aria-hidden className="size-3" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </figcaption>
    </figure>
  );
}
