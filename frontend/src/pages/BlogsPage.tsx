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

  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags || []))).sort();

  const blogPreviews: BlogPreview[] = blogPosts.map(post => ({
    slug: post.slug,
    metadata: {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      category: post.category,
      readTime: "5 min",
      slug: post.slug,
      author: post.author,
      coverImage: post.image,
      tags: post.tags,
      isLatest: post.is_latest,
    },
  }));

  const filteredBlogs = blogPreviews.filter(blog => {
    const matchesTag = !selectedTag || blog.metadata.tags?.includes(decodeURIComponent(selectedTag));
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
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

  const handleClearSearch = () => setSearchQuery("");

  const handleClearFilter = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="blogs-page">
        <div className="blogs-page-container">
          <div className="blogs-header">
            <h1>Blog</h1>
          </div>
          <div className="blogs-grid">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  height: 320,
                  borderRadius: 12,
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (blogPosts.length === 0) {
    return (
      <div className="blogs-page">
        <div className="blogs-page-container">
          <div className="blogs-header">
            <h1>Blog</h1>
            <p>Thoughts, tutorials, and insights from my journey</p>
          </div>
          <p className="no-blogs">No blogs published yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  const isFiltered = !!(selectedTag || searchQuery);

  return (
    <div className="blogs-page">
      <SEO
        title="Blog | Startups, AI & Developer Insights by Saad Mazhar"
        description="Thoughts, tutorials, and real-world insights from Saad Mazhar — covering AI tools, full-stack development, startup building, and the Sri Lanka tech ecosystem."
        url="https://saadmaz.com/blog"
      />
      <div className="blogs-page-container">
        <header className="blogs-header">
          <h1>Blog</h1>
          <p>Thoughts, tutorials, and insights from my journey</p>
        </header>

        <div className="blogs-controls">
          {/* Search */}
          <div className="blog-search-container">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by title, topic, or tag…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="blog-search-input"
              />
              {searchQuery && (
                <button onClick={handleClearSearch} className="search-clear-button" aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Tag filter bar */}
          <div className="blogs-tag-bar-wrapper">
            <div className="blogs-tag-bar">
              <button
                className={`tag-bar-button ${!selectedTag ? "active" : ""}`}
                onClick={handleClearFilter}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-bar-button ${selectedTag === tag ? "active" : ""}`}
                  onClick={() => handleTagClick(tag)}
                  aria-pressed={selectedTag === tag}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter strip */}
          {isFiltered && (
            <div className="filter-active-label">
              <span>
                {searchQuery && selectedTag
                  ? `"${searchQuery}" · ${decodeURIComponent(selectedTag)}`
                  : searchQuery
                  ? `"${searchQuery}"`
                  : decodeURIComponent(selectedTag || "")}
              </span>
              <button className="filter-clear-button" onClick={handleClearFilter}>
                <X size={12} /> Clear
              </button>
            </div>
          )}
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="no-blogs-results">
            <p>No posts match your search.</p>
            <button className="reset-filter-link" onClick={handleClearFilter}>
              View all posts
            </button>
          </div>
        ) : (
          <>
            {isFiltered && (
              <div className="blogs-results-header">
                <p className="results-count">
                  {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"}
                </p>
              </div>
            )}
            <div className="blogs-grid">
              {filteredBlogs.map(blog => (
                <BlogCard key={blog.slug} slug={blog.slug} metadata={blog.metadata} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
