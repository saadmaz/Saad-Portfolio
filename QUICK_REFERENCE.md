# Portfolio Data Structure - Quick Reference

## File Locations

```
src/data/
├── blogs.json              # Blog posts
├── workExperience.json     # Work jobs
├── certificates.json       # Certifications
├── skills.json            # Skills by category
├── projects.json          # Portfolio projects
├── events.json            # Events & conferences
├── newsletters.json       # Newsletter issues
└── hosting.json           # Hosted services
```

## Imports & Hooks

```typescript
// Import all hooks
import {
  useBlogs,
  useFeaturedBlogs,
  useWorkExperience,
  useCertificates,
  useSkills,
  useProjects,
  useFeaturedProjects,
  useEvents,
  useNewsletters,
  useNewslettersByType,
  useHosting,
  useActiveHosting,
} from "@/hooks/usePortfolioData";

// Or use data manager directly
import { dataManager } from "@/lib/dataManager";
```

## Quick Usage Examples

### Get Latest Blogs
```typescript
const { blogs, loading } = useBlogs();
// Latest first
```

### Get Featured Projects (limit 3)
```typescript
const { projects, loading } = useFeaturedProjects(3);
```

### Get Work Experience
```typescript
const { experience, loading } = useWorkExperience();
// Latest job first
```

### Get Skills by Category
```typescript
const { skills, loading } = useSkills();
// skills[0].skills = [{ name, level, years, endorsed }]
```

### Get Founder Newsletters Only
```typescript
const { newsletters, loading } = useNewslettersByType("founder");
// Latest newsletter first
```

### Get CSE Newsletters Only
```typescript
const { newsletters, loading } = useNewslettersByType("cse");
```

### Get Active Hosting Only
```typescript
const { hosting, loading } = useActiveHosting();
```

### Get Certificates
```typescript
const { certificates, loading } = useCertificates();
// Latest certificate first
```

### Get Events
```typescript
const { events, loading } = useEvents();
// Latest event first
```

## Date Format

Use ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM`

```json
{
  "date": "2026-01-31"      // Full date
  "date": "2026-01"         // Month only
  "date": "2026"            // Year only
}
```

## Adding New Data

### To add a new blog:
1. Open `src/data/blogs.json`
2. Add to array: `{ id, title, excerpt, date, category, readTime, slug, author }`
3. Save
4. All `useBlogs()` components update automatically

### To add a project:
1. Open `src/data/projects.json`
2. Add to array: `{ id, title, description, date, image, technologies, link, github, featured }`
3. Save
4. All `useProjects()` components update automatically

### To add work experience:
1. Open `src/data/workExperience.json`
2. Add to array: `{ id, company, position, startDate, endDate, location, description, technologies, achievements }`
3. Save
4. All `useWorkExperience()` components update automatically

### To add an event:
1. Open `src/data/events.json`
2. Add to array: `{ id, title, date, type, location, description, image, link, achievement? }`
3. Save
4. All `useEvents()` components update automatically

### To add a newsletter:
1. Open `src/data/newsletters.json`
2. Add to array: `{ id, type, title, date, issue, description, link, subscribers }`
3. Type must be: `"founder"` or `"cse"`
4. Save
5. All `useNewsletters()` and `useNewslettersByType()` components update automatically

### To add a certificate:
1. Open `src/data/certificates.json`
2. Add to array: `{ id, title, issuer, issueDate, expiryDate?, credentialId, credentialUrl, description }`
3. Save
4. All `useCertificates()` components update automatically

### To add a skill:
1. Open `src/data/skills.json`
2. Add to category: `{ name, level, years, endorsed }`
3. Save
4. All `useSkills()` components update automatically

### To add hosting info:
1. Open `src/data/hosting.json`
2. Add to array: `{ id, type, title, url, platform, deployDate, status, description, technologies }`
3. Type must be: `"blog"`, `"app"`, or `"api"`
4. Save
5. All `useHosting()` and `useActiveHosting()` components update automatically

## Data Sorting

✅ **All data is automatically sorted by date (latest first)**

- Blogs: latest first
- Work Experience: latest first
- Certificates: latest first
- Projects: latest first
- Events: latest first
- Newsletters: latest first
- Hosting: latest first
- Skills: grouped by category (no date sorting)

## Type Definitions

All types are exported from `@/lib/dataManager`:

```typescript
import type {
  Blog,
  WorkExperience,
  Certificate,
  Skill,
  Project,
  Event,
  Newsletter,
  Hosting,
} from "@/lib/dataManager";
```

## Useful Methods

```typescript
import { dataManager } from "@/lib/dataManager";

// Get everything
dataManager.getBlogs();
dataManager.getWorkExperience();
dataManager.getCertificates();
dataManager.getSkills();
dataManager.getProjects();
dataManager.getEvents();
dataManager.getNewsletters();
dataManager.getHosting();

// Get filtered
dataManager.getFeaturedBlogs(limit);
dataManager.getFeaturedProjects(limit);
dataManager.getNewslettersByType("founder" | "cse");
dataManager.getHostingByType("blog" | "app" | "api");
dataManager.getActiveHosting();

// Other
dataManager.getBlogBySlug("slug");
dataManager.getSkillsByCategory("Frontend");
```

## File Structure Example

### blogs.json
```json
[
  {
    "id": "blog-id",
    "title": "Title",
    "excerpt": "Excerpt",
    "date": "2026-01-31",
    "category": "Category",
    "readTime": "5 min read",
    "slug": "blog-slug",
    "author": "Author"
  }
]
```

### workExperience.json
```json
[
  {
    "id": 1,
    "company": "Company",
    "position": "Position",
    "startDate": "2024-01",
    "endDate": "Present",
    "location": "City, Country",
    "description": "Description",
    "technologies": ["Tech1", "Tech2"],
    "achievements": ["Achievement1"]
  }
]
```

### projects.json
```json
[
  {
    "id": 1,
    "title": "Title",
    "description": "Description",
    "date": "2026-01-31",
    "image": "/path/to/image.jpg",
    "technologies": ["Tech1"],
    "link": "https://project.com",
    "github": "https://github.com/user/repo",
    "featured": true
  }
]
```

### events.json
```json
[
  {
    "id": 1,
    "title": "Title",
    "date": "2026-01-31",
    "type": "Speaking",
    "location": "City",
    "description": "Description",
    "image": "/path/to/image.jpg",
    "link": "https://event.com",
    "achievement": "Award (optional)"
  }
]
```

### newsletters.json
```json
[
  {
    "id": 1,
    "type": "founder",
    "title": "Title",
    "date": "2026-01-31",
    "issue": 1,
    "description": "Description",
    "link": "https://newsletter.com/1",
    "subscribers": 1000
  }
]
```

### skills.json
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

### certificates.json
```json
[
  {
    "id": 1,
    "title": "Title",
    "issuer": "Issuer",
    "issueDate": "2026-01",
    "expiryDate": "2028-01",
    "credentialId": "ID",
    "credentialUrl": "https://verify.com",
    "description": "Description"
  }
]
```

### hosting.json
```json
[
  {
    "id": 1,
    "type": "app",
    "title": "Title",
    "url": "https://service.com",
    "platform": "Vercel",
    "deployDate": "2026-01-31",
    "status": "active",
    "description": "Description",
    "technologies": ["Tech1"]
  }
]
```

## Tips & Tricks

- **Always use ISO date format**: `YYYY-MM-DD`
- **Latest always first**: All date-based data automatically sorts newest first
- **Keep JSON valid**: Use online validator if unsure
- **Test after editing**: Check browser console for errors
- **Use TypeScript**: Get autocomplete and type checking
- **Reload page**: Sometimes needed to see new data

---

📖 For detailed guide, see [DATA_STRUCTURE_GUIDE.md](DATA_STRUCTURE_GUIDE.md)
📂 Example components: [src/components/examples/DataStructureExamples.tsx](src/components/examples/DataStructureExamples.tsx)
