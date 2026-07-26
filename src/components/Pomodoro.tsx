import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Clock, Award, CheckCircle, Flame, Star, Brain } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function PomodoroComponent() {
  const theme = useStore((state) => state.theme);
  const logPomodoro = useStore((state) => state.logPomodoro);
  const addStudySession = useStore((state) => state.addStudySession);
  const pomodoroHistory = useStore((state) => state.pomodoroHistory);

  // Default Pomodoro: 25 mins work, 5 mins break
  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState('React Coding');
  const [focusScore, setFocusScore] = useState(5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialTime = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  }[mode];

  useEffect(() => {
    setTimeLeft(initialTime);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    logPomodoro({
      duration: Math.round(initialTime / 60),
      type: mode,
    });

    if (mode === 'work') {
      addStudySession({
        subject: subject.trim() || 'Focus session',
        duration: Math.round(initialTime / 60),
        focusScore: focusScore,
        date: new Date().toISOString().split('T')[0],
      });
    }

    // Toggle automatically
    if (mode === 'work') {
      setMode('short_break');
    } else {
      setMode('work');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / initialTime) * 100;

  const cardClass = `backdrop-blur-md rounded-2xl border p-5 transition-all ${
    theme === 'dark' 
      ? 'bg-slate-900/60 border-slate-800 text-white' 
      : 'bg-white/60 border-indigo-100/80 text-indigo-950 shadow-sm'
  }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden pb-10">
      {/* Left panel: Active Clock */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center">
        <div className={`${cardClass} w-full max-w-md text-center p-8 space-y-6 flex flex-col items-center justify-center relative overflow-hidden`}>
          {/* Wave effect backing when running */}
          {isRunning && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute inset-0 bg-indigo-500 rounded-2xl -z-10"
            />
          )}

          {/* Type Selectors */}
          <div className="flex gap-2 p-1 bg-indigo-50 dark:bg-slate-950 rounded-xl border border-indigo-100/40 w-full">
            {(['work', 'short_break', 'long_break'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMode(t)}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  mode === t
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-400'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Interactive Countdown */}
          <div className="relative flex items-center justify-center w-52 h-52">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="104"
                cy="104"
                r="92"
                className="stroke-indigo-100 dark:stroke-slate-800 fill-none"
                strokeWidth="8"
              />
              <motion.circle
                cx="104"
                cy="104"
                r="92"
                className="stroke-indigo-600 fill-none"
                strokeWidth="8"
                strokeDasharray="578"
                strokeDashoffset={578 - (578 * progress) / 100}
                transition={{ duration: 0.35, ease: 'linear' }}
              />
            </svg>
            
            <div className="z-10 text-center">
              <span className="text-4xl font-mono font-black tracking-tighter block">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-indigo-400 mt-1 block">
                {mode === 'work' ? 'FOCUSING' : 'BREAKTIME'}
              </span>
            </div>
          </div>

          {/* Session Subject Selector */}
          {mode === 'work' && (
            <div className="w-full text-left space-y-1 z-10">
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Session Target</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="React Component Design, Algorithms..."
                className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500' 
                    : 'bg-indigo-50/50 border-indigo-100 text-indigo-950 placeholder:text-indigo-300 focus:border-indigo-400'
                }`}
              />
            </div>
          )}

          {/* Controls Trigger */}
          <div className="flex justify-center items-center gap-4 z-10">
            <button
              onClick={resetTimer}
              className={`p-3 rounded-xl border transition-all hover:bg-pink-50 ${
                theme === 'dark' ? 'border-slate-800 text-indigo-200' : 'border-indigo-100 text-indigo-600'
              }`}
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={toggleTimer}
              className="p-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-100/40 active:scale-95 transition-all cursor-pointer"
            >
              {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: History Logs */}
      <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
        <div className={`${cardClass} flex-1 flex flex-col overflow-hidden`}>
          <div className="pb-3 border-b border-indigo-50 dark:border-slate-850 flex items-center gap-2">
            <Clock className="h-4 w-4 text-pink-500" />
            <h3 className="text-sm font-black uppercase tracking-wider">Completed Focus Sessions</h3>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-2 pr-1 scrollbar-thin">
            {pomodoroHistory.length === 0 ? (
              <div className="text-center py-20 text-xs text-indigo-300 font-semibold leading-relaxed">
                No sessions completed yet. Focus for a block of study to log.
              </div>
            ) : (
              pomodoroHistory.slice().reverse().map((session) => (
                <div 
                  key={session.id} 
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-indigo-50/30 border-indigo-100/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{session.type === 'work' ? '🧠' : '☕'}</span>
                    <div>
                      <span className="text-xs font-bold block uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                        {session.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-mono">
                        {new Date(session.completedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600">
                    {session.duration} mins
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
