import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Users, TrendingUp, IndianRupee, AlertTriangle, RefreshCw } from 'lucide-react';

export default function FinanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/analytics/finance-summary');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-poll every 2.5 seconds for live real-time sync with storefront
    const interval = setInterval(() => {
      fetchMetrics();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const metrics = data?.metrics || {};

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-2 sm:px-4">
      
      {/* Top Bar: Live Latency Indicator & Refresh */}
      <div className="flex justify-end items-center space-x-3 mb-8">
        
        {/* Live Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/60 border border-red-950/60 backdrop-blur-md shadow-inner text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#dc2626]"></span>
          <span className="text-white font-medium text-[11px]">Live</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400 text-[11px]">
            {data?.benchmark_latency_ms ? `${data.benchmark_latency_ms} ms` : '12 ms'}
          </span>
        </div>

        {/* Circular Refresh Button */}
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="w-8 h-8 rounded-full bg-black/60 border border-red-950/60 hover:border-red-700/60 flex items-center justify-center text-zinc-400 hover:text-white transition backdrop-blur-md cursor-pointer"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
        </button>
      </div>

      {/* Main Header Title Section */}
      <div className="mb-12 space-y-2">
        <div className="tracking-[0.4em] text-[11px] font-mono text-zinc-400 uppercase">
          F I N A N C E
        </div>
        <h1 className="text-5xl sm:text-7xl font-serif font-normal text-white tracking-tight">
          Dashboard<span className="text-red-600 font-sans">.</span>
        </h1>
        <div className="tracking-[0.3em] text-[11px] font-mono text-zinc-400 uppercase pt-1">
          R E A L - T I M E &nbsp; I N S I G H T S &nbsp; A T &nbsp; A &nbsp; G L A N C E
        </div>
      </div>

      {/* The 4 Glassmorphic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Subscriptions */}
        <div className="relative rounded-2xl bg-black/40 backdrop-blur-md border border-red-950/50 hover:border-red-700/50 transition-all p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] group">
          {/* Top Row: Icon + Subtle Wave */}
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-red-950/30 border border-red-800/40 flex items-center justify-center text-red-400 group-hover:text-red-300 transition">
              <Users className="w-4 h-4" />
            </div>
            {/* Subtle Neon Sparkline curve */}
            <svg className="w-20 h-6 opacity-40 text-red-500" viewBox="0 0 100 24" fill="none">
              <path d="M0 18 Q 25 18, 40 12 T 70 8 T 100 14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="tracking-[0.25em] text-[10px] font-mono text-zinc-400 uppercase mb-2">
            S U B S C R I P T I O N S
          </div>

          <div className="text-3xl font-serif font-bold text-white tracking-tight">
            {metrics.active_subscriptions ?? 0}
          </div>

          {/* Underline accent */}
          <div className="w-10 h-0.5 bg-red-700/70 mt-3 rounded-full shadow-[0_0_8px_#b91c1c]"></div>
        </div>

        {/* Card 2: MRR */}
        <div className="relative rounded-2xl bg-black/40 backdrop-blur-md border border-red-950/50 hover:border-red-700/50 transition-all p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] group">
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-red-950/30 border border-red-800/40 flex items-center justify-center text-red-400 group-hover:text-red-300 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
            <svg className="w-20 h-6 opacity-40 text-red-500" viewBox="0 0 100 24" fill="none">
              <path d="M0 20 Q 30 20, 50 10 T 80 6 T 100 2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="tracking-[0.25em] text-[10px] font-mono text-zinc-400 uppercase mb-2">
            M R R
          </div>

          <div className="text-3xl font-serif font-bold text-white tracking-tight">
            ₹{Math.round(metrics.monthly_recurring_revenue_mrr || 0).toLocaleString('en-IN')}
          </div>

          <div className="w-10 h-0.5 bg-red-700/70 mt-3 rounded-full shadow-[0_0_8px_#b91c1c]"></div>
        </div>

        {/* Card 3: Revenue */}
        <div className="relative rounded-2xl bg-black/40 backdrop-blur-md border border-red-950/50 hover:border-red-700/50 transition-all p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] group">
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-red-950/30 border border-red-800/40 flex items-center justify-center text-red-400 group-hover:text-red-300 transition">
              <IndianRupee className="w-4 h-4" />
            </div>
            <svg className="w-20 h-6 opacity-40 text-red-500" viewBox="0 0 100 24" fill="none">
              <path d="M0 16 Q 30 16, 55 12 T 80 8 T 100 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="tracking-[0.25em] text-[10px] font-mono text-zinc-400 uppercase mb-2">
            R E V E N U E
          </div>

          <div className="text-3xl font-serif font-bold text-white tracking-tight">
            ₹{Math.round(metrics.total_revenue_collected || 0).toLocaleString('en-IN')}
          </div>

          <div className="w-10 h-0.5 bg-red-700/70 mt-3 rounded-full shadow-[0_0_8px_#b91c1c]"></div>
        </div>

        {/* Card 4: Receivables */}
        <div className="relative rounded-2xl bg-black/40 backdrop-blur-md border border-red-950/50 hover:border-red-700/50 transition-all p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] group">
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-red-950/30 border border-red-800/40 flex items-center justify-center text-red-400 group-hover:text-red-300 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <svg className="w-20 h-6 opacity-40 text-red-500" viewBox="0 0 100 24" fill="none">
              <path d="M0 14 Q 30 14, 50 18 T 80 12 T 100 16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="tracking-[0.25em] text-[10px] font-mono text-zinc-400 uppercase mb-2">
            R E C E I V A B L E S
          </div>

          <div className="text-3xl font-serif font-bold text-white tracking-tight">
            ₹{Math.round(metrics.total_amount_owed || 0).toLocaleString('en-IN')}
          </div>

          <div className="w-10 h-0.5 bg-red-700/70 mt-3 rounded-full shadow-[0_0_8px_#b91c1c]"></div>
        </div>

      </div>

    </div>
  );
}
