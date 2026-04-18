//ABOUT PAGE COMPONENT
// This page serves as a "Beyond the Code" section of the portfolio, 
// highlighting personal achievements, education, and hobbies.

// --- Dependencies ---
import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { GraduationCap, MapPin, Trophy, Heart, Dumbbell, Globe, Star, Zap, ExternalLink, Medal } from "lucide-react";

// --- UI Components & Data ---
import { Badge } from "@/components/ui/badge";
import { educationList } from "@/data/education";
import { languages, volunteer, sports, awards } from "@/data/personal/about";
import { EducationDialog } from "@/components/education/EducationDialog";
import { useHackathons, useVolunteer } from "@/shared/hooks/useCommon";
import { LightboxModal } from "@/components/ui/LightboxModal";

/**
 * STAR RATING COMPONENT
 * A utility component that renders a 5-star visual representation of proficiency.
 * @param filled - The number of stars to highlight (e.g., 4 out of 5)
 */
const StarRating = ({ filled }: { filled: number }) => (
  <div className="flex gap-1">
    {/* Map through a fixed array of 5 to generate the rating scale */}
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        // Logic: Apply accent fill/color if the star index is less than or equal to the proficiency value
        // Otherwise, render a semi-transparent muted star.
        className={`w-4 h-4 ${star <= filled ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const AboutPage = () => {
  const { data: hackathons = [], isLoading: hackLoading } = useHackathons();
  const { data: volunteerData = [] } = useVolunteer();
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  return (
    <Layout>
      <SEO
        title="About"
        description="Beyond the code — Saad Mazhar's education, languages, volunteer work, awards, and interests. A CS undergrad building products in Colombo, Sri Lanka."
        url="https://saadmaz.com/about"
      />
      {/* section-padding: custom utility for consistent vertical spacing across the site */}
      <section className="section-padding">
        <div className="section-container">
          
          {/* --- PAGE HEADER --- */}
          {/* motion.div: Uses initial/animate props to create a "rising fade" entry effect when the user lands on the page */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <span className="section-title">About Me</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Beyond the Code
            </h1>
          </motion.div>

          {/* --- EDUCATION SECTION --- */}
          <div className="mb-16" id="education">
            {/* Header with Icon: Uses a low-opacity background tint (accent/10) to highlight the icon */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-lg bg-accent/10">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Education</h2>
            </div>

            <div className="space-y-6">
              {/* Data Processing: 
                  1. Spreads educationList into a new array to avoid mutating the original data.
                  2. Sorts items chronologically by startDate (descending) so the most recent education is at the top.
              */}
              {[...educationList]
                .sort((a, b) => new Date(b.startDate || "").getTime() - new Date(a.startDate || "").getTime())
                .map((edu, index) => (
                  <EducationDialog key={index} education={edu}>
                    {/* motion.div: adds a micro-interaction (scale 1.01) on hover to indicate the card is clickable */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="bg-card rounded-xl border border-border p-6 cursor-pointer hover:border-accent/50 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Institution Logo — clickable lightbox */}
                        <button
                          type="button"
                          className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border hover:border-accent/50 transition-colors focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (edu.institutionLogo) openLightbox([edu.institutionLogo]);
                          }}
                          title="View logo"
                        >
                          <img
                            src={edu.institutionLogo}
                            alt={`${edu.institution} logo`}
                            className="w-full h-full object-contain p-1"
                          />
                        </button>

                        {/* Education Details: Main content area within the card */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <h3 className="text-xl font-bold text-foreground">{edu.institution}</h3>
                              <p className="text-accent font-medium">{edu.degree}</p>
                            </div>
                            {/* Shadcn Badge used for date range (e.g., 2018 - 2022) */}
                            <Badge variant="secondary" className="w-fit">{edu.period}</Badge>
                          </div>

                          {/* Metadata: Location and GPA with corresponding Lucide icons */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{edu.location}</span>
                            {edu.gpa && <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />GPA: {edu.gpa}</span>}
                          </div>

                          {/* Skill Tags: Implementation of "Progressive Disclosure"
                              Shows only the first 4 skills; if more exist, shows a "+X more" count.
                          */}
                          <div className="pt-2 flex flex-wrap gap-2">
                            {(edu.skills || []).slice(0, 4).map(skill => (
                              <span key={skill} className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">{skill}</span>
                            ))}
                            {edu.skills.length > 4 && (
                              <span className="text-xs px-2 py-1 text-muted-foreground">+{edu.skills.length - 4} more</span>
                            )}
                          </div>

                          {/* Call to Action: Hint for the user that clicking triggers the Dialog/Modal */}
                          <p className="text-sm text-muted-foreground pt-2 italic">Click to view details</p>
                        </div>
                      </div>
                    </motion.div>
                  </EducationDialog>
                ))}
            </div>
          </div>

          {/* --- LANGUAGES & SPORTS GRID --- */}
          {/* Two-column layout on large screens (lg:grid-cols-2) to maximize space efficiency */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            
            {/* --- LANGUAGES CARD --- */}
            <div id="languages" className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-accent" />
                <h3 className="font-display text-xl font-semibold text-foreground">Languages</h3>
              </div>
              <ul className="space-y-5">
                {/* Iterates through languages, filtering out any entry missing a star rating */}
                {languages.filter(l => l.stars).map((lang) => (
                  <li key={lang.name} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-foreground">{lang.name}</span>
                      <p className="text-xs text-muted-foreground">{lang.level}</p>
                    </div>
                    {/* Render the reusable StarRating component */}
                    {lang.stars && <StarRating filled={lang.stars} />}
                  </li>
                ))}
              </ul>
            </div>

            {/* --- SPORTS CARD --- */}
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
                    {/* Skill categorization label (Competitive, Varsity, etc.) */}
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
              {/* Prefer Firestore data; fall back to static data */}
              {(volunteerData.length > 0 ? volunteerData : volunteer).map((vol: any) => {
                const org = vol.organization ?? vol.org;
                const role = vol.role;
                const period = vol.period ?? `${vol.startDate}${vol.isCurrent ? ' – Present' : vol.endDate ? ` – ${vol.endDate}` : ''}`;
                const desc = vol.description;
                const img = vol.image as string | undefined;
                return (
                  <div key={vol.id ?? org} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:border-accent/30 transition-colors">
                    {img && (
                      <button
                        type="button"
                        className="block w-full h-40 overflow-hidden focus:outline-none"
                        onClick={() => openLightbox([img])}
                      >
                        <img
                          src={img}
                          alt={org}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                        />
                      </button>
                    )}
                    <div className="p-6">
                      <h4 className="font-semibold text-foreground mb-1">{org}</h4>
                      <p className="text-sm text-accent mb-3">{role} • {period}</p>
                      {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- AWARDS SECTION --- */}
          <div id="awards" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-accent/10">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Awards</h2>
            </div>
            {/* Grid layout shifts from 1 col (mobile) to 2 (tablet) to 3 (desktop) */}
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

          {/* --- HACKATHONS SECTION --- */}
          {!hackLoading && hackathons.length > 0 && (
            <motion.div
              id="hackathons"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Hackathons</h2>
                  <p className="text-sm text-muted-foreground">{hackathons.length} events participated</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {hackathons.map((hack, i) => (
                  <motion.div
                    key={hack.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="bg-card rounded-xl border border-border hover:border-accent/40 hover:shadow-sm transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/4 to-transparent pointer-events-none z-10" />

                    {/* Cover image — clickable lightbox */}
                    {hack.image && (
                      <button
                        type="button"
                        className="block w-full h-40 overflow-hidden focus:outline-none"
                        onClick={() => openLightbox([hack.image!])}
                      >
                        <img
                          src={hack.image}
                          alt={hack.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                        />
                      </button>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                            {hack.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{hack.organizer} · {hack.date}</p>
                        </div>
                        {hack.achievement && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                            <Medal className="w-3 h-3" />
                            {hack.achievement}
                          </span>
                        )}
                      </div>

                      {hack.projectTitle && (
                        <p className="text-sm text-accent font-medium mb-2">
                          Project: {hack.projectTitle}
                        </p>
                      )}

                      {hack.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {hack.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px]">{hack.role}</Badge>
                        {hack.link && (
                          <a
                            href={hack.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </section>

      <LightboxModal
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxImages.length > 0}
        onClose={() => setLightboxImages([])}
        onNavigate={setLightboxIndex}
      />
    </Layout>
  );
};

export default AboutPage;
