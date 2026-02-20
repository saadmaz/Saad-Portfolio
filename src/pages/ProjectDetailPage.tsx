import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { dataManager, Project } from "@/lib/dataManager";
import { motion } from "framer-motion";
import { 
  ExternalLink, Github, ChevronLeft, PlayCircle, 
  FileText, CheckCircle2, Zap, Trophy, Target, AlertCircle,
  Lightbulb, Rocket, ShieldCheck, Database, Code2, 
  Cpu, Layers, Calendar, Clock, User, BarChart3, Check
} from "lucide-react";

/**
 * PROJECT DETAIL PAGE - SLEEK PROFESSIONAL VERSION
 * Design Philosophy: 
 * - Linear/Vercel-inspired aesthetic.
 * - Tight typography, crisp borders, and subtle contrast.
 * - High information density without feeling cluttered.
 */
const ProjectDetailPage = () => {
  // --- 1. ROUTER & DATA FETCHING ---
  const { slug } = useParams<{ slug: string }>();
  let project: Project | undefined;

  // Retrieve project by slug; fallback to numeric ID if needed
  if (slug) {
    project = dataManager.getProjectBySlug(slug);
    if (!project && !isNaN(Number(slug))) {
      project = dataManager.getProjectById(Number(slug));
    }
  }

  // --- 2. 404 ERROR STATE ---
  if (!project) {
    return (
      <Layout>
        <section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Project Not Found</h1>
          <p className="text-slate-500 mb-6">The requested case study could not be located.</p>
          <Link to="/projects" className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
            <ChevronLeft className="w-4 h-4" /> Back to Gallery
          </Link>
        </section>
      </Layout>
    );
  }

  // --- HELPER FUNCTION ---
  // Ensures we don't render empty UI boxes for blank JSON fields
  const hasValue = (val?: string) => val && val.trim() !== "" && val.toLowerCase() !== "n/a" && val.toLowerCase() !== "none";

  return (
    <Layout>
      {/* Background container: Neutral, sleek tones */}
      <section className="pt-8 pb-24 bg-slate-50 dark:bg-[#09090b] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* --- BREADCRUMB --- */}
          <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-10 uppercase tracking-wider">
            <ChevronLeft className="w-4 h-4" /> Back to Projects
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* --- HEADER SECTION --- */}
            <header className="mb-12 md:mb-16">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="max-w-3xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                    {project.title}
                  </h1>
                  {project.tagline && (
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium">
                      {project.tagline}
                    </p>
                  )}
                  
                  {/* Tech Stack Pills: Scaled down, crisper borders */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Badge: Moved to top right relative to header, smaller and sharper */}
                {project.status && (
                  <div className="shrink-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className={`w-2 h-2 rounded-full ${project.status.toLowerCase() === 'live' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">{project.status}</span>
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
                
                {/* 1. HERO IMAGE */}
                {project.heroImage && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
                    <img 
                      src={project.heroImage} 
                      alt={`${project.title} Cover`} 
                      className="w-full object-cover h-[300px] md:h-[450px]" 
                    />
                  </div>
                )}

                {/* 2. OVERVIEW TEXT */}
                {project.overview && (
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Project Overview</h2>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>
                    {/* Font size reduced to text-lg for professional readability */}
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      {project.overview}
                    </p>
                  </section>
                )}

                {/* 3. CASE STUDY TRIAD (Problem, Solution, Impact) */}
                {/* Clean, subtle cards instead of massive color blocks */}
                {(project.problem || project.solution || project.impact) && (
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {project.problem && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Lightbulb className="w-5 h-5 text-amber-500 mb-4" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">The Problem</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.problem}</p>
                      </div>
                    )}
                    {project.solution && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Rocket className="w-5 h-5 text-blue-500 mb-4" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">The Solution</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.solution}</p>
                      </div>
                    )}
                    {project.impact && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 mb-4" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">The Impact</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.impact}</p>
                      </div>
                    )}
                  </section>
                )}

                {/* 4. ARCHITECTURE & SYSTEM DESIGN */}
                {(project.architecture?.description || project.architecture?.diagramUrl) && (
                  <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <Layers className="w-6 h-6 text-slate-400" /> Architecture
                    </h2>
                    {project.architecture.description && (
                      <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        {project.architecture.description}
                      </p>
                    )}
                    {project.architecture.diagramUrl && hasValue(project.architecture.diagramUrl) && (
                      <div className="p-2 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-slate-800">
                        <img src={project.architecture.diagramUrl} alt="Architecture Diagram" className="w-full rounded-xl" />
                      </div>
                    )}
                  </section>
                )}

                {/* 5. STACK DEEP DIVE */}
                {project.stackDeepDive && (
                  <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c0e] overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50">
                      <Cpu className="w-5 h-5 text-slate-500" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Stack Deep-Dive</h2>
                    </div>
                    <div className="p-6 grid gap-6">
                      {hasValue(project.stackDeepDive.frontend) && (
                        <div className="grid md:grid-cols-4 gap-2 md:gap-6 items-start">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 md:text-right md:mt-1">Frontend</span>
                          <p className="md:col-span-3 text-sm text-slate-700 dark:text-slate-300">{project.stackDeepDive.frontend}</p>
                        </div>
                      )}
                      {hasValue(project.stackDeepDive.backend) && (
                        <div className="grid md:grid-cols-4 gap-2 md:gap-6 items-start pt-6 border-t border-slate-100 dark:border-slate-800/50">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 md:text-right md:mt-1">Backend</span>
                          <p className="md:col-span-3 text-sm text-slate-700 dark:text-slate-300">{project.stackDeepDive.backend}</p>
                        </div>
                      )}
                      {hasValue(project.stackDeepDive.aiIntegration) && (
                        <div className="grid md:grid-cols-4 gap-2 md:gap-6 items-start pt-6 border-t border-slate-100 dark:border-slate-800/50">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 md:text-right md:mt-1">AI Logic</span>
                          <p className="md:col-span-3 text-sm text-slate-700 dark:text-slate-300">{project.stackDeepDive.aiIntegration}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* 6. CHALLENGES & SOLUTIONS */}
                {/* Sleeker, list-based approach rather than chunky blocks */}
                {project.challenges && project.challenges.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Technical Challenges</h2>
                    <div className="grid gap-4">
                      {project.challenges.map((c, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                          <div className="flex gap-4 items-start">
                            <div className="mt-1 w-8 h-8 shrink-0 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-500">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-base font-bold text-slate-900 dark:text-white">{c.wall}</h4>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                <strong className="text-slate-900 dark:text-slate-300">The Fix: </strong> {c.fix}
                              </div>
                              {hasValue(c.lesson) && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                                  <Lightbulb className="w-3 h-3 text-amber-500" /> Lesson: {c.lesson}
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <Zap className="w-6 h-6 text-slate-400" /> Core Features
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 8. SCREENSHOTS GALLERY */}
                {project.screenshots && project.screenshots.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Interface Gallery</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.screenshots.map((shot, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                          <img src={shot} alt={`Gallery ${i}`} className="w-full h-auto object-cover hover:opacity-90 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* ========================================== */}
              {/* RIGHT COLUMN: SIDEBAR METADATA (4 Cols)      */}
              {/* ========================================== */}
              <aside className="lg:col-span-4 space-y-6">
                
                {/* 1. PROJECT DETAILS & LINKS CARD */}
                <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
                  
                  {/* Basic Meta (Date, Role, Duration) */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{project.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{project.duration}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 flex items-center gap-2"><User className="w-4 h-4" /> Role</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{project.role}</span>
                    </div>
                  </div>

                  {/* Primary Links */}
                  <div className="space-y-3">
                    {hasValue(project.liveUrl) && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity">
                        <ExternalLink className="w-4 h-4" /> Visit Live Site
                      </a>
                    )}
                    {hasValue(project.videoDemo) && (
                      <a href={project.videoDemo} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                        <PlayCircle className="w-4 h-4" /> Watch Demo Video
                      </a>
                    )}
                    {hasValue(project.githubUrl) && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Github className="w-4 h-4" /> View Source Code
                      </a>
                    )}
                    {hasValue(project.pdfReport) && (
                      <a href={project.pdfReport} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <FileText className="w-4 h-4" /> Download PDF Report
                      </a>
                    )}
                  </div>

                  {/* Documentation Links (DB & API) */}
                  {(hasValue(project.databaseSchema) || hasValue(project.apiDocs)) && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      {hasValue(project.databaseSchema) && (
                        <a href={project.databaseSchema} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                          <Database className="w-4 h-4" /> Database Schema Docs
                        </a>
                      )}
                      {hasValue(project.apiDocs) && (
                        <a href={project.apiDocs} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                          <Code2 className="w-4 h-4" /> API Documentation
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. KPI & METRICS CARD */}
                {project.metrics && (
                  <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> Analytics & Audit
                    </h3>
                    
                    {/* Compact Lighthouse Scores */}
                    {project.metrics.lighthouseScore && (
                      <div className="flex gap-2 mb-6">
                        {Object.entries(project.metrics.lighthouseScore).map(([label, score]) => (
                          <div key={label} className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <span className={`text-sm font-bold ${Number(score) >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{score}</span>
                            <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5">{label.substring(0, 4)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Standard List Metrics */}
                    <div className="space-y-4">
                      {project.metrics.testCoverage !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Test Coverage</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{project.metrics.testCoverage}%</span>
                        </div>
                      )}
                      {hasValue(project.metrics.cicd) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">CI/CD Pipeline</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{project.metrics.cicd}</span>
                        </div>
                      )}
                      {project.metrics.users !== undefined && project.metrics.users > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Active Users</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{project.metrics.users.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. FUTURE ROADMAP CARD */}
                {project.roadmap && project.roadmap.length > 0 && (
                  <div className="p-6 md:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Next Milestones
                    </h3>
                    <ul className="space-y-3">
                      {project.roadmap.map((goal, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <div className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-slate-400" />
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
    </Layout>
  );
};

export default ProjectDetailPage;
