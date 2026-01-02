import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Mail, Send, Users, Zap, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const newsletters = [
  {
    id: "tech",
    title: "Tech Insights Weekly",
    icon: Zap,
    description: "Deep dives into emerging technologies, engineering best practices, and lessons from building products at scale.",
    topics: ["Software Architecture", "AI/ML Trends", "Performance Optimization", "Developer Tools"],
    audience: "Engineers, CTOs, Tech Enthusiasts",
    frequency: "Every Tuesday",
    subscribers: "2,500+",
    color: "from-accent to-blue-accent",
    latestIssue: {
      title: "Why RAG is Replacing Fine-Tuning",
      date: "December 17, 2024",
    },
  },
  {
    id: "startup",
    title: "Startup Chronicles",
    icon: BookOpen,
    description: "Behind-the-scenes stories of building startups, fundraising insights, growth tactics, and founder lessons learned.",
    topics: ["Fundraising", "Product-Market Fit", "Team Building", "Growth Strategies"],
    audience: "Founders, VCs, Operators",
    frequency: "Every other Friday",
    subscribers: "1,800+",
    color: "from-green-500 to-accent",
    latestIssue: {
      title: "The Art of the Cold Email",
      date: "December 13, 2024",
    },
  },
];

const NewslettersPage = () => {
  const [email, setEmail] = useState("");
  const [selectedNewsletter, setSelectedNewsletter] = useState<string | null>(null);

  const handleSubscribe = (newsletterId: string) => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    toast.success(`Successfully subscribed to ${newsletters.find(n => n.id === newsletterId)?.title}!`);
    setEmail("");
    setSelectedNewsletter(null);
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          {/* Header */}
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
            <p className="text-muted-foreground max-w-2xl mx-auto">
              I write two newsletters sharing insights on technology and entrepreneurship. 
              Join thousands of readers who learn something new every week.
            </p>
          </motion.div>

          {/* Newsletter Cards */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {newsletters.map((newsletter, index) => (
              <motion.div
                key={newsletter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                id={newsletter.id}
              >
                <div className="bg-card rounded-xl border border-border overflow-hidden h-full flex flex-col">
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${newsletter.color}`} />
                  
                  <div className="p-8 flex-1 flex flex-col">
                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-accent/10">
                        <newsletter.icon className="w-8 h-8 text-accent" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                          {newsletter.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">{newsletter.frequency}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6">
                      {newsletter.description}
                    </p>

                    {/* Topics */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-foreground mb-3">Topics covered:</p>
                      <div className="flex flex-wrap gap-2">
                        {newsletter.topics.map((topic) => (
                          <span key={topic} className="tech-chip">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Audience</p>
                        <p className="text-sm font-medium text-foreground">{newsletter.audience}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Subscribers</p>
                        <p className="text-sm font-medium text-accent">{newsletter.subscribers}</p>
                      </div>
                    </div>

                    {/* Latest Issue */}
                    <div className="p-4 rounded-lg border border-border mb-6">
                      <p className="text-xs text-muted-foreground mb-2">Latest Issue</p>
                      <p className="font-medium text-foreground">{newsletter.latestIssue.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{newsletter.latestIssue.date}</p>
                    </div>

                    {/* Subscribe Form */}
                    <div className="mt-auto">
                      {selectedNewsletter === newsletter.id ? (
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => handleSubscribe(newsletter.id)}
                            className="btn-primary gap-2"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => setSelectedNewsletter(newsletter.id)}
                          className="btn-primary w-full gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Subscribe Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Archive Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20 text-center"
          >
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              Browse the Archives
            </h3>
            <p className="text-muted-foreground mb-6">
              Missed some issues? Browse through the complete archive of past newsletters.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="btn-outline gap-2">
                Tech Insights Archive
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="btn-outline gap-2">
                Startup Chronicles Archive
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NewslettersPage;
