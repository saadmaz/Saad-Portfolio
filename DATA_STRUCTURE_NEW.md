# Data Structure Guide 📊

This guide explains the organized data structure for the portfolio project.

## Overview

All data files are centrally located in `src/data/` with a clear organizational structure:

```
src/data/
├── content/          # Portfolio work & projects
│   ├── projects.json
│   ├── blogs.json
│   ├── events.json
│   ├── newsletters.json
│   └── hosting.json
├── personal/         # Personal information
│   ├── about.ts
│   ├── education.ts
│   ├── skills.json
│   ├── workExperience.json
│   └── certificates.json
└── index.ts          # Central export file
```

## 📁 Folder Breakdown

### `content/` - Portfolio Projects & Content

This folder contains all public-facing portfolio content.

#### **projects.json**
Projects you've built and want to showcase.

```json
{
  "id": 1,
  "title": "Project Name",
  "description": "Brief description",
  "date": "2025-06",
  "image": "/assets/projects/image.jpg",
  "technologies": ["React", "TypeScript"],
  "link": "https://project.com",
  "github": "https://github.com/user/project",
  "featured": true
}
```

**How to add a new project:**
1. Open `src/data/content/projects.json`
2. Add a new object to the array with the structure above
3. Increment the `id`
4. Save the file

#### **blogs.json**
Blog posts and articles you've written.

```json
{
  "id": "slug-name",
  "title": "Blog Title",
  "excerpt": "Short description",
  "date": "2026-01-03",
  "category": "AI",
  "readTime": "8 min read",
  "slug": "slug-name",
  "author": "Your Name"
}
```

**How to add a new blog:**
1. Open `src/data/content/blogs.json`
2. Add the blog metadata
3. Create the corresponding blog post file in `src/blog/posts/` (if needed)
4. Save changes

#### **events.json**
Events, conferences, talks, or hackathons you've participated in.

```json
{
  "id": 1,
  "title": "Event Name",
  "date": "2026-02-15",
  "type": "Speaking",
  "location": "City, Country",
  "description": "What you did at this event",
  "image": "/assets/events/image.jpg",
  "link": "https://event-url.com",
  "achievement": "Award or recognition (optional)"
}
```

#### **newsletters.json**
Newsletters you publish or subscribe to.

```json
{
  "id": 1,
  "type": "founder",
  "title": "Newsletter Title",
  "date": "2026-01-30",
  "issue": 45,
  "description": "Brief description",
  "link": "https://newsletter.com",
  "subscribers": 2500
}
```

#### **hosting.json**
Services and deployments of your projects.

```json
{
  "id": 1,
  "type": "blog",
  "title": "Project Name",
  "url": "https://project.com",
  "platform": "Vercel",
  "deployDate": "2025-06-15",
  "status": "active",
  "description": "What is hosted here",
  "technologies": ["React", "Vercel"]
}
```

---

### `personal/` - Personal Information

This folder contains your personal details and credentials.

#### **about.ts**
Personal information: languages, volunteer work, sports, awards, etc.

```typescript
export const languages = [
  { name: "English", level: "Native", stars: 5 }
];

export const volunteer = [
  {
    org: "Organization",
    role: "Volunteer Role",
    period: "2022 - Present",
    description: "What you do",
    impact: "What you achieved"
  }
];

// Additional exports: extracurricular, sports, awards, events
```

**How to add a new language:**
1. Open `src/data/personal/about.ts`
2. Add to the `languages` array
3. Save changes

**How to add volunteer experience:**
1. Add a new object to the `volunteer` array
2. Include org, role, period, description, and impact

#### **education.ts**
Your educational background and qualifications.

```typescript
export const educationList = [
  {
    institution: "University Name",
    institutionUrl: "https://university.edu",
    institutionLogo: "https://image-url.jpg",
    degree: "Bachelor of Science",
    period: "2021 - 2025",
    startDate: "2021-09-01",
    location: "City, Country",
    gpa: "3.9/4.0",
    description: "What you studied",
    skills: ["Skill1", "Skill2"],
    associatedProjects: ["Project1"],
    associatedAwards: ["Award1"],
    courses: ["Course1", "Course2"],
    activities: ["Club1", "Activity2"]
  }
];
```

**How to add a new education entry:**
1. Open `src/data/personal/education.ts`
2. Add a new object to the `educationList` array
3. Include all relevant fields (gpa and expiryDate are optional)
4. Save changes

#### **skills.json**
Technical skills organized by category.

```json
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
```

**How to add a new skill:**
1. Open `src/data/personal/skills.json`
2. Find or create the relevant category
3. Add a new skill object with name, level (1-5), years, and endorsed count
4. Save changes

**How to add a new skill category:**
1. Add a new object to the array:
   ```json
   {
     "category": "New Category",
     "skills": []
   }
   ```

#### **workExperience.json**
Your professional work history and employment details.

```json
{
  "id": 1,
  "company": "Company Name",
  "position": "Job Title",
  "startDate": "2024-06",
  "endDate": "Present",
  "location": "City, Country",
  "description": "What you did",
  "technologies": ["Tech1", "Tech2"],
  "achievements": [
    "Achievement 1",
    "Achievement 2"
  ]
}
```

**How to add a new job:**
1. Open `src/data/personal/workExperience.json`
2. Add a new object to the array
3. Increment the `id`
4. Use format "YYYY-MM" for dates
5. Save changes

#### **certificates.json**
Certifications, licenses, and credentials you've earned.

```json
{
  "id": 1,
  "title": "Certification Name",
  "issuer": "Issuing Organization",
  "issueDate": "2025-08",
  "expiryDate": "2028-08",
  "credentialId": "ABC-12345",
  "credentialUrl": "https://verify.url",
  "description": "What this certification covers"
}
```

**How to add a new certificate:**
1. Open `src/data/personal/certificates.json`
2. Add a new object to the array
3. Include issueDate and expiryDate (optional)
4. Add credential URL for verification
5. Save changes

---

## 📤 Central Export File (`index.ts`)

The `src/data/index.ts` file exports all data for convenient imports throughout the app.

### Usage Examples

```typescript
// Option 1: Import specific exports
import { projectsData, blogsData } from "@/data";

// Option 2: Import everything
import * as Data from "@/data";

// Option 3: Use the dataManager (recommended for components)
import { useProjects, useBlogs } from "@/hooks/usePortfolioData";
```

---

## 🔄 How Data Flows Through the App

### 1. **Data Files** → JSON/TS files in `src/data/`
### 2. **Data Manager** → `src/lib/dataManager.ts` loads and processes data
### 3. **Custom Hooks** → `src/hooks/usePortfolioData.ts` provides React hooks
### 4. **Components** → Use hooks or direct imports to display data

### Example Data Flow:
```
src/data/projects.json
    ↓
src/lib/dataManager.ts (DataManager class)
    ↓
src/hooks/usePortfolioData.ts (useProjects hook)
    ↓
src/components/... (Components use the hook)
```

---

## 🎯 Quick Reference: Adding New Content

### Add a New Project
1. Go to `src/data/content/projects.json`
2. Add object with id, title, description, date, technologies, links
3. Save

### Add a New Blog
1. Go to `src/data/content/blogs.json`
2. Add object with id, title, excerpt, date, category, readTime, slug, author
3. Save

### Add New Education
1. Go to `src/data/personal/education.ts`
2. Add object to `educationList` array
3. Save

### Add New Work Experience
1. Go to `src/data/personal/workExperience.json`
2. Add object to array with id, company, position, dates, technologies, achievements
3. Save

### Add New Skill
1. Go to `src/data/personal/skills.json`
2. Find category or create new one
3. Add skill with name, level (1-5), years, endorsed
4. Save

### Add New Certificate
1. Go to `src/data/personal/certificates.json`
2. Add object with title, issuer, dates, credential info
3. Save

---

## 📊 Data Flow Visualization

```
PROJECT STRUCTURE
│
├── src/data/
│   ├── content/           ← Portfolio content
│   │   ├── projects.json     (5 Featured projects)
│   │   ├── blogs.json        (Multiple blog posts)
│   │   ├── events.json       (Conferences, talks, etc.)
│   │   ├── newsletters.json  (Published newsletters)
│   │   └── hosting.json      (Deployed services)
│   │
│   ├── personal/          ← Personal information
│   │   ├── about.ts          (Languages, volunteer, awards)
│   │   ├── education.ts      (3 Education entries)
│   │   ├── skills.json       (5 Skill categories)
│   │   ├── workExperience.json (3 Jobs)
│   │   └── certificates.json (4 Certifications)
│   │
│   └── index.ts           ← Central exports
│
├── src/lib/
│   └── dataManager.ts     ← Data loading & processing
│
├── src/hooks/
│   └── usePortfolioData.ts ← React hooks for data
│
└── src/components/
    └── [Components use data via hooks or imports]
```

---

## 🛠️ Editing Best Practices

1. **Always validate JSON** - Use a JSON validator before saving
2. **Keep dates consistent** - Use "YYYY-MM" or "YYYY-MM-DD" format
3. **Use meaningful IDs** - For blogs, use slugs; for others, use incremental numbers
4. **Add achievements** - Document your accomplishments with specific metrics
5. **Update technologies** - Keep your tech stack current
6. **Link to proofs** - Include URLs to projects, certificates, events, etc.

---

## ⚠️ Important Notes

- **Don't delete old files yet** - Some imports may still reference `src/data/` directly
- **Data Manager handles sorting** - Blog and project dates are auto-sorted (latest first)
- **Images paths** - Always use `/assets/...` for image paths
- **Date format** - Use ISO format (YYYY-MM-DD) for consistency
- **JSON validation** - VS Code will highlight JSON errors automatically

---

## 📝 Example Workflow: Adding a New Project

```
1. Open src/data/content/projects.json
2. Find the last project and note the highest id (e.g., 5)
3. Add new object:
   {
     "id": 6,
     "title": "My New Project",
     "description": "Built with React and TypeScript",
     "date": "2025-06",
     "image": "/assets/projects/my-project.jpg",
     "technologies": ["React", "TypeScript", "Tailwind CSS"],
     "link": "https://myproject.com",
     "github": "https://github.com/user/project",
     "featured": true
   }
4. Save the file
5. Data automatically available to all components via dataManager
```

---

## 🔗 Navigation

- **Personal Info**: `src/data/personal/`
- **Content/Projects**: `src/data/content/`
- **Data Loading**: `src/lib/dataManager.ts`
- **Data Hooks**: `src/hooks/usePortfolioData.ts`
- **Central Exports**: `src/data/index.ts`

---

**Last Updated**: February 2, 2026
