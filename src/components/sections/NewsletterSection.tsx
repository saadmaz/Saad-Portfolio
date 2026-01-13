import { motion } from "framer-motion"; // For scroll-triggered animations
import { Mail, Send, ArrowRight, TrendingUp, Rocket } from "lucide-react"; // Icons for newsletters and actions
import { Link } from "react-router-dom";  // For internal navigation links
import { Button } from "@/components/ui/button"; // Reusable button component

// DATA ARRAY: Each newsletter includes title, icon, description, audience, frequency, subscribers, color gradient, and link.
const newsletters = [
  {
    title: "The CSE Newsroom", // Newsletter title
    icon: TrendingUp, // Icon representing stock market trends
    description: "Your weekly pulse on the Sri Lankan stock market. I provide curated updates, sector trends, and company news from the Colombo Stock Exchange.",
    audience: "Investors, Analysts, & Traders", // Target audience
    frequency: "Every Sunday", // Publication frequency
    subscribers: "6.2K+", // Social proof via subscriber count
    color: "from-blue-600 to-cyan-500", // Color gradient representing finance and trust
    link: "/newsletters#cse" // Internal link to the newsletter section
  },
  {
    title: "Startup Chronicles", // Newsletter title
    icon: Rocket, // Icon representing startups and innovation
    description: "Deep dives into founder stories. I explore how entrepreneurs built their ventures, the hurdles they faced, and the lessons they learned along the way.",
    audience: "Founders, Operators, & VCs", // Target audience
    frequency: "Bi-weekly Fridays", // Publication frequency
    subscribers: "1.8K+", // Social proof via subscriber count
    color: "from-orange-500 to-red-600", // Color gradient representing energy and passion
    link: "/newsletters#startup" // Internal link to the newsletter section
  },
];

export function NewsletterSection() {
  return (
// --- NEWSLETTER SECTION: Knowledge Hub ---
<section className="py-16 bg-secondary/30"> // Newsletter section with a subtle secondary background
      <div className="section-container"> // Container for consistent horizontal padding
        
        // Title, subtitle, and description centered with reduced margins for a compact layout
        <motion.div
          initial={{ opacity: 0, y: 20 }} // Initial state: slightly below and transparent
          whileInView={{ opacity: 1, y: 0 }} // Final state: in place and fully visible
          viewport={{ once: true }} // Animation triggers only once when in view
          transition={{ duration: 0.5 }} // Smooth transition over half a second
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
        // Newsletter cards grid: 2 columns on medium screens and above
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {newsletters.map((newsletter, index) => (
            <motion.div
              key={newsletter.title} // Unique key for each newsletter card
              initial={{ opacity: 0, y: 20 }} // Initial state: slightly below and transparent
              whileInView={{ opacity: 1, y: 0 }} // Final state: in place and fully visible
              viewport={{ once: true }} // Animation triggers only once when in view
              transition={{ duration: 0.5, delay: index * 0.15 }} // Smooth transition with staggered delay
            >
              // --- INDIVIDUAL NEWSLETTER CARD ---
              <div className="bg-card rounded-xl border border-border card-hover overflow-hidden h-full flex flex-col transition-all duration-300">
                
                {/* Header Gradient line (2px) */}
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
                  <div className="space-y-3 mb-6 pt-4 border-t border-border/50"> {/* Top border separates this section */}
                    <div className="flex items-center justify-between text-sm"> {/* Audience info */}
                      <span className="text-muted-foreground">For:</span> {/* Target audience */}
                      <span className="text-foreground font-medium">{newsletter.audience}</span> {/* Audience details */}
                    </div> {/* End of audience info */}
                    <div className="flex items-center justify-between text-sm"> {/* Subscriber count */}
                      <span className="text-muted-foreground">Subscribers:</span> {/* Label */}
                      <span className="text-accent font-bold">{newsletter.subscribers}</span> {/* Subscriber count */}
                    </div> {/* End of subscriber count */}
                  </div> {/* End of data points section */}

                  {/* CALL TO ACTION BUTTON */}
                  <Button asChild className="btn-primary w-full gap-2 mt-auto"> {/* Full-width primary button */}
                    <Link to={newsletter.link}>
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
          initial={{ opacity: 0 }} // Initial state: fully transparent
          whileInView={{ opacity: 1 }} // Final state: fully opaque
          viewport={{ once: true }} // Animation triggers only once when in view
          transition={{ delay: 0.5 }} // Delay to appear after newsletter cards
          className="text-center mt-10" // Centered text with margin on top
        >
          <p className="text-muted-foreground mb-4 text-sm"> 
            Prefer to read at your own pace?
          </p>
          <Button asChild variant="outline" className="btn-outline gap-2"> {/* Outlined button for secondary action */}
            <Link to="/blog"> {/* Internal link to the blog page */}
              Read the Blog
              <ArrowRight className="w-4 h-4" /> {/* Arrow icon for visual cue */}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}