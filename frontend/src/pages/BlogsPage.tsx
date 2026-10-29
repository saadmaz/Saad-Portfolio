import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { m } from "framer-motion";
import { Layout } from "../components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { BlogCard } from "../components/blog/BlogCard/BlogCard";
import { useBlogPosts } from "@/hooks/useBlog";

const BlogsPage: React.FC = () => {
  const { data: blogPosts = [], isLoading } = useBlogPosts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const selectedTag = searchParams.get("tag");

  const allTags = ["All", ...Array.from(new Set(blogPosts.flatMap((p) => p.tags || []))).sort()];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesTag = !selectedTag || (post.tags || []).includes(selectedTag);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      post.title?.toLowerCase().includes(q) ||
      post.excerpt?.toLowerCase().includes(q) ||
      (post.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchesTag && matchesSearch;
  });

  const handleTagClick = (tag: string) => {
    setSearchParams(tag === "All" ? {} : { tag });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="section-container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-secondary/30 animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/blog"].title}
        description={PAGE_SEO["/blog"].description}
        url={`${BASE_URL}/blog`}
      />

      <section className="section-padding">
        <div className="section-container">
          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="section-title">Blog</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Thoughts, Ideas &amp; Insights
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              I write about AI, startups, full-stack development, and building products from Colombo, Sri
              Lanka.
            </p>
          </m.div>

          {/* Controls: tags + search */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3 mb-12"
          >
            {/* Tag pills */}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  (tag === "All" && !selectedTag) || selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {tag}
              </button>
            ))}

            {/* Search */}
            <div className="relative ml-auto">
              <input
                type="text"
                placeholder="Search posts…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm rounded-full border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs leading-none"
                  aria-label="Clear"
                >
                  ✕
                </button>
              )}
            </div>
          </m.div>

          {/* Empty state */}
          {filteredPosts.length === 0 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-muted-foreground"
            >
              <p className="text-lg mb-4">No posts found.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchParams({});
                }}
                className="px-5 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted text-sm font-medium transition-colors"
              >
                Clear filters
              </button>
            </m.div>
          )}

          {/* 3-column grid */}
          {filteredPosts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <m.div
                  key={post.id || post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="h-full"
                >
                  <BlogCard post={post} />
                </m.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogsPage;
