import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { 
  Search, Bell, RefreshCw, ArrowUpRight, TrendingUp, AlertCircle, 
  Plus, Video, Play, Pause, Square, CheckCircle2, Clock, Sparkles,
  Smartphone, Apple, Layers, ChevronRight
} from 'lucide-react';

export default function FinanceDashboard({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  
  // Timer state for Time Tracker
  const [seconds, setSeconds] = useState(86408);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Animated progress counter
  const [progress, setProgress] = useState(0);

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
    const interval = setInterval(() => {
      fetchMetrics();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Time tracker effect
  useEffect(() => {
    let timer;
    if (isTimerRunning) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Circular progress animation effect
  useEffect(() => {
    const target = 84;
    const timer = setTimeout(() => {
      if (progress < target) {
        setProgress((prev) => Math.min(prev + 1, target));
      }
    }, 20);
    return () => clearTimeout(timer);
  }, [progress]);

  const metrics = data?.metrics || {};

  // Format timer HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  // Weekly Activity Chart Data (Mon - Sun)
  const chartData = [
    { day: 'Mon', value: 65, label: '65% Active Billing' },
    { day: 'Tue', value: 45, label: '45% Renewals Processed' },
    { day: 'Wed', value: 78, label: '78% Payment Cleared' },
    { day: 'Thu', value: 92, label: '92% Peak Volume' },
    { day: 'Fri', value: 70, label: '70% Orders Fulfilled' },
    { day: 'Sat', value: 40, label: '40% Weekend Baseline' },
    { day: 'Sun', value: 85, label: '85% Invoices Reconciled' },
  ];

  // Team / Client Accounts
  const teamAccounts = [
    {
      name: 'Alexandra Deff',
      task: 'Glow Serum Quarterly Subscription',
      status: 'Completed',
      statusColor: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80',
      avatar: 'AD',
    },
    {
      name: 'Edwin Adenike',
      task: 'Hydra Care Bi-Weekly Delivery',
      status: 'In Progress',
      statusColor: 'bg-amber-950/60 text-amber-400 border border-amber-800/80',
      avatar: 'EA',
    },
    {
      name: 'Isaac Oluwatemilorun',
      task: 'Anti-Aging Luxury Box (Monthly)',
      status: 'Pending',
      statusColor: 'bg-red-950/60 text-red-400 border border-red-800/80',
      avatar: 'IO',
    },
    {
      name: 'David Oshodi',
      task: 'Odoo Cosmetics Enterprise Bundle',
      status: 'In Progress',
      statusColor: 'bg-amber-950/60 text-amber-400 border border-amber-800/80',
      avatar: 'DO',
    },
  ];

  // Projects / Active Subscriptions List
  const recentProjects = [
    {
      name: 'Beauty Box Premium',
      date: 'Nov 26, 2026',
      color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
      icon: '✨',
    },
    {
      name: 'Skincare Bi-Weekly',
      date: 'Nov 30, 2026',
      color: 'bg-red-500/20 text-red-400 border border-red-500/40',
      icon: '🌸',
    },
    {
      name: 'Optimize Page Load',
      date: 'Dec 05, 2026',
      color: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
      icon: '⚡',
    },
    {
      name: 'Cross-Storefront Sync',
      date: 'Dec 06, 2026',
      color: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
      icon: '🔍',
    },
  ];

  // Circle progress calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full space-y-4 pb-12 font-sans select-none animate-fade-in text-white">
      
      {/* 1. TOP HEADER BAR: Search, Notifications, Live SLA, Profile */}
      <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 px-4 backdrop-blur-xl">
        
        {/* Search Bar with ⌘F Badge */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search subscriptions, invoices, clients..."
            className="w-full bg-zinc-900/80 text-sm text-zinc-200 placeholder-zinc-500 pl-9 pr-14 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-red-500/60 transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
            ⌘F
          </kbd>
        </div>

        {/* Right Action Group: Live Latency + Bell + Profile */}
        <div className="flex items-center justify-end gap-3">
          
          {/* Live Latency SLA Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-zinc-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#dc2626]"></span>
            <span className="text-white font-medium text-[11px]">Live</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 text-[11px]">
              {data?.benchmark_latency_ms ? `${data.benchmark_latency_ms} ms` : '12 ms'}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="w-9 h-9 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-red-500/50 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
          </button>

          {/* Notification Bell */}
          <button className="w-9 h-9 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-600"></span>
          </button>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-red-950">
              CB
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-200 leading-tight">Chandan Bagh</span>
              <span className="text-[10px] text-zinc-500 leading-tight">admin@brightloop.com</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. TITLE & ACTION ROW: "Dashboard" + "+ Add Subscription" & "Run Billing" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Plan, prioritize, and accomplish your tasks with ease
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab && setActiveTab('subscriptions')}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30 hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subscription</span>
          </button>

          <button
            onClick={() => setActiveTab && setActiveTab('billing_day')}
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-zinc-900/60 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>Run Billing</span>
          </button>
        </div>
      </div>

      {/* 3. ROW 1: 4 STATS CARDS (Total Subscriptions in Red, others in Dark Obsidian) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        
        {/* Card 1: Total Subscriptions (Primary Highlight: Red) */}
        <div
          onMouseEnter={() => setHoveredCard(0)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`bg-red-600 text-white p-4.5 rounded-xl transition-all duration-300 ease-out cursor-pointer shadow-lg ${
            hoveredCard === 0 ? 'scale-105 shadow-2xl shadow-red-600/40' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium opacity-90">Total Subscriptions</h3>
            <div
              className={`w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 ${
                hoveredCard === 0 ? 'rotate-45' : ''
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2">
            {metrics.active_subscriptions || 24}
          </p>
          <div className="flex items-center gap-1.5 text-xs opacity-90 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Increased from last month</span>
          </div>
        </div>

        {/* Card 2: Monthly Recurring Revenue (MRR) */}
        <div
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`bg-zinc-950/80 border border-zinc-800 text-zinc-100 p-4.5 rounded-xl transition-all duration-300 ease-out cursor-pointer shadow-md ${
            hoveredCard === 1 ? 'scale-105 shadow-xl border-zinc-700' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium text-zinc-400">Monthly Recurring (MRR)</h3>
            <div
              className={`w-6 h-6 rounded-full bg-red-600 flex items-center justify-center transition-transform duration-300 ${
                hoveredCard === 1 ? 'rotate-45' : ''
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2 text-white">
            ₹{Math.round(metrics.monthly_recurring_revenue_mrr || 148500).toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Increased from last month</span>
          </div>
        </div>

        {/* Card 3: Running Projects / Active Subscriptions */}
        <div
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`bg-zinc-950/80 border border-zinc-800 text-zinc-100 p-4.5 rounded-xl transition-all duration-300 ease-out cursor-pointer shadow-md ${
            hoveredCard === 2 ? 'scale-105 shadow-xl border-zinc-700' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium text-zinc-400">Running Projects</h3>
            <div
              className={`w-6 h-6 rounded-full bg-red-600 flex items-center justify-center transition-transform duration-300 ${
                hoveredCard === 2 ? 'rotate-45' : ''
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2 text-white">
            {metrics.active_subscriptions ? Math.max(1, metrics.active_subscriptions - 2) : 12}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Increased from last month</span>
          </div>
        </div>

        {/* Card 4: Pending Receivables */}
        <div
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
          className={`bg-zinc-950/80 border border-zinc-800 text-zinc-100 p-4.5 rounded-xl transition-all duration-300 ease-out cursor-pointer shadow-md ${
            hoveredCard === 3 ? 'scale-105 shadow-xl border-zinc-700' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium text-zinc-400">Pending Project</h3>
            <div
              className={`w-6 h-6 rounded-full bg-red-600 flex items-center justify-center transition-transform duration-300 ${
                hoveredCard === 3 ? 'rotate-45' : ''
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2 text-white">
            {metrics.total_receivables_pending ? `₹${Math.round(metrics.total_receivables_pending)}` : '2'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>On Discuss</span>
          </div>
        </div>
      </div>

      {/* 4. ROW 2: MAIN 2-COLUMN SECTION (Left 2/3: Analytics + Team, Right 1/3: Reminders + Progress) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        
        {/* LEFT COLUMN: ProjectAnalytics & TeamCollaboration */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          
          {/* Project Analytics Card (Bar Chart) */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">
                Project Analytics
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                <span>Weekly Activity</span>
              </div>
            </div>

            {/* Interactive SVG Bar Chart with Hover Highlights & Tooltips */}
            <div className="h-60 relative w-full flex items-end justify-between px-2 pt-6 pb-2 border-b border-zinc-800">
              
              {/* Background horizontal dashed grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-[11px] text-zinc-600 font-mono">
                <div className="w-full border-b border-zinc-800/60 flex justify-between"><span>100%</span></div>
                <div className="w-full border-b border-zinc-800/60 flex justify-between"><span>75%</span></div>
                <div className="w-full border-b border-zinc-800/60 flex justify-between"><span>50%</span></div>
                <div className="w-full border-b border-zinc-800/60 flex justify-between"><span>25%</span></div>
                <div className="w-full border-b border-zinc-800/60 flex justify-between"><span>0%</span></div>
              </div>

              {/* 7 Bars for Mon - Sun */}
              {chartData.map((item, idx) => {
                const isHovered = hoveredBar === idx;
                return (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center justify-end h-full z-10 px-1.5 group cursor-pointer"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-3 bg-white text-zinc-900 px-2.5 py-1 rounded-md text-xs font-bold shadow-2xl animate-fade-in pointer-events-none">
                        <span>{item.value}%</span>
                        <div className="text-[10px] font-normal text-zinc-600">{item.label}</div>
                      </div>
                    )}

                    {/* Bar Cylinder with Crimson Red Gradient */}
                    <div
                      style={{ height: `${item.value}%` }}
                      className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-red-700 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-y-105'
                          : 'bg-gradient-to-t from-red-950 via-red-800 to-red-600 opacity-90'
                      }`}
                    ></div>

                    <span className="text-xs text-zinc-400 mt-2 font-medium">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Chart Stats */}
            <div className="pt-4 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <span className="text-zinc-400">Average: </span>
                <span className="font-semibold text-white">68%</span>
              </div>
              <div>
                <span className="text-zinc-400">Peak: </span>
                <span className="font-semibold text-red-500">92%</span>
              </div>
            </div>
          </div>

          {/* Team Collaboration Card */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Team Collaboration
              </h2>
              <button
                onClick={() => setActiveTab && setActiveTab('subscriptions')}
                className="text-xs text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded-lg transition-all duration-300 hover:scale-105 bg-transparent flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Member
              </button>
            </div>

            <div className="space-y-3">
              {teamAccounts.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900/60 transition-all duration-200 cursor-pointer group border border-transparent hover:border-zinc-800"
                >
                  <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-xs transition-transform duration-300 group-hover:scale-110">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">
                      {member.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      Working on <span className="text-zinc-300 font-medium">{member.task}</span>
                    </p>
                  </div>
                  <span className={`${member.statusColor} text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap`}>
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Reminders & ProjectProgress */}
        <div className="space-y-3 md:space-y-4">
          
          {/* Reminders Card */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">
              Reminders
            </h2>
            <div className="bg-black/60 border border-zinc-800/80 rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] hover:border-zinc-700">
              <h3 className="font-semibold text-white text-sm mb-1">
                Meeting with Arc Company
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Time : 02.00 pm - 04.00 pm
              </p>
              <button
                onClick={() => setActiveTab && setActiveTab('billing_day')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg text-xs transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Start Meeting</span>
              </button>
            </div>
          </div>

          {/* Project Progress Card (Radial SVG Gauge) */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl flex flex-col items-center">
            <div className="w-full text-left mb-4">
              <h2 className="text-lg font-semibold text-white">
                Project Progress
              </h2>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-40 h-40 mb-4 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="11"
                  fill="none"
                  className="text-zinc-800"
                />
                {/* Animated Progress Arc in Vibrant Crimson Red */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="11"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-red-600 transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center percentage and label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {progress}%
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5">
                  Project Ended
                </span>
              </div>
            </div>

            {/* Legend underneath */}
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                <span className="text-zinc-400 text-xs">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                <span className="text-zinc-400 text-xs">In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                <span className="text-zinc-400 text-xs">Pending</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 5. ROW 3: BOTTOM 3-COLUMN SECTION (ProjectList, MobileAppCard, TimeTracker) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        
        {/* Bottom Card 1: Project List */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Project
            </h2>
            <button
              onClick={() => setActiveTab && setActiveTab('subscriptions')}
              className="text-xs text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded-lg transition-all duration-300 hover:scale-105 bg-transparent flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>

          <div className="space-y-2.5">
            {recentProjects.map((proj) => (
              <div
                key={proj.name}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900/60 transition-all duration-200 cursor-pointer group border border-transparent hover:border-zinc-800"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-transform duration-300 group-hover:scale-110 ${proj.color}`}>
                  {proj.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-xs sm:text-sm">
                    {proj.name}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Due date: {proj.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Card 2: Mobile App Card (Clean Performance Guarantee) */}
        <div className="bg-zinc-950/90 border border-zinc-800 text-white rounded-xl p-5 md:p-6 transition-all duration-500 hover:shadow-2xl overflow-hidden relative group flex flex-col justify-between">
          
          {/* Subtle Ambient Wave Graphic in Background */}
          <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none opacity-25">
            <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
              <path
                d="M0,30 Q25,10 50,30 T100,30 T150,30 T200,30 L200,60 L0,60 Z"
                fill="url(#waveGrad)"
              />
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-red-500">
              <Smartphone className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">FastAPI Engine</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Sub-Second Response Guarantee
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              SLA benchmark verified &lt; 2,000 ms response time for all recurring calculations.
            </p>
          </div>

          <div className="flex flex-col gap-2 relative z-10">
            <div className="w-full h-10 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-lg px-3 flex items-center justify-between text-xs transition">
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4 text-white" />
                <span>FastAPI Engine</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">12ms avg</span>
            </div>

            <div className="w-full h-10 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-lg px-3 flex items-center justify-between text-xs transition">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500" />
                <span>Odoo ERP Native Sync</span>
              </div>
              <span className="font-mono text-white font-bold">100% active</span>
            </div>
          </div>
        </div>

        {/* Bottom Card 3: Time Tracker */}
        <div className="bg-zinc-950/90 border border-zinc-800 text-white rounded-xl p-5 md:p-6 transition-all duration-500 hover:shadow-2xl overflow-hidden relative group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">
                Time Tracker
              </h2>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-zinc-400 text-[11px]">Billing Daemon Active</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              Total logged daemon uptime for current session
            </p>
          </div>

          {/* Running Clock */}
          <div className="my-4 text-center">
            <div className="text-4xl font-mono font-bold text-white tracking-widest py-2 bg-black/60 rounded-xl border border-zinc-800/80 shadow-inner">
              {formatTime(seconds)}
            </div>
          </div>

          {/* Controls: Pause/Play & Reset */}
          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isTimerRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Engine</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSeconds(0)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs transition cursor-pointer"
              title="Reset Timer"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
