# Changelog

All notable changes to **Smart Book** are documented in this file.

## [1.0.2] - 2026-11-24

### Added
- Role-gated and user-scoped Express API routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/demo`, `/api/auth/me`, `/api/workspace`, `/api/admin/overview`) using scrypt password hashing and HMAC-SHA256 session tokens.
- Complete PostgreSQL database schema (`database/schema.sql`) and sample demo seed (`database/seed.sql`).
- Full documentation suite: `README.md`, `HowToSetup.md` (VPS & Docker targets), `LICENSE-NOTE.md`, `CLAUDE.md`, and `docs/` (`API.md`, `ERD.md`, `DEPLOYMENT.md`).
- Production `Dockerfile`, `docker-compose.yml`, and pinned `package-lock.json`.

### Fixed
- **Tasks (`Tasks.tsx`)**: Fixed reordering while filters are active so hidden backlog items are preserved instead of overwritten.
- **Notebooks (`Notebook.tsx`)**: Fixed auto-save firing unnecessarily on initial load/note switch, auto-selected newly created notes, and cleared toast timers cleanly.
- **Timezone Date Shifts (`Planner.tsx`, `Habits.tsx`, `Dashboard.tsx`, `Pomodoro.tsx`, `StudyTracker.tsx`, `App.tsx`)**: Replaced UTC `.toISOString().split('T')[0]` calls with local-timezone `formatLocalDate()` and DST-safe `diffCalendarDays()`.
- **Pomodoro (`Pomodoro.tsx`)**: Fixed stale closure over `subject` and `focusScore` when timer completes, added target focus slider, and replaced `NodeJS.Timeout` with `ReturnType<typeof setInterval>`.
- **Command Palette (`CommandPalette.tsx`)**: Added `Escape` key handler to close modal and fixed hover arrow `group` selector.
- **Auth & Backup (`Auth.tsx`)**: Replaced `window.alert` with inline error alerts, switched Base64 encoding to UTF-8 `TextEncoder`/`TextDecoder`, and added payload validation before restoring backups.

## [1.0.1] - 2026-07-26

### Added
- Netlify SPA redirect rules (`netlify.toml` and `public/_redirects`) for static deployment compatibility.
- Mobile-ready Android PWA bottom navigation drawer and responsive shell improvements.

## [1.0.0] - 2026-07-20

### Added
- Initial release of Smart Book productivity suite with Dashboard, Markdown Notebooks, Tasks & Todo, Habit Streaks, Pomodoro Timer, Calendar Planner, Study Tracker, Global Command Palette, and local Auth & Backup.
