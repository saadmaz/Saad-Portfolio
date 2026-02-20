/**
 * Example Components showing how to use the new data structure
 * Copy and adapt these patterns to your existing components
 */

import React from "react";
import {
  useBlogs,
  useFeaturedProjects,
  useWorkExperience,
  useSkills,
  useNewslettersByType,
  useEvents,
  useCertificates,
  useActiveHosting,
} from "@/hooks/usePortfolioData";

/**
 * Example 1: Blog List Component
 * Shows latest blogs first
 */
export function BlogListExample() {
  const { blogs, loading } = useBlogs();

  if (loading) return <div>Loading blogs...</div>;

  return (
    <div>
      <h2>Latest Blog Posts</h2>
      <div className="grid gap-4">
        {blogs.map((blog) => (
          <article key={blog.id} className="p-4 border rounded">
            <h3>{blog.title}</h3>
            <p className="text-gray-600">{blog.excerpt}</p>
            <div className="flex gap-2 text-sm mt-2">
              <span className="bg-blue-100 px-2 py-1 rounded">{blog.category}</span>
              <span className="text-gray-500">{blog.readTime}</span>
              <span className="text-gray-500">{blog.date}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 2: Featured Projects
 * Shows only featured projects, latest first, limited to 3
 */
export function FeaturedProjectsExample() {
  const { projects, loading } = useFeaturedProjects(3);

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <h2>Featured Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="border rounded overflow-hidden">
            {/* fallback to heroImage or legacy image field */}
            <img
              src={project.heroImage || project.image}
              alt={project.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold">{project.title}</h3>
              <p className="text-gray-600 text-sm">{project.tagline || project.description}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(project.techStack || project.technologies || []).map((tech) => (
                  <span key={tech} className="bg-gray-100 px-2 py-1 text-xs rounded">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-center text-sm"
                  >
                    View
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-800 text-white px-2 py-1 rounded text-center text-sm"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 3: Work Experience Timeline
 * Shows latest work experience first
 */
export function WorkExperienceExample() {
  const { experience, loading } = useWorkExperience();

  if (loading) return <div>Loading experience...</div>;

  return (
    <div>
      <h2>Work Experience</h2>
      <div className="space-y-6">
        {experience.map((job, index) => (
          <div key={job.id} className="relative pl-6">
            {index !== experience.length - 1 && (
              <div className="absolute left-1 top-8 w-px h-12 bg-gray-200" />
            )}
            <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-blue-500" />
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{job.position}</h3>
                  <p className="text-gray-600">{job.company}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {job.startDate} - {job.endDate}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1">{job.location}</p>
              <p className="mt-2">{job.description}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {job.technologies.map((tech) => (
                  <span key={tech} className="bg-blue-50 px-2 py-1 text-xs rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 4: Skills by Category
 * Shows all skills grouped by category
 */
export function SkillsExample() {
  const { skills, loading } = useSkills();

  if (loading) return <div>Loading skills...</div>;

  return (
    <div>
      <h2>Skills</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((category) => (
          <div key={category.category} className="border rounded p-4">
            <h3 className="font-bold mb-3">{category.category}</h3>
            <div className="space-y-2">
              {category.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm">
                    <span>{skill.name}</span>
                    <span className="text-gray-500">{skill.years} yrs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className="bg-blue-500 h-2 rounded"
                      style={{ width: `${(skill.level / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 5: Newsletters (Separated by Type)
 * Shows CSE newsletter separately from Founder newsletter
 */
export function NewslettersExample() {
  const { newsletters: cseNews, loading: cseLoading } = useNewslettersByType("cse");
  const { newsletters: founderNews, loading: founderLoading } =
    useNewslettersByType("founder");

  if (cseLoading || founderLoading) return <div>Loading newsletters...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* CSE Newsletter */}
      <div>
        <h3 className="font-bold mb-4">CSE Newsletter</h3>
        <div className="space-y-3">
          {cseNews.map((letter) => (
            <a
              key={letter.id}
              href={letter.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 border rounded hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{letter.title}</h4>
                  <p className="text-sm text-gray-600">{letter.description}</p>
                </div>
                <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                  #{letter.issue}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {letter.date} • {letter.subscribers} subscribers
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Founder Newsletter */}
      <div>
        <h3 className="font-bold mb-4">Founder Newsletter</h3>
        <div className="space-y-3">
          {founderNews.map((letter) => (
            <a
              key={letter.id}
              href={letter.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 border rounded hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{letter.title}</h4>
                  <p className="text-sm text-gray-600">{letter.description}</p>
                </div>
                <span className="text-xs bg-green-100 px-2 py-1 rounded">
                  #{letter.issue}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {letter.date} • {letter.subscribers} subscribers
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 6: Events Timeline
 * Shows latest events first
 */
export function EventsExample() {
  const { events, loading } = useEvents();

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      <h2>Events & Conferences</h2>
      <div className="space-y-4">
        {events.map((event) => (
          <a
            key={event.id}
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 p-4 border rounded hover:bg-gray-50"
          >
            <img
              src={event.image}
              alt={event.title}
              className="w-24 h-24 object-cover rounded flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-gray-600 text-sm">{event.location}</p>
                </div>
                <span className="bg-blue-100 px-2 py-1 text-xs rounded">
                  {event.type}
                </span>
              </div>
              <p className="text-sm mt-2">{event.description}</p>
              {event.achievement && (
                <p className="text-sm font-semibold text-green-600 mt-1">
                  🏆 {event.achievement}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">{event.date}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 7: Certificates
 * Shows latest certificates first
 */
export function CertificatesExample() {
  const { certificates, loading } = useCertificates();

  if (loading) return <div>Loading certificates...</div>;

  return (
    <div>
      <h2>Certifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map((cert) => (
          <a
            key={cert.id}
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border rounded hover:shadow-lg transition"
          >
            <h3 className="font-bold">{cert.title}</h3>
            <p className="text-gray-600 text-sm">{cert.issuer}</p>
            <p className="text-xs text-gray-500 mt-1">
              Issued: {cert.issueDate}
              {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
            </p>
            <p className="text-xs text-blue-600 mt-2">ID: {cert.credentialId}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 8: Active Hosting
 * Shows currently active hosted services
 */
export function ActiveHostingExample() {
  const { hosting, loading } = useActiveHosting();

  if (loading) return <div>Loading hosting...</div>;

  return (
    <div>
      <h2>Active Services</h2>
      <div className="space-y-2">
        {hosting.map((service) => (
          <a
            key={service.id}
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
          >
            <div>
              <h3 className="font-semibold">{service.title}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {service.technologies.map((tech) => (
                  <span key={tech} className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="bg-green-100 px-2 py-1 text-xs rounded">{service.platform}</span>
              <p className="text-xs text-gray-500 mt-1">{service.deployDate}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
