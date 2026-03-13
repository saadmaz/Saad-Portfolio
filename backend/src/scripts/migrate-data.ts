import { ProjectModel } from '../models/Project.js';
import { BlogPostModel } from '../models/BlogPost.js';

// Import existing data (you'll need to copy these from the frontend)
const projectsData = [
  {
    "slug": "portfolio-website",
    "title": "Portfolio Website",
    "description": "A modern, responsive portfolio website built with React and TypeScript",
    "long_description": "This is my personal portfolio site, showcasing my projects, blog posts, and professional background. Built from scratch with a focus on performance and design.",
    "date": "2025-06",
    "start_date": "2025-01",
    "end_date": "2025-06",
    "duration": "6 months",
    "status": "Live",
    "stage": "production",
    "version": "2.3.0",
    "image": "/assets/projects/portfolio.jpg",
    "images": ["/assets/projects/portfolio-1.jpg", "/assets/projects/portfolio-2.jpg"],
    "thumbnail": "/assets/projects/portfolio-thumb.jpg",
    "video": "",
    "live_preview": "",
    "link": "https://saadmalik.dev",
    "github": "https://github.com/saadmalik/portfolio",
    "case_study": "",
    "figma": "",
    "documentation": "",
    "play_store": "",
    "app_store": "",
    "type": "web",
    "category": "personal",
    "tags": ["portfolio", "react", "typescript"],
    "featured": true,
    "order_index": 1,
    "technologies": ["React", "TypeScript", "Tailwind CSS", "Vite"],
    "tech_stack": {
      "frontend": ["React", "Tailwind CSS"],
      "backend": [],
      "database": [],
      "devops": ["Vercel"],
      "tools": ["Git", "ESLint"]
    },
    "metrics": { "users": 0, "stars": 0, "forks": 0, "downloads": 0 },
    "role": "Solo Developer",
    "team_size": 1,
    "contributions": ["Design", "Development", "Deployment"],
    "challenges": ["Responsive design", "Optimizing for performance"],
    "learnings": ["Advanced Tailwind techniques", "Static site generation"],
    "highlights": ["Perfect Lighthouse score", "Fast load times"],
    "colour": "from-blue-700/20 to-slate-800/20"
  },
  // Add more projects here...
];

const blogPostsData = [
  {
    "slug": "building-ai-first-products",
    "title": "Building AI-First Products",
    "excerpt": "How to build products with AI at their core",
    "date": "2026-01-03",
    "category": "AI",
    "read_time": "8 min read",
    "author": "Saad Malik",
    "is_latest": true,
    "tags": ["AI", "Product Development"],
    "cover_image": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    "published": true
  },
  {
    "slug": "startup-funding-sri-lanka",
    "title": "Startup Funding in Sri Lanka",
    "excerpt": "A guide to startup funding ecosystem in Sri Lanka",
    "date": "2026-01-01",
    "category": "Startups",
    "read_time": "6 min read",
    "author": "Saad Malik",
    "is_latest": false,
    "tags": ["Startups", "Entrepreneurship", "Sri Lanka"],
    "cover_image": "https://images.unsplash.com/photo-1522071823991-b99c223a7d94?w=800",
    "published": true
  },
  // Add more blog posts here...
];

async function migrateData() {
  console.log('🚀 Starting Firebase data migration...');

  try {
    // Migrate projects
    console.log('📁 Migrating projects...');
    for (const project of projectsData) {
      await ProjectModel.create(project);
      console.log(`✅ Migrated project: ${project.title}`);
    }

    // Migrate blog posts
    console.log('📝 Migrating blog posts...');
    for (const blogPost of blogPostsData) {
      await BlogPostModel.create(blogPost);
      console.log(`✅ Migrated blog post: ${blogPost.title}`);
    }

    console.log('🎉 Firebase data migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
    "colour": "from-blue-700/20 to-slate-800/20"
  },
  // Add more projects here...
];

const blogPostsData = [
  {
    "id": "building-ai-first-products",
    "title": "Building AI-First Products",
    "excerpt": "How to build products with AI at their core",
    "date": "2026-01-03",
    "category": "AI",
    "readTime": "8 min read",
    "slug": "building-ai-first-products",
    "author": "Saad Malik",
    "isLatest": true
  },
  {
    "id": "startup-funding-sri-lanka",
    "title": "Startup Funding in Sri Lanka",
    "excerpt": "A guide to startup funding ecosystem in Sri Lanka",
    "date": "2026-01-01",
    "category": "Startups",
    "readTime": "6 min read",
    "slug": "startup-funding-sri-lanka",
    "author": "Saad Malik",
    "isLatest": false
  },
  // Add more blog posts here...
];

async function migrateData() {
  console.log('🚀 Starting data migration...');

  try {
    // Migrate projects
    console.log('📁 Migrating projects...');
    for (const project of projectsData) {
      const { id, ...projectData } = project;
      await ProjectModel.create({
        ...projectData,
        order_index: project.order,
        published: true
      });
      console.log(`✅ Migrated project: ${project.title}`);
    }

    // Migrate blog posts
    console.log('📝 Migrating blog posts...');
    for (const blogPost of blogPostsData) {
      const { id, ...blogData } = blogPost;
      await BlogPostModel.create({
        ...blogData,
        published: true
      });
      console.log(`✅ Migrated blog post: ${blogPost.title}`);
    }

    console.log('🎉 Data migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();