import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Layers, 
  FileText, 
  Package, 
  Settings, 
  Store, 
  Users, 
  User, 
  ShieldCheck,
  Check, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onSwitchUser, onLogout }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const role = currentUser?.role || 'customer';

  // Role-based navigation items
  let menuItems = [];

  if (role === 'customer') {
    menuItems = [
      { id: 'store', label: 'Live Store', icon: Store },
      { id: 'portal', label: 'My Portal', icon: User },
    ];
  } else if (role === 'staff') {
    menuItems = [
      { id: 'store', label: 'Live Store', icon: Store },
      { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
      { id: 'billing_day', label: 'Billing', icon: Calendar },
      { id: 'subscriptions', label: 'Subscriptions', icon: Layers },
      { id: 'invoices', label: 'Invoices', icon: FileText },
      { id: 'products', label: 'Products', icon: Package },
    ];
  } else {
    // Admin has full control of whole system + Staff Management & Settings
    menuItems = [
      { id: 'store', label: 'Live Store', icon: Store },
      { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
      { id: 'billing_day', label: 'Billing', icon: Calendar },
      { id: 'subscriptions', label: 'Subscriptions', icon: Layers },
      { id: 'invoices', label: 'Invoices', icon: FileText },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'staff_mgmt', label: 'Staff & Members', icon: Users },
      { id: 'firewall', label: 'Firewall & WAF', icon: ShieldCheck },
      { id: 'plans_rules', label: 'Settings', icon: Settings },
    ];
  }

  const quickRoles = [
    { id: 'ADMIN', pass: '1234', label: '👑 Admin (Full System Control)', role: 'admin' },
    { id: 'MEMBER1', pass: '1234', label: '⚙️ Member1 (Staff Limited Access)', role: 'staff' },
    { id: 'CUSTOMER', pass: '1234', label: '🏢 Customer (Acme Corp Portal)', role: 'customer' },
  ];

  return (
    <aside className="sidebar" aria-label="Main navigation">
      
      {/* Brand Header */}
      <a 
        className="brand" 
        href="#dashboard" 
        onClick={(e) => { 
          e.preventDefault(); 
          setActiveTab(role === 'customer' ? 'portal' : 'analytics'); 
        }} 
        aria-label="Odoo Perfumes home"
      >
        <span className="brand-mark">O</span>
        <span className="brand-copy">
          <strong>Odoo Perfumes</strong>
          <small>Luxury Fragrance Edition</small>
        </span>
      </a>

      <div className="sidebar-rule"></div>

      {/* Navigation List */}
      <nav className="nav-list">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <IconComponent 
                  size={20} 
                  strokeWidth={isActive ? 2.2 : 1.8} 
                />
              </span>
              <span className="nav-label">{item.label}</span>
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
              SWITCH ACCOUNT (1-CLICK)
            </div>
            {quickRoles.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  onSwitchUser(r.id, r.pass);
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                  (currentUser?.username === r.id || currentUser?.role === r.role)
                    ? 'bg-red-950/70 text-white font-semibold border border-red-700/60'
                    : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span>{r.label}</span>
                {(currentUser?.username === r.id || currentUser?.role === r.role) && (
                  <Check className="w-3.5 h-3.5 text-red-400" />
                )}
              </button>
            ))}

            <div className="pt-2 mt-1 border-t border-zinc-800">
              <button
                onClick={() => {
                  setShowRoleMenu(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-red-400 hover:bg-red-950/40 transition cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of System</span>
              </button>
            </div>
          </div>
        )}

        {/* Profile Card Button */}
        <button
          className="profile-switch"
          id="profileSwitch"
          onClick={() => setShowRoleMenu(!showRoleMenu)}
        >
          <span className="avatar">
            {currentUser?.name?.charAt(0) || 'U'}
          </span>
          <span className="profile-meta">
            <strong>
              {currentUser?.role === 'admin' ? '♛ Admin' : currentUser?.role === 'staff' ? '⚙️ Staff' : '🏢 Customer'}
            </strong>
            <small>{currentUser?.username || currentUser?.name || 'Active User'}</small>
          </span>
          <span className="chevron">⌄</span>
        </button>
      </div>

    </aside>
  );
}
