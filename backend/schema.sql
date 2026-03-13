-- Firebase Firestore Collections Setup
-- This file contains information about Firestore collections and their structure
-- Firestore is a NoSQL database, so no schema creation is needed

-- COLLECTIONS OVERVIEW:
-- ====================

-- 1. projects
-- Document structure for project data
{
  slug: string (unique identifier)
  title: string
  description: string
  long_description?: string
  date?: string
  start_date?: string
  end_date?: string
  duration?: string
  status: string
  stage: string
  version?: string
  image?: string
  images?: string[]
  thumbnail?: string
  video?: string
  live_preview?: string
  link?: string
  github?: string
  case_study?: string
  figma?: string
  documentation?: string
  play_store?: string
  app_store?: string
  type: string
  category: string
  tags?: string[]
  featured: boolean
  order_index?: number
  technologies?: string[]
  tech_stack?: object
  metrics?: object
  role?: string
  team_size?: number
  contributions?: string[]
  challenges?: string[]
  learnings?: string[]
  highlights?: string[]
  colour?: string
  created_at: timestamp
  updated_at: timestamp
}

-- 2. blog_posts
-- Document structure for blog post data
{
  slug: string (unique identifier)
  title: string
  excerpt: string
  content: string
  date: string
  category: string
  read_time: string
  author: string
  is_latest: boolean
  tags?: string[]
  cover_image?: string
  published: boolean
  created_at: timestamp
  updated_at: timestamp
}

-- 3. work_experience
-- Document structure for work experience data
{
  company: string
  position: string
  start_date: string
  end_date?: string
  location: string
  description: string
  technologies?: string[]
  achievements?: string[]
  is_latest: boolean
  created_at: timestamp
  updated_at: timestamp
}

-- 4. skills
-- Document structure for skills data
{
  category: string
  skills: array of objects [
    {
      name: string
      level: string
      years: number
    }
  ]
  created_at: timestamp
  updated_at: timestamp
}

-- 5. certificates
-- Document structure for certificate data
{
  title: string
  issuer: string
  platform?: string
  issuer_logo?: string
  issue_date: string
  expiry_date?: string
  does_not_expire: boolean
  credential_id?: string
  credential_url?: string
  description: string
  skills?: string[]
  category: string
  type: string
  tags?: string[]
  pdf_document_link?: string
  is_verifiable: boolean
  is_featured: boolean
  created_at: timestamp
  updated_at: timestamp
}

-- 6. contact_messages
-- Document structure for contact form submissions
{
  name: string
  email: string
  subject?: string
  message: string
  ip_address?: string
  user_agent?: string
  sent: boolean
  created_at: timestamp
}

-- 7. users (for admin panel)
-- Document structure for admin users
{
  email: string (unique)
  password_hash: string
  role: string
  created_at: timestamp
}

-- FIRESTORE INDEXES NEEDED:
-- ========================
-- projects: order_index (ascending), created_at (descending)
-- projects: featured (ascending), order_index (ascending)
-- blog_posts: published (ascending), date (descending)
-- blog_posts: is_latest (ascending), published (ascending), date (descending)
-- contact_messages: created_at (descending)

-- These indexes will be created automatically by Firestore when queries are executed,
-- or you can create them manually in the Firebase Console for better performance.