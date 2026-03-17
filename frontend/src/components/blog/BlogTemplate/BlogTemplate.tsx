import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import "./BlogTemplate.css";
import type { Blog } from "@/shared/lib/dataManager";

interface BlogTemplateProps {
  metadata: Blog;
  content: React.ReactNode;
}

export const BlogTemplate: React.FC<BlogTemplateProps> = ({ metadata, content }) => {
  return (
    <article className="blog-article-wrapper">
      {/* HEADER SECTION */}
      <header className="blog-header">
        <Link to="/blogs" className="back-button">
          <ArrowLeft size={18} />
          <span>Back to Articles</span>
        </Link>

        <div className="blog-cover-container">
          <img
            src={metadata.coverImage}
            alt={metadata.title}
            className="cover-image"
          />
        </div>

        <div className="blog-title-area">
          <h1 className="blog-title">{metadata.title}</h1>

          <div className="blog-meta-flex">
            <div className="meta-group">
              <div className="meta-item">
                <User size={14} />
                <span>{metadata.author}</span>
              </div>
              <div className="meta-item">
                <Calendar size={14} />
                <span>{new Date(metadata.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="meta-item">
              <Clock size={14} />
              <span>5 min read</span>
            </div>
          </div>

          {metadata.tags && (
            <div className="blog-tags-list">
              {metadata.tags.map((tag) => (
                <span key={tag} className="blog-tag-pill">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* CONTENT SECTION */}
      <div className="blog-body-content">
        {content}
      </div>

      {/* FOOTER SECTION */}
      <footer className="blog-footer-area">
        <div className="author-signature">
          <p className="author-name">Written by <strong>{metadata.author}</strong></p>
          {metadata.date && (
            <p className="update-date">Published on: {new Date(metadata.date).toLocaleDateString()}</p>
          )}
        </div>
        <Link to="/blogs" className="footer-back-link">
          ← See all thoughts & insights
        </Link>
      </footer>
    </article>
  );
};