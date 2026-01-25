import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { getAllBlogs } from "@/blog/utils/blogUtils";
import { BlogMetadata } from "@/blog/types/blog";
import { BlogCard } from "@/blog/components/BlogCard"; // Ensure this import path is correct
import "./BlogPage.css"; 

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

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="blog-header-area mb-16"
          >
            <span className="section-title">Knowledge Hub</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Thoughts & Insights
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
              Writing about technology, startups, and the lessons I'm learning along the way.
            </p>
          </motion.div>

          {loading ? (
            <div className="loading-state">
               <div className="animate-pulse text-muted-foreground">Fetching latest articles...</div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">No blog posts yet. Check back soon!</div>
          ) : (
            <div className="blog-index-wrapper">
              {/* Responsive Grid for all posts */}
              <div className="blog-main-grid">
                {blogs.map((post, index) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <BlogCard slug={post.slug} metadata={post.metadata} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;