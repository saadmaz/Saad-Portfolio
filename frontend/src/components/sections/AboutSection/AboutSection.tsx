import { m } from "framer-motion";
import { GraduationCap, Calendar, Trophy, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEducation } from "@/shared/hooks/useCommon";

export function AboutSection() {
  const { data: educationData = [], isLoading: eduLoading } = useEducation();

  const latestEducation = [...educationData]
    .filter(e => e.is_published !== false)
    .sort((a, b) => {
      const aY = a.start_year ?? (a.startDate ? parseInt(a.startDate) : 0);
      const bY = b.start_year ?? (b.startDate ? parseInt(b.startDate) : 0);
      return bY - aY;
    })[0] ?? null;

  const schoolName = latestEducation
    ? (latestEducation.school_name ?? latestEducation.institution ?? '')
    : '';
  const logo = latestEducation
    ? (latestEducation.school_logo ?? latestEducation.logo)
    : undefined;
  const field = latestEducation
    ? (latestEducation.field_of_study ?? latestEducation.fieldOfStudy)
    : undefined;
  const isCurrent = latestEducation
    ? (latestEducation.is_current ?? latestEducation.isCurrent ?? false)
    : false;
  const period = latestEducation
    ? (() => {
        const start = latestEducation.start_month && latestEducation.start_year
          ? `${latestEducation.start_month.slice(0, 3)} ${latestEducation.start_year}`
          : latestEducation.startDate ?? '';
        const end = isCurrent ? 'Present'
          : latestEducation.end_month && latestEducation.end_year
            ? `${latestEducation.end_month.slice(0, 3)} ${latestEducation.end_year}`
            : latestEducation.endDate ?? '';
        return start ? (end ? `${start} – ${end}` : start) : '';
      })()
    : '';

  return (
    <section aria-labelledby="about-heading" className="section-padding">
      <div className="section-container">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-title">About Me</span>
          <h2 id="about-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Beyond the Code
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            I believe in being well-rounded. Here's a glimpse into my education.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
          id="education"
        >
          {eduLoading ? (
            <div className="h-44 rounded-xl bg-card border border-border animate-pulse" />
          ) : !latestEducation ? (
            <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center">
              <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No education entries yet.</p>
            </div>
          ) : (
            <Link to="/education" className="block group">
              <div className="bg-card rounded-xl border border-border p-8 hover:border-accent/50 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <GraduationCap className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">Education</h3>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-muted-foreground group-hover:bg-accent group-hover:text-black transition-colors">
                    Latest
                  </span>
                </div>
                <div className="flex gap-5 items-start">
                  {logo && (
                    <div className="shrink-0 w-16 h-16 rounded-xl border border-border bg-secondary overflow-hidden flex items-center justify-center p-1.5">
                      <img src={logo} alt={schoolName} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                        {schoolName}
                      </h4>
                      {latestEducation.school_website_url && (
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                    {(latestEducation.degree || field) && (
                      <p className="text-muted-foreground mb-3">
                        {latestEducation.degree}{latestEducation.degree && field ? ' · ' : ''}{field}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {period && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {period}
                        </span>
                      )}
                      {latestEducation.grade && latestEducation.show_grade_publicly !== false && (
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" /> {latestEducation.grade}
                        </span>
                      )}
                    </div>
                    {(latestEducation.skills ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(latestEducation.skills ?? []).slice(0, 5).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {latestEducation && (
            <div className="flex justify-center mt-6">
              <Link to="/education">
                <Button variant="outline" className="gap-2">
                  See All Education <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </m.div>
      </div>
    </section>
  );
}
