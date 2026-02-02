import { Link, useNavigate } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";
import { BlogMetadata } from "../types/blog";
import { formatDate } from "../utils/blogUtils";
import "./BlogCard.css";
import { useState } from "react";

interface BlogCardProps {
  slug: string;
  metadata: BlogMetadata;
}

const MAX_VISIBLE_TAGS = 3;

export const BlogCard: React.FC<BlogCardProps> = ({ slug, metadata }) => {
  const navigate = useNavigate();
  const [showAllTags, setShowAllTags] = useState(false);
  const tags = metadata.tags || [];
  const visibleTags = showAllTags ? tags : tags.slice(0, MAX_VISIBLE_TAGS);
  const hasMoreTags = tags.length > MAX_VISIBLE_TAGS;

  const handleTagClick = (e: React.MouseEvent<HTMLSpanElement>, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  const handleMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAllTags(!showAllTags);
  };

  return (
    <Link to={`/blog/${slug}`} className="blog-card-wrapper">
      {/* Aspect ratio container prevents layout shift during image load */}
      <div className="card-image-aspect">
        <img 
          src={metadata.coverImage} 
          alt={metadata.title} 
          loading="lazy" 
        />
      </div>

      <div className="card-body">
        <div className="card-meta-top">
          <span className="card-meta-item">
            <Calendar size={12} />
            {formatDate(metadata.publishedDate)}
          </span>
          <span className="card-meta-item">
            <User size={12} />
            {metadata.author}
          </span>
        </div>

        <h3 className="card-title">{metadata.title}</h3>
        <p className="card-description">{metadata.excerpt}</p>

        <div className="card-footer-info">
          <div className="card-tags-container">
            <div className="card-tags-row">
              {visibleTags.map((tag) => (
                <span 
                  key={tag} 
                  className="card-mini-tag"
                  onClick={(e) => handleTagClick(e, tag)}
                >
                  {tag}
                </span>
              ))}
              {hasMoreTags && !showAllTags && (
                <button 
                  className="card-more-tags-btn"
                  onClick={handleMoreClick}
                  aria-label={`Show ${tags.length - MAX_VISIBLE_TAGS} more tags`}
                >
                  +{tags.length - MAX_VISIBLE_TAGS}
                </button>
              )}
              {showAllTags && hasMoreTags && (
                <button 
                  className="card-more-tags-btn"
                  onClick={handleMoreClick}
                  aria-label="Show fewer tags"
                >
                  −less
                </button>
              )}
            </div>
          </div>
          <div className="card-read-more">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
};