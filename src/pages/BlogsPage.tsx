import { useEffect, useState } from "react";
import { BlogCard } from "../blog/components/BlogCard";
import { getAllBlogs } from "../blog/utils/blogUtils";
import { BlogMetadata } from "../blog/types/blog";
import "./BlogsPage.css";

interface BlogPreview {
  slug: string;
  metadata: BlogMetadata;
}

export const BlogsPage: React.FC = () => {
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

  if (loading) {
    return <div className="blogs-page">Loading blogs...</div>;
  }

  if (blogs.length === 0) {
    return (
      <div className="blogs-page">
        <h1>Blog</h1>
        <p className="no-blogs">No blogs published yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <header className="blogs-header">
        <h1>Blog</h1>
        <p>Thoughts, tutorials, and insights from my development journey</p>
      </header>

      <div className="blogs-grid">
        {blogs.map((blog) => (
          <BlogCard key={blog.slug} slug={blog.slug} metadata={blog.metadata} />
        ))}
      </div>
    </div>
  );
};