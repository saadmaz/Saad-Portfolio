import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// This should ideally match the structure in your blogUtils
const blogPosts = [
  {
    id: 1,
    slug: "building-ai-first-products", // Added slugs for dynamic routing
    title: "Building AI-First Products: Lessons from the Trenches",
    excerpt: "What I learned from building three AI-powered products.",
    date: "December 15, 2024",
    readTime: "8 min read",
    tags: ["AI", "Product", "Startups"],
    featured: true,
  },
  {
    id: 2,
    slug: "the-case-for-typescript",
    title: "The Case for TypeScript in 2024",
    excerpt: "Why TypeScript has become essential for modern web development.",
    date: "November 28, 2024",
    readTime: "6 min read",
    tags: ["TypeScript", "JavaScript"],
    featured: true,
  },
  // ... other posts
];

const BlogPage = () => {
  const featuredPosts = blogPosts.filter(p => p.featured);
  const regularPosts = blogPosts.filter(p => !p.featured);

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

          {/* Featured Posts Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {featuredPosts.map((post, index) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-xl border border-border card-hover p-6 h-full flex flex-col"
                >
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readTime}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-3">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex gap-2">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
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

          {/* All Posts List */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold mb-6">All Posts</h2>
            {regularPosts.map((post, index) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-display text-lg font-medium group-hover:text-accent transition-colors mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;