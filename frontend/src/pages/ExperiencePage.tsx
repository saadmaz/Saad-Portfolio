import { useState } from 'react';
import { m } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { PAGE_SEO, BASE_URL } from '@/lib/seo-content';
import { Building, ExternalLink, MapPin, Trophy, Star, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useExperience } from '@/shared/hooks/useCommon';
import { Experience, ExperienceMedia } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Normalized types ─────────────────────────────────────────────────────────

interface NormalizedRole {
  title: string;
  startDate?: string;
  endDate?: string;
  startMonth?: string;
  startYear?: number;
  endMonth?: string;
  endYear?: number;
  isCurrent: boolean;
  description?: string;
  skills: string[];
  media?: ExperienceMedia[];
  location?: string;
  locationType?: string;
  employmentType?: string;
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
  responsibilities?: string[];
  roles: NormalizedRole[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(month?: string, year?: number, legacy?: string): Date | null {
  if (year) { const m = month ? MONTHS.indexOf(month) : 0; return new Date(year, m < 0 ? 0 : m, 1); }
  if (legacy && legacy !== 'Present') {
    const p = legacy.trim().split(/\s+/);
    const y = parseInt(p[p.length - 1]);
    const m = MONTHS.indexOf(p[0]);
    if (!isNaN(y)) return new Date(y, m < 0 ? 0 : m, 1);
  }
  return null;
}

function calcDuration(start: Date | null, end: Date | null, isCurrent: boolean): string {
  if (!start) return '';
  const e = isCurrent ? new Date() : (end ?? new Date());
  let months = (e.getFullYear() - start.getFullYear()) * 12 + (e.getMonth() - start.getMonth());
  if (months < 1) months = 1;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  return [yrs > 0 && `${yrs} yr${yrs > 1 ? 's' : ''}`, mos > 0 && `${mos} mo${mos > 1 ? 's' : ''}`].filter(Boolean).join(' ');
}

function fmtDate(month?: string, year?: number, legacy?: string): string {
  if (month && year) return `${month.slice(0, 3)} ${year}`;
  if (year) return String(year);
  return legacy ?? '';
}

// ─── Data normalizer ──────────────────────────────────────────────────────────

function normalize(experiences: Experience[]): NormalizedCompany[] {
  const newMap = new Map<string, NormalizedCompany>();
  const legMap = new Map<string, NormalizedCompany>();

  for (const exp of experiences) {
    const name = exp.company_name ?? exp.company ?? '';
    const logo = exp.company_logo ?? exp.companyLogo;

    if (exp.roles && exp.roles.length > 0) {
      const key = String(exp.id ?? name);
      if (!newMap.has(key)) {
        newMap.set(key, {
          key, name, logo,
          companyUrl: exp.companyUrl,
          employmentType: exp.employment_type ?? exp.employmentType,
          location: exp.location,
          locationType: exp.location_type ?? exp.workMode,
          isFeatured: exp.is_featured,
          displayOrder: exp.display_order ?? exp.order_index,
          achievements: exp.achievements ?? exp.impact,
          topSkills: exp.skills ?? exp.technologies ?? [],
          topMedia: exp.media,
          responsibilities: exp.responsibilities,
          roles: [],
        });
      }
      const g = newMap.get(key)!;
      for (const r of exp.roles) {
        g.roles.push({
          title: r.role_title,
          startMonth: r.role_start_month, startYear: r.role_start_year,
          endMonth: r.role_end_month, endYear: r.role_end_year,
          isCurrent: r.role_is_current,
          description: r.description,
          skills: r.skills ?? [],
          media: r.media,
        });
      }
    } else {
      const key = name;
      if (!legMap.has(key)) {
        legMap.set(key, {
          key, name, logo,
          companyUrl: exp.companyUrl,
          employmentType: exp.employment_type ?? exp.employmentType,
          location: exp.location,
          locationType: exp.location_type ?? exp.workMode,
          isFeatured: exp.is_featured,
          displayOrder: exp.display_order ?? exp.order_index,
          achievements: exp.achievements ?? exp.impact,
          topSkills: exp.skills ?? exp.technologies ?? [],
          topMedia: exp.media,
          responsibilities: exp.responsibilities,
          roles: [],
        });
      }
      legMap.get(key)!.roles.push({
        title: exp.position ?? '',
        startDate: exp.startDate, endDate: exp.endDate,
        isCurrent: exp.is_current ?? exp.isCurrent ?? false,
        description: exp.description,
        skills: exp.skills ?? exp.technologies ?? [],
        media: exp.media,
        location: exp.location,
        locationType: exp.location_type ?? exp.workMode,
        employmentType: exp.employment_type ?? exp.employmentType,
      });
    }
  }

  for (const [, g] of legMap) {
    g.roles.sort((a, b) => {
      const aD = parseDate(a.startMonth, a.startYear, a.startDate);
      const bD = parseDate(b.startMonth, b.startYear, b.startDate);
      return (bD?.getTime() ?? 0) - (aD?.getTime() ?? 0);
    });
  }

  const all = [...Array.from(newMap.values()), ...Array.from(legMap.values())];
  all.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    if (a.displayOrder !== undefined && b.displayOrder !== undefined) return a.displayOrder - b.displayOrder;
    if (a.displayOrder !== undefined) return -1;
    if (b.displayOrder !== undefined) return 1;
    const aD = a.roles[0] ? parseDate(a.roles[0].startMonth, a.roles[0].startYear, a.roles[0].startDate) : null;
    const bD = b.roles[0] ? parseDate(b.roles[0].startMonth, b.roles[0].startYear, b.roles[0].startDate) : null;
    return (bD?.getTime() ?? 0) - (aD?.getTime() ?? 0);
  });
  return all;
}

// ─── Media Strip (with lightbox) ─────────────────────────────────────────────

function MediaStrip({ items }: { items: ExperienceMedia[] }) {
  const [lb, setLb] = useState<ExperienceMedia | null>(null);
  if (!items.length) return null;
  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide snap-x">
        {items.map((m, i) => (
          <button
            key={i}
            onClick={() => m.media_type === 'Image' ? setLb(m) : window.open(m.media_url, '_blank', 'noopener')}
            className="snap-start flex-shrink-0 group w-28 h-20 rounded-xl overflow-hidden bg-secondary border border-border hover:border-accent/40 transition-all"
            title={m.media_caption ?? m.media_url}
          >
            {m.media_type === 'Image'
              ? <img src={m.media_url} alt={m.media_caption ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground group-hover:text-accent transition-colors">
                  <span className="text-2xl">{m.media_type === 'Document' ? '📄' : m.media_type === 'Presentation' ? '📊' : '🔗'}</span>
                  {m.media_caption && <span className="text-[10px] px-2 truncate w-full text-center">{m.media_caption}</span>}
                </div>
              )
            }
          </button>
        ))}
      </div>
      {lb && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLb(null)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button className="absolute -top-10 right-0 text-white/70 hover:text-white" onClick={() => setLb(null)}>
              <X className="w-6 h-6" />
            </button>
            <img src={lb.media_url} alt={lb.media_caption ?? ''} className="rounded-xl max-h-[80vh] object-contain mx-auto" />
            {lb.media_caption && <p className="text-center text-sm text-white/60 mt-3">{lb.media_caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────

function RoleCard({ role }: { role: NormalizedRole }) {
  const [expanded, setExpanded] = useState(false);
  const start = parseDate(role.startMonth, role.startYear, role.startDate);
  const end = role.isCurrent ? null : parseDate(role.endMonth, role.endYear, role.endDate);
  const duration = calcDuration(start, end, role.isCurrent);
  const startLabel = fmtDate(role.startMonth, role.startYear, role.startDate);
  const endLabel = role.isCurrent ? 'Present' : fmtDate(role.endMonth, role.endYear, role.endDate);

  const allMedia = role.media ?? [];

  return (
    <div className="border-l-2 border-border pl-6 relative">
      <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-accent" />
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <h3 className="font-bold text-foreground text-lg">{role.title}</h3>
        {role.employmentType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
            {role.employmentType}
          </span>
        )}
        {role.isCurrent && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
            Current
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {[startLabel, endLabel].filter(Boolean).join(' – ')}
        {duration && <> · <span className="font-medium">{duration}</span></>}
        {role.location && (
          <> · <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{role.location}</span></>
        )}
        {role.locationType && <> · <span className="px-1.5 py-0.5 rounded bg-secondary text-xs">{role.locationType}</span></>}
      </p>

      {role.description && (
        <div className="mb-4">
          <p className={`text-muted-foreground text-sm leading-relaxed ${expanded ? '' : 'line-clamp-4'}`}>
            {role.description}
          </p>
          {role.description.length > 300 && (
            <button onClick={() => setExpanded(v => !v)} className="mt-1 flex items-center gap-1 text-xs text-accent hover:underline">
              {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
            </button>
          )}
        </div>
      )}

      {role.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {role.skills.map(s => <span key={s} className="tech-chip">{s}</span>)}
        </div>
      )}

      {allMedia.length > 0 && <MediaStrip items={allMedia} />}
    </div>
  );
}

// ─── Company card ─────────────────────────────────────────────────────────────

function CompanyCard({ company, index }: { company: NormalizedCompany; index: number }) {
  const { name, logo, companyUrl, employmentType, location, locationType, isFeatured, roles, achievements, topSkills, topMedia, responsibilities } = company;

  const allStarts = roles.map(r => parseDate(r.startMonth, r.startYear, r.startDate)).filter(Boolean) as Date[];
  const hasCurrentRole = roles.some(r => r.isCurrent);
  const companyStart = allStarts.length ? new Date(Math.min(...allStarts.map(d => d.getTime()))) : null;
  const companyDuration = calcDuration(companyStart, hasCurrentRole ? null : null, hasCurrentRole);

  const allSkills = topSkills.length > 0 ? topSkills : [...new Set(roles.flatMap(r => r.skills))];
  const showTopSkills = allSkills.length > 0 && roles.every(r => r.skills.length === 0);
  const allMedia = topMedia?.length ? topMedia : [];

  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-card rounded-2xl border border-border p-6 md:p-8 card-hover"
    >
      {/* Company header */}
      <div className="flex items-start gap-4 mb-6">
        {/* Logo */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border flex-shrink-0 flex items-center justify-center">
          {logo ? (
            companyUrl ? (
              <a href={companyUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full block hover:opacity-80 transition-opacity">
                <img src={logo} alt={`${name} logo`} loading="lazy" className="w-full h-full object-contain p-1" />
              </a>
            ) : (
              <img src={logo} alt={`${name} logo`} loading="lazy" className="w-full h-full object-contain p-1" />
            )
          ) : (
            <Building className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Company meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            {companyUrl ? (
              <a href={companyUrl} target="_blank" rel="noopener noreferrer"
                className="font-display text-xl font-bold text-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                {name} <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            ) : (
              <h2 className="font-display text-xl font-bold text-foreground">{name}</h2>
            )}
            {isFeatured && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">
                <Star className="w-2.5 h-2.5" /> Featured
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {employmentType && <span>{employmentType}</span>}
            {companyDuration && <><span className="text-border">·</span><span>{companyDuration}</span></>}
            {location && (
              <><span className="text-border">·</span>
                <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>
              </>
            )}
            {locationType && (
              <><span className="text-border">·</span>
                <span className="px-1.5 py-0.5 rounded bg-secondary text-xs">{locationType}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Roles */}
      <div className="space-y-6">
        {roles.map((role, i) => <RoleCard key={i} role={role} />)}
      </div>

      {/* Key Responsibilities (legacy / top-level) */}
      {responsibilities && responsibilities.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">Key Responsibilities</h4>
          <ul className="space-y-2">
            {responsibilities.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Company-level skills (shown when per-role skills are empty) */}
      {showTopSkills && (
        <div className="flex flex-wrap gap-2 mt-6">
          {allSkills.map(s => <span key={s} className="tech-chip">{s}</span>)}
        </div>
      )}

      {/* Achievements */}
      {achievements && (
        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
          <Trophy className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Key Achievements</p>
            <p className="text-sm text-foreground leading-relaxed">{achievements}</p>
          </div>
        </div>
      )}

      {/* Company-level media */}
      {allMedia.length > 0 && <MediaStrip items={allMedia} />}
    </m.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ExperiencePage = () => {
  const { data: experiences = [], isLoading } = useExperience();
  const companies = normalize(experiences);

  if (isLoading) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="section-container space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-secondary/30 animate-pulse" />
            ))}
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/experience"].title}
        description={PAGE_SEO["/experience"].description}
        url={`${BASE_URL}/experience`}
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

          {/* Company cards stacked */}
          <div className="space-y-8">
            {companies.map((company, i) => (
              <CompanyCard key={company.key} company={company} index={i} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ExperiencePage;
