import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BlogCard } from "@/data/blog/components/BlogCard";
import { getAllBlogs } from "@/data/blog/utils/blogUtils";
import { BlogMetadata } from "@/data/blog/types/blog";
import { X } from "lucide-react";
import "./BlogsPage.css";

interface BlogPreview {
  slug: string;
  metadata: BlogMetadata;
}

export const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPreview[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const selectedTag = searchParams.get("tag");

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const allBlogs = await getAllBlogs();
        setBlogs(allBlogs);

        // Extract all unique tags
        const tags = new Set<string>();
        allBlogs.forEach((blog) => {
          blog.metadata.tags?.forEach((tag) => tags.add(tag));
        });
        // We keep "All" out of the array because it's handled by the empty selectedTag state
        setAllTags(Array.from(tags).sort());
      } catch (error) {
        console.error("Error loading blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  // Filter blogs when selectedTag changes
  useEffect(() => {
    if (selectedTag) {
      const decodedTag = decodeURIComponent(selectedTag);
      const filtered = blogs.filter((blog) =>
        blog.metadata.tags?.includes(decodedTag)
      );
      setFilteredBlogs(filtered);
    } else {
      setFilteredBlogs(blogs);
    }
  }, [selectedTag, blogs]);

  const handleTagClick = (tag: string) => {
    // Toggle logic: if clicking the same tag, clear it. Otherwise, set it.
    if (selectedTag === tag) {
      setSearchParams({});
    } else {
      setSearchParams({ tag });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilter = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <div className="blogs-page">Loading blogs...</div>;
  }

  if (blogs.length === 0) {
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
      <header className="blogs-header">
        <h1>Blog</h1>
        <p>Thoughts, tutorials, and insights from my journey</p>
      </header>

      {/* Tag Filter Section */}
      <div className="blogs-filter-section">
        <div className="filter-container">
          <div className="filter-header">
            <h3 className="filter-title">Filter by Tag</h3>
          </div>
          <div className="tags-filter-grid">
            {/* Added "All" button to mirror ProjectsPage functionality */}
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
          
          {selectedTag && (
            <div className="filter-active">
              <span className="filter-active-label">
                Filtered by: <strong>{decodeURIComponent(selectedTag)}</strong>
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

      {/* Results */}
      {filteredBlogs.length === 0 ? (
        <div className="no-blogs-results">
          <p>No blog posts found with the tag "{decodeURIComponent(selectedTag || "")}"</p>
          <button className="reset-filter-link" onClick={handleClearFilter}>
            View all blogs
          </button>
        </div>
      ) : (
        <>
          {selectedTag && (
            <div className="blogs-results-header">
              <p className="results-count">
                Found {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"}
              </p>
            </div>
          )}
          <div className="blogs-grid">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog.slug} slug={blog.slug} metadata={blog.metadata} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};