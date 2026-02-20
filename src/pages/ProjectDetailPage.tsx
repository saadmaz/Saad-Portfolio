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
        <div className="section-container max-w-4xl">
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
              <div className="mb-6">
                <h1 className="font-display text-3xl md:text-4xl font-bold">{project.title}</h1>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  {project.status && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10">{project.status}</span>
                  )}
                  {(project.techStack || []).slice(0, 6).map((t) => (
                    <span key={t} className="text-sm px-3 py-1 rounded-full bg-muted/20">{t}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Main column */}
                <div className="md:col-span-2">
                  {project.heroImage && (
                    <img
                      src={project.heroImage}
                      alt={`${project.title} hero`}
                      className="w-full rounded-xl shadow-lg object-cover mb-6 max-h-[420px] w-full"
                    />
                  )}

                  {/* Overview / Story */}
                  <div className="prose prose-sm max-w-none text-sm">
                    {project.overview && (
                      <>
                        <h2 className="text-lg font-semibold">Overview</h2>
                        <p className="mb-4">{project.overview}</p>
                      </>
                    )}

                    {(project.problem || project.solution || project.impact) && (
                      <div className="mt-4">
                        <h2 className="text-lg font-semibold">The Story</h2>
                        {project.problem && (
                          <>
                            <h3 className="font-medium">Problem</h3>
                            <p className="mb-3">{project.problem}</p>
                          </>
                        )}
                        {project.solution && (
                          <>
                            <h3 className="font-medium">Solution</h3>
                            <p className="mb-3">{project.solution}</p>
                          </>
                        )}
                        {project.impact && (
                          <>
                            <h3 className="font-medium">Impact</h3>
                            <p className="mb-3">{project.impact}</p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Engine / Build */}
                    {(project.architecture || project.features || project.challenges) && (
                      <div className="mt-6">
                        <h2 className="text-lg font-semibold">Architecture & Build</h2>
                        {project.architecture?.description && <p className="mb-2">{project.architecture.description}</p>}
                        {project.features && project.features.length > 0 && (
                          <>
                            <h3 className="font-medium">Core Features</h3>
                            <ul className="list-disc ml-5 mb-3">
                              {project.features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                          </>
                        )}
                        {project.challenges && project.challenges.length > 0 && (
                          <div className="space-y-3">
                            {project.challenges.map((c, i) => (
                              <div key={i} className="p-4 rounded-lg border bg-muted/5">
                                {c.wall && <p className="font-medium">{c.wall}</p>}
                                {c.fix && <p className="text-sm">{c.fix}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Media gallery simplified for responsiveness */}
                    {(project.videoDemo || (project.screenshots && project.screenshots.length > 0)) && (
                      <div className="mt-6">
                        <h2 className="text-lg font-semibold">Media</h2>
                        {project.videoDemo && (
                          <p className="mb-2"><a href={project.videoDemo} target="_blank" rel="noreferrer" className="text-accent underline">Watch demo video</a></p>
                        )}
                        {project.screenshots && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {project.screenshots.slice(0,6).map((s,i) => (
                              <img key={i} src={s} alt={`${project.title} ${i+1}`} className="w-full h-28 object-cover rounded-md" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar / Meta */}
                <aside className="md:col-span-1">
                  <div className="sticky top-20 space-y-4">
                    <div className="p-4 rounded-xl border bg-muted/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">{project.date || '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Role</p>
                          <p className="font-medium">{project.role || '—'}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{project.duration || '—'}</p>
                      </div>

                      <div className="mt-4 flex flex-col gap-2">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 justify-center px-3 py-2 rounded-md bg-card/30 hover:opacity-90">
                            <Github className="w-4 h-4" /> <span>View Repo</span>
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 justify-center px-3 py-2 rounded-md bg-accent/10 hover:opacity-90">
                            <ExternalLink className="w-4 h-4" /> <span>Live Demo</span>
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
