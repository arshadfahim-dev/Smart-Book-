import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Plus, Trash2, Award, Sparkles, BookOpen, Clock, BarChart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatLocalDate } from '../utils/date';

export default function StudyTrackerComponent() {
  const theme = useStore((state) => state.theme);
  const studySessions = useStore((state) => state.studySessions);
  const addStudySession = useStore((state) => state.addStudySession);
  const deleteStudySession = useStore((state) => state.deleteStudySession);

  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [focusScore, setFocusScore] = useState(8);
  const [date, setDate] = useState(formatLocalDate());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDuration = parseInt(duration, 10);
    if (!subject.trim() || Number.isNaN(parsedDuration) || parsedDuration <= 0) return;
    addStudySession({
      subject: subject.trim(),
      duration: parsedDuration,
      focusScore,
      date,
    });
    setSubject('');
    setDuration('');
  };

  const totalMinutes = studySessions.reduce((acc, s) => acc + s.duration, 0);
  const averageFocus = studySessions.length 
    ? Math.round((studySessions.reduce((acc, s) => acc + s.focusScore, 0) / studySessions.length) * 10) / 10
    : 0;

  const cardClass = `backdrop-blur-md rounded-2xl border p-5 transition-all ${
    theme === 'dark' 
      ? 'bg-slate-900/60 border-slate-800 text-white' 
      : 'bg-white/60 border-indigo-100/80 text-indigo-950 shadow-sm'
  }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden pb-10">
      {/* Left panel: Add Session + Summaries */}
      <div className="lg:col-span-4 flex flex-col overflow-y-auto pr-1 scrollbar-none space-y-4">
        {/* Statistics summary card */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`${cardClass} border-l-4 border-l-indigo-500`}>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Total minutes</span>
            <span className="text-xl md:text-2xl font-black">{totalMinutes} Mins</span>
          </div>

          <div className={`${cardClass} border-l-4 border-l-orange-400`}>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Average Focus</span>
            <span className="text-xl md:text-2xl font-black">{averageFocus} / 10</span>
          </div>
        </div>

        {/* Input Form */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-sm font-black uppercase tracking-wider">Log Study Session</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Subject / Activity Name</label>
              <input
                type="text"
                required
                placeholder="React Hooks, Linear Algebra, GRE, German..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' 
                    : 'bg-indigo-50/50 border-indigo-100 text-indigo-950 focus:border-indigo-400'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  min={1}
                  max={720}
                  required
                  placeholder="e.g. 45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-white' 
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Logged Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-indigo-200' 
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1.5">
                Focus level score: <span className="font-bold text-indigo-600">{focusScore} / 10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={focusScore}
                onChange={(e) => setFocusScore(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1 rounded-lg cursor-pointer bg-indigo-100"
              />
              <div className="flex justify-between text-[8px] font-mono text-indigo-300 uppercase font-black mt-1">
                <span>Distracted</span>
                <span>Hyperfocus</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              Post study block 🎓
            </button>
          </form>
        </div>
      </div>

      {/* Right panel: Session ledger list */}
      <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
        <div className={`${cardClass} flex-1 flex flex-col overflow-hidden`}>
          <div className="pb-3 border-b border-indigo-50 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase tracking-wider">Session list history</h3>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-1 scrollbar-thin">
            {studySessions.length === 0 ? (
              <div className="text-center py-20 text-xs text-indigo-300 font-semibold leading-relaxed">
                No study sessions recorded yet. Start logging sessions to track focused hours.
              </div>
            ) : (
              studySessions.slice().reverse().map((session) => (
                <div
                  key={session.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-indigo-50/30 border-indigo-100/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-900 text-indigo-600 flex items-center justify-center font-semibold text-xs">
                      📖
                    </span>

                    <div>
                      <span className="text-xs font-black block">{session.subject}</span>
                      <div className="flex gap-2 items-center mt-0.5 text-[9px] font-mono text-indigo-400">
                        <span className="text-orange-400 font-black uppercase">
                          🔥 Focus: {session.focusScore}/10
                        </span>
                        <span>|</span>
                        <span>{session.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-slate-900 px-2.5 py-1 rounded-xl">
                      {session.duration} mins
                    </span>

                    <button
                      onClick={() => deleteStudySession(session.id)}
                      className="p-1 text-pink-500 hover:bg-pink-50 rounded-lg"
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
