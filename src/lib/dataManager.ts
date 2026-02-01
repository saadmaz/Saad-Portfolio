/**
 * Data Manager - Centralized data loading and management
 * Automatically loads data from JSON files and sorts by date (latest first)
 */

import blogsData from "@/data/blogs.json";
import workExperienceData from "@/data/workExperience.json";
import certificatesData from "@/data/certificates.json";
import skillsData from "@/data/skills.json";
import projectsData from "@/data/projects.json";
import eventsData from "@/data/events.json";
import newslettersData from "@/data/newsletters.json";
import hostingData from "@/data/hosting.json";

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
}

export interface WorkExperience {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  technologies: string[];
  achievements: string[];
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId: string;
  credentialUrl: string;
  description: string;
}

export interface Skill {
  category: string;
  skills: Array<{
    name: string;
    level: number;
    years: number;
    endorsed: number;
  }>;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string;
  technologies: string[];
  link: string;
  github: string;
  featured: boolean;
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
}

/**
 * Sort items by date in descending order (latest first)
 */
const sortByDateDesc = <T extends { date: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    this.certificates = sortByDateDesc(certificatesData as Certificate[]);
    this.skills = skillsData as Skill[];
    this.projects = sortByDateDesc(projectsData as Project[]);
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
   * Get featured projects only
   */
  getFeaturedProjects(limit?: number): Project[] {
    const featured = this.projects.filter((p) => p.featured);
    return limit ? featured.slice(0, limit) : featured;
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
    this.certificates = sortByDateDesc(certificatesData as Certificate[]);
    this.skills = skillsData as Skill[];
    this.projects = sortByDateDesc(projectsData as Project[]);
    this.events = sortByDateDesc(eventsData as Event[]);
    this.newsletters = sortByDateDesc(newslettersData as Newsletter[]);
    this.hosting = sortByDateDesc(hostingData as Hosting[]);
  }
}

// Export singleton instance
export const dataManager = new DataManager();

// Export default
export default dataManager;
