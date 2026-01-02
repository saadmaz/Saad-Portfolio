import { motion } from "framer-motion";
import { GraduationCap, MapPin, Calendar, Trophy, Users, Dumbbell, Globe, Heart } from "lucide-react";

const education = {
  institution: "University of Technology",
  degree: "Bachelor of Science in Computer Science",
  period: "2021 - 2025 (Expected)",
  location: "San Francisco, CA",
  gpa: "3.9/4.0",
  courses: ["Data Structures", "Algorithms", "Machine Learning", "Systems Design", "Database Systems"],
};

const events = [
  { title: "TechCrunch Disrupt", type: "Speaker", year: "2024" },
  { title: "Google I/O", type: "Attended", year: "2024" },
  { title: "HackMIT", type: "Organized", year: "2023" },
];

const volunteer = [
  { org: "Code for Good", role: "Lead Mentor", impact: "Taught 50+ students to code" },
  { org: "Tech4Youth", role: "Volunteer Instructor", impact: "Weekly coding workshops" },
];

const sports = [
  { name: "Basketball", skill: "Teamwork & Communication" },
  { name: "Swimming", skill: "Discipline & Endurance" },
  { name: "Chess", skill: "Strategic Thinking" },
];

const languages = [
  { name: "English", level: "Native" },
  { name: "Spanish", level: "Fluent" },
  { name: "Mandarin", level: "Conversational" },
];

const awards = [
  { title: "Dean's List", issuer: "University of Technology", year: "2023-2024" },
  { title: "Best Hack Award", issuer: "HackMIT", year: "2023" },
  { title: "Google Developer Scholarship", issuer: "Google", year: "2022" },
];

export function AboutSection() {
  return (
    <section className="section-padding">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-title">About Me</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Beyond the Code
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            I believe in being well-rounded. Here's a glimpse into my education, 
            community involvement, and personal interests.
          </p>
        </motion.div>

        {/* Education Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
          id="education"
        >
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-accent/10">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">Education</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-2">{education.institution}</h4>
                <p className="text-muted-foreground mb-4">{education.degree}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {education.period}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {education.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    GPA: {education.gpa}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-3">Relevant Coursework:</p>
                <div className="flex flex-wrap gap-2">
                  {education.courses.map((course) => (
                    <span key={course} className="tech-chip">{course}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid Layout for Other Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            id="events"
          >
            <div className="bg-card rounded-xl border border-border p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-semibold text-foreground">Events</h3>
              </div>
              <ul className="space-y-4">
                {events.map((event) => (
                  <li key={event.title} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.type}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{event.year}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Volunteer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            id="volunteer"
          >
            <div className="bg-card rounded-xl border border-border p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-semibold text-foreground">Volunteer</h3>
              </div>
              <ul className="space-y-4">
                {volunteer.map((vol) => (
                  <li key={vol.org}>
                    <p className="text-sm font-medium text-foreground">{vol.org}</p>
                    <p className="text-xs text-muted-foreground">{vol.role}</p>
                    <p className="text-xs text-accent mt-1">{vol.impact}</p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Sports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            id="sports"
          >
            <div className="bg-card rounded-xl border border-border p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-semibold text-foreground">Sports</h3>
              </div>
              <ul className="space-y-4">
                {sports.map((sport) => (
                  <li key={sport.name} className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{sport.name}</span>
                    <span className="text-xs text-muted-foreground">{sport.skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Languages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            id="languages"
          >
            <div className="bg-card rounded-xl border border-border p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-semibold text-foreground">Languages</h3>
              </div>
              <ul className="space-y-3">
                {languages.map((lang) => (
                  <li key={lang.name} className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{lang.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {lang.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Awards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="md:col-span-2 lg:col-span-2"
            id="awards"
          >
            <div className="bg-card rounded-xl border border-border p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-semibold text-foreground">Awards & Recognition</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {awards.map((award) => (
                  <div key={award.title} className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium text-foreground">{award.title}</p>
                    <p className="text-xs text-muted-foreground">{award.issuer}</p>
                    <p className="text-xs text-accent mt-1">{award.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
