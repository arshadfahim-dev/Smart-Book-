# Smart Book

**Smart Book** is a full-stack, mobile-ready productivity workspace that unifies note-taking, task management, habit streak tracking, Pomodoro focus sessions, calendar planning, and study analytics into one fast, responsive interface.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Language** | TypeScript 5.8 (`tsconfig.json`), JavaScript (Node.js 22) |
| **Frontend Framework** | React 19, Vite 6, Tailwind CSS v4, Zustand 5, Recharts 3 |
| **Backend Framework** | Express 4 (`server.ts`) |
| **Database** | PostgreSQL 16 (`database/schema.sql`, `database/seed.sql`) |
| **Mobile Wrapper** | Capacitor 7 Android Shell (`mobile/`) |

---

## Who It Is For

- **Students & Researchers** tracking study hours, focus quality, and Markdown class notes.
- **Software Engineers & Makers** managing sprint backlogs, technical documentation, and deep-work Pomodoro blocks.
- **Solo Founders & Knowledge Workers** organizing daily micro-goals, recurring habits, and calendar milestones in one workspace.

---

## Differentiating Features (Implemented in Code)

1. **Split-Screen Markdown Notebooks (`src/components/Notebook.tsx`)**
   - Folder/notebook categorization, tag filtering, pinned notes, Write / Split / Preview editor modes, and dirty-checked auto-save.
2. **Filter-Safe Priority Task Backlog (`src/components/Tasks.tsx`)**
   - Multi-axis filtering by category, priority (`low`, `medium`, `high`), and live search with full-array position reordering.
3. **7-Day Visual Habit Streak Grid (`src/components/Habits.tsx`)**
   - Daily and weekly habit definitions with an interactive 7-day completion matrix and DST-safe local date tracking.
4. **Pomodoro-to-Study Auto-Logger (`src/components/Pomodoro.tsx` & `src/components/StudyTracker.tsx`)**
   - Animated SVG countdown ring that automatically logs completed work intervals into both Pomodoro history and Study Tracker subject analytics.
5. **Global Command Palette (`Ctrl+K` / `Cmd+K`) (`src/components/CommandPalette.tsx`)**
   - Instant cross-module search across notes, tasks, calendar events, and quick navigation commands.
6. **Role-Gated Auth, User-Scoped Cloud Sync & Portable Backups (`server.ts` & `src/components/Auth.tsx`)**
   - Scrypt password hashing, HMAC-SHA256 signed session tokens, role-gated `/api/admin/overview`, user-scoped `/api/workspace`, one-click Demo Workspace mode, and validated UTF-8 Base64 export/restore.

---

## Workspace Modules Overview

| Module | Route / View | Key Capabilities |
| --- | --- | --- |
| **Dashboard** | `dashboard` | KPI counters, today's micro-goals, quick habit check-ins, Recharts study bar chart |
| **Notebooks** | `notes` | Markdown editor + live preview, notebook folders, tags, pinning |
| **Tasks & Todo** | `tasks` | Priority badges, due dates, category filters, safe reordering |
| **Habit Streaks** | `habits` | Daily/weekly habits, 7-day completion grid, streak counter |
| **Pomodoro Timer** | `pomodoro` | 25/5/15 min intervals, target subject & focus score selector |
| **Calendar Planner** | `planner` | Interactive monthly grid, color-coded event scheduling |
| **Study Tracker** | `study` | Subject session logger, focus score 1–10 slider, session history |
| **Auth & Backup** | `auth` | Sign in/register, Demo Workspace, server sync, JSON Base64 backup/restore |

---

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000` in your browser. See [`HowToSetup.md`](./HowToSetup.md) for full VPS and Docker deployment instructions.

---

## Licence Note

Commercial and buyer usage terms are defined in [`LICENSE-NOTE.md`](./LICENSE-NOTE.md).
