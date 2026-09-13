import { useEffect, useState } from 'react';
import api from './services/api';
import { io } from 'socket.io-client';
import { Activity, CheckCircle2, Server, Database, Radio, Sparkles } from 'lucide-react';

function App() {
  const [serverStatus, setServerStatus] = useState({ loading: true, ok: false, data: null, error: null });
  const [socketStatus, setSocketStatus] = useState({ connected: false, id: null });

  useEffect(() => {
    // 1. Verify REST API connection to Express backend
    api.get('/health')
      .then((res) => {
        setServerStatus({ loading: false, ok: true, data: res.data, error: null });
      })
      .catch((err) => {
        setServerStatus({ loading: false, ok: false, data: null, error: err.message });
      });

    // 2. Verify Socket.io client connection to server
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { withCredentials: true });

    socket.on('connect', () => {
      setSocketStatus({ connected: true, id: socket.id });
    });

    socket.on('disconnect', () => {
      setSocketStatus({ connected: false, id: null });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 max-w-2xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-indigo-950/40">
        <header className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                MERN Real-Time Chat
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Phase 1 Ready
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Scaffolding & Architecture Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full-Stack Verified</span>
          </div>
        </header>

        {/* Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Server & DB Status */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Server className="w-4 h-4 text-indigo-400" />
                Backend API & DB
              </div>
              {serverStatus.loading ? (
                <span className="text-xs text-slate-400 animate-pulse">Connecting...</span>
              ) : serverStatus.ok ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Online
                </span>
              ) : (
                <span className="text-xs text-rose-400 font-medium">Offline</span>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Express API:</span>
                <span className="text-slate-200 font-mono">/api/health</span>
              </div>
              <div className="flex justify-between">
                <span>MongoDB:</span>
                <span className={serverStatus.ok ? "text-emerald-400" : "text-slate-500"}>
                  {serverStatus.ok ? 'Connected' : 'Waiting'}
                </span>
              </div>
            </div>
          </div>

          {/* Socket.io Status */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Radio className="w-4 h-4 text-violet-400" />
                Socket.io Client
              </div>
              {socketStatus.connected ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-medium">Connecting...</span>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Socket Transport:</span>
                <span className="text-slate-200 font-mono">WebSocket</span>
              </div>
              <div className="flex justify-between">
                <span>Socket ID:</span>
                <span className="text-slate-200 font-mono truncate max-w-[120px]">
                  {socketStatus.id || '...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Checklist */}
        <section className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Phase 1 Checklist Complete
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Backend Express server configured with CORS & cookie-parser</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>MongoDB connection established via Mongoose</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Vite React client with Tailwind CSS & Lucide icons configured</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Socket.io server and client handshake verified</span>
            </li>
          </ul>
        </section>

        <footer className="text-center text-xs text-slate-500">
          Ready to implement <strong className="text-slate-300">Phase 2: Authentication</strong>
        </footer>
      </main>
    </div>
  );
}

export default App;
