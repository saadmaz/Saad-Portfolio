/**
 * Data Manager - Centralized data loading and management
 * Automatically loads data from JSON files and sorts by date (latest first)
 */

import blogsData from "@/data/content/blogs.json";
import workExperienceData from "@/data/personal/workExperience.json";
import certificatesData from "@/data/certificates.json";
import skillsData from "@/data/skills.json";
import projectsData from "@/data/projects.json";
import eventsData from "@/data/content/events.json";
import newslettersData from "@/data/content/newsletters.json";
import hostingData from "@/data/content/hosting.json";

// Type definitions
export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  slug: string;
  author: string;
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
  // JSON from assets contains various fields; we keep a flexible shape.
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
  [key: string]: any;
}

export interface Skill {
  category: string;
  skills: Array<{
    name: string;
    level: string;
    years: number;
    // JSON does not include endorsed field, but we keep optional
    endorsed?: number;
  }>;
}

export interface Project {
  id: number;
  slug?: string;
  title: string;

  // core fields used across pages
  date?: string;
  status?: "Live" | "In Progress" | "Archived" | string;
  tagline?: string;                    // short summary used on cards
  gradientStart?: string;              // hex or css color
  gradientEnd?: string;                // hex or css color
  techStack?: string[];                // array of strings for tags
  role?: string;
  duration?: string;
  githubUrl?: string;
  liveUrl?: string;
  heroImage?: string;
  screenshots?: string[];
  videoDemo?: string;
  overview?: string;
  problem?: string;
  solution?: string;
  impact?: string;
  architecture?: {
    description?: string;
    diagramUrl?: string;
  };
  databaseSchema?: string;
  apiDocs?: string;
  challenges?: Array<{
    wall?: string;
    fix?: string;
    lesson?: string;
  }>;
  metrics?: {
    users?: number;
    stars?: number;
    forks?: number;
    downloads?: number;
    lighthouseScore?: {
      performance?: number;
      accessibility?: number;
      seo?: number;
    };
    testCoverage?: number;
    cicd?: string;
  };
  stackDeepDive?: {
    frontend?: string;
    backend?: string;
    aiIntegration?: string;
  };
  roadmap?: string[];
  features?: string[];

  // legacy / miscellaneous fields (kept for backwards compatibility)
  description?: string;
  longDescription?: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  images?: string[];
  thumbnail?: string;
  video?: string;
  livePreview?: string;
  link?: string;
  github?: string;
  caseStudy?: string;
  figma?: string;
  documentation?: string;
  playStore?: string;
  appStore?: string;
  type?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  order?: number;
  technologies?: string[];
  teamSize?: number;
  contributions?: string[];
  learnings?: string[];
  highlights?: string[];
  colour?: string;
  isLatest?: boolean;
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

/**
 * Sort items by date in descending order (latest first)
 */
const sortByDateDesc = <T extends { date?: string; startDate?: string; issueDate?: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const dateA = (a.date || a.startDate || a.issueDate) as string;
    const dateB = (b.date || b.startDate || b.issueDate) as string;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
};

/**
 * Data Manager class - provides access to all portfolio data
 */
class DataManager {
  private blogs: Blog[];
  private workExperience: WorkExperience[];
  private certificates: Certificate[];
  private skills: Skill[];
  private projects: Project[];
  private events: Event[];
  private newsletters: Newsletter[];
  private hosting: Hosting[];

  constructor() {
    // Initialize all data, sorted by date (latest first)
    this.blogs = sortByDateDesc(blogsData as Blog[]);
    this.workExperience = sortByDateDesc(workExperienceData as WorkExperience[]);
    this.certificates = sortByDateDesc(certificatesData as any) as Certificate[];
    this.skills = skillsData as any;
    this.projects = sortByDateDesc(projectsData as any);
    this.events = sortByDateDesc(eventsData as Event[]);
    this.newsletters = sortByDateDesc(newslettersData as Newsletter[]);
    this.hosting = sortByDateDesc(hostingData as Hosting[]);
  }

  /**
   * Get all blogs (latest first)
   */
  getBlogs(): Blog[] {
    return this.blogs;
  }

  /**
   * Get featured blogs only
   */
  getFeaturedBlogs(limit?: number): Blog[] {
    const featured = this.blogs.slice(0, limit || this.blogs.length);
    return featured;
  }

  /**
   * Get blog by slug
   */
  getBlogBySlug(slug: string): Blog | undefined {
    return this.blogs.find((blog) => blog.slug === slug);
  }

  /**
   * Get all work experience (latest first)
   */
  getWorkExperience(): WorkExperience[] {
    return this.workExperience;
  }

  /**
   * Get all certificates (latest first)
   */
  getCertificates(): Certificate[] {
    return this.certificates;
  }

  /**
   * Get all skills grouped by category
   */
  getSkills(): Skill[] {
    return this.skills;
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: string): Skill | undefined {
    return this.skills.find((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Get all projects (latest first)
   */
  getProjects(): Project[] {
    return this.projects;
  }

  /**
   * Get project by slug
   */
  getProjectBySlug(slug: string): Project | undefined {
    return this.projects.find((p) => p.slug === slug || p.slug === `/${slug}`);
  }

  /**
   * Get project by id
   */
  getProjectById(id: number): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  /**
   * Get featured projects only
   */
  getFeaturedProjects(limit?: number): Project[] {
    const featured = this.projects.filter((p) => p.featured || p.isLatest);
    return limit ? featured.slice(0, limit) : featured;
  }

  /**
   * Return the most recent projects from the sorted list.
   * Used by homepage to show the 3 newest items regardless of featured flag.
   */
  getRecentProjects(limit?: number): Project[] {
    return limit ? this.projects.slice(0, limit) : this.projects;
  }

  /**
   * Ensure each project defines a unique gradientStart/gradientEnd pair.
   * Emits a console warning if duplicates are found.
   */
  private ensureUniqueGradients(): void {
    const seen = new Set<string>();
    this.projects.forEach((p) => {
      if (p.gradientStart && p.gradientEnd) {
        const key = `${p.gradientStart}-${p.gradientEnd}`;
        if (seen.has(key)) {
          console.warn(`Duplicate gradient for project ${p.slug || p.id}: ${key}`);
        } else {
          seen.add(key);
        }
      }
    });
  }

  /**
   * Get all events (latest first)
   */
  getEvents(): Event[] {
    return this.events;
  }

  /**
   * Get all newsletters (latest first)
   */
  getNewsletters(): Newsletter[] {
    return this.newsletters;
  }

  /**
   * Get newsletters by type
   */
  getNewslettersByType(type: "founder" | "cse"): Newsletter[] {
    return this.newsletters.filter((n) => n.type === type);
  }

  /**
   * Get all hosting info (latest first)
   */
  getHosting(): Hosting[] {
    return this.hosting;
  }

  /**
   * Get hosting by type
   */
  getHostingByType(type: "blog" | "app" | "api"): Hosting[] {
    return this.hosting.filter((h) => h.type === type);
  }

  /**
   * Get active hosting only
   */
  getActiveHosting(): Hosting[] {
    return this.hosting.filter((h) => h.status === "active");
  }

  /**
   * Reload data (useful if you update JSON files)
   */
  reload(): void {
    this.blogs = sortByDateDesc(blogsData as Blog[]);
    this.workExperience = sortByDateDesc(workExperienceData as WorkExperience[]);
    this.certificates = sortByDateDesc(certificatesData as any) as Certificate[];
    this.skills = skillsData as any;
    this.projects = sortByDateDesc(projectsData as any);
    this.events = sortByDateDesc(eventsData as Event[]);
    this.newsletters = sortByDateDesc(newslettersData as Newsletter[]);
    this.hosting = sortByDateDesc(hostingData as Hosting[]);
  }
}

// Export singleton instance
export const dataManager = new DataManager();

// Export default
export default dataManager;
