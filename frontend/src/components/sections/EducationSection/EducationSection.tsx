import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useModalA11y } from "@/hooks/useModalA11y";
import { m, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Trophy,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  GitBranch,
  ArrowRight,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEducation } from "@/hooks/useContent";
import { useProjects } from "@/hooks/useProjects";
import { Education, EducationMedia, Project } from "@/types";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSchoolName(edu: Education): string {
  return edu.school_name ?? edu.institution ?? "";
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
  if (edu.startDate) return parseInt(edu.startDate.split(" ").pop() ?? "");
  return undefined;
}
function formatDuration(edu: Education): string {
  const isCurrent = getIsCurrent(edu);
  const start =
    edu.start_month && edu.start_year
      ? `${edu.start_month.slice(0, 3)} ${edu.start_year}`
      : (edu.startDate ?? "");
  const end = isCurrent
    ? "Present"
    : edu.end_month && edu.end_year
      ? `${edu.end_month.slice(0, 3)} ${edu.end_year}`
      : (edu.endDate ?? "");
  return start ? (end ? `${start} – ${end}` : start) : "";
}
function calcDurationStr(edu: Education): string {
  const isCurrent = getIsCurrent(edu);
  if (!edu.start_year) return "";
  const sIdx = edu.start_month ? MONTHS.indexOf(edu.start_month) : 0;
  const s = new Date(edu.start_year, sIdx < 0 ? 0 : sIdx, 1);
  const e = isCurrent
    ? new Date()
    : edu.end_year
      ? new Date(edu.end_year, edu.end_month ? MONTHS.indexOf(edu.end_month) : 11, 1)
      : new Date();
  let m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (m < 1) m = 0;
  const yrs = Math.floor(m / 12);
  const mos = m % 12;
  if (!yrs && !mos) return "";
  return [yrs > 0 && `${yrs} yr${yrs > 1 ? "s" : ""}`, mos > 0 && `${mos} mo${mos > 1 ? "s" : ""}`]
    .filter(Boolean)
    .join(" ");
}
function isExpectedGrad(edu: Education): boolean {
  if (!getIsCurrent(edu) || !edu.end_year) return false;
  const now = new Date();
  return (
    edu.end_year > now.getFullYear() ||
    (edu.end_year === now.getFullYear() && !!edu.end_month && MONTHS.indexOf(edu.end_month) >= now.getMonth())
  );
}

// ─── Media lightbox (portal) ──────────────────────────────────────────────────

function MediaLightbox({
  items,
  index: init,
  onClose,
}: {
  items: EducationMedia[];
  index: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(init);
  const item = items[index];
  const lightboxRef = useRef<HTMLDivElement>(null);
  useModalA11y(!!item, onClose, lightboxRef);
  if (!item) return null;
  const dateLabel =
    item.media_date_month && item.media_date_year
      ? `${item.media_date_month.slice(0, 3)} ${item.media_date_year}`
      : null;

  return createPortal(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- backdrop click is a mouse shortcut; Escape (useModalA11y) and the close button serve keyboard users
    <div
      ref={lightboxRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.media_caption || "Media preview"}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <X className="w-5 h-5" />
      </button>
      {index > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => i - 1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {index < items.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => i + 1);
          }}
          className="absolute right-16 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-card rounded-2xl overflow-hidden shadow-2xl">
        {item.media_type === "Image" && item.media_url && (
          <div className="bg-black flex items-center justify-center max-h-[60vh]">
            <img
              src={item.media_url}
              alt={item.media_caption}
              className="max-h-[60vh] w-full object-contain"
            />
          </div>
        )}
        {item.media_type !== "Image" && item.media_url && (
          <div className="bg-secondary/50 flex items-center justify-center py-16">
            <a
              href={item.media_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90"
            >
              Open {item.media_type} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
        <div className="p-5 space-y-1 border-t border-border">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-foreground text-base">{item.media_caption}</h3>
            {dateLabel && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">{dateLabel}</span>
            )}
          </div>
          {item.media_description && (
            <p className="text-sm text-muted-foreground">{item.media_description}</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            {index + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Detail modal (portal — escapes any CSS transform context) ────────────────

function EducationDetailModal({
  edu,
  linkedProjects,
  onClose,
}: {
  edu: Education;
  linkedProjects: Project[];
  onClose: () => void;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useModalA11y(true, onClose, modalRef);

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
  const expectedLabel =
    expectedGrad && edu.end_month && edu.end_year
      ? `Expected ${edu.end_month.slice(0, 3)} ${edu.end_year}`
      : null;

  return createPortal(
    <AnimatePresence>
      <m.div
        key="edu-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <m.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={getSchoolName(edu)}
          key="edu-modal-panel"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 30, stiffness: 320 }}
          className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-card border border-border rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle on mobile */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {edu.is_featured && (
            <div className="h-0.5 w-full bg-gradient-to-r from-accent/0 via-accent to-accent/0 flex-shrink-0" />
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4 pr-10">
              <div className="w-14 h-14 shrink-0 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
                {logo ? (
                  <img src={logo} alt={schoolName} className="w-full h-full object-contain p-1.5" />
                ) : (
                  <GraduationCap className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {websiteUrl ? (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-lg text-foreground hover:text-accent transition-colors flex items-center gap-1"
                    >
                      {schoolName} <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  ) : (
                    <span className="font-bold text-lg text-foreground">{schoolName}</span>
                  )}
                  {edu.is_featured && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      Featured
                    </span>
                  )}
                </div>
                {(edu.degree || fieldOfStudy) && (
                  <p className="text-sm font-medium text-foreground/90 mt-0.5">
                    {edu.degree}
                    {edu.degree && fieldOfStudy ? " · " : ""}
                    {fieldOfStudy}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <p className="text-xs text-muted-foreground">
                    {duration}
                    {durationStr && <span className="ml-1 text-muted-foreground">· {durationStr}</span>}
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
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/5 border border-accent/15 w-fit">
                <Trophy className="w-4 h-4 text-accent" />
                <p className="text-sm font-medium text-foreground">{edu.grade}</p>
              </div>
            )}

            {/* Activities */}
            {activities && (
              <div className="flex items-start gap-2 p-3.5 rounded-xl bg-secondary/50 border border-border">
                <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">{activities}</p>
              </div>
            )}

            {/* Description */}
            {edu.description && (
              <div>
                <p
                  className={`text-sm text-muted-foreground leading-relaxed ${descExpanded ? "" : "line-clamp-4"}`}
                >
                  {edu.description}
                </p>
                {edu.description.length > 220 && (
                  <button
                    onClick={() => setDescExpanded((v) => !v)}
                    className="mt-1.5 flex items-center gap-1 text-xs text-accent font-medium hover:underline"
                  >
                    {descExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Show more
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Linked projects */}
            {linkedProjects.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
                  Projects
                </p>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {linkedProjects.map((p) => (
                    <Link
                      key={p.id}
                      to={`/projects/${p.slug}`}
                      onClick={onClose}
                      className="flex-shrink-0 w-44 rounded-xl border border-border bg-secondary/50 overflow-hidden hover:border-accent/40 transition-colors"
                    >
                      {(p.heroImage || p.image) && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={p.heroImage ?? p.image}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{p.title}</p>
                        {p.tagline && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{p.tagline}</p>
                        )}
                        <span className="mt-1.5 flex items-center gap-1 text-[10px] text-accent font-semibold">
                          View <ArrowRight className="w-2.5 h-2.5" />
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
                <ul className="space-y-2">
                  {awards.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border text-sm"
                    >
                      <Trophy className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">{a.award_title}</span>
                        {a.award_issuer && <span className="text-muted-foreground"> · {a.award_issuer}</span>}
                        {(a.award_date_month || a.award_date_year) && (
                          <span className="text-muted-foreground text-xs ml-1">
                            ({[a.award_date_month?.slice(0, 3), a.award_date_year].filter(Boolean).join(" ")})
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

            {/* Media */}
            {media.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Media</p>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {media.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all bg-secondary"
                      title={m.media_caption}
                    >
                      {m.media_type === "Image" && m.media_url ? (
                        <img src={m.media_url} alt={m.media_caption} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <span className="text-2xl">
                            {({ Document: "📄", Presentation: "📊", Link: "🔗" } as Record<string, string>)[
                              m.media_type
                            ] ?? "📎"}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{m.media_type}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View full page link */}
            <Link
              to="/education"
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-accent/20 text-accent font-semibold text-sm hover:bg-accent/5 transition-colors"
            >
              View full education history <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </m.div>
      </m.div>

      {/* Lightbox layered on top */}
      {lightboxIndex !== null && (
        <MediaLightbox items={media} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Card entry ───────────────────────────────────────────────────────────────

function EducationCard({
  edu,
  index,
  linkedProjects,
  onSelect,
}: {
  edu: Education;
  index: number;
  linkedProjects: Project[];
  onSelect: () => void;
}) {
  const logo = getLogo(edu);
  const schoolName = getSchoolName(edu);
  const fieldOfStudy = getFieldOfStudy(edu);
  const isCurrent = getIsCurrent(edu);
  const duration = formatDuration(edu);
  const durationStr = calcDurationStr(edu);
  const expectedGrad = isExpectedGrad(edu);
  const websiteUrl = edu.school_website_url;
  const skills = edu.skills ?? [];
  const expectedLabel =
    expectedGrad && edu.end_month && edu.end_year
      ? `Expected ${edu.end_month.slice(0, 3)} ${edu.end_year}`
      : null;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-accent/40 hover:shadow-md transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {edu.is_featured && (
        <div className="h-0.5 w-full bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
      )}
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
            {logo ? (
              <img src={logo} alt={schoolName} loading="lazy" className="w-full h-full object-contain p-1" />
            ) : (
              <GraduationCap className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-foreground group-hover:text-accent transition-colors">
                {schoolName}
              </span>
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-accent transition-colors"
                  title="Visit school website"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {edu.is_featured && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  Featured
                </span>
              )}
            </div>
            {(edu.degree || fieldOfStudy) && (
              <p className="text-sm font-medium text-foreground/90 mt-0.5">
                {edu.degree}
                {edu.degree && fieldOfStudy ? " · " : ""}
                {fieldOfStudy}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <p className="text-xs text-muted-foreground">
                {duration}
                {durationStr && <span className="ml-1 text-muted-foreground">· {durationStr}</span>}
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
          <span className="text-[10px] text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 whitespace-nowrap flex-shrink-0">
            Details <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {edu.grade && edu.show_grade_publicly !== false && (
          <p className="text-xs text-muted-foreground mt-3">
            Grade: <span className="font-medium text-foreground">{edu.grade}</span>
          </p>
        )}

        {edu.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2">{edu.description}</p>
        )}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skills.slice(0, 6).map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium"
              >
                {s}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        )}

        {(edu.honors_and_awards ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(edu.honors_and_awards ?? []).slice(0, 2).map((a, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
              >
                <Trophy className="w-2.5 h-2.5" />
                {a.award_title}
              </span>
            ))}
          </div>
        )}

        {linkedProjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {linkedProjects.slice(0, 3).map((p) => (
              <span
                key={p.id}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-secondary/50 text-[10px] font-medium text-foreground"
              >
                {p.title} <ArrowRight className="w-2.5 h-2.5 text-accent" />
              </span>
            ))}
          </div>
        )}
      </div>
    </m.div>
  );
}

// ─── Preview card (homepage — condensed, click → detail modal) ────────────────

function PreviewCard({ edu, index, onSelect }: { edu: Education; index: number; onSelect: () => void }) {
  const logo = getLogo(edu);
  const schoolName = getSchoolName(edu);
  const fieldOfStudy = getFieldOfStudy(edu);
  const duration = formatDuration(edu);
  const isCurrent = getIsCurrent(edu);
  const websiteUrl = edu.school_website_url;

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
    >
      {/* Outer div handles the card click — separate from any link inside */}
      <div
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-accent/40 hover:shadow-sm transition-all group cursor-pointer"
      >
        <div className="w-10 h-10 shrink-0 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden">
          {logo ? (
            <img src={logo} alt={schoolName} loading="lazy" className="w-8 h-8 object-contain" />
          ) : (
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors truncate">
              {schoolName}
            </p>
            {/* School website link — stopPropagation prevents opening the modal */}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0 text-muted-foreground hover:text-accent transition-colors"
                title="Visit school website"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {(edu.degree || fieldOfStudy) && (
            <p className="text-xs text-muted-foreground truncate">
              {edu.degree}
              {edu.degree && fieldOfStudy ? " · " : ""}
              {fieldOfStudy}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isCurrent && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              Current
            </span>
          )}
          {duration && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{duration}</span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>
      </div>
    </m.div>
  );
}

// ─── Timeline entry ───────────────────────────────────────────────────────────

function EducationTimelineEntry({
  edu,
  index,
  isLast,
  onSelect,
}: {
  edu: Education;
  index: number;
  isLast: boolean;
  onSelect: () => void;
}) {
  const logo = getLogo(edu);
  const schoolName = getSchoolName(edu);
  const fieldOfStudy = getFieldOfStudy(edu);
  const isCurrent = getIsCurrent(edu);
  const duration = formatDuration(edu);
  const websiteUrl = edu.school_website_url;
  const expectedLabel =
    isExpectedGrad(edu) && edu.end_month && edu.end_year
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
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={onSelect}
          className="w-[48px] h-[48px] shrink-0 rounded-xl bg-card border border-border hover:border-accent/50 flex items-center justify-center overflow-hidden z-10 transition-colors"
        >
          {logo ? (
            <img src={logo} alt={schoolName} loading="lazy" className="w-8 h-8 object-contain" />
          ) : (
            <GraduationCap className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-2 min-h-[24px]" />}
      </div>

      <div className="flex-1 pb-8 min-w-0">
        <div className="flex items-center gap-1.5 h-[48px]">
          <button
            type="button"
            onClick={onSelect}
            className="font-semibold text-foreground hover:text-accent transition-colors text-base text-left"
          >
            {schoolName}
          </button>
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {edu.is_featured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              Featured
            </span>
          )}
        </div>

        {(edu.degree || fieldOfStudy) && (
          <p className="text-sm font-medium text-foreground/90 mb-0.5">
            {edu.degree}
            {edu.degree && fieldOfStudy ? " · " : ""}
            {fieldOfStudy}
          </p>
        )}

        <div className="flex items-center gap-1.5 mb-2">
          <p className="text-xs text-muted-foreground">{duration}</p>
          {expectedLabel && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {expectedLabel}
            </span>
          )}
          {isCurrent && !expectedLabel && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              Present
            </span>
          )}
        </div>

        {edu.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{edu.description}</p>
        )}

        {(edu.skills ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(edu.skills ?? []).map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onSelect}
          className="mt-2 flex items-center gap-1 text-xs text-accent font-semibold hover:underline"
        >
          View details <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </m.div>
  );
}

// ─── Summary line ─────────────────────────────────────────────────────────────

function EducationSummary({ education }: { education: Education[] }) {
  if (!education.length) return null;
  const count = education.length;
  const latestDegree = education.find((e) => e.degree)?.degree;
  const field = education.find((e) => getFieldOfStudy(e));
  const latestField = field ? getFieldOfStudy(field) : undefined;
  const expectedEntry = education.find((e) => isExpectedGrad(e));
  const expectedLabel =
    expectedEntry && expectedEntry.end_month && expectedEntry.end_year
      ? `Expected ${expectedEntry.end_month.slice(0, 3)} ${expectedEntry.end_year}`
      : null;

  const parts: string[] = [];
  parts.push(`${count} institution${count > 1 ? "s" : ""}`);
  if (latestDegree && latestField) parts.push(`${latestDegree} in ${latestField}`);
  else if (latestDegree) parts.push(latestDegree);
  if (expectedLabel) parts.push(expectedLabel);

  return <p className="text-sm text-muted-foreground font-medium mb-6">{parts.join(" · ")}</p>;
}

// ─── Main section ─────────────────────────────────────────────────────────────

interface EducationSectionProps {
  preview?: boolean;
}

export function EducationSection({ preview = false }: EducationSectionProps) {
  const { data: allEducation = [], isLoading } = useEducation();
  const { data: allProjects = [] } = useProjects();
  const [view, setView] = useState<"card" | "timeline">("card");
  const [selectedEdu, setSelectedEdu] = useState<Education | null>(null);

  const education = allEducation.filter((e) => e && e.is_published !== false);

  function getLinkedProjects(edu: Education): Project[] {
    return allProjects.filter((p) => (p.linked_education_ids ?? []).includes(edu.id));
  }

  if (isLoading) {
    return (
      <section className="section-padding bg-secondary/30">
        <div className="section-container max-w-3xl">
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`${preview ? "h-16" : "h-44"} rounded-2xl bg-card border border-border animate-pulse`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (education.length === 0) return null;

  const sorted = [...education].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    if (a.display_order !== undefined && b.display_order !== undefined)
      return a.display_order - b.display_order;
    return (getStartYear(b) ?? 0) - (getStartYear(a) ?? 0);
  });

  // Shared modal — rendered via portal so it's always at document.body, unaffected by CSS transforms
  const modal = selectedEdu ? (
    <EducationDetailModal
      edu={selectedEdu}
      linkedProjects={getLinkedProjects(selectedEdu)}
      onClose={() => setSelectedEdu(null)}
    />
  ) : null;

  // ── Preview mode ──
  if (preview) {
    return (
      <section aria-labelledby="education-heading-compact" className="section-padding bg-secondary/30">
        <div className="section-container">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-end justify-between"
          >
            <div>
              <span className="section-title">Education</span>
              <h2
                id="education-heading-compact"
                className="font-display text-3xl md:text-4xl font-bold text-foreground"
              >
                Academic Background
              </h2>
            </div>
            <Link
              to="/education"
              className="hidden sm:flex items-center gap-1.5 text-sm text-accent font-semibold hover:underline flex-shrink-0"
            >
              View all qualifications <ArrowRight className="w-4 h-4" />
            </Link>
          </m.div>

          <div className="space-y-2">
            {sorted.slice(0, 3).map((edu, i) => (
              <PreviewCard key={edu.id} edu={edu} index={i} onSelect={() => setSelectedEdu(edu)} />
            ))}
          </div>

          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <Link
              to="/education"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-accent/20 text-accent font-semibold text-sm hover:bg-accent/5 transition-colors"
            >
              {sorted.length > 3
                ? `See full education history (${sorted.length} entries)`
                : "See full education history"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </m.div>
        </div>

        {modal}
      </section>
    );
  }

  // ── Full mode ──
  return (
    <section aria-labelledby="education-heading" className="section-padding bg-secondary/30">
      <div className="section-container">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="section-title">Education</span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2
              id="education-heading"
              className="font-display text-3xl md:text-4xl font-bold text-foreground"
            >
              Academic Background
            </h2>
            {education.length > 1 && (
              <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
                <button
                  onClick={() => setView("card")}
                  aria-pressed={view === "card"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "card" ? "bg-accent text-black" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutList className="w-3.5 h-3.5" /> Cards
                </button>
                <button
                  onClick={() => setView("timeline")}
                  aria-pressed={view === "timeline"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "timeline" ? "bg-accent text-black" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <GitBranch className="w-3.5 h-3.5" /> Timeline
                </button>
              </div>
            )}
          </div>
          <div className="mt-3">
            <EducationSummary education={sorted} />
          </div>
        </m.div>

        <AnimatePresence mode="wait">
          {view === "card" ? (
            <m.div
              key="cards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {sorted.map((edu, i) => (
                <EducationCard
                  key={edu.id}
                  edu={edu}
                  index={i}
                  linkedProjects={getLinkedProjects(edu)}
                  onSelect={() => setSelectedEdu(edu)}
                />
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
                <EducationTimelineEntry
                  key={edu.id}
                  edu={edu}
                  index={i}
                  isLast={i === sorted.length - 1}
                  onSelect={() => setSelectedEdu(edu)}
                />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {modal}
    </section>
  );
}
