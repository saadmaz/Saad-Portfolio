import { motion } from "framer-motion";
import { Mail, Send, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const newsletters = [
  {
    title: "Tech Insights Weekly",
    description: "Deep dives into emerging technologies, engineering best practices, and lessons from building products.",
    audience: "Engineers, CTOs, Tech Enthusiasts",
    frequency: "Weekly",
    subscribers: "2.5K+",
    color: "from-accent to-blue-accent",
  },
  {
    title: "Startup Chronicles",
    description: "Behind-the-scenes stories of building startups, fundraising insights, and founder lessons learned.",
    audience: "Founders, VCs, Operators",
    frequency: "Bi-weekly",
    subscribers: "1.8K+",
    color: "from-success to-accent",
  },
];

export function NewsletterSection() {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-title">Knowledge Hub</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stay Updated
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            I share insights on technology and entrepreneurship through two newsletters. 
            Join thousands of readers learning together.
          </p>
        </motion.div>

        {/* Newsletter Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {newsletters.map((newsletter, index) => (
            <motion.div
              key={newsletter.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="bg-card rounded-xl border border-border card-hover overflow-hidden h-full flex flex-col">
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${newsletter.color}`} />
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <Mail className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs text-muted-foreground">{newsletter.frequency}</span>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {newsletter.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {newsletter.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">For:</span>
                      <span className="text-foreground">{newsletter.audience}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subscribers:</span>
                      <span className="text-accent font-medium">{newsletter.subscribers}</span>
                    </div>
                  </div>

                  <Button className="btn-primary w-full gap-2">
                    <Send className="w-4 h-4" />
                    Subscribe
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Blog CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Prefer to read at your own pace?
          </p>
          <Button asChild variant="outline" className="btn-outline gap-2">
            <Link to="/blog">
              Read the Blog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
