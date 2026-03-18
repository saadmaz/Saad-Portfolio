# 🗂️ Portfolio Monorepo

A modern, professional portfolio built with a React/Vite frontend and a Node.js/Express backend powered by Firebase Firestore.

## 🚀 Features

- **Monorepo Architecture**: Clean separation between frontend client and backend API.
- **Frontend**: React 18, TypeScript, TailwindCSS, Framer Motion, and TanStack Query (React Query) for smart caching.
- **Backend**: Node.js, Express, TypeScript, Zod validation, and Firebase Admin.
- **Database**: Firebase Firestore with a robust `BaseRepository` caching layer.
- **Zero-Downtime Data**: Frontend elegantly falls back to local static JSON files if the backend goes down.
- **Performance**: Code splitting via React `lazy()` and aggressive memory caching on the API.

## 🏗️ Architecture

```text
Portfolio/
├── package.json           # Root workspace config & concurrently scripts
├── frontend/              # React + Vite Client
│   ├── src/
│   │   ├── app/           # React bootstrap & QueryClient setup
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Lazy-loaded route components
│   │   └── shared/        # Hooks (TanStack Query) & generic API clients
│   └── .env.example
└── backend/               # Node + Express API
    ├── src/
    │   ├── server.ts      # Express bootstrap & rate-limiting
    │   ├── controllers/   # Request handling logic
    │   ├── models/        # Firestore Repositories with TTL Caching
    │   ├── schemas/       # Zod validation schemas
    │   └── routes/        # Public & Admin Express routers
    └── .env.example
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v20+ recommended
- **Firebase**: A Firebase project with Firestore enabled

### 1. Installation

Install dependencies for the root, frontend, and backend simultaneously:

```bash
cd Portfolio
npm install
```

### 2. Environment Variables

**Backend (`backend/.env`):**
Copy `backend/.env.example` to `backend/.env` and fill in your Firebase credentials.

```env
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
# (Optional) Admin authentication
ADMIN_SECRET=your-secure-password
```

**Frontend (`frontend/.env`):**
Copy `frontend/.env.example` to `frontend/.env`.

```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Local Development

Run both the frontend and backend concurrently from the root directory:

```bash
npm run dev
```

- **Frontend**: <http://localhost:5173>
- **Backend API**: <http://localhost:3001/health>

## 📦 Deployment

### Frontend (Vercel)

The frontend is optimized for zero-config Vercel deployment. Ensure the Build Command is `npm run build` and the output directory is `dist`. Set the `VITE_API_URL` environment variable to your production backend URL.

### Backend (Render / Railway / Vercel API)

The backend compiles to raw JavaScript (`npm run build`). It can be hosted on any Node.js provider. Ensure you set all required production environment variables.

## 🧪 CI/CD

This repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically runs linting, backend type-checking, and frontend builds on every Push and Pull Request to the `main` branch.
