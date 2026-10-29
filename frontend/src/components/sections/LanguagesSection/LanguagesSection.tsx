import { m } from "framer-motion";
import { useLanguages } from "@/hooks/useContent";
import { Language } from "@/types";

const levelConfig: Record<string, { label: string; color: string; bg: string }> = {
  "Native / Bilingual": {
    label: "Native",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/15 border border-emerald-500/30",
  },
  "Professional Working": {
    label: "Professional",
    color: "text-accent",
    bg: "bg-accent/10 border border-accent/25",
  },
  "Limited Working": {
    label: "Conversational",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/15 border border-amber-500/30",
  },
  Elementary: {
    label: "Basic",
    color: "text-muted-foreground",
    bg: "bg-secondary border border-border",
  },
};

function getLevelConfig(level: string) {
  return levelConfig[level] || levelConfig["Professional Working"];
}

function getBarColor(level: string): string {
  const map: Record<string, string> = {
    "Native / Bilingual": "bg-emerald-500",
    "Professional Working": "bg-accent",
    "Limited Working": "bg-amber-500",
    Elementary: "bg-muted-foreground",
  };
  return map[level] || "bg-accent";
}

function LanguageCard({ lang, index }: { lang: Language; index: number }) {
  const cfg = getLevelConfig(lang.level);
  const barColor = getBarColor(lang.level);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-sm transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-foreground group-hover:text-accent transition-colors duration-[250ms]">
          {lang.name}
        </h3>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Proficiency bar */}
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <m.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${lang.percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.08 + 0.2, ease: "easeOut" }}
        />
      </div>
    </m.div>
  );
}

export function LanguagesSection() {
  const { data: languages = [], isLoading } = useLanguages();

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="section-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (languages.length === 0) return null;

  return (
    <section aria-labelledby="languages-heading" className="section-padding">
      <div className="section-container">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="section-title">Languages</span>
          <h2 id="languages-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Languages I Speak
          </h2>
        </m.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
          {languages.map((lang, i) => (
            <LanguageCard key={lang.id} lang={lang} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
