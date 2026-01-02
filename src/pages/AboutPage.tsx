import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  GraduationCap, 
  MapPin, 
  Calendar, 
  Trophy, 
  Users, 
  Dumbbell, 
  Globe, 
  Heart,
  Mic,
  UserCheck,
  Music,
  Camera
} from "lucide-react";

const education = {
  institution: "University of Technology",
  degree: "Bachelor of Science in Computer Science",
  period: "2021 - 2025 (Expected)",
  location: "San Francisco, CA",
  gpa: "3.9/4.0",
  courses: [
    "Data Structures & Algorithms",
    "Machine Learning",
    "Database Systems",
    "Distributed Systems",
    "Computer Networks",
    "Software Engineering",
    "Operating Systems",
    "Artificial Intelligence"
  ],
  activities: [
    "Computer Science Student Association - VP",
    "ACM Student Chapter - Member",
    "Hackathon Club - Co-Founder"
  ],
};

const events = [
  { title: "TechCrunch Disrupt", type: "Speaker", year: "2024", description: "Presented on building AI-first products" },
  { title: "Google I/O", type: "Attended", year: "2024", description: "Developer conference" },
  { title: "HackMIT", type: "Organized", year: "2023", description: "Co-organized 500+ participant hackathon" },
  { title: "YC Startup School", type: "Completed", year: "2023", description: "10-week entrepreneurship program" },
  { title: "AWS re:Invent", type: "Attended", year: "2023", description: "Cloud computing conference" },
  { title: "React Conf", type: "Attended", year: "2022", description: "React developer conference" },
];

const volunteer = [
  { 
    org: "Code for Good", 
    role: "Lead Mentor", 
    period: "2022 - Present",
    description: "Teaching coding to underserved high school students",
    impact: "Taught 50+ students, 15 went on to study CS" 
  },
  { 
    org: "Tech4Youth", 
    role: "Volunteer Instructor", 
    period: "2021 - 2022",
    description: "Weekly coding workshops for middle schoolers",
    impact: "Led 40+ workshops, developed curriculum" 
  },
  { 
    org: "Campus Food Bank", 
    role: "Volunteer", 
    period: "2021 - Present",
    description: "Helping distribute food to students in need",
    impact: "100+ hours of service" 
  },
];

const extracurricular = [
  { name: "Photography Club", role: "Member", description: "Street and landscape photography" },
  { name: "Entrepreneurship Club", role: "President", description: "Organizing startup events and pitch competitions" },
  { name: "Guitar & Music", role: "Hobbyist", description: "Playing acoustic guitar for 5+ years" },
  { name: "Open Source", role: "Contributor", description: "Contributing to various open source projects" },
];

const sports = [
  { name: "Basketball", skill: "Teamwork & Communication", level: "Recreational" },
  { name: "Swimming", skill: "Discipline & Endurance", level: "Competitive (High School)" },
  { name: "Chess", skill: "Strategic Thinking", level: "Club Level" },
  { name: "Running", skill: "Persistence & Goal Setting", level: "Half-Marathon Finisher" },
  { name: "Table Tennis", skill: "Quick Reflexes", level: "Recreational" },
];

const languages = [
  { name: "English", level: "Native", proficiency: 100 },
  { name: "Spanish", level: "Fluent", proficiency: 85 },
  { name: "Mandarin", level: "Conversational", proficiency: 60 },
  { name: "French", level: "Basic", proficiency: 30 },
];

const awards = [
  { 
    title: "Dean's List", 
    issuer: "University of Technology", 
    year: "2023-2024",
    description: "Academic excellence recognition"
  },
  { 
    title: "Best Hack Award", 
    issuer: "HackMIT", 
    year: "2023",
    description: "Winner among 200+ teams"
  },
  { 
    title: "Google Developer Scholarship", 
    issuer: "Google", 
    year: "2022",
    description: "Full scholarship for web development track"
  },
  { 
    title: "National Merit Scholar", 
    issuer: "NMSC", 
    year: "2021",
    description: "Top 1% of test takers"
  },
  { 
    title: "Eagle Scout", 
    issuer: "Boy Scouts of America", 
    year: "2019",
    description: "Highest rank in scouting"
  },
];

const AboutPage = () => {
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
            <span className="section-title">About Me</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Beyond the Code
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              I believe in being well-rounded. Here's a comprehensive look at my education, 
              community involvement, personal interests, and everything that makes me who I am.
            </p>
          </motion.div>

          {/* Education Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
            id="education"
          >
            <div className="bg-card rounded-xl border border-border p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <GraduationCap className="w-6 h-6 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Education</h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{education.institution}</h3>
                  <p className="text-muted-foreground mb-4">{education.degree}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
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

                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Campus Activities:</p>
                    <ul className="space-y-2">
                      {education.activities.map((activity) => (
                        <li key={activity} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Relevant Coursework:</p>
                  <div className="flex flex-wrap gap-2">
                    {education.courses.map((course) => (
                      <span key={course} className="tech-chip">{course}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Events Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
            id="events"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-accent/10">
                <Mic className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Events</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      event.type === 'Speaker' ? 'bg-accent/20 text-accent' :
                      event.type === 'Organized' ? 'bg-green-500/20 text-green-700' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                  <span className="text-xs text-muted-foreground">{event.year}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Volunteer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
            id="volunteer"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-accent/10">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Volunteer Work</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {volunteer.map((vol, index) => (
                <motion.div
                  key={vol.org}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <h4 className="font-semibold text-foreground mb-1">{vol.org}</h4>
                  <p className="text-sm text-accent mb-1">{vol.role}</p>
                  <p className="text-xs text-muted-foreground mb-3">{vol.period}</p>
                  <p className="text-sm text-muted-foreground mb-4">{vol.description}</p>
                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <span className="text-xs font-medium text-accent">Impact: </span>
                    <span className="text-xs text-foreground">{vol.impact}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Extra-Curricular Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
            id="extracurricular"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-accent/10">
                <Music className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Extra-Curricular</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {extracurricular.map((activity, index) => (
                <motion.div
                  key={activity.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <h4 className="font-medium text-foreground mb-1">{activity.name}</h4>
                  <p className="text-xs text-accent mb-2">{activity.role}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Two Column Layout for Sports & Languages */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Sports Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              id="sports"
            >
              <div className="bg-card rounded-xl border border-border p-6 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Dumbbell className="w-5 h-5 text-accent" />
                  <h3 className="font-display text-xl font-semibold text-foreground">Sports & Fitness</h3>
                </div>
                <ul className="space-y-4">
                  {sports.map((sport) => (
                    <li key={sport.name} className="flex items-center justify-between gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div>
                        <span className="font-medium text-foreground">{sport.name}</span>
                        <p className="text-xs text-muted-foreground">{sport.level}</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground whitespace-nowrap">
                        {sport.skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Languages Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              id="languages"
            >
              <div className="bg-card rounded-xl border border-border p-6 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-accent" />
                  <h3 className="font-display text-xl font-semibold text-foreground">Languages</h3>
                </div>
                <ul className="space-y-5">
                  {languages.map((lang) => (
                    <li key={lang.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{lang.name}</span>
                        <span className="text-xs text-muted-foreground">{lang.level}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-accent transition-all duration-500"
                          style={{ width: `${lang.proficiency}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Awards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            id="awards"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-accent/10">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Awards & Recognition</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awards.map((award, index) => (
                <motion.div
                  key={award.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 card-hover"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground">{award.title}</h4>
                    <span className="text-xs text-accent font-medium">{award.year}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{award.issuer}</p>
                  <p className="text-xs text-muted-foreground">{award.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
