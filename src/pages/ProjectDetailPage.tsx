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
            transition={{ duration: 0.5 }}
          >
            {/* --- Header --- */}
            <h1 className="font-display text-4xl font-bold mb-2">{project.title}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              {project.status && (
                <span className="status-badge">{project.status}</span>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Live Site
                </a>
              )}
            </div>

            {project.heroImage && (
              <img
                src={project.heroImage}
                alt={`${project.title} hero`}
                className="w-full rounded-lg my-6"
              />
            )}

            {/* --- Quick Overview --- */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {(project.techStack || []).map((t) => (
                <span key={t} className="tech-chip">
                  {t}
                </span>
              ))}
              {project.role && <span>Role: {project.role}</span>}
              {project.duration && <span>Duration: {project.duration}</span>}
            </div>

            {/* --- The Story --- */}
            {(project.problem || project.solution || project.impact) && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">The Story</h2>
                {project.problem && (
                  <>
                    <h3 className="font-medium">The Challenge</h3>
                    <p className="mb-4">{project.problem}</p>
                  </>
                )}
                {project.solution && (
                  <>
                    <h3 className="font-medium">The Solution</h3>
                    <p className="mb-4">{project.solution}</p>
                  </>
                )}
                {project.impact && (
                  <>
                    <h3 className="font-medium">Impact</h3>
                    <p className="mb-4">{project.impact}</p>
                  </>
                )}
              </div>
            )}

            {/* --- The Engine --- */}
            {(project.architecture || project.databaseSchema || project.apiDocs || project.stackDeepDive) && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">The Engine</h2>
                {project.architecture?.description && (
                  <p className="mb-2">{project.architecture.description}</p>
                )}
                {project.architecture?.diagramUrl && (
                  <img
                    src={project.architecture.diagramUrl}
                    alt="Architecture diagram"
                    className="w-full rounded-lg mb-4"
                  />
                )}
                {project.databaseSchema && (
                  <p className="mb-2">
                    <strong>Database Schema:</strong> {project.databaseSchema}
                  </p>
                )}
                {project.apiDocs && (
                  <p className="mb-2">
                    <a
                      href={project.apiDocs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      API Documentation
                    </a>
                  </p>
                )}
                {project.stackDeepDive && (
                  <div className="mt-4">
                    {project.stackDeepDive.frontend && (
                      <p>
                        <strong>Frontend:</strong> {project.stackDeepDive.frontend}
                      </p>
                    )}
                    {project.stackDeepDive.backend && (
                      <p>
                        <strong>Backend:</strong> {project.stackDeepDive.backend}
                      </p>
                    )}
                    {project.stackDeepDive.aiIntegration && (
                      <p>
                        <strong>AI Integration:</strong> {project.stackDeepDive.aiIntegration}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* --- The Build --- */}
            {(project.challenges && project.challenges.length > 0) ||
            (project.features && project.features.length > 0) ? (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">The Build</h2>
                {project.challenges && project.challenges.length > 0 && (
                  <div className="space-y-4">
                    {project.challenges.map((c, i) => (
                      <div
                        key={i}
                        className="p-4 border rounded-lg bg-secondary/10"
                      >
                        {c.wall && <p><strong>The Wall:</strong> {c.wall}</p>}
                        {c.fix && <p><strong>The Fix:</strong> {c.fix}</p>}
                        {c.lesson && <p><strong>Lesson:</strong> {c.lesson}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {project.features && project.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Core Features</h3>
                    <ul className="list-disc ml-5 space-y-1">
                      {project.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {/* --- Performance & Impact --- */}
            {project.status === "Live" && project.metrics && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Performance & Impact</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {project.metrics.users !== undefined && (
                    <p>Active users: {project.metrics.users}</p>
                  )}
                  {project.metrics.lighthouseScore && (
                    <p>
                      Lighthouse - Perf: {project.metrics.lighthouseScore.performance}
                      , Acc: {project.metrics.lighthouseScore.accessibility}
                      , SEO: {project.metrics.lighthouseScore.seo}
                    </p>
                  )}
                  {project.metrics.testCoverage !== undefined && (
                    <p>Test coverage: {project.metrics.testCoverage}%</p>
                  )}
                  {project.metrics.cicd && <p>CI/CD: {project.metrics.cicd}</p>}
                </div>
              </div>
            )}

            {/* --- Media Gallery --- */}
            {(project.screenshots && project.screenshots.length > 0) || project.videoDemo ? (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Media Gallery</h2>
                {project.videoDemo && (
                  <div className="mb-4">
                    <a
                      href={project.videoDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Watch demo video
                    </a>
                  </div>
                )}
                {project.screenshots && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.screenshots.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`${project.title} screenshot ${i + 1}`}
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* --- The Future --- */}
            {project.roadmap && project.roadmap.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">The Future</h2>
                <ul className="list-disc ml-5 space-y-1">
                  {project.roadmap.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectDetailPage;
