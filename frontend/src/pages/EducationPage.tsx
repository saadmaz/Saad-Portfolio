import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import {
  GraduationCap, ExternalLink, Trophy, Users, ChevronDown, ChevronUp,
  X, ChevronLeft, ChevronRight, LayoutList, GitBranch, ArrowRight,
} from 'lucide-react';
import { useEducation } from '@/shared/hooks/useCommon';
import { useProjects } from '@/shared/hooks/useProjects';
import { Education, EducationMedia, Project } from '@/types';
import { Link } from 'react-router-dom';

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
  const start = edu.start_month && edu.start_year
    ? `${edu.start_month.slice(0, 3)} ${edu.start_year}`
    : edu.startDate ?? '';
  const end = isCurrent ? 'Present'
    : edu.end_month && edu.end_year
      ? `${edu.end_month.slice(0, 3)} ${edu.end_year}`
      : edu.endDate ?? '';
  return start ? (end ? `${start} – ${end}` : start) : '';
}

function calcDurationStr(edu: Education): string {
  const isCurrent = getIsCurrent(edu);
  if (!edu.start_year) return '';
  const sIdx = edu.start_month ? MONTHS.indexOf(edu.start_month) : 0;
  const s = new Date(edu.start_year, sIdx < 0 ? 0 : sIdx, 1);
  const e = isCurrent ? new Date()
    : edu.end_year
      ? new Date(edu.end_year, edu.end_month ? MONTHS.indexOf(edu.end_month) : 11, 1)
      : new Date();
  let m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (m < 1) m = 0;
  const yrs = Math.floor(m / 12);
  const mos = m % 12;
  if (!yrs && !mos) return '';
  return [yrs > 0 && `${yrs} yr${yrs > 1 ? 's' : ''}`, mos > 0 && `${mos} mo${mos > 1 ? 's' : ''}`]
    .filter(Boolean).join(' ');
}

function isExpectedGrad(edu: Education): boolean {
  if (!getIsCurrent(edu) || !edu.end_year) return false;
  const now = new Date();
  return edu.end_year > now.getFullYear() ||
    (edu.end_year === now.getFullYear() && !!edu.end_month &&
      MONTHS.indexOf(edu.end_month) >= now.getMonth());
}

// ─── Media lightbox ───────────────────────────────────────────────────────────

function MediaLightbox({
  items, index: initialIndex, onClose,
}: {
  items: EducationMedia[];
  index: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const item = items[index];
  if (!item) return null;

  const dateLabel = item.media_date_month && item.media_date_year
    ? `${item.media_date_month.slice(0, 3)} ${item.media_date_year}`
    : null;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button onClick={onClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
        <X className="w-5 h-5" />
      </button>
      {index > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setIndex(i => i - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {index < items.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); setIndex(i => i + 1); }}
          className="absolute right-16 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-card rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {item.media_type === 'Image' && item.media_url && (
          <div className="bg-black flex items-center justify-center max-h-[60vh]">
            <img src={item.media_url} alt={item.media_caption} className="max-h-[60vh] w-full object-contain" />
          </div>
        )}
        {(item.media_type !== 'Image') && item.media_url && (
          <div className="bg-secondary/50 flex items-center justify-center py-16">
            <a href={item.media_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90">
              Open {item.media_type} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
        <div className="p-5 space-y-1 border-t border-border">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-foreground text-base">{item.media_caption}</h3>
            {dateLabel && <span className="text-xs text-muted-foreground whitespace-nowrap">{dateLabel}</span>}
          </div>
          {item.media_description && <p className="text-sm text-muted-foreground">{item.media_description}</p>}
          <p className="text-[10px] text-muted-foreground/50">{index + 1} / {items.length}</p>
        </div>
      </div>
    </m.div>
  );
}

// ─── Education card ───────────────────────────────────────────────────────────

function EducationCard({
  edu, index, linkedProjects,
}: {
  edu: Education;
  index: number;
  linkedProjects: Project[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const logo = getLogo(edu);
  const schoolName = getSchoolName(edu);
  const fieldOfStudy = getFieldOfStudy(edu);
  const isCurrent = getIsCurrent(edu);
  const duration = formatDuration(edu);
  const durationStr = calcDurationStr(edu);
  const expectedGrad = isExpectedGrad(edu);
  const websiteUrl = edu.school_website_url;
  const skills = edu.skills ?? [];
  const media = edu.media ?? [];
  const awards = edu.honors_and_awards ?? [];
  const activities = edu.activities_and_societies;

  const expectedLabel = expectedGrad && edu.end_month && edu.end_year
    ? `Expected ${edu.end_month.slice(0, 3)} ${edu.end_year}` : null;

  return (
    <>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {edu.is_featured && <div className="h-0.5 w-full bg-gradient-to-r from-accent/0 via-accent to-accent/0" />}

        <div className="p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
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

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {websiteUrl ? (
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="font-bold text-foreground hover:text-accent transition-colors flex items-center gap-1">
                    {schoolName} <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                  </a>
                ) : (
                  <span className="font-bold text-foreground">{schoolName}</span>
                )}
                {edu.is_featured && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">Featured</span>
                )}
              </div>

              {(edu.degree || fieldOfStudy) && (
                <p className="text-sm font-medium text-foreground/90 mt-0.5">
                  {edu.degree}{edu.degree && fieldOfStudy ? ' · ' : ''}{fieldOfStudy}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap mt-1">
                <p className="text-xs text-muted-foreground">
                  {duration}
                  {durationStr && <span className="ml-1 text-muted-foreground/60">· {durationStr}</span>}
                </p>
                {expectedLabel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{expectedLabel}</span>
                )}
                {isCurrent && !expectedLabel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Present</span>
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
              {edu.description.length > 180 && (
                <button onClick={() => setExpanded(v => !v)}
                  className="mt-1 flex items-center gap-1 text-xs text-accent font-medium hover:underline">
                  {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show more</>}
                </button>
              )}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">{s}</span>
              ))}
            </div>
          )}

          {/* Linked Projects */}
          {linkedProjects.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Projects</p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {linkedProjects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.slug}`}
                    className="flex-shrink-0 w-48 rounded-xl border border-border bg-secondary/50 overflow-hidden hover:border-accent/40 transition-colors"
                  >
                    {(p.heroImage || p.image) && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img src={p.heroImage ?? p.image} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{p.title}</p>
                      {p.tagline && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{p.tagline}</p>}
                      <span className="mt-2 flex items-center gap-1 text-[10px] text-accent font-semibold">
                        View project <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </Link>
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
                      {a.award_issuer && <span className="text-muted-foreground"> · {a.award_issuer}</span>}
                      {(a.award_date_month || a.award_date_year) && (
                        <span className="text-muted-foreground/60 text-xs ml-1">
                          ({a.award_date_month ? a.award_date_month.slice(0, 3) + ' ' : ''}{a.award_date_year})
                        </span>
                      )}
                      {a.award_description && <p className="text-xs text-muted-foreground mt-0.5">{a.award_description}</p>}
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
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {media.map((m, i) => (
                  <button key={i} type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-border hover:border-accent/50 transition-all bg-secondary"
                    title={m.media_caption}>
                    {m.media_type === 'Image' && m.media_url ? (
                      <img src={m.media_url} alt={m.media_caption} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <span className="text-xl">{({ Document: '📄', Presentation: '📊', Link: '🔗' } as Record<string, string>)[m.media_type] ?? '📎'}</span>
                        <span className="text-[9px] text-muted-foreground">{m.media_type}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </m.div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <MediaLightbox
            items={edu.media ?? []}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Timeline entry ───────────────────────────────────────────────────────────

function TimelineEntry({
  edu, index, isLast, linkedProjects, expanded, onToggle,
}: {
  edu: Education;
  index: number;
  isLast: boolean;
  linkedProjects: Project[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const logo = getLogo(edu);
  const schoolName = getSchoolName(edu);
  const fieldOfStudy = getFieldOfStudy(edu);
  const isCurrent = getIsCurrent(edu);
  const duration = formatDuration(edu);
  const websiteUrl = edu.school_website_url;
  const expectedLabel = isExpectedGrad(edu) && edu.end_month && edu.end_year
    ? `Expected ${edu.end_month.slice(0, 3)} ${edu.end_year}` : null;

  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative flex gap-4"
    >
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={onToggle}
          className="w-12 h-12 shrink-0 rounded-xl bg-card border-2 border-border hover:border-accent/50 flex items-center justify-center overflow-hidden z-10 transition-colors"
        >
          {logo ? (
            <img src={logo} alt={schoolName} loading="lazy" className="w-8 h-8 object-contain" />
          ) : (
            <GraduationCap className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        {!isLast && <div className={`w-0.5 flex-1 mt-2 min-h-[24px] transition-colors ${expanded ? 'bg-accent/40' : 'bg-border'}`} />}
      </div>

      <div className="flex-1 pb-8 min-w-0">
        <div
          className="flex items-start justify-between gap-2 cursor-pointer group h-12"
          onClick={onToggle}
        >
          <div>
            <div className="flex items-center gap-1.5">
              {websiteUrl ? (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="font-semibold text-foreground hover:text-accent transition-colors flex items-center gap-1 text-base">
                  {schoolName} <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                </a>
              ) : (
                <span className="font-semibold text-foreground text-base group-hover:text-accent transition-colors">{schoolName}</span>
              )}
              {edu.is_featured && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">Featured</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {(edu.degree || fieldOfStudy) && (
                <p className="text-sm text-foreground/80">
                  {edu.degree}{edu.degree && fieldOfStudy ? ' · ' : ''}{fieldOfStudy}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {expectedLabel && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hidden sm:block">{expectedLabel}</span>
            )}
            {isCurrent && !expectedLabel && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hidden sm:block">Present</span>
            )}
            <span className="text-xs text-muted-foreground hidden sm:block">{duration}</span>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3 border-t border-border mt-2">
                {edu.grade && edu.show_grade_publicly !== false && (
                  <p className="text-xs text-muted-foreground">Grade: <span className="font-medium text-foreground">{edu.grade}</span></p>
                )}
                {edu.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{edu.description}</p>
                )}
                {(edu.skills ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(edu.skills ?? []).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">{s}</span>
                    ))}
                  </div>
                )}
                {linkedProjects.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {linkedProjects.map(p => (
                      <Link key={p.id} to={`/projects/${p.slug}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:border-accent/40 transition-colors text-xs font-medium text-foreground">
                        {(p.heroImage || p.image) && (
                          <img src={p.heroImage ?? p.image} alt={p.title} className="w-4 h-4 rounded object-cover" />
                        )}
                        {p.title}
                        <ArrowRight className="w-3 h-3 text-accent" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.div>
  );
}

// ─── Summary line ─────────────────────────────────────────────────────────────

function Summary({ education }: { education: Education[] }) {
  if (!education.length) return null;
  const count = education.length;
  const latestDegree = education.find(e => e.degree)?.degree;
  const latestField = education.find(e => getFieldOfStudy(e));
  const field = latestField ? getFieldOfStudy(latestField) : undefined;
  const expectedEntry = education.find(e => isExpectedGrad(e));
  const expectedLabel = expectedEntry && expectedEntry.end_month && expectedEntry.end_year
    ? `Expected ${expectedEntry.end_month.slice(0, 3)} ${expectedEntry.end_year}` : null;

  const parts: string[] = [];
  parts.push(`${count} institution${count > 1 ? 's' : ''}`);
  if (latestDegree && field) parts.push(`${latestDegree} in ${field}`);
  else if (latestDegree) parts.push(latestDegree);
  if (expectedLabel) parts.push(expectedLabel);

  return <p className="text-sm text-muted-foreground mt-3">{parts.join(' · ')}</p>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const EducationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get('view') ?? 'card') as 'card' | 'timeline';
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: allEducation = [], isLoading: eduLoading, error: eduError } = useEducation();
  const { data: allProjects = [] } = useProjects();

  const education = allEducation
    .filter(e => e.is_published !== false)
    .sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      if (a.display_order !== undefined && b.display_order !== undefined) return a.display_order - b.display_order;
      return (getStartYear(b) ?? 0) - (getStartYear(a) ?? 0);
    });

  function getLinkedProjects(edu: Education): Project[] {
    return allProjects.filter(p => (p.linked_education_ids ?? []).includes(edu.id));
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const setView = (v: 'card' | 'timeline') => {
    setSearchParams(v === 'card' ? {} : { view: v });
  };

  // Page meta: generate description from featured or first entry
  const featured = education.find(e => e.is_featured) ?? education[0];
  const metaDesc = featured
    ? `${featured.degree ?? ''} at ${getSchoolName(featured)}${featured.grade && featured.show_grade_publicly !== false ? ` · ${featured.grade}` : ''}`
    : "Academic background and qualifications.";

  return (
    <Layout>
      <SEO
        title="Education — Saad Maz"
        description={metaDesc}
        url="https://saadmaz.com/education"
      />

      <section className="section-padding">
        <div className="section-container max-w-4xl">

          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <span className="section-title">Academic</span>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Education</h1>
                <p className="text-muted-foreground mt-2">My academic background and qualifications.</p>
                {!eduLoading && <Summary education={education} />}
              </div>

              {education.length > 1 && (
                <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
                  <button onClick={() => setView('card')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'card' ? 'bg-accent text-black' : 'text-muted-foreground hover:text-foreground'}`}>
                    <LayoutList className="w-3.5 h-3.5" /> Cards
                  </button>
                  <button onClick={() => setView('timeline')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'timeline' ? 'bg-accent text-black' : 'text-muted-foreground hover:text-foreground'}`}>
                    <GitBranch className="w-3.5 h-3.5" /> Timeline
                  </button>
                </div>
              )}
            </div>
          </m.div>

          {/* Loading */}
          {eduLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          )}

          {/* Error */}
          {eduError && !eduLoading && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <p className="text-sm text-red-400">Failed to load education entries. Please try refreshing the page.</p>
            </div>
          )}

          {/* Empty state */}
          {!eduLoading && !eduError && education.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No education entries yet</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Check back later.</p>
            </div>
          )}

          {/* Content */}
          {!eduLoading && !eduError && education.length > 0 && (
            <AnimatePresence mode="wait">
              {view === 'card' ? (
                <m.div
                  key="cards"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {education.map((edu, i) => (
                    <EducationCard
                      key={edu.id}
                      edu={edu}
                      index={i}
                      linkedProjects={getLinkedProjects(edu)}
                    />
                  ))}
                </m.div>
              ) : (
                <m.div
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {education.map((edu, i) => (
                    <TimelineEntry
                      key={edu.id}
                      edu={edu}
                      index={i}
                      isLast={i === education.length - 1}
                      linkedProjects={getLinkedProjects(edu)}
                      expanded={expandedIds.has(edu.id)}
                      onToggle={() => toggleExpand(edu.id)}
                    />
                  ))}
                </m.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EducationPage;
