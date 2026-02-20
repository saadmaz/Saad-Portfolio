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
            <h1 className="font-display text-4xl font-bold mb-2">{project.title}</h1>
            {project.status && (
              <span className="status-badge mr-2">
                {project.status}
              </span>
            )}
            {project.stage && (
              <span className="text-sm px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                {project.stage}
              </span>
            )}
            <p className="text-muted-foreground mt-4">
              {project.longDescription || project.description}
            </p>

            {/* metadata */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {project.startDate && <span>Started: {project.startDate}</span>}
              {project.endDate && <span>Completed: {project.endDate}</span>}
              {project.version && <span>Version: {project.version}</span>}
            </div>

            {/* gallery */}
            {project.images && project.images.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`${project.title} screenshot ${idx + 1}`} className="w-full rounded-lg" />
                ))}
              </div>
            )}

            {/* Tech stack */}
            {(project.technologies || []).length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <span key={t} className="tech-chip">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Tags */}
            {(project.tags || []).length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tech-chip">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Metrics */}
            {project.metrics && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Metrics</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {project.metrics.users !== undefined && <span>Users: {project.metrics.users}</span>}
                  {project.metrics.stars !== undefined && <span>Stars: {project.metrics.stars}</span>}
                  {project.metrics.forks !== undefined && <span>Forks: {project.metrics.forks}</span>}
                  {project.metrics.downloads !== undefined && <span>Downloads: {project.metrics.downloads}</span>}
                </div>
              </div>
            )}

            {/* links */}
            <div className="mt-8 flex flex-wrap gap-4">
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <ExternalLink className="w-4 h-4" /> Live Site
                </a>
              )}
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              {project.caseStudy && (
                <a href={project.caseStudy} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  Case Study
                </a>
              )}
            </div>

            {/* additional details sections */}
            {project.highlights && project.highlights.length > 0 && (
              <div className="mt-10">
                <h3 className="font-semibold mb-2">Highlights</h3>
                <ul className="list-disc ml-5">
                  {project.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}
            {project.challenges && project.challenges.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Challenges</h3>
                <ul className="list-disc ml-5">
                  {project.challenges.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            {project.learnings && project.learnings.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Learnings</h3>
                <ul className="list-disc ml-5">
                  {project.learnings.map((l, i) => <li key={i}>{l}</li>)}
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
