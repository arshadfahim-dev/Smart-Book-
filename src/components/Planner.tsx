import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, Trash2, Clock, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PlannerEvent } from '../types';

export default function PlannerComponent() {
  const theme = useStore((state) => state.theme);
  const events = useStore((state) => state.events);
  const addEvent = useStore((state) => state.addEvent);
  const deleteEvent = useStore((state) => state.deleteEvent);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // New event fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('indigo');
  const [isAdding, setIsAdding] = useState(false);

  // Month navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      date: selectedDate,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      color,
    });
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setIsAdding(false);
  };

  // Days calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // day of week

  const daysArray = Array.from({ length: daysInMonth }).map((_, i) => {
    const date = new Date(year, month, i + 1);
    return date.toISOString().split('T')[0];
  });

  const blanks = Array.from({ length: firstDayIndex }).map((_, idx) => null);

  const activeDayEvents = events.filter((e) => e.date === selectedDate);

  const cardClass = `backdrop-blur-md rounded-2xl border p-5 transition-all ${
    theme === 'dark' 
      ? 'bg-slate-900/60 border-slate-800 text-white' 
      : 'bg-white/60 border-indigo-100/80 text-indigo-950 shadow-sm'
  }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden pb-10">
      {/* Left panel: Grid Calendar */}
      <div className="lg:col-span-7 flex flex-col overflow-hidden">
        <div className={`${cardClass} flex-1 flex flex-col justify-between overflow-hidden`}>
          <div>
            {/* Header navigator */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-50 dark:border-slate-850">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                <span className="text-sm font-black uppercase tracking-wider">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-850"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-850"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {blanks.map((_, idx) => (
                <div key={`blank-${idx}`} className="h-12 border border-transparent" />
              ))}
              {daysArray.map((dateStr) => {
                const dayNum = parseInt(dateStr.split('-')[2]);
                const isSelected = dateStr === selectedDate;
                const dailyEvents = events.filter((e) => e.date === dateStr);
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-12 border rounded-xl flex flex-col justify-between p-1 text-left relative transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                        : theme === 'dark'
                          ? 'bg-slate-950/40 border-slate-900 hover:border-slate-700 text-indigo-200'
                          : 'bg-indigo-50/20 border-indigo-100/30 hover:border-indigo-200 text-indigo-950'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{dayNum}</span>
                    <div className="flex gap-0.5 max-w-full overflow-hidden">
                      {dailyEvents.slice(0, 3).map((e) => {
                        const colorMap = {
                          indigo: 'bg-indigo-500',
                          pink: 'bg-pink-500',
                          orange: 'bg-orange-400',
                          emerald: 'bg-emerald-500',
                          cyan: 'bg-cyan-400',
                        }[e.color] || 'bg-indigo-500';
                        return (
                          <span 
                            key={e.id} 
                            className={`w-1.5 h-1.5 rounded-full ${colorMap}`} 
                            title={e.title}
                          />
                        );
                      })}
                      {dailyEvents.length > 3 && (
                        <span className="text-[7px] font-mono font-bold opacity-60">+</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] font-mono text-indigo-400 pt-4 border-t border-indigo-50 dark:border-slate-850">
            Click any day to schedule color-coded milestones or reviews.
          </div>
        </div>
      </div>

      {/* Right panel: Events list & add form */}
      <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
        <div className={`${cardClass} flex-1 flex flex-col overflow-hidden`}>
          <div className="pb-3 border-b border-indigo-50 dark:border-slate-850 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">Selected Day Events</h3>
              <span className="text-[10px] font-mono font-bold text-indigo-500">{selectedDate}</span>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              {isAdding ? 'Cancel' : 'Add Event'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 space-y-3.5 pr-1 scrollbar-thin">
            {isAdding ? (
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Event/Milestone title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                      theme === 'dark' 
                        ? 'bg-slate-950 border-slate-800 text-white' 
                        : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Description notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                      theme === 'dark' 
                        ? 'bg-slate-950 border-slate-800 text-white' 
                        : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                        theme === 'dark' 
                          ? 'bg-slate-950 border-slate-800 text-indigo-200' 
                          : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                        theme === 'dark' 
                          ? 'bg-slate-950 border-slate-800 text-indigo-200' 
                          : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Color Code</label>
                  <div className="flex gap-2">
                    {['indigo', 'pink', 'orange', 'emerald', 'cyan'].map((col) => {
                      const colBg = {
                        indigo: 'bg-indigo-500',
                        pink: 'bg-pink-500',
                        orange: 'bg-orange-400',
                        emerald: 'bg-emerald-500',
                        cyan: 'bg-cyan-400',
                      }[col];
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setColor(col)}
                          className={`w-6 h-6 rounded-full ${colBg} flex items-center justify-center border-2 transition-all ${
                            color === col ? 'border-indigo-950 scale-110' : 'border-transparent'
                          }`}
                        >
                          {color === col && <Check className="h-3 w-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-100 transition-all cursor-pointer"
                >
                  Save Schedule Event
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                {activeDayEvents.length === 0 ? (
                  <div className="text-center py-20 text-xs text-indigo-300 font-semibold leading-relaxed">
                    No active events scheduled for this day. Click Add Event to schedule your next milestone.
                  </div>
                ) : (
                  activeDayEvents.map((e) => {
                    const colorBorder = {
                      indigo: 'border-l-4 border-indigo-500 bg-indigo-50/10',
                      pink: 'border-l-4 border-pink-500 bg-pink-50/10',
                      orange: 'border-l-4 border-orange-400 bg-orange-50/10',
                      emerald: 'border-l-4 border-emerald-500 bg-emerald-50/10',
                      cyan: 'border-l-4 border-cyan-400 bg-cyan-50/10',
                    }[e.color] || 'border-l-4 border-indigo-500 bg-indigo-50/10';

                    return (
                      <div
                        key={e.id}
                        className={`p-3.5 rounded-xl border border-indigo-100/40 dark:border-slate-800/60 flex items-center justify-between ${colorBorder}`}
                      >
                        <div>
                          <span className="text-xs font-black block">{e.title}</span>
                          {e.description && (
                            <span className="text-[10px] text-indigo-400/80 block mt-0.5">{e.description}</span>
                          )}
                          {(e.startTime || e.endTime) && (
                            <span className="text-[9px] font-mono text-indigo-400 font-bold flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" /> {e.startTime || '--:--'} - {e.endTime || '--:--'}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => deleteEvent(e.id)}
                          className="p-1 text-pink-500 hover:bg-pink-50 rounded-lg"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
