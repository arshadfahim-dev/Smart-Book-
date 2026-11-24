import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import Dashboard from './components/Dashboard';
import NotebookComponent from './components/Notebook';
import TasksComponent from './components/Tasks';
import HabitsComponent from './components/Habits';
import PomodoroComponent from './components/Pomodoro';
import PlannerComponent from './components/Planner';
import StudyTrackerComponent from './components/StudyTracker';
import AuthComponent from './components/Auth';

import { 
  Menu, Search, Flame, Home, Book, CheckSquare, Zap, 
  Clock, Calendar, Brain, ShieldCheck, MoreHorizontal, 
  X, Smartphone, Sun, Moon 
} from 'lucide-react';
import { useStore } from './store/useStore';
import { diffCalendarDays, formatLocalDate, parseLocalDate } from './utils/date';

export default function App() {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [streak, setStreak] = useState(1);

  // Command Palette keyboard shortcut
  useEffect(() => {
    const handleKeyBind = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyBind);
    return () => window.removeEventListener('keydown', handleKeyBind);
  }, []);

  // Streak tracking in local storage (DST-safe local calendar day calculation)
  useEffect(() => {
    const storedStreak = localStorage.getItem('zenith_streak');
    const lastActive = localStorage.getItem('zenith_last_active');
    const todayStr = formatLocalDate();

    if (storedStreak) {
      const currentStreakVal = parseInt(storedStreak, 10) || 1;
      if (lastActive) {
        const lastActiveDate = /^\d{4}-\d{2}-\d{2}$/.test(lastActive)
          ? parseLocalDate(lastActive)
          : new Date(lastActive);
        const todayDate = parseLocalDate(todayStr);
        const diffDays = Number.isNaN(lastActiveDate.getTime())
          ? 0
          : diffCalendarDays(lastActiveDate, todayDate);

        if (diffDays === 1) {
          const nextStreak = currentStreakVal + 1;
          setStreak(nextStreak);
          localStorage.setItem('zenith_streak', nextStreak.toString());
        } else if (diffDays > 1 || diffDays < 0) {
          setStreak(1);
          localStorage.setItem('zenith_streak', '1');
        } else {
          setStreak(currentStreakVal);
        }
      } else {
        setStreak(1);
        localStorage.setItem('zenith_streak', '1');
      }
    } else {
      setStreak(1);
      localStorage.setItem('zenith_streak', '1');
    }

    localStorage.setItem('zenith_last_active', todayStr);
  }, []);

  // Helper for view navigation
  const navigateTo = (view: string) => {
    setCurrentView(view);
    setSidebarOpen(false);
    setMoreMenuOpen(false);
  };

  // Render view router helper
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'notes':
        return <NotebookComponent />;
      case 'tasks':
        return <TasksComponent />;
      case 'habits':
        return <HabitsComponent />;
      case 'pomodoro':
        return <PomodoroComponent />;
      case 'planner':
        return <PlannerComponent />;
      case 'study':
        return <StudyTrackerComponent />;
      case 'auth':
        return <AuthComponent />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  const currentViewTitle = {
    dashboard: 'Dashboard',
    notes: 'Notebooks',
    tasks: 'Tasks & Todo',
    habits: 'Habit Streaks',
    pomodoro: 'Pomodoro Timer',
    planner: 'Calendar Planner',
    study: 'Study Tracker',
    auth: 'Auth & Backup',
  }[currentView] || 'Workspace';

  return (
    <div className={`flex h-screen overflow-hidden font-sans select-none ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-indigo-950'}`}>
      {/* Universal Search Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={navigateTo}
      />

      {/* Desktop Sidebar Layout */}
      <div className="hidden lg:block w-72 h-full shrink-0 z-30">
        <Sidebar
          currentView={currentView}
          onNavigate={navigateTo}
          onSearchClick={() => setIsCommandPaletteOpen(true)}
        />
      </div>

      {/* Mobile / Tablet Drawer Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed left-0 top-0 h-full w-72 max-w-[85vw] shadow-2xl z-50 lg:hidden ${
                theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-indigo-950'
              }`}
            >
              <Sidebar
                currentView={currentView}
                onNavigate={navigateTo}
                onSearchClick={() => setIsCommandPaletteOpen(true)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Android Mobile "More Tools" Bottom Sheet Drawer */}
      <AnimatePresence>
        {moreMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 shadow-2xl border-t ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 text-white' 
                  : 'bg-white border-indigo-100 text-indigo-950'
              }`}
            >
              <div className="w-12 h-1.5 bg-indigo-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-black uppercase tracking-wider">Android Suite Modules</h3>
                </div>
                <button
                  onClick={() => setMoreMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4">
                <button
                  onClick={() => navigateTo('pomodoro')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentView === 'pomodoro'
                      ? 'bg-pink-500 text-white border-pink-500 shadow-lg'
                      : theme === 'dark'
                        ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                        : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100/50'
                  }`}
                >
                  <Clock className="h-5 w-5 text-pink-400" />
                  <span className="text-xs font-bold">Pomodoro Timer</span>
                </button>

                <button
                  onClick={() => navigateTo('planner')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentView === 'planner'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                      : theme === 'dark'
                        ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                        : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100/50'
                  }`}
                >
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs font-bold">Calendar Planner</span>
                </button>

                <button
                  onClick={() => navigateTo('study')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentView === 'study'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                      : theme === 'dark'
                        ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                        : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100/50'
                  }`}
                >
                  <Brain className="h-5 w-5 text-orange-400" />
                  <span className="text-xs font-bold">Study Tracker</span>
                </button>

                <button
                  onClick={() => navigateTo('auth')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentView === 'auth'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                      : theme === 'dark'
                        ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                        : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100/50'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-bold">Auth & Backup</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Screen layout container */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
        theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50/80 text-indigo-950'
      }`}>
        {/* Top bar header */}
        <header className={`px-4 md:px-6 py-3 border-b flex items-center justify-between shrink-0 z-10 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-indigo-100'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-indigo-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-sm md:text-base font-black tracking-tight uppercase">
                {currentViewTitle}
              </h2>
            </div>
          </div>

          {/* Gamified counters & search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-xl text-pink-600 text-[11px] font-black uppercase tracking-wider">
              <Flame size={13} className="animate-pulse text-pink-500" />
              <span>{streak} Day Streak</span>
            </div>

            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100/80 transition-colors cursor-pointer"
              title="Global Search"
            >
              <Search size={16} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100/80 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} className="text-orange-400" /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Dynamic workspace renderer */}
        <main className="flex-1 overflow-hidden p-3 md:p-6 bg-radial from-transparent to-indigo-50/10 dark:to-slate-950/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Android Native-style Bottom Navigation Bar (Visible on mobile/tablet screens) */}
        <nav className={`lg:hidden border-t px-2 py-2 flex items-center justify-around shrink-0 z-30 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-indigo-100 text-indigo-950 shadow-lg'
        }`}>
          <button
            onClick={() => navigateTo('dashboard')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'dashboard' 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-slate-800' 
                : 'text-slate-400 hover:text-indigo-500'
            }`}
          >
            <Home size={18} />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button
            onClick={() => navigateTo('notes')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'notes' 
                ? 'text-pink-600 dark:text-pink-400 font-bold bg-pink-50 dark:bg-slate-800' 
                : 'text-slate-400 hover:text-pink-500'
            }`}
          >
            <Book size={18} />
            <span className="text-[10px] font-bold">Notes</span>
          </button>

          <button
            onClick={() => navigateTo('tasks')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'tasks' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-slate-800' 
                : 'text-slate-400 hover:text-emerald-500'
            }`}
          >
            <CheckSquare size={18} />
            <span className="text-[10px] font-bold">Tasks</span>
          </button>

          <button
            onClick={() => navigateTo('habits')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'habits' 
                ? 'text-orange-500 dark:text-orange-400 font-bold bg-orange-50 dark:bg-slate-800' 
                : 'text-slate-400 hover:text-orange-500'
            }`}
          >
            <Zap size={18} />
            <span className="text-[10px] font-bold">Habits</span>
          </button>

          <button
            onClick={() => setMoreMenuOpen(true)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              ['pomodoro', 'planner', 'study', 'auth'].includes(currentView)
                ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-slate-800'
                : 'text-slate-400 hover:text-indigo-500'
            }`}
          >
            <MoreHorizontal size={18} />
            <span className="text-[10px] font-bold">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
