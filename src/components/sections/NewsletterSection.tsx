import { motion } from "framer-motion";
import { Mail, Send, ArrowRight, TrendingUp, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * DATA ARRAY: Centralized source for your newsletter details.
 * Updated to reflect 'The CSE Newsroom' and 'Startup Chronicles'.
 */
const newsletters = [
  {
    title: "The CSE Newsroom",
    // Icon changed to TrendingUp to represent the Stock Market context
    icon: TrendingUp, 
    description: "Your weekly pulse on the Sri Lankan stock market. I provide curated updates, sector trends, and company news from the Colombo Stock Exchange.",
    audience: "Investors, Analysts, & Traders",
    frequency: "Every Sunday",
    subscribers: "6.2K+",
    // Color gradient representing a financial/professional blue theme
    color: "from-blue-600 to-cyan-500",
    link: "/newsletters#cse"
  },
  {
    title: "Startup Chronicles",
    // Icon changed to Rocket to represent entrepreneurship and growth
    icon: Rocket,
    description: "Deep dives into founder stories. I explore how entrepreneurs built their ventures, the hurdles they faced, and the lessons they learned along the way.",
    audience: "Founders, Operators, & VCs",
    frequency: "Bi-weekly Fridays",
    subscribers: "1.8K+",
    // Color gradient representing an energetic startup orange/red theme
    color: "from-orange-500 to-red-600",
    link: "/newsletters#startup"
  },
];

export function NewsletterSection() {
  return (
    /**
     * Section background uses a subtle secondary tint.
     * py-16 is used instead of section-padding to keep the section compact.
     */
    <section className="py-16 bg-secondary/30">
      <div className="section-container">
        
        {/* --- SECTION HEADER --- */}
        {/* Framer motion animation triggers once when the user scrolls into view */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12" // Reduced margin for a tighter layout
        >
          <span className="section-title">Knowledge Hub</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stay Updated
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            I share insights on the Sri Lankan stock market and entrepreneurship 
            through two dedicated newsletters. Join thousands of curious minds.
          </p>
        </motion.div>

        {/* --- NEWSLETTER CARDS GRID --- */}
        {/* Grid layout adjusts based on screen size (1 column on mobile, 2 on desktop) */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {newsletters.map((newsletter, index) => (
            <motion.div
              key={newsletter.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              // Staggered delay based on index creates a sequential entrance effect
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="bg-card rounded-xl border border-border card-hover overflow-hidden h-full flex flex-col transition-all duration-300">
                
                {/* Visual Header: 2px gradient line matching the specific newsletter theme */}
                <div className={`h-2 bg-gradient-to-r ${newsletter.color}`} />
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* ICON & FREQUENCY META */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <newsletter.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                      {newsletter.frequency}
                    </span>
                  </div>

                  {/* CONTENT AREA */}
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    {newsletter.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">
                    {newsletter.description}
                  </p>

                  {/* DATA POINTS: Audience and Social Proof */}
                  <div className="space-y-3 mb-6 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">For:</span>
                      <span className="text-foreground font-medium">{newsletter.audience}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subscribers:</span>
                      <span className="text-accent font-bold">{newsletter.subscribers}</span>
                    </div>
                  </div>

                  {/* ACTION: Leads to the LinkedIn/Direct subscription page */}
                  <Button asChild className="btn-primary w-full gap-2">
                    <Link to="/newsletters">
                      <Send className="w-4 h-4" />
                      Subscribe Now
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- BLOG CTA --- */}
        {/* Secondary call-to-action for users who prefer long-form blog content */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <p className="text-muted-foreground mb-4 text-sm">
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