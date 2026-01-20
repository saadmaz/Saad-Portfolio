import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  GraduationCap,
  MapPin,
  Trophy,
  Heart,
  Dumbbell,
  Globe,
  Star,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const educationList = [
  {
    institution: "University of Technology",
    institutionUrl: "https://university.edu",
    institutionLogo: "https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop&q=80",
    degree: "Bachelor of Science in Computer Science",
    period: "2021 - 2025 (Expected)",
    startDate: "2021-09-01",
    location: "San Francisco, CA",
    gpa: "3.9/4.0",
    description: "Specializing in software engineering and artificial intelligence. Leading student initiatives and contributing to open source projects alongside academic studies.",
    skills: ["Data Structures", "Machine Learning", "Database Systems", "Distributed Systems", "Java", "Python", "React"],
    associatedProjects: ["Distributed Key-Value Store", "Neural Network from Scratch", "Campus Event Manager"],
    associatedAwards: ["Dean's List (2022, 2023)", "HackMIT Best Hack 2023"],
    courses: ["Data Structures", "Machine Learning", "Database Systems", "Distributed Systems"], // Keeping for backward compat if needed, usually moved to skills
    activities: ["CS Student Association - VP", "ACM Chapter - Member"],
  },
  {
    institution: "Online Education Platform",
    institutionUrl: "https://coursera.org",
    institutionLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80",
    degree: "Full Stack Development Certificate",
    period: "2022",
    startDate: "2022-01-01",
    location: "Online",
    description: "Intensive 6-month bootcamp covering modern web development technologies including the MERN stack.",
    skills: ["React", "Node.js", "GraphQL", "MongoDB", "Express", "Redux"],
    associatedProjects: ["E-commerce Platform", "Task Management App"],
    associatedAwards: ["Top 5% of Cohort"],
    courses: ["React", "Node.js", "GraphQL", "MongoDB"],
    activities: ["Top 5% of cohort"],
  },
  {
    institution: "High School Name",
    institutionUrl: "https://highschool.edu",
    institutionLogo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=100&h=100&fit=crop&q=80",
    degree: "Advanced Level Studies",
    period: "2018 - 2021",
    startDate: "2018-01-01",
    location: "Colombo, Sri Lanka",
    gpa: "4.0/4.0",
    description: "Focused on physical sciences and mathematics. Graduated with high honors.",
    skills: ["Mathematics", "Physics", "Computer Science", "Problem Solving"],
    associatedProjects: ["Science Fair Robotics Project"],
    associatedAwards: ["Science Olympiad Winner", "School Prefect"],
    courses: ["Mathematics", "Physics", "Computer Science"],
    activities: ["Debate Club President", "Science Olympiad Winner"],
  },
];

const languages = [
  { name: "English", level: "Native", stars: 5 },
  { name: "Sinhala", level: "Native", stars: 5 },
  { name: "Tamil", level: "Conversational", stars: 3 },
];

const volunteer = [
  { org: "Code for Good", role: "Lead Mentor", period: "2022 - Present", description: "Teaching coding to underserved students", impact: "Taught 50+ students" },
  { org: "Tech4Youth", role: "Instructor", period: "2021 - 2022", description: "Weekly coding workshops", impact: "Led 40+ workshops" },
];

const extracurricular = [
  { name: "Photography Club", role: "Member", description: "Street and landscape photography" },
  { name: "Entrepreneurship Club", role: "President", description: "Organizing startup events" },
];

const sports = [
  { name: "Basketball", skill: "Teamwork", level: "Recreational" },
  { name: "Swimming", skill: "Discipline", level: "Competitive" },
  { name: "Chess", skill: "Strategic Thinking", level: "Club Level" },
];

const awards = [
  { title: "Dean's List", issuer: "University", year: "2023-2024", description: "Academic excellence" },
  { title: "Best Hack Award", issuer: "HackMIT", year: "2023", description: "Winner among 200+ teams" },
];

const StarRating = ({ filled }: { filled: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${star <= filled ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const AboutPage = () => {
  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <span className="section-title">About Me</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Beyond the Code</h1>
          </motion.div>

          {/* Education List with Dialogs */}
          <div className="mb-16" id="education">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-lg bg-accent/10">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Education</h2>
            </div>

            <div className="space-y-6">
              {[...educationList]
                .sort((a, b) => new Date(b.startDate || "").getTime() - new Date(a.startDate || "").getTime())
                .map((edu, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="bg-card rounded-xl border border-border p-6 cursor-pointer hover:border-accent/50 transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border">
                            <img
                              src={edu.institutionLogo}
                              alt={`${edu.institution} logo`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <div>
                                <h3 className="text-xl font-bold text-foreground">{edu.institution}</h3>
                                <p className="text-accent font-medium">{edu.degree}</p>
                              </div>
                              <Badge variant="secondary" className="w-fit">{edu.period}</Badge>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{edu.location}</span>
                              {edu.gpa && <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />GPA: {edu.gpa}</span>}
                            </div>

                            <div className="pt-2 flex flex-wrap gap-2">
                              {edu.skills.slice(0, 4).map(skill => (
                                <span key={skill} className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">{skill}</span>
                              ))}
                              {edu.skills.length > 4 && (
                                <span className="text-xs px-2 py-1 text-muted-foreground">+{edu.skills.length - 4} more</span>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground pt-2">Click to view details</p>
                          </div>
                        </div>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
                      <DialogHeader className="p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                            <img src={edu.institutionLogo} alt={edu.institution} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <DialogTitle className="text-2xl">{edu.institution}</DialogTitle>
                              <a
                                href={edu.institutionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-accent transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            <p className="text-accent font-medium">{edu.degree}</p>
                          </div>
                        </div>
                        <DialogDescription className="text-base flex items-center gap-2">
                          {edu.period} • {edu.location}
                        </DialogDescription>
                      </DialogHeader>

                      <ScrollArea className="flex-1 p-6 pt-2">
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold text-lg mb-2">About</h4>
                            <p className="text-muted-foreground leading-relaxed">{edu.description}</p>
                          </div>

                          {edu.skills.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Dumbbell className="w-4 h-4" /> Skills Acquired
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {edu.skills.map(skill => (
                                  <Badge key={skill} variant="outline" className="text-sm py-1">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {edu.associatedProjects && edu.associatedProjects.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Associated Projects
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-1">
                                {edu.associatedProjects.map(project => (
                                  <li key={project}>{project}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {edu.associatedAwards && edu.associatedAwards.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Trophy className="w-4 h-4" /> Awards & Honors
                              </h4>
                              <ul className="grid sm:grid-cols-2 gap-3">
                                {edu.associatedAwards.map(award => (
                                  <li key={award} className="bg-secondary/30 p-3 rounded-lg text-sm text-foreground flex items-center gap-2 border border-border/50">
                                    <Star className="w-3 h-3 text-accent" /> {award}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {edu.courses && edu.courses.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" /> Coursework
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {edu.courses.map(course => (
                                  <span key={course} className="text-xs border border-border px-2 py-1 rounded bg-secondary/10">
                                    {course}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                ))}
            </div>
          </div>

          {/* Languages with Star Rating */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div id="languages" className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6"><Globe className="w-5 h-5 text-accent" /><h3 className="font-display text-xl font-semibold text-foreground">Languages</h3></div>
              <ul className="space-y-5">
                {languages.map((lang) => (
                  <li key={lang.name} className="flex items-center justify-between">
                    <div><span className="font-medium text-foreground">{lang.name}</span><p className="text-xs text-muted-foreground">{lang.level}</p></div>
                    <StarRating filled={lang.stars} />
                  </li>
                ))}
              </ul>
            </div>

            <div id="sports" className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6"><Dumbbell className="w-5 h-5 text-accent" /><h3 className="font-display text-xl font-semibold text-foreground">Sports</h3></div>
              <ul className="space-y-4">
                {sports.map((sport) => (
                  <li key={sport.name} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                    <div><span className="font-medium text-foreground">{sport.name}</span><p className="text-xs text-muted-foreground">{sport.level}</p></div>
                    <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">{sport.skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Volunteer */}
          <div className="mb-16" id="volunteer">
            <div className="flex items-center gap-3 mb-6"><div className="p-3 rounded-lg bg-accent/10"><Heart className="w-6 h-6 text-accent" /></div><h2 className="font-display text-2xl font-bold text-foreground">Volunteer Work</h2></div>
            <div className="grid md:grid-cols-2 gap-6">
              {volunteer.map((vol) => (
                <div key={vol.org} className="bg-card rounded-xl border border-border p-6">
                  <h4 className="font-semibold text-foreground mb-1">{vol.org}</h4>
                  <p className="text-sm text-accent mb-3">{vol.role} • {vol.period}</p>
                  <p className="text-sm text-muted-foreground">{vol.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div id="awards">
            <div className="flex items-center gap-3 mb-6"><div className="p-3 rounded-lg bg-accent/10"><Trophy className="w-6 h-6 text-accent" /></div><h2 className="font-display text-2xl font-bold text-foreground">Awards</h2></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awards.map((award) => (
                <div key={award.title} className="bg-card rounded-xl border border-border p-5 card-hover">
                  <div className="flex items-start justify-between mb-2"><h4 className="font-medium text-foreground">{award.title}</h4><span className="text-xs text-accent font-medium">{award.year}</span></div>
                  <p className="text-sm text-muted-foreground">{award.issuer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
