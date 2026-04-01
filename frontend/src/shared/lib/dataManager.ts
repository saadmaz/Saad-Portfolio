/**
 * shared/lib/dataManager.ts
 * ─────────────────────────────────────────────────────────────
 * Centralised data-access layer used by usePortfolioData hooks.
 *
 * BEFORE: all methods called apiClient (axios → Express → Firestore)
 * AFTER:  all methods call Firestore directly via the Firebase SDK
 *
 * Type definitions are kept here as-is so that usePortfolioData.ts
 * imports still resolve without changes.
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Type definitions ─────────────────────────────────────────────
// These live here (not in /types) because usePortfolioData imports them
// directly from this file. Keep them in sync with /types/index.ts.

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  slug: string;
  author: string;
  coverImage?: string;
  tags?: string[];
  isLatest?: boolean;
}

export interface WorkExperience {
  id: number;
  company: string;
  position: string;
  employmentType?: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  location?: string;
  workMode?: string;
  department?: string;
  description?: string;
  responsibilities?: string[];
  technologies?: string[];
  achievements?: string[];
  companyUrl?: string;
  companyLogo?: string;
  companyIndustry?: string;
  companySize?: string;
  teamSize?: number;
  reportsTo?: string;
  directReports?: number;
  projectsHighlighted?: string[];
  referenceAvailable?: boolean;
  linkedinUrl?: string;
  mediaLinks?: string[];
  impact?: string;
  isLatest?: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  platform?: string;
  issuer_logo?: string;
  issue_date?: string;
  expiry_date?: string | null;
  does_not_expire?: boolean;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  skills?: string[];
  category?: string;
  type?: string;
  tags?: string[];
  pdf_document_link?: string;
  is_verifiable?: boolean;
  is_featured?: boolean;
  [key: string]: unknown;
}

export interface Skill {
  category: string;
  skills: Array<{
    name: string;
    level: string;
    years: number;
    endorsed?: number;
  }>;
}

export interface Project {
  id: string;
  slug?: string;
  title: string;
  date?: string;
  status?: string;
  tagline?: string;
  gradientStart?: string;
  gradientEnd?: string;
  techStack?: string[];
  role?: string;
  duration?: string;
  githubUrl?: string;
  liveUrl?: string;
  pdfReport?: string;
  heroImage?: string;
  screenshots?: string[];
  videoDemo?: string;
  overview?: string;
  problem?: string;
  solution?: string;
  impact?: string;
  architecture?: { description?: string; diagramUrl?: string };
  databaseSchema?: string;
  apiDocs?: string;
  challenges?: Array<{ wall?: string; fix?: string; lesson?: string }>;
  metrics?: {
    users?: number;
    lighthouseScore?: { performance?: number; accessibility?: number; seo?: number };
    testCoverage?: number;
    cicd?: string;
  };
  stackDeepDive?: { frontend?: string; backend?: string; aiIntegration?: string };
  roadmap?: string[];
  features?: string[];
  colour?: string;
  featured?: boolean;
  order?: number;
  technologies?: string[];
  isLatest?: boolean;
  [key: string]: unknown;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  type: string;
  location: string;
  description: string;
  image: string;
  link: string;
  achievement?: string;
}

export interface Newsletter {
  id: number;
  type: "founder" | "cse";
  title: string;
  date: string;
  issue: number;
  description: string;
  link: string;
  subscribers: number;
  isLatest?: boolean;
}

export interface Hosting {
  id: number;
  type: "blog" | "app" | "api";
  title: string;
  url: string;
  platform: string;
  deployDate: string;
  status: string;
  description: string;
  technologies: string[];
  date?: string;
}

// ─── Sort helper ──────────────────────────────────────────────────

/** Sorts any array descending by date / startDate (latest first). */
const sortByDateDesc = <T extends { date?: string; startDate?: string }>(
  items: T[]
): T[] =>
  [...items].sort((a, b) => {
    const dA = new Date(a.date ?? a.startDate ?? 0).getTime();
    const dB = new Date(b.date ?? b.startDate ?? 0).getTime();
    return dB - dA;
  });

// ─── Firestore collection names ───────────────────────────────────
const COLS = {
  blogs:       "blog_posts",
  experience:  "work_experience",
  certificates:"certificates",
  skills:      "skills",
  projects:    "projects",
  events:      "events",
  newsletters: "newsletters",
  hosting:     "hosting",
} as const;

// ─── DataManager class ────────────────────────────────────────────

/**
 * Provides read access to all portfolio data.
 * Used exclusively by usePortfolioData.ts hooks.
 *
 * All methods are async and return typed arrays.
 * On error they return [] so pages never hard-crash.
 */
export class DataManager {

  // ── Blogs ────────────────────────────────────────────────────────

  /** All published blog posts, latest first. */
  async getBlogs(): Promise<Blog[]> {
    try {
      const q = query(
        collection(db, COLS.blogs),
        where("published", "==", true),
        orderBy("date", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          // Normalise field name differences between old json files and Firestore
          readTime:   data.read_time   ?? data.readTime   ?? "",
          coverImage: data.cover_image ?? data.coverImage ?? undefined,
          isLatest:   data.is_latest   ?? data.isLatest   ?? false,
        } as Blog;
      });
    } catch (err) {
      console.error("[DataManager] getBlogs:", err);
      return [];
    }
  }

  /** Slice of the blog list, used for "recent posts" widgets. */
  async getFeaturedBlogs(limit?: number): Promise<Blog[]> {
    const blogs = await this.getBlogs();
    return limit ? blogs.slice(0, limit) : blogs;
  }

  /** Single blog by slug. */
  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const blogs = await this.getBlogs();
    return blogs.find((b) => b.slug === slug);
  }

  // ── Work Experience ──────────────────────────────────────────────

  /** All work experience entries. */
  async getWorkExperience(): Promise<WorkExperience[]> {
    try {
      const snap = await getDocs(collection(db, COLS.experience));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkExperience));
    } catch (err) {
      console.error("[DataManager] getWorkExperience:", err);
      return [];
    }
  }

  // ── Certificates ─────────────────────────────────────────────────

  async getCertificates(): Promise<Certificate[]> {
    try {
      const snap = await getDocs(collection(db, COLS.certificates));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Certificate));
    } catch (err) {
      console.error("[DataManager] getCertificates:", err);
      return [];
    }
  }

  // ── Skills ───────────────────────────────────────────────────────

  /** Skills grouped by category (each Firestore doc = one category). */
  async getSkills(): Promise<Skill[]> {
    try {
      const snap = await getDocs(collection(db, COLS.skills));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Skill));
    } catch (err) {
      console.error("[DataManager] getSkills:", err);
      return [];
    }
  }

  // ── Projects ─────────────────────────────────────────────────────

  /** All projects. Normalises legacy field names (github→githubUrl etc.). */
  async getProjects(): Promise<Project[]> {
    try {
      const q = query(collection(db, COLS.projects), orderBy("order_index", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const p = d.data() as Record<string, unknown>;
        return {
          ...p,
          id: d.id,
          // Normalise field aliases so components get consistent keys
          githubUrl:  p.github    ?? p.githubUrl,
          liveUrl:    p.link      ?? p.live_preview ?? p.liveUrl,
          heroImage:  p.image     ?? p.heroImage,
          screenshots:p.images    ?? p.screenshots,
          techStack:  p.technologies ?? p.techStack,
          isLatest:   p.is_latest ?? p.isLatest ?? false,
        } as Project;
      });
    } catch (err) {
      console.error("[DataManager] getProjects:", err);
      return [];
    }
  }

  /** Projects where featured===true or isLatest===true. */
  async getFeaturedProjects(limit?: number): Promise<Project[]> {
    const projects = await this.getProjects();
    const featured = projects.filter((p) => p.featured || p.isLatest);
    return limit ? featured.slice(0, limit) : featured;
  }

  /** Slice off the top N most recently-ordered projects. */
  async getRecentProjects(limit?: number): Promise<Project[]> {
    const projects = await this.getProjects();
    return limit ? projects.slice(0, limit) : projects;
  }

  /** Single project by slug (client-side filter after full fetch). */
  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    const projects = await this.getProjects();
    return projects.find((p) => p.slug === slug || p.slug === `/${slug}`);
  }

  /** Single project by ID. */
  async getProjectById(id: string): Promise<Project | undefined> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id);
  }

  // ── Events ───────────────────────────────────────────────────────

  async getEvents(): Promise<Event[]> {
    try {
      const q = query(collection(db, COLS.events), orderBy("date", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event));
    } catch (err) {
      console.error("[DataManager] getEvents:", err);
      return [];
    }
  }

  // ── Newsletters ──────────────────────────────────────────────────

  async getNewsletters(): Promise<Newsletter[]> {
    try {
      const q = query(collection(db, COLS.newsletters), orderBy("date", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Newsletter));
    } catch (err) {
      console.error("[DataManager] getNewsletters:", err);
      return [];
    }
  }

  async getNewslettersByType(type: "founder" | "cse"): Promise<Newsletter[]> {
    const newsletters = await this.getNewsletters();
    return newsletters.filter((n) => n.type === type);
  }

  // ── Hosting ──────────────────────────────────────────────────────

  async getHosting(): Promise<Hosting[]> {
    try {
      const snap = await getDocs(collection(db, COLS.hosting));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Hosting));
    } catch (err) {
      console.error("[DataManager] getHosting:", err);
      return [];
    }
  }

  async getHostingByType(type: "blog" | "app" | "api"): Promise<Hosting[]> {
    const hosting = await this.getHosting();
    return hosting.filter((h) => h.type === type);
  }

  async getActiveHosting(): Promise<Hosting[]> {
    const hosting = await this.getHosting();
    return hosting.filter((h) => h.status === "active");
  }
}

// ─── Singleton export ─────────────────────────────────────────────
export const dataManager = new DataManager();
export default dataManager;
