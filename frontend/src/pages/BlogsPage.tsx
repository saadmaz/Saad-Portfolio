import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BlogCard } from "../components/blog/BlogCard/BlogCard";
import { useBlogPosts } from "../shared/hooks/useBlog";
import { X, Search } from "lucide-react";
import { SEO } from "@/components/SEO";
import "./BlogsPage.css";

import { Blog } from "../shared/lib/dataManager";

interface BlogPreview {
  slug: string;
  metadata: Blog;
}

const BlogsPage: React.FC = () => {
  const { data: blogPosts = [], isLoading } = useBlogPosts();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTag = searchParams.get("tag");

  // Extract all unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags || []))).sort();

  // Mapping from BlogPost to the internal structure expected by BlogCard
  const blogPreviews = blogPosts.map(post => ({
    slug: post.slug,
    metadata: {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      category: post.category,
      readTime: "5 min", // Default or extract if available
      slug: post.slug,
      author: post.author,
      coverImage: post.image,
      tags: post.tags,
      isLatest: post.is_latest
    }
  }));

  const filteredBlogs = blogPreviews.filter(blog => {
    const matchesTag = !selectedTag || (blog.metadata.tags?.includes(decodeURIComponent(selectedTag)));
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      blog.metadata.title.toLowerCase().includes(query) ||
      blog.metadata.excerpt.toLowerCase().includes(query) ||
      blog.metadata.tags?.some(tag => tag.toLowerCase().includes(query));
    
    return matchesTag && matchesSearch;
  });

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSearchParams({});
    } else {
      setSearchParams({ tag });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearFilter = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return <div className="blogs-page flex items-center justify-center min-h-[50vh]">Loading blogs...</div>;
  }

  if (blogPosts.length === 0) {
    return (
      <div className="blogs-page">
        <header className="blogs-header">
          <h1>Blog</h1>
        </header>
        <p className="no-blogs">No blogs published yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <SEO
        title="Blog"
        description="Thoughts, tutorials, and insights from Saad Mazhar - covering startups, full-stack development, AI, and the Sri Lanka tech scene."
        url="https://saadmaz.com/blog"
      />
      <div className="blogs-page-container">
        <header className="blogs-header">
          <h1>Blog</h1>
          <p>Thoughts, tutorials, and insights from my journey</p>
        </header>

        {/* Search & Filter Section */}
        <div className="blogs-search-filter-section">
          {/* Horizontal Tag Bar */}
          <div className="blogs-tag-bar-wrapper">
            <div className="blogs-tag-bar">
              <button
                className={`tag-bar-button ${!selectedTag ? "active" : ""}`}
                onClick={handleClearFilter}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-bar-button ${
                    selectedTag === tag ? "active" : ""
                  }`}
                  onClick={() => handleTagClick(tag)}
                  aria-pressed={selectedTag === tag}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="blog-search-container">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search blogs by title, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="blog-search-input"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="search-clear-button"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Tag Filter Section */}
          <div className="blogs-filter-section">
            <div className="filter-container">
              <div className="filter-header">
                <h3 className="filter-title">Filter by Tag</h3>
              </div>
              <div className="tags-filter-grid">
                <button
                  className={`tag-filter-button ${!selectedTag ? "active" : ""}`}
                  onClick={handleClearFilter}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-filter-button ${
                      selectedTag === tag ? "active" : ""
                    }`}
                    onClick={() => handleTagClick(tag)}
                    aria-pressed={selectedTag === tag}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {(selectedTag || searchQuery) && (
                <div className="filter-active-label">
                  <span>
                    {searchQuery && selectedTag
                      ? `Filtered by: "${searchQuery}" + ${decodeURIComponent(
                          selectedTag
                        )}`
                      : searchQuery
                      ? `Search: "${searchQuery}"`
                      : `Filtered by: ${decodeURIComponent(selectedTag || "")}`}
                  </span>
                  <button
                    className="filter-clear-button"
                    onClick={handleClearFilter}
                    aria-label="Clear filter"
                  >
                    <X size={16} />
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredBlogs.length === 0 ? (
          <div className="no-blogs-results">
            <p>
              {searchQuery && selectedTag
                ? `No blog posts match "${searchQuery}" with tag "${decodeURIComponent(
                    selectedTag
                  )}"`
                : searchQuery
                ? `No blog posts match "${searchQuery}"`
                : `No blog posts found with tag "${decodeURIComponent(
                    selectedTag || ""
                  )}"`}
            </p>
            <button className="reset-filter-link" onClick={handleClearFilter}>
              View all blogs
            </button>
          </div>
        ) : (
          <>
            {(selectedTag || searchQuery) && (
              <div className="blogs-results-header">
                <p className="results-count">
                  Found {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"}
                </p>
              </div>
            )}
            <div className="blogs-grid">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog.slug}
                  slug={blog.slug}
                  metadata={blog.metadata}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;