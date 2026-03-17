# [Industry-Grade Project Restructuring Plan]

This plan outlines the steps to reorganize the codebase into a professional, scalable structure by separating the frontend, backend, and database layers into their own top-level directories.

## Phase 1: Planning
- [x] Define new directory structure.
- [ ] Create `restructuring_plan.md` (this document) and obtain user approval.

## Phase 2: Folder Restructuring
- [x] [MOVE] Move frontend-specific files (`src/`, `public/`, `index.html`, etc.) to `frontend/`.
- [x] [MOVE] Move backend-specific files and configuration to `backend/`.
- [x] [MOVE] Move database schemas and migrations to `database/`.
- [ ] [NEW] Create placeholders for Firebase rules and indexes in `database/firebase/`.

## Phase 3: Configuration Alignment
- [x] [MODIFY] Update root `package.json` to use workspaces.
- [x] [MODIFY] Update `frontend/vite.config.ts`, `frontend/tsconfig.json`, and `frontend/tailwind.config.ts`.
- [x] [MODIFY] Setup backend linting and professional configuration.
- [ ] [VERIFY] Ensure all relative paths in code (imports, assets) are updated.

## Phase 4: Final Verification
- [ ] [TEST] Run builds in both `frontend/` and `backend/`.
- [ ] [TEST] Run linting across the monorepo.
- [ ] [MANUAL] Verify Portfolio UI correctly fetches data from the Backend API.
- [ ] [MANUAL] Ensure all assets (images, icons) load correctly.
