import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Send, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! I'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
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
            <span className="section-title">Contact</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Let's Connect
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind, want to collaborate, or just want to say hello? 
              I'd love to hear from you. Fill out the form or reach out directly.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Info */}
            <motion.div
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
                <div className="flex items-center gap-3">
                  <a 
                    href="https://github.com/saaadmaz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 hover:bg-accent/10 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>


                  <a 
                    href="https://linkedin.com/in/saadmaz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 hover:bg-accent/10 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-card border border-border hover:border-accent/50 hover:bg-accent/10 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* This block renders a call-to-action card for live consultations. */}
              {/* On click, it triggers a navigation to Calendly for direct meeting scheduling. */}
              <div className="p-6 rounded-xl bg-primary text-primary-foreground">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5" />
                  <h4 className="font-semibold text-blue">Schedule a Call</h4>
                </div>
                <p className="text-sm text-primary-foreground/80 mb-4">
                  Prefer to chat live? Book a 30-minute meeting through this link and let's discuss your project.
                </p>
                
                {/* Using asChild allows the Button to render as an 'a' tag while keeping the secondary styles */}
                <Button variant="secondary" className="w-full" asChild>
                  <a 
                    href="https://calendly.com/saadmaz/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Book a Meeting
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
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
                  <Button type="submit" className="btn-primary w-full gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
