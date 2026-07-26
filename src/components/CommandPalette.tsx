import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, CheckSquare, Calendar, ArrowRight, X } from 'lucide-react';
import { useStore } from '../store/useStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const notes = useStore((state) => state.notes);
  const todos = useStore((state) => state.todos);
  const events = useStore((state) => state.events);
  const theme = useStore((state) => state.theme);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  const filteredNotes = query
    ? notes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredTodos = query
    ? todos.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredEvents = query
    ? events.filter((e) => e.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const commands = [
    { name: 'Go to Dashboard', view: 'dashboard', category: 'Navigation' },
    { name: 'Open Notebook', view: 'notes', category: 'Navigation' },
    { name: 'View Tasks & Todo', view: 'tasks', category: 'Navigation' },
    { name: 'Habit Tracker', view: 'habits', category: 'Navigation' },
    { name: 'Calendar Planner', view: 'planner', category: 'Navigation' },
    { name: 'Pomodoro Focus Timer', view: 'pomodoro', category: 'Navigation' },
    { name: 'Study Tracker Log', view: 'study', category: 'Navigation' },
    { name: 'Auth & Backup', view: 'auth', category: 'Navigation' },
  ].filter((c) => !query || c.name.toLowerCase().includes(query.toLowerCase()));

  const hasResults = query && (
    filteredNotes.length > 0 ||
    filteredTodos.length > 0 ||
    filteredEvents.length > 0 ||
    commands.length > 0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`relative w-full max-w-2xl overflow-hidden rounded-2xl border ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' 
                : 'bg-white border-indigo-100 text-indigo-950 shadow-2xl shadow-indigo-100/40'
            }`}
          >
            {/* Search Input block */}
            <div className={`flex items-center gap-3 px-4 py-4 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-indigo-50'}`}>
              <Search className="h-5 w-5 text-indigo-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search notes, tasks, events, or navigation commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-indigo-300"
              />
              <button 
                onClick={onClose} 
                className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-indigo-50'} text-indigo-400`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results body */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-100">
              {/* Commands Section */}
              {commands.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-2 mb-1">Commands</div>
                  {commands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(cmd.view);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        theme === 'dark' ? 'hover:bg-slate-800/60' : 'hover:bg-indigo-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Command className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{cmd.name}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-indigo-500" />
                    </button>
                  ))}
                </div>
              )}

              {/* Notes Section */}
              {filteredNotes.length > 0 && (
                <div className="space-y-1 pt-2">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-2 mb-1">Notes</div>
                  {filteredNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        onNavigate('notes');
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        theme === 'dark' ? 'hover:bg-slate-800/60' : 'hover:bg-indigo-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm">📝</span>
                        <span className="truncate">{note.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Todos Section */}
              {filteredTodos.length > 0 && (
                <div className="space-y-1 pt-2">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-2 mb-1">Todos</div>
                  {filteredTodos.map((todo) => (
                    <button
                      key={todo.id}
                      onClick={() => {
                        onNavigate('tasks');
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        theme === 'dark' ? 'hover:bg-slate-800/60' : 'hover:bg-indigo-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                        <span className={`truncate ${todo.completed ? 'line-through text-indigo-300' : ''}`}>
                          {todo.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Calendar Events Section */}
              {filteredEvents.length > 0 && (
                <div className="space-y-1 pt-2">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-2 mb-1">Calendar Events</div>
                  {filteredEvents.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        onNavigate('planner');
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        theme === 'dark' ? 'hover:bg-slate-800/60' : 'hover:bg-indigo-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="truncate">{ev.title}</span>
                        <span className="text-[10px] text-indigo-300 font-mono">({ev.date})</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query && !hasResults && (
                <div className="text-center py-8 text-indigo-300/80 font-sans text-xs font-semibold">
                  No matching items found for "{query}"
                </div>
              )}

              {!query && (
                <div className="text-center py-6 text-indigo-400/80 font-sans text-xs font-semibold">
                  Type a search keyword to search workspace items
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`flex justify-between items-center px-4 py-2 text-[10px] font-mono text-indigo-400 border-t ${
              theme === 'dark' ? 'border-slate-800 bg-slate-950/20' : 'border-indigo-50 bg-indigo-50/30'
            }`}>
              <span>Use Search to query workspace items</span>
              <div className="flex gap-2">
                <kbd className="bg-indigo-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-bold">ESC</kbd> to close
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
