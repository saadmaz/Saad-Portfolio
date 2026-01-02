import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Award, ExternalLink, Calendar } from "lucide-react";

const skillCategories = [
  {
    title: "Programming Languages",
    skills: [
      { name: "TypeScript", level: "Expert", years: 4 },
      { name: "JavaScript", level: "Expert", years: 5 },
      { name: "Python", level: "Advanced", years: 4 },
      { name: "Go", level: "Intermediate", years: 2 },
      { name: "SQL", level: "Advanced", years: 4 },
      { name: "Java", level: "Intermediate", years: 3 },
    ],
  },
  {
    title: "Frontend",
    skills: [
      { name: "React", level: "Expert", years: 4 },
      { name: "Next.js", level: "Advanced", years: 3 },
      { name: "Tailwind CSS", level: "Expert", years: 3 },
      { name: "Vue.js", level: "Intermediate", years: 2 },
      { name: "Framer Motion", level: "Advanced", years: 2 },
      { name: "HTML/CSS", level: "Expert", years: 5 },
    ],
  },
  {
    title: "Backend",
    skills: [
      { name: "Node.js", level: "Expert", years: 4 },
      { name: "FastAPI", level: "Advanced", years: 2 },
      { name: "Express.js", level: "Expert", years: 4 },
      { name: "GraphQL", level: "Advanced", years: 3 },
      { name: "REST APIs", level: "Expert", years: 5 },
      { name: "WebSockets", level: "Advanced", years: 2 },
    ],
  },
  {
    title: "Databases",
    skills: [
      { name: "PostgreSQL", level: "Advanced", years: 4 },
      { name: "MongoDB", level: "Advanced", years: 3 },
      { name: "Redis", level: "Intermediate", years: 2 },
      { name: "Prisma", level: "Advanced", years: 2 },
      { name: "DynamoDB", level: "Intermediate", years: 1 },
    ],
  },
  {
    title: "DevOps & Cloud",
    skills: [
      { name: "AWS", level: "Advanced", years: 3 },
      { name: "Docker", level: "Advanced", years: 3 },
      { name: "Git", level: "Expert", years: 5 },
      { name: "CI/CD", level: "Advanced", years: 3 },
      { name: "Kubernetes", level: "Intermediate", years: 1 },
      { name: "Terraform", level: "Intermediate", years: 1 },
    ],
  },
  {
    title: "Tools & Other",
    skills: [
      { name: "VS Code", level: "Expert", years: 5 },
      { name: "Figma", level: "Advanced", years: 3 },
      { name: "Jira", level: "Advanced", years: 3 },
      { name: "Notion", level: "Expert", years: 3 },
      { name: "Linux", level: "Advanced", years: 4 },
    ],
  },
];

const courses = [
  {
    name: "AWS Solutions Architect Associate",
    issuer: "Amazon Web Services",
    date: "2024",
    credentialUrl: "#",
    tags: ["Cloud", "Architecture"],
  },
  {
    name: "Machine Learning Specialization",
    issuer: "Stanford (Coursera)",
    date: "2023",
    credentialUrl: "#",
    tags: ["AI/ML", "Python"],
  },
  {
    name: "System Design for Interviews",
    issuer: "educative.io",
    date: "2023",
    credentialUrl: "#",
    tags: ["System Design", "Architecture"],
  },
  {
    name: "Full Stack Open",
    issuer: "University of Helsinki",
    date: "2022",
    credentialUrl: "#",
    tags: ["React", "Node.js", "GraphQL"],
  },
  {
    name: "CS50: Introduction to Computer Science",
    issuer: "Harvard (edX)",
    date: "2021",
    credentialUrl: "#",
    tags: ["Fundamentals", "C", "Python"],
  },
];

const levelColors: Record<string, string> = {
  Expert: "bg-accent text-accent-foreground",
  Advanced: "bg-green-500/20 text-green-700",
  Intermediate: "bg-yellow-500/20 text-yellow-700",
};

const SkillsPage = () => {
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
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className="bg-card rounded-xl border border-border p-6 h-full">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    {category.title}
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
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[skill.level]}`}>
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
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-lg bg-accent/10">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Licenses & Courses
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course, index) => (
                <motion.div
                  key={course.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <a
                    href={course.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-card rounded-xl border border-border p-5 card-hover group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {course.name}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {course.issuer}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {course.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {course.date}
                      </span>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default SkillsPage;
