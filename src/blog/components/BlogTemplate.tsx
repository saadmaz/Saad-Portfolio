import { BlogMetadata } from "../types/blog";
import { ArrowLeft, Calendar, User, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import "./BlogTemplate.css"; // We'll create this

interface BlogTemplateProps {
  metadata: BlogMetadata;
  content: React.ReactNode;
}

export const BlogTemplate: React.FC<BlogTemplateProps> = ({
  metadata,
  content,
}) => {
  return (
    <article className="blog-template">
      {/* Header */}
      <header className="blog-header">
        <Link to="/blogs" className="back-button">
          <ArrowLeft size={20} />
          Back to Blogs
        </Link>

        <div className="blog-cover">
          <img
            src={metadata.coverImage}
            alt={metadata.title}
            className="cover-image"
          />
        </div>

        <div className="blog-meta-header">
          <h1 className="blog-title">{metadata.title}</h1>

          <div className="blog-info">
            <div className="info-item">
              <User size={16} />
              <span>{metadata.author}</span>
            </div>

            <div className="info-item">
              <Calendar size={16} />
              <span>
                Published: {new Date(metadata.publishedDate).toLocaleDateString()}
              </span>
            </div>

            {metadata.updatedDate && (
              <div className="info-item">
                <Edit size={16} />
                <span>
                  Updated: {new Date(metadata.updatedDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {metadata.tags && metadata.tags.length > 0 && (
            <div className="blog-tags">
              {metadata.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="blog-content">{content}</div>

      {/* Footer */}
      <footer className="blog-footer">
        <div className="author-info">
          <p>Written by {metadata.author}</p>
          {metadata.updatedDate && (
            <p>Last updated: {new Date(metadata.updatedDate).toLocaleDateString()}</p>
          )}
        </div>

        <Link to="/blogs" className="back-button-footer">
          ← Back to All Blogs
        </Link>
      </footer>
    </article>
  );
};