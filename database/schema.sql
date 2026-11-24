-- Smart Book PostgreSQL Schema
-- Creates all tables, primary keys, foreign keys, check constraints, and indexes from an empty database.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users & Role-Based Access
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(120) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Notebooks (Folders)
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  icon VARCHAR(16) NOT NULL DEFAULT '📓',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Markdown Notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES notebooks(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Note',
  content TEXT NOT NULL DEFAULT '',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Todos & Prioritized Backlog
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  due_date DATE,
  priority VARCHAR(16) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category VARCHAR(64) NOT NULL DEFAULT 'Personal',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Daily Micro-Goals
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Habits & Completion Logs
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  frequency VARCHAR(16) NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_habit_completed_date UNIQUE (habit_id, completed_date)
);

-- 7. Pomodoro Sessions
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL CHECK (duration > 0),
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('work', 'short_break', 'long_break')),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Calendar Planner Events
CREATE TABLE IF NOT EXISTS planner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  color VARCHAR(24) NOT NULL DEFAULT 'indigo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Journals
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(24) NOT NULL CHECK (mood IN ('radiant', 'happy', 'neutral', 'tired', 'stressed', 'gloomy')),
  gratitude TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Mood Records
CREATE TABLE IF NOT EXISTS mood_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  mood VARCHAR(24) NOT NULL CHECK (mood IN ('radiant', 'happy', 'neutral', 'tired', 'stressed', 'gloomy')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_mood_date UNIQUE (user_id, record_date)
);

-- 11. Expenses & Income Ledger
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  category VARCHAR(80) NOT NULL,
  description VARCHAR(255) NOT NULL,
  expense_type VARCHAR(16) NOT NULL CHECK (expense_type IN ('expense', 'income')),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Study Tracker Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(160) NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0),
  focus_score SMALLINT NOT NULL CHECK (focus_score BETWEEN 1 AND 10),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Workspace Sync Snapshots
CREATE TABLE IF NOT EXISTS workspace_snapshots (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user-scoped queries and date lookups
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_notebook ON notes(user_id, notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(user_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_todos_user_position ON todos(user_id, position);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, goal_date);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_pomodoro_user_completed ON pomodoro_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_planner_user_date ON planner_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_journals_user_date ON journals(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_records_user_date ON mood_records(user_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, session_date DESC);

COMMIT;
