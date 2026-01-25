import { useParams, Navigate } from "react-router-dom";
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
      <article className="section-padding">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/blog" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors">
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
              className="mb-8 rounded-xl overflow-hidden"
            >
              <img
                src={metadata.coverImage}
                alt={metadata.title}
                className="w-full h-96 object-cover"
              />
            </motion.div>
          )}

          {/* Blog Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {metadata.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{metadata.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Published: {new Date(metadata.publishedDate).toLocaleDateString()}</span>
              </div>
              {metadata.updatedDate && (
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  <span>Updated: {new Date(metadata.updatedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block bg-secondary text-muted-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose dark:prose-invert max-w-none mb-12"
            style={{
              "--tw-prose-body": "var(--foreground)",
              "--tw-prose-headings": "var(--foreground)",
              "--tw-prose-lead": "var(--muted-foreground)",
              "--tw-prose-links": "var(--accent)",
              "--tw-prose-bold": "var(--foreground)",
              "--tw-prose-counters": "var(--accent)",
              "--tw-prose-bullets": "var(--accent)",
              "--tw-prose-hr": "var(--border)",
              "--tw-prose-quotes": "var(--muted-foreground)",
              "--tw-prose-quote-borders": "var(--accent)",
              "--tw-prose-captions": "var(--muted-foreground)",
              "--tw-prose-code": "var(--foreground)",
              "--tw-prose-pre-code": "var(--foreground)",
              "--tw-prose-pre-bg": "var(--muted)",
              "--tw-prose-th-borders": "var(--border)",
              "--tw-prose-td-borders": "var(--border)",
            } as React.CSSProperties}
          >
            <div className="blog-content">
              {content}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border-t border-border pt-8"
          >
            <div className="mb-6">
              <p className="text-muted-foreground mb-2">Written by {metadata.author}</p>
              {metadata.updatedDate && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(metadata.updatedDate).toLocaleDateString()}
                </p>
              )}
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Posts
            </Link>
          </motion.footer>
        </div>
      </article>

      <style>{`
        .blog-content h2 {
          @apply text-2xl font-bold mt-8 mb-4 text-foreground;
        }

        .blog-content h3 {
          @apply text-xl font-semibold mt-6 mb-3 text-foreground;
        }

        .blog-content p {
          @apply text-foreground/90 mb-4 leading-relaxed;
        }

        .blog-content ul,
        .blog-content ol {
          @apply ml-6 mb-4;
        }

        .blog-content li {
          @apply mb-2 text-foreground/90;
        }

        .blog-content img {
          @apply rounded-lg my-6 max-w-full;
        }

        .blog-content blockquote {
          @apply border-l-4 border-accent pl-4 py-2 italic text-muted-foreground my-6 bg-secondary/50 rounded-r;
        }

        .blog-content code {
          @apply bg-secondary px-2 py-1 rounded text-sm font-mono text-foreground;
        }

        .blog-content pre {
          @apply bg-secondary p-4 rounded-lg overflow-x-auto my-6;
        }

        .blog-content pre code {
          @apply bg-transparent p-0 text-foreground;
        }
      `}</style>
    </Layout>
  );
}
