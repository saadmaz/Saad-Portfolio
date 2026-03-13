-- Portfolio Database Schema
-- Run this script to create all necessary tables

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  date DATE,
  start_date DATE,
  end_date DATE,
  duration VARCHAR(100),
  status VARCHAR(50),
  stage VARCHAR(50),
  version VARCHAR(50),
  image VARCHAR(500),
  images JSONB,
  thumbnail VARCHAR(500),
  video VARCHAR(500),
  live_preview VARCHAR(500),
  link VARCHAR(500),
  github VARCHAR(500),
  case_study VARCHAR(500),
  figma VARCHAR(500),
  documentation VARCHAR(500),
  play_store VARCHAR(500),
  app_store VARCHAR(500),
  type VARCHAR(50),
  category VARCHAR(50),
  tags JSONB,
  featured BOOLEAN DEFAULT FALSE,
  order_index INTEGER,
  technologies JSONB,
  tech_stack JSONB,
  metrics JSONB,
  role VARCHAR(255),
  team_size INTEGER,
  contributions JSONB,
  challenges JSONB,
  learnings JSONB,
  highlights JSONB,
  colour VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT,
  date DATE,
  category VARCHAR(100),
  read_time VARCHAR(50),
  author VARCHAR(255),
  is_latest BOOLEAN DEFAULT FALSE,
  tags JSONB,
  cover_image VARCHAR(500),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Work experience table
CREATE TABLE IF NOT EXISTS work_experience (
  id SERIAL PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  description TEXT,
  technologies JSONB,
  achievements JSONB,
  is_latest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  skills JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  platform VARCHAR(255),
  issuer_logo VARCHAR(500),
  issue_date DATE,
  expiry_date DATE,
  does_not_expire BOOLEAN DEFAULT FALSE,
  credential_id VARCHAR(255),
  credential_url VARCHAR(500),
  description TEXT,
  skills JSONB,
  category VARCHAR(100),
  type VARCHAR(50),
  tags JSONB,
  pdf_document_link VARCHAR(500),
  is_verifiable BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users table (for admin panel)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);