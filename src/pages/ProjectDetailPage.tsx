import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { dataManager, Project } from "@/lib/dataManager";
import { motion } from "framer-motion";
import { 
  ExternalLink, Github, ChevronLeft, PlayCircle, 
  FileText, CheckCircle2, Zap, Trophy, Target, AlertCircle,
  Lightbulb, Rocket, ShieldCheck, Database, Code2, 
  Cpu, Layers, Calendar, Clock, User, BarChart3, Binary, Check
} from "lucide-react";

/**
 * PROJECT DETAIL PAGE - HIGH FIDELITY & DATA-EXHAUSTIVE
 * * This component maps 100% of the JSON data fields to a professional UI.
 * It is fully responsive and uses Tailwind's dark mode (`dark:`) for 
 * stunning contrast in both light and dark themes.
 */
const ProjectDetailPage = () => {
  // --- 1. ROUTER & DATA INITIALIZATION ---
  const { slug } = useParams<{ slug: string }>();
  let project: Project | undefined;

  // Retrieve the project object from the dataManager using the slug
  if (slug) {
    project = dataManager.getProjectBySlug(slug);
    // Fallback: If slug is a number, try fetching by ID
    if (!project && !isNaN(Number(slug))) {
      project = dataManager.getProjectById(Number(slug));
    }
  }

  // --- 2. 404 ERROR STATE ---
  // If no project matches the slug/id, render a clean error screen
  if (!project) {
    return (
      <Layout>
        <section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4">Project Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">The case study you are looking for does not exist.</p>
          <Link to="/projects" className="px-6 py-3 bg-accent text-white rounded-xl font-bold flex items-center gap-2 hover:bg-accent/90 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Return to Gallery
          </Link>
        </section>
      </Layout>
    );
  }

  // --- HELPER FUNCTION: Check if a value is effectively "empty" ---
  // Useful for filtering out "N/A", "none", or empty strings from the JSON
  const hasValue = (val?: string) => val && val.trim() !== "" && val.toLowerCase() !== "n/a" && val.toLowerCase() !== "none";

  return (
    <Layout>
      {/* MAIN WRAPPER: Handles overall page background colors for Light/Dark mode */}
      <section className="pt-8 pb-24 bg-slate-50 dark:bg-[#050505] transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          
          {/* --- TOP NAVIGATION BREADCRUMB --- */}
          <Link to="/projects" className="group inline-flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-accent transition-colors mb-8">
            <div className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:border-accent transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em]">Back to Projects</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* --- PRIMARY PROJECT CARD WRAPPER --- */}
            {/* Uses JSON `project.colour` for the dynamic glowing gradient background */}
            <div className={`relative rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-14 lg:p-20 shadow-2xl backdrop-blur-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-gradient-to-br ${project.colour || 'from-white to-slate-100 dark:from-slate-900 dark:to-black'}`}>
              
              {/* STATUS INDICATOR (Top Right) */}
              {project.status && (
                <div className="absolute top-8 right-8 md:top-12 md:right-12 z-20">
                  <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${project.status.toLowerCase() === 'live' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'}`} />
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-800 dark:text-slate-100">{project.status}</span>
                  </div>
                </div>
              )}

              {/* --- HEADER BLOCK (JSON: title, tagline, techStack) --- */}
              <header className="mb-16 md:mb-24 max-w-4xl relative z-10">
                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-[1.05]">
                  {project.title}
                </h1>
                {project.tagline && (
                  <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-3xl">
                    {project.tagline}
                  </p>
                )}
                
                {/* TECH STACK CHIPS */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="mt-10 flex flex-wrap gap-3">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="px-5 py-2 rounded-xl text-sm font-bold bg-white/80 dark:bg-black/50 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-sm hover:scale-105 transition-transform cursor-default">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* --- SPLIT LAYOUT GRID (Left: 66%, Right: 33%) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start relative z-10">
                
                {/* ========================================== */}
                {/* LEFT COLUMN: THE NARRATIVE & DEEP DIVE       */}
                {/* ========================================== */}
                <div className="lg:col-span-8 space-y-24">
                  
                  {/* 1. HERO IMAGE (JSON: heroImage) */}
                  {project.heroImage && (
                    <div className="rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
                      <img 
                        src={project.heroImage} 
                        alt={`${project.title} Hero`} 
                        className="w-full object-cover h-[300px] md:h-[500px] lg:h-[600px] hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                  )}

                  {/* 2. OVERVIEW (JSON: overview) */}
                  {project.overview && (
                    <section>
                      <h2 className="text-sm font-black uppercase tracking-[0.3em] text-accent mb-6 flex items-center gap-4">
                        <span className="w-8 h-[2px] bg-accent"></span> Project Overview
                      </h2>
                      <p className="text-2xl md:text-3xl text-slate-800 dark:text-slate-200 leading-[1.6] font-light">
                        {project.overview}
                      </p>
                    </section>
                  )}

                  {/* 3. THE CASE STUDY TRIAD (JSON: problem, solution, impact) */}
                  {/* Styled with highly vibrant colors to stand out from the dark background */}
                  {(project.problem || project.solution || project.impact) && (
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {project.problem && (
                        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-amber-500/30 shadow-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 border border-amber-200 dark:border-amber-500/30 relative z-10">
                            <Lightbulb className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">The Problem</h3>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">{project.problem}</p>
                        </div>
                      )}
                      
                      {project.solution && (
                        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-blue-500/30 shadow-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 border border-blue-200 dark:border-blue-500/30 relative z-10">
                            <Rocket className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">The Solution</h3>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">{project.solution}</p>
                        </div>
                      )}

                      {project.impact && (
                        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-emerald-500/30 shadow-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-200 dark:border-emerald-500/30 relative z-10">
                            <ShieldCheck className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">The Impact</h3>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">{project.impact}</p>
                        </div>
                      )}
                    </section>
                  )}

                  {/* 4. CORE FEATURES LIST (JSON: features) */}
                  {project.features && project.features.length > 0 && (
                    <section className="space-y-8">
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                        <Zap className="w-8 h-8 text-accent" /> Core Features
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {project.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-sm">
                            <div className="mt-1 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                              <Check className="w-4 h-4 text-accent font-bold" />
                            </div>
                            <span className="text-lg font-medium text-slate-800 dark:text-slate-200">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 5. ARCHITECTURE (JSON: architecture.description & diagramUrl) */}
                  {(project.architecture?.description || project.architecture?.diagramUrl) && (
                    <section className="space-y-8">
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                        <Layers className="w-8 h-8 text-accent" /> Architecture
                      </h2>
                      {project.architecture.description && (
                        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                          {project.architecture.description}
                        </p>
                      )}
                      {project.architecture.diagramUrl && hasValue(project.architecture.diagramUrl) && (
                        <div className="p-4 rounded-[2rem] bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 shadow-xl">
                          <img src={project.architecture.diagramUrl} alt="System Architecture Diagram" className="w-full rounded-[1.5rem]" />
                        </div>
                      )}
                    </section>
                  )}

                  {/* 6. TECHNICAL STACK DEEP DIVE (JSON: stackDeepDive) */}
                  {/* Robust handling: Only shows rows if data is present and NOT "N/A" */}
                  {project.stackDeepDive && (
                    <section className="overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0a0a0a]">
                      <div className="bg-slate-100 dark:bg-slate-900/50 p-8 border-b border-slate-200 dark:border-white/10 flex items-center gap-4">
                        <Cpu className="w-8 h-8 text-accent" />
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Stack Deep-Dive</h2>
                      </div>
                      <div className="p-8 grid gap-8">
                        {/* Frontend Check */}
                        {hasValue(project.stackDeepDive.frontend) && (
                          <div className="grid md:grid-cols-4 gap-4 md:gap-8 items-start">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 md:text-right mt-1">Frontend</span>
                            <p className="md:col-span-3 text-lg font-medium text-slate-800 dark:text-slate-200">{project.stackDeepDive.frontend}</p>
                          </div>
                        )}
                        {/* Backend Check */}
                        {hasValue(project.stackDeepDive.backend) && (
                          <div className="grid md:grid-cols-4 gap-4 md:gap-8 items-start pt-8 border-t border-slate-100 dark:border-white/5">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 md:text-right mt-1">Backend</span>
                            <p className="md:col-span-3 text-lg font-medium text-slate-800 dark:text-slate-200">{project.stackDeepDive.backend}</p>
                          </div>
                        )}
                        {/* AI Integration Check */}
                        {hasValue(project.stackDeepDive.aiIntegration) && (
                          <div className="grid md:grid-cols-4 gap-4 md:gap-8 items-start pt-8 border-t border-slate-100 dark:border-white/5">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 md:text-right mt-1">AI Logic</span>
                            <p className="md:col-span-3 text-lg font-medium text-slate-800 dark:text-slate-200">{project.stackDeepDive.aiIntegration}</p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* 7. CHALLENGES & SOLUTIONS (JSON: challenges) */}
                  {/* Visually splits the "Wall" (Red) and the "Fix" (Green) for high impact */}
                  {project.challenges && project.challenges.length > 0 && (
                    <section className="space-y-8">
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Challenges Overcome</h2>
                      <div className="grid gap-6">
                        {project.challenges.map((c, i) => (
                          <div key={i} className="flex flex-col md:flex-row gap-6 p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 shadow-lg">
                            {/* Problem Icon */}
                            <div className="w-14 h-14 shrink-0 rounded-2xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-500/30">
                              <AlertCircle className="w-7 h-7" />
                            </div>
                            <div className="space-y-4 w-full">
                              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{c.wall}</h4>
                              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed"><strong>The Fix: </strong> {c.fix}</p>
                              </div>
                              {hasValue(c.lesson) && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-sm font-bold">
                                  <Lightbulb className="w-4 h-4" /> Lesson: {c.lesson}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 8. SCREENSHOTS GALLERY (JSON: screenshots) */}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <section className="space-y-8">
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Interface Gallery</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.screenshots.map((shot, i) => (
                          <img 
                            key={i} 
                            src={shot} 
                            alt={`Gallery ${i}`} 
                            className="w-full h-auto rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl hover:scale-[1.02] transition-transform duration-500" 
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* ========================================== */}
                {/* RIGHT COLUMN: STICKY METADATA & ACTIONS      */}
                {/* ========================================== */}
                <aside className="lg:col-span-4">
                  <div className="sticky top-8 space-y-8">
                    
                    {/* --- PROJECT SPECS & ACTION BUTTONS --- */}
                    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 shadow-2xl">
                      
                      {/* Meta Data Grid */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Date</p>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> {project.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Duration</p>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-end"><Clock className="w-4 h-4 text-accent" /> {project.duration}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Role</p>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><User className="w-4 h-4 text-accent" /> {project.role}</p>
                        </div>
                      </div>

                      {/* Primary Action Buttons (JSON: liveUrl, githubUrl, videoDemo, pdfReport) */}
                      <div className="pt-8 space-y-4">
                        {hasValue(project.liveUrl) && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-accent text-white font-black hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25">
                            <ExternalLink className="w-5 h-5" /> Visit Live Site
                          </a>
                        )}
                        
                        {/* Video Demo Button - Highlighted distinctly */}
                        {hasValue(project.videoDemo) && (
                          <a href={project.videoDemo} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white font-black hover:brightness-110 transition-colors shadow-lg shadow-indigo-500/25">
                            <PlayCircle className="w-5 h-5" /> Watch Video Demo
                          </a>
                        )}

                        {hasValue(project.githubUrl) && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                            <Github className="w-5 h-5" /> Source Code
                          </a>
                        )}

                        {hasValue(project.pdfReport) && (
                          <a href={project.pdfReport} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                            <FileText className="w-5 h-5" /> Case Study PDF
                          </a>
                        )}
                      </div>

                      {/* Deep Technical Docs (JSON: databaseSchema, apiDocs) */}
                      {(hasValue(project.databaseSchema) || hasValue(project.apiDocs)) && (
                        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 space-y-3">
                          {hasValue(project.databaseSchema) && (
                            <a href={project.databaseSchema} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-bold text-slate-600 dark:text-slate-400">
                              <Database className="w-4 h-4 text-accent" /> View DB Schema
                            </a>
                          )}
                          {hasValue(project.apiDocs) && (
                            <a href={project.apiDocs} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-bold text-slate-600 dark:text-slate-400">
                              <Code2 className="w-4 h-4 text-accent" /> REST API Docs
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* --- METRICS & KPIs (JSON: metrics) --- */}
                    {project.metrics && (
                      <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 shadow-2xl">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                          <BarChart3 className="w-4 h-4 text-accent" /> KPIs & Analytics
                        </h3>
                        
                        {/* Lighthouse Rings */}
                        {project.metrics.lighthouseScore && (
                          <div className="grid grid-cols-3 gap-3 mb-8">
                            {Object.entries(project.metrics.lighthouseScore).map(([label, score]) => (
                              <div key={label} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                                <span className={`text-xl font-black ${Number(score) >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                  {score}
                                </span>
                                <span className="text-[8px] uppercase font-black text-slate-500 mt-1">{label}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* List Metrics */}
                        <div className="space-y-4">
                          {project.metrics.testCoverage !== undefined && (
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Test Coverage</span>
                              <span className="font-black text-accent">{project.metrics.testCoverage}%</span>
                            </div>
                          )}
                          {hasValue(project.metrics.cicd) && (
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">CI/CD</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{project.metrics.cicd}</span>
                            </div>
                          )}
                          {project.metrics.users !== undefined && project.metrics.users > 0 && (
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Users</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">{project.metrics.users.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* --- ROADMAP (JSON: roadmap) --- */}
                    {project.roadmap && project.roadmap.length > 0 && (
                      <div className="p-8 rounded-[2.5rem] bg-accent/5 dark:bg-accent/10 border border-accent/20">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-6 flex items-center gap-3">
                          <Target className="w-4 h-4 text-accent" /> Future Roadmap
                        </h3>
                        <div className="space-y-4">
                          {project.roadmap.map((goal, i) => (
                            <div key={i} className="flex gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                              <div className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-accent" />
                              {goal}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </aside>

              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectDetailPage;
