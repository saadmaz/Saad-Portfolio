import { useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  ExternalLink, GraduationCap, ChevronDown, ChevronUp,
  Trophy, X, ChevronLeft, ChevronRight, Users, LayoutList, GitBranch,
} from "lucide-react";
import { useEducation } from "@/shared/hooks/useCommon";
import { Education, EducationMedia } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSchoolName(edu: Education): string {
  return edu.school_name ?? edu.institution ?? '';
}

function getLogo(edu: Education): string | undefined {
  return edu.school_logo ?? edu.logo;
}

function getFieldOfStudy(edu: Education): string | undefined {
  return edu.field_of_study ?? edu.fieldOfStudy;
}

function getIsCurrent(edu: Education): boolean {
  return edu.is_current ?? edu.isCurrent ?? false;
}

function getStartYear(edu: Education): number | undefined {
  if (edu.start_year) return edu.start_year;
  if (edu.startDate) return parseInt(edu.startDate.split(' ').pop() ?? '');
  return undefined;
}

function formatDuration(edu: Education): string {
  const isCurrent = getIsCurrent(edu);
  let start = '';
  let end = '';

  if (edu.start_month && edu.start_year) {
    start = `${edu.start_month.slice(0, 3)} ${edu.start_year}`;
  } else if (edu.startDate) {
    start = edu.startDate;
  }

  if (isCurrent) {
    end = 'Present';
  } else if (edu.end_month && edu.end_year) {
    end = `${edu.end_month.slice(0, 3)} ${edu.end_year}`;
  } else if (edu.endDate) {
    end = edu.endDate;
  }

  return start ? (end ? `${start} – ${end}` : start) : '';
}

function calcDurationStr(edu: Education): string {
  const isCurrent = getIsCurrent(edu);
  const startYear = edu.start_year;
  const startMonth = edu.start_month;
  if (!startYear) return '';

  const sIdx = startMonth ? MONTHS.indexOf(startMonth) : 0;
  const s = new Date(startYear, sIdx < 0 ? 0 : sIdx, 1);
  const e = isCurrent
    ? new Date()
    : edu.end_year
      ? new Date(edu.end_year, edu.end_month ? MONTHS.indexOf(edu.end_month) : 11, 1)
      : new Date();
  let m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (m < 1) m = 0;
  const yrs = Math.floor(m / 12);
  const mos = m % 12;
  if (yrs === 0 && mos === 0) return '';
  return [yrs > 0 && `${yrs} yr${yrs > 1 ? 's' : ''}`, mos > 0 && `${mos} mo${mos > 1 ? 's' : ''}`]
    .filter(Boolean).join(' ');
}

function isExpectedGrad(edu: Education): boolean {
  const isCurrent = getIsCurrent(edu);
  if (!isCurrent || !edu.end_year) return false;
  const now = new Date();
  return edu.end_year > now.getFullYear() ||
    (edu.end_year === now.getFullYear() && !!edu.end_month &&
      MONTHS.indexOf(edu.end_month) >= now.getMonth());
}

// ─── Media lightbox ───────────────────────────────────────────────────────────

interface LightboxItem {
  media: EducationMedia;
  index: number;
  total: number;
}

function MediaLightbox({
  item, onClose, onPrev, onNext,
}: {
  item: LightboxItem;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const { media } = item;
  const dateLabel = media.media_date_month && media.media_date_year
    ? `${media.media_date_month.slice(0, 3)} ${media.media_date_year}`
    : null;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {onPrev && item.index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {onNext && item.index < item.total - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-16 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-card rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media content */}
        {media.media_type === 'Image' && media.media_url && (
          <div className="bg-black flex items-center justify-center max-h-[60vh]">
            <img src={media.media_url} alt={media.media_caption} className="max-h-[60vh] w-full object-contain" />
          </div>
        )}
        {(media.media_type === 'Document' || media.media_type === 'Presentation') && media.media_url && (
          <div className="bg-secondary/50 flex items-center justify-center py-16 gap-4">
            <a
              href={media.media_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors"
            >
              Open {media.media_type} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
        {media.media_type === 'Link' && media.media_url && (
          <div className="bg-secondary/50 flex items-center justify-center py-16">
            <a
              href={media.media_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors"
            >
              Open Link <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Info panel */}
        <div className="p-5 space-y-1 border-t border-border">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-foreground text-base leading-snug">{media.media_caption}</h3>
            {dateLabel && (
              <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{dateLabel}</span>
            )}
          </div>
          {media.media_description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{media.media_description}</p>
          )}
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">{item.index + 1} / {item.total}</p>
        </div>
      </div>
    </m.div>
  );
}

// ─── Media strip ──────────────────────────────────────────────────────────────

function MediaStrip({ items }: { items: EducationMedia[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  const mediaIcon = (type: EducationMedia['media_type']) => {
    if (type === 'Image') return null;
    const icons: Record<string, string> = {
      Document: '📄', Presentation: '📊', Link: '🔗',
    };
    return icons[type] ?? '📎';
  };

  return (
    <>
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
        {items.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="flex-shrink-0 group relative w-24 h-16 rounded-lg overflow-hidden border border-border hover:border-accent/50 transition-all bg-secondary"
            title={m.media_caption}
          >
            {m.media_type === 'Image' && m.media_url ? (
              <img src={m.media_url} alt={m.media_caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <span className="text-xl">{mediaIcon(m.media_type) ?? '📎'}</span>
                <span className="text-[9px] text-muted-foreground font-medium">{m.media_type}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <MediaLightbox
            item={{ media: items[lightboxIndex], index: lightboxIndex, total: items.length }}
            onClose={() => setLightboxIndex(null)}
            onPrev={lightboxIndex > 0 ? () => setLightboxIndex(i => i! - 1) : undefined}
            onNext={lightboxIndex < items.length - 1 ? () => setLightboxIndex(i => i! + 1) : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Card entry ───────────────────────────────────────────────────────────────

function EducationCard({ edu, index }: { edu: Education; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const logo = getLogo(edu);
  const schoolName = getSchoolName(edu);
  const fieldOfStudy = getFieldOfStudy(edu);
  const isCurrent = getIsCurrent(edu);
  const duration = formatDuration(edu);
  const durationStr = calcDurationStr(edu);
  const expectedGrad = isExpectedGrad(edu);
  const websiteUrl = edu.school_website_url;
  const skills = edu.skills ?? [];
  const projects = edu.projects ?? [];
  const media = edu.media ?? [];
  const awards = edu.honors_and_awards ?? [];
  const activities = edu.activities_and_societies;
  const descLen = edu.description?.length ?? 0;

  const expectedLabel = expectedGrad && edu.end_month && edu.end_year
    ? `Expected ${edu.end_month.slice(0, 3)} ${edu.end_year}`
    : null;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Featured bar */}
      {edu.is_featured && (
        <div className="h-0.5 w-full bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
      )}

      <div className="p-5 sm:p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
            {logo ? (
              websiteUrl ? (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center p-1">
                  <img src={logo} alt={schoolName} loading="lazy" className="w-full h-full object-contain" />
                </a>
              ) : (
                <img src={logo} alt={schoolName} loading="lazy" className="w-8 h-8 object-contain" />
              )
            ) : (
              <GraduationCap className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-foreground hover:text-accent transition-colors flex items-center gap-1"
                >
                  {schoolName}
                  <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                </a>
              ) : (
                <span className="font-bold text-foreground">{schoolName}</span>
              )}

              {edu.is_featured && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  Featured
                </span>
              )}
            </div>

            {/* Degree */}
            {(edu.degree || fieldOfStudy) && (
              <p className="text-sm font-medium text-foreground/90 mt-0.5">
                {edu.degree}
                {edu.degree && fieldOfStudy ? ' · ' : ''}
                {fieldOfStudy}
              </p>
            )}

            {/* Duration */}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <p className="text-xs text-muted-foreground">
                {duration}
                {durationStr && <span className="ml-1 text-muted-foreground/60">· {durationStr}</span>}
              </p>
              {expectedLabel && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {expectedLabel}
                </span>
              )}
              {isCurrent && !expectedLabel && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  Present
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Grade */}
        {edu.grade && edu.show_grade_publicly !== false && (
          <p className="text-xs text-muted-foreground">
            Grade: <span className="font-medium text-foreground">{edu.grade}</span>
          </p>
        )}

        {/* Activities */}
        {activities && (
          <div className="flex items-start gap-1.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{activities}</p>
          </div>
        )}

        {/* Description */}
        {edu.description && (
          <div>
            <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
              {edu.description}
            </p>
            {descLen > 180 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="mt-1 flex items-center gap-1 text-xs text-accent font-medium hover:underline"
              >
                {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
              </button>
            )}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Projects</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {projects.map((p, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 rounded-xl border border-border bg-secondary/50 overflow-hidden"
                >
                  {p.project_thumbnail && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img src={p.project_thumbnail} alt={p.project_title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{p.project_title}</p>
                    {p.project_description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{p.project_description}</p>
                    )}
                    {p.project_url && (
                      <a
                        href={p.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1 text-[10px] text-accent font-semibold hover:underline"
                      >
                        View project <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Honors & Awards */}
        {awards.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-accent" /> Honors & Awards
            </p>
            <ul className="space-y-1.5">
              {awards.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Trophy className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{a.award_title}</span>
                    {a.award_issuer && (
                      <span className="text-muted-foreground"> · {a.award_issuer}</span>
                    )}
                    {(a.award_date_month || a.award_date_year) && (
                      <span className="text-muted-foreground/60 text-xs ml-1">
                        ({a.award_date_month ? a.award_date_month.slice(0, 3) + ' ' : ''}{a.award_date_year})
                      </span>
                    )}
                    {a.award_description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{a.award_description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Media strip */}
        {media.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Media</p>
            <MediaStrip items={media} />
          </div>
        )}
      </div>
    </m.div>
  );
}

// ─── Timeline entry ───────────────────────────────────────────────────────────

function EducationTimelineEntry({ edu, index, isLast }: { edu: Education; index: number; isLast: boolean }) {
  const logo = getLogo(edu);
  const schoolName = getSchoolName(edu);
  const fieldOfStudy = getFieldOfStudy(edu);
  const isCurrent = getIsCurrent(edu);
  const duration = formatDuration(edu);
  const websiteUrl = edu.school_website_url;
  const expectedLabel = isExpectedGrad(edu) && edu.end_month && edu.end_year
    ? `Expected ${edu.end_month.slice(0, 3)} ${edu.end_year}`
    : null;

  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative flex gap-4"
    >
      {/* Left: logo node + line */}
      <div className="relative flex flex-col items-center">
        <div className="w-[48px] h-[48px] shrink-0 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden z-10">
          {logo ? (
            <img src={logo} alt={schoolName} loading="lazy" className="w-8 h-8 object-contain" />
          ) : (
            <GraduationCap className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-2 min-h-[24px]" />}
      </div>

      {/* Right: content */}
      <div className="flex-1 pb-8 min-w-0">
        <div className="flex items-center gap-1.5 h-[48px]">
          {websiteUrl ? (
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-accent transition-colors flex items-center gap-1 text-base">
              {schoolName}
              <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
            </a>
          ) : (
            <span className="font-semibold text-foreground text-base">{schoolName}</span>
          )}
          {edu.is_featured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">Featured</span>
          )}
        </div>

        {(edu.degree || fieldOfStudy) && (
          <p className="text-sm font-medium text-foreground/90 mb-0.5">
            {edu.degree}{edu.degree && fieldOfStudy ? ' · ' : ''}{fieldOfStudy}
          </p>
        )}

        <div className="flex items-center gap-1.5 mb-2">
          <p className="text-xs text-muted-foreground">{duration}</p>
          {expectedLabel && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{expectedLabel}</span>
          )}
          {isCurrent && !expectedLabel && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Present</span>
          )}
        </div>

        {edu.grade && edu.show_grade_publicly !== false && (
          <p className="text-xs text-muted-foreground mb-1.5">
            Grade: <span className="font-medium text-foreground">{edu.grade}</span>
          </p>
        )}

        {edu.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{edu.description}</p>
        )}

        {(edu.skills ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(edu.skills ?? []).map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-medium">{s}</span>
            ))}
          </div>
        )}
      </div>
    </m.div>
  );
}

// ─── Summary line ─────────────────────────────────────────────────────────────

function EducationSummary({ education }: { education: Education[] }) {
  const count = education.length;
  if (count === 0) return null;

  const current = education.find(e => getIsCurrent(e));
  const latestDegree = education.find(e => e.degree)?.degree;
  const latestField = education.find(e => getFieldOfStudy(e)) ? getFieldOfStudy(education.find(e => getFieldOfStudy(e))!) : undefined;

  const expectedGradEntry = education.find(e => isExpectedGrad(e));
  const expectedLabel = expectedGradEntry && expectedGradEntry.end_month && expectedGradEntry.end_year
    ? `Expected ${expectedGradEntry.end_month.slice(0, 3)} ${expectedGradEntry.end_year}`
    : null;

  const parts: string[] = [];
  parts.push(`${count} institution${count > 1 ? 's' : ''}`);
  if (latestDegree && latestField) parts.push(`${latestDegree} in ${latestField}`);
  else if (latestDegree) parts.push(latestDegree);
  if (expectedLabel) parts.push(expectedLabel);

  return (
    <p className="text-sm text-muted-foreground font-medium mb-6">
      {parts.join(' · ')}
    </p>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function EducationSection() {
  const { data: allEducation = [], isLoading } = useEducation();
  const [view, setView] = useState<'card' | 'timeline'>('card');

  if (isLoading) {
    return (
      <section className="section-padding bg-secondary/30">
        <div className="section-container max-w-3xl">
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Only show published entries
  const education = allEducation.filter(e => e.is_published !== false);

  if (education.length === 0) return null;

  // Sort: featured first, then by display_order, then by start year descending
  const sorted = [...education].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    if (a.display_order !== undefined && b.display_order !== undefined) return a.display_order - b.display_order;
    return (getStartYear(b) ?? 0) - (getStartYear(a) ?? 0);
  });

  return (
    <section className="section-padding bg-secondary/30">
      <div className="section-container">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="section-title">Education</span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Academic Background
            </h2>

            {/* View toggle */}
            {education.length > 1 && (
              <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
                <button
                  onClick={() => setView('card')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    view === 'card' ? 'bg-accent text-black' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" /> Cards
                </button>
                <button
                  onClick={() => setView('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    view === 'timeline' ? 'bg-accent text-black' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" /> Timeline
                </button>
              </div>
            )}
          </div>

          {/* Summary line */}
          <div className="mt-3">
            <EducationSummary education={sorted} />
          </div>
        </m.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'card' ? (
            <m.div
              key="cards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {sorted.map((edu, i) => (
                <EducationCard key={edu.id} edu={edu} index={i} />
              ))}
            </m.div>
          ) : (
            <m.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {sorted.map((edu, i) => (
                <EducationTimelineEntry key={edu.id} edu={edu} index={i} isLast={i === sorted.length - 1} />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
