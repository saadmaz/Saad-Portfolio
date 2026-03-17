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

import { apiClient } from "../../services/api-client";

/**
 * Data Manager class - provides access to all portfolio data
 */
export class DataManager {
  /**
   * Get all blogs (latest first)
   */
  async getBlogs(): Promise<Blog[]> {
    return await apiClient.get("/blog-posts");
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
    return await apiClient.get("/work-experience");
  }

  /**
   * Get all certificates (latest first)
   */
  async getCertificates(): Promise<Certificate[]> {
    return await apiClient.get("/certificates");
  }

  /**
   * Get all skills grouped by category
   */
  async getSkills(): Promise<Skill[]> {
    return await apiClient.get("/skills");
  }

  /**
   * Get all projects (latest first)
   */
  async getProjects(): Promise<Project[]> {
    const res = await fetch("http://localhost:3001/api/projects");
    return await res.json();
  }

  /**
   * Get all newsletters (latest first)
   */
  async getNewsletters(): Promise<Newsletter[]> {
    return await apiClient.get("/newsletters");
  }

  /**
   * Get all events (latest first)
   */
  async getEvents(): Promise<Event[]> {
    return await apiClient.get("/events");
  }

  /**
   * Get project by slug
   */
  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    const projects = await this.getProjects();
    return projects.find((p) => p.slug === slug || p.slug === `/${slug}`);
  }

  /**
   * Get project by id
   */
  async getProjectById(id: number): Promise<Project | undefined> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id);
  }

  /**
   * Get featured projects only
   */
  async getFeaturedProjects(limit?: number): Promise<Project[]> {
    const projects = await this.getProjects();
    const featured = projects.filter((p) => p.featured || p.isLatest);
    return limit ? featured.slice(0, limit) : featured;
  }

  /**
   * Return the most recent projects from the sorted list.
   * Used by homepage to show the 3 newest items regardless of featured flag.
   */
  async getRecentProjects(limit?: number): Promise<Project[]> {
    const projects = await this.getProjects();
    return limit ? projects.slice(0, limit) : projects;
  }

  /**
   * Get newsletters by type
   */
  async getNewslettersByType(type: "founder" | "cse"): Promise<Newsletter[]> {
    const newsletters = await this.getNewsletters();
    return newsletters.filter((n) => n.type === type);
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
  async getHostingByType(type: "blog" | "app" | "api"): Promise<Hosting[]> {
    const hosting = await this.getHosting();
    return hosting.filter((h) => h.type === type);
  }

  /**
   * Get active hosting only
   */
  async getActiveHosting(): Promise<Hosting[]> {
    const hosting = await this.getHosting();
    return hosting.filter((h) => h.status === "active");
  }
}

// Export singleton instance
export const dataManager = new DataManager();

// Export default
export default dataManager;
