/**
 * Data Manager - Centralized data loading and management
 * Automatically loads data from JSON files and sorts by date (latest first)
 */

// DataManager now fetches from backend API endpoints
// Remove static imports

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

  // --- CORE FIELDS ---
  date?: string;
  status?: "Live" | "In Progress" | "Archived" | string;
  tagline?: string;           
  gradientStart?: string;     
  gradientEnd?: string;       
  techStack?: string[];       
  role?: string;
  duration?: string;
  githubUrl?: string;
  liveUrl?: string;
  // NEW: Added to fix the property error
  pdfReport?: string;         
  heroImage?: string;
  screenshots?: string[];
  videoDemo?: string;
  overview?: string;
  problem?: string;
  solution?: string;
  impact?: string;

  // --- TECHNICAL DETAILS ---
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
  
  // --- QUANTITATIVE DATA ---
  metrics?: {
    users?: number;
    stars?: number;
    forks?: number;
    downloads?: number;
    // Updated to handle both 3 and 4 metric scenarios
    lighthouseScore?: {
      performance?: number;
      accessibility?: number;
      seo?: number;
      bestPractices?: number;
    };
    testCoverage?: number;
    cicd?: string;
  };

  // --- DEEP DIVE & PLANNING ---
  stackDeepDive?: {
    frontend?: string;
    backend?: string;
    aiIntegration?: string;
  };
  roadmap?: string[];
  features?: string[];
  colour?: string; // Used for the dynamic card background

  // --- LEGACY / COMPATIBILITY FIELDS ---
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
  // No constructor needed; all methods fetch from API

  /**
   * Get all blogs (latest first)
   */
  async getBlogs(): Promise<Blog[]> {
    const res = await fetch("http://localhost:3001/api/blog-posts");
    return await res.json();
  }

  /**
   * Get featured blogs only
   */
  async getFeaturedBlogs(limit?: number): Promise<Blog[]> {
    const blogs = await this.getBlogs();
    return blogs.slice(0, limit || blogs.length);
  }

  /**
   * Get blog by slug
   */
  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const blogs = await this.getBlogs();
    return blogs.find((blog) => blog.slug === slug);
  }

  /**
   * Get all work experience (latest first)
   */
  async getWorkExperience(): Promise<WorkExperience[]> {
    const res = await fetch("http://localhost:3001/api/work-experience");
    return await res.json();
  }

  /**
   * Get all certificates (latest first)
   */
  async getCertificates(): Promise<Certificate[]> {
    const res = await fetch("http://localhost:3001/api/certificates");
    return await res.json();
  }

  /**
   * Get all skills grouped by category
   */
  async getSkills(): Promise<Skill[]> {
    const res = await fetch("http://localhost:3001/api/skills");
    return await res.json();
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
  async getProjects(): Promise<Project[]> {
    const res = await fetch("http://localhost:3001/api/projects");
    return await res.json();
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
  async getEvents(): Promise<Event[]> {
    const res = await fetch("http://localhost:3001/api/events");
    return await res.json();
  }

  /**
   * Get all newsletters (latest first)
   */
  async getNewsletters(): Promise<Newsletter[]> {
    const res = await fetch("http://localhost:3001/api/newsletters");
    return await res.json();
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
  async getHosting(): Promise<Hosting[]> {
    const res = await fetch("http://localhost:3001/api/hosting");
    return await res.json();
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
