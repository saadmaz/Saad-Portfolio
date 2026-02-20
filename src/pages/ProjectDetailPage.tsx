import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { dataManager, Project } from "@/lib/dataManager";
import { motion } from "framer-motion";
import { 
  ExternalLink, Github, ChevronLeft, PlayCircle, 
  FileText, CheckCircle2, Zap, Trophy, Target, AlertCircle,
  Lightbulb, Rocket, ShieldCheck
} from "lucide-react";

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  let project: Project | undefined;

  // FETCH DATA
  if (slug) {
    project = dataManager.getProjectBySlug(slug);
    if (!project && !isNaN(Number(slug))) {
      project = dataManager.getProjectById(Number(slug));
    }
  }

  // 404 STATE
  if (!project) {
    return (
      <Layout>
        <section className="section-padding text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="section-container">
            <h1 className="text-3xl font-bold dark:text-white text-slate-900">Project not found</h1>
            <Link to="/projects" className="inline-flex items-center gap-1 text-accent mt-6 font-medium">
              <ChevronLeft className="w-4 h-4" /> Back to projects
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding pt-10 dark:bg-slate-950 bg-slate-50 transition-colors duration-300">
        <div className="section-container max-w-[1400px] mx-auto px-4">
          
          {/* BACK LINK */}
          <Link to="/projects" className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors mb-8 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">All Projects</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`relative rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-md border border-slate-200 dark:border-white/5 overflow-hidden bg-gradient-to-br ${project.colour || 'from-white to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50'}`}>
              
              {/* STATUS BADGE */}
              {project.status && (
                <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10">
                   <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] bg-accent text-white shadow-lg shadow-accent/20">
                    {project.status}
                  </span>
                </div>
              )}

              {/* HEADER: Title & Tech */}
              <div className="mb-12 max-w-full lg:max-w-[70%]">
                <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {project.title}
                </h1>
                <p className="text-xl mt-4 text-slate-600 dark:text-white/60 font-medium">{project.tagline}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {(project.techStack || []).map((t) => (
                    <span key={t} className="text-xs px-3 py-1 rounded-md bg-slate-200/50 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/90 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* LEFT COLUMN */}
                <div className="lg:col-span-8 space-y-12">
                  
                  {/* MAIN IMAGE */}
                  {project.heroImage && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
                      <img src={project.heroImage} alt={project.title} className="w-full object-cover h-64 md:h-[500px]" />
                    </div>
                  )}

                  {/* OVERVIEW */}
                  {project.overview && (
                    <div className="max-w-none">
                      <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                        <span className="w-8 h-[2px] bg-accent rounded-full" /> Overview
                      </h2>
                      <p className="mt-4 text-lg text-slate-600 dark:text-white/70 leading-relaxed font-light">{project.overview}</p>
                    </div>
                  )}

                  {/* THE STORY (Problem, Solution, Impact) - FETCHING FROM JSON */}
                  {(project.problem || project.solution || project.impact) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {project.problem && (
                        <div className="p-6 rounded-2xl bg-white/30 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                          <Lightbulb className="w-6 h-6 text-amber-500 mb-4" />
                          <h3 className="font-bold text-slate-900 dark:text-white mb-2">The Problem</h3>
                          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">{project.problem}</p>
                        </div>
                      )}
                      {project.solution && (
                        <div className="p-6 rounded-2xl bg-white/30 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                          <Rocket className="w-6 h-6 text-blue-500 mb-4" />
                          <h3 className="font-bold text-slate-900 dark:text-white mb-2">The Solution</h3>
                          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">{project.solution}</p>
                        </div>
                      )}
                      {project.impact && (
                        <div className="p-6 rounded-2xl bg-white/30 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                          <ShieldCheck className="w-6 h-6 text-emerald-500 mb-4" />
                          <h3 className="font-bold text-slate-900 dark:text-white mb-2">The Impact</h3>
                          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">{project.impact}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ARCHITECTURE & BUILD */}
                  {(project.architecture || project.features) && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Architecture & Build</h2>
                      {project.architecture?.description && (
                        <p className="text-slate-600 dark:text-white/70 leading-relaxed">{project.architecture.description}</p>
                      )}
                      
                      {project.architecture?.diagramUrl && (
                        <div className="mt-4 p-4 bg-slate-100 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 mb-3 font-bold">Architecture Diagram</p>
                          <img src={project.architecture.diagramUrl} alt="Architecture" className="w-full rounded-lg" />
                        </div>
                      )}

                      {/* FEATURES */}
                      {project.features && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          {project.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white/40 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                              <CheckCircle2 className="w-4 h-4 text-accent" />
                              <span className="text-sm font-semibold text-slate-700 dark:text-white/80">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SCREENSHOTS GALLERY */}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gallery</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.screenshots.map((img, i) => (
                          <img key={i} src={img} alt={`Screenshot ${i}`} className="rounded-xl border border-slate-200 dark:border-white/10 w-full h-64 object-cover" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CHALLENGES */}
                  {project.challenges && project.challenges.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Challenges & Lessons</h2>
                      <div className="grid gap-4">
                        {project.challenges.map((c, i) => (
                          <div key={i} className="p-6 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/5">
                            <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{c.wall}</h4>
                                <p className="text-sm text-slate-600 dark:text-white/60 mt-1"><strong>Fix:</strong> {c.fix}</p>
                                {c.lesson && <div className="mt-3 text-xs font-medium text-accent px-2 py-1 bg-accent/5 rounded inline-block">💡 {c.lesson}</div>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDEBAR */}
                <aside className="lg:col-span-4 lg:pl-4">
                  <div className="sticky top-24 space-y-6">
                    
                    <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-black/20 shadow-xl backdrop-blur-md">
                      <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 font-bold">Date</p>
                          <p className="font-bold mt-1 text-slate-900 dark:text-white">{project.date || '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 font-bold">Role</p>
                          <p className="font-bold mt-1 text-slate-900 dark:text-white">{project.role || 'Developer'}</p>
                        </div>
                      </div>

                      {/* LINKS */}
                      <div className="grid gap-3 mt-8">
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 justify-center px-6 py-3.5 rounded-xl bg-accent text-white font-bold hover:brightness-110 shadow-lg shadow-accent/20 transition-all">
                            <ExternalLink className="w-5 h-5" /> Live Demo
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 justify-center px-6 py-3.5 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10 transition-all text-slate-900 dark:text-white font-bold">
                            <Github className="w-5 h-5" /> Source Code
                          </a>
                        )}
                        {project.pdfReport && project.pdfReport !== "none" && (
                          <a href={project.pdfReport} target="_blank" rel="noreferrer" className="flex items-center gap-3 justify-center px-6 py-3.5 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-600/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold">
                            <FileText className="w-5 h-5" /> Report (PDF)
                          </a>
                        )}
                      </div>
                    </div>

                    {/* METRICS */}
                    {project.metrics && (
                      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40">
                        <div className="flex items-center gap-2 mb-6">
                          <Trophy className="w-4 h-4 text-accent" />
                          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">Performance</h3>
                        </div>
                        
                        {project.metrics.lighthouseScore && (
                          <div className="grid grid-cols-3 gap-2 mb-6">
                             {Object.entries(project.metrics.lighthouseScore).map(([key, val]) => (
                               <div key={key} className="text-center p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm">
                                 <p className="text-[9px] uppercase text-slate-400 font-bold mb-1">{key}</p>
                                 <p className={`text-sm font-black ${Number(val) >= 90 ? 'text-green-500' : 'text-yellow-500'}`}>{val}</p>
                               </div>
                             ))}
                          </div>
                        )}

                        <div className="space-y-4 text-sm font-medium">
                          <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                            <span className="text-slate-500 dark:text-white/60">CI/CD</span>
                            <span className="text-accent">{project.metrics.cicd || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-white/60">Coverage</span>
                            <span className="text-slate-900 dark:text-white">{project.metrics.testCoverage}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ROADMAP */}
                    {project.roadmap && project.roadmap.length > 0 && (
                      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-accent/5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Future Roadmap</h3>
                        <div className="space-y-3">
                          {project.roadmap.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-600 dark:text-white/80">
                              <Target className="w-4 h-4 text-accent/50" />
                              <span className="text-sm font-medium">{item}</span>
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