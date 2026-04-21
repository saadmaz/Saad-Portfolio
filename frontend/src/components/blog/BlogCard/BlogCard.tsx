import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../../shared/utils/dateUtils";
import "./BlogCard.css";
import type { Blog } from "@/shared/lib/dataManager";

interface BlogCardProps {
  slug: string;
  metadata: Blog;
}

export const BlogCard: React.FC<BlogCardProps> = ({ slug, metadata }) => {
  const navigate = useNavigate();
  const primaryTag = metadata.tags?.[0];

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <Link to={`/blog/${slug}`} className="blog-list-card">
      {/* Thumbnail */}
      <div className="blc-thumb">
        {metadata.coverImage ? (
          <img
            src={metadata.coverImage}
            alt={metadata.title}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none";
            }}
          />
        ) : (
          <div className="blc-thumb-placeholder" />
        )}
      </div>

      {/* Content */}
      <div className="blc-content">
        <div className="blc-meta">
          <span className="blc-date">{formatDate(metadata.date)}</span>
          {primaryTag && (
            <>
              <span className="blc-dot" />
              <span
                className="blc-category"
                onClick={(e) => handleTagClick(e, primaryTag)}
              >
                {primaryTag}
              </span>
            </>
          )}
        </div>

        <h3 className="blc-title">{metadata.title}</h3>
        <p className="blc-excerpt">{metadata.excerpt}</p>

        <span className="blc-read-more">Read More →</span>
      </div>
    </Link>
  );
};
