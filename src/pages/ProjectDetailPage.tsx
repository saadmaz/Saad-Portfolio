import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { dataManager, Project } from "@/lib/dataManager";
import { motion } from "framer-motion";
import { ExternalLink, Github, ChevronLeft } from "lucide-react";

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  let project: Project | undefined;
  if (slug) {

    // try slug then numeric id
    project = dataManager.getProjectBySlug(slug);
    if (!project && !isNaN(Number(slug))) {
      project = dataManager.getProjectById(Number(slug));
    }
  }

  if (!project) {
    return (
      <Layout>
        <section className="section-padding text-center">
          <div className="section-container">
            <h1 className="text-3xl font-bold">Project not found</h1>
            <p className="mt-4">Sorry, we couldn't find the project you're looking for.</p>
            <Link to="/projects" className="inline-flex items-center gap-1 text-accent mt-6">
              <ChevronLeft className="w-4 h-4" /> Back to projects
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="section-container max-w-6xl mx-auto">
          {/* Back link */}
          <Link to="/projects" className="inline-flex items-center gap-1 text-accent mb-6">
            <ChevronLeft className="w-4 h-4" /> All Projects
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="bg-card/60 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
              <div className="mb-8">
                <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">{project.title}</h1>
                <div className="mt-4 flex items-center gap-4 flex-wrap">
                  {project.status && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-accent/10">{project.status}</span>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(project.techStack || []).slice(0, 8).map((t) => (
                      <span key={t} className="text-sm px-3 py-1 rounded-full bg-muted/10 border border-muted/20">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                {/* Main column */}
                <div className="md:col-span-3">
                  {project.heroImage && (
                    <img
                      src={project.heroImage}
                      alt={`${project.title} hero`}
                      className="w-full rounded-xl shadow-2xl object-cover mb-8 h-64 md:h-[420px]"
                    />
                  )}

                  {/* Overview / Story */}
                  <div className="max-w-none text-sm space-y-6">
                    {project.overview && (
                      <div>
                        <h2 className="text-xl md:text-2xl font-semibold">Overview</h2>
                        <p className="mt-2 text-base leading-relaxed">{project.overview}</p>
                      </div>
                    )}

                    {(project.problem || project.solution || project.impact) && (
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold">The Story</h2>
                        <div className="mt-3 space-y-4">
                          {project.problem && (
                            <div>
                              <h3 className="font-medium">Problem</h3>
                              <p className="text-sm leading-relaxed mt-1">{project.problem}</p>
                            </div>
                          )}
                          {project.solution && (
                            <div>
                              <h3 className="font-medium">Solution</h3>
                              <p className="text-sm leading-relaxed mt-1">{project.solution}</p>
                            </div>
                          )}
                          {project.impact && (
                            <div>
                              <h3 className="font-medium">Impact</h3>
                              <p className="text-sm leading-relaxed mt-1">{project.impact}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Engine / Build */}
                    {(project.architecture || project.features || project.challenges) && (
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold">Architecture & Build</h2>
                        <div className="mt-3 space-y-3">
                          {project.architecture?.description && <p className="text-sm leading-relaxed">{project.architecture.description}</p>}
                          {project.features && project.features.length > 0 && (
                            <div>
                              <h3 className="font-medium">Core Features</h3>
                              <ul className="list-disc ml-5 mt-2 space-y-1">
                                {project.features.map((f, i) => <li key={i}>{f}</li>)}
                              </ul>
                            </div>
                          )}
                          {project.challenges && project.challenges.length > 0 && (
                            <div className="space-y-3">
                              {project.challenges.map((c, i) => (
                                <div key={i} className="p-4 rounded-lg border bg-muted/5">
                                  {c.wall && <p className="font-medium">{c.wall}</p>}
                                  {c.fix && <p className="text-sm mt-1">{c.fix}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Media gallery simplified for responsiveness */}
                    {(project.videoDemo || (project.screenshots && project.screenshots.length > 0)) && (
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold">Media</h2>
                        <div className="mt-3">
                          {project.videoDemo && (
                            <p className="mb-2"><a href={project.videoDemo} target="_blank" rel="noreferrer" className="text-accent underline">Watch demo video</a></p>
                          )}
                          {project.screenshots && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {project.screenshots.slice(0,6).map((s,i) => (
                                <img key={i} src={s} alt={`${project.title} ${i+1}`} className="w-full h-32 md:h-28 object-cover rounded-md" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar / Meta */}
                <aside className="md:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    <div className="p-6 rounded-2xl border bg-card/5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-semibold mt-1">{project.date || '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Role</p>
                          <p className="font-semibold mt-1">{project.role || '—'}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium mt-1">{project.duration || '—'}</p>
                      </div>

                      <div className="mt-5 grid gap-3">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10">
                            <Github className="w-4 h-4" /> <span className="font-medium">View Repo</span>
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-lg bg-accent text-white hover:shadow">
                            <ExternalLink className="w-4 h-4" /> <span className="font-medium">Live Demo</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Metrics card */}
                    {project.metrics && (
                      <div className="p-4 rounded-xl border bg-muted/5">
                        <h3 className="text-sm font-semibold mb-2">Performance</h3>
                        <div className="text-sm space-y-1">
                          {project.metrics.users !== undefined && <div>Users: <strong>{project.metrics.users}</strong></div>}
                          {project.metrics.testCoverage !== undefined && <div>Coverage: <strong>{project.metrics.testCoverage}%</strong></div>}
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
