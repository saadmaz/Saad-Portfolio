import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";
import { BlogMetadata } from "../types/blog";
import { formatDate } from "../utils/blogUtils";
import "./BlogCard.css";

interface BlogCardProps {
  slug: string;
  metadata: BlogMetadata;
}

export const BlogCard: React.FC<BlogCardProps> = ({ slug, metadata }) => {
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
          <div className="card-tags-row">
            {metadata.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="card-mini-tag">{tag}</span>
            ))}
          </div>
          <div className="card-read-more">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
};