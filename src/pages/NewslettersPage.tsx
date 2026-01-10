import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
// TrendingUp is perfect for Stocks; Rocket is the universal symbol for Startups
import { Mail, TrendingUp, Users, Rocket, BookOpen, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

/** * DATA STRUCTURE: We use a centralized array to manage newsletter content.
 * This makes the UI code cleaner and allows for easy updates to titles or links.
 */
const newsletters = [
  {
    id: "cse-newsroom",
    title: "The CSE Newsroom",
    // Changed to TrendingUp to represent market growth/stock indices
    icon: TrendingUp,
    description: "Your weekly pulse on the Sri Lankan stock market. I break down Colombo Stock Exchange trends, company earnings, and investment opportunities in plain English.",
    topics: ["Market Trends", "CSE Analysis", "Equity Research", "Investor Education"],
    audience: "Investors, Traders, & Finance Students",
    frequency: "Every Sunday",
    subscribers: "6,200+",
    color: "from-blue-600 to-cyan-500",
    // LinkedIn Newsletter direct URL
    linkedInUrl: "Subscribe on LinkedIn https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7337874498160848896", 
    latestIssue: {
      title: "Market Outlook: Banking Sector Rally",
      date: "Dec 24, 2025",
    },
  },
  {
    id: "startup-chronicles",
    title: "Startup Chronicles",
    // Changed to Rocket to represent the 'launch' and 'growth' phase of entrepreneurs
    icon: Rocket,
    description: "Deep dives into the journeys of Sri Lankan and global entrepreneurs. No fluff—just the raw stories of how they built, failed, and eventually scaled.",
    topics: ["Founder Interviews", "Pivot Stories", "Fundraising", "Early-stage Growth"],
    audience: "Aspiring Founders & Operators",
    frequency: "Bi-weekly Fridays",
    subscribers: "1,800+",
    color: "from-orange-500 to-red-600",
    // LinkedIn Newsletter direct URL
    linkedInUrl: "https://www.linkedin.com/newsletters/your-startup-newsletter-id",
    latestIssue: {
      title: "From Dorm Room to Series A: The X Story",
      date: "Dec 20, 2025",
    },
  },
];

const NewslettersPage = () => {
  /** * REDIRECTION LOGIC:
   * Instead of a form, we now redirect users to LinkedIn where your 
   * newsletter ecosystem actually lives. This ensures high conversion 
   * as users are already logged into LinkedIn.
   */
  const handleSubscribeRedirect = (url: string, title: string) => {
    toast.info(`Redirecting to ${title} on LinkedIn...`);
    // Opens in a new tab to keep the user on your portfolio site simultaneously
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          
          {/* HEADER SECTION: Defines the 'Knowledge Hub' intent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="section-title">Knowledge Hub</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Newsletters
            </h1>
            {/* Mission statement updated to match your two specific niches */}
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              I curate high-signal insights for the Sri Lankan ecosystem. 
              Whether it's the financial mechanics of the <strong>CSE</strong> or the grit of 
              <strong> Founder Stories</strong>, I write to keep you ahead.
            </p>
          </motion.div>

          {/* NEWSLETTER CARDS: Grid layout for side-by-side comparison */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {newsletters.map((newsletter, index) => (
              <motion.div
                key={newsletter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group"
              >
                <div className="bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-accent/30">
                  
                  {/* Decorative Gradient Top-Bar based on newsletter 'color' prop */}
                  <div className={`h-2 bg-gradient-to-r ${newsletter.color}`} />
                  
                  <div className="p-8 flex-1 flex flex-col">
                    {/* ICON & TITLE: The visual anchor of the card */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-accent/5 group-hover:bg-accent/10 transition-colors">
                        <newsletter.icon className="w-8 h-8 text-accent" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                          {newsletter.title}
                        </h2>
                        <p className="text-sm font-medium text-accent">{newsletter.frequency}</p>
                      </div>
                    </div>

                    {/* DESCRIPTION: Explains the 'Why' behind the newsletter */}
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {newsletter.description}
                    </p>

                    {/* TOPIC CHIPS: Visual representation of the content pillars */}
                    <div className="mb-8">
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground/60 mb-3">Focus Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {newsletter.topics.map((topic) => (
                          <span key={topic} className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground border border-border">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* META STATS: Adds social proof (subscribers) and target audience info */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Target Audience</p>
                        <p className="text-xs font-medium text-foreground">{newsletter.audience}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Subscribers</p>
                        <p className="text-sm font-bold text-accent">{newsletter.subscribers}</p>
                      </div>
                    </div>

                    {/* LATEST ISSUE: Crucial for showing the newsletter is currently active */}
                    <div className="p-5 rounded-xl border border-dashed border-border mb-8 bg-accent/5">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-3 h-3 text-accent" />
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Most Recent Edition</p>
                      </div>
                      <p className="font-semibold text-foreground text-sm group-hover:text-accent transition-colors">
                        {newsletter.latestIssue.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">{newsletter.latestIssue.date}</p>
                    </div>

                    {/* CTA: Opens the LinkedIn Newsletter subscription page */}
                    <div className="mt-auto">
                      <Button 
                        onClick={() => handleSubscribeRedirect(newsletter.linkedInUrl, newsletter.title)}
                        className="btn-primary w-full h-12 gap-2 text-md shadow-lg shadow-accent/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Read & Subscribe on LinkedIn
                      </Button>
                      <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-tighter">
                        Joins {newsletter.subscribers} professionals
                      </p>
                    </div>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FOOTER ARCHIVE: Directs users to the full list of past articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-24 text-center max-w-3xl mx-auto p-12 rounded-3xl bg-secondary/20 border border-border"
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Browse the Archives
            </h3>
            <p className="text-muted-foreground mb-8">
              Every issue is a permanent resource. You can browse through the full history 
              of deep dives and market updates directly on my LinkedIn profile.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="outline" className="btn-outline h-12 px-8" asChild>
                <a href="https://linkedin.com/in/yourprofile" target="_blank">
                  View Full Archive <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NewslettersPage;