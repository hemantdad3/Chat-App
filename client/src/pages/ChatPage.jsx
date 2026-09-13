import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, ShieldCheck, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';

const ChatPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="font-bold text-white tracking-tight">MERN Chat App</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium ml-2">
            Phase 2 Authenticated
          </span>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-semibold text-indigo-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-slate-200">{user?.name}</div>
              <div className="text-[10px] text-slate-400">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Glow backdrop */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Protected Route Guard Active</h2>
              <p className="text-xs text-slate-400 mt-0.5">Session validated via secure httpOnly JWT cookie</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 text-xs text-slate-300">
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono text-slate-200">{user?._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-slate-200 font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Session Status:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated & Persisted
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Phase 2 Authentication Complete</strong>
              <span>
                User registration, bcrypt password hashing, login, logout, and route protection are fully operational. Ready to implement <strong>Phase 3: Core 1-on-1 Messaging</strong>.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
