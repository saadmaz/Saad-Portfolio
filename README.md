# Saad Mazhar — Portfolio

A modern, full-featured personal portfolio built with **React + Vite** and **Firebase** — deployed on **Vercel** with zero backend server required.

Live: [saadmaz.com](https://saadmaz.com)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| Data fetching | TanStack Query (React Query v5) |
| Database | Firebase Firestore (client SDK) |
| Auth | Firebase Authentication |
| File storage | Firebase Storage |
| Email | SendGrid (server-side only) |
| Deployment | Vercel (frontend + 1 serverless function) |

---

## Architecture

The entire app is a **single Vite SPA** deployed to Vercel. There is no Express server. All data reads and writes go directly from the browser to Firebase via the Firebase JS SDK. Security is enforced by Firestore and Storage security rules.

The only server-side code is one Vercel serverless function that hides the SendGrid API key:

```
Portfolio/
├── frontend/
│   ├── api/
│   │   └── contact.ts          # Vercel serverless function — Firestore write + SendGrid email
│   ├── public/
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   └── src/
│       ├── app/                # App.tsx (router, providers), main.tsx, index.css
│       ├── assets/             # Profile photo, resume PDF
│       ├── components/
│       │   ├── admin/          # Admin CRUD forms and layout
│       │   ├── blog/           # BlogCard, BlogTemplate
│       │   ├── education/      # EducationDialog
│       │   ├── layout/         # Header, Footer, Layout wrapper
│       │   ├── projects/       # ProjectCard
│       │   ├── sections/       # Homepage sections (Hero, Skills, Experience, etc.)
│       │   ├── ui/             # shadcn/ui primitives
│       │   ├── SEO.tsx         # Reusable react-helmet-async wrapper
│       │   └── ErrorBoundary.tsx
│       ├── data/               # Static seed data (education, personal/about)
│       ├── lib/
│       │   └── firebase.ts     # Firebase app init — exports auth, db, storage
│       ├── pages/              # Lazy-loaded route components (public + admin)
│       ├── services/
│       │   ├── project-service.ts   # Firestore CRUD for projects
│       │   ├── blog-service.ts      # Firestore CRUD for blog posts
│       │   └── storage.ts           # Firebase Storage upload helper
│       ├── shared/
│       │   ├── contexts/       # AuthContext
│       │   ├── hooks/          # useProjects, useBlog, useCommon, useTheme, etc.
│       │   ├── lib/
│       │   │   ├── queryKeys.ts     # Centralized TanStack Query key registry
│       │   │   └── dataManager.ts   # DataManager class for public data reads
│       │   └── services/
│       │       └── common-service.ts  # Firestore CRUD for all other entities
│       └── types/
│           └── index.ts        # TypeScript interfaces for all data models
├── package.json                # Root scripts (proxies to frontend/)
└── vercel.json                 # (in frontend/) SPA routing + API rewrite rules
```

---

## Local Development

### Prerequisites

- Node.js v20+
- A Firebase project with **Firestore**, **Authentication** (Email/Password), and **Storage** enabled

### 1. Install dependencies

```bash
cd Portfolio/frontend
npm install
```

### 2. Environment variables

Create `frontend/.env.local`:

```env
# Firebase client SDK (public — safe to expose)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 3. Run the dev server

```bash
npm run dev
# → http://localhost:5173
```

The contact form hits `/api/contact` which is proxied to the Vercel serverless function. In local dev this won't work without [Vercel CLI](https://vercel.com/docs/cli). Everything else (Firestore, Auth, Storage) works directly.

---

## Deployment (Vercel)

### Project settings

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Environment variables (Vercel dashboard)

Add all of the above `VITE_FIREBASE_*` keys, plus these server-side secrets for the contact function:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=           # paste with literal \n — Vercel handles the escape
SENDGRID_API_KEY=
TO_EMAIL=                       # your inbox address
FROM_EMAIL=                     # verified SendGrid sender
```

The `frontend/vercel.json` handles routing automatically:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)",     "destination": "/index.html" }
  ]
}
```

---

## Firebase Setup

### Firestore security rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage security rules

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Deploy rules via Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage
```

---

## Content Management

All content is managed through the admin panel at `/admin`. Log in with the Firebase Authentication email/password you configured for your account.

| Section | Firestore Collection |
|---|---|
| Projects | `projects` |
| Blog Posts | `blog_posts` |
| Work Experience | `work_experience` |
| Skills | `skills` |
| Certificates | `certificates` |
| Awards | `awards` |
| Languages | `languages` |
| Hackathons | `hackathons` |
| Testimonials | `testimonials` |
| Volunteer | `volunteer_experience` |
| Education | `education` |
| Events | `events` |
| Newsletters | `newsletters` |
| Contact Messages | `contact_messages` |
| Activity Logs | `activity_logs` |

---

## Key Files

| File | Purpose |
|---|---|
| `src/lib/firebase.ts` | Single Firebase init — exports `auth`, `db`, `storage` |
| `src/services/storage.ts` | `uploadImage(file)` — direct browser → Firebase Storage |
| `src/shared/lib/queryKeys.ts` | Centralized TanStack Query cache key registry |
| `src/components/SEO.tsx` | Per-page meta tags, OG, Twitter card, JSON-LD |
| `api/contact.ts` | Serverless function: validates input, writes to Firestore, sends email via SendGrid |
| `public/robots.txt` | Blocks `/admin` from crawlers |
| `public/sitemap.xml` | Static sitemap for all public routes |
