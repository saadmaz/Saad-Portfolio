# Saad Mazhar - Portfolio

[![CI](https://github.com/saadmaz/Saad-Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/saadmaz/Saad-Portfolio/actions/workflows/ci.yml)

Personal portfolio built with **React + TypeScript + Vite**, reading content from **Cloud Firestore**, deployed on **Vercel**.

Live: [saadmaz.com](https://saadmaz.com)

Content is edited in a separate admin app (`Saad-Portfolio-Admin`). This repository is the public, read-only site.

---

## Stack

| Layer         | Technology                                         |
| ------------- | -------------------------------------------------- |
| UI            | React 18, TypeScript (strict), Tailwind, shadcn/ui |
| Motion        | Framer Motion (`LazyMotion`)                       |
| Data          | TanStack Query v5 over the Firestore web SDK       |
| SEO           | react-helmet-async + build-time prerender/sitemap  |
| Contact form  | Vercel function → Firestore (Admin SDK) + SendGrid |
| Quality gates | ESLint (+ jsx-a11y), Vitest, Prettier, husky       |

## Architecture

```
browser ──read──▶ Firestore            (rules: public read, admin-only write)
browser ──POST──▶ /api/contact ──▶ Firestore contact_messages + SendGrid email
```

- **Reads** go straight from the browser to Firestore through one typed layer:
  `lib/firestore.ts` (helpers) → `services/*` (queries) → `hooks/*` (TanStack Query).
  Errors propagate to React Query (`isError`); nothing silently returns `[]`.
- **Writes** from the public site happen only through `api/contact.ts`, which
  validates input, rate-limits per IP, filters bots with a honeypot, and stores
  the message with the Admin SDK. Firestore rules deny client-side creates.

```
frontend/
├── api/contact.ts            # Vercel serverless function (+ contact.test.ts)
├── scripts/
│   ├── prerender.mjs         # Static HTML + sitemaps for crawlers (post-build)
│   └── check-csp.mjs         # Fails the build if an inline script isn't CSP-hashed
├── public/                   # Static assets, robots.txt, llms.txt
└── src/
    ├── app/                  # main.tsx, App.tsx (providers + routes), global CSS
    ├── components/
    │   ├── layout/           # Header, Footer, Layout
    │   ├── sections/         # Home-page sections (one folder each)
    │   ├── ui/               # shadcn/ui primitives actually in use
    │   └── …                 # blog/, education/, projects/, SEO, ErrorBoundary
    ├── hooks/                # useProjects, useBlog, useContent, useTheme, …
    ├── lib/                  # firebase, firestore helpers, queryKeys, seo-content, utils
    ├── pages/                # Lazy-loaded routes
    ├── services/             # Read-only Firestore queries + contact client
    └── types/                # Domain models
```

## Getting started

Requires Node.js 20+.

```bash
cd frontend
npm install                  # also installs the git pre-commit hook
cp .env.example .env         # fill in the VITE_FIREBASE_* values
npm run dev                  # http://localhost:8080
```

The contact form needs the serverless function; run `vercel dev` instead of
`npm run dev` to exercise it locally.

### Scripts (run in `frontend/`, or from the root via proxies)

| Script                  | What it does                                         |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Vite dev server                                      |
| `npm run build`         | Production build → prerender → CSP check             |
| `npm run typecheck`     | Strict `tsc` for app, API and tooling projects       |
| `npm run lint`          | ESLint, zero warnings allowed                        |
| `npm test`              | Vitest unit tests                                    |
| `npm run format`        | Prettier (also applied to staged files on commit)    |

CI (`.github/workflows/ci.yml`) runs typecheck → lint → test → build on every push and PR to `main`.

## Deployment

**Vercel project:** Root Directory `frontend`, Build Command `npm run build`, Output `dist`.
Routing, security headers and the CSP live in `frontend/vercel.json`.

Environment variables (Vercel dashboard): every key in `frontend/.env.example`.
The `FIREBASE_*` service-account values and `SENDGRID_API_KEY` are server-only -
never prefix them with `VITE_`.

**Firebase rules and indexes** are deployed separately:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

> Deploy the site **before** the rules whenever both change: the rules deny
> client-side contact writes, which older site builds relied on.

## Security notes

- Never commit `serviceAccountKey.json` or `.env` files (both are git-ignored).
- The CSP allows exactly one inline script (the gtag snippet in `index.html`) by
  SHA-256 hash. If you change it, `npm run build` fails and prints the new hash
  to paste into `frontend/vercel.json`.
