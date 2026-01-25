import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { TrendingUp, Rocket, BookOpen, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ----------------------------------------------------------------------
// 1. TYPE DEFINITIONS (TypeScript Interfaces)
// ----------------------------------------------------------------------
interface NewsletterIssue {
  id: number;
  title: string;
  date: string;
  linkedinUrl: string; // The specific URL for this edition
  content: string;
  isLatest: boolean;
}

interface NewsletterData {
  newsletters: NewsletterIssue[];
}

// ----------------------------------------------------------------------
// 2. DATA IMPORTS
// ----------------------------------------------------------------------
// Using the capital 'N' as per your folder structure in portfolio-app
import cseRawData from "../../portfolio-app/src/assets/Newsletter/cse.json";
import founderRawData from "../../portfolio-app/src/assets/Newsletter/founder.json";

// Casting to our Interface so TypeScript recognizes the .newsletters array
const cseData = cseRawData as NewsletterData;
const founderData = founderRawData as NewsletterData;

// ----------------------------------------------------------------------
// 3. COMPONENT CONFIGURATION (Static UI Details)
// ----------------------------------------------------------------------
const newsletterConfigs = [
  {
    id: "cse-newsroom", // Matches the logic in getLatestFromSource
    title: "The CSE Newsroom",
    icon: TrendingUp,
    description: "Your weekly pulse on the Sri Lankan stock market. I break down Colombo Stock Exchange trends, company earnings, and investment opportunities in plain English.",
    topics: ["Market Trends", "CSE Analysis", "Equity Research"],
    audience: "Investors & Traders",
    frequency: "Weekly",
    subscribers: "6,200+",
    color: "from-blue-600 to-cyan-500",
    archiveUrl: "https://www.linkedin.com/newsletters/cse-news-room-7337874498160848896/",
  },
  {
    id: "founders-brief",
    title: "Founders’ Brief",
    icon: Rocket,
    description: "Deep dives into the journeys of Sri Lankan and global entrepreneurs. No fluff—just the raw stories of how they built, failed, and eventually scaled.",
    topics: ["Founder Interviews", "Pivot Stories", "Fundraising"],
    audience: "Aspiring Founders & Operators",
    frequency: "Bi-weekly Fridays",
    subscribers: "1,800+",
    color: "from-orange-500 to-red-600",
    archiveUrl: "https://www.linkedin.com/newsletters/founders-brief-id-here/",
  },
];

const NewslettersPage = () => {
  // ----------------------------------------------------------------------
  // 4. SCRAPING & UTILITY LOGIC
  // ----------------------------------------------------------------------
  
  /**
   * getLatestFromSource: Selects the correct JSON file based on the config ID
   * and extracts the entry where isLatest is true.
   */
  const getLatestFromSource = (configId: string): NewsletterIssue => {
    // Determine which JSON file to scrape
    const source = configId === "cse-newsroom" ? cseData : founderData;
    const list = source.newsletters || [];
    
    // 1. Find by isLatest flag
    const latestByFlag = list.find(item => item.isLatest === true);
    if (latestByFlag) return latestByFlag;

    // 2. Fallback: Sort by ID descending
    const sorted = [...list].sort((a, b) => b.id - a.id);
    return sorted[0] || { 
      id: 0, 
      title: "Coming Soon", 
      date: "TBD", 
      linkedinUrl: "#", 
      content: "", 
      isLatest: false 
    };
  };

  const handleRedirect = (url: string, title: string) => {
    if (url === "#") return;
    toast.info(`Opening ${title} on LinkedIn...`);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          
          {/* HEADER SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="section-title">Knowledge Hub</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Newsletters
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              I curate high-signal insights for the Sri Lankan ecosystem. 
              Stay ahead with financial mechanics and raw founder journeys.
            </p>
          </motion.div>

          {/* NEWSLETTER CARDS GRID */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {newsletterConfigs.map((config, index) => {
              // Extract the latest data for THIS specific card
              const latestIssue = getLatestFromSource(config.id);

              return (
                <motion.div
                  key={config.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="group"
                >
                  <div className="bg-card rounded-2xl border border-border overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-accent/30">
                    <div className={`h-2 bg-gradient-to-r ${config.color}`} />
                    
                    <div className="p-8 flex-1 flex flex-col">
                      {/* Card Header */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-4 rounded-2xl bg-accent/5 group-hover:bg-accent/10 transition-colors">
                          <config.icon className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                            {config.title}
                          </h2>
                          <p className="text-sm font-medium text-accent">{config.frequency}</p>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {config.description}
                      </p>

                      {/* Stats Section */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Target</p>
                          <p className="text-xs font-medium text-foreground">{config.audience}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Subscribers</p>
                          <p className="text-sm font-bold text-accent">{config.subscribers}</p>
                        </div>
                      </div>

                      {/* CLICKABLE LATEST EDITION BOX 
                          This pulls the specific linkedinUrl from your JSON file 
                      */}
                      <button 
                        onClick={() => handleRedirect(latestIssue.linkedinUrl, latestIssue.title)}
                        className="w-full text-left p-5 rounded-xl border border-dashed border-border mb-8 bg-accent/5 hover:bg-accent/10 hover:border-accent/30 transition-all group/issue"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3 h-3 text-accent" />
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Most Recent Edition</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover/issue:text-accent transition-colors" />
                        </div>
                        <p className="font-semibold text-foreground text-sm group-hover/issue:text-accent transition-colors">
                          {latestIssue.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">Released on {latestIssue.date}</p>
                      </button>

                      {/* MAIN SUBSCRIBE CTA */}
                      <div className="mt-auto">
                        <Button 
                          asChild
                          className="btn-primary w-full h-12 gap-2 text-md shadow-lg shadow-accent/20"
                        >
                          <a 
                            href={latestIssue.linkedinUrl}
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => handleRedirect(latestIssue.linkedinUrl, config.title)}
                          ><ExternalLink className="w-4 h-4" />Read & Subscribe on LinkedIn</a>
                        </Button>
                        <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-tighter">
                          Joins {config.subscribers} professionals
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* BOTTOM ARCHIVE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 text-center max-w-3xl mx-auto p-12 rounded-3xl bg-secondary/20 border border-border"
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Browse the Archives
            </h3>
            <p className="text-muted-foreground mb-8">
              Every issue is a permanent resource. Browse through the full history 
              of deep dives and market updates directly on my LinkedIn profile.
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