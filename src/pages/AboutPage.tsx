/**
 * ABOUT PAGE COMPONENT
 * This page serves as a "Beyond the Code" section of the portfolio, 
 * highlighting personal achievements, education, and hobbies.
 */

import { motion } from "framer-motion"; // Handles entry animations and hover effects
import { Layout } from "@/components/layout/Layout"; // Standard page wrapper (Navbar/Footer)
import { 
  GraduationCap, MapPin, Trophy, Heart, 
  Dumbbell, Globe, Star 
} from "lucide-react"; // SVG icons for visual storytelling

// --- UI Components & Data ---
import { Badge } from "@/components/ui/badge"; // Shadcn/ui Badge component for tags
import { educationList } from "@/data/education"; // Array of education objects
import { languages, volunteer, sports, awards } from "@/data/personal/about"; // Personal data arrays
import { EducationDialog } from "@/components/education/EducationDialog"; // Modal to show deep details of education

/**
 * STAR RATING COMPONENT
 * A utility component that renders 5 stars.
 * @param filled - The number of stars to highlight (1-5)
 */
const StarRating = ({ filled }: { filled: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        // If the star index is <= the filled count, apply accent color; else show muted/transparent
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
          
          {/* --- PAGE HEADER --- */}
          {/* motion.div: Fades in and slides up on page load */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <span className="section-title">About Me</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Beyond the Code
            </h1>
          </motion.div>

          {/* --- EDUCATION SECTION --- */}
          <div className="mb-16" id="education">
            <div className="flex items-center gap-3 mb-8">
              {/* Icon Container with subtle background tint */}
              <div className="p-3 rounded-lg bg-accent/10">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Education</h2>
            </div>

            <div className="space-y-6">
              {/* Sorts education items by start date in descending order (most recent first) 
                before mapping them into the UI.
              */}
              {[...educationList]
                .sort((a, b) => new Date(b.startDate || "").getTime() - new Date(a.startDate || "").getTime())
                .map((edu, index) => (
                  <EducationDialog key={index} education={edu}>
                    {/* Interactive Card: uses motion.div for a subtle scale-up on hover.
                      Wrapped in EducationDialog to trigger a modal on click.
                    */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="bg-card rounded-xl border border-border p-6 cursor-pointer hover:border-accent/50 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Institution Logo */}
                        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border">
                          <img
                            src={edu.institutionLogo}
                            alt={`${edu.institution} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Education Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <h3 className="text-xl font-bold text-foreground">{edu.institution}</h3>
                              <p className="text-accent font-medium">{edu.degree}</p>
                            </div>
                            <Badge variant="secondary" className="w-fit">{edu.period}</Badge>
                          </div>

                          {/* Location and GPA */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{edu.location}</span>
                            {edu.gpa && <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />GPA: {edu.gpa}</span>}
                          </div>

                          {/* Skill Tags: Shows the first 4 skills + a counter for the rest */}
                          <div className="pt-2 flex flex-wrap gap-2">
                            {edu.skills.slice(0, 4).map(skill => (
                              <span key={skill} className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">{skill}</span>
                            ))}
                            {edu.skills.length > 4 && (
                              <span className="text-xs px-2 py-1 text-muted-foreground">+{edu.skills.length - 4} more</span>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground pt-2 italic">Click to view details</p>
                        </div>
                      </div>
                    </motion.div>
                  </EducationDialog>
                ))}
            </div>
          </div>

          {/* --- LANGUAGES & SPORTS GRID --- */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            
            {/* Languages Card */}
            <div id="languages" className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-accent" />
                <h3 className="font-display text-xl font-semibold text-foreground">Languages</h3>
              </div>
              <ul className="space-y-5">
                {/* Filters for languages that have a 'stars' rating defined */}
                {languages.filter(l => l.stars).map((lang) => (
                  <li key={lang.name} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-foreground">{lang.name}</span>
                      <p className="text-xs text-muted-foreground">{lang.level}</p>
                    </div>
                    {/* Render the 5-star rating component */}
                    {lang.stars && <StarRating filled={lang.stars} />}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sports Card */}
            <div id="sports" className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Dumbbell className="w-5 h-5 text-accent" />
                <h3 className="font-display text-xl font-semibold text-foreground">Sports</h3>
              </div>
              <ul className="space-y-4">
                {sports.map((sport) => (
                  <li key={sport.name} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                    <div>
                      <span className="font-medium text-foreground">{sport.name}</span>
                      <p className="text-xs text-muted-foreground">{sport.level}</p>
                    </div>
                    {/* Skill tag (e.g., Competitive, Recreational) */}
                    <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                      {sport.skill}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- VOLUNTEER WORK SECTION --- */}
          <div className="mb-16" id="volunteer">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-accent/10">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Volunteer Work</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {volunteer.map((vol) => (
                <div key={vol.org} className="bg-card rounded-xl border border-border p-6 shadow-sm">
                  <h4 className="font-semibold text-foreground mb-1">{vol.org}</h4>
                  <p className="text-sm text-accent mb-3">{vol.role} • {vol.period}</p>
                  <p className="text-sm text-muted-foreground">{vol.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* --- AWARDS SECTION --- */}
          <div id="awards">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-accent/10">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Awards</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awards.map((award) => (
                <div key={award.title} className="bg-card rounded-xl border border-border p-5 card-hover">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground">{award.title}</h4>
                    <span className="text-xs text-accent font-medium">{award.year}</span>
                  </div>
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