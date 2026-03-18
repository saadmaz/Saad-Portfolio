import { motion } from "framer-motion";
import { GraduationCap, MapPin, Calendar, Trophy, Users, Dumbbell, Globe, Heart, ArrowUpRight, Sparkles } from "lucide-react";
import { educationList } from "@/data/personal/education";
import { events, volunteer, sports, languages, awards } from "@/data/personal/about";
import { EducationDialog } from "@/components/education/EducationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

export function AboutSection() {
  const latestEducation = [...educationList].sort((a, b) => new Date(b.startDate || "").getTime() - new Date(a.startDate || "").getTime())[0];

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="section-container relative z-10">
        
        {/* --- SECTION HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Personal Journey</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Beyond the <span className="text-primary italic">Code</span>
          </h2>
          <p className="text-muted-foreground/80 max-w-2xl mx-auto md:text-lg leading-relaxed font-medium">
            A holistic look at my educational background, community contributions, 
            and the diverse interests that drive my creative process.
          </p>
        </motion.div>

        {/* --- EDUCATION HIGHLIGHT --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
          id="education"
        >
          <EducationDialog education={latestEducation}>
            <div className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border/50 p-8 md:p-12 cursor-pointer hover:border-accent/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-accent/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <GraduationCap className="w-32 h-32 text-accent" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 shadow-inner">
                    <GraduationCap className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-bold text-foreground tracking-tight">Education</h3>
                    <p className="text-accent text-[10px] font-black uppercase tracking-widest mt-1">Featured Milestone</p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all">Latest Activity</Badge>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-start relative z-10">
                <div>
                  <h4 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">{latestEducation.institution}</h4>
                  <p className="text-muted-foreground/90 font-medium text-lg mb-8">{latestEducation.degree}</p>
                  
                  <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span className="flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                      <Calendar className="w-4 h-4 text-accent" />
                      {latestEducation.period}
                    </span>
                    <span className="flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                      <MapPin className="w-4 h-4 text-accent" />
                      {latestEducation.location}
                    </span>
                    {latestEducation.gpa && (
                      <span className="flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                        <Trophy className="w-4 h-4 text-accent" />
                        GPA: {latestEducation.gpa}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-background/40 backdrop-blur-md rounded-3xl p-6 border border-border/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-4 px-2">Key Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {latestEducation.courses.map((course) => (
                      <span key={course} className="px-4 py-2 rounded-xl bg-secondary/30 border border-border/50 text-[11px] font-bold text-muted-foreground hover:bg-accent/10 hover:border-accent/20 hover:text-accent transition-all cursor-default">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex items-center justify-end">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 group-hover:text-accent transition-colors">
                  View Enrollment Details
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </EducationDialog>

          <div className="flex justify-center mt-10">
            <Link to="/about#education">
              <Button variant="ghost" className="gap-2 h-12 px-8 rounded-full font-bold uppercase tracking-widest text-[10px] border border-border/50 hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all">
                Explore Full Academic Record <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* --- GRID SECTIONS --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Events */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            id="events"
          >
            <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/50 p-8 h-full hover:border-accent/30 transition-all duration-500 hover:shadow-xl group">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                    <Users className="w-6 h-6 text-sky-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground tracking-tight">Events</h3>
              </div>
              <ul className="space-y-6">
                {events.map((event) => (
                  <li key={event.title} className="group/item">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p className="text-sm font-bold text-foreground/90 group-hover/item:text-primary transition-colors leading-snug">{event.title}</p>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">{event.year}</span>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">{event.type}</p>
                    <div className="mt-4 h-px w-full bg-border/30 group-last:hidden" />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Volunteer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            id="volunteer"
          >
            <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/50 p-8 h-full hover:border-accent/30 transition-all duration-500 hover:shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <Heart className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground tracking-tight">Volunteer</h3>
              </div>
              <ul className="space-y-8">
                {volunteer.map((vol) => (
                  <li key={vol.org} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500">
                    <p className="text-sm font-bold text-foreground/90 leading-snug">{vol.org}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1 mb-2">{vol.role}</p>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                         <p className="text-[11px] font-medium text-emerald-600/90 leading-relaxed italic">{vol.impact}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Languages */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            id="languages"
          >
            <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/50 p-8 h-full hover:border-accent/30 transition-all duration-500 hover:shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <Globe className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground tracking-tight">Languages</h3>
              </div>
              <div className="space-y-4">
                {languages.map((lang) => (
                  <div key={lang.name} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/40 hover:bg-secondary/40 transition-colors">
                    <span className="text-sm font-bold text-foreground/90">{lang.name}</span>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-indigo-500/30 text-indigo-500 px-3">
                      {lang.level}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-12 h-px w-full bg-border/30" />
              
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-amber-500/10">
                        <Dumbbell className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="font-display text-lg font-bold">Sports</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {sports.map((sport) => (
                        <div key={sport.name} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">{sport.name}</span>
                            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">{sport.skill}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Awards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-2 lg:col-span-3"
            id="awards"
          >
            <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/50 p-8 md:p-10 h-full hover:border-accent/30 transition-all duration-500 hover:shadow-xl relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-accent/10 transition-all duration-700" />
              
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
                    <Trophy className="w-8 h-8 text-accent" />
                </div>
                <div>
                    <h3 className="font-display text-2xl font-bold text-foreground tracking-tight">Awards & Recognition</h3>
                    <p className="text-accent text-[10px] font-black uppercase tracking-widest mt-0.5">Honored Achievements</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {awards.map((award, idx) => (
                  <motion.div 
                    key={award.title} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-[2rem] bg-background/40 border border-border/40 hover:border-accent/20 hover:bg-background/60 transition-all duration-300 group/award"
                  >
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center group-hover/award:bg-accent/10 transition-colors">
                            <Trophy className="w-5 h-5 text-accent/40 group-hover/award:text-accent transition-colors" />
                        </div>
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">{award.year}</span>
                    </div>
                    <p className="text-base font-bold text-foreground mb-1 leading-tight group-hover/award:text-primary transition-colors">{award.title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{award.issuer}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
