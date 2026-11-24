import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Note, Notebook, Todo, DailyGoal, Habit,
  PomodoroSession, PlannerEvent, JournalEntry,
  MoodRecord, Expense, StudySession, UserProfile
} from '../types';
import { formatLocalDate } from '../utils/date';

interface ProductivityState {
  // Auth State
  user: UserProfile | null;
  authToken: string | null;
  setUser: (user: UserProfile | null) => void;
  setAuthToken: (token: string | null) => void;

  // App Settings
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Notes
  notes: Note[];
  notebooks: Notebook[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addNotebook: (notebook: Omit<Notebook, 'id' | 'createdAt'>) => void;
  deleteNotebook: (id: string) => void;

  // Todos & Drag-and-Drop
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'completed' | 'createdAt' | 'position'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (orderedTodos: Todo[]) => void;

  // Daily Goals
  dailyGoals: DailyGoal[];
  addDailyGoal: (title: string, date: string) => void;
  toggleDailyGoal: (id: string) => void;
  deleteDailyGoal: (id: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (name: string, frequency: 'daily' | 'weekly') => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;

  // Pomodoro Timer History
  pomodoroHistory: PomodoroSession[];
  logPomodoro: (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => void;

  // Planner Calendar Events
  events: PlannerEvent[];
  addEvent: (event: Omit<PlannerEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, updates: Partial<PlannerEvent>) => void;
  deleteEvent: (id: string) => void;

  // Journal (Notion-style structured logs)
  journals: JournalEntry[];
  addJournal: (journal: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  updateJournal: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournal: (id: string) => void;

  // Mood Tracker Records
  moods: MoodRecord[];
  addMood: (mood: MoodRecord['mood'], note?: string, date?: string) => void;
  deleteMood: (id: string) => void;

  // Expenses & Finance
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;

  // Study Tracker & Pomodoro focus
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  deleteStudySession: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useStore = create<ProductivityState>()(
  persist(
    (set, get) => ({
      user: null,
      authToken: null,
      setUser: (user) => set({ user }),
      setAuthToken: (authToken) => set({ authToken }),

      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Notes & Notebooks
      notes: [
        {
          id: 'welcome-note',
          title: 'Welcome to your Zenith Productivity Suite 🚀',
          content: `# Welcome to Zenith!

Zenith is your beautiful, full-stack, Notion-inspired playground designed to synthesize your daily workflows, finances, habit formations, and mental health journals.

### Features Included:
- **Rich Markdown Notebooks**
- **Kanban-Style Drag & Drop Tasks**
- **Structured Daily Habits & Goals**
- **Deep Focus Pomodoro and Study logging**
- **Relational Finance Dashboard**
- **Mood Trends & Real-time Charts**
- **Command Palette (Ctrl + K or click Search)**

Try editing this note, creating new notebooks, or setting a daily goal!`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: true,
          tags: ['Guide', 'Zenith'],
          notebookId: 'inbox-notebook'
        }
      ],
      notebooks: [
        { id: 'inbox-notebook', name: 'Inbox', icon: '📥', createdAt: new Date().toISOString() },
        { id: 'work-notebook', name: 'Work', icon: '💼', createdAt: new Date().toISOString() },
        { id: 'personal-notebook', name: 'Personal', icon: '🌱', createdAt: new Date().toISOString() }
      ],
      addNote: (note) => {
        const id = generateId();
        const newNote: Note = {
          ...note,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return id;
      },
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) => 
          n.id === id 
            ? { ...n, ...updates, updatedAt: new Date().toISOString() } 
            : n
        )
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id)
      })),
      addNotebook: (notebook) => set((state) => ({
        notebooks: [...state.notebooks, { ...notebook, id: generateId(), createdAt: new Date().toISOString() }]
      })),
      deleteNotebook: (id) => set((state) => ({
        notebooks: state.notebooks.filter((n) => n.id !== id),
        notes: state.notes.map((n) => n.notebookId === id ? { ...n, notebookId: undefined } : n)
      })),

      // Todos
      todos: [
        { id: 'todo-1', title: 'Complete Python loops exercise', completed: false, priority: 'high', category: 'Study', position: 0, createdAt: new Date().toISOString() },
        { id: 'todo-2', title: 'Plan weekly expense budget', completed: true, priority: 'medium', category: 'Finance', position: 1, createdAt: new Date().toISOString() },
        { id: 'todo-3', title: 'Read 15 pages of psychology book', completed: false, priority: 'low', category: 'Reading', position: 2, createdAt: new Date().toISOString() }
      ],
      addTodo: (todo) => set((state) => {
        const newTodo: Todo = {
          ...todo,
          id: generateId(),
          completed: false,
          position: state.todos.length,
          createdAt: new Date().toISOString()
        };
        return { todos: [...state.todos, newTodo] };
      }),
      updateTodo: (id, updates) => set((state) => ({
        todos: state.todos.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((t) => t.id !== id)
      })),
      reorderTodos: (orderedTodos) => set({ todos: orderedTodos }),

      // Daily Goals
      dailyGoals: [
        { id: 'goal-1', title: 'Drink 3L of water', completed: true, date: formatLocalDate() },
        { id: 'goal-2', title: 'Do 30 mins cardiovascular workout', completed: false, date: formatLocalDate() },
        { id: 'goal-3', title: 'Meditate before breakfast', completed: false, date: formatLocalDate() }
      ],
      addDailyGoal: (title, date) => set((state) => ({
        dailyGoals: [...state.dailyGoals, { id: generateId(), title, completed: false, date }]
      })),
      toggleDailyGoal: (id) => set((state) => ({
        dailyGoals: state.dailyGoals.map((g) => g.id === id ? { ...g, completed: !g.completed } : g)
      })),
      deleteDailyGoal: (id) => set((state) => ({
        dailyGoals: state.dailyGoals.filter((g) => g.id !== id)
      })),

      // Habits
      habits: [
        { id: 'habit-1', name: 'Code daily Python/React', frequency: 'daily', streak: 4, history: [], createdAt: new Date().toISOString() },
        { id: 'habit-2', name: 'Hit the Gym / Lift Weights', frequency: 'daily', streak: 1, history: [], createdAt: new Date().toISOString() },
        { id: 'habit-3', name: 'Call family or long-distance friend', frequency: 'weekly', streak: 2, history: [], createdAt: new Date().toISOString() }
      ],
      addHabit: (name, frequency) => set((state) => ({
        habits: [...state.habits, { id: generateId(), name, frequency, streak: 0, history: [], createdAt: new Date().toISOString() }]
      })),
      toggleHabit: (id, date) => set((state) => ({
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const exists = h.history.includes(date);
          const history = exists 
            ? h.history.filter((d) => d !== date) 
            : [...h.history, date];
          
          // Calculate streak purely based on consecutive days
          const streak = exists ? Math.max(0, h.streak - 1) : h.streak + 1;
          return { ...h, history, streak };
        })
      })),
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id)
      })),

      // Pomodoro History
      pomodoroHistory: [
        { id: 'pomo-1', duration: 25, type: 'work', completedAt: new Date(Date.now() - 3 * 3600000).toISOString() },
        { id: 'pomo-2', duration: 25, type: 'work', completedAt: new Date(Date.now() - 2 * 3600000).toISOString() }
      ],
      logPomodoro: (session) => set((state) => ({
        pomodoroHistory: [...state.pomodoroHistory, { ...session, id: generateId(), completedAt: new Date().toISOString() }]
      })),

      // Calendar Events
      events: [
        { id: 'ev-1', title: 'Productivity Review', description: 'Evaluate notebook organization & metrics', date: formatLocalDate(), startTime: '11:00', endTime: '12:00', color: 'indigo', createdAt: new Date().toISOString() },
        { id: 'ev-2', title: 'Team Sync-Up Session', description: 'Design alignment and review', date: formatLocalDate(), startTime: '15:30', endTime: '16:30', color: 'pink', createdAt: new Date().toISOString() }
      ],
      addEvent: (event) => set((state) => ({
        events: [...state.events, { ...event, id: generateId(), createdAt: new Date().toISOString() }]
      })),
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map((e) => e.id === id ? { ...e, ...updates } : e)
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id)
      })),

      // Journals
      journals: [
        { id: 'j-1', date: formatLocalDate(), content: 'Today was highly productive. Managed to solve 3 core algorithms and build out the initial state layer. Feeling extremely positive.', mood: 'radiant', gratitude: ['Healthy breakfast', 'Fast coding flow', 'Good music tracks'], createdAt: new Date().toISOString() }
      ],
      addJournal: (journal) => set((state) => ({
        journals: [
          { ...journal, id: generateId(), createdAt: new Date().toISOString() },
          ...state.journals
        ]
      })),
      updateJournal: (id, updates) => set((state) => ({
        journals: state.journals.map((j) => j.id === id ? { ...j, ...updates } : j)
      })),
      deleteJournal: (id) => set((state) => ({
        journals: state.journals.filter((j) => j.id !== id)
      })),

      // Mood Trackers
      moods: [
        { id: 'm-1', date: formatLocalDate(new Date(Date.now() - 86400000)), mood: 'happy', note: 'Met an old friend for lunch!', createdAt: new Date().toISOString() },
        { id: 'm-2', date: formatLocalDate(), mood: 'radiant', note: 'App building is looking gorgeous.', createdAt: new Date().toISOString() }
      ],
      addMood: (mood, note, date) => set((state) => {
        const targetDate = date || formatLocalDate();
        // Remove existing for today
        const filtered = state.moods.filter((m) => m.date !== targetDate);
        return {
          moods: [...filtered, { id: generateId(), date: targetDate, mood, note, createdAt: new Date().toISOString() }]
        };
      }),
      deleteMood: (id) => set((state) => ({
        moods: state.moods.filter((m) => m.id !== id)
      })),

      // Finances
      expenses: [
        { id: 'exp-1', amount: 80, category: 'Food & Dining', description: 'Groceries at Whole Foods', type: 'expense', date: formatLocalDate(), createdAt: new Date().toISOString() },
        { id: 'exp-2', amount: 3500, category: 'Salary', description: 'Tech Contracting Invoice', type: 'income', date: formatLocalDate(), createdAt: new Date().toISOString() },
        { id: 'exp-3', amount: 120, category: 'Utilities', description: 'Gigabit Fiber Internet Subscription', type: 'expense', date: formatLocalDate(), createdAt: new Date().toISOString() }
      ],
      addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, { ...expense, id: generateId(), createdAt: new Date().toISOString() }]
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id)
      })),

      // Study Tracker
      studySessions: [
        { id: 's-1', subject: 'Python Algorithms', duration: 50, focusScore: 9, date: formatLocalDate(), createdAt: new Date().toISOString() },
        { id: 's-2', subject: 'React Component Design', duration: 25, focusScore: 8, date: formatLocalDate(), createdAt: new Date().toISOString() }
      ],
      addStudySession: (session) => set((state) => ({
        studySessions: [...state.studySessions, { ...session, id: generateId(), createdAt: new Date().toISOString() }]
      })),
      deleteStudySession: (id) => set((state) => ({
        studySessions: state.studySessions.filter((s) => s.id !== id)
      }))
    }),
    {
      name: 'zenith-productivity-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
