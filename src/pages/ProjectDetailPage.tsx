import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { dataManager, Project } from "@/lib/dataManager";
import { motion } from "framer-motion";
import { 
  ExternalLink, Github, ChevronLeft, PlayCircle, 
  FileText, CheckCircle2, Zap, Trophy, Target, AlertCircle,
  Lightbulb, Rocket, ShieldCheck, Database, Code2, 
  Cpu, Layers, Calendar, Clock, User, BarChart3
} from "lucide-react";

/**
 * PROJECT DETAIL PAGE - HIGH FIDELITY VERSION
 * Features:
 * 1. 100% Data Mapping: Every key in your JSON is rendered.
 * 2. Side-gutter utilization: Max-width 1400px for desktop.
 * 3. Conditional Rendering: Sections hide automatically if data is null/empty.
 * 4. Dual-Mode Optimized: Uses slate/white for light and black/transparent for dark.
 */
const ProjectDetailPage = () => {
  // --- DATA INITIALIZATION ---
  const { slug } = useParams<{ slug: string }>();
  let project: Project | undefined;

  // Retrieve project based on URL slug or ID fallback
  if (slug) {
    project = dataManager.getProjectBySlug(slug);
    if (!project && !isNaN(Number(slug))) {
      project = dataManager.getProjectById(Number(slug));
    }
  }

  // --- 404 / ERROR STATE ---
  if (!project) {
    return (
      <Layout>
        <section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Project Missing</h1>
          <Link to="/projects" className="mt-4 text-accent flex items-center gap-2 hover:underline">
            <ChevronLeft className="w-4 h-4" /> Return to Gallery
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-8 pb-20 bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          
          {/* TOP NAVIGATION BREADCRUMB */}
          <nav className="mb-10">
            <Link to="/projects" className="group inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-accent transition-colors">
              <div className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-accent transition-all">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-widest uppercase">Back to All Projects</span>
            </Link>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* --- PRIMARY PROJECT CARD --- */}
            {/* Note: project.colour drives the "vibe" of the card background */}
            <div className={`relative rounded-[2.5rem] p-6 md:p-16 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/5 overflow-hidden bg-gradient-to-br ${project.colour || 'from-slate-100 to-white dark:from-slate-900 dark:to-slate-950'}`}>
              
              {/* CORNER STATUS INDICATOR */}
              <div className="absolute top-8 right-8 z-20">
                <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-xl">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${project.status === 'Live' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">{project.status}</span>
                </div>
              </div>

              {/* --- HERO SECTION: TITLE & SUBTITLE --- */}
              <header className="mb-16 max-w-4xl relative z-10">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">
                  {project.title}
                </h1>
                <p className="text-xl md:text-3xl text-slate-600 dark:text-slate-400 font-medium leading-tight">
                  {project.tagline}
                </p>
                
                {/* TECH STACK CHIPS */}
                <div className="mt-8 flex flex-wrap gap-2">
                  {project.techStack?.map((tech) => (
                    <span key={tech} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </header>

              {/* --- MAIN CONTENT GRID (8:4 Ratio) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative z-10">
                
                {/* LEFT SIDE: THE DEEP DIVE (Content Heavy) */}
                <div className="lg:col-span-8 space-y-20">
                  
                  {/* 1. HERO VISUAL */}
                  {project.heroImage && (
                    <div className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
                      <img src={project.heroImage} alt="Hero Visual" className="w-full object-cover h-[300px] md:h-[600px] transform group-hover:scale-105 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  )}

                  {/* 2. OVERVIEW SECTION */}
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-accent">Introduction</h2>
                      <div className="h-px w-10 bg-slate-200 dark:bg-white/10" />
                    </div>
                    <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                      {project.overview}
                    </p>
                  </section>

                  {/* 3. THE CASE STUDY (PROBLEM, SOLUTION, IMPACT) */}
                  {(project.problem || project.solution || project.impact) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {project.problem && (
                        <div className="group p-8 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-amber-500/50 transition-all">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                            <Lightbulb className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">The Problem</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.problem}</p>
                        </div>
                      )}
                      {project.solution && (
                        <div className="group p-8 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-blue-500/50 transition-all">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                            <Rocket className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">The Solution</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.solution}</p>
                        </div>
                      )}
                      {project.impact && (
                        <div className="group p-8 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-emerald-500/50 transition-all">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">The Impact</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{project.impact}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. ARCHITECTURE SECTION */}
                  <section className="space-y-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <Layers className="w-8 h-8 text-accent" /> Architecture & Strategy
                    </h2>
                    {project.architecture?.description && (
                      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{project.architecture.description}</p>
                    )}
                    {project.architecture?.diagramUrl && (
                      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black p-4">
                        <img src={project.architecture.diagramUrl} alt="Architecture Diagram" className="w-full rounded-2xl" />
                        <div className="mt-4 flex items-center justify-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-accent" />
                           <span className="text-[10px] uppercase font-black tracking-widest opacity-50">Technical System Design Diagram</span>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* 5. STACK DEEP DIVE (JSON KEY: stackDeepDive) */}
                  {project.stackDeepDive && (
                    <section className="p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl">
                      <h2 className="text-2xl font-bold mb-10 flex items-center gap-3">
                        <Cpu className="w-6 h-6 text-accent" /> Technical Stack Deep-Dive
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {project.stackDeepDive.frontend && (
                          <div>
                            <span className="text-accent text-[10px] uppercase font-black tracking-[0.2em]">Frontend Architecture</span>
                            <p className="mt-2 text-slate-300 leading-relaxed font-medium">{project.stackDeepDive.frontend}</p>
                          </div>
                        )}
                        {project.stackDeepDive.backend && (
                          <div>
                            <span className="text-accent text-[10px] uppercase font-black tracking-[0.2em]">Backend Logic</span>
                            <p className="mt-2 text-slate-300 leading-relaxed font-medium">{project.stackDeepDive.backend}</p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* 6. CHALLENGES & LESSONS (JSON KEY: challenges) */}
                  {project.challenges && project.challenges.length > 0 && (
                    <section className="space-y-10">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Challenges Overcome</h2>
                      <div className="grid gap-6">
                        {project.challenges.map((c, i) => (
                          <div key={i} className="flex flex-col md:flex-row gap-6 p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/20 dark:bg-white/5">
                            <div className="w-14 h-14 shrink-0 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                              <AlertCircle className="w-7 h-7" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{c.wall}</h4>
                              <p className="mt-2 text-slate-600 dark:text-slate-400"><strong>The Fix:</strong> {c.fix}</p>
                              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-accent/10 text-accent text-xs font-bold">
                                <Lightbulb className="w-3 h-3" /> Key Lesson: {c.lesson}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 7. GALLERY (JSON KEY: screenshots) */}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <section className="space-y-8">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Interface Gallery</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.screenshots.map((shot, i) => (
                          <img key={i} src={shot} alt="Screenshot" className="w-full rounded-2xl border border-slate-200 dark:border-white/10 hover:scale-[1.02] transition-transform duration-500 cursor-zoom-in shadow-lg" />
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* --- RIGHT SIDE: THE COMMAND CENTER (Sticky Sidebar) --- */}
                <aside className="lg:col-span-4 lg:pl-6">
                  <div className="sticky top-12 space-y-8">
                    
                    {/* CORE META DATA */}
                    <div className="p-8 rounded-[2rem] bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-2xl">
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completed On</p>
                            <p className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> {project.date}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Spent</p>
                            <p className="font-bold flex items-center gap-2 justify-end"><Clock className="w-4 h-4 text-accent" /> {project.duration}</p>
                          </div>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">My Involvement</p>
                          <p className="font-bold flex items-center gap-2"><User className="w-4 h-4 text-accent" /> {project.role}</p>
                        </div>

                        {/* PRIMARY CALLS TO ACTION */}
                        <div className="pt-8 grid gap-4">
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-accent text-white font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20">
                              <ExternalLink className="w-5 h-5" /> Launch Live Application
                            </a>
                          )}
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                              <Github className="w-5 h-5" /> Explore Source Code
                            </a>
                          )}
                          {project.pdfReport && project.pdfReport !== 'none' && (
                            <a href={project.pdfReport} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-600/20 font-bold hover:bg-blue-600/20 transition-all">
                              <FileText className="w-5 h-5" /> Project Case PDF
                            </a>
                          )}
                        </div>

                        {/* TECH ASSET LINKS */}
                        {(project.databaseSchema || project.apiDocs) && (
                          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 gap-3">
                            {project.databaseSchema && (
                              <a href={project.databaseSchema} className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-accent transition-colors">
                                <Database className="w-4 h-4" /> View DB Schema
                              </a>
                            )}
                            {project.apiDocs && (
                              <a href={project.apiDocs} className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-accent transition-colors">
                                <Code2 className="w-4 h-4" /> Documentation API
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QUANTITATIVE SUCCESS METRICS (JSON KEY: metrics) */}
                    {project.metrics && (
                      <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-accent" /> KPIs & Performance
                        </h3>
                        
                        {/* LIGHTHOUSE RADAR SCORES */}
                        {project.metrics.lighthouseScore && (
                          <div className="grid grid-cols-3 gap-3 mb-10">
                            {Object.entries(project.metrics.lighthouseScore).map(([label, score]) => (
                              <div key={label} className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <p className="text-[8px] uppercase font-black text-slate-400 mb-1">{label}</p>
                                <p className={`text-sm font-black ${Number(score) > 90 ? 'text-green-500' : 'text-amber-500'}`}>{score}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* METRIC ROWS */}
                        <div className="space-y-5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Test Coverage</span>
                            <span className="font-black text-accent">{project.metrics.testCoverage}%</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">CI/CD Pipeline</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{project.metrics.cicd}</span>
                          </div>
                          {project.metrics.users > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-medium">Daily Active Users</span>
                              <span className="font-black text-slate-700 dark:text-slate-300">{project.metrics.users.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* FUTURE PLANNING (JSON KEY: roadmap) */}
                    {project.roadmap && project.roadmap.length > 0 && (
                      <div className="p-8 rounded-[2rem] bg-accent/5 border border-accent/10">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-6 flex items-center gap-2">
                          <Target className="w-4 h-4" /> Next Milestones
                        </h3>
                        <div className="space-y-4">
                          {project.roadmap.map((goal, i) => (
                            <div key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
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
