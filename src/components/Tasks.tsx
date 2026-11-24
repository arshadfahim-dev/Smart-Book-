import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, CheckSquare, Trash2, ArrowUp, ArrowDown, Search, 
  Tag, ListTodo, AlertTriangle, Star, CheckCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Todo } from '../types';

export default function TasksComponent() {
  const theme = useStore((state) => state.theme);
  const todos = useStore((state) => state.todos);
  const addTodo = useStore((state) => state.addTodo);
  const updateTodo = useStore((state) => state.updateTodo);
  const toggleTodo = useStore((state) => state.toggleTodo);
  const deleteTodo = useStore((state) => state.deleteTodo);
  const reorderTodos = useStore((state) => state.reorderTodos);

  const [todoTitle, setTodoTitle] = useState('');
  const [todoPriority, setTodoPriority] = useState<Todo['priority']>('medium');
  const [todoCategory, setTodoCategory] = useState('Study');
  const [todoDueDate, setTodoDueDate] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [activePriorityFilter, setActivePriorityFilter] = useState('All');

  const categories = ['Study', 'Finance', 'Work', 'Health', 'Personal', 'Reading'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle.trim()) return;
    addTodo({
      title: todoTitle.trim(),
      priority: todoPriority,
      category: todoCategory,
      dueDate: todoDueDate || undefined,
    });
    setTodoTitle('');
    setTodoDueDate('');
  };

  const swapFilteredItems = (indexA: number, indexB: number) => {
    const itemA = filteredTodos[indexA];
    const itemB = filteredTodos[indexB];
    if (!itemA || !itemB) return;

    const fullIndexA = todos.findIndex((t) => t.id === itemA.id);
    const fullIndexB = todos.findIndex((t) => t.id === itemB.id);
    if (fullIndexA === -1 || fullIndexB === -1) return;

    const updated = [...todos];
    updated[fullIndexA] = todos[fullIndexB];
    updated[fullIndexB] = todos[fullIndexA];
    reorderTodos(updated.map((t, pos) => ({ ...t, position: pos })));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    swapFilteredItems(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === filteredTodos.length - 1) return;
    swapFilteredItems(index, index + 1);
  };

  // Filtering
  const filteredTodos = todos.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'All' || t.category === activeCategoryFilter;
    const matchesPriority = activePriorityFilter === 'All' || t.priority === activePriorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const cardClass = `backdrop-blur-md rounded-2xl border p-5 transition-all ${
    theme === 'dark' 
      ? 'bg-slate-900/60 border-slate-800 text-white' 
      : 'bg-white/60 border-indigo-100/80 text-indigo-950 shadow-sm'
  }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden pb-10">
      {/* Left panel: Add Todo form + Filters */}
      <div className="lg:col-span-4 space-y-4 flex flex-col overflow-y-auto pr-1 scrollbar-none">
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-black uppercase tracking-wider">New Task</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Task Title</label>
              <input
                type="text"
                placeholder="What needs to be done?..."
                value={todoTitle}
                onChange={(e) => setTodoTitle(e.target.value)}
                className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500' 
                    : 'bg-indigo-50/50 border-indigo-100 text-indigo-950 placeholder:text-indigo-300 focus:border-indigo-400'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Priority</label>
                <select
                  value={todoPriority}
                  onChange={(e) => setTodoPriority(e.target.value as Todo['priority'])}
                  className={`w-full px-2.5 py-2.5 text-xs rounded-xl focus:outline-none border ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-indigo-200' 
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                  }`}
                >
                  <option value="low">🌱 Low</option>
                  <option value="medium">⚡ Medium</option>
                  <option value="high">🔥 High</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Category</label>
                <select
                  value={todoCategory}
                  onChange={(e) => setTodoCategory(e.target.value)}
                  className={`w-full px-2.5 py-2.5 text-xs rounded-xl focus:outline-none border ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-indigo-200' 
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                  }`}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Due Date (Optional)</label>
              <input
                type="date"
                value={todoDueDate}
                onChange={(e) => setTodoDueDate(e.target.value)}
                className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-indigo-200' 
                    : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-100 active:scale-95 transition-all cursor-pointer"
            >
              Add to backlog
            </button>
          </form>
        </div>

        {/* Quick filters card */}
        <div className={cardClass}>
          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 mb-3">Filters</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1.5">By Category</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveCategoryFilter('All')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                    activeCategoryFilter === 'All' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-50/50 dark:bg-slate-950 hover:bg-indigo-100'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${
                      activeCategoryFilter === cat 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-50/50 dark:bg-slate-950 hover:bg-indigo-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1.5">By Priority</span>
              <div className="flex gap-1.5">
                {['All', 'low', 'medium', 'high'].map((prio) => (
                  <button
                    key={prio}
                    onClick={() => setActivePriorityFilter(prio)}
                    className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      activePriorityFilter === prio 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-50/50 dark:bg-slate-950 hover:bg-indigo-100'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Search list & backlog list */}
      <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
        <div className={`${cardClass} flex-1 flex flex-col overflow-hidden`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-indigo-50 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase tracking-wider">Active Backlog</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-indigo-400" />
              <input
                type="text"
                placeholder="Search backlog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl focus:outline-none border ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' 
                    : 'bg-indigo-50/50 border-indigo-100 text-indigo-950 placeholder:text-indigo-300'
                }`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-2.5 pr-1 scrollbar-thin">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-16 text-xs text-indigo-300 font-semibold leading-relaxed">
                No active task fits this filter criteria. Add a task to build forward momentum.
              </div>
            ) : (
              filteredTodos.map((todo, idx) => {
                const priorityColor = {
                  low: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30',
                  medium: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-100 dark:border-amber-900/30',
                  high: 'bg-pink-50 dark:bg-pink-950/20 text-pink-600 border-pink-100 dark:border-pink-900/30'
                }[todo.priority];

                return (
                  <div
                    key={todo.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      todo.completed 
                        ? 'opacity-65 bg-indigo-50/20 border-indigo-100/50 dark:bg-slate-950/20' 
                        : theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-indigo-50/30 border-indigo-100/50'
                    }`}
                  >
                    {/* Title check trigger */}
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        todo.completed 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                          : theme === 'dark' ? 'border-slate-700 hover:border-indigo-500' : 'border-indigo-200 hover:border-indigo-400'
                      }`}>
                        {todo.completed && <span className="text-[11px]">✓</span>}
                      </span>
                      <div>
                        <span className={`text-xs font-semibold block ${todo.completed ? 'line-through text-indigo-300' : ''}`}>
                          {todo.title}
                        </span>
                        <div className="flex gap-2 items-center mt-1">
                          <span className={`text-[9px] font-mono font-black uppercase border px-1.5 py-0.5 rounded-md ${priorityColor}`}>
                            {todo.priority}
                          </span>
                          <span className="text-[9px] font-sans font-bold text-indigo-400 bg-indigo-100/60 dark:bg-slate-900 px-1.5 py-0.5 rounded-md">
                            {todo.category}
                          </span>
                          {todo.dueDate && (
                            <span className="text-[9px] font-mono text-pink-500 font-bold">
                              🗓️ {todo.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Sorting & deletion */}
                    <div className="flex items-center gap-1.5 ml-4">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === filteredTodos.length - 1}
                        className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-1 rounded-lg hover:bg-pink-50 text-pink-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
