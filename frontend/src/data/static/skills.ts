import { SkillSet } from '../../types';

export const skillSets: SkillSet[] = [
  {
    category: "Programming Languages",
    skills: [
      { name: "Java", level: "Advance", years: 3 },
      { name: "Python", level: "Advance", years: 3 },
      { name: "JavaScript", level: "Intermediate", years: 2 },
      { name: "TypeScript", level: "Expert", years: 3 },
      { name: "Rust", level: "Beginner", years: 1 }
    ]
  },
  {
    category: "Frontend Development",
    skills: [
      { name: "HTML5 & CSS3", level: "Expert", years: 5 },
      { name: "React.js", level: "Expert", years: 3 },
      { name: "Tailwind CSS", level: "Advance", years: 3 },
      { name: "Vue.js", level: "Beginner", years: 1 },
      { name: "Responsive Web Design", level: "Expert", years: 4 }
    ]
  },
  {
    category: "Backend Development",
    skills: [
      { name: "Node.js", level: "Advance", years: 3 },
      { name: "Express.js", level: "Intermediate", years: 3 },
      { name: "RESTful Services", level: "Advance", years: 3 },
      { name: "Authentication & Authorization", level: "Intermediate", years: 2 },
      { name: "Server-Side Business Logic", level: "Intermediate", years: 3 }
    ]
  },
  {
    category: "Database Technologies",
    skills: [
      { name: "MySQL", level: "Advance", years: 3 },
      { name: "PostgreSQL", level: "Intermediate", years: 2 },
      { name: "MongoDB", level: "Advance", years: 2 },
      { name: "Firebase", level: "Beginner", years: 2 },
      { name: "Supabase", level: "Advance", years: 2 }
    ]
  },
  {  
    category: "DevOps & Cloud",
    skills: [
      { name: "AWS (EC2, S3, IAM)", level: "Intermediate", years: 2 },
      { name: "Docker", level: "Beginner", years: 1 },
      { name: "CI/CD Pipelines", level: "Intermediate", years: 3 },
      { name: "Environment Configuration", level: "Intermediate", years: 2 },
      { name: "Cloud Deployment & Monitoring", level: "Beginner", years: 1 }
    ]
  }
];
