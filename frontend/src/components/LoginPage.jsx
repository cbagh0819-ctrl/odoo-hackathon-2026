import React, { useState } from 'react';
import { apiRequest, setAuthToken, setCurrentUser } from '../api';
import { Lock, User, ArrowRight, ShieldCheck, Sparkles, Key } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeLogin = async (idToUse, passToUse) => {
    try {
      setLoading(true);
      setError('');

      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          login_id: idToUse,
          password: passToUse
        })
      });

      setAuthToken(res.access_token);
      setCurrentUser(res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError('Please enter both Login ID and Password.');
      return;
    }
    executeLogin(loginId.trim(), password.trim());
  };

  // Quick 1-click evaluator credential pills
  const handleQuickLogin = (id, pass) => {
    setLoginId(id);
    setPassword(pass);
    executeLogin(id, pass);
  };

  return (
    <div className="min-h-screen bg-[#080405] text-zinc-100 flex flex-col justify-center items-center p-6 relative select-none overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="ambient ambient-one" style={{ opacity: 0.7 }}></div>
      <div className="ambient ambient-two" style={{ opacity: 0.7 }}></div>

      {/* Main Login Card */}
      <div 
        className="w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl animate-fade-in"
        style={{
          background: 'linear-gradient(145deg, rgba(24,8,12,0.94), rgba(10,4,6,0.96))',
          border: '1px solid rgba(214,72,84,0.35)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(151,18,33,0.1)'
        }}
      >
        {/* Top Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-xl border border-[#d4af37] items-center justify-center text-white font-serif font-bold text-2xl shadow-[0_0_25px_rgba(212,175,55,0.25)] mb-3 bg-gradient-to-br from-red-950/60 to-black">
            O
          </div>
          <p className="eyebrow" style={{ color: '#d4af37' }}>HAUTE PARFUMERIE SUITE</p>
          <h2 className="text-2xl font-serif text-white font-normal mt-1">
            Sign In to Odoo Perfumes<span className="red-dot">.</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enter your credentials to access your designated workspace.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-700/60 text-xs text-red-300 text-center animate-shake">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase mb-1.5">
              LOGIN ID / USERNAME
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="ADMIN, MEMBER1, or CUSTOMER"
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg text-xs font-semibold text-white shimmer-btn flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
            style={{
              background: 'linear-gradient(110deg, #8a0e1e, #d62035)',
              border: '1px solid rgba(255,94,108,0.7)',
              boxShadow: '0 4px 20px rgba(214,32,53,0.35)'
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

        </form>

        {/* 1-Click Quick Evaluator Login Pills */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80">
          <p className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase text-center mb-3">
            QUICK 1-CLICK EVALUATOR LOGIN
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            
            {/* 1. ADMIN */}
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN', '1234')}
              className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-red-600/60 hover:bg-red-950/20 text-left transition cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <span>👑</span>
                <span>ADMIN</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Pass: <span className="font-mono text-zinc-300 font-semibold">1234</span> (Full Control)
              </div>
            </button>

            {/* 2. MEMBER / STAFF */}
            <button
              type="button"
              onClick={() => handleQuickLogin('MEMBER1', '1234')}
              className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-red-600/60 hover:bg-red-950/20 text-left transition cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <span>⚙️</span>
                <span>MEMBER1</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Pass: <span className="font-mono text-zinc-300 font-semibold">1234</span> (Staff Access)
              </div>
            </button>

          </div>

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => handleQuickLogin('CUSTOMER', '1234')}
              className="text-[11px] text-zinc-400 hover:text-white transition underline cursor-pointer"
            >
              Or log in as 🏢 <strong>CUSTOMER (Acme Corp)</strong> to view personal portal
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-[10px] font-mono text-zinc-600">
        © 2026 Odoo Perfumes · Odoo x Make-A-Ton 9.0 Kochi Hackathon
      </footer>

    </div>
  );
}
