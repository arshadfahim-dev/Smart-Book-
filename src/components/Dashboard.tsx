import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Clock, Calendar, Award, Sparkles, Flame, Brain, Plus, CheckSquare, Zap, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function Dashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const theme = useStore((state) => state.theme);
  const notes = useStore((state) => state.notes);
  const todos = useStore((state) => state.todos);
  const dailyGoals = useStore((state) => state.dailyGoals);
  const addDailyGoal = useStore((state) => state.addDailyGoal);
  const toggleDailyGoal = useStore((state) => state.toggleDailyGoal);
  const deleteDailyGoal = useStore((state) => state.deleteDailyGoal);

  const habits = useStore((state) => state.habits);
  const toggleHabit = useStore((state) => state.toggleHabit);
  const studySessions = useStore((state) => state.studySessions);

  const [newGoalText, setNewGoalText] = useState('');

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const activeGoals = dailyGoals.filter((g) => g.date === todayStr);

  // Study Tracker Hours calculation
  const studySubjectMap: { [key: string]: number } = {};
  studySessions.forEach((s) => {
    studySubjectMap[s.subject] = (studySubjectMap[s.subject] || 0) + s.duration;
  });
  const studyChartData = Object.entries(studySubjectMap).map(([subject, duration]) => ({
    subject,
    minutes: duration,
  }));

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    addDailyGoal(newGoalText.trim(), todayStr);
    setNewGoalText('');
  };

  // Glassmorphic styling classes
  const cardClass = `backdrop-blur-md rounded-2xl border p-5 transition-all ${
    theme === 'dark' 
      ? 'bg-slate-900/75 border-slate-800 text-white shadow-xl shadow-slate-950/20' 
      : 'bg-white/75 border-indigo-100/80 text-indigo-950 shadow-xl shadow-indigo-100/10'
  }`;

  const completedTodosCount = todos.filter((t) => t.completed).length;
  const totalFocusMins = studySessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-6 overflow-y-auto h-full pr-1 pb-20 scrollbar-none">
      {/* Welcome Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-900/40 border border-slate-800'
            : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 border border-indigo-100/50 shadow-lg shadow-indigo-500/10'
        }`}
      >
        <div className="space-y-2 max-w-lg z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-white/20 text-white">
            <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            Smart Book Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Design your ideal day. Build lasting habits.
          </h1>
          <p className="text-xs text-indigo-50/90 font-medium leading-relaxed">
            Welcome back! You have completed {completedTodosCount} tasks, logged {habits.length} habits, and accumulated {totalFocusMins} focus minutes.
          </p>
        </div>
        <div className="flex gap-2 z-10">
          <button
            onClick={() => onNavigate('notes')}
            className="px-5 py-3 rounded-2xl bg-white text-indigo-600 font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen size={14} />
            <span>Notebooks</span>
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="px-5 py-3 rounded-2xl bg-indigo-950/40 text-white border border-white/20 font-bold text-xs uppercase tracking-wider hover:bg-indigo-900/60 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckSquare size={14} />
            <span>Tasks</span>
          </button>
        </div>
      </motion.div>

      {/* Grid of Key Performance Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cardClass}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Tasks Completed</span>
            <CheckSquare className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl md:text-2xl font-black tracking-tight">{completedTodosCount} / {todos.length}</div>
          <p className="text-[10px] font-bold text-indigo-400/80 mt-1 font-sans">Active task list</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardClass}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Focus Study</span>
            <Clock className="h-4 w-4 text-pink-500" />
          </div>
          <div className="text-xl md:text-2xl font-black tracking-tight">{totalFocusMins} Mins</div>
          <p className="text-[10px] font-bold text-indigo-400/80 mt-1">Across study sessions</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cardClass}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Daily Micro-Goals</span>
            <Award className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-xl md:text-2xl font-black tracking-tight">
            {activeGoals.filter(g => g.completed).length} / {activeGoals.length}
          </div>
          <p className="text-[10px] font-bold text-indigo-400/80 mt-1">Goals finished today</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cardClass}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">Active Notebooks</span>
            <BookOpen className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xl md:text-2xl font-black tracking-tight">{notes.length} Notes</div>
          <p className="text-[10px] font-bold text-indigo-400/80 mt-1">Markdown documentation</p>
        </motion.div>
      </div>

      {/* Two Columns Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daily Goals, Habits quick actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Daily Checklist */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-pink-500" />
                <h3 className="text-sm font-black tracking-tight uppercase">Daily Micro Goals</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-400">TODAY</span>
            </div>

            <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a new daily micro-goal..."
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                className={`flex-1 px-3 py-2 text-xs rounded-xl focus:outline-none border ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500' 
                    : 'bg-indigo-50/50 border-indigo-100 text-indigo-950 placeholder:text-indigo-300 focus:border-indigo-400'
                }`}
              />
              <button 
                type="submit"
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-100">
              {activeGoals.length === 0 ? (
                <div className="text-center py-8 text-xs font-semibold text-indigo-300/80">
                  No daily micro-goals set yet. Complete those wins!
                </div>
              ) : (
                activeGoals.map((g) => (
                  <div 
                    key={g.id} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      theme === 'dark' ? 'bg-slate-950/40 border-slate-800/80' : 'bg-indigo-50/30 border-indigo-100/50'
                    }`}
                  >
                    <button
                      onClick={() => toggleDailyGoal(g.id)}
                      className="flex items-center gap-2.5 text-left flex-1"
                    >
                      <span className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                        g.completed 
                          ? 'bg-pink-500 border-pink-500 text-white' 
                          : theme === 'dark' ? 'border-slate-700' : 'border-indigo-200'
                      }`}>
                        {g.completed && <span className="text-[10px]">✓</span>}
                      </span>
                      <span className={`text-xs font-semibold ${g.completed ? 'line-through text-indigo-300/80' : ''}`}>
                        {g.title}
                      </span>
                    </button>
                    <button 
                      onClick={() => deleteDailyGoal(g.id)}
                      className="text-pink-500 hover:text-pink-600 text-[10px] font-bold px-1"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Habit quick trigger */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-black tracking-tight uppercase">Habit Formation</h3>
              </div>
              <button 
                onClick={() => onNavigate('habits')}
                className="text-[10px] font-sans font-bold text-indigo-500 hover:text-indigo-700"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {habits.map((habit) => {
                const completedToday = habit.history.includes(todayStr);
                return (
                  <div 
                    key={habit.id} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      theme === 'dark' ? 'bg-slate-950/40 border-slate-800/80' : 'bg-indigo-50/30 border-indigo-100/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">{habit.name}</div>
                      <div className="text-[9px] font-mono text-indigo-400 font-bold uppercase mt-0.5">
                        🔥 {habit.streak} day streak ({habit.frequency})
                      </div>
                    </div>
                    <button
                      onClick={() => toggleHabit(habit.id, todayStr)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        completedToday 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                          : theme === 'dark' 
                            ? 'bg-slate-800 hover:bg-slate-700 text-indigo-200' 
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                      }`}
                    >
                      {completedToday ? 'Done' : 'Complete'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Study Tracker Chart & Quick Module Shortcuts */}
        <div className="lg:col-span-6 space-y-6">
          {/* Study Metrics / Chart */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-black tracking-tight uppercase">Study Session Logs</h3>
              </div>
              <button 
                onClick={() => onNavigate('study')}
                className="text-[10px] font-sans font-bold text-indigo-500 hover:text-indigo-700"
              >
                Add session
              </button>
            </div>

            <div className="h-52 w-full text-xs">
              {studyChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-indigo-300 font-semibold">
                  No study data logged. Run a session in Study Tracker.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyChartData}>
                    <XAxis dataKey="subject" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} style={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis stroke={theme === 'dark' ? '#475569' : '#94a3b8'} style={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                        borderRadius: '12px'
                      }} 
                    />
                    <Bar dataKey="minutes" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick Module Shortcuts */}
          <div className={cardClass}>
            <h3 className="text-xs font-black tracking-tight uppercase text-indigo-400 mb-3">Workspace Modules</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('pomodoro')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800' : 'bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50'
                }`}
              >
                <Clock className="h-4 w-4 text-pink-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Pomodoro Timer</div>
                  <div className="text-[10px] text-indigo-400">Deep focus intervals</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('planner')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800' : 'bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50'
                }`}
              >
                <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Calendar Planner</div>
                  <div className="text-[10px] text-indigo-400">Events & schedules</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('habits')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800' : 'bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50'
                }`}
              >
                <Zap className="h-4 w-4 text-orange-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Habit Streaks</div>
                  <div className="text-[10px] text-indigo-400">Daily habit tracking</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('auth')}
                className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800' : 'bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Auth & Backup</div>
                  <div className="text-[10px] text-indigo-400">Sync & backup state</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
