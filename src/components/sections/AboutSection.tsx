import { motion } from "framer-motion";
import { GraduationCap, MapPin, Calendar, Trophy, Users, Dumbbell, Globe, Heart, ArrowRight } from "lucide-react";
import { educationList } from "@/data/personal/education";
import { events, volunteer, sports, languages, awards } from "@/data/personal/about";
import { EducationDialog } from "@/components/education/EducationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function AboutSection() {
  const latestEducation = [...educationList].sort((a, b) => new Date(b.startDate || "").getTime() - new Date(a.startDate || "").getTime())[0];

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
          <EducationDialog education={latestEducation}>
            <div className="bg-card rounded-xl border border-border p-8 cursor-pointer hover:border-accent/50 transition-all shadow-sm hover:shadow-md group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <GraduationCap className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Education</h3>
                </div>
                <Badge variant="secondary" className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors">Latest</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-foreground mb-2">{latestEducation.institution}</h4>
                  <p className="text-muted-foreground mb-4">{latestEducation.degree}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {latestEducation.period}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {latestEducation.location}
                    </span>
                    {latestEducation.gpa && (
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        GPA: {latestEducation.gpa}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Relevant Coursework:</p>
                  <div className="flex flex-wrap gap-2">
                    {latestEducation.courses.map((course) => (
                      <span key={course} className="tech-chip">{course}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-right">Click for details</p>
                </div>
              </div>
            </div>
          </EducationDialog>

          <div className="flex justify-center mt-6">
            <Link to="/about#education">
              <Button variant="outline" className="gap-2">
                See All Education <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
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
