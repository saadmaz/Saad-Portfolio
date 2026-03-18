// Database Types
export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  status: string;
  stage: string;
  version?: string;
  image?: string;
  images?: string[];
  thumbnail?: string;
  video?: string;
  live_preview?: string;
  link?: string;
  github?: string;
  case_study?: string;
  figma?: string;
  documentation?: string;
  play_store?: string;
  app_store?: string;
  type: string;
  category: string;
  tags?: string[];
  featured: boolean;
  order_index?: number;
  technologies?: string[];
  tech_stack?: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    devops?: string[];
    tools?: string[];
  };
  metrics?: {
    users?: number;
    stars?: number;
    forks?: number;
    downloads?: number;
  };
  role?: string;
  team_size?: number;
  contributions?: string[];
  challenges?: string[];
  learnings?: string[];
  highlights?: string[];
  colour?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  read_time: string;
  author: string;
  is_latest: boolean;
  tags?: string[];
  cover_image?: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  location: string;
  description: string;
  technologies?: string[];
  achievements?: string[];
  is_latest: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Skill {
  id: string;
  category: string;
  skills: Array<{
    name: string;
    level: string;
    years: number;
  }>;
  created_at: Date;
  updated_at: Date;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  platform?: string;
  issuer_logo?: string;
  issue_date: string;
  expiry_date?: string;
  does_not_expire: boolean;
  credential_id?: string;
  credential_url?: string;
  description: string;
  skills?: string[];
  category: string;
  type: string;
  tags?: string[];
  pdf_document_link?: string;
  is_verifiable: boolean;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  ip_address?: string;
  user_agent?: string;
  sent: boolean;
  created_at?: Date;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  location: string;
  description: string;
  image?: string;
  link?: string;
  achievement?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Newsletter {
  id: string;
  type: 'founder' | 'cse';
  title: string;
  date: string;
  issue: number;
  description: string;
  link: string;
  subscribers: number;
  is_latest?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Hosting {
  id: string;
  type: 'blog' | 'app' | 'api';
  title: string;
  url: string;
  platform: string;
  deploy_date: string;
  status: string;
  description: string;
  technologies: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  image?: string;
  link?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Hackathon {
  id: string;
  name: string;
  date: string;
  role: string;
  description: string;
  project_name?: string;
  project_link?: string;
  achievement?: string;
  technologies?: string[];
  image?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  avatar?: string;
  link?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  start_date: string;
  end_date?: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  grade?: string;
  description?: string;
  activities?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entity_type: string;
  entity_id?: string;
  details: string;
  timestamp: Date;
}


// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Request Types
export interface CreateContactMessageRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}