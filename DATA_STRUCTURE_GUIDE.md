# Portfolio Data Structure Guide

This document explains how the portfolio data is organized and how to use it.

## Overview

The portfolio application uses a **modular, JSON-based data structure** that automatically updates components when data is modified. Each section (blogs, work experience, skills, etc.) has its own JSON file in the `src/data/` directory.

## Data Files Location

All data files are located in `src/data/`:

```
src/data/
├── blogs.json              # Blog posts
├── workExperience.json     # Work experience/jobs
├── certificates.json       # Certifications and credentials
├── skills.json            # Skills grouped by category
├── projects.json          # Portfolio projects
├── events.json            # Events and conferences
├── newsletters.json       # Newsletter issues (founder & cse)
├── hosting.json           # Hosted applications and services
├── about.ts              # About section data
└── education.ts          # Education data
```

## Data Files Format

### 1. **Blogs** (`blogs.json`)

```json
[
  {
    "id": "unique-id",
    "title": "Blog Title",
    "excerpt": "Short description",
    "date": "2026-01-03",
    "category": "Technology",
    "readTime": "5 min read",
    "slug": "blog-slug",
    "author": "Author Name"
  }
]
```

**Usage:**
```typescript
import { useBlogs } from "@/hooks/usePortfolioData";

function BlogList() {
  const { blogs, loading } = useBlogs();
  // Latest blogs appear first (sorted by date descending)
}
```

### 2. **Work Experience** (`workExperience.json`)

```json
[
  {
    "id": 1,
    "company": "Company Name",
    "position": "Job Title",
    "startDate": "2024-01",
    "endDate": "Present",
    "location": "City, Country",
    "description": "Job description",
    "technologies": ["React", "Node.js"],
    "achievements": ["Achievement 1", "Achievement 2"]
  }
]
```

**Usage:**
```typescript
import { useWorkExperience } from "@/hooks/usePortfolioData";

function Experience() {
  const { experience, loading } = useWorkExperience();
  // Latest experience appears first
}
```

### 3. **Certificates** (`certificates.json`)

```json
[
  {
    "id": 1,
    "title": "Certification Title",
    "issuer": "Issuing Organization",
    "issueDate": "2025-08",
    "expiryDate": "2028-08",
    "credentialId": "CERT-12345",
    "credentialUrl": "https://verify.com",
    "description": "Description"
  }
]
```

**Usage:**
```typescript
import { useCertificates } from "@/hooks/usePortfolioData";

function Certificates() {
  const { certificates, loading } = useCertificates();
  // Latest certificates appear first
}
```

### 4. **Skills** (`skills.json`)

```json
[
  {
    "category": "Frontend",
    "skills": [
      {
        "name": "React",
        "level": 5,
        "years": 3,
        "endorsed": 45
      }
    ]
  }
]
```

**Usage:**
```typescript
import { useSkills } from "@/hooks/usePortfolioData";

function Skills() {
  const { skills, loading } = useSkills();
  // Skills organized by category
}
```

### 5. **Projects** (`projects.json`)

```json
[
  {
    "id": 1,
    "title": "Project Title",
    "description": "Project description",
    "date": "2025-06",
    "image": "/assets/projects/image.jpg",
    "technologies": ["React", "Node.js"],
    "link": "https://project.com",
    "github": "https://github.com/user/project",
    "featured": true
  }
]
```

**Usage:**
```typescript
import { useProjects, useFeaturedProjects } from "@/hooks/usePortfolioData";

function Projects() {
  const { projects, loading } = useProjects();
  // All projects, latest first
  
  // OR for featured projects only:
  const { projects: featured } = useFeaturedProjects(3);
}
```

### 6. **Events** (`events.json`)

```json
[
  {
    "id": 1,
    "title": "Event Title",
    "date": "2026-02-15",
    "type": "Speaking",
    "location": "City, Country",
    "description": "Event description",
    "image": "/assets/events/event.jpg",
    "link": "https://event.com",
    "achievement": "Award/Achievement (optional)"
  }
]
```

**Usage:**
```typescript
import { useEvents } from "@/hooks/usePortfolioData";

function Events() {
  const { events, loading } = useEvents();
  // Latest events appear first
}
```

### 7. **Newsletters** (`newsletters.json`)

```json
[
  {
    "id": 1,
    "type": "founder",
    "title": "Newsletter Issue Title",
    "date": "2026-01-30",
    "issue": 45,
    "description": "Issue description",
    "link": "https://newsletter.com/45",
    "subscribers": 2500
  }
]
```

**Types:** `"founder"` or `"cse"`

**Usage:**
```typescript
import { useNewsletters, useNewslettersByType } from "@/hooks/usePortfolioData";

function Newsletters() {
  const { newsletters, loading } = useNewsletters();
  // All newsletters, latest first
  
  // OR for specific type:
  const { newsletters: founderNews } = useNewslettersByType("founder");
  const { newsletters: cseNews } = useNewslettersByType("cse");
}
```

### 8. **Hosting** (`hosting.json`)

```json
[
  {
    "id": 1,
    "type": "blog",
    "title": "Service Title",
    "url": "https://service.com",
    "platform": "Vercel",
    "deployDate": "2025-06-15",
    "status": "active",
    "description": "Service description",
    "technologies": ["Next.js", "Vercel"]
  }
]
```

**Types:** `"blog"`, `"app"`, or `"api"`

**Usage:**
```typescript
import { useHosting, useActiveHosting } from "@/hooks/usePortfolioData";

function Hosting() {
  const { hosting, loading } = useHosting();
  // All hosted services, latest first
  
  // OR for active services only:
  const { hosting: active } = useActiveHosting();
}
```

## Data Manager

The `DataManager` class in `src/lib/dataManager.ts` handles all data loading and sorting:

```typescript
import { dataManager } from "@/lib/dataManager";

// Direct access to data
const blogs = dataManager.getBlogs();
const experience = dataManager.getWorkExperience();
const skills = dataManager.getSkills();
const founderNews = dataManager.getNewslettersByType("founder");

// All methods automatically sort by date (latest first)
// For blogs, projects: latest first
// For skills: grouped by category
```

## Key Features

### 1. **Automatic Sorting**
- All date-based data is automatically sorted with **latest first**
- Implemented via the `sortByDateDesc` function in `dataManager.ts`

### 2. **Type Safety**
- Full TypeScript support with exported interfaces
- All data is strongly typed

### 3. **Easy Updates**
- Simply edit the JSON files
- Components automatically reflect changes through hooks
- No need to update component code

### 4. **Reusable Hooks**
- Use provided hooks for consistent data access
- All hooks follow the same pattern: `{ data, loading }`

## How to Add Data

### Example: Adding a New Blog Post

1. Open `src/data/blogs.json`
2. Add a new object to the array:
```json
{
  "id": "new-blog-id",
  "title": "My New Blog Post",
  "excerpt": "Brief description",
  "date": "2026-02-01",
  "category": "React",
  "readTime": "7 min read",
  "slug": "my-new-blog-post",
  "author": "Your Name"
}
```
3. Save the file
4. All components using `useBlogs()` automatically get updated
5. The new post appears first in the list (latest first)

### Example: Adding a New Project

1. Open `src/data/projects.json`
2. Add a new object:
```json
{
  "id": 6,
  "title": "Amazing New Project",
  "description": "Description of the project",
  "date": "2026-02-01",
  "image": "/assets/projects/new-project.jpg",
  "technologies": ["React", "TypeScript"],
  "link": "https://project.com",
  "github": "https://github.com/user/project",
  "featured": true
}
```
3. Save the file
4. Components automatically update
5. Latest projects appear first

## File Date Format

Use the following date formats in JSON files:

- **Dates with full precision:** `"2026-02-01"` (YYYY-MM-DD)
- **Dates with month only:** `"2025-06"` (YYYY-MM)
- **Dates with year only:** `"2024"` (YYYY)

## Important Notes

⚠️ **JSON Format Rules:**
- Use double quotes for all strings
- No trailing commas
- Ensure all dates are valid
- Use ISO 8601 format for dates (YYYY-MM-DD)

✅ **Best Practices:**
- Add latest entries first in the JSON (they'll be re-sorted anyway)
- Keep descriptions concise
- Use consistent formatting
- Test dates are valid before saving

## Migration from Old Structure

If you're migrating from the old data structure:

1. ✅ Blogs are in `blogs.json`
2. ✅ Work experience is in `workExperience.json`
3. ✅ Skills are in `skills.json` (by category)
4. ✅ Projects are in `projects.json`
5. ✅ Certificates are in `certificates.json`
6. ✅ Events are in `events.json`
7. ✅ Newsletters are in `newsletters.json` (split into founder/cse)
8. ✅ Hosting is in `hosting.json`

## Troubleshooting

**Data not updating?**
- Clear browser cache
- Check JSON syntax is valid (use online JSON validator)
- Ensure dates are in correct format
- Restart dev server

**Wrong sort order?**
- Verify dates are in ISO 8601 format (YYYY-MM-DD)
- Check for typos in date strings

**Type errors?**
- Ensure all required fields are present
- Check field names match exactly (case-sensitive)
- Verify types match the interfaces in `dataManager.ts`

## Next Steps

- Update your components to use the new hooks
- Migrate old data to new JSON files
- Remove old data imports
- Test all sections
