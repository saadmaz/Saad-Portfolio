import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  GraduationCap, 
  MapPin, 
  Calendar, 
  Trophy, 
  Heart,
  Dumbbell, 
  Globe, 
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const educationList = [
  {
    institution: "University of Technology",
    institutionUrl: "https://university.edu",
    institutionLogo: "https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop&q=80",
    degree: "Bachelor of Science in Computer Science",
    period: "2021 - 2025 (Expected)",
    location: "San Francisco, CA",
    gpa: "3.9/4.0",
    courses: ["Data Structures", "Machine Learning", "Database Systems", "Distributed Systems"],
    activities: ["CS Student Association - VP", "ACM Chapter - Member"],
  },
  {
    institution: "Online Education Platform",
    institutionUrl: "https://coursera.org",
    institutionLogo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80",
    degree: "Full Stack Development Certificate",
    period: "2022",
    location: "Online",
    courses: ["React", "Node.js", "GraphQL", "MongoDB"],
    activities: ["Top 5% of cohort"],
  },
  {
    institution: "High School Name",
    institutionUrl: "https://highschool.edu",
    institutionLogo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=100&h=100&fit=crop&q=80",
    degree: "Advanced Level Studies",
    period: "2018 - 2021",
    location: "Colombo, Sri Lanka",
    gpa: "4.0/4.0",
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
  const [currentEdu, setCurrentEdu] = useState(0);

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <span className="section-title">About Me</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Beyond the Code</h1>
          </motion.div>

          {/* Education Slideshow */}
          <div className="mb-16" id="education">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-accent/10"><GraduationCap className="w-6 h-6 text-accent" /></div>
                <h2 className="font-display text-2xl font-bold text-foreground">Education</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentEdu(Math.max(0, currentEdu - 1))} disabled={currentEdu === 0} className="rounded-full">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentEdu(Math.min(educationList.length - 1, currentEdu + 1))} disabled={currentEdu === educationList.length - 1} className="rounded-full">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <motion.div key={currentEdu} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl border border-border p-8">
              <div className="flex items-start gap-4 mb-4">
                <a 
                  href={educationList[currentEdu].institutionUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border hover:border-accent transition-colors"
                >
                  <img 
                    src={educationList[currentEdu].institutionLogo} 
                    alt={`${educationList[currentEdu].institution} logo`}
                    className="w-full h-full object-cover"
                  />
                </a>
                <div>
                  <a 
                    href={educationList[currentEdu].institutionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xl font-semibold text-foreground hover:text-accent transition-colors mb-1"
                  >
                    {educationList[currentEdu].institution}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-muted-foreground">{educationList[currentEdu].degree}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{educationList[currentEdu].period}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{educationList[currentEdu].location}</span>
                {educationList[currentEdu].gpa && <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />GPA: {educationList[currentEdu].gpa}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {educationList[currentEdu].courses.map((course) => <span key={course} className="tech-chip">{course}</span>)}
              </div>
            </motion.div>
            <div className="flex justify-center gap-2 mt-4">
              {educationList.map((_, i) => <button key={i} onClick={() => setCurrentEdu(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentEdu ? "bg-accent" : "bg-border"}`} />)}
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
