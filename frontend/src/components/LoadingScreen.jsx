import React, { useEffect, useState } from 'react';

export default function LoadingScreen({ onFinished }) {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(45), 300);
    const timer2 = setTimeout(() => setProgress(80), 800);
    const timer3 = setTimeout(() => setProgress(100), 1300);
    const timer4 = setTimeout(() => onFinished(), 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-50 bg-[#080405] flex flex-col items-center justify-center p-6 select-none animate-fade-in overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="ambient ambient-one" style={{ opacity: 0.6 }}></div>
      <div className="ambient ambient-two" style={{ opacity: 0.6 }}></div>

      {/* Center Luxury Emblem */}
      <div className="relative flex flex-col items-center text-center max-w-sm">
        
        {/* Animated Golden Flask / Monogram */}
        <div className="relative mb-6">
          <div 
            className="w-20 h-20 rounded-2xl border border-[#d4af37] flex items-center justify-center text-white font-serif font-bold text-4xl shadow-[0_0_40px_rgba(212,175,55,0.35)] animate-float"
            style={{
              background: 'linear-gradient(145deg, rgba(30,8,13,0.9), rgba(10,4,6,0.95))'
            }}
          >
            O
          </div>
          {/* Pulsing Outer Ring */}
          <div className="absolute -inset-3 rounded-3xl border border-red-600/30 animate-pulse pointer-events-none"></div>
        </div>

        {/* Title & Brand */}
        <p className="eyebrow" style={{ color: '#d4af37', letterSpacing: '3px' }}>
          HAUTE PARFUMERIE ERP
        </p>
        <h1 className="text-3xl font-serif text-white tracking-tight mt-2 mb-1">
          Odoo Perfumes<span className="red-dot">.</span>
        </h1>
        <p className="text-xs text-zinc-400 font-sans tracking-wide">
          Subscription Management & Recurring Billing Platform
        </p>

        {/* Animated Progress Bar */}
        <div className="w-64 h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-8 border border-zinc-800">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-500 ease-out shadow-[0_0_12px_#ef4444]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Subtitle ticker */}
        <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-zinc-500 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
          <span>INITIALIZING LUXURY WORKSPACE ({progress}%)</span>
        </div>

      </div>

    </div>
  );
}
