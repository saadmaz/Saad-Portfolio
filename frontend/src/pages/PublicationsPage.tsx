import { m } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PAGE_SEO, BASE_URL } from "@/lib/seo-content";
import { FileText, ExternalLink, Calendar, Tag } from "lucide-react";
import { usePublications } from "@/hooks/useContent";

const PublicationsPage = () => {
  const { data: publications = [], isLoading } = usePublications();

  if (isLoading) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="section-container">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-xl bg-secondary/30 animate-pulse" />
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
        title={PAGE_SEO["/publications"].title}
        description={PAGE_SEO["/publications"].description}
        url={`${BASE_URL}/publications`}
      />
      <section className="section-padding">
        <div className="section-container">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="section-title">Publications</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Published Work
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Articles, research papers, and other published work across academic and professional platforms.
            </p>
          </m.div>

          {publications.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No publications yet</h3>
              <p className="text-muted-foreground text-sm">Check back soon for articles and papers.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {publications.map((pub, index) => (
                <m.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="bg-card rounded-xl border border-border p-6 hover:border-accent/40 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                        <h2 className="font-bold text-foreground text-lg leading-snug group-hover:text-accent transition-colors">
                          {pub.title}
                        </h2>
                        {pub.link && (
                          <a
                            href={pub.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-accent hover:underline flex-shrink-0"
                          >
                            View <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="font-medium text-foreground/70">{pub.publisher}</span>
                        {pub.date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {pub.date}
                          </span>
                        )}
                      </div>

                      {pub.authors && pub.authors.length > 0 && (
                        <p className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium text-foreground/60">Authors:</span>{" "}
                          {pub.authors.join(", ")}
                        </p>
                      )}

                      {pub.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {pub.description}
                        </p>
                      )}

                      {pub.tags && pub.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                          {pub.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PublicationsPage;
