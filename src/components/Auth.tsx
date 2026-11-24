import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, LogIn, LogOut, Download, Upload, Copy, Check,
  RefreshCw, UserPlus, Cloud, AlertCircle, Sparkles, Users
} from 'lucide-react';
import { useStore } from '../store/useStore';

function encodeBackupUtf8(payload: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodeBackupUtf8(encoded: string): unknown {
  const binary = atob(encoded.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const jsonText = new TextDecoder().decode(bytes);
  return JSON.parse(jsonText);
}

export default function AuthComponent() {
  const theme = useStore((state) => state.theme);
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const setUser = useStore((state) => state.setUser);
  const setAuthToken = useStore((state) => state.setAuthToken);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authStatus, setAuthStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Backup state
  const [backupString, setBackupString] = useState('');
  const [restoreString, setRestoreString] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  // Admin overview state (role-gated)
  const [adminStats, setAdminStats] = useState<{ totalUsers: number; syncedWorkspaces: number } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthStatus('');

    if (!email.trim() || (isRegistering && !username.trim()) || !passphrase) {
      setAuthError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const body = isRegistering
        ? { email: email.trim(), displayName: username.trim(), secret: passphrase }
        : { email: email.trim(), secret: passphrase };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Authentication failed.');
          return;
        }
        setUser(data.user);
        setAuthToken(data.token);
        setAuthStatus('Signed in with server-verified session.');
      } else {
        // Static SPA hosting fallback (e.g. Netlify/Vercel without Node API)
        setUser({
          uid: 'local-' + Math.random().toString(36).substring(2, 9),
          email: email.trim(),
          displayName: username.trim() || email.trim().split('@')[0],
          photoURL: null,
          role: 'member',
        });
        setAuthToken(null);
        setAuthStatus('Signed in locally (offline workspace mode).');
      }

      setUsername('');
      setEmail('');
      setPassphrase('');
    } catch {
      setUser({
        uid: 'local-' + Math.random().toString(36).substring(2, 9),
        email: email.trim(),
        displayName: username.trim() || email.trim().split('@')[0],
        photoURL: null,
        role: 'member',
      });
      setAuthToken(null);
      setAuthStatus('Signed in locally (offline workspace mode).');
      setUsername('');
      setEmail('');
      setPassphrase('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setAuthError('');
    setAuthStatus('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setUser(data.user);
        setAuthToken(data.token);
        setAuthStatus('Demo member session active.');
      } else {
        setUser({
          uid: 'demo-member-01',
          email: 'demo@smartbook.local',
          displayName: 'Demo Student',
          photoURL: null,
          role: 'member',
        });
        setAuthToken(null);
        setAuthStatus('Demo workspace active.');
      }
    } catch {
      setUser({
        uid: 'demo-member-01',
        email: 'demo@smartbook.local',
        displayName: 'Demo Student',
        photoURL: null,
        role: 'member',
      });
      setAuthToken(null);
      setAuthStatus('Demo workspace active.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloudSync = async () => {
    if (!authToken) {
      setAuthStatus('Local mode active — use Backup Code export below.');
      return;
    }
    setAuthError('');
    const state = useStore.getState();
    const payload = {
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
    };

    try {
      const res = await fetch('/api/workspace', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ data: payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAuthError(err.error || 'Failed to sync workspace.');
        return;
      }
      setAuthStatus('Workspace synced to your user-scoped account.');
    } catch {
      setAuthError('Network error while syncing workspace.');
    }
  };

  const handleFetchAdminOverview = async () => {
    if (!authToken) return;
    setAuthError('');
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAuthError(err.error || 'Admin access required.');
        return;
      }
      const data = await res.json();
      setAdminStats({ totalUsers: data.totalUsers, syncedWorkspaces: data.syncedWorkspaces });
    } catch {
      setAuthError('Could not load admin overview.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    setAdminStats(null);
    setAuthStatus('');
    setAuthError('');
  };

  const handleGenerateBackup = () => {
    const state = useStore.getState();
    const cleanBackup = {
      version: '1.0.1',
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
    const raw = encodeBackupUtf8(cleanBackup);
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
    setRestoreError('');
    if (!restoreString.trim()) {
      setRestoreError('Please paste a backup code before restoring.');
      return;
    }
    try {
      const parsed = decodeBackupUtf8(restoreString) as Record<string, unknown>;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !Array.isArray(parsed.notes) ||
        !Array.isArray(parsed.todos) ||
        !Array.isArray(parsed.habits)
      ) {
        setRestoreError('Backup payload is missing required workspace collections.');
        return;
      }

      useStore.setState({
        notes: parsed.notes as ReturnType<typeof useStore.getState>['notes'],
        notebooks: Array.isArray(parsed.notebooks) ? parsed.notebooks : useStore.getState().notebooks,
        todos: parsed.todos as ReturnType<typeof useStore.getState>['todos'],
        dailyGoals: Array.isArray(parsed.dailyGoals) ? parsed.dailyGoals : useStore.getState().dailyGoals,
        habits: parsed.habits as ReturnType<typeof useStore.getState>['habits'],
        pomodoroHistory: Array.isArray(parsed.pomodoroHistory) ? parsed.pomodoroHistory : useStore.getState().pomodoroHistory,
        events: Array.isArray(parsed.events) ? parsed.events : useStore.getState().events,
        journals: Array.isArray(parsed.journals) ? parsed.journals : useStore.getState().journals,
        moods: Array.isArray(parsed.moods) ? parsed.moods : useStore.getState().moods,
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : useStore.getState().expenses,
        studySessions: Array.isArray(parsed.studySessions) ? parsed.studySessions : useStore.getState().studySessions,
      });
      setIsRestored(true);
      setRestoreString('');
      setTimeout(() => setIsRestored(false), 2500);
    } catch {
      setRestoreError('Invalid workspace backup string format.');
    }
  };

  const cardClass = `backdrop-blur-md rounded-2xl border p-5 transition-all ${
    theme === 'dark'
      ? 'bg-slate-900/60 border-slate-800 text-white'
      : 'bg-white/60 border-indigo-100/80 text-indigo-950 shadow-sm'
  }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-y-auto pb-16 pr-1">
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

              <div className="p-3 bg-indigo-50/40 dark:bg-slate-950/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase text-indigo-400 tracking-wider">WORKSPACE USER</span>
                  <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-indigo-600 text-white">
                    {user.role || 'member'}
                  </span>
                </div>
                <span className="text-xs font-bold block">{user.displayName || 'Workspace User'}</span>
                <span className="text-[9px] text-indigo-400 font-medium block">
                  {authToken
                    ? 'User-scoped server session active. Sync your workspace anytime.'
                    : 'Local persistence active & auto-saving logs in real time.'}
                </span>
              </div>

              {authStatus && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold">
                  {authStatus}
                </div>
              )}

              {authError && (
                <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[11px] font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authToken && (
                <button
                  onClick={handleCloudSync}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Cloud className="h-4 w-4" /> Sync Workspace to Server
                </button>
              )}

              {user.role === 'admin' && authToken && (
                <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase text-indigo-400 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Admin Overview
                    </span>
                    <button
                      onClick={handleFetchAdminOverview}
                      className="text-[10px] font-bold text-indigo-500 hover:underline cursor-pointer"
                    >
                      Refresh
                    </button>
                  </div>
                  {adminStats ? (
                    <p className="text-[11px] font-semibold">
                      Accounts: {adminStats.totalUsers} · Synced Workspaces: {adminStats.syncedWorkspaces}
                    </p>
                  ) : (
                    <p className="text-[10px] text-indigo-400">Click Refresh to inspect role-gated server metrics.</p>
                  )}
                </div>
              )}

              <button
                onClick={handleLogout}
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
                <h4 className="text-sm font-black tracking-tight uppercase">
                  {isRegistering ? 'Create Workspace Account' : 'Secure Workspace Access'}
                </h4>
                <p className="text-xs text-indigo-400 max-w-xs mx-auto leading-relaxed">
                  Sign in or register for user-scoped workspace sync, backup storage, and personalized trackers.
                </p>
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[11px] font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-3.5">
                {isRegistering && (
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
                )}

                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="E.g. student@smartbook.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50/50 border-indigo-100'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-400 block mb-1">Security Passphrase</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none border ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50/50 border-indigo-100'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {isRegistering ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isRegistering ? 'Register & Access Workspace' : 'Sign In to Workspace'}
                </button>
              </form>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isSubmitting}
                  className={`w-full py-2.5 rounded-xl border font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-slate-700 hover:bg-slate-800 text-indigo-300'
                      : 'border-indigo-200 hover:bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" /> Try Demo Workspace
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering((prev) => !prev);
                    setAuthError('');
                  }}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-500 text-center cursor-pointer"
                >
                  {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Create one'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right panel: Data Export / Import */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
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
            Generate a portable Base64 JSON backup string encompassing all notebooks, tasks, habit records, financial transactions, calendar planner coordinates, and reflection diaries.
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
            Paste a valid Smart Book JSON backup string below to validate and restore your local workspace data.
          </p>

          {restoreError && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[11px] font-bold flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <textarea
              placeholder="Paste backup code here..."
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
              {isRestored ? 'Workspace Restored successfully!' : 'Validate & Restore Workspace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
