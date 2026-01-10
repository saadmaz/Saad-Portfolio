import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Calendar, Building, MapPin, ExternalLink } from "lucide-react";

const experiences = [
  {
    id: 1,
    role: "Co-Founder & CTO",
    company: "Startup XYZ",
    companyUrl: "https://startupxyz.com",
    companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&q=80",
    location: "San Francisco, CA",
    period: "2023 - Present",
    type: "Full-time",
    description: "Leading technical strategy and product development for an AI-powered productivity platform serving 10K+ users.",
    responsibilities: [
      "Architected and built the core product from 0 to 1, achieving 99.9% uptime",
      "Scaled infrastructure to handle 1M+ daily API requests using AWS",
      "Led a distributed team of 5 engineers across frontend and backend",
      "Established engineering culture, code review practices, and CI/CD pipelines",
      "Worked directly with customers to iterate on product features"
    ],
    impact: "Grew user base from 0 to 10K+ in 6 months, secured $2M seed funding",
    tech: ["React", "Node.js", "AWS", "PostgreSQL", "OpenAI", "Docker"],
  },
  {
    id: 2,
    role: "Software Engineer Intern",
    company: "Tech Corp",
    companyUrl: "https://techcorp.com",
    companyLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80",
    location: "Seattle, WA",
    period: "Summer 2023",
    type: "Internship",
    description: "Developed key features for the customer-facing dashboard used by Fortune 500 clients.",
    responsibilities: [
      "Implemented real-time collaboration features using WebSockets",
      "Reduced page load time by 40% through performance optimization",
      "Contributed to open-source internal tools with 500+ GitHub stars",
      "Participated in on-call rotation and incident response"
    ],
    impact: "Received return offer and strong recommendation from hiring manager",
    tech: ["TypeScript", "React", "GraphQL", "Redis", "Kubernetes"],
  },
  {
    id: 3,
    role: "Founding Engineer",
    company: "PreviousStartup",
    companyUrl: "https://previousstartup.com",
    companyLogo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop&q=80",
    location: "Remote",
    period: "2022 - 2023",
    type: "Full-time",
    description: "First engineering hire at an early-stage startup focused on developer tools.",
    responsibilities: [
      "Designed and built the entire backend infrastructure from scratch",
      "Integrated with 15+ third-party APIs including GitHub, Slack, and Jira",
      "Implemented authentication and authorization using OAuth 2.0",
      "Built admin dashboard for managing enterprise customers"
    ],
    impact: "Platform processed 50K+ developer hours, helped raise $500K seed round",
    tech: ["Python", "FastAPI", "Docker", "MongoDB", "GitHub API"],
  },
  {
    id: 4,
    role: "Teaching Assistant",
    company: "University of Technology",
    companyUrl: "https://university.edu",
    companyLogo: "https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop&q=80",
    location: "San Francisco, CA",
    period: "2021 - 2022",
    type: "Part-time",
    description: "Assisted professors in teaching Data Structures and Algorithms to 200+ students.",
    responsibilities: [
      "Led weekly lab sessions and office hours",
      "Graded assignments and provided detailed feedback",
      "Created supplementary learning materials and practice problems",
      "Mentored struggling students through one-on-one sessions"
    ],
    impact: "Received 4.8/5 rating from student evaluations",
    tech: ["Java", "Python", "Data Structures", "Algorithms"],
  },
];

const ExperiencePage = () => {
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
            <span className="section-title">Work Experience</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              My Professional Journey
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              A timeline of my professional experience, from internships to founding startups. 
              Each role has shaped my approach to building products.
            </p>
          </motion.div>

          {/* Experience Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative mb-12 md:mb-16 ${
                  index % 2 === 0 ? "md:pr-[52%]" : "md:pl-[52%]"
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 top-8 w-3 h-3 rounded-full bg-accent -translate-x-1/2 hidden md:block" />

                <div className="bg-card rounded-xl border border-border card-hover p-6 md:p-8">
                  {/* Company Logo & Meta Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <a 
                      href={exp.companyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border hover:border-accent transition-colors"
                    >
                      <img 
                        src={exp.companyLogo} 
                        alt={`${exp.company} logo`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {exp.period}
                        </span>
                        <a 
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-accent transition-colors"
                        >
                          <Building className="w-4 h-4" />
                          {exp.company}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {exp.location}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                          {exp.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {exp.role}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {exp.description}
                  </p>

                  {/* Responsibilities */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Impact */}
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 mb-6">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                      Impact
                    </span>
                    <p className="text-sm text-foreground mt-1">{exp.impact}</p>
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {exp.tech.map((tech) => (
                      <span key={tech} className="tech-chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ExperiencePage;
