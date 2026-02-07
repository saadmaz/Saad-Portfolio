# Portfolio Data Structure - Architecture Diagram

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Your Portfolio                             │
└─────────────────────────────────────────────────────────────────┘
                                 ↓
                    ┌────────────────────────────┐
                    │   JSON Data Files          │
                    │   (src/data/)              │
                    ├────────────────────────────┤
                    │ • blogs.json               │
                    │ • workExperience.json      │
                    │ • certificates.json        │
                    │ • skills.json              │
                    │ • projects.json            │
                    │ • events.json              │
                    │ • newsletters.json         │
                    │ • hosting.json             │
                    └────────────────────────────┘
                                 ↓
                    ┌────────────────────────────┐
                    │  DataManager               │
                    │  (lib/dataManager.ts)      │
                    ├────────────────────────────┤
                    │ • Loads JSON files         │
                    │ • Auto-sorts by date       │
                    │ • Provides type safety     │
                    │ • Filters data             │
                    └────────────────────────────┘
                                 ↓
                    ┌────────────────────────────┐
                    │  Custom Hooks              │
                    │  (hooks/usePortfolioData)  │
                    ├────────────────────────────┤
                    │ • useBlogs()               │
                    │ • useProjects()            │
                    │ • useWorkExperience()      │
                    │ • useSkills()              │
                    │ • useEvents()              │
                    │ • useNewsletters()         │
                    │ • useCertificates()        │
                    │ • useHosting()             │
                    └────────────────────────────┘
                                 ↓
                    ┌────────────────────────────┐
                    │  Your Components           │
                    │  (pages/ & sections/)      │
                    ├────────────────────────────┤
                    │ • BlogsPage                │
                    │ • ProjectsPage             │
                    │ • ExperiencePage           │
                    │ • SkillsPage               │
                    │ • EventsPage               │
                    │ • etc.                     │
                    └────────────────────────────┘
                                 ↓
                    ┌────────────────────────────┐
                    │  Rendered in Browser       │
                    │  Latest entries first! ✨  │
                    └────────────────────────────┘
```

## Data Flow for Adding New Content

```
1. You Edit JSON File
   src/data/blogs.json
         ↓
2. Browser Detects Change (dev server)
   HMR (Hot Module Replacement)
         ↓
3. DataManager Reloads Data
   Sorts by date (latest first)
         ↓
4. Hooks Trigger Update
   useBlogs() returns new data
         ↓
5. Components Re-render
   Uses new hooks data
         ↓
6. Browser Shows Updated Content
   ✨ Latest entry appears first!
```

## Module Dependency Diagram

```
┌──────────────────────────────────┐
│      Your Components             │
│  (AboutPage, BlogsPage, etc)     │
└──────────────┬───────────────────┘
               │ imports
               ↓
┌──────────────────────────────────┐
│   Custom Hooks                   │
│  useBlogs, useProjects, etc      │
│  (hooks/usePortfolioData.ts)     │
└──────────────┬───────────────────┘
               │ uses
               ↓
┌──────────────────────────────────┐
│   DataManager                    │
│  (lib/dataManager.ts)            │
└──────────────┬───────────────────┘
               │ imports
               ↓
┌──────────────────────────────────┐
│   JSON Data Files                │
│  (src/data/*.json)               │
└──────────────────────────────────┘
```

## Data Sorting Example

```
Without Sorting (Raw):
┌─────────────────────────────┐
│ Blog 1: 2024-12-15          │
├─────────────────────────────┤
│ Blog 2: 2026-01-10          │
├─────────────────────────────┤
│ Blog 3: 2025-06-20          │
├─────────────────────────────┤
│ Blog 4: 2026-01-31 (NEW)    │
└─────────────────────────────┘

After DataManager Sorting (Latest First):
┌─────────────────────────────┐
│ Blog 4: 2026-01-31 ✨ TOP   │
├─────────────────────────────┤
│ Blog 2: 2026-01-10          │
├─────────────────────────────┤
│ Blog 3: 2025-06-20          │
├─────────────────────────────┤
│ Blog 1: 2024-12-15          │
└─────────────────────────────┘
```

## Hook Return Pattern

```
┌─────────────────────────────────┐
│   Hook Call                     │
│   const { data, loading }       │
│         = useBlogs()            │
└──────────────┬──────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
  ┌─────────┐    ┌─────────┐
  │  data   │    │ loading │
  │ (array) │    │ (bool)  │
  ├─────────┤    ├─────────┤
  │•blogs   │    │• true   │
  │•projects│    │• false  │
  │•events  │    └─────────┘
  │•etc     │
  └─────────┘
```

## Newsletter Type Filtering

```
newsletters.json (All)
┌──────────────────────────────┐
│ ID 1: founder newsletter     │
├──────────────────────────────┤
│ ID 2: cse newsletter         │
├──────────────────────────────┤
│ ID 3: founder newsletter     │
├──────────────────────────────┤
│ ID 4: cse newsletter         │
└──────────────────────────────┘

         ↓ Split by type ↓

Founder Newsletter         CSE Newsletter
┌──────────────────┐   ┌──────────────────┐
│ ID 1: founder    │   │ ID 2: cse        │
├──────────────────┤   ├──────────────────┤
│ ID 3: founder    │   │ ID 4: cse        │
└──────────────────┘   └──────────────────┘
```

## Component Update Cycle

```
Initial Render
    ↓
Hook Calls DataManager
    ↓
DataManager Loads JSON
    ↓
Hook Returns { data, loading: false }
    ↓
Component Renders with Data
    ↓
User Edits JSON File
    ↓
Dev Server Detects Change (HMR)
    ↓
DataManager Reloads
    ↓
Hook Notifies Component
    ↓
Component Re-renders (Latest First)
    ↓
✨ Updated Content in Browser
```

## Skills Organization

```
skills.json Structure:

┌──────────────────────────────┐
│ Category: "Frontend"         │
├──────────────────────────────┤
│ • React (5/5, 3 years)       │
│ • TypeScript (5/5, 3 years)  │
│ • Tailwind (4/5, 2 years)    │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Category: "Backend"          │
├──────────────────────────────┤
│ • Node.js (5/5, 3 years)     │
│ • Express (5/5, 3 years)     │
│ • GraphQL (4/5, 2 years)     │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Category: "DevOps"           │
├──────────────────────────────┤
│ • Docker (4/5, 2 years)      │
│ • AWS (4/5, 2 years)         │
│ • Kubernetes (3/5, 1 year)   │
└──────────────────────────────┘
```

## Projects Featured Filter

```
projects.json (All)
┌──────────────────────────────┐
│ Project 1 (featured: true)   │ ← Get Featured
├──────────────────────────────┤
│ Project 2 (featured: false)  │
├──────────────────────────────┤
│ Project 3 (featured: true)   │ ← Get Featured
├──────────────────────────────┤
│ Project 4 (featured: true)   │ ← Get Featured
├──────────────────────────────┤
│ Project 5 (featured: false)  │
└──────────────────────────────┘

         ↓ Filter Featured ↓

Featured Projects (limit 3)
┌──────────────────────────────┐
│ Project 1 (Latest) ✨        │
├──────────────────────────────┤
│ Project 4                    │
├──────────────────────────────┤
│ Project 3                    │
└──────────────────────────────┘
```

## Hosting Type Distribution

```
hosting.json (All, Latest First)
┌──────────────────────────────┐
│ 1. Portfolio (blog)          │
├──────────────────────────────┤
│ 2. API (api)                 │
├──────────────────────────────┤
│ 3. Tasks (app)               │
├──────────────────────────────┤
│ 4. Analytics (app)           │
├──────────────────────────────┤
│ 5. Newsletter (blog)         │
└──────────────────────────────┘

         ↓ By Type ↓

Blogs           APIs           Apps
┌────────┐  ┌────────┐  ┌────────┐
│Portfol.│  │   API  │  │Tasks   │
├────────┤  ├────────┤  ├────────┤
│Newslet.│  └────────┘  │Analyt..│
└────────┘              └────────┘
```

## Type Safety Flow

```
Your Component
    ↓
import { useBlogs } from hooks
    ↓
Hook has type { data: Blog[], loading: boolean }
    ↓
IDE knows blog has:
• id: string
• title: string
• excerpt: string
• date: string
• category: string
• readTime: string
• slug: string
• author: string
    ↓
✨ Full Autocomplete & Type Checking
```

## File Organization

```
Portfolio Project
│
├── src/
│   ├── data/ ─────────────── JSON Data Files
│   │   ├── blogs.json
│   │   ├── workExperience.json
│   │   ├── certificates.json
│   │   ├── skills.json
│   │   ├── projects.json
│   │   ├── events.json
│   │   ├── newsletters.json
│   │   └── hosting.json
│   │
│   ├── lib/
│   │   └── dataManager.ts ── Data Loading & Sorting
│   │
│   ├── hooks/
│   │   └── usePortfolioData.ts ─ Custom Hooks
│   │
│   ├── components/
│   │   ├── examples/
│   │   │   └── DataStructureExamples.tsx ─ Examples
│   │   ├── pages/ ────────── Page Components
│   │   ├── sections/ ─────── Section Components
│   │   └── ...
│   │
│   └── ...
│
├── DATA_STRUCTURE_GUIDE.md
├── QUICK_REFERENCE.md
├── INTEGRATION_GUIDE.md
└── SETUP_SUMMARY.md
```

## Update Frequency

```
How Often Does Data Update?

Option 1: Manual JSON Edit
────────────────────────────
You → Edit JSON File → Browser Sees Change (HMR) → Component Updates
Time: Seconds

Option 2: Programmatic (Advanced)
────────────────────────────────
dataManager.reload() → Component Updates
Time: Milliseconds

Data Always Shows Latest First: ✨
```

---

This structure ensures:
✅ Clear separation of concerns
✅ Easy data management
✅ Automatic sorting (latest first)
✅ Type safety
✅ Reusable hooks
✅ Simple component updates
