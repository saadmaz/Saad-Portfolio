import { m } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { Mail, Phone, MapPin, Github, Linkedin, X, Send, Calendar, Clock, Globe, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useContactMutation } from "@/shared/hooks/useCommon";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactMutation = useContactMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await contactMutation.mutateAsync(formData);
      toast.success("Message sent successfully! I'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again later.");
    }
  };

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/contact"].title}
        description={PAGE_SEO["/contact"].description}
        url={`${BASE_URL}/contact`}
        keywords="hire freelance developer Sri Lanka, hire full-stack developer Colombo, freelance React developer, Flutter developer for hire"
      />
      <section className="section-padding">
        <div className="section-container">
          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="section-title">Contact</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Let's Connect
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind, want to collaborate, or just want to say hello? 
              I'd love to hear from you. Fill out the form or reach out directly.
            </p>
          </m.div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Info */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-8"
            >
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                  Get in Touch
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a 
                      href="mailto:saadmazaa@gmail.com"
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
                    >
                      <div className="p-3 rounded-lg bg-accent/10">
                        <Mail className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">saadmazaa@gmail.com</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="tel:+94720135801"
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
                    >
                      <div className="p-3 rounded-lg bg-accent/10">
                        <Phone className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">+(94) 720 135 801</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                      <div className="p-3 rounded-lg bg-accent/10">
                        <MapPin className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">Colombo, Sri Lanka</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  Follow Me
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { href: "https://github.com/saadmaz/",         Icon: Github,   label: "GitHub" },
                    { href: "https://linkedin.com/in/saadmaz/",    Icon: Linkedin, label: "LinkedIn" },
                    { href: "https://instagram.com/saadmazhar_",   Icon: Instagram, label: "Instagram"},
                    { href: "https://facebook.com/saadmazhar",     Icon: Facebook, label: "Facebook"},
                    { href: "https://x.com/SaadMazhar_",           Icon: X,        label: "X (Twitter)" },
                  ].map(({ href, Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 hover:bg-accent/10 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Availability card */}
              <div className="p-5 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-accent" />
                  <h4 className="text-sm font-semibold text-foreground">Availability</h4>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-accent shrink-0" />
                  <span>Sri Lanka Standard Time (UTC+5:30)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-emerald-500 font-medium">Open to freelance &amp; full-time roles</span>
                </div>
              </div>

              {/* Calendly embedded inline widget */}
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-border">
                  <Calendar className="w-4 h-4 text-accent" />
                  <h4 className="text-sm font-semibold text-foreground">Book a 30-min Call</h4>
                </div>
                {/* Calendly inline widget - loads their script via iframe URL */}
                <iframe
                  src="https://calendly.com/saadmaz/30min?embed_domain=saadmaz.com&embed_type=Inline&hide_gdpr_banner=1&background_color=050505&text_color=ffffff&primary_color=2dd4bf"
                  title="Schedule a meeting with Saad Mazhar"
                  className="w-full border-0"
                  style={{ minHeight: "600px" }}
                  loading="lazy"
                />
              </div>
            </m.div>

            {/* Contact Form */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-card rounded-xl border border-border p-8">
                <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                  Send a Message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@youremail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="btn-primary w-full gap-2"
                    disabled={contactMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
