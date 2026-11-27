export interface Project {
  id: number | string;
  slug: string;
  title: string;
  tagline: string;
  date?: string;
  status: string;
  stage?: string;
  type?: string;
  category?: string;
  role?: string;
  duration?: string;
  colour?: string;
  order_index?: number;
  featured?: boolean;
  /** Projects page section; inferred from role/category when unset (lib/projectGroups). */
  group?: "venture" | "client" | "lab" | "academic";
  /** Defaults to visible when absent (legacy docs). Set to false to hide from the public site and sitemap. */
  published?: boolean;
  /** Search override: "auto" indexes once the write-up is long enough (see lib/indexing). */
  seo_visibility?: "auto" | "index" | "noindex";
  updated_at?: FirestoreLikeTimestamp;

  // Descriptions
  description?: string;
  long_description?: string;
  overview: string;

  // Media
  heroImage: string;
  /** Alt text for heroImage. Falls back to the project title when unset - never derived from free-text fields like tagline/description. */
  altText?: string;
  image?: string; // legacy alias for heroImage
  /** Square 1200×1200 image for the homepage project card. Falls back to heroImage. */
  cardImage?: string;
  images?: string[]; // legacy gallery
  screenshots?: string[];
  video?: string; // YouTube / video URL
  videoDemo?: string;

  // Tech
  techStack: string[];
  technologies?: string[];

  // Links
  githubUrl?: string;
  github?: string; // legacy alias for githubUrl
  liveUrl?: string;
  live_preview?: string; // legacy alias for liveUrl
  pdfReport?: string;

  // Content
  challenges?: Array<string | { wall?: string; fix?: string; lesson?: string }>;
  learnings?: string[];
  features?: string[];
  roadmap?: string[];
  problem?: string;
  solution?: string;
  impact?: string;
  gradientStart?: string;
  gradientEnd?: string;

  // Technical deep-dive (case-study sections on the detail page)
  architecture?: { description?: string; diagramUrl?: string; diagramAlt?: string };
  stackDeepDive?: { frontend?: string; backend?: string; aiIntegration?: string };
  databaseSchema?: string;
  apiDocs?: string;
  metrics?: {
    users?: number;
    lighthouseScore?: { performance?: number; accessibility?: number; seo?: number };
    testCoverage?: number;
    cicd?: string;
  };

  // ── SEO (all optional; fall back to title / tagline / generated card) ──
  /** Overrides the <title> (keep under ~60 characters). */
  seo_title?: string;
  /** Overrides the meta description (aim for 140–160 characters). */
  seo_description?: string;
  /** 1200×630 share image for social cards. Falls back to the generated card. */
  og_image?: string;
  /** Only when the original case study lives elsewhere; otherwise the page is its own canonical. */
  canonical_url?: string;

  // ── Story ──
  /** What I personally designed, built, managed or led. */
  contribution?: string[];
  /** Headline numbers, e.g. { value: "2,000+", label: "monthly users" }. */
  results?: { value: string; label: string }[];
  industry?: string;
  target_audience?: string;
  /** Names from the Skills collection this project demonstrates. */
  skills?: string[];

  // ── Timeline (YYYY-MM) ──
  start_date?: string;
  end_date?: string;
  is_ongoing?: boolean;

  // ── Architecture ──
  technical_decisions?: string[];

  // ── Team & credits ──
  team_size?: number | null;
  client?: string;
  collaborators?: { name: string; role?: string; url?: string }[];

  // ── Social proof & links ──
  testimonials?: { quote: string; name: string; role?: string; organisation?: string }[];
  related_project_ids?: string[];
  /** Gallery with per-image alt text and captions (screenshots[] stays in sync for older views). */
  gallery?: { url: string; alt?: string; caption?: string }[];
  videos?: { url: string; title?: string }[];
  /** Documentation, publications, press and write-ups about the project. */
  resources?: { label: string; url: string; kind?: string }[];

  // Cross-entity linking (source of truth for education/experience associations)
  linked_education_ids?: string[];
  linked_experience_ids?: string[];
}

export interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advance" | "Expert";
  startYear: number;
  icon?: string;
  /** Shown in the scrolling tools strip on the home page (needs an icon). */
  showInTools?: boolean;
  /** Strip only: kept off the public /skills page. */
  toolOnly?: boolean;
  /** Official homepage; falls back to the known list in lib/skill-links.js. */
  url?: string;
}

export interface SkillSet {
  category: string;
  skills: Skill[];
}

export interface ExperienceMedia {
  media_type: "Image" | "Document" | "Link" | "Presentation";
  media_url: string;
  media_caption?: string;
}

export interface ExperienceRole {
  role_title: string;
  role_start_month?: string;
  role_start_year?: number;
  role_end_month?: string;
  role_end_year?: number;
  role_is_current: boolean;
  description?: string;
  skills?: string[];
  media?: ExperienceMedia[];
}

export interface Experience {
  id: number | string;

  // ── New schema fields ──────────────────────────────────────────
  company_name?: string;
  company_logo?: string;
  /** 3D illustration for the experience journey road. Falls back to the logo. */
  journey_image?: string;
  /** Headline numbers for the company page, e.g. { value: "2,000+", label: "users" }. */
  impact_metrics?: { value: string; label: string }[];
  /** Up to three "what I did" cards for the company page. */
  highlights?: { title: string; description: string }[];
  /** One quote from a manager, client or colleague. */
  testimonial?: { quote: string; name: string; role?: string } | null;
  employment_type?: string;
  location_type?: "On-site" | "Remote" | "Hybrid";
  is_current?: boolean;
  start_month?: string;
  start_year?: number;
  end_month?: string;
  end_year?: number;
  roles?: ExperienceRole[];
  achievements?: string;
  skills?: string[];
  media?: ExperienceMedia[];
  display_order?: number;
  is_featured?: boolean;

  // ── Legacy / backward-compat fields ───────────────────────────
  company?: string;
  companyLogo?: string;
  companyUrl?: string;
  /** Company website (new schema; companyUrl is the legacy alias). */
  company_url?: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  workMode?: string;
  department?: string;
  description?: string;
  responsibilities?: string[];
  technologies?: string[];
  position?: string;
  impact?: string;
  order_index?: number;

  // ── Deprecated (kept for Firestore type-safety) ───────────────
  companyIndustry?: string;
  companySize?: string;
  teamSize?: number;
  reportsTo?: string;
  directReports?: number;
  projectsHighlighted?: string[];
  referenceAvailable?: boolean;
  linkedinUrl?: string;
  mediaLinks?: string[];
}

export interface Certificate {
  id: string;
  /** Readable URL segment (see lib/paths.ts). */
  slug?: string;
  title: string;
  issuer: string;
  platform: string;
  issuer_logo: string;
  issue_date: string;
  expiry_date: string | null;
  does_not_expire: boolean;
  credential_id?: string;
  credential_url: string;
  description: string;
  skills: string[];
  category: string;
  type: string;
  tags: string[];
  pdf_document_link: string;
  is_verifiable: boolean;
  is_featured: boolean;
}

export type {
  ArticleSource,
  ArticleStatus,
  Author,
  BlogPost,
  BlogSeries,
  BlogSettings,
  ImageAsset,
  ReactionCounts,
  Redirect,
} from "./blog";

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  icon?: string;
  link?: string;
}

export interface Language {
  id: string;
  name: string;
  level: string; // e.g., 'Native', 'Fluent', 'Professional'
  percentage: number;
  /** Optional 0–100 breakdown shown on /about. */
  speaking?: number;
  reading?: number;
  writing?: number;
  /** Where it's used, e.g. "Hosting events, client work". */
  note?: string;
}

/** site_settings/about: optional About page content edited in the admin. */
export interface AboutSettings {
  values?: { title: string; description: string }[];
  now?: { building?: string; learning?: string; reading?: string };
}

/** site_settings/contact: availability shown on the Contact page, edited in the admin. */
export interface ContactSettings {
  status?: "available" | "limited" | "booked";
  /** e.g. "Available for new projects" or "Booked until March". */
  message?: string;
  /** e.g. "within 24 hours". */
  reply_time?: string;
}

export interface Hackathon {
  id: string;
  name: string;
  organizer: string;
  date: string;
  role: string;
  projectTitle?: string;
  achievement?: string;
  description: string;
  image?: string;
  link?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  avatar?: string;
  link?: string;
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  image?: string;
  link?: string;
}

export interface EducationProject {
  project_title: string;
  project_description?: string;
  project_url?: string;
  project_thumbnail?: string;
}

export interface EducationMedia {
  media_type: "Image" | "Document" | "Link" | "Presentation";
  media_url: string;
  media_caption: string;
  media_description?: string;
  media_date_month?: string;
  media_date_year?: number;
  thumbnail_url?: string;
}

export interface EducationAward {
  award_title: string;
  award_issuer?: string;
  award_date_month?: string;
  award_date_year?: number;
  award_description?: string;
}

export interface Education {
  id: string;

  // Institution
  school_name: string;
  school_logo: string;
  school_website_url?: string;

  // Degree
  degree?: string;
  field_of_study?: string;

  // Duration
  start_month?: string;
  start_year?: number;
  end_month?: string;
  end_year?: number;
  is_current: boolean;

  // Academic
  grade?: string;
  show_grade_publicly?: boolean;
  activities_and_societies?: string;
  description?: string;

  // Arrays
  skills?: string[];
  projects?: EducationProject[];
  media?: EducationMedia[];
  honors_and_awards?: EducationAward[];

  // Settings
  is_featured?: boolean;
  display_order?: number;
  is_published?: boolean;

  // Timestamps
  created_at?: FirestoreLikeTimestamp;
  updated_at?: FirestoreLikeTimestamp;

  // Legacy backward-compat (old Firestore docs)
  institution?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  logo?: string;
}

export type FirestoreLikeTimestamp = { toDate: () => Date } | Date | string | number | null | undefined;

export interface Event {
  id: string;
  /** Readable URL segment (see lib/paths.ts). */
  slug?: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  description: string;
  role?: string; // Your participation role: Speaker, Host, Organizer, etc.
  attendees?: string; // e.g. "500+", "2,000+"
  highlights?: string[];
  image?: string;
  images?: string[];
  /** Optional alt text per photo, aligned with `images` (see lib/imageAlt.js). */
  imageCaptions?: string[];
  link?: string;
  tags?: string[];
  type: string; // Event category: Conference, Workshop, Summit, etc.
  /** Search visibility set in the CMS; "auto" (default) applies the word-count rule in lib/indexing.js. */
  seo_visibility?: "auto" | "index" | "noindex";
}

export interface Newsletter {
  id: string;
  title: string;
  description: string;
  date: string;
  content_url: string;
  image?: string;
  /** A series id from lib/newsletter.ts (legacy: "founder" | "cse"). */
  type: string;
  tags?: string[];
}

export interface Course {
  id: string;
  name: string;
  school: string;
  associatedWith?: string;
  completedDate?: string;
  description?: string;
  link?: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  description?: string;
  link?: string;
  authors?: string[];
  tags?: string[];
  /** paper | article | talk | book (see lib/publications.js). */
  type?: string;
  doi?: string;
  /** Uploaded PDF. */
  pdf?: string;
  /** Publisher or venue logo. */
  logo?: string;
  abstract?: string;
  featured?: boolean;
}

export interface Patent {
  id: string;
  title: string;
  patentOffice: string;
  patentNumber?: string;
  status: string;
  filingDate?: string;
  issueDate?: string;
  description?: string;
  link?: string;
}

export interface TestScore {
  id: string;
  testName: string;
  score: string;
  date?: string;
  description?: string;
}

export interface Organization {
  id: string;
  name: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  link?: string;
  image?: string;
}

export interface Cause {
  id: string;
  name: string;
  description?: string;
}
