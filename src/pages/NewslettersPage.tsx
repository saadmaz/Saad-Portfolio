import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { TrendingUp, Rocket, BookOpen, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ----------------------------------------------------------------------
// 1. TYPE DEFINITIONS
// ----------------------------------------------------------------------
// These interfaces tell TypeScript exactly what the JSON structure looks like.
interface NewsletterIssue {
  id: number;
  title: string;
  date: string;
  linkedinUrl: string;
  content: string;
  isLatest: boolean;
}

interface NewsletterData {
  newsletters: NewsletterIssue[];
}

// ----------------------------------------------------------------------
// 2. DATA IMPORT & DYNAMIC SCRAPING LOGIC
// ----------------------------------------------------------------------
/** * Importing from the workplace portfolio-app. 
 * 'as NewsletterData' fixes the type error: Property 'newsletters' does not exist on type '{}'.
 */
import newsletterRawData from "../../portfolio-app/src/assets/Newsletter/data.json";
const newsletterData = newsletterRawData as NewsletterData;

/**
 * getDynamicLatestIssue: 
 * Scrapes the imported JSON for the entry marked 'isLatest: true'.
 * If multiple exist, or none, it falls back to the highest ID.
 */
const getDynamicLatestIssue = () => {
  const list = newsletterData.newsletters || [];
  
  // 1. Try to find the specific item marked as latest by the boolean flag
  const latestByFlag = list.find(item => item.isLatest === true);
  if (latestByFlag) return latestByFlag;

  // 2. Fallback: Sort by ID descending if no flag is set and take the first item
  const sorted = [...list].sort((a, b) => b.id - a.id);
  
  return sorted[0] || { title: "Latest issue coming soon", date: "TBD" };
};

// ----------------------------------------------------------------------
// 3. STATIC COMPONENT CONFIGURATION
// ----------------------------------------------------------------------
const newsletterConfigs = [
  {
    id: "cse-newsroom",
    title: "The CSE Newsroom",
    icon: TrendingUp,
    description: "Your weekly pulse on the Sri Lankan stock market. I break down Colombo Stock Exchange trends, company earnings, and investment opportunities in plain English.",
    topics: ["Market Trends", "CSE Analysis", "Equity Research", "Investor Education"],
    audience: "Investors, Traders, & Finance Students",
    frequency: "Weekly",
    subscribers: "6,200+",
    color: "from-blue-600 to-cyan-500",
    linkedInUrl: "https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7337874498160848896",
  },
  {
    id: "startup-chronicles",
    title: "Startup Chronicles",
    icon: Rocket,
    description: "Deep dives into the journeys of Sri Lankan and global entrepreneurs. No fluff—just the raw stories of how they built, failed, and eventually scaled.",
    topics: ["Founder Interviews", "Pivot Stories", "Fundraising", "Early-stage Growth"],
    audience: "Aspiring Founders & Operators",
    frequency: "Bi-weekly Fridays",
    subscribers: "1,800+",
    color: "from-orange-500 to-red-600",
    linkedInUrl: "https://www.linkedin.com/newsletters/your-startup-newsletter-id",
  },
];

const NewslettersPage = () => {
  // ----------------------------------------------------------------------
  // 4. UTILITY HANDLERS
  // ----------------------------------------------------------------------
  const handleSubscribeRedirect = (url: string, title: string) => {
    toast.info(`Opening ${title} on LinkedIn...`);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Fetch the latest issue data from the JSON file
  const latestIssue = getDynamicLatestIssue();

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          
          {/* PAGE HEADER: Defines the 'Knowledge Hub' intent */}
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
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              I curate high-signal insights for the Sri Lankan ecosystem. 
              Whether it's the financial mechanics of the <strong>CSE</strong> or the grit of 
              <strong> Founder Stories</strong>, I write to keep you ahead.
            </p>
          </motion.div>

          {/* NEWSLETTER CARDS GRID: Side-by-side comparison */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {newsletterConfigs.map((newsletter, index) => (
              <motion.div
                key={newsletter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group"
              >
                <div className="bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-accent/30">
                  
                  {/* Visual Top-Bar using config color */}
                  <div className={`h-2 bg-gradient-to-r ${newsletter.color}`} />
                  
                  <div className="p-8 flex-1 flex flex-col">
                    {/* Header: Icon & Title */}
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

                    {/* Content: Mission Description */}
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {newsletter.description}
                    </p>

                    {/* Content: Focus Area Chips */}
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

                    {/* Meta: Audience & Subscriber Stats */}
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

                    {/* Dynamic Section: Scraped Latest Edition from data.json */}
                    <div className="p-5 rounded-xl border border-dashed border-border mb-8 bg-accent/5">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-3 h-3 text-accent" />
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Most Recent Edition</p>
                      </div>
                      <p className="font-semibold text-foreground text-sm group-hover:text-accent transition-colors">
                        {latestIssue.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Released on {latestIssue.date}
                      </p>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-auto">
                      {/* STRICT SYNTAX: No spaces between <Button> and <a> tags 
                        to prevent the "React.Children.only" crash in production.
                      */}
                      <Button 
                        asChild
                        className="btn-primary w-full h-12 gap-2 text-md shadow-lg shadow-accent/20"
                      >
                        <a 
                          href={newsletter.linkedInUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => handleSubscribeRedirect(newsletter.linkedInUrl, newsletter.title)}
                        ><ExternalLink className="w-4 h-4" />Read & Subscribe on LinkedIn</a>
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

          {/* FOOTER ARCHIVE: Directs users to the full history on LinkedIn */}
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
              More than just an update, each issue is a permanent resource. 
              Browse through my full history of deep dives and market updates directly on LinkedIn 
              to see how we track the evolution of the Sri Lankan startup and financial ecosystems.
            </p>
            <div className="flex justify-center">
              <Button variant="outline" className="btn-outline h-12 px-8" asChild>
                <a 
                  href="https://www.linkedin.com/newsletters/cse-news-room-7337874498160848896/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >View Full Archive<ArrowRight className="ml-2 w-4 h-4" /></a>
              </Button>
            </div>
          </motion.div>

        </div>
      </section>
    </Layout>
  );
};

export default NewslettersPage;