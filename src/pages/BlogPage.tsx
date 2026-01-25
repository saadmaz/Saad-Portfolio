import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllBlogs } from "@/blog/utils/blogUtils";
import { BlogMetadata } from "@/blog/types/blog";

interface BlogPreview {
  slug: string;
  metadata: BlogMetadata;
}

const BlogPage = () => {
  const [blogs, setBlogs] = useState<BlogPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const allBlogs = await getAllBlogs();
        setBlogs(allBlogs);
      } catch (error) {
        console.error("Error loading blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const featuredPosts = blogs.slice(0, 2);
  const regularPosts = blogs.slice(2);

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <span className="section-title">Blog</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Thoughts & Insights
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Writing about technology, startups, and the lessons I'm learning along the way.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center text-muted-foreground">Loading blog posts...</div>
          ) : blogs.length === 0 ? (
            <div className="text-center text-muted-foreground">No blog posts yet. Check back soon!</div>
          ) : (
            <>
              {/* Featured Posts Grid */}
              {featuredPosts.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                  {featuredPosts.map((post, index) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="group"
                    >
                      <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-card rounded-xl border border-border card-hover p-6 h-full flex flex-col"
                      >
                        {post.metadata.coverImage && (
                          <img
                            src={post.metadata.coverImage}
                            alt={post.metadata.title}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.metadata.publishedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-3">
                          {post.metadata.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 flex-1">
                          {post.metadata.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex gap-2">
                            {post.metadata.tags?.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-accent flex items-center gap-1">
                            Read More <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </motion.article>
                    </Link>
                  ))}
                </div>
              )}

              {/* All Posts List */}
              {regularPosts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-semibold mb-6">All Posts</h2>
                  {regularPosts.map((post, index) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="group block"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <h3 className="font-display text-lg font-medium group-hover:text-accent transition-colors mb-2">
                            {post.metadata.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(post.metadata.publishedDate).toLocaleDateString()}</span>
                            <span>{post.metadata.author}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;