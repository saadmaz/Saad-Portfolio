import { useState, useMemo } from "react";
import { m } from "framer-motion";
import { MapPin, ExternalLink, ChevronDown, ChevronUp, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { useExperience } from "@/shared/hooks/useCommon";
import { Experience } from "@/types";
import { ArrowRight } from "lucide-react";

// ─── Duration helper ───────────────────────────────────────────────────────────
function calcDuration(start: string, end: string | null | undefined, isCurrent: boolean): string {
  try {
    const s = new Date(start);
    const e = isCurrent ? new Date() : (end ? new Date(end) : new Date());
    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (months <= 0) months = 1;
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    const parts: string[] = [];
    if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
    if (mos > 0) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);
    return parts.join(" ");
  } catch { return ""; }
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch { return d; }
}

// ─── Single role row inside a company group ───────────────────────────────────
function RoleRow({ exp, isLast }: { exp: Experience; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const duration = calcDuration(exp.startDate, exp.endDate, exp.isCurrent);
  const dateRange = `${formatDate(exp.startDate)} – ${exp.isCurrent ? "Present" : formatDate(exp.endDate)}`;

  return (
    <div className={`relative pl-8 ${isLast ? "" : "pb-6"}`}>
      {/* Connector dot on timeline */}
      <div className="absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-background z-10" />

      {/* Role header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
        <h4 className="font-display font-semibold text-foreground text-sm leading-snug">
          {exp.position}
        </h4>
        <div className="flex items-center gap-2 shrink-0">
          {exp.employmentType && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground font-medium">
              {exp.employmentType}
            </span>
          )}
        </div>
      </div>

      {/* Date + duration + location */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
        <span>{dateRange}{duration ? ` · ${duration}` : ""}</span>
        {exp.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {exp.location}
            {exp.workMode && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground ml-1">
                {exp.workMode}
              </span>
            )}
          </span>
        )}
      </div>

      {/* Description — collapsible */}
      {exp.description && (
        <div className="relative">
          <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
            {exp.description}
          </p>
          {exp.description.length > 200 && (
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

      {/* Skills */}
      {(exp.technologies || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {exp.technologies.map((tech) => (
            <span key={tech} className="tech-chip text-[10px] py-0.5 px-2 transition-all duration-200 hover:bg-accent/20 hover:text-accent hover:-translate-y-px">
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Company group (one logo, possibly multiple roles) ────────────────────────
function CompanyGroup({
  company,
  logo,
  companyUrl,
  roles,
  index,
}: {
  company: string;
  logo?: string;
  companyUrl?: string;
  roles: Experience[];
  index: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-4"
    >
      {/* Left: logo + vertical connector */}
      <div className="relative flex flex-col items-center">
        {/* Company logo */}
        <div className="w-[52px] h-[52px] shrink-0 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden z-10">
          {logo ? (
            <img src={logo} alt={company} loading="lazy" className="w-8 h-8 object-contain" />
          ) : (
            <Building className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        {/* Vertical line connecting to next entry */}
        <div className="w-0.5 flex-1 bg-border mt-2 min-h-[32px]" />
      </div>

      {/* Right: content */}
      <div className="flex-1 pb-8 min-w-0">
        {/* Company name */}
        <div className="flex items-center gap-2 mb-3 h-[52px]">
          {companyUrl ? (
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-semibold text-base text-foreground hover:text-accent transition-colors flex items-center gap-1.5"
            >
              {company}
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
          ) : (
            <span className="font-display font-semibold text-base text-foreground">{company}</span>
          )}
        </div>

        {/* Roles — with nested timeline dots */}
        <div className="relative border-l-2 border-border ml-1">
          {roles.map((role, i) => (
            <RoleRow key={role.id} exp={role} isLast={i === roles.length - 1} />
          ))}
        </div>
      </div>
    </m.div>
  );
}

export function ExperienceSection() {
  const { data: experiences = [], isLoading } = useExperience();

  // Group by company name
  const groups = useMemo(() => {
    const map = new Map<string, { roles: Experience[]; logo?: string; companyUrl?: string }>();
    for (const exp of experiences) {
      const key = exp.company;
      if (!map.has(key)) {
        map.set(key, { roles: [], logo: exp.companyLogo, companyUrl: exp.companyUrl });
      }
      map.get(key)!.roles.push(exp);
    }
    // Sort each group by startDate desc (most recent first)
    for (const [, g] of map) {
      g.roles.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }
    return Array.from(map.entries());
  }, [experiences]);

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="section-container">
          <div className="space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-[52px] h-[52px] rounded-xl bg-card animate-pulse shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-40 rounded bg-card animate-pulse" />
                  <div className="h-3 w-full rounded bg-card animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-card animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="section-container">
        {/* Section header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="section-title">Work Experience</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Where I've Worked
            </h2>
            <Link to="/experience" className="btn-view-all shrink-0">
              View Full History
              <ArrowRight className="w-4 h-4 btn-arrow" />
            </Link>
          </div>
        </m.div>

        {/* Timeline */}
        <div className="max-w-3xl">
          {groups.map(([company, { roles, logo, companyUrl }], i) => (
            <CompanyGroup
              key={company}
              company={company}
              logo={logo}
              companyUrl={companyUrl}
              roles={roles}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
