import { useState } from "react";
import { m } from "framer-motion";
import { ExternalLink, GraduationCap, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEducation } from "@/shared/hooks/useCommon";
import { Education } from "@/types";

function formatDate(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch { return d || ""; }
}

function EducationEntry({ edu, index }: { edu: Education; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const dateRange = `${formatDate(edu.startDate)} – ${edu.isCurrent ? "Present" : formatDate(edu.endDate)}`;

  return (
    <m.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-4"
    >
      {/* Left: logo + vertical line */}
      <div className="relative flex flex-col items-center">
        <div className="w-[52px] h-[52px] shrink-0 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden z-10">
          {edu.logo ? (
            <img src={edu.logo} alt={edu.institution} loading="lazy" className="w-8 h-8 object-contain" />
          ) : (
            <GraduationCap className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        {/* Connector line */}
        <div className="w-0.5 flex-1 bg-border mt-2 min-h-[32px]" />
      </div>

      {/* Right: content */}
      <div className="flex-1 pb-8 min-w-0">
        {/* Institution name */}
        <div className="flex items-center gap-2 h-[52px]">
          <span className="font-display font-semibold text-base text-foreground">
            {edu.institution}
          </span>
        </div>

        {/* Degree + field */}
        <p className="font-medium text-foreground text-sm mb-1">
          {edu.degree}
          {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
        </p>

        {/* Date range */}
        <p className="text-xs text-muted-foreground mb-2">{dateRange}</p>

        {/* Grade */}
        {edu.grade && (
          <p className="text-xs text-muted-foreground mb-2">
            Grade: <span className="font-medium text-foreground">{edu.grade}</span>
          </p>
        )}

        {/* Description — collapsible */}
        {edu.description && (
          <div>
            <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
              {edu.description}
            </p>
            {edu.description.length > 180 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="mt-1 flex items-center gap-1 text-xs text-accent font-medium hover:underline"
              >
                {expanded ? (
                  <><ChevronUp className="w-3 h-3" /> Show less</>
                ) : (
                  <><ChevronDown className="w-3 h-3" /> Show more</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </m.div>
  );
}

export function EducationSection() {
  const { data: education = [], isLoading } = useEducation();

  if (isLoading) {
    return (
      <section className="section-padding bg-secondary/30">
        <div className="section-container max-w-3xl">
          <div className="space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-[52px] h-[52px] rounded-xl bg-card animate-pulse shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-48 rounded bg-card animate-pulse" />
                  <div className="h-3 w-full rounded bg-card animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (education.length === 0) return null;

  // Sort by most recent start date
  const sorted = [...education].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <section className="section-padding bg-secondary/30">
      <div className="section-container">
        {/* Section header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="section-title">Education</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Academic Background
          </h2>
        </m.div>

        {/* Timeline */}
        <div>
          {sorted.map((edu, i) => (
            <EducationEntry key={edu.id} edu={edu} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
