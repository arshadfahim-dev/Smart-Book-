-- Smart Book Sample Seed Data
-- Loads demo user records, notebooks, notes, tasks, habits, events, and study logs.
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING).

BEGIN;

-- Demo Member Account (accessed in-app via "Try Demo Workspace" button)
INSERT INTO users (id, email, display_name, password_hash, role)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'demo@smartbook.local',
  'Demo Student',
  'demo-non-login-placeholder',
  'member'
)
ON CONFLICT (id) DO NOTHING;

-- Sample Notebooks
INSERT INTO notebooks (id, user_id, name, icon)
VALUES
  ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111111', 'Inbox', '📥'),
  ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111111', 'Work', '💼'),
  ('22222222-2222-4222-8222-222222222203', '11111111-1111-4111-8111-111111111111', 'Personal', '🌱')
ON CONFLICT (id) DO NOTHING;

-- Sample Notes
INSERT INTO notes (id, user_id, notebook_id, title, content, is_pinned, tags)
VALUES (
  '33333333-3333-4333-8333-333333333301',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222201',
  'Welcome to Smart Book',
  E'# Welcome to Smart Book!\n\nOrganize your Markdown notes, tasks, habits, Pomodoro blocks, and study analytics in one workspace.',
  TRUE,
  ARRAY['Guide', 'SmartBook']
)
ON CONFLICT (id) DO NOTHING;

-- Sample Tasks
INSERT INTO todos (id, user_id, title, completed, priority, category, position)
VALUES
  ('44444444-4444-4444-8444-444444444401', '11111111-1111-4111-8111-111111111111', 'Complete Python loops exercise', FALSE, 'high', 'Study', 0),
  ('44444444-4444-4444-8444-444444444402', '11111111-1111-4111-8111-111111111111', 'Plan weekly expense budget', TRUE, 'medium', 'Finance', 1),
  ('44444444-4444-4444-8444-444444444403', '11111111-1111-4111-8111-111111111111', 'Read 15 pages of psychology book', FALSE, 'low', 'Reading', 2)
ON CONFLICT (id) DO NOTHING;

-- Sample Daily Goals
INSERT INTO daily_goals (id, user_id, title, completed, goal_date)
VALUES
  ('55555555-5555-4555-8555-555555555501', '11111111-1111-4111-8111-111111111111', 'Drink 3L of water', TRUE, CURRENT_DATE),
  ('55555555-5555-4555-8555-555555555502', '11111111-1111-4111-8111-111111111111', 'Complete 30 min workout', FALSE, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Sample Habits & Logs
INSERT INTO habits (id, user_id, name, frequency, streak)
VALUES
  ('66666666-6666-4666-8666-666666666601', '11111111-1111-4111-8111-111111111111', 'Code daily Python/React', 'daily', 4),
  ('66666666-6666-4666-8666-666666666602', '11111111-1111-4111-8111-111111111111', 'Strength Training', 'daily', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO habit_logs (habit_id, user_id, completed_date)
VALUES
  ('66666666-6666-4666-8666-666666666601', '11111111-1111-4111-8111-111111111111', CURRENT_DATE)
ON CONFLICT (habit_id, completed_date) DO NOTHING;

-- Sample Planner Events
INSERT INTO planner_events (id, user_id, title, description, event_date, start_time, end_time, color)
VALUES
  ('77777777-7777-4777-8777-777777777701', '11111111-1111-4111-8111-111111111111', 'Productivity Review', 'Evaluate notebook organization & metrics', CURRENT_DATE, '11:00', '12:00', 'indigo'),
  ('77777777-7777-4777-8777-777777777702', '11111111-1111-4111-8111-111111111111', 'Team Sync-Up Session', 'Design alignment and review', CURRENT_DATE, '15:30', '16:30', 'pink')
ON CONFLICT (id) DO NOTHING;

-- Sample Study Sessions
INSERT INTO study_sessions (id, user_id, subject, duration, focus_score, session_date)
VALUES
  ('88888888-8888-4888-8888-888888888801', '11111111-1111-4111-8111-111111111111', 'Python Algorithms', 50, 9, CURRENT_DATE),
  ('88888888-8888-4888-8888-888888888802', '11111111-1111-4111-8111-111111111111', 'React Component Design', 25, 8, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

COMMIT;
