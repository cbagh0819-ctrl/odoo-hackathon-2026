import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onSwitchUser }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const menuItems = [
    { id: 'store', label: 'Live Store', icon: '🏪', tag: 'LIVE' },
    { id: 'analytics', label: 'Dashboard', icon: '▥' },
    { id: 'billing_day', label: 'Billing', icon: '▦', tag: 'AUTO' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '▱' },
    { id: 'invoices', label: 'Invoices', icon: '▤' },
    { id: 'products', label: 'Products', icon: '◇' },
    { id: 'plans_rules', label: 'Settings', icon: '⚙' },
  ];

  const roles = [
    { email: 'admin@brightloop.com', label: '♛ Admin (Full access)', role: 'Admin' },
    { email: 'staff@brightloop.com', label: '⚙ Staff (Billing & Sales)', role: 'Staff' },
    { email: 'acme@corp.com', label: '🏢 Acme Corp (Customer)', role: 'Customer' },
    { email: 'techstore@shop.com', label: '🏪 Kochi Tech (Customer)', role: 'Customer' },
  ];

  return (
    <aside className="sidebar" aria-label="Main navigation">
      
      {/* Brand Header */}
      <a className="brand" href="#dashboard" onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }} aria-label="Brightloop home">
        <span className="brand-mark">B</span>
        <span className="brand-copy">
          <strong>Brightloop</strong>
          <small>Odoo ERP Edition</small>
        </span>
      </a>

      <div className="sidebar-rule"></div>

      {/* Navigation List */}
      <nav className="nav-list">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.tag && <span className="nav-tag">{item.tag}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Promo & Persona Switcher */}
      <div className="sidebar-bottom">
        <div className="sidebar-promo">
          <span className="promo-orb"></span>
          <p className="eyebrow">RECURRING, REIMAGINED</p>
          <p className="promo-title">Clarity in every cycle.</p>
          <span className="promo-line"></span>
        </div>

        {/* Role Switcher Menu Popup */}
        {showRoleMenu && (
          <div className="absolute bottom-20 left-4 right-4 bg-[#140609] border border-red-600/40 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 backdrop-blur-xl">
            <div className="px-2 py-1 text-[10px] font-mono tracking-wider text-red-400 uppercase font-semibold">
              SWITCH PERSONA
            </div>
            {roles.map((r) => (
              <button
                key={r.email}
                onClick={() => {
                  onSwitchUser(r.email);
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                  currentUser?.email === r.email
                    ? 'bg-red-950/70 text-white font-semibold border border-red-700/60'
                    : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span>{r.label}</span>
                {currentUser?.email === r.email && <Check className="w-3.5 h-3.5 text-red-400" />}
              </button>
            ))}
          </div>
        )}

        <button
          className="profile-switch"
          id="profileSwitch"
          onClick={() => setShowRoleMenu(!showRoleMenu)}
        >
          <span className="avatar">
            {currentUser?.name?.charAt(0) || 'U'}
          </span>
          <span className="profile-meta">
            <strong>♛ {currentUser?.role === 'admin' ? 'Admin' : currentUser?.role || 'User'}</strong>
            <small>{currentUser?.name || 'Full access'}</small>
          </span>
          <span className="chevron">⌄</span>
        </button>
      </div>

    </aside>
  );
}
