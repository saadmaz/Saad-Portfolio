import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { BlogMetadata } from "../types/blog";
import { formatDate } from "../utils/blogUtils";
import "./BlogCard.css";

interface BlogCardProps {
  slug: string;
  metadata: BlogMetadata;
}

export const BlogCard: React.FC<BlogCardProps> = ({ slug, metadata }) => {
  return (
    <Link to={`/blog/${slug}`} className="blog-card">
      <div className="blog-card-image">
        <img src={metadata.coverImage} alt={metadata.title} />
      </div>

      <div className="blog-card-content">
        <h3 className="blog-card-title">{metadata.title}</h3>

        <p className="blog-card-excerpt">{metadata.excerpt}</p>

        <div className="blog-card-meta">
          <span className="meta-item">
            <User size={14} />
            {metadata.author}
          </span>
          <span className="meta-item">
            <Calendar size={14} />
            {formatDate(metadata.publishedDate)}
          </span>
        </div>

        {metadata.tags && metadata.tags.length > 0 && (
          <div className="blog-card-tags">
            {metadata.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="card-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};