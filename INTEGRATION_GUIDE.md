# Integration Guide - Using New Data Structure

## Overview

This guide shows how to update your existing components to use the new data structure.

## Step 1: Replace Imports

### Before (Old Way)
```typescript
import { educationList } from "@/data/education";
import { languages, volunteer, sports, awards } from "@/data/about";
```

### After (New Way)
```typescript
import { useBlogs, useProjects, useWorkExperience } from "@/hooks/usePortfolioData";
```

## Step 2: Update Component Logic

### Example 1: Blog List Component

#### Before
```typescript
import blogsData from "@/data/blogs.json";

export function BlogList() {
  return (
    <div>
      {blogsData.map((blog) => (
        <article key={blog.id}>{blog.title}</article>
      ))}
    </div>
  );
}
```

#### After
```typescript
import { useBlogs } from "@/hooks/usePortfolioData";

export function BlogList() {
  const { blogs, loading } = useBlogs();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {blogs.map((blog) => (
        <article key={blog.id}>{blog.title}</article>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ Automatic sorting (latest first)
- ✅ Type-safe
- ✅ Loading state handled
- ✅ Easy filtering

### Example 2: Featured Projects

#### Before
```typescript
import projectsData from "@/data/projects.json";

export function FeaturedProjects() {
  const featured = projectsData.filter(p => p.featured).slice(0, 3);
  
  return (
    <div>
      {featured.map((project) => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  );
}
```

#### After
```typescript
import { useFeaturedProjects } from "@/hooks/usePortfolioData";

export function FeaturedProjects() {
  const { projects, loading } = useFeaturedProjects(3);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ Cleaner code (filtering built-in)
- ✅ Automatic sorting
- ✅ Limited results (3 projects)
- ✅ Type-safe

### Example 3: Work Experience with Timeline

#### Before
```typescript
import workData from "@/data/workExperience.json";

export function Experience() {
  const sorted = [...workData].sort((a, b) => 
    new Date(b.startDate) - new Date(a.startDate)
  );
  
  return (
    <div>
      {sorted.map((job) => (
        <div key={job.id}>
          <h3>{job.position}</h3>
          <p>{job.company}</p>
        </div>
      ))}
    </div>
  );
}
```

#### After
```typescript
import { useWorkExperience } from "@/hooks/usePortfolioData";

export function Experience() {
  const { experience, loading } = useWorkExperience();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {experience.map((job) => (
        <div key={job.id}>
          <h3>{job.position}</h3>
          <p>{job.company}</p>
        </div>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ No manual sorting needed
- ✅ Cleaner code
- ✅ Latest job appears first

### Example 4: Skills by Category

#### Before
```typescript
import skillsData from "@/data/skills.json";

export function Skills() {
  return (
    <div>
      {skillsData.frontend && (
        <div>
          <h3>Frontend</h3>
          {skillsData.frontend.map(skill => (
            <div key={skill.id}>{skill.skill}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### After
```typescript
import { useSkills } from "@/hooks/usePortfolioData";

export function Skills() {
  const { skills, loading } = useSkills();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {skills.map((category) => (
        <div key={category.category}>
          <h3>{category.category}</h3>
          {category.skills.map(skill => (
            <div key={skill.name}>{skill.name}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ Clean category structure
- ✅ Type-safe
- ✅ Organized by category

### Example 5: Newsletters (Split by Type)

#### Before
```typescript
import newsletterData from "@/data/newsletters.json";

export function Newsletters() {
  const founder = newsletterData.filter(n => n.type === "founder");
  const cse = newsletterData.filter(n => n.type === "cse");
  
  return (
    <div>
      <h2>Founder</h2>
      {founder.map(letter => <div key={letter.id}>{letter.title}</div>)}
      
      <h2>CSE</h2>
      {cse.map(letter => <div key={letter.id}>{letter.title}</div>)}
    </div>
  );
}
```

#### After
```typescript
import { useNewslettersByType } from "@/hooks/usePortfolioData";

export function Newsletters() {
  const { newsletters: founder, loading: founderLoading } = useNewslettersByType("founder");
  const { newsletters: cse, loading: cseLoading } = useNewslettersByType("cse");
  
  if (founderLoading || cseLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Founder</h2>
      {founder.map(letter => <div key={letter.id}>{letter.title}</div>)}
      
      <h2>CSE</h2>
      {cse.map(letter => <div key={letter.id}>{letter.title}</div>)}
    </div>
  );
}
```

**Benefits:**
- ✅ Automatic sorting (latest first)
- ✅ Easy filtering by type
- ✅ Cleaner code

### Example 6: Events with Images

#### Before
```typescript
import eventsData from "@/data/events.json";

export function Events() {
  const sorted = [...eventsData].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  return (
    <div>
      {sorted.map(event => (
        <div key={event.id}>
          <img src={event.image} alt={event.title} />
          <h3>{event.title}</h3>
          <p>{event.date}</p>
        </div>
      ))}
    </div>
  );
}
```

#### After
```typescript
import { useEvents } from "@/hooks/usePortfolioData";

export function Events() {
  const { events, loading } = useEvents();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <img src={event.image} alt={event.title} />
          <h3>{event.title}</h3>
          <p>{event.date}</p>
        </div>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ No manual sorting
- ✅ Cleaner code
- ✅ Latest events first

## Step 3: Handle Loading States

```typescript
import { useBlogs } from "@/hooks/usePortfolioData";

export function BlogList() {
  const { blogs, loading } = useBlogs();
  
  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 h-12 rounded" />
        ))}
      </div>
    );
  }
  
  // Show empty state
  if (blogs.length === 0) {
    return <div>No blogs found</div>;
  }
  
  // Show data
  return (
    <div>
      {blogs.map(blog => (
        <article key={blog.id}>{blog.title}</article>
      ))}
    </div>
  );
}
```

## Step 4: Type Safety

```typescript
import { useBlogs } from "@/hooks/usePortfolioData";
import type { Blog } from "@/lib/dataManager";

export function BlogList() {
  const { blogs, loading } = useBlogs();
  
  if (loading) return <div>Loading...</div>;
  
  // TypeScript knows blog is type Blog
  return (
    <div>
      {blogs.map((blog: Blog) => (
        <article key={blog.id}>
          <h2>{blog.title}</h2>
          <p>{blog.excerpt}</p>
          <span>{blog.readTime}</span>
        </article>
      ))}
    </div>
  );
}
```

## Step 5: Direct Data Manager Access

For more control, use the data manager directly:

```typescript
import { dataManager } from "@/lib/dataManager";

export function DashboardStats() {
  // Direct access (no hooks needed)
  const totalBlogs = dataManager.getBlogs().length;
  const totalProjects = dataManager.getProjects().length;
  const featuredProjects = dataManager.getFeaturedProjects().length;
  
  return (
    <div>
      <p>Total Blogs: {totalBlogs}</p>
      <p>Total Projects: {totalProjects}</p>
      <p>Featured Projects: {featuredProjects}</p>
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Limit Results
```typescript
const { projects, loading } = useFeaturedProjects(5);
// Only get 5 featured projects
```

### Pattern 2: Filter by Type
```typescript
const { newsletters, loading } = useNewslettersByType("founder");
// Only get founder newsletters
```

### Pattern 3: Get Specific Newsletter
```typescript
const blog = dataManager.getBlogBySlug("my-blog-post");
```

### Pattern 4: Group by Category
```typescript
const { skills, loading } = useSkills();
const frontendSkills = skills.find(s => s.category === "Frontend");
```

### Pattern 5: Active Only
```typescript
const { hosting, loading } = useActiveHosting();
// Only get active hosting services
```

## Migration Checklist

- [ ] Update all blog imports to use `useBlogs()`
- [ ] Update all project imports to use `useProjects()`
- [ ] Update all work experience imports to use `useWorkExperience()`
- [ ] Update all skills imports to use `useSkills()`
- [ ] Update all certificates imports to use `useCertificates()`
- [ ] Update all events imports to use `useEvents()`
- [ ] Update all newsletter imports to use `useNewsletters()` or `useNewslettersByType()`
- [ ] Update all hosting imports to use `useHosting()` or `useActiveHosting()`
- [ ] Add loading states to all components
- [ ] Test all components
- [ ] Remove old data imports
- [ ] Test build (no unused imports)

## Testing Your Updates

### Test Loading State
```typescript
const { blogs, loading } = useBlogs();
console.log("Loading:", loading); // Should be false after data loads
```

### Test Data Sorting
```typescript
const { blogs, loading } = useBlogs();
console.log("First blog date:", blogs[0].date);
console.log("Latest blog first:", blogs[0].date > blogs[blogs.length - 1].date);
```

### Test Type Safety
```typescript
const { projects } = useProjects();
projects.map(p => {
  // TypeScript autocomplete should work
  console.log(p.title, p.technologies);
});
```

## Troubleshooting

**Q: Data not updating after JSON edit?**
A: Clear browser cache and restart dev server

**Q: Loading state always true?**
A: Check browser console for errors

**Q: Type errors?**
A: Ensure all required fields are present in JSON

**Q: Wrong sort order?**
A: Verify date format is ISO 8601 (YYYY-MM-DD)

---

📖 Full documentation: [DATA_STRUCTURE_GUIDE.md](DATA_STRUCTURE_GUIDE.md)
⚡ Quick reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
📋 Examples: [src/components/examples/DataStructureExamples.tsx](src/components/examples/DataStructureExamples.tsx)
