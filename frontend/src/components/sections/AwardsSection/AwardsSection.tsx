import { useState } from "react";
import { m } from "framer-motion";
import { Trophy, ChevronDown, ChevronUp, ExternalLink, Calendar } from "lucide-react";
import { useAwards } from "@/shared/hooks/useCommon";
import { Award } from "@/types";

function AwardCard({ award, index }: { award: Award; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (award.description || "").length > 160;

  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative group bg-card border border-border rounded-2xl p-6 overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[4px]"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 0 0 1.5px hsl(var(--accent)), 0 16px 36px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* Decorative trophy icon in top-right */}
      <Trophy
        className="absolute top-4 right-4 w-10 h-10 text-accent/10 group-hover:text-accent/20 transition-colors duration-300"
        aria-hidden
      />

      {/* Issuer logo (if provided) */}
      {award.icon && (
        <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center mb-4 overflow-hidden">
          <img src={award.icon} alt={award.issuer} loading="lazy" className="w-7 h-7 object-contain" />
        </div>
      )}

      {/* Award name */}
      <h3 className="font-display font-bold text-foreground text-base leading-snug mb-1 group-hover:text-accent transition-colors duration-[250ms] pr-8">
        {award.title}
      </h3>

      {/* Issuer + date */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
        <span className="font-medium">{award.issuer}</span>
        {award.date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {award.date}
          </span>
        )}
      </div>

      {/* Description — clamped to 2 lines, expandable */}
      {award.description && (
        <div>
          <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {award.description}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="mt-1.5 flex items-center gap-1 text-xs text-accent font-medium hover:underline"
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

      {/* External link */}
      {award.link && (
        <a
          href={award.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
        >
          View Award <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </m.div>
  );
}

export function AwardsSection() {
  const { data: awards = [], isLoading } = useAwards();

  if (isLoading) {
    return (
      <section className="section-padding bg-secondary/30">
        <div className="section-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (awards.length === 0) return null;

  return (
    <section className="section-padding bg-secondary/30">
      <div className="section-container">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="section-title">Recognition</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Awards &amp; Honors
          </h2>
        </m.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {awards.map((award, i) => (
            <AwardCard key={award.id} award={award} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
