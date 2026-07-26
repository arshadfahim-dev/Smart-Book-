import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Plus, Trash2, Check, Sparkles, Calendar, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function HabitsComponent() {
  const theme = useStore((state) => state.theme);
  const habits = useStore((state) => state.habits);
  const addHabit = useStore((state) => state.addHabit);
  const toggleHabit = useStore((state) => state.toggleHabit);
  const deleteHabit = useStore((state) => state.deleteHabit);

  const [newHabitName, setNewHabitName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName.trim(), frequency);
    setNewHabitName('');
  };

  // Generate the last 7 dates for logging grids
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dateNum: d.getDate(),
    };
  }).reverse();

  const cardClass = `backdrop-blur-md rounded-2xl border p-5 transition-all ${
    theme === 'dark' 
      ? 'bg-slate-900/60 border-slate-800 text-white' 
      : 'bg-white/60 border-indigo-100/80 text-indigo-950 shadow-sm'
  }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden pb-10">
      {/* Left panel: Add Habit */}
      <div className="lg:col-span-4 space-y-4">
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-black uppercase tracking-wider">New Habit</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Habit Name</label>
              <input
                type="text"
                placeholder="E.g. Read 15 mins, Drink Water, Gym..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500' 
                    : 'bg-indigo-50/50 border-indigo-100 text-indigo-950 placeholder:text-indigo-300 focus:border-indigo-400'
                }`}
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Frequency</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFrequency('daily')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    frequency === 'daily'
                      ? 'bg-indigo-600 text-white'
                      : theme === 'dark' ? 'bg-slate-950/40 text-slate-400 border border-slate-800' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  ☀️ Daily
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('weekly')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    frequency === 'weekly'
                      ? 'bg-indigo-600 text-white'
                      : theme === 'dark' ? 'bg-slate-950/40 text-slate-400 border border-slate-800' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  📅 Weekly
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              Start Tracking
            </button>
          </form>
        </div>
      </div>

      {/* Right panel: Grid logs */}
      <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
        <div className={`${cardClass} flex-1 flex flex-col overflow-hidden`}>
          <div className="pb-4 border-b border-indigo-50 dark:border-slate-850 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider">Active Habit Streaks</h3>
            <span className="text-[10px] font-mono font-bold text-indigo-400">LAST 7 DAYS</span>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1 scrollbar-thin">
            {habits.length === 0 ? (
              <div className="text-center py-20 text-xs text-indigo-300 font-semibold leading-relaxed">
                No active habits being tracked yet. Define one on the left to set visual targets.
              </div>
            ) : (
              habits.map((habit) => (
                <div 
                  key={habit.id} 
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-indigo-50/30 border-indigo-100/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-black">{habit.name}</div>
                    <div className="flex gap-2 items-center text-[10px]">
                      <span className="bg-indigo-100 dark:bg-slate-900 text-indigo-600 font-sans font-bold uppercase px-1.5 py-0.5 rounded-md">
                        {habit.frequency}
                      </span>
                      <span className="text-orange-400 font-black flex items-center gap-0.5">
                        <Flame className="h-3.5 w-3.5 animate-pulse" /> {habit.streak} DAY STREAK
                      </span>
                    </div>
                  </div>

                  {/* 7 Days Grid Column */}
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {last7Days.map((day) => {
                        const isCompleted = habit.history.includes(day.dateStr);
                        return (
                          <div key={day.dateStr} className="flex flex-col items-center">
                            <span className="text-[8px] font-mono text-indigo-400 font-bold mb-1 uppercase">{day.dayName}</span>
                            <button
                              onClick={() => toggleHabit(habit.id, day.dateStr)}
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                isCompleted
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                                  : theme === 'dark' ? 'border-slate-800 hover:border-indigo-400 bg-slate-900' : 'border-indigo-200 hover:border-indigo-400 bg-white'
                              }`}
                              title={`${isCompleted ? 'Completed' : 'Pending'} on ${day.dateStr}`}
                            >
                              {isCompleted ? <Check className="h-3.5 w-3.5" /> : <span className="text-[9px] font-semibold text-indigo-300">{day.dateNum}</span>}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg text-pink-500 hover:bg-pink-50 self-end sm:self-center shrink-0 ml-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
