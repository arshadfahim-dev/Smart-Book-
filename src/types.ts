export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown supported
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  tags: string[];
  notebookId?: string;
}

export interface Notebook {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  position: number; // for drag and drop sorting
  createdAt: string;
}

export interface DailyGoal {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  history: string[]; // dates of completion YYYY-MM-DD
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  duration: number; // in minutes
  type: 'work' | 'short_break' | 'long_break';
  completedAt: string;
}

export interface PlannerEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  color: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood: 'radiant' | 'happy' | 'neutral' | 'tired' | 'stressed' | 'gloomy';
  gratitude: string[];
  createdAt: string;
}

export interface MoodRecord {
  id: string;
  date: string; // YYYY-MM-DD
  mood: 'radiant' | 'happy' | 'neutral' | 'tired' | 'stressed' | 'gloomy';
  note?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface StudySession {
  id: string;
  subject: string;
  duration: number; // in minutes
  focusScore: number; // 1-5
  date: string; // YYYY-MM-DD
  createdAt: string;
}
