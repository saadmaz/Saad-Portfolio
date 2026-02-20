import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { dataManager, Project } from "@/lib/dataManager";
import { motion } from "framer-motion";
import { ExternalLink, Github, ChevronLeft, PlayCircle } from "lucide-react";

const ProjectDetailPage = () => {
  // Extract the slug/id from the URL parameters
  const { slug } = useParams<{ slug: string }>();
  let project: Project | undefined;

  // Logic to find the project by slug or fallback to numeric ID
  if (slug) {
    project = dataManager.getProjectBySlug(slug);
    if (!project && !isNaN(Number(slug))) {
      project = dataManager.getProjectById(Number(slug));
    }
  }

  // 404 State: If the project doesn't exist, show a helpful back link
  if (!project) {
    return (
      <Layout>
        <section className="section-padding text-center min-h-[60vh] flex items-center justify-center">
          <div className="section-container">
            <h1 className="text-3xl font-bold">Project not found</h1>
            <p className="mt-4 text-muted-foreground">Sorry, we couldn't find the project you're looking for.</p>
            <Link to="/projects" className="inline-flex items-center gap-1 text-accent mt-6 hover:underline">
              <ChevronLeft className="w-4 h-4" /> Back to projects
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding pt-10">
        {/* Increased max-width to [1400px] to utilize side spaces on ultra-wide monitors */}
        <div className="section-container max-w-[1400px] mx-auto px-4">
          
          {/* Breadcrumb navigation for easy return */}
          <Link to="/projects" className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors mb-8 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">All Projects</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }} // Smooth entrance animation start
            animate={{ opacity: 1, y: 0 }}   // Smooth entrance animation end
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* The Main Content Card - Glassmorphism effect with backdrop-blur */}
            <div className="bg-card/40 rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-md border border-white/5">
              
              {/* Header Section: Title, Status, and Tech Pills */}
              <div className="mb-12">
                <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  {project.title}
                </h1>
                <div className="mt-6 flex items-center gap-4 flex-wrap">
                  {project.status && (
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-accent/20 text-accent border border-accent/20">
                      {project.status}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {/* Limit tech stack display to prevent clutter, showing first 8 items */}
                    {(project.techStack || []).slice(0, 8).map((t) => (
                      <span key={t} className="text-xs px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white/80">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid Layout: Main content (left) vs Sidebar (right) */}
              {/* md:grid-cols-12 provides a fine-tuned control over the 75% / 25% split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* LEFT COLUMN: Deep dive into project details (Spans 8/12 of the grid) */}
                <div className="lg:col-span-8 space-y-12">
                  
                  {/* Hero Image: Prominent visual of the work */}
                  {project.heroImage && (
                    <div className="relative group overflow-hidden rounded-2xl">
                      <img
                        src={project.heroImage}
                        alt={`${project.title} hero`}
                        className="w-full shadow-2xl object-cover h-64 md:h-[500px] transform transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>
                  )}

                  {/* Textual Content Sections */}
                  <div className="max-w-none space-y-12">
                    {/* Overview: High-level summary */}
                    {project.overview && (
                      <div className="prose prose-invert max-w-none">
                        <h2 className="text-2xl font-bold border-l-4 border-accent pl-4">Overview</h2>
                        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{project.overview}</p>
                      </div>
                    )}

                    {/* The Story: Problem, Solution, and Outcome */}
                    {(project.problem || project.solution || project.impact) && (
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 bg-white/5 p-8 rounded-2xl border border-white/5">
                        <h2 className="text-xl font-bold uppercase tracking-tighter text-accent/80">The Narrative</h2>
                        <div className="space-y-8">
                          {project.problem && (
                            <div>
                              <h3 className="text-white font-semibold flex items-center gap-2 underline decoration-accent/30 underline-offset-4">Problem</h3>
                              <p className="text-muted-foreground leading-relaxed mt-2">{project.problem}</p>
                            </div>
                          )}
                          {project.solution && (
                            <div>
                              <h3 className="text-white font-semibold flex items-center gap-2 underline decoration-accent/30 underline-offset-4">Solution</h3>
                              <p className="text-muted-foreground leading-relaxed mt-2">{project.solution}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Architecture: Technical breakdown and Feature list */}
                    {(project.architecture || project.features) && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Architecture & Build</h2>
                        {project.architecture?.description && (
                          <p className="text-muted-foreground leading-relaxed">{project.architecture.description}</p>
                        )}
                        {project.features && project.features.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {project.features.map((f, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                                <span className="text-sm">{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Media: Visual proof of the working product */}
                    {(project.videoDemo || (project.screenshots && project.screenshots.length > 0)) && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Project Gallery</h2>
                        {project.screenshots && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {project.screenshots.slice(0, 6).map((s, i) => (
                              <img 
                                key={i} 
                                src={s} 
                                alt={`Screenshot ${i + 1}`} 
                                className="w-full h-40 md:h-48 object-cover rounded-xl border border-white/10 hover:border-accent/50 transition-colors cursor-zoom-in" 
                              />
                            ))}
                          </div>
                        )}
                        {project.videoDemo && (
                          <a href={project.videoDemo} target="_blank" rel="noreferrer" 
                             className="inline-flex items-center gap-2 p-4 w-full justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-accent">
                            <PlayCircle className="w-5 h-5" />
                            <span className="font-semibold">Watch Full Video Walkthrough</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Metadata and CTAs (Spans 4/12 of the grid) */}
                <aside className="lg:col-span-4 lg:pl-4">
                  {/* sticky top-24 keeps this card visible while the user scrolls long content on the left */}
                  <div className="sticky top-24 space-y-6">
                    
                    {/* Project Specs Card */}
                    <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent shadow-xl">
                      <div className="grid grid-cols-2 gap-6 pb-6 border-b border-white/10">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Date</p>
                          <p className="font-semibold mt-1">{project.date || '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Role</p>
                          <p className="font-semibold mt-1">{project.role || '—'}</p>
                        </div>
                      </div>

                      <div className="py-6">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Development Duration</p>
                        <p className="font-medium mt-1 text-lg">{project.duration || '—'}</p>
                      </div>

                      {/* Action Buttons: Repository and Live Preview */}
                      <div className="grid gap-4 mt-4">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" 
                             className="flex items-center gap-3 justify-center px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                            <Github className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                            <span className="font-bold">Source Code</span>
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" 
                             className="flex items-center gap-3 justify-center px-6 py-3 rounded-xl bg-accent text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] transition-all group">
                            <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
                            <span className="font-bold">Live Preview</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Performance Metrics Card: Quantitative data */}
                    {project.metrics && (
                      <div className="p-6 rounded-2xl border border-white/5 bg-black/20">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Success Metrics</h3>
                        <div className="space-y-4">
                          {project.metrics.users !== undefined && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-white/60">Active Users</span>
                              <span className="font-mono text-accent">{project.metrics.users.toLocaleString()}</span>
                            </div>
                          )}
                          {project.metrics.testCoverage !== undefined && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white/60">Test Coverage</span>
                                <span>{project.metrics.testCoverage}%</span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-accent h-full" style={{ width: `${project.metrics.testCoverage}%` }} />
                              </div>
                            </div>
                          )}
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
