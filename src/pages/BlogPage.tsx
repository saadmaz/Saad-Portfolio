import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { getAllBlogs } from "@/blog/utils/blogUtils";
import { BlogMetadata } from "@/blog/types/blog";
import { BlogCard } from "@/blog/components/BlogCard";
import { Search, X } from "lucide-react";
import "./BlogPage.css"; 

interface BlogPreview {
  slug: string;
  metadata: BlogMetadata;
}

const BlogPage = () => {
  const [blogs, setBlogs] = useState<BlogPreview[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const allBlogs = await getAllBlogs();
        setBlogs(allBlogs);
        setFilteredBlogs(allBlogs);
      } catch (error) {
        console.error("Error loading blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  // Filter blogs based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredBlogs(blogs);
    } else {
      const lowercaseQuery = query.toLowerCase();
      const filtered = blogs.filter((blog) =>
        blog.metadata.title.toLowerCase().includes(lowercaseQuery) ||
        blog.metadata.excerpt.toLowerCase().includes(lowercaseQuery) ||
        blog.metadata.tags?.some((tag) =>
          tag.toLowerCase().includes(lowercaseQuery)
        )
      );
      setFilteredBlogs(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredBlogs(blogs);
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="blog-header-area"
          >
            <span className="section-title">Knowledge Hub</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Thoughts & Insights
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
              Writing about technology, startups, and the lessons I'm learning along the way.
            </p>
          </motion.div>

          {/* Search Bar */}
          {!loading && blogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="blog-search-container"
            >
              <div className="blog-search-wrapper">
                <Search className="blog-search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search blogs by title, content, or tags..."
                  className="blog-search-input"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="blog-search-clear"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <p className="blog-search-hint">
                Found {filteredBlogs.length} result{filteredBlogs.length !== 1 ? "s" : ""}
              </p>
            </motion.div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="animate-pulse text-muted-foreground">Fetching latest articles...</div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No articles found</h3>
              <p>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No blog posts yet. Check back soon!"}
              </p>
              {searchQuery && (
                <button onClick={clearSearch} className="empty-state-reset">
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="blog-index-wrapper">
              {/* Responsive Grid for all posts */}
              <div className="blog-main-grid">
                {filteredBlogs.map((post, index) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
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