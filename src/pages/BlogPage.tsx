import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "Building AI-First Products: Lessons from the Trenches",
    excerpt: "What I learned from building three AI-powered products.",
    date: "December 15, 2024",
    readTime: "8 min read",
    tags: ["AI", "Product", "Startups"],
    featured: true,
  },
  {
    id: 2,
    title: "The Case for TypeScript in 2024",
    excerpt: "Why TypeScript has become essential for modern web development and how to adopt it in your projects.",
    date: "November 28, 2024",
    readTime: "6 min read",
    tags: ["TypeScript", "JavaScript", "Best Practices"],
    featured: true,
  },
  {
    id: 3,
    title: "From Intern to CTO: My Unconventional Path",
    excerpt: "How I went from a summer internship to co-founding a startup in just two years.",
    date: "November 10, 2024",
    readTime: "10 min read",
    tags: ["Career", "Startups", "Leadership"],
    featured: false,
  },
  {
    id: 4,
    title: "Scaling a Node.js Application to 1M Requests/Day",
    excerpt: "Technical deep-dive into the architecture decisions and optimizations that helped us scale.",
    date: "October 22, 2024",
    readTime: "12 min read",
    tags: ["Node.js", "Performance", "Architecture"],
    featured: false,
  },
  {
    id: 5,
    title: "Why I Chose React Over Vue (And When I'd Choose Vue)",
    excerpt: "An honest comparison of React and Vue from someone who has used both extensively.",
    date: "October 5, 2024",
    readTime: "7 min read",
    tags: ["React", "Vue", "Frontend"],
    featured: false,
  },
  {
    id: 6,
    title: "The Art of Code Review: Beyond 'LGTM'",
    excerpt: "How to give meaningful code reviews that help your team grow and ship better code.",
    date: "September 18, 2024",
    readTime: "5 min read",
    tags: ["Engineering", "Team", "Best Practices"],
    featured: false,
  },
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
              Subscribe to my newsletters for regular updates.
            </p>
          </motion.div>

          {/* Featured Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">Featured</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  className="group"
                >
                  <div className="bg-card rounded-xl border border-border card-hover p-6 h-full flex flex-col">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-3">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-accent flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>

          {/* All Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">All Posts</h2>
            <div className="space-y-4">
              {regularPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-medium text-foreground group-hover:text-accent transition-colors mb-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{post.date}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;
