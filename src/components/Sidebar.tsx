import React from 'react';
import { 
  Home, Book, CheckSquare, Zap, Clock, Calendar, 
  Brain, ShieldCheck, Search, Sun, Moon, Smartphone 
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onSearchClick: () => void;
}

export default function Sidebar({
  currentView,
  onNavigate,
  onSearchClick,
}: SidebarProps) {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const user = useStore((state) => state.user);

  const navItems = [
    { view: 'dashboard', name: 'Dashboard', icon: Home, color: 'text-indigo-500' },
    { view: 'notes', name: 'Notebooks', icon: Book, color: 'text-pink-500' },
    { view: 'tasks', name: 'Tasks & Todo', icon: CheckSquare, color: 'text-emerald-500' },
    { view: 'habits', name: 'Habit Streaks', icon: Zap, color: 'text-orange-400' },
    { view: 'pomodoro', name: 'Pomodoro Timer', icon: Clock, color: 'text-pink-500' },
    { view: 'planner', name: 'Calendar Planner', icon: Calendar, color: 'text-indigo-500' },
    { view: 'study', name: 'Study Tracker', icon: Brain, color: 'text-orange-400' },
    { view: 'auth', name: 'Auth & Backup', icon: ShieldCheck, color: 'text-indigo-500' },
  ];

  return (
    <div className={`flex flex-col h-full select-none border-r ${
      theme === 'dark' 
        ? 'bg-slate-900 border-slate-800 text-white' 
        : 'bg-white border-indigo-100 text-indigo-950 shadow-sm shadow-indigo-100/10'
    }`}>
      {/* Brand Header */}
      <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-800' : 'border-indigo-50'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            S
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none">Smart Book</h1>
            <span className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase font-mono mt-1 block">
              {user ? `Active: ${user.displayName || 'User'}` : 'Mobile Workspace'}
            </span>
          </div>
        </div>

        {/* Global theme toggle & Search button */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onSearchClick}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-800 text-indigo-300' : 'hover:bg-indigo-50 text-indigo-600'}`}
            title="Search (Ctrl + K)"
          >
            <Search className="h-4 w-4" />
          </button>
          <button 
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-800 text-indigo-300' : 'hover:bg-indigo-50 text-indigo-600'}`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-orange-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
        <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400/80">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : theme === 'dark'
                    ? 'hover:bg-slate-800 text-indigo-200'
                    : 'hover:bg-indigo-50 text-indigo-600'
              }`}
            >
              <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Android PWA Footer Banner */}
      <div className={`p-3 m-2.5 rounded-2xl border text-center ${
        theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-indigo-50/50 border-indigo-100'
      }`}>
        <div className="flex items-center justify-center gap-1.5 text-xs font-black text-indigo-500 mb-0.5">
          <Smartphone size={14} />
          <span>Android App Ready</span>
        </div>
        <p className="text-[10px] text-indigo-400 font-medium">
          Optimized for Android touch gestures & PWA home screen.
        </p>
      </div>
    </div>
  );
}
