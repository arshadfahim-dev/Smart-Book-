# How To Setup — Smart Book

This guide covers everything required to deploy **Smart Book** on either a **VPS (Ubuntu/Debian + Node.js + PostgreSQL + Nginx)** or via **Docker Compose**, initialize the database from scratch, configure your first admin account, customize branding, and verify environment variables.

---

## Prerequisites

- **Node.js** v20+ (v22 recommended) and **npm** v10+
- **PostgreSQL** v15+ (for persistent database storage using `database/schema.sql`)
- **Docker & Docker Compose v2** (if using the Docker setup target)

---

## Database Setup (From an Empty Database)

Smart Book ships with idempotent PostgreSQL DDL and sample seed files:

1. Create an empty database and user:
   ```sql
   CREATE USER smartbook WITH PASSWORD 'replace_with_strong_password';
   CREATE DATABASE smartbook OWNER smartbook;
   ```
2. Run the schema migration to create all tables, foreign keys, and indexes:
   ```bash
   psql "$DATABASE_URL" -f database/schema.sql
   ```
3. *(Optional)* Load sample demo records (notebooks, notes, tasks, habits, events, and study sessions):
   ```bash
   psql "$DATABASE_URL" -f database/seed.sql
   ```

---

## Target 1: VPS Deployment (Ubuntu / Debian)

1. **Install Node.js 22 & PostgreSQL**
   ```bash
   sudo apt update && sudo apt install -y curl postgresql postgresql-contrib nginx
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. **Clone & Install Pinned Dependencies**
   ```bash
   cd /opt/smart-book
   npm ci
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `NODE_ENV=production`, `PORT=3000`, `APP_URL`, `DATABASE_URL`, a 32+ character `SESSION_SECRET`, and your initial admin credentials (`ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`).

4. **Initialize Database Schema**
   ```bash
   psql "$DATABASE_URL" -f database/schema.sql
   ```

5. **Build & Start Production Server**
   ```bash
   npm run build
   npm start
   ```
   For process supervision, run under **PM2** (`pm2 start dist/server.cjs --name smart-book`) or a `systemd` unit, then proxy port `80/443` to `http://127.0.0.1:3000` with Nginx + Certbot SSL.

---

## Target 2: Docker Deployment

1. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   Update `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_INITIAL_PASSWORD` in `.env`.

2. **Launch App + PostgreSQL Containers**
   ```bash
   docker compose up -d --build
   ```
   This starts:
   - `db`: PostgreSQL 16 Alpine, automatically initializing `database/schema.sql` and `database/seed.sql` on first boot.
   - `app`: Multi-stage Node.js 22 production build listening on port `3000`.

3. **Verify Health**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Expected response: `{"status":"ok","app":"Smart Book Workspace","aiReady":false}`

---

## First Admin Login

1. Set both `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` in `.env` before starting the server.
2. Start the app (`npm run dev` or `npm start` or `docker compose up -d`).
3. Open **Auth & Backup** in the sidebar and sign in using the `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` values you configured.
4. Once signed in, the account receives the `admin` badge and unlocks the role-gated **Admin Overview** panel (`GET /api/admin/overview`).
5. For non-privileged demo exploration without setting admin credentials, click **Try Demo Workspace** on the Auth screen.

---

## Branding Changes

To rebrand Smart Book for your organization:

1. **App Name & Description**: Update `index.html` (`<title>`, `<meta name="description">`, `og:*` tags) and `metadata.json`.
2. **Sidebar Logo & Title**: Edit the brand badge and title in `src/components/Sidebar.tsx`.
3. **Hero Banner & Copy**: Update the welcome hero banner in `src/components/Dashboard.tsx`.
4. **Theme & Colors**: Customize Tailwind v4 tokens and font families in `src/index.css` (`@theme` block).
5. **PWA Theme Color**: Update `<meta name="theme-color" content="#4f46e5" />` in `index.html`.

---

## Environment Variable Reference

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | HTTP port bound by Express (`server.ts`) |
| `NODE_ENV` | Yes (prod) | `development` | Set to `production` to serve built `dist/` bundle |
| `APP_URL` | Yes | `http://localhost:3000` | Public canonical URL of the deployment |
| `DATABASE_URL` | Yes (DB) | — | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `SESSION_SECRET` | Yes (prod) | Random per boot | HMAC-SHA256 signing key for Bearer session tokens |
| `ADMIN_EMAIL` | Optional | — | Bootstraps initial admin user email on startup |
| `ADMIN_INITIAL_PASSWORD` | Optional | — | Bootstraps initial admin user credential on startup |
| `GEMINI_API_KEY` | Optional | — | Server-side key for optional `@google/genai` integrations |
