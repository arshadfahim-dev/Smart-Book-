# CLAUDE.md — AI Coding Assistant Guide

This file provides architecture, file locations, conventions, and verification commands for **Smart Book**.

## Architecture Overview

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS v4 (`@tailwindcss/vite`)
- **State Management**: Zustand (`src/store/useStore.ts`) with `localStorage` persistence (`zenith-productivity-state`) + optional server workspace sync (`/api/workspace`)
- **Backend**: Node.js + Express (`server.ts`)
  - Serves Vite middleware in `development` and static `dist/` in `production`
  - Provides scrypt-hashed auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/demo`, `/api/auth/me`), user-scoped workspace sync (`/api/workspace`), and role-gated admin metrics (`/api/admin/overview`)
- **Database**: PostgreSQL schema in `database/schema.sql` and demo seed in `database/seed.sql`

## Key File Locations

- `server.ts` — Express server, auth/session middleware, API endpoints, Vite/static serving
- `src/App.tsx` — Root shell, view router, responsive sidebar + mobile bottom bar, streak tracker
- `src/types.ts` — Shared TypeScript interfaces (`UserProfile`, `Note`, `Notebook`, `Todo`, `Habit`, `StudySession`, etc.)
- `src/store/useStore.ts` — Zustand store and all state mutations
- `src/utils/date.ts` — Local-timezone `YYYY-MM-DD` helpers (`formatLocalDate`, `parseLocalDate`, `diffCalendarDays`)
- `src/components/` — Feature modules (`Dashboard.tsx`, `Notebook.tsx`, `Tasks.tsx`, `Habits.tsx`, `Pomodoro.tsx`, `Planner.tsx`, `StudyTracker.tsx`, `Auth.tsx`, `CommandPalette.tsx`, `Sidebar.tsx`)
- `database/schema.sql` — PostgreSQL DDL from empty database
- `database/seed.sql` — Demo workspace sample records

## Conventions

- Always format calendar/log dates with `formatLocalDate()` from `src/utils/date.ts` rather than `.toISOString().split('T')[0]` to avoid UTC day-shift bugs.
- Never hardcode secrets, passwords, or API keys in source files; read runtime secrets from `process.env`.
- Keep all UI feedback inline (no `window.alert` or `window.open`).
- Use standard Tailwind v4 color tokens (e.g. `slate-800`, `slate-900`, `indigo-600`).

## Verification Commands

```bash
npm run lint    # TypeScript typecheck (tsc --noEmit)
npm run build   # Production Vite client build + esbuild server bundle (dist/server.cjs)
npm run dev     # Start Express + Vite dev server on port 3000
npm start       # Run production server from dist/server.cjs
```
