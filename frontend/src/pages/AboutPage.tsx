//ABOUT PAGE COMPONENT
// This page serves as a "Beyond the Code" section of the portfolio,
// highlighting personal achievements, education, and hobbies.

// --- Dependencies ---
import { useState } from "react";
import { m } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import {
  GraduationCap,
  Trophy,
  Heart,
  Globe,
  Zap,
  ExternalLink,
  Medal,
  BookMarked,
  Lightbulb,
  ClipboardList,
  Building2,
  Leaf,
  Calendar,
} from "lucide-react";

// --- UI Components & Data ---
import { Badge } from "@/components/ui/badge";
import {
  useHackathons,
  useVolunteer,
  useEducation,
  useCourses,
  usePatents,
  useTestScores,
  useOrganizations,
  useCauses,
  useLanguages,
  useAwards,
} from "@/hooks/useContent";
import type { VolunteerExperience, Education } from "@/types";
import { LightboxModal } from "@/components/ui/LightboxModal";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const { data: hackathons = [], isLoading: hackLoading } = useHackathons();
  const { data: volunteerData = [] } = useVolunteer();
  const { data: educationData = [], isLoading: eduLoading } = useEducation();
  const { data: courses = [] } = useCourses();
  const { data: patents = [] } = usePatents();
  const { data: testScores = [] } = useTestScores();
  const { data: organizations = [] } = useOrganizations();
  const { data: causes = [] } = useCauses();
  const { data: languages = [] } = useLanguages();
  const { data: awards = [] } = useAwards();

  function formatEducationPeriod(edu: Education): string {
    const isCurrent = edu.is_current ?? edu.isCurrent ?? false;
    const start =
      edu.start_month && edu.start_year
        ? `${edu.start_month.slice(0, 3)} ${edu.start_year}`
        : (edu.startDate ?? "");
    const end = isCurrent
      ? "Present"
      : edu.end_month && edu.end_year
        ? `${edu.end_month.slice(0, 3)} ${edu.end_year}`
        : (edu.endDate ?? "");
    return start ? (end ? `${start} – ${end}` : start) : "";
  }

  const publishedEducation = [...educationData]
    .filter((e) => e.is_published !== false)
    .sort((a, b) => {
      const aY = a.start_year ?? (a.startDate ? parseInt(a.startDate) : 0);
      const bY = b.start_year ?? (b.startDate ? parseInt(b.startDate) : 0);
      return bY - aY;
    });
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/about"].title}
        description={PAGE_SEO["/about"].description}
        url={`${BASE_URL}/about`}
      />
      {/* section-padding: custom utility for consistent vertical spacing across the site */}
      <section className="section-padding">
        <div className="section-container">
          {/* --- PAGE HEADER --- */}
          {/* m.div: Uses initial/animate props to create a "rising fade" entry effect when the user lands on the page */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <span className="section-title">About Me</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Beyond the Code
            </h1>
          </m.div>

          {/* --- EDUCATION SECTION --- */}
          <div className="mb-16" id="education">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-accent/10">
                  <GraduationCap className="w-6 h-6 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Education</h2>
              </div>
              {publishedEducation.length > 0 && (
                <Link
                  to="/education"
                  className="text-sm text-accent font-semibold flex items-center gap-1 hover:underline"
                >
                  View all <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {eduLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-card border border-border animate-pulse" />
                ))}
              </div>
            ) : publishedEducation.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No education entries yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publishedEducation.slice(0, 3).map((edu, index) => {
                  const logo = edu.school_logo ?? edu.logo;
                  const name = edu.school_name ?? edu.institution ?? "";
                  const period = formatEducationPeriod(edu);
                  const field = edu.field_of_study ?? edu.fieldOfStudy;
                  const skills = edu.skills ?? [];

                  return (
                    <m.div
                      key={edu.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="bg-card rounded-xl border border-border p-5 hover:border-accent/40 transition-all shadow-sm"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-secondary border border-border flex items-center justify-center">
                          {logo ? (
                            <img src={logo} alt={name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <GraduationCap className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              {edu.school_website_url ? (
                                <a
                                  href={edu.school_website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-foreground hover:text-accent transition-colors flex items-center gap-1"
                                >
                                  {name} <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </a>
                              ) : (
                                <h3 className="font-bold text-foreground">{name}</h3>
                              )}
                              {(edu.degree || field) && (
                                <p className="text-accent text-sm font-medium">
                                  {edu.degree}
                                  {edu.degree && field ? " · " : ""}
                                  {field}
                                </p>
                              )}
                            </div>
                            {period && (
                              <Badge variant="secondary" className="w-fit text-xs shrink-0">
                                {period}
                              </Badge>
                            )}
                          </div>

                          {edu.grade && edu.show_grade_publicly !== false && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Trophy className="w-3 h-3" /> {edu.grade}
                            </p>
                          )}

                          {skills.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-1.5">
                              {skills.slice(0, 5).map((skill) => (
                                <span
                                  key={skill}
                                  className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground"
                                >
                                  {skill}
                                </span>
                              ))}
                              {skills.length > 5 && (
                                <span className="text-xs px-2 py-0.5 text-muted-foreground">
                                  +{skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </m.div>
                  );
                })}

                {publishedEducation.length > 3 && (
                  <Link
                    to="/education"
                    className="block text-center text-sm text-accent font-semibold py-3 rounded-xl border border-accent/20 hover:bg-accent/5 transition-colors"
                  >
                    View all {publishedEducation.length} education entries →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* --- LANGUAGES CARD --- */}
          {languages.length > 0 && (
            <div id="languages" className="bg-card rounded-xl border border-border p-6 mb-16 max-w-md">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-accent" />
                <h3 className="font-display text-xl font-semibold text-foreground">Languages</h3>
              </div>
              <ul className="space-y-5">
                {languages.map((lang) => (
                  <li key={lang.id} className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{lang.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {lang.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* --- VOLUNTEER WORK SECTION --- */}
          {volunteerData.length > 0 && (
            <div className="mb-16" id="volunteer">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Volunteer Work</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {volunteerData.map((vol) => {
                  type V = VolunteerExperience & { org?: string; period?: string };
                  const v = vol as V;
                  const org = v.organization ?? v.org;
                  const role = v.role;
                  const period =
                    v.period ??
                    `${v.startDate}${v.isCurrent ? " – Present" : v.endDate ? ` – ${v.endDate}` : ""}`;
                  const desc = v.description;
                  const img = v.image;
                  return (
                    <div
                      key={v.id ?? org}
                      className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:border-accent/30 transition-colors"
                    >
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
                        <p className="text-sm text-accent mb-3">
                          {role} • {period}
                        </p>
                        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- AWARDS SECTION --- */}
          {awards.length > 0 && (
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
                  <div key={award.id} className="bg-card rounded-xl border border-border p-5 card-hover">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{award.title}</h4>
                      {award.date && <span className="text-xs text-accent font-medium">{award.date}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{award.issuer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- HACKATHONS SECTION --- */}
          {!hackLoading && hackathons.length > 0 && (
            <m.div
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
                  <m.div
                    key={hack.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="bg-card rounded-xl border border-border hover:border-accent/40 hover:shadow-sm transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/4 to-transparent pointer-events-none z-10" />

                    {/* Cover image - clickable lightbox */}
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
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {hack.organizer} · {hack.date}
                          </p>
                        </div>
                        {hack.achievement && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                            <Medal className="w-3 h-3" />
                            {hack.achievement}
                          </span>
                        )}
                      </div>

                      {hack.projectTitle && (
                        <p className="text-sm text-accent font-medium mb-2">Project: {hack.projectTitle}</p>
                      )}

                      {hack.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {hack.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px]">
                          {hack.role}
                        </Badge>
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
                  </m.div>
                ))}
              </div>
            </m.div>
          )}

          {/* --- COURSES SECTION --- */}
          {courses.length > 0 && (
            <m.div
              id="courses"
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <BookMarked className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Courses</h2>
                  <p className="text-sm text-muted-foreground">{courses.length} completed</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course, i) => (
                  <m.div
                    key={course.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="bg-card rounded-xl border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-foreground text-sm leading-snug group-hover:text-accent transition-colors">
                        {course.name}
                      </h4>
                      {course.link && (
                        <a
                          href={course.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-muted-foreground hover:text-accent transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-accent font-medium mb-1">{course.school}</p>
                    {course.associatedWith && (
                      <p className="text-xs text-muted-foreground">{course.associatedWith}</p>
                    )}
                    {course.completedDate && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {course.completedDate}
                      </p>
                    )}
                  </m.div>
                ))}
              </div>
            </m.div>
          )}

          {/* --- TEST SCORES SECTION --- */}
          {testScores.length > 0 && (
            <m.div
              id="test-scores"
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <ClipboardList className="w-6 h-6 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Test Scores</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {testScores.map((score, i) => (
                  <m.div
                    key={score.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="bg-card rounded-xl border border-border p-5 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{score.testName}</p>
                      <p className="text-accent font-bold">{score.score}</p>
                      {score.date && <p className="text-xs text-muted-foreground mt-0.5">{score.date}</p>}
                    </div>
                  </m.div>
                ))}
              </div>
            </m.div>
          )}

          {/* --- PATENTS SECTION --- */}
          {patents.length > 0 && (
            <m.div
              id="patents"
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Lightbulb className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Patents</h2>
                  <p className="text-sm text-muted-foreground">
                    {patents.length} {patents.length === 1 ? "filing" : "filings"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {patents.map((patent, i) => (
                  <m.div
                    key={patent.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="bg-card rounded-xl border border-border p-5 hover:border-accent/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{patent.title}</h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              patent.status.toLowerCase() === "issued"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : patent.status.toLowerCase() === "pending"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-secondary text-muted-foreground border-border"
                            }`}
                          >
                            {patent.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {patent.patentOffice}
                          {patent.patentNumber ? ` · ${patent.patentNumber}` : ""}
                        </p>
                        {(patent.filingDate || patent.issueDate) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {patent.filingDate ? `Filed: ${patent.filingDate}` : ""}
                            {patent.filingDate && patent.issueDate ? " · " : ""}
                            {patent.issueDate ? `Issued: ${patent.issueDate}` : ""}
                          </p>
                        )}
                        {patent.description && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {patent.description}
                          </p>
                        )}
                      </div>
                      {patent.link && (
                        <a
                          href={patent.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-accent hover:underline flex-shrink-0"
                        >
                          View <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </m.div>
                ))}
              </div>
            </m.div>
          )}

          {/* --- ORGANIZATIONS SECTION --- */}
          {organizations.length > 0 && (
            <m.div
              id="organizations"
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Organizations</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {organizations.map((org, i) => (
                  <m.div
                    key={org.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:border-accent/40 transition-all group"
                  >
                    {org.image && (
                      <button
                        type="button"
                        className="block w-full h-32 overflow-hidden focus:outline-none"
                        onClick={() => openLightbox([org.image!])}
                      >
                        <img
                          src={org.image}
                          alt={org.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                        />
                      </button>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{org.name}</h4>
                          {org.position && <p className="text-sm text-accent">{org.position}</p>}
                          {(org.startDate || org.endDate) && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {org.startDate}
                              {org.isCurrent ? " – Present" : org.endDate ? ` – ${org.endDate}` : ""}
                            </p>
                          )}
                        </div>
                        {org.link && (
                          <a
                            href={org.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-accent transition-colors flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      {org.description && (
                        <p className="text-sm text-muted-foreground mt-2">{org.description}</p>
                      )}
                    </div>
                  </m.div>
                ))}
              </div>
            </m.div>
          )}

          {/* --- CAUSES SECTION --- */}
          {causes.length > 0 && (
            <m.div
              id="causes"
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Leaf className="w-6 h-6 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Causes I Care About</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {causes.map((cause, i) => (
                  <m.div
                    key={cause.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    title={cause.description}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border hover:border-accent/50 hover:bg-accent/5 transition-all cursor-default group"
                  >
                    <Leaf className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-foreground">{cause.name}</span>
                  </m.div>
                ))}
              </div>
            </m.div>
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
