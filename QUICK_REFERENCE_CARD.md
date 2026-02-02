# 📌 Quick Reference Card

## New Data Structure at a Glance

```
src/data/
├── content/        ← Portfolio work
│   ├── projects.json
│   ├── blogs.json
│   ├── events.json
│   ├── newsletters.json
│   └── hosting.json
│
├── personal/       ← Your info
│   ├── about.ts
│   ├── education.ts
│   ├── skills.json
│   ├── workExperience.json
│   └── certificates.json
│
└── index.ts        ← Central hub
```

---

## ⚡ 30-Second Quick Adds

### Add a Project
```json
// src/data/content/projects.json
{
  "id": 6,
  "title": "Project Name",
  "description": "Description",
  "date": "2025-12",
  "image": "/assets/projects/image.jpg",
  "technologies": ["React", "TypeScript"],
  "link": "https://project.com",
  "github": "https://github.com/user/project",
  "featured": true
}
```

### Add a Job
```json
// src/data/personal/workExperience.json
{
  "id": 4,
  "company": "Company Name",
  "position": "Job Title",
  "startDate": "2026-01",
  "endDate": "Present",
  "location": "City",
  "description": "What you do",
  "technologies": ["Tech1", "Tech2"],
  "achievements": ["Achievement 1"]
}
```

### Add a Skill
```json
// src/data/personal/skills.json
{ "name": "Skill", "level": 5, "years": 3, "endorsed": 20 }
```

### Add Education
```typescript
// src/data/personal/education.ts
{
  "institution": "University",
  "degree": "Degree Name",
  "period": "2021 - 2025",
  "gpa": "3.9/4.0",
  "description": "Description",
  "skills": ["Skill1", "Skill2"]
}
```

---

## 📁 Where to Add What?

| What | File |
|------|------|
| 💻 Project | `content/projects.json` |
| 📝 Blog | `content/blogs.json` |
| 🎤 Event | `content/events.json` |
| 📧 Newsletter | `content/newsletters.json` |
| 🚀 Deployment | `content/hosting.json` |
| 🗣️ Language | `personal/about.ts` |
| 🏫 Education | `personal/education.ts` |
| 💡 Skill | `personal/skills.json` |
| 💼 Job | `personal/workExperience.json` |
| 🏆 Certificate | `personal/certificates.json` |

---

## 🔌 Import Examples

```typescript
// From components/hooks
import { useProjects } from "@/hooks/usePortfolioData";
import { useSkills } from "@/hooks/usePortfolioData";
import { useWorkExperience } from "@/hooks/usePortfolioData";

// Direct imports
import { projectsData } from "@/data";
import { educationList } from "@/data/personal/education";
```

---

## ✅ Verification

- ✅ All files moved and organized
- ✅ All imports updated
- ✅ No compilation errors
- ✅ Data fully accessible
- ✅ Ready to use

---

## 📚 Full Documentation

- **REORGANIZATION_SUMMARY.md** - Complete overview
- **DATA_STRUCTURE_COMPLETE.md** - Detailed guide with examples
- **DATA_STRUCTURE_NEW.md** - Field reference
- **DATA_STRUCTURE_VISUAL.md** - Visual guide

---

## 🚀 You're All Set!

Your data structure is now clean, organized, and scalable!

Just add JSON objects and everything updates automatically. 🎉

---

*Last Updated: February 2, 2026*
