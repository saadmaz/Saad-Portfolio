# 📋 Data Structure Reorganization - Complete Guide

**Date Completed**: February 2, 2026  
**Status**: ✅ Complete and Ready to Use

---

## 🎯 What Was Done

Your portfolio data has been **completely reorganized** into a clean, scalable structure. All JSON files are now centralized and properly organized by category.

### Before vs After

#### ❌ Before (Messy)
```
src/data/
├── blogs.json
├── projects.json
├── events.json
├── newsletters.json
├── hosting.json
├── about.ts
├── education.ts
├── skills.json
├── workExperience.json
└── certificates.json
(All mixed together - hard to maintain)
```

#### ✅ After (Clean & Organized)
```
src/data/
├── content/                    # Public portfolio content
│   ├── projects.json
│   ├── blogs.json
│   ├── events.json
│   ├── newsletters.json
│   └── hosting.json
├── personal/                   # Personal information
│   ├── about.ts
│   ├── education.ts
│   ├── skills.json
│   ├── workExperience.json
│   └── certificates.json
└── index.ts                    # Central export hub
```

---

## 📁 New Structure Breakdown

### **`src/data/content/`** - Your Portfolio Work

This folder contains everything about your **projects and public work**.

| File | Purpose | Add When... |
|------|---------|------------|
| **projects.json** | Featured projects | You complete a new project |
| **blogs.json** | Blog posts metadata | You publish a blog |
| **events.json** | Conferences, talks, events | You speak or attend an event |
| **newsletters.json** | Newsletter issues | You publish a newsletter |
| **hosting.json** | Deployed services | You host/deploy something |

### **`src/data/personal/`** - Your Profile

This folder contains your **personal information and credentials**.

| File | Purpose | Add When... |
|------|---------|------------|
| **about.ts** | Languages, volunteer, sports | You learn a language or volunteer |
| **education.ts** | Schools, degrees, courses | You complete education |
| **skills.json** | Technical & soft skills | You master a new skill |
| **workExperience.json** | Jobs and positions | You get a new job |
| **certificates.json** | Certifications, licenses | You earn a certification |

---

## 🚀 How to Add Content

### ➕ Add a New Project

```json
// File: src/data/content/projects.json
{
  "id": 6,
  "title": "My Awesome App",
  "description": "A full-stack application that does amazing things",
  "date": "2025-12",
  "image": "/assets/projects/my-app.jpg",
  "technologies": ["React", "Node.js", "MongoDB"],
  "link": "https://myapp.com",
  "github": "https://github.com/user/myapp",
  "featured": true
}
```

✨ **Just add the JSON object and save! No code changes needed.**

---

### ➕ Add a New Blog Post

```json
// File: src/data/content/blogs.json
{
  "id": "my-blog-post-slug",
  "title": "How I Built X With Y",
  "excerpt": "A quick summary of what this blog is about",
  "date": "2026-02-01",
  "category": "React",
  "readTime": "10 min read",
  "slug": "my-blog-post-slug",
  "author": "Your Name"
}
```

---

### ➕ Add New Work Experience

```json
// File: src/data/personal/workExperience.json
{
  "id": 4,
  "company": "Tech Company",
  "position": "Senior Developer",
  "startDate": "2026-02",
  "endDate": "Present",
  "location": "Remote",
  "description": "Building amazing products and leading a team",
  "technologies": ["React", "TypeScript", "AWS"],
  "achievements": [
    "Reduced load time by 50%",
    "Mentored 2 junior developers",
    "Led successful feature launch"
  ]
}
```

---

### ➕ Add New Education

```typescript
// File: src/data/personal/education.ts
export const educationList = [
  // ... existing entries
  {
    institution: "Your University",
    institutionUrl: "https://university.edu",
    institutionLogo: "https://image-url.jpg",
    degree: "Master of Science in Computer Science",
    period: "2025 - 2027",
    startDate: "2025-09-01",
    location: "City, Country",
    gpa: "3.95/4.0",
    description: "Advanced studies in AI and Machine Learning",
    skills: ["AI", "Machine Learning", "Python", "TensorFlow"],
    associatedProjects: ["AI Project 1", "AI Project 2"],
    associatedAwards: ["Scholarship Award"],
    courses: ["Advanced ML", "AI Ethics"],
    activities: ["AI Club President"]
  }
];
```

---

### ➕ Add New Skill

```json
// File: src/data/personal/skills.json
[
  {
    "category": "Frontend",
    "skills": [
      { "name": "React", "level": 5, "years": 3, "endorsed": 45 },
      // Add new skills here
      { "name": "Svelte", "level": 2, "years": 1, "endorsed": 5 }
    ]
  }
]
```

**Or create a new category:**

```json
{
  "category": "Mobile",
  "skills": [
    { "name": "React Native", "level": 3, "years": 1, "endorsed": 12 }
  ]
}
```

---

### ➕ Add New Certificate

```json
// File: src/data/personal/certificates.json
{
  "id": 5,
  "title": "Kubernetes Associate",
  "issuer": "Cloud Native Computing Foundation",
  "issueDate": "2026-02",
  "expiryDate": "2029-02",
  "credentialId": "CKAD-ABC123",
  "credentialUrl": "https://verify.cncf.io/...",
  "description": "Certified Kubernetes Application Developer"
}
```

---

## 📊 How Data Flows Through Your App

```
┌─────────────────────────────────────────────────────────┐
│  1. DATA FILES (JSON/TS)                               │
│  - src/data/content/*.json                             │
│  - src/data/personal/*.ts                              │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  2. DATA MANAGER (src/lib/dataManager.ts)              │
│  - Loads and processes data                            │
│  - Sorts by date (latest first)                        │
│  - Provides utility methods                            │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  3. CUSTOM HOOKS (src/hooks/usePortfolioData.ts)       │
│  - useProjects()                                       │
│  - useBlogs()                                          │
│  - useSkills()                                         │
│  - etc.                                                │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  4. REACT COMPONENTS                                   │
│  - Pages and components use the hooks                  │
│  - Display data on the portfolio                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Updated Import Paths

All imports have been automatically updated to use the new structure:

### DataManager
```typescript
// Before
import blogsData from "@/data/blogs.json";

// After
import blogsData from "@/data/content/blogs.json";
```

### Components
```typescript
// Before
import { educationList } from "@/data/education";

// After
import { educationList } from "@/data/personal/education";
```

✅ **All imports have been updated automatically. No manual changes needed.**

---

## 📚 Available Hooks (Use in Components)

```typescript
// Import from @/hooks/usePortfolioData
import {
  useProjects,
  useFeaturedProjects,
  useBlogs,
  useFeaturedBlogs,
  useWorkExperience,
  useCertificates,
  useSkills,
  useEvents,
  useNewsletters,
  useNewslettersByType,
  useHosting,
  useActiveHosting
} from "@/hooks/usePortfolioData";

// Usage example in a component
const MyComponent = () => {
  const { projects, loading } = useProjects();
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  );
};
```

---

## 🎓 Real-World Examples

### Example 1: Adding Your First Project

**File:** `src/data/content/projects.json`

```json
[
  // ... existing projects ...
  {
    "id": 6,
    "title": "AI Chat Assistant",
    "description": "An AI-powered chatbot using GPT-4 API with memory and personality",
    "date": "2025-12",
    "image": "/assets/projects/ai-chat.jpg",
    "technologies": ["React", "TypeScript", "Node.js", "OpenAI API", "MongoDB"],
    "link": "https://ai-chat.saadmalik.dev",
    "github": "https://github.com/saadmalik/ai-chat",
    "featured": true
  }
]
```

✅ Done! The project is automatically available throughout the app.

---

### Example 2: Adding Your Recent Job

**File:** `src/data/personal/workExperience.json`

```json
[
  // ... existing jobs ...
  {
    "id": 4,
    "company": "Startup XYZ",
    "position": "Full Stack Developer",
    "startDate": "2026-01",
    "endDate": "Present",
    "location": "San Francisco, CA",
    "description": "Building the next-generation SaaS platform for e-commerce",
    "technologies": ["React 19", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    "achievements": [
      "Built payment integration saving $5K/month",
      "Reduced API response time from 2s to 200ms",
      "Mentored 1 junior developer"
    ]
  }
]
```

✅ Done! Automatically shows on your About page.

---

### Example 3: Adding a New Language

**File:** `src/data/personal/about.ts`

```typescript
export const languages = [
  { name: "English", level: "Native", stars: 5 },
  { name: "Sinhala", level: "Native", stars: 5 },
  { name: "Tamil", level: "Conversational", stars: 3 },
  { name: "Spanish", level: "Fluent", stars: 4 },
  { name: "Mandarin", level: "Conversational", stars: 2 },
  // Add new language here
  { name: "French", level: "Beginner", stars: 2 },
];
```

✅ Done! Your new language now appears on your profile.

---

## 🧠 Key Concepts

### Data is Automatically Sorted
The `dataManager` automatically sorts all data by date (latest first) for:
- Blogs
- Projects
- Events
- Work Experience
- Certificates
- Newsletters
- Hosting

### No Manual Ordering Needed
Just add items to the JSON, and they'll appear in the right order.

### Central Export File
`src/data/index.ts` exports everything, so you can import from one place:

```typescript
import { projectsData, blogsData, educationList } from "@/data";
```

---

## 📋 Complete File Reference

### Content Data

| File | Type | Count | Description |
|------|------|-------|------------|
| `content/projects.json` | JSON | 5 | Featured projects |
| `content/blogs.json` | JSON | 5 | Blog posts |
| `content/events.json` | JSON | 5 | Events & conferences |
| `content/newsletters.json` | JSON | 6 | Newsletter issues |
| `content/hosting.json` | JSON | 5 | Deployed services |

### Personal Data

| File | Type | Count | Description |
|------|------|-------|------------|
| `personal/about.ts` | TS | N/A | About info & interests |
| `personal/education.ts` | TS | 3 | Education entries |
| `personal/skills.json` | JSON | 5 categories | Technical skills |
| `personal/workExperience.json` | JSON | 3 | Job history |
| `personal/certificates.json` | JSON | 4 | Certifications |

---

## ✅ Verification Checklist

- ✅ All JSON files moved to appropriate folders
- ✅ All TypeScript files moved to appropriate folders
- ✅ All imports updated in components
- ✅ All imports updated in dataManager
- ✅ Central index.ts created
- ✅ No compilation errors
- ✅ Data structure is clean and organized
- ✅ Easy to add new content

---

## 🚀 Next Steps

1. **Review your data**: Visit each file and ensure information is current
2. **Add new content**: Use the examples above to add projects, jobs, skills, etc.
3. **Update images**: Add project and event images to `/assets/`
4. **Test the app**: Build and run your portfolio to ensure everything works
5. **Customize**: Adjust data as needed for your profile

---

## 📝 Quick Commands

### Add a Project
1. Open `src/data/content/projects.json`
2. Add new object with id, title, date, technologies
3. Save

### Add a Job
1. Open `src/data/personal/workExperience.json`
2. Add new object with company, position, dates, achievements
3. Save

### Add Education
1. Open `src/data/personal/education.ts`
2. Add new object to educationList array
3. Save

### Add Skill
1. Open `src/data/personal/skills.json`
2. Find category or create new one
3. Add skill object with level 1-5
4. Save

---

## 🎯 Structure Benefits

✨ **Crystal Clear Organization**
- Content separated from personal info
- Easy to find what you're looking for

✨ **Easy to Add Content**
- Just add JSON objects
- No complex code needed

✨ **Scalable**
- Ready for 100+ projects, blogs, etc.
- Performance optimized

✨ **Maintainable**
- Single source of truth
- Updates automatic everywhere

✨ **Developer Friendly**
- Clear naming conventions
- Type-safe imports
- Central export file

---

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `src/data/index.ts` | Central exports |
| `src/lib/dataManager.ts` | Data loading & processing |
| `src/hooks/usePortfolioData.ts` | React hooks |
| `src/data/content/` | Portfolio content |
| `src/data/personal/` | Personal information |

---

## 💡 Pro Tips

1. **Batch updates**: Update multiple fields at once in JSON files
2. **Use URLs**: Always include links to live projects, GitHub repos, etc.
3. **Add metrics**: Include numbers in achievements (e.g., "Reduced load by 40%")
4. **Keep dates current**: Update end dates for ongoing work
5. **Fresh images**: Use high-quality images for projects and events

---

**Ready to build an amazing portfolio! 🚀**

Last Updated: February 2, 2026
