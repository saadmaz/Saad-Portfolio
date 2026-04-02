import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProject } from "@/shared/hooks/useProjects";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, Github, ChevronLeft, PlayCircle, 
  FileText, CheckCircle2, Zap, Trophy, Target, AlertCircle,
  Lightbulb, Rocket, ShieldCheck, Database, Code2, 
  Cpu, Layers, Calendar, Clock, User, BarChart3, Check, X
} from "lucide-react";

/**
 * PROJECT DETAIL PAGE - INTERACTIVE & PROFESSIONAL
 * Features:
 * - Image Lightbox Modal for full-screen viewing
 * - Fluid hover animations on interactable elements
 * - Naturally scrolling sidebar (un-frozen)
 */
const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch project via TanStack Query – falls back to static data if API is offline
  const { data: project, isLoading, isError } = useProject(slug || "");

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <Layout>
        <section className="pt-8 pb-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-4 w-32 mb-10" />
            <Skeleton className="h-12 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-6">
                <Skeleton className="h-[450px] w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // --- 404 / ERROR STATE ---
  if (isError || !project) {
    return (
      <Layout>
        <section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested case study could not be located.</p>
          <Link to="/projects" className="px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
            <ChevronLeft className="w-4 h-4" /> Back to Gallery
          </Link>
        </section>
      </Layout>
    );
  }

  // Helper function to validate non-empty strings from JSON
  const hasValue = (val?: string) => val && val.trim() !== "" && val.toLowerCase() !== "n/a" && val.toLowerCase() !== "none";

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.tagline || project.overview,
    url: project.liveUrl,
    image: project.heroImage,
    author: { "@type": "Person", name: "Saad Mazhar" },
  };

  return (
    <Layout>
      <SEO
        title={project.title}
        description={project.tagline || project.overview || `${project.title} — a project by Saad Mazhar`}
        image={project.heroImage}
        url={`https://saadmaz.com/projects/${project.slug}`}
        structuredData={projectSchema}
      />
      {/* Background container: Neutral, sleek tones */}
      <section className="pt-8 pb-24 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* --- BREADCRUMB --- */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-10">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronLeft className="w-3 h-3 rotate-180 opacity-40" />
            <Link to="/projects" className="hover:text-foreground transition-colors">Projects</Link>
            <ChevronLeft className="w-3 h-3 rotate-180 opacity-40" />
            <span className="text-foreground font-semibold truncate max-w-[200px]">{project.title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* --- HEADER SECTION --- */}
            <header className="mb-12 md:mb-16">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="max-w-3xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4">
                    {project.title}
                  </h1>
                  {project.tagline && (
                    <p className="text-lg md:text-xl text-muted-foreground font-medium">
                      {project.tagline}
                    </p>
                  )}
                  
                  {/* Tech Stack Pills */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-card border border-border text-card-foreground">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                {project.status && (
                  <div className="shrink-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${project.status.toLowerCase() === 'live' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.45)]' : 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.45)]'}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{project.status}</span>
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* --- MAIN SPLIT LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* ========================================== */}
              {/* LEFT COLUMN: PROJECT NARRATIVE (8 Cols)      */}
              {/* ========================================== */}
              <div className="lg:col-span-8 space-y-16">
                
                {/* 1. HERO IMAGE (Interactive) */}
                {/* ADDED: cursor-zoom-in, onClick handler, and a group-hover scale animation */}
                {project.heroImage && (
                  <div 
                    onClick={() => setSelectedImage(project!.heroImage!)}
                    className="group rounded-2xl overflow-hidden border border-border shadow-sm bg-card cursor-zoom-in"
                  >
                    <img 
                      src={project.heroImage} 
                      alt={`${project.title} Cover`} 
                      className="w-full object-cover h-[300px] md:h-[450px] transition-transform duration-700 ease-out group-hover:scale-105" 
                    />
                  </div>
                )}

                {/* 2. OVERVIEW TEXT */}
                {project.overview && (
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Overview</h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {project.overview}
                    </p>
                  </section>
                )}

                {/* 3. CASE STUDY TRIAD (Problem, Solution, Impact) */}
                {(project.problem || project.solution || project.impact) && (
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {project.problem && (
                      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                        <Lightbulb className="w-5 h-5 text-warning mb-4" />
                        <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">The Problem</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{project.problem}</p>
                      </div>
                    )}
                    {project.solution && (
                      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                        <Rocket className="w-5 h-5 text-accent mb-4" />
                        <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">The Solution</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{project.solution}</p>
                      </div>
                    )}
                    {project.impact && (
                      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                        <ShieldCheck className="w-5 h-5 text-success mb-4" />
                        <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">The Impact</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{project.impact}</p>
                      </div>
                    )}
                  </section>
                )}

                {/* 4. ARCHITECTURE & SYSTEM DESIGN (Interactive Diagram) */}
                {(project.architecture?.description || project.architecture?.diagramUrl) && (
                  <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                      <Layers className="w-6 h-6 text-muted-foreground" /> Architecture
                    </h2>
                    {project.architecture.description && (
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {project.architecture.description}
                      </p>
                    )}
                    {project.architecture.diagramUrl && hasValue(project.architecture.diagramUrl) && (
                      <div 
                        onClick={() => setSelectedImage(project!.architecture!.diagramUrl!)}
                        className="group p-2 rounded-2xl bg-card border border-border cursor-zoom-in overflow-hidden"
                      >
                        <img
                          src={project.architecture.diagramUrl}
                          alt={`${project.title} architecture diagram`}
                          loading="lazy"
                          decoding="async"
                          className="w-full rounded-xl transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                    )}
                  </section>
                )}

                {/* 5. STACK DEEP DIVE */}
                {project.stackDeepDive && (
                  <section className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-background">
                      <Cpu className="w-5 h-5 text-muted-foreground" />
                      <h2 className="text-lg font-bold text-foreground">Stack Deep-Dive</h2>
                    </div>
                    <div className="p-6 grid gap-6">
                      {hasValue(project.stackDeepDive.frontend) && (
                        <div className="grid md:grid-cols-4 gap-2 md:gap-6 items-start">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground md:text-right md:mt-1">Frontend</span>
                          <p className="md:col-span-3 text-sm text-muted-foreground">{project.stackDeepDive.frontend}</p>
                        </div>
                      )}
                      {hasValue(project.stackDeepDive.backend) && (
                        <div className="grid md:grid-cols-4 gap-2 md:gap-6 items-start pt-6 border-t border-border/50">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground md:text-right md:mt-1">Backend</span>
                          <p className="md:col-span-3 text-sm text-muted-foreground">{project.stackDeepDive.backend}</p>
                        </div>
                      )}
                      {hasValue(project.stackDeepDive.aiIntegration) && (
                        <div className="grid md:grid-cols-4 gap-2 md:gap-6 items-start pt-6 border-t border-border/50">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground md:text-right md:mt-1">AI Logic</span>
                          <p className="md:col-span-3 text-sm text-muted-foreground">{project.stackDeepDive.aiIntegration}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* 6. CHALLENGES & SOLUTIONS */}
                {project.challenges && project.challenges.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Technical Challenges</h2>
                    <div className="grid gap-4">
                      {project.challenges.map((c, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                          <div className="flex gap-4 items-start">
                            <div className="mt-1 w-8 h-8 shrink-0 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-base font-bold text-foreground">{c.wall}</h4>
                              <div className="text-sm text-muted-foreground">
                                <strong className="text-foreground">The Fix: </strong> {c.fix}
                              </div>
                              {hasValue(c.lesson) && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted text-muted-foreground text-xs font-medium">
                                  <Lightbulb className="w-3 h-3 text-accent" /> Lesson: {c.lesson}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 7. CORE FEATURES */}
                {project.features && project.features.length > 0 && (
                  <section className="space-y-6">
                      <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Zap className="w-6 h-6 text-muted-foreground" /> Core Features
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {project.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                            <Check className="w-4 h-4 text-success shrink-0" />
                            <span className="text-sm font-medium text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 8. SCREENSHOTS GALLERY (Interactive) */}
                {/* ADDED: Hover scale animations and click-to-expand lightbox trigger */}
                {project.screenshots && project.screenshots.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Interface Gallery</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.screenshots.map((shot, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedImage(shot)}
                          className="group rounded-xl overflow-hidden border border-border bg-card cursor-zoom-in relative"
                        >
                          <img
                            src={shot}
                            alt={`${project.title} screenshot ${i + 1}`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          {/* Subtle overlay hint on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* ========================================== */}
              {/* RIGHT COLUMN: SIDEBAR METADATA (4 Cols)      */}
              {/* REMOVED sticky classes so this scrolls normally */}
              {/* ========================================== */}
              <aside className="lg:col-span-4 space-y-6">
                
                {/* 1. PROJECT DETAILS & LINKS CARD */}
                <div className="p-6 md:p-8 rounded-2xl bg-card border border-border shadow-sm">
                  
                  {/* Basic Meta (Date, Role, Duration) */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</span>
                      <span className="font-semibold text-foreground">{project.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                      <span className="font-semibold text-foreground">{project.duration}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Role</span>
                      <span className="font-semibold text-foreground">{project.role}</span>
                    </div>
                  </div>

                  {/* Primary Links */}
                  <div className="space-y-3">
                    {/* ADDED: Hover -translate-y animation and shadow pop for Live Site */}
                    {hasValue(project.liveUrl) && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-accent text-accent-foreground text-sm font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                      >
                        <ExternalLink className="w-4 h-4" /> Visit Live Site
                      </a>
                    )}
                    
                    {/* ADDED: Hover scale effect for secondary buttons */}
                    {hasValue(project.videoDemo) && (
                      <a 
                        href={project.videoDemo} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-accent/10 text-accent border border-accent/20 text-sm font-bold hover:bg-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                      >
                        <PlayCircle className="w-4 h-4" /> Watch Demo Video
                      </a>
                    )}
                    
                    {hasValue(project.githubUrl) && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                      >
                        <Github className="w-4 h-4" /> View Source Code
                      </a>
                    )}
                    
                    {hasValue(project.pdfReport) && (
                      <a 
                        href={project.pdfReport} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                      >
                        <FileText className="w-4 h-4" /> Download PDF Report
                      </a>
                    )}
                  </div>

                  {/* Documentation Links (DB & API) */}
                  {(hasValue(project.databaseSchema) || hasValue(project.apiDocs)) && (
                    <div className="mt-6 pt-6 border-t border-border space-y-3">
                      {hasValue(project.databaseSchema) && (
                        <a href={project.databaseSchema} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Database className="w-4 h-4" /> Database Schema Docs
                        </a>
                      )}
                      {hasValue(project.apiDocs) && (
                        <a href={project.apiDocs} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Code2 className="w-4 h-4" /> API Documentation
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. KPI & METRICS CARD */}
                {project.metrics && (
                  <div className="p-6 md:p-8 rounded-2xl bg-card border border-border shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" /> Analytics & Audit
                    </h3>
                    
                    {/* Compact Lighthouse Scores */}
                    {project.metrics.lighthouseScore && (
                      <div className="flex gap-2 mb-6">
                        {Object.entries(project.metrics.lighthouseScore).map(([label, score]) => (
                          <div key={label} className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl bg-card border border-border/50">
                            <span className={`text-sm font-bold ${Number(score) >= 90 ? 'text-success' : 'text-warning'}`}>{score}</span>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5">{label.substring(0, 4)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Standard List Metrics */}
                    <div className="space-y-4">
                      {project.metrics.testCoverage !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Test Coverage</span>
                          <span className="font-semibold text-foreground">{project.metrics.testCoverage}%</span>
                        </div>
                      )}
                      {hasValue(project.metrics.cicd) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">CI/CD Pipeline</span>
                          <span className="font-semibold text-foreground">{project.metrics.cicd}</span>
                        </div>
                      )}
                      {project.metrics.users !== undefined && project.metrics.users > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Active Users</span>
                          <span className="font-semibold text-foreground">{project.metrics.users.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. FUTURE ROADMAP CARD */}
                {project.roadmap && project.roadmap.length > 0 && (
                  <div className="p-6 md:p-8 rounded-2xl bg-card border border-border">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" /> Next Milestones
                    </h3>
                    <ul className="space-y-3">
                      {project.roadmap.map((goal, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <div className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-border" />
                          <span className="leading-snug">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </aside>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================== */}
      {/* FULL SCREEN IMAGE LIGHTBOX OVERLAY           */}
      {/* ========================================== */}
      {/* AnimatePresence allows framer-motion to animate elements as they are removed from the DOM */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)} // Clicking the backdrop closes the modal
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-12 cursor-zoom-out"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-card/10 text-card-foreground hover:bg-card/20 transition-colors backdrop-blur-lg"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* The Enlarged Image */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }} // Gives it a nice snappy popup feel
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()} // Prevents closing if the user clicks the image itself
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ProjectDetailPage;
