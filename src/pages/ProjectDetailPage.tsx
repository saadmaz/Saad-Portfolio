import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { dataManager, Project } from "@/lib/dataManager";
import { motion } from "framer-motion";
import { 
  ExternalLink, Github, ChevronLeft, PlayCircle, 
  FileText, CheckCircle2, Zap, Trophy, Target, AlertCircle,
  Lightbulb, Rocket, ShieldCheck, Database, Code2, 
  Cpu, Layers, Calendar, Clock, User, BarChart3, Binary
} from "lucide-react";

/**
 * PROJECT DETAIL PAGE - ULTIMATE FIDELITY
 * This component is designed to be a "Master Template" that converts raw JSON
 * into a professional engineering case study.
 */
const ProjectDetailPage = () => {
  // --- 1. ROUTING & STATE ---
  const { slug } = useParams<{ slug: string }>();
  let project: Project | undefined;

  // Retrieve project by slug or ID with fallback
  if (slug) {
    project = dataManager.getProjectBySlug(slug);
    if (!project && !isNaN(Number(slug))) {
      project = dataManager.getProjectById(Number(slug));
    }
  }

  // --- 2. ERROR STATE (404) ---
  if (!project) {
    return (
      <Layout>
        <section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Project Not Found</h1>
          <Link to="/projects" className="mt-4 text-accent flex items-center gap-2 hover:underline">
            <ChevronLeft className="w-4 h-4" /> Return to Projects
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Dynamic Background: Uses the 'colour' prop from JSON to tint the whole page section */}
      <section className={`pt-8 pb-20 transition-colors duration-500 bg-slate-50 dark:bg-slate-950`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          
          {/* NAVIGATION BREADCRUMB */}
          <Link to="/projects" className="group inline-flex items-center gap-2 text-slate-500 hover:text-accent transition-colors mb-10">
            <div className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-accent transition-all shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">Back to Gallery</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* --- MAIN CASE STUDY CONTAINER --- */}
            {/* The 'project.colour' from JSON creates the primary aesthetic identity of the page */}
            <div className={`relative rounded-[3rem] p-6 md:p-16 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/5 overflow-hidden bg-gradient-to-br ${project.colour || 'from-white to-slate-100 dark:from-slate-900 dark:to-slate-950'}`}>
              
              {/* TOP-RIGHT STATUS CHIP */}
              <div className="absolute top-8 right-8 z-20">
                <div className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-2xl">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${project.status === 'Live' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">{project.status}</span>
                </div>
              </div>

              {/* --- HEADER BLOCK --- */}
              <header className="mb-16 max-w-4xl relative z-10">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-[0.9]">
                  {project.title}
                </h1>
                <p className="text-xl md:text-3xl text-slate-600 dark:text-slate-400 font-medium leading-tight max-w-2xl">
                  {project.tagline}
                </p>
                
                {/* DYNAMIC TECH STACK PILLS */}
                <div className="mt-8 flex flex-wrap gap-2">
                  {project.techStack?.map((tech) => (
                    <span key={tech} className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </header>

              {/* --- CONTENT GRID SYSTEM --- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative z-10">
                
                {/* LEFT CONTENT COLUMN (66% Width on Desktop) */}
                <div className="lg:col-span-8 space-y-24">
                  
                  {/* HERO IMAGE DISPLAY */}
                  {project.heroImage && (
                    <div className="group relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
                      <img src={project.heroImage} alt="Hero" className="w-full object-cover h-[350px] md:h-[650px] transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40" />
                    </div>
                  )}

                  {/* PROJECT OVERVIEW */}
                  <section className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                      <h2 className="text-xs font-black uppercase tracking-[0.4em] text-accent">Executive Summary</h2>
                    </div>
                    <p className="text-2xl md:text-4xl text-slate-700 dark:text-slate-200 leading-[1.2] font-light italic">
                      "{project.overview}"
                    </p>
                  </section>

                  {/* THE STORY TRIAD: PROBLEM / SOLUTION / IMPACT */}
                  {/* We map these to specific color identities to help them stand out */}
                  {(project.problem || project.solution || project.impact) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {project.problem && (
                        <div className="p-8 rounded-[2.5rem] bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-sm">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-500/20">
                            <Lightbulb className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Problem</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.problem}</p>
                        </div>
                      )}
                      {project.solution && (
                        <div className="p-8 rounded-[2.5rem] bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 shadow-sm">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                            <Rocket className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Solution</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.solution}</p>
                        </div>
                      )}
                      {project.impact && (
                        <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Impact</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.impact}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ARCHITECTURE & SYSTEM DESIGN */}
                  <section className="space-y-10">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Architecture & Infrastructure</h2>
                    {project.architecture?.description && (
                      <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">{project.architecture.description}</p>
                    )}
                    {project.architecture?.diagramUrl && (
                      <div className="p-2 rounded-[2rem] bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-2xl">
                        <img src={project.architecture.diagramUrl} alt="Architecture" className="w-full rounded-[1.5rem]" />
                      </div>
                    )}
                  </section>

                  {/* STACK DEEP DIVE: BREAKING DOWN THE TIERS */}
                  {project.stackDeepDive && (
                    <section className="p-12 rounded-[3rem] bg-slate-900 text-white shadow-3xl">
                      <div className="flex items-center gap-3 mb-12">
                        <Binary className="w-8 h-8 text-accent" />
                        <h2 className="text-3xl font-bold">Stack Deep-Dive</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {project.stackDeepDive.frontend && (
                          <div className="space-y-4">
                            <span className="px-3 py-1 rounded bg-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em]">Frontend Layer</span>
                            <p className="text-slate-300 text-lg leading-relaxed">{project.stackDeepDive.frontend}</p>
                          </div>
                        )}
                        {project.stackDeepDive.backend && (
                          <div className="space-y-4">
                            <span className="px-3 py-1 rounded bg-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em]">Backend Layer</span>
                            <p className="text-slate-300 text-lg leading-relaxed">{project.stackDeepDive.backend}</p>
                          </div>
                        )}
                        {project.stackDeepDive.aiIntegration && (
                          <div className="md:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10">
                             <span className="text-accent text-[10px] font-black uppercase tracking-[0.2em]">Artificial Intelligence Integration</span>
                             <p className="mt-3 text-slate-300 leading-relaxed">{project.stackDeepDive.aiIntegration}</p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* CHALLENGES OVERCOME SECTION */}
                  {project.challenges && project.challenges.length > 0 && (
                    <section className="space-y-12">
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Technical Challenges</h2>
                      <div className="grid gap-6">
                        {project.challenges.map((c, i) => (
                          <div key={i} className="group flex flex-col md:flex-row gap-8 p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all">
                            <div className="w-16 h-16 shrink-0 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                              <AlertCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{c.wall}</h4>
                              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed"><strong>Solution:</strong> {c.fix}</p>
                              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-black uppercase tracking-widest">
                                <Zap className="w-3 h-3" /> Outcome: {c.lesson}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* GALLERY GALLERY */}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <section className="space-y-10">
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white">User Interface Gallery</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {project.screenshots.map((shot, i) => (
                          <img key={i} src={shot} alt={`Screenshot ${i}`} className="w-full rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl hover:scale-[1.02] transition-all duration-500" />
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* --- RIGHT SIDEBAR: SPECS & METRICS (33% Width on Desktop) --- */}
                <aside className="lg:col-span-4 lg:pl-8">
                  <div className="sticky top-12 space-y-8">
                    
                    {/* PROJECT SPECS CARD */}
                    <div className="p-10 rounded-[3rem] bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-3xl">
                      <div className="space-y-8">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Project Date</p>
                            <p className="font-black text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-accent" /> {project.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Duration</p>
                            <p className="font-black text-lg flex items-center gap-2 justify-end"><Clock className="w-5 h-5 text-accent" /> {project.duration}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Primary Responsibility</p>
                          <p className="font-black text-xl flex items-center gap-3"><User className="w-5 h-5 text-accent" /> {project.role}</p>
                        </div>

                        {/* CTAS (GitHub, Live, PDF) */}
                        <div className="pt-8 grid gap-4">
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-5 rounded-[1.25rem] bg-accent text-white font-black hover:scale-[1.03] transition-all shadow-xl shadow-accent/25 group">
                              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                              Launch Live App
                            </a>
                          )}
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-5 rounded-[1.25rem] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                              <Github className="w-5 h-5" /> View Source
                            </a>
                          )}
                          {project.pdfReport && project.pdfReport !== 'none' && (
                            <a href={project.pdfReport} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-5 rounded-[1.25rem] bg-blue-600 text-white font-black hover:scale-[1.03] transition-all shadow-xl shadow-blue-600/25">
                              <FileText className="w-5 h-5" /> Detailed Report
                            </a>
                          )}
                        </div>

                        {/* TECHNICAL DOCUMENTATION */}
                        {(project.databaseSchema || project.apiDocs) && (
                          <div className="pt-8 mt-8 border-t border-slate-200 dark:border-white/10 space-y-4">
                            {project.databaseSchema && (
                              <a href={project.databaseSchema} className="flex items-center gap-3 text-sm font-black text-slate-500 hover:text-accent transition-colors">
                                <Database className="w-4 h-4" /> Database Schema
                              </a>
                            )}
                            {project.apiDocs && (
                              <a href={project.apiDocs} className="flex items-center gap-3 text-sm font-black text-slate-500 hover:text-accent transition-colors">
                                <Code2 className="w-4 h-4" /> API Documentation
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KPI & AUDIT DASHBOARD */}
                    {project.metrics && (
                      <div className="p-10 rounded-[3rem] bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-inner">
                        <div className="flex items-center gap-3 mb-10">
                          <BarChart3 className="w-5 h-5 text-accent" />
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">KPI Performance</h3>
                        </div>
                        
                        {/* LIGHTHOUSE SCORES */}
                        {project.metrics.lighthouseScore && (
                          <div className="grid grid-cols-3 gap-3 mb-12">
                            {Object.entries(project.metrics.lighthouseScore).map(([label, score]) => (
                              <div key={label} className="text-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 shadow-sm">
                                <p className="text-[8px] uppercase font-black text-slate-400 mb-2">{label}</p>
                                <p className={`text-base font-black ${Number(score) >= 90 ? 'text-green-500' : 'text-amber-500'}`}>{score}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* MISC METRICS */}
                        <div className="space-y-6">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Test Coverage</span>
                            <span className="font-black text-accent text-lg">{project.metrics.testCoverage}%</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">CI/CD Pipeline</span>
                            <span className="font-bold dark:text-white">{project.metrics.cicd}</span>
                          </div>
                          {project.metrics.users > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Active Users</span>
                              <span className="font-black dark:text-white text-lg">{project.metrics.users.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* NEXT MILESTONES (Roadmap) */}
                    {project.roadmap && project.roadmap.length > 0 && (
                      <div className="p-10 rounded-[3rem] bg-accent text-white shadow-2xl shadow-accent/20">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-8 flex items-center gap-2">
                          <Target className="w-4 h-4" /> Next Milestones
                        </h3>
                        <div className="space-y-5">
                          {project.roadmap.map((goal, i) => (
                            <div key={i} className="flex gap-4 text-sm font-bold">
                              <div className="mt-1.5 w-2 h-2 shrink-0 rounded-full bg-white/40" />
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
