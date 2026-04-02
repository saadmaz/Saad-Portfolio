/**
 * queryKeys.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all TanStack Query cache keys.
 *
 * Benefits:
 *  - No duplicate/inconsistent keys across hooks → cache misses gone
 *  - Invalidate by prefix:  queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
 *  - TypeScript-safe keys everywhere
 */

export const queryKeys = {
  projects: {
    all:      ["projects"]                        as const,
    featured: ["projects", "featured"]            as const,
    detail:   (slug: string) => ["projects", slug] as const,
  },
  blog: {
    all:       ["blog"]                           as const,
    published: ["blog", "published"]              as const,
    latest:    ["blog", "latest"]                 as const,
    detail:    (slug: string) => ["blog", slug]   as const,
  },
  experience:   { all: ["experience"]             as const },
  skills:       { all: ["skills"]                 as const },
  certificates: { all: ["certificates"]           as const },
  awards:       { all: ["awards"]                 as const },
  languages:    { all: ["languages"]              as const },
  hackathons:   { all: ["hackathons"]             as const },
  testimonials: { all: ["testimonials"]           as const },
  volunteer:    { all: ["volunteer"]              as const },
  education:    { all: ["education"]              as const },
  events:       { all: ["events"]                 as const },
  newsletters:  { all: ["newsletters"]            as const },
  messages:     { all: ["messages"]               as const },
  logs:         { all: ["logs"]                   as const },
} as const;
