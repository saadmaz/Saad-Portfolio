/**
 * lib/queryKeys.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all TanStack Query cache keys.
 * Every hook must take its key from here - never an inline array -
 * so two hooks can never share a key for differently-shaped data.
 */

export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    featured: ["projects", "featured"] as const,
    detail: (slug: string) => ["projects", "detail", slug] as const,
  },
  blog: {
    published: ["blog", "published"] as const,
    latest: ["blog", "latest"] as const,
    detail: (slug: string) => ["blog", "detail", slug] as const,
  },
  experience: { all: ["experience"] as const },
  skills: { all: ["skills"] as const },
  certificates: { all: ["certificates"] as const },
  awards: { all: ["awards"] as const },
  languages: { all: ["languages"] as const },
  hackathons: { all: ["hackathons"] as const },
  testimonials: { all: ["testimonials"] as const },
  volunteer: { all: ["volunteer"] as const },
  education: { all: ["education"] as const },
  events: { all: ["events"] as const },
  newsletters: { all: ["newsletters"] as const },
  courses: { all: ["courses"] as const },
  publications: { all: ["publications"] as const },
  patents: { all: ["patents"] as const },
  testScores: { all: ["testScores"] as const },
  organizations: { all: ["organizations"] as const },
  causes: { all: ["causes"] as const },
} as const;
