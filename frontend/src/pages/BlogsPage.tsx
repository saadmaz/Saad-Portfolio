import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTag = searchParams.get("tag");

  // Tag → count map for sidebar
  const tagCounts = blogPosts.reduce<Record<string, number>>((acc, post) => {
    (post.tags || []).forEach(t => { acc[t] = (acc[t] || 0) + 1; });
    return acc;
  }, {});
  const allTags = Object.keys(tagCounts).sort();

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
      blog.metadata.tags?.some(t => t.toLowerCase().includes(query));
    return matchesTag && matchesSearch;
  });

  const handleTagClick = (tag: string) => {
    setSearchParams(selectedTag === tag ? {} : { tag });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilter = () => {
    setSearchParams({});
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFiltered = !!(selectedTag || searchQuery);

  return (
    <div className="blogs-page">
      <SEO
        title="Blog | Startups, AI & Developer Insights by Saad Mazhar"
        description="Thoughts, tutorials, and real-world insights from Saad Mazhar — covering AI tools, full-stack development, startup building, and the Sri Lanka tech ecosystem."
        url="https://saadmaz.com/blog"
      />

      {/* ── Page Header ── */}
      <div className="blogs-hero">
        <span className="blogs-hero-label">BLOG</span>
        <h1 className="blogs-hero-title">Thoughts, Ideas &amp; Insights</h1>
        <p className="blogs-hero-sub">
          I share my thoughts on AI, startups, full-stack development, and building
          things from Colombo, Sri Lanka.
        </p>
      </div>

      <div className="blogs-page-container">
        {/* ── Main + Sidebar layout ── */}
        <div className="blogs-layout">

          {/* ── Main column ── */}
          <main className="blogs-main">
            {/* Controls */}
            <div className="blogs-controls-row">
              <h2 className="blogs-section-label">
                {isFiltered
                  ? `${filteredBlogs.length} ${filteredBlogs.length === 1 ? "post" : "posts"} found`
                  : "All Posts"}
              </h2>

              <div className="search-input-wrapper">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search posts…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="blog-search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="search-clear-button" aria-label="Clear">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Active filter pill */}
            {isFiltered && (
              <div className="blogs-active-filter">
                <span>
                  {selectedTag && searchQuery
                    ? `"${searchQuery}" · ${decodeURIComponent(selectedTag)}`
                    : selectedTag
                    ? decodeURIComponent(selectedTag)
                    : `"${searchQuery}"`}
                </span>
                <button onClick={handleClearFilter} className="filter-clear-btn">
                  <X size={12} /> Clear
                </button>
              </div>
            )}

            {/* Post list */}
            {isLoading ? (
              <div className="blogs-skeleton">
                {[1, 2, 3].map(i => <div key={i} className="blogs-skeleton-item" />)}
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="blogs-empty">
                <p>No posts match your search.</p>
                <button className="blogs-reset-btn" onClick={handleClearFilter}>View all posts</button>
              </div>
            ) : (
              <div className="blogs-list">
                {filteredBlogs.map(blog => (
                  <BlogCard key={blog.slug} slug={blog.slug} metadata={blog.metadata} />
                ))}
              </div>
            )}
          </main>

          {/* ── Sidebar ── */}
          <aside className="blogs-sidebar">
            {/* About */}
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">About Me</h3>
              <p className="sidebar-about-text">
                I'm a software engineer and startup builder from Colombo, Sri Lanka —
                writing about AI, product, and full-stack development.
              </p>
              <Link to="/" className="sidebar-cta">View My Work</Link>
            </div>

            {/* Categories */}
            {allTags.length > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">Categories</h3>
                <ul className="sidebar-categories">
                  <li>
                    <button
                      className={`sidebar-cat-btn ${!selectedTag ? "active" : ""}`}
                      onClick={handleClearFilter}
                    >
                      <span>All Posts</span>
                      <span className="sidebar-cat-count">{blogPosts.length}</span>
                    </button>
                  </li>
                  {allTags.map(tag => (
                    <li key={tag}>
                      <button
                        className={`sidebar-cat-btn ${selectedTag === tag ? "active" : ""}`}
                        onClick={() => handleTagClick(tag)}
                      >
                        <span>{tag}</span>
                        <span className="sidebar-cat-count">{tagCounts[tag]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Latest posts */}
            {blogPosts.length > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">Latest Posts</h3>
                <ul className="sidebar-latest">
                  {blogPosts.slice(0, 4).map(post => (
                    <li key={post.id}>
                      <Link to={`/blog/${post.slug}`} className="sidebar-latest-item">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="sidebar-latest-thumb"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        <div>
                          <span className="sidebar-latest-title">{post.title}</span>
                          <span className="sidebar-latest-date">
                            {post.date ? new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
