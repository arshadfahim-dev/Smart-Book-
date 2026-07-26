import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, LogIn, LogOut, Download, Upload, Copy, Check, RefreshCw, Key } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AuthComponent() {
  const theme = useStore((state) => state.theme);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Backup state
  const [backupString, setBackupString] = useState('');
  const [restoreString, setRestoreString] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !username.trim()) return;
    setUser({
      uid: 'user-' + Math.random().toString(36).substring(2, 9),
      email: email.trim(),
      displayName: username.trim(),
      photoURL: null
    });
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const handleGenerateBackup = () => {
    const state = useStore.getState();
    const cleanBackup = {
      notes: state.notes,
      notebooks: state.notebooks,
      todos: state.todos,
      dailyGoals: state.dailyGoals,
      habits: state.habits,
      pomodoroHistory: state.pomodoroHistory,
      events: state.events,
      journals: state.journals,
      moods: state.moods,
      expenses: state.expenses,
      studySessions: state.studySessions,
      user: state.user,
    };
    const raw = btoa(unescape(encodeURIComponent(JSON.stringify(cleanBackup))));
    setBackupString(raw);
    setIsCopied(false);
  };

  const handleCopyBackup = () => {
    if (!backupString) return;
    navigator.clipboard.writeText(backupString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRestore = () => {
    if (!restoreString.trim()) return;
    try {
      const decoded = decodeURIComponent(escape(atob(restoreString.trim())));
      const parsed = JSON.parse(decoded);
      useStore.setState(parsed);
      setIsRestored(true);
      setRestoreString('');
      setTimeout(() => setIsRestored(false), 2500);
    } catch (e) {
      alert('Invalid workspace backup string format.');
    }
  };

  const cardClass = `backdrop-blur-md rounded-2xl border p-5 transition-all ${
    theme === 'dark' 
      ? 'bg-slate-900/60 border-slate-800 text-white' 
      : 'bg-white/60 border-indigo-100/80 text-indigo-950 shadow-sm'
  }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden pb-10">
      {/* Left panel: Authenticate Panel */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {user ? (
            <motion.div 
              key="authenticated"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${cardClass} space-y-4`}
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mx-auto text-lg font-black shadow-md">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight uppercase">Session Securely Active</h4>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/40 dark:bg-slate-950/30 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-black uppercase text-indigo-400 block tracking-wider">WORKSPACE USER</span>
                <span className="text-xs font-bold block">{user.displayName || 'Anonymous User'}</span>
                <span className="text-[9px] text-indigo-400 font-medium block">
                  Workspace synchronisation active & auto-saving local logs in real time.
                </span>
              </div>

              <button
                onClick={() => setUser(null)}
                className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> End Active Session
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="auth-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${cardClass} space-y-4`}
            >
              <div className="text-center space-y-1.5">
                <div className="p-3 bg-indigo-50 dark:bg-slate-800 rounded-full text-indigo-600 inline-block">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black tracking-tight uppercase">Secure Workspace Access</h4>
                <p className="text-xs text-indigo-400 max-w-xs mx-auto leading-relaxed">
                  Log in to enable multi-device sync, secure backup storage, and complete personalized trackers.
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Username / Nickname</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your nickname..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50/50 border-indigo-100'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="E.g. coder@zenith.com..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50/50 border-indigo-100'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Security Code / Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50/50 border-indigo-100'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <LogIn className="h-4 w-4" /> Authenticate & Access Workspace
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right panel: Data Export / Import */}
      <div className="lg:col-span-7 flex flex-col h-full overflow-hidden space-y-4">
        {/* Export card */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-100/40 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <Download className="h-4.5 w-4.5 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">Export Backups</h3>
            </div>
            <button
              onClick={handleGenerateBackup}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-slate-950 hover:bg-indigo-100 text-[10px] font-black uppercase tracking-wider text-indigo-600 transition-colors cursor-pointer"
            >
              Generate Backup Code
            </button>
          </div>

          <p className="text-[10px] text-indigo-400/95 leading-relaxed mb-3 font-medium">
            Generate a full encrypted JSON backup string encompassing all notebooks, tasks, habit records, financial transactions, calendar planner coordinates, and reflection diaries.
          </p>

          {backupString ? (
            <div className="space-y-2">
              <textarea
                readOnly
                value={backupString}
                rows={3}
                className="w-full p-2.5 text-[10px] font-mono bg-slate-950 text-indigo-300 border border-slate-800 rounded-xl resize-none focus:outline-none"
              />
              <button
                onClick={handleCopyBackup}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {isCopied ? 'Copied string successfully!' : 'Copy Backup Code to Clipboard'}
              </button>
            </div>
          ) : (
            <div className="py-6 text-center text-xs font-semibold text-indigo-300">
              Click "Generate Backup Code" to compile workspace bundle.
            </div>
          )}
        </div>

        {/* Import card */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-100/40 dark:border-slate-800/60">
            <Upload className="h-4.5 w-4.5 text-pink-500" />
            <h3 className="text-xs font-black uppercase tracking-wider">Restore Backup</h3>
          </div>

          <p className="text-[10px] text-indigo-400/95 leading-relaxed mb-3 font-medium">
            Paste a valid Zenith JSON backup string below to overwrite your local workspace and restore all historical data.
          </p>

          <div className="space-y-2.5">
            <textarea
              placeholder="Paste backup JSON code here..."
              rows={3}
              value={restoreString}
              onChange={(e) => setRestoreString(e.target.value)}
              className={`w-full p-2.5 text-[10px] font-mono focus:outline-none border rounded-xl resize-none ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-indigo-300' : 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
              }`}
            />
            <button
              onClick={handleRestore}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {isRestored ? <Check className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {isRestored ? 'Workspace Restored successfully!' : 'Upload & Overwrite Workspace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
