import React, { useState } from 'react';
import { 
  Store, BarChart3, Calendar, Layers, FileText, Package, Settings, 
  ChevronRight, ShieldCheck, Check
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onSwitchUser }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const menuItems = [
    { id: 'store', label: 'Live Store', icon: Store, badge: 'Live' },
    { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
    { id: 'billing_day', label: 'Billing', icon: Calendar },
    { id: 'subscriptions', label: 'Subscriptions', icon: Layers },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'plans_rules', label: 'Settings', icon: Settings },
  ];

  const roles = [
    { email: 'admin@brightloop.com', label: 'Admin (Full System)', icon: '👑' },
    { email: 'staff@brightloop.com', label: 'Staff (Billing & Quotes)', icon: '⚙️' },
    { email: 'acme@corp.com', label: 'Customer: Acme Corp', icon: '🏢' },
    { email: 'techstore@shop.com', label: 'Customer: Kochi Tech', icon: '🏪' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-black/80 backdrop-blur-2xl border-r border-red-950/40 flex flex-col justify-between p-4 z-40 select-none">
      
      {/* Top Brand Header */}
      <div>
        <div className="flex items-center space-x-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-950/60 to-black border border-red-800/60 flex items-center justify-center text-white font-serif font-bold text-xl shadow-[0_0_15px_rgba(185,28,28,0.3)]">
            B
          </div>
          <div>
            <h1 className="text-lg font-serif tracking-tight text-white font-medium leading-tight">
              Brightloop
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans tracking-wide">
              Odoo ERP Edition
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-red-950/50 via-red-900/20 to-transparent text-white border border-red-600/50 shadow-[0_0_18px_rgba(220,38,38,0.22)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-zinc-500'}`} />
                  <span className={isActive ? 'font-semibold tracking-wide text-white' : ''}>
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Role Switcher */}
      <div className="relative pt-4 border-t border-red-950/40">
        
        {/* Role Menu Popover */}
        {showRoleMenu && (
          <div className="absolute bottom-16 left-0 right-0 bg-[#0d0204] border border-red-900/50 rounded-xl shadow-2xl p-2 text-xs space-y-1 z-50 animate-fade-in backdrop-blur-xl">
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-red-400/80 uppercase">
              Switch Active Persona
            </div>
            {roles.map(r => (
              <button
                key={r.email}
                onClick={() => {
                  onSwitchUser(r.email);
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                  currentUser?.email === r.email
                    ? 'bg-red-950/60 text-white border border-red-800/60 font-semibold'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{r.icon}</span>
                  <span className="truncate">{r.label}</span>
                </div>
                {currentUser?.email === r.email && (
                  <Check className="w-3.5 h-3.5 text-red-400" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Profile Trigger Button */}
        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition cursor-pointer group border border-transparent hover:border-red-950"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-700/80 border border-slate-600/60 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white flex items-center space-x-1">
                <span>{currentUser?.role === 'admin' ? '👑' : currentUser?.role === 'staff' ? '⚙️' : '👤'}</span>
                <span className="capitalize">{currentUser?.role || 'Admin'}</span>
              </div>
              <div className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                {currentUser?.name || 'Chandan Bagh'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition" />
        </button>
      </div>

    </aside>
  );
}
