import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Award, ExternalLink, Calendar, FileText, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define the shape of your JSON data
interface Skill {
  name: string;
  level: string;
  years: number;
}

interface SkillCategory {
  category: string;
  skills: Skill[];
}

// Sample certificates
const certificates = [
  {
    id: "1",
    name: "AWS Solutions Architect Associate",
    issuer: "Amazon Web Services",
    date: "2024",
    credentialUrl: "#",
    pdfUrl: "/certificates/aws-sa.pdf",
    tags: ["Cloud", "Architecture"],
    category: "Cloud",
  },
  {
    id: "2",
    name: "Machine Learning Specialization",
    issuer: "Stanford (Coursera)",
    date: "2023",
    credentialUrl: "#",
    pdfUrl: "/certificates/ml-stanford.pdf",
    tags: ["AI/ML", "Python"],
    category: "AI/ML",
  },
  {
    id: "3",
    name: "System Design for Interviews",
    issuer: "educative.io",
    date: "2023",
    credentialUrl: "#",
    pdfUrl: "/certificates/system-design.pdf",
    tags: ["System Design", "Architecture"],
    category: "System Design",
  },
  {
    id: "4",
    name: "Full Stack Open",
    issuer: "University of Helsinki",
    date: "2022",
    credentialUrl: "#",
    pdfUrl: "/certificates/fullstack-open.pdf",
    tags: ["React", "Node.js", "GraphQL"],
    category: "Web Development",
  },
  {
    id: "5",
    name: "CS50: Introduction to Computer Science",
    issuer: "Harvard (edX)",
    date: "2021",
    credentialUrl: "#",
    pdfUrl: "/certificates/cs50.pdf",
    tags: ["Fundamentals", "C", "Python"],
    category: "Fundamentals",
  },
  {
    id: "6",
    name: "Google Cloud Professional Data Engineer",
    issuer: "Google Cloud",
    date: "2024",
    credentialUrl: "#",
    pdfUrl: "/certificates/gcp-data.pdf",
    tags: ["Cloud", "Data Engineering"],
    category: "Cloud",
  },
  {
    id: "7",
    name: "Certified Kubernetes Administrator",
    issuer: "CNCF",
    date: "2024",
    credentialUrl: "#",
    pdfUrl: "/certificates/cka.pdf",
    tags: ["DevOps", "Kubernetes"],
    category: "DevOps",
  },
  {
    id: "8",
    name: "Deep Learning Specialization",
    issuer: "deeplearning.ai",
    date: "2023",
    credentialUrl: "#",
    pdfUrl: "/certificates/deep-learning.pdf",
    tags: ["AI/ML", "Neural Networks"],
    category: "AI/ML",
  },
  {
    id: "meta-frontend",
    title: "Meta Front-End Developer",
    name: "Meta Front-End Developer",
    issuer: "Meta",
    date: "2023",
    credentialUrl: "#",
    pdfUrl: "/certificates/meta-frontend.pdf",
    tags: ["React", "UI/UX"],
    category: "Frontend",
  },
  {
    id: "tensorflow",
    title: "TensorFlow Developer Certificate",
    name: "TensorFlow Developer Certificate",
    issuer: "Google",
    date: "2023",
    credentialUrl: "#",
    pdfUrl: "/certificates/tensorflow.pdf",
    tags: ["Machine Learning", "Python"],
    category: "AI/ML",
  },
  {
    id: "mongo",
    title: "MongoDB Certified Developer",
    name: "MongoDB Certified Developer",
    issuer: "MongoDB University",
    date: "2023",
    credentialUrl: "#",
    pdfUrl: "/certificates/mongodb.pdf",
    tags: ["NoSQL", "Data Modeling"],
    category: "Databases",
  },
  {
    id: "github-actions",
    title: "GitHub Actions Certification",
    name: "GitHub Actions Certification",
    issuer: "GitHub",
    date: "2024",
    credentialUrl: "#",
    pdfUrl: "/certificates/github-actions.pdf",
    tags: ["CI/CD", "Automation"],
    category: "DevOps",
  },
  {
    id: "docker",
    title: "Docker Certified Associate",
    name: "Docker Certified Associate",
    issuer: "Docker",
    date: "2024",
    credentialUrl: "#",
    pdfUrl: "/certificates/docker.pdf",
    tags: ["Containers", "Infrastructure"],
    category: "DevOps",
  },
];

const levelColors: Record<string, string> = {
  Expert: "bg-accent text-accent-foreground",
  Advanced: "bg-green-500/20 text-green-700 dark:text-green-400",
  Intermediate: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
};

const categories = ["All", ...Array.from(new Set(certificates.map(c => c.category)))];

const SkillsPage = () => {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCerts, setShowAllCerts] = useState(false);
  const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null);
  const [searchParams] = useSearchParams();

  // New Effect to fetch skills from src/data/skills.json
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/src/data/skills.json");
        const data = await response.json();
        setSkillCategories(data);
      } catch (error) {
        console.error("Error loading skills.json:", error);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const certId = searchParams.get("certId");
    if (certId) {
      const cert = certificates.find(c => c.id === certId);
      if (cert) {
        setSelectedCert(cert);
      }
    }
  }, [searchParams]);

  const filteredCertificates = certificates.filter(cert => {
    const matchesCategory = selectedCategory === "All" || cert.category === selectedCategory;
    const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const displayedCertificates = showAllCerts ? filteredCertificates : filteredCertificates.slice(0, 6);

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="section-title">Skills & Expertise</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Technical Toolkit
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              A comprehensive overview of my technical skills, organized by category.
              I'm always learning and expanding my expertise.
            </p>
          </motion.div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20" id="stack">
            {skillCategories.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className="bg-card rounded-xl border border-border p-6 h-full">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    {category.category}
                  </h3>
                  <ul className="space-y-3">
                    {category.skills.map((skill) => (
                      <li
                        key={skill.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">{skill.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {skill.years}y
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[skill.level] || "bg-secondary text-muted-foreground"}`}>
                          {skill.level}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Licenses & Courses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            id="courses"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-accent/10">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Licenses & Certificates
                </h2>
                <p className="text-sm text-muted-foreground">
                  {certificates.length}+ professional certifications
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${selectedCategory === category
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Certificates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {displayedCertificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Dialog>
                      <DialogTrigger asChild>
                        <div
                          className="bg-card rounded-xl border border-border p-5 card-hover cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                              {cert.name}
                            </h4>
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {cert.issuer}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {cert.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {cert.date}
                            </span>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle className="text-xl">{cert.name}</DialogTitle>
                          <p className="text-muted-foreground">{cert.issuer} • {cert.date}</p>
                        </DialogHeader>
                        <div className="mt-4">
                          <div className="aspect-[1.414/1] bg-muted rounded-lg flex items-center justify-center border border-border overflow-hidden">
                            {cert.pdfUrl ? (
                              <iframe
                                src={cert.pdfUrl}
                                className="w-full h-full"
                                title={cert.name}
                              />
                            ) : (
                              <div className="text-center p-8">
                                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                  Certificate PDF will be displayed here
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3 mt-4">
                            {cert.credentialUrl && (
                              <Button asChild variant="outline" size="sm">
                                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Verify Credential
                                </a>
                              </Button>
                            )}
                            <div className="flex flex-wrap gap-2 flex-1">
                              {cert.tags.map((tag) => (
                                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Show More/Less Button */}
            {filteredCertificates.length > 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-center"
              >
                <Button
                  variant="outline"
                  onClick={() => setShowAllCerts(!showAllCerts)}
                  className="gap-2"
                >
                  {showAllCerts ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show All {filteredCertificates.length} Certificates <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {filteredCertificates.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certificates found matching your search.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default SkillsPage;
