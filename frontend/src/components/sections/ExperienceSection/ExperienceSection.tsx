import { useState, useMemo, useRef } from "react";
import { m } from "framer-motion";
import { MapPin, ExternalLink, ChevronDown, ChevronUp, Building, Trophy, Star, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useExperience } from "@/hooks/useContent";
import { Experience, ExperienceMedia } from "@/types";
import { useModalA11y } from "@/hooks/useModalA11y";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─── Normalized types for rendering (handles both old and new schemas) ────────

interface NormalizedRole {
  title: string;
  startDate?: string; // legacy
  endDate?: string; // legacy
  startMonth?: string;
  startYear?: number;
  endMonth?: string;
  endYear?: number;
  isCurrent: boolean;
  description?: string;
  skills: string[];
  media?: ExperienceMedia[];
  employmentType?: string; // per-role employment type (legacy fallback)
  location?: string; // legacy per-role
  locationType?: string; // legacy per-role
}

interface NormalizedCompany {
  key: string;
  name: string;
  logo?: string;
  companyUrl?: string;
  employmentType?: string;
  location?: string;
  locationType?: string;
  isFeatured?: boolean;
  displayOrder?: number;
  achievements?: string;
  topSkills: string[];
  topMedia?: ExperienceMedia[];
  roles: NormalizedRole[];
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parseRoleDate(month?: string, year?: number, legacyStr?: string): Date | null {
  if (year) {
    const mIdx = month ? MONTHS.indexOf(month) : 0;
    return new Date(year, mIdx < 0 ? 0 : mIdx, 1);
  }
  if (legacyStr && legacyStr !== "Present") {
    const parts = legacyStr.trim().split(/\s+/);
    const y = parseInt(parts[parts.length - 1]);
    const m = MONTHS.indexOf(parts[0]);
    if (!isNaN(y)) return new Date(y, m < 0 ? 0 : m, 1);
  }
  return null;
}

function calcDuration(start: Date | null, end: Date | null, isCurrent: boolean): string {
  if (!start) return "";
  const e = isCurrent ? new Date() : (end ?? new Date());
  let months = (e.getFullYear() - start.getFullYear()) * 12 + (e.getMonth() - start.getMonth());
  if (months < 1) months = 1;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  return [yrs > 0 && `${yrs} yr${yrs > 1 ? "s" : ""}`, mos > 0 && `${mos} mo${mos > 1 ? "s" : ""}`]
    .filter(Boolean)
    .join(" ");
}

function formatMonthYear(month?: string, year?: number, legacyStr?: string): string {
  if (month && year) return `${month.slice(0, 3)} ${year}`;
  if (year) return String(year);
  if (legacyStr) return legacyStr;
  return "";
}

// ─── Data normalizer — converts Experience[] to NormalizedCompany[] ───────────

function normalizeExperiences(experiences: Experience[]): NormalizedCompany[] {
  const newSchemaMap = new Map<string, NormalizedCompany>();
  const legacyMap = new Map<string, NormalizedCompany>();

  for (const exp of experiences) {
    const companyName = exp.company_name ?? exp.company ?? "";
    const logo = exp.company_logo ?? exp.companyLogo;
    const companyUrl = exp.companyUrl;
    const locationType = exp.location_type ?? exp.workMode;
    const isFeatured = exp.is_featured ?? false;
    const displayOrder = exp.display_order ?? exp.order_index;

    // ── New schema: has roles[] ──────────────────────────────────
    if (exp.roles && exp.roles.length > 0) {
      const key = String(exp.id ?? companyName);
      if (!newSchemaMap.has(key)) {
        newSchemaMap.set(key, {
          key,
          name: companyName,
          logo,
          companyUrl,
          employmentType: exp.employment_type ?? exp.employmentType,
          location: exp.location,
          locationType,
          isFeatured,
          displayOrder,
          achievements: exp.achievements ?? exp.impact,
          topSkills: exp.skills ?? exp.technologies ?? [],
          topMedia: exp.media,
          roles: [],
        });
      }
      const group = newSchemaMap.get(key)!;
      for (const r of exp.roles) {
        group.roles.push({
          title: r.role_title,
          startMonth: r.role_start_month,
          startYear: r.role_start_year,
          endMonth: r.role_end_month,
          endYear: r.role_end_year,
          isCurrent: r.role_is_current,
          description: r.description,
          skills: r.skills ?? [],
          media: r.media,
        });
      }
    } else {
      // ── Legacy schema: single-position document ──────────────
      const key = companyName;
      if (!legacyMap.has(key)) {
        legacyMap.set(key, {
          key,
          name: companyName,
          logo,
          companyUrl,
          employmentType: exp.employment_type ?? exp.employmentType,
          location: exp.location,
          locationType,
          isFeatured,
          displayOrder,
          achievements: exp.achievements ?? exp.impact,
          topSkills: exp.skills ?? exp.technologies ?? [],
          topMedia: exp.media,
          roles: [],
        });
      }
      legacyMap.get(key)!.roles.push({
        title: exp.position ?? "",
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.is_current ?? exp.isCurrent ?? false,
        description: exp.description,
        skills: exp.skills ?? exp.technologies ?? [],
        media: exp.media,
        location: exp.location,
        locationType,
        employmentType: exp.employment_type ?? exp.employmentType,
      });
    }
  }

  // Sort legacy roles within each company by start date desc
  for (const [, g] of legacyMap) {
    g.roles.sort((a, b) => {
      const aDate = parseRoleDate(a.startMonth, a.startYear, a.startDate);
      const bDate = parseRoleDate(b.startMonth, b.startYear, b.startDate);
      return (bDate?.getTime() ?? 0) - (aDate?.getTime() ?? 0);
    });
  }

  const all = [...Array.from(newSchemaMap.values()), ...Array.from(legacyMap.values())];

  // Sort companies: featured first, then by displayOrder, then by most-recent role start date
  all.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    if (a.displayOrder !== undefined && b.displayOrder !== undefined) return a.displayOrder - b.displayOrder;
    if (a.displayOrder !== undefined) return -1;
    if (b.displayOrder !== undefined) return 1;
    const aDate = a.roles[0]
      ? parseRoleDate(a.roles[0].startMonth, a.roles[0].startYear, a.roles[0].startDate)
      : null;
    const bDate = b.roles[0]
      ? parseRoleDate(b.roles[0].startMonth, b.roles[0].startYear, b.roles[0].startDate)
      : null;
    return (bDate?.getTime() ?? 0) - (aDate?.getTime() ?? 0);
  });

  return all;
}

// ─── Total experience calculator ──────────────────────────────────────────────

function calcTotalExperience(companies: NormalizedCompany[]): {
  years: number;
  months: number;
  count: number;
} {
  const ranges: { start: Date; end: Date }[] = [];
  for (const c of companies) {
    for (const r of c.roles) {
      const s = parseRoleDate(r.startMonth, r.startYear, r.startDate);
      const e = r.isCurrent ? new Date() : parseRoleDate(r.endMonth, r.endYear, r.endDate);
      if (s && e) ranges.push({ start: s, end: e });
    }
  }
  ranges.sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: { start: Date; end: Date }[] = [];
  for (const r of ranges) {
    if (!merged.length || r.start > merged[merged.length - 1].end) {
      merged.push({ ...r });
    } else {
      merged[merged.length - 1].end = new Date(
        Math.max(merged[merged.length - 1].end.getTime(), r.end.getTime()),
      );
    }
  }
  let total = 0;
  for (const r of merged) {
    total += (r.end.getFullYear() - r.start.getFullYear()) * 12 + (r.end.getMonth() - r.start.getMonth());
  }
  return { years: Math.floor(total / 12), months: total % 12, count: companies.length };
}

// ─── Media Strip ──────────────────────────────────────────────────────────────

function MediaStrip({ items }: { items: ExperienceMedia[] }) {
  const [lightbox, setLightbox] = useState<ExperienceMedia | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  useModalA11y(!!lightbox, () => setLightbox(null), lightboxRef);
  if (!items.length) return null;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 mt-3 scrollbar-hide snap-x snap-mandatory">
        {items.map((m, i) => (
          <button
            key={i}
            onClick={() =>
              m.media_type === "Image" ? setLightbox(m) : window.open(m.media_url, "_blank", "noopener")
            }
            className="snap-start flex-shrink-0 group relative w-24 h-16 rounded-lg overflow-hidden bg-secondary border border-border hover:border-accent/40 transition-all"
            title={m.media_caption ?? m.media_url}
          >
            {m.media_type === "Image" ? (
              <img
                src={m.media_url}
                alt={m.media_caption ?? ""}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground group-hover:text-accent transition-colors">
                <span className="text-lg">
                  {m.media_type === "Document" ? "📄" : m.media_type === "Presentation" ? "📊" : "🔗"}
                </span>
                {m.media_caption && (
                  <span className="text-[9px] text-center px-1 truncate w-full">{m.media_caption}</span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
      {lightbox && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- backdrop click is a mouse shortcut; Escape (useModalA11y) and the close button serve keyboard users
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.media_caption ?? "Media preview"}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(null);
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setLightbox(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightbox.media_url}
              alt={lightbox.media_caption ?? ""}
              className="rounded-xl max-w-full max-h-[80vh] object-contain mx-auto"
            />
            {lightbox.media_caption && (
              <p className="text-center text-sm text-white/60 mt-3">{lightbox.media_caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Role Row ─────────────────────────────────────────────────────────────────

function RoleRow({ role, isLast }: { role: NormalizedRole; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const startDate = parseRoleDate(role.startMonth, role.startYear, role.startDate);
  const endDate = role.isCurrent ? null : parseRoleDate(role.endMonth, role.endYear, role.endDate);
  const duration = calcDuration(startDate, endDate, role.isCurrent);
  const startLabel = formatMonthYear(role.startMonth, role.startYear, role.startDate);
  const endLabel = role.isCurrent ? "Present" : formatMonthYear(role.endMonth, role.endYear, role.endDate);
  const dateRange = [startLabel, endLabel].filter(Boolean).join(" – ");

  const skills = role.skills.length > 0 ? role.skills : [];
  const allMedia = role.media ?? [];

  return (
    <div className={`relative pl-8 ${isLast ? "" : "pb-6"}`}>
      <div className="absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-background z-10" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
        <h4 className="font-display font-semibold text-foreground text-sm leading-snug">{role.title}</h4>
        {role.employmentType && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground font-medium flex-shrink-0">
            {role.employmentType}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
        {dateRange && (
          <span>
            {dateRange}
            {duration ? ` · ${duration}` : ""}
          </span>
        )}
        {role.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {role.location}
            {role.locationType && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground ml-1">
                {role.locationType}
              </span>
            )}
          </span>
        )}
      </div>

      {role.description && (
        <div className="relative mb-2">
          <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
            {role.description}
          </p>
          {role.description.length > 200 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 flex items-center gap-1 text-xs text-accent font-medium hover:underline"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Show more
                </>
              )}
            </button>
          )}
        </div>
      )}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {skills.map((s) => (
            <span
              key={s}
              className="tech-chip text-[10px] py-0.5 px-2 transition-all duration-200 hover:bg-accent/20 hover:text-accent hover:-translate-y-px"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {allMedia.length > 0 && <MediaStrip items={allMedia} />}
    </div>
  );
}

// ─── Company Group Card ────────────────────────────────────────────────────────

function CompanyGroup({ company, index }: { company: NormalizedCompany; index: number }) {
  const {
    name,
    logo,
    companyUrl,
    employmentType,
    location,
    locationType,
    isFeatured,
    roles,
    achievements,
    topSkills,
    topMedia,
  } = company;

  // Compute company-level duration from roles
  const allStarts = roles
    .map((r) => parseRoleDate(r.startMonth, r.startYear, r.startDate))
    .filter(Boolean) as Date[];
  const allEnds = roles
    .map((r) => (r.isCurrent ? new Date() : parseRoleDate(r.endMonth, r.endYear, r.endDate)))
    .filter(Boolean) as Date[];
  const companyStart = allStarts.length ? new Date(Math.min(...allStarts.map((d) => d.getTime()))) : null;
  const companyEnd = allEnds.length ? new Date(Math.max(...allEnds.map((d) => d.getTime()))) : null;
  const hasCurrentRole = roles.some((r) => r.isCurrent);
  const companyDuration = calcDuration(companyStart, hasCurrentRole ? null : companyEnd, hasCurrentRole);

  const allSkills = topSkills.length > 0 ? topSkills : [...new Set(roles.flatMap((r) => r.skills))];

  const allMedia = topMedia?.length ? topMedia : [];

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
        <div className="w-[52px] h-[52px] shrink-0 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden z-10">
          {logo ? (
            <img src={logo} alt={name} loading="lazy" className="w-8 h-8 object-contain" />
          ) : (
            <Building className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="w-0.5 flex-1 bg-border mt-2 min-h-[32px]" />
      </div>

      {/* Right: content */}
      <div className="flex-1 pb-8 min-w-0">
        {/* Company header */}
        <div className="flex items-start justify-between gap-2 mb-1 min-h-[52px] pt-1">
          <div>
            {companyUrl ? (
              <a
                href={companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display font-semibold text-base text-foreground hover:text-accent transition-colors flex items-center gap-1.5"
              >
                {name} <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            ) : (
              <span className="font-display font-semibold text-base text-foreground">{name}</span>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {[employmentType, companyDuration].filter(Boolean).join(" · ")}
              {location && (
                <>
                  {" "}
                  ·{" "}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location}
                  </span>
                </>
              )}
              {locationType && (
                <>
                  {" "}
                  · <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary">{locationType}</span>
                </>
              )}
            </p>
          </div>
          {isFeatured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest flex-shrink-0">
              <Star className="w-2.5 h-2.5" /> Featured
            </span>
          )}
        </div>

        {/* Roles — nested timeline */}
        <div className="relative border-l-2 border-border ml-1">
          {roles.map((role, i) => (
            <RoleRow key={i} role={role} isLast={i === roles.length - 1} />
          ))}
        </div>

        {/* Company-level skills (shown when not per-role) */}
        {allSkills.length > 0 && roles.every((r) => r.skills.length === 0) && (
          <div className="flex flex-wrap gap-1.5 mt-3 ml-1">
            {allSkills.map((s) => (
              <span
                key={s}
                className="tech-chip text-[10px] py-0.5 px-2 hover:bg-accent/20 hover:text-accent"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Achievements */}
        {achievements && (
          <div className="mt-4 ml-1 flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <Trophy className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">{achievements}</p>
          </div>
        )}

        {/* Company-level media */}
        {allMedia.length > 0 && (
          <div className="ml-1">
            <MediaStrip items={allMedia} />
          </div>
        )}
      </div>
    </m.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function ExperienceSection() {
  const { data: experiences = [], isLoading } = useExperience();

  const companies = useMemo(() => normalizeExperiences(experiences), [experiences]);
  const total = useMemo(() => calcTotalExperience(companies), [companies]);

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="section-container">
          <div className="space-y-8">
            {[1, 2].map((i) => (
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
    <section aria-labelledby="experience-heading" className="section-padding">
      <div className="section-container">
        {/* Section header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="section-title">Work Experience</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2
                id="experience-heading"
                className="font-display text-3xl md:text-4xl font-bold text-foreground"
              >
                Where I've Worked
              </h2>
              {/* Total experience summary */}
              {(total.years > 0 || total.months > 0) && (
                <p className="text-sm text-muted-foreground mt-2">
                  {[
                    total.years > 0 && `${total.years} year${total.years !== 1 ? "s" : ""}`,
                    total.months > 0 && `${total.months} month${total.months !== 1 ? "s" : ""}`,
                  ]
                    .filter(Boolean)
                    .join(" ")}{" "}
                  of experience across {total.count} {total.count === 1 ? "company" : "companies"}
                </p>
              )}
            </div>
            <Link to="/experience" className="btn-view-all shrink-0">
              View Full History <ArrowRight className="w-4 h-4 btn-arrow" />
            </Link>
          </div>
        </m.div>

        {/* Timeline */}
        <div>
          {companies.map((company, i) => (
            <CompanyGroup key={company.key} company={company} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
