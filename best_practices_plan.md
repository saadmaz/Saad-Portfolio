# 🗂️ Codebase Audit & Best Practices Implementation Plan
### Portfolio Monorepo — Saad Mazhar

---

## 📋 Codebase Overview (What You Have)

| Area | Technology | State |
|---|---|---|
| **Monorepo** | npm workspaces + `concurrently` | ✅ Solid |
| **Frontend** | React 18 + Vite + TypeScript + TailwindCSS v3 + shadcn/ui | ✅ Solid |
| **Backend** | Node.js + Express + TypeScript + Firebase Admin SDK | ⚠️ Partially complete |
| **Database** | Cloud Firestore (Firebase) | ⚠️ Depends on credentials |
| **Auth** | Static Bearer token (`ADMIN_SECRET`) | ❌ Weak |
| **Deployment** | Vercel (frontend static + backend serverless) | ⚠️ Fragile config |
| **Data Layer (FE)** | [DataManager](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/shared/lib/dataManager.ts#237-384) class → `apiClient` (axios) | ⚠️ Inconsistencies |
| **State Management** | TanStack Query (installed but hooks use raw `useState/useEffect`) | ❌ Under-utilized |
| **Email** | SendGrid | ⚠️ Not wired up in CommonController |
| **Testing** | None | ❌ Missing |
| **CI/CD** | None | ❌ Missing |

---

## 🔴 Critical Issues (Fix First)

### 1. [ProjectDetailPage](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/pages/ProjectDetailPage.tsx#13-493) calls synchronous `dataManager` methods
**File:** [frontend/src/pages/ProjectDetailPage.tsx](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/pages/ProjectDetailPage.tsx) L30–33

```tsx
// ❌ BROKEN — DataManager methods are async (they fetch from the API)
project = dataManager.getProjectBySlug(slug);  // returns a Promise, not a Project
project = dataManager.getProjectById(Number(slug));
```
The result is always `undefined`, producing a permanent 404 page. This is the single biggest UX bug.

### 2. Hardcoded `localhost` URL in `dataManager.getHosting()`
**File:** [frontend/src/shared/lib/dataManager.ts](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/shared/lib/dataManager.ts) L364

```ts
// ❌ Will always fail in production
const res = await fetch("http://localhost:3001/api/hosting");
```
Should use the same `apiClient` as every other method.

### 3. Admin auth uses a plain-text static secret
**File:** [backend/src/middleware/auth.ts](file:///c:/Users/saadm/Downloads/Portfolio/backend/src/middleware/auth.ts) L9

```ts
const adminSecret = process.env.ADMIN_SECRET || 'adminpassword';
```
Falls back to a default of `'adminpassword'` — a hardcoded credential shipped in source code.

### 4. Admin routes are stubs; email is wired in `publicController` but not `CommonController`
`CommonController.submitContactForm` has a `// TODO: Integrate with SendGrid` comment.  
[publicController.ts](file:///c:/Users/saadm/Downloads/Portfolio/backend/src/controllers/publicController.ts) has a full working implementation. **Duplicate code; one version is dead.**

### 5. Duplicate / conflicting type definitions
[frontend/src/types/index.ts](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/types/index.ts) and [frontend/src/shared/lib/dataManager.ts](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/shared/lib/dataManager.ts) both define [Project](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/types/index.ts#1-56), [Certificate](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/types/index.ts#97-117), [Skill](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/shared/lib/dataManager.ts#77-87), etc. with slightly different shapes (e.g. `metrics.lighthouseScore` has 3 vs 4 fields). This creates subtle runtime and TypeScript errors.

---

## 🟠 High Priority Issues

### 6. Hooks bypass TanStack Query entirely
**File:** [frontend/src/shared/hooks/usePortfolioData.ts](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/shared/hooks/usePortfolioData.ts)

Every hook does manual `useState + useEffect` + `.then()` — no caching, no deduplication, no background refetch, no error state. TanStack Query `@tanstack/react-query` is already installed and `QueryClientProvider` is set up in [App.tsx](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/app/App.tsx). These hooks should use `useQuery`.

### 7. No [.env](file:///c:/Users/saadm/Downloads/Portfolio/backend/.env) file for the frontend
`VITE_API_URL` is referenced in [api-client.ts](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/shared/services/api-client.ts) but there's no `frontend/.env.example` file. New contributors/CI will hit the localhost fallback silently.

### 8. [vercel.json](file:///c:/Users/saadm/Downloads/Portfolio/vercel.json) routes the frontend last but uses `@vercel/static-build` incorrectly for a Vite monorepo
The `distDir` in builds points to `dist` relative to the frontend package, but Vercel's `@vercel/static-build` needs explicit `outputDirectory`. This caused previous build failures.

### 9. No error boundaries on the frontend
If any API call throws, the entire page tree crashes with a blank screen. React Error Boundaries are completely absent.

### 10. No loading skeletons for async data
The hooks set `loading = true` but most page components don't render anything meaningful while loading — just an empty container — causing layout shift.

---

## 🟡 Medium Priority

### 11. [index.css](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/app/index.css) overrides `bg-white` globally with `!important`
```css
.bg-white { background-color: hsl(var(--card)) !important; }
```
This patches any third-party component that uses `bg-white` to use the card token — a side-effect-heavy global override that will cause confusion.

### 12. Backend has two contact-form controllers that conflict
[publicController.ts](file:///c:/Users/saadm/Downloads/Portfolio/backend/src/controllers/publicController.ts) (registered on `/api`) and [CommonController.ts](file:///c:/Users/saadm/Downloads/Portfolio/backend/src/controllers/CommonController.ts) (also registered on `/api`) both implement [submitContactForm](file:///c:/Users/saadm/Downloads/Portfolio/backend/src/controllers/publicController.ts#130-186). Only one is actually wired to a route — but the duplication signals code ownership confusion.

### 13. `ProjectSchema` in backend doesn't match frontend [Project](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/types/index.ts#1-56) type
Backend schema has `tech_stack` (object with frontend/backend/etc arrays), frontend type has `techStack: string[]`. Mapping is done ad-hoc in `DataManager.getProjects()` — fragile.

### 14. [certificates.json](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/data/certificates.json) is 120KB baked into the frontend bundle
All certificate data (120 KB) is currently in [frontend/src/data/certificates.json](file:///c:/Users/saadm/Downloads/Portfolio/frontend/src/data/certificates.json). It is supposed to be served by the backend but appears to also exist as a local file — a data migration that may be incomplete.

### 15. No CORS allowlist — currently locked to a single origin
`FRONTEND_URL` defaults to `http://localhost:8080` but the [.env.example](file:///c:/Users/saadm/Downloads/Portfolio/backend/.env.example) says `http://localhost:5173`. Vite defaults to 5173; the server defaults to 8080. CORS will silently fail in certain dev setups.

---

## 🟢 Low Priority / Polish

- No `robots.txt` or `sitemap.xml` in `frontend/public/`
- `lovable-tagger` is a dev dependency from a scaffolding tool and should be removed for production
- Backend `tsconfig.json` should enable `strict: true` and `noUncheckedIndexedAccess`
- Frontend `eslint.config.js` doesn't enable `react-compiler` lint rules
- `bun.lockb` exists at root but the project uses `npm` — conflicting lockfiles

---

## 📐 Implementation Plan (Phased)

---

### Phase 0 — Quick Wins (1–2 hours)

> Fix the bugs that break the live site right now.

| # | Task | File(s) |
|---|---|---|
| 0.1 | **Fix `ProjectDetailPage`** — convert sync calls to `await` inside a `useEffect` or convert to TanStack `useQuery` | `pages/ProjectDetailPage.tsx` |
| 0.2 | **Fix hardcoded localhost** in `dataManager.getHosting()` — replace `fetch(...)` with `apiClient.get('/hosting')` | `shared/lib/dataManager.ts` |
| 0.3 | **Remove `|| 'adminpassword'` fallback** — throw an error if `ADMIN_SECRET` is not set | `backend/src/middleware/auth.ts` |
| 0.4 | **Add `frontend/.env.example`** with `VITE_API_URL=http://localhost:3001/api` | `frontend/.env.example` (new) |
| 0.5 | **Fix CORS `FRONTEND_URL` default** — unify to `http://localhost:5173` in both `server.ts` and `.env.example` | `backend/src/server.ts`, `.env.example` |
| 0.6 | **Delete `publicController.ts`** — it is a legacy file superseded by `BlogController`, `ProjectController`, `CommonController` | `backend/src/controllers/publicController.ts` |

---

### Phase 1 — Type Safety & Data Consistency (half day)

> One source of truth for all types.

| # | Task | Detail |
|---|---|---|
| 1.1 | **Create a shared types package** | Add `packages/shared/types.ts` (or `shared/src/types.ts`) exported from a new workspace. Both frontend and backend import from it. Eliminates duplicate `Project`, `Blog`, `Certificate` interfaces. |
| 1.2 | **Consolidate frontend types** | Delete `frontend/src/types/index.ts` and update all imports to use the types re-exported from `dataManager.ts` (or the new shared package). |
| 1.3 | **Align backend `ProjectSchema` with frontend `Project`** | Change `tech_stack` → `techStack: z.array(z.string())` in the schema. Update the Firestore documents to match. Remove the ad-hoc mapping in `DataManager.getProjects()`. |
| 1.4 | **Enable TypeScript strict mode** | Add `"strict": true` to both `tsconfig.json` files. Fix all resulting type errors. |

---

### Phase 2 — React Data Layer (half day)

> Replace manual `useState/useEffect` with proper TanStack Query hooks.

**Pattern to apply across all hooks in `usePortfolioData.ts`:**

```ts
// ❌ Before
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    dataManager.getProjects().then(setProjects).finally(() => setLoading(false));
  }, []);
  return { projects, loading };
};

// ✅ After
import { useQuery } from '@tanstack/react-query';
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => dataManager.getProjects(),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
};
// Usage: const { data: projects = [], isLoading, error } = useProjects();
```

| # | Task |
|---|---|
| 2.1 | Refactor all 12 hooks in `usePortfolioData.ts` to `useQuery` |
| 2.2 | Fix `ProjectDetailPage` to use `useQuery` with `queryKey: ['project', slug]` |
| 2.3 | Add a global `QueryClient` default with `retry: 1` and `staleTime: 5 * 60 * 1000` |
| 2.4 | Add `Suspense` + Error Boundary wrappers at the page level |

---

### Phase 3 — Error Handling & UX (half day)

| # | Task | Detail |
|---|---|---|
| 3.1 | **Add a global Error Boundary** | Create `frontend/src/components/ErrorBoundary.tsx`. Wrap the `<Routes>` tree. Show a friendly fallback UI instead of a blank page. |
| 3.2 | **Add Skeleton loading states** | For each major data-driven section (projects, blogs, certifications), show `<Skeleton>` cards (shadcn Skeleton is already installed) during `isLoading`. |
| 3.3 | **Toast on API error** | In the `apiClient` response interceptor, call `toast.error(message)` using the already-configured `sonner`. |
| 3.4 | **Improve `errorHandler.ts`** | Add `statusCode` to a custom `AppError` class. Use it in controllers instead of raw `res.status(500)`. |

---

### Phase 4 — Security Hardening (half day)

| # | Task | Detail |
|---|---|---|
| 4.1 | **Replace static admin token with Firebase Auth** | Use `firebase-admin` to verify a Firebase ID token in `adminAuth` middleware. CLI signs in with Google; token passed as `Authorization: Bearer <firebase-id-token>`. |
| 4.2 | **Add input sanitisation** | Install `dompurify` (FE) and `sanitize-html` (BE) for any user-generated content. |
| 4.3 | **Tighten rate limits** | Apply a stricter `rateLimit` (5 req/min) specifically to `POST /api/contact` to prevent spam. |
| 4.4 | **Add `X-Content-Type-Options`, `X-Frame-Options` headers** | Already covered by `helmet()` — confirm it's not overridden anywhere. |
| 4.5 | **Validate `ADMIN_SECRET` at startup** | In `server.ts`, check all required env variables exist before starting. Exit early with a clear message if not. |

```ts
// backend/src/server.ts — startup validation
const REQUIRED_ENV = ['FIREBASE_PROJECT_ID', 'ADMIN_SECRET', 'SENDGRID_API_KEY'];
REQUIRED_ENV.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});
```

---

### Phase 5 — Backend Completeness (1 day)

| # | Task | Detail |
|---|---|---|
| 5.1 | **Wire up SendGrid in `CommonController`** | Copy the working `sendContactEmail` call from `publicController` into `CommonController.submitContactForm`. Add `ContactMessageModel.markAsSent`. |
| 5.2 | **Implement admin CRUD routes** | Replace stub comments in `admin.ts` with real create/update/delete controllers for projects and blog posts. |
| 5.3 | **Add missing public routes** | `newsletters`, `events`, `hosting` endpoints are fetched by the frontend but not defined in `backend/src/routes/public.ts`. Add them. |
| 5.4 | **Add `OtherRepositories` for events/newsletters** | `OtherRepositories.ts` exists — wire it into controllers and routes. |
| 5.5 | **Pagination on list endpoints** | `GET /api/projects` currently returns all documents. Add `?page=1&limit=10` query param support in `BaseRepository`. |

---

### Phase 6 — Performance & Build Optimisation (half day)

| # | Task | Detail |
|---|---|---|
| 6.1 | **Code-split routes** | Use `React.lazy + Suspense` for page-level components in `App.tsx`. This will dramatically reduce the initial JS bundle from a single 500KB+ chunk. |
| 6.2 | **Move `certificates.json` (120KB) out of the bundle** | Serve it from the backend API. Remove the local JSON file from `frontend/src/data/`. |
| 6.3 | **Image optimisation** | Add `loading="lazy"` and proper `width`/`height` attributes to all `<img>` tags (especially in `ProjectDetailPage`). |
| 6.4 | **Remove `lovable-tagger` from `vite.config.ts`** | This scaffolding tool tag should not be production-shipped. Remove from `package.json` devDependencies too. |
| 6.5 | **Add Vite build analysis** | Add `rollup-plugin-visualizer` to see the bundle composition. |

```ts
// App.tsx — lazy loading example
const ProjectDetailPage = React.lazy(() => import('../pages/ProjectDetailPage'));
// Wrap routes in <Suspense fallback={<PageLoader />}>
```

---

### Phase 7 — Testing (1 day)

| # | Task | Tool |
|---|---|---|
| 7.1 | **Backend unit tests** | `vitest` or `jest` — test `BaseRepository`, `CommonController`, `schemas/index.ts` |
| 7.2 | **Frontend component tests** | `vitest` + `@testing-library/react` — test `HeroSection`, `ContactPage` form validation |
| 7.3 | **E2E smoke tests** | `Playwright` — test: home page loads, projects page lists items, contact form submits |
| 7.4 | **Add test scripts to `package.json`** | Root: `"test": "npm --prefix frontend run test && npm --prefix backend run test"` |

---

### Phase 8 — CI/CD & DevEx (half day)

| # | Task | Detail |
|---|---|---|
| 8.1 | **Add GitHub Actions workflow** | `.github/workflows/ci.yml` — on `push` to `main`: lint → type-check → test → build |
| 8.2 | **Add Vercel preview deployments** | The `vercel.json` already exists — just connect the GitHub repo to the Vercel project via their dashboard |
| 8.3 | **Fix `vercel.json`** | Use `outputDirectory: "frontend/dist"` and configure backend as a proper Vercel serverless function with correct handler format |
| 8.4 | **Add `.nvmrc`** | Root `.nvmrc` with `20` to pin Node version for all contributors |
| 8.5 | **Add Husky + lint-staged** | Pre-commit hook running ESLint + Prettier + `tsc --noEmit` |
| 8.6 | **Remove `bun.lockb`** | The project uses `npm`. Delete `bun.lockb` from the root. |

**GitHub Actions template:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

---

### Phase 9 — SEO & Accessibility (half day)

| # | Task | Detail |
|---|---|---|
| 9.1 | **Add `react-helmet-async`** | Set unique `<title>` and `<meta name="description">` on every page. Currently all pages share the same default from `index.html`. |
| 9.2 | **Add `sitemap.xml`** | Add `frontend/public/sitemap.xml` with all static routes. |
| 9.3 | **Add `robots.txt`** | `frontend/public/robots.txt` with `Allow: /` and a link to the sitemap. |
| 9.4 | **Audit `alt` texts** | Several images use `alt=""` or generic `alt="profile-photo"`. Use descriptive text. |
| 9.5 | **Keyboard navigation audit** | Ensure all interactive elements (social icon buttons, nav links) are reachable via Tab and have visible focus styles. |

---

## 📊 Priority Summary

```
🔴 Critical (do now):     Phase 0           — ~2 hours
🟠 High (this week):      Phase 1, 2, 3     — ~1.5 days
🟡 Medium (next sprint):  Phase 4, 5, 6     — ~2 days
🟢 Polish (ongoing):      Phase 7, 8, 9     — ~2 days
```

---

## 🗺️ Architecture Diagram (Current vs. Target)

### Current
```
Browser → Frontend (React/Vite)
             ↓ axios (apiClient)
          Backend (Express/TS)
             ↓ firebase-admin
          Firestore (Firebase)
```

### Target (after Phase 1 shared types + Phase 5 backend completeness)
```
Browser → Frontend (React/Vite + React.lazy + TanStack Query)
             ↓ axios (apiClient, typed with shared types)
          Backend (Express/TS + AppError class + validated env)
             ↓ firebase-admin (BaseRepository)
          Firestore (Firebase)
             ↓ (admin CRUD)
          Firebase Auth (admin identity)
             ↓
          SendGrid (email notifications)
```

---

> **Recommended starting point:** Fix Phase 0 immediately — especially the broken `ProjectDetailPage` — as it's causing a broken live experience right now. Then proceed in order.
