import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { getBlogBySlug } from "@/blog/utils/blogUtils";
import { ArrowLeft, Calendar, User, Edit } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogModule {
  metadata: any;
  content: React.ReactNode;
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const loadBlog = async () => {
      try {
        const blogData = await getBlogBySlug(slug);
        if (!blogData) {
          setNotFound(true);
        } else {
          setBlog(blogData);
        }
      } catch (error) {
        console.error("Error loading blog:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [slug]);

  const handleTagClick = (tag: string) => {
    navigate(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="section-padding">
          <div className="section-container text-center text-muted-foreground">
            Loading blog...
          </div>
        </div>
      </Layout>
    );
  }

  if (notFound || !blog) {
    return <Navigate to="/blog" replace />;
  }

  const { metadata, content } = blog;

  return (
    <Layout>
      <article className="blog-detail-page">
        <div className="blog-detail-container">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="blog-back-button"
          >
            <Link to="/blog" className="back-link">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Cover Image */}
          {metadata.coverImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="blog-cover-wrapper"
            >
              <img
                src={metadata.coverImage}
                alt={metadata.title}
                className="blog-cover-image"
              />
            </motion.div>
          )}

          {/* Blog Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="blog-header-section"
          >
            <h1 className="blog-title">
              {metadata.title}
            </h1>

            {/* Metadata */}
            <div className="blog-metadata">
              <div className="metadata-item">
                <User className="metadata-icon" />
                <span>{metadata.author}</span>
              </div>
              <div className="metadata-item">
                <Calendar className="metadata-icon" />
                <span>Published: {new Date(metadata.publishedDate).toLocaleDateString()}</span>
              </div>
              {metadata.updatedDate && (
                <div className="metadata-item">
                  <Edit className="metadata-icon" />
                  <span>Updated: {new Date(metadata.updatedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="blog-tags">
                {metadata.tags.map((tag: string) => (
                  <button
                    key={tag}
                    className="blog-tag"
                    onClick={() => handleTagClick(tag)}
                    type="button"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </motion.header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="blog-content-wrapper"
          >
            <div className="blog-content">
              {content}
            </div>
          </motion.div>
        </div>
      </article>

      <style>{`
        /* Main Container */
        .blog-detail-page {
          width: 100%;
          background: var(--background);
          color: var(--foreground);
        }

        .blog-detail-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        @media (max-width: 768px) {
          .blog-detail-container {
            padding: 1.5rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .blog-detail-container {
            padding: 1rem 0.75rem;
          }
        }

        /* Back Button */
        .blog-back-button {
          margin-bottom: 2rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        .back-link:hover {
          color: var(--accent);
          opacity: 0.8;
          transform: translateX(-2px);
        }

        /* Cover Image */
        .blog-cover-wrapper {
          margin-bottom: 2.5rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .blog-cover-image {
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 768px) {
          .blog-cover-wrapper {
            margin-bottom: 2rem;
          }

          .blog-cover-image {
            aspect-ratio: 4 / 3;
          }
        }

        /* Header Section */
        .blog-header-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border);
        }

        .blog-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 1.5rem 0;
          color: var(--foreground);
          letter-spacing: -0.02em;
        }

        @media (max-width: 768px) {
          .blog-title {
            font-size: 2rem;
            margin-bottom: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .blog-title {
            font-size: 1.5rem;
            line-height: 1.3;
          }
        }

        /* Metadata */
        .blog-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          color: var(--muted-foreground);
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .metadata-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: var(--accent);
        }

        @media (max-width: 480px) {
          .blog-metadata {
            gap: 1rem;
            font-size: 0.9rem;
          }

          .metadata-item {
            gap: 0.375rem;
          }
        }

        /* Tags */
        .blog-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.5rem;
          align-items: center;
        }

        .blog-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: hsl(var(--accent) / 0.08);
          color: hsl(var(--accent));
          padding: 0.35rem 0.8rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border: 1px solid hsl(var(--accent) / 0.25);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-shadow: none;
          white-space: nowrap;
          line-height: 1;
          height: fit-content;
          text-decoration: none;
        }

        .blog-tag:hover {
          background: hsl(var(--accent) / 0.12);
          border-color: hsl(var(--accent) / 0.4);
          color: hsl(var(--accent));
          transform: translateY(-1px);
        }

        .blog-tag:focus {
          outline: 1.5px solid hsl(var(--accent));
          outline-offset: 1px;
        }

        /* Content Wrapper */
        .blog-content-wrapper {
          margin-bottom: 3rem;
        }

        /* Blog Content Styles */
        .blog-content {
          font-size: 1.1rem;
          line-height: 1.8;
          letter-spacing: 0.3px;
          color: var(--foreground);
        }

        /* Headings */
        .blog-content h1 {
          font-size: 2.2rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 2rem 0 1rem;
          color: var(--foreground);
          letter-spacing: -0.01em;
        }

        .blog-content h2 {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 2.5rem 0 1rem;
          color: var(--foreground);
          letter-spacing: -0.01em;
        }

        .blog-content h3 {
          font-size: 1.4rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1.75rem 0 0.75rem;
          color: var(--foreground);
          letter-spacing: -0.005em;
        }

        .blog-content h4 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem;
          color: var(--foreground);
        }

        @media (max-width: 768px) {
          .blog-content {
            font-size: 1rem;
            line-height: 1.75;
          }

          .blog-content h1 {
            font-size: 2rem;
          }

          .blog-content h2 {
            font-size: 1.5rem;
            margin: 2rem 0 0.75rem;
          }

          .blog-content h3 {
            font-size: 1.2rem;
            margin: 1.5rem 0 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .blog-content {
            font-size: 0.95rem;
            line-height: 1.7;
            letter-spacing: 0.2px;
          }

          .blog-content h1 {
            font-size: 1.75rem;
          }

          .blog-content h2 {
            font-size: 1.35rem;
          }

          .blog-content h3 {
            font-size: 1.1rem;
          }
        }

        /* Paragraphs */
        .blog-content p {
          margin: 1.25rem 0;
          color: var(--foreground);
          line-height: 1.8;
        }

        /* Lists */
        .blog-content ul,
        .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
          line-height: 1.8;
        }

        .blog-content li {
          margin: 0.75rem 0;
          color: var(--foreground);
          line-height: 1.8;
        }

        .blog-content ul li {
          list-style-type: disc;
        }

        .blog-content ol li {
          list-style-type: decimal;
        }

        @media (max-width: 480px) {
          .blog-content ul,
          .blog-content ol {
            padding-left: 1.5rem;
            margin: 1.25rem 0;
          }

          .blog-content li {
            margin: 0.5rem 0;
          }
        }

        /* Images */
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 2rem 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: block;
        }

        @media (max-width: 768px) {
          .blog-content img {
            margin: 1.5rem 0;
            border-radius: 6px;
          }
        }

        /* Blockquotes */
        .blog-content blockquote {
          border-left: 4px solid var(--accent);
          background: var(--secondary);
          padding: 1.25rem 1.5rem;
          margin: 2rem 0;
          border-radius: 0 6px 6px 0;
          font-style: italic;
          color: var(--foreground);
          line-height: 1.8;
          letter-spacing: 0.3px;
        }

        .blog-content blockquote p {
          margin: 0;
          padding: 0;
        }

        @media (max-width: 480px) {
          .blog-content blockquote {
            padding: 1rem 1.25rem;
            margin: 1.5rem 0;
            font-size: 0.95rem;
          }
        }

        /* Code */
        .blog-content code {
          background: var(--secondary);
          color: var(--accent);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', 'Monaco', monospace;
          font-size: 0.9em;
          border: 1px solid var(--border);
          word-break: break-word;
        }

        /* Code Blocks */
        .blog-content pre {
          background: var(--muted);
          color: var(--foreground);
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 2rem 0;
          border: 1px solid var(--border);
          font-size: 0.9rem;
          line-height: 1.5;
          letter-spacing: 0.5px;
        }

        .blog-content pre code {
          background: none;
          color: inherit;
          padding: 0;
          border: none;
          font-size: inherit;
        }

        @media (max-width: 768px) {
          .blog-content pre {
            padding: 1.25rem;
            margin: 1.5rem 0;
            font-size: 0.85rem;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Horizontal Rule */
        .blog-content hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2.5rem 0;
        }

        /* Strong & Bold */
        .blog-content strong,
        .blog-content b {
          font-weight: 700;
          color: var(--foreground);
        }

        /* Links */
        .blog-content a {
          color: var(--accent);
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          text-underline-offset: 4px;
          transition: all 0.2s ease;
        }

        .blog-content a:hover {
          color: var(--accent);
          opacity: 0.8;
        }

        /* Tables */
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }

        .blog-content th,
        .blog-content td {
          padding: 1rem;
          text-align: left;
          border: 1px solid var(--border);
        }

        .blog-content th {
          background: var(--secondary);
          font-weight: 600;
          color: var(--foreground);
        }

        .blog-content tbody tr:nth-child(even) {
          background: var(--secondary);
          opacity: 0.5;
        }
      `}</style>
    </Layout>
  );
}
