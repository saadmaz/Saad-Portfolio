import { m } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Calendar, Building, MapPin, ExternalLink } from "lucide-react";
import { useExperience } from "@/shared/hooks/useCommon";

const ExperiencePage = () => {
  const { data: experiences = [], isLoading } = useExperience();

  if (isLoading) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="section-container">
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-xl bg-secondary/30 animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Work Experience | Saad Mazhar's Professional Journey in Sri Lanka"
        description="Explore Saad Mazhar's career timeline — startup founder, full-stack developer, and AI engineer based in Colombo, Sri Lanka. Real roles, real impact, available to hire."
        url="https://saadmaz.com/experience"
        keywords="full-stack developer experience Sri Lanka, startup founder Colombo, software engineer career Sri Lanka"
      />
      <section className="section-padding">
        <div className="section-container">
          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="section-title">Work Experience</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              My Professional Journey
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              A timeline of my professional experience, from internships to founding startups. 
              Each role has shaped my approach to building products.
            </p>
          </m.div>

          {/* Experience Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

            {experiences.map((exp, index) => (
              <m.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative mb-12 md:mb-16 ${
                  index % 2 === 0 ? "md:pr-[52%]" : "md:pl-[52%]"
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 top-8 w-3 h-3 rounded-full bg-accent -translate-x-1/2 hidden md:block" />

                <div className="bg-card rounded-xl border border-border card-hover p-6 md:p-8">
                  {/* Company Logo & Meta Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <a 
                      href={exp.companyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border hover:border-accent transition-colors"
                    >
                      <img
                        src={exp.companyLogo}
                        alt={`${exp.company} logo`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </a>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {exp.startDate}{exp.isCurrent ? " - Present" : exp.endDate ? ` - ${exp.endDate}` : ""}
                        </span>
                        <a 
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-accent transition-colors"
                        >
                          <Building className="w-4 h-4" />
                          {exp.company}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {exp.location}
                          </span>
                        )}
                        {exp.employmentType && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                            {exp.employmentType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {exp.position}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {exp.description}
                  </p>

                  {/* Responsibilities */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {(exp.responsibilities || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Impact */}
                  {exp.impact && (
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 mb-6">
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                        Impact
                      </span>
                      <p className="text-sm text-foreground mt-1">{exp.impact}</p>
                    </div>
                  )}

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {(exp.technologies || []).map((tech) => (
                      <span key={tech} className="tech-chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ExperiencePage;
