import React from 'react';
import { 
  BarChart3, Calendar, Layers, FileText, Package, Tag, 
  UserCheck, ShieldCheck, User, LogOut, ShoppingBag, Sparkles
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onSwitchUser }) {
  const isCustomer = currentUser?.role === 'customer';

  const tabs = isCustomer ? [
    { id: 'store', label: '🛍️ Cosmetics Storefront', icon: ShoppingBag, highlight: true },
    { id: 'portal', label: 'My Subscriptions & Invoices', icon: UserCheck },
  ] : [
    { id: 'store', label: '🛍️ Cosmetics Storefront', icon: ShoppingBag, highlight: true },
    { id: 'analytics', label: 'Finance Dashboard', icon: BarChart3 },
    { id: 'billing_day', label: 'Billing Day', icon: Calendar, badge: 'Auto' },
    { id: 'subscriptions', label: 'Subscriptions Pipeline', icon: Layers },
    { id: 'invoices', label: 'Invoices & Payments', icon: FileText },
    { id: 'products', label: 'Products & Variants', icon: Package },
    { id: 'plans_rules', label: 'Plans, Taxes & Discounts', icon: Tag },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#714B67] flex items-center justify-center text-white font-bold text-xl shadow">
              B
            </div>
            <div>
              <span className="text-xl font-bold text-[#714B67]">Odoo Perfumes</span>
              <span className="text-xs ml-1.5 px-2 py-0.5 bg-purple-100 text-[#714B67] rounded-full font-semibold">
                Odoo ERP Edition
              </span>
              <div className="text-[11px] text-slate-500">Subscription & Recurring Billing</div>
            </div>
          </div>

          {/* Quick Evaluator Role Switcher */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-500 px-2 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />
                Active Persona:
              </span>
              <select
                className="bg-white text-xs font-semibold text-slate-700 py-1 px-2 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                value={currentUser?.email || ''}
                onChange={(e) => onSwitchUser(e.target.value)}
              >
                <option value="admin@brightloop.com">👑 Admin (Full Access)</option>
                <option value="staff@brightloop.com">⚙️ Staff (Sales & Billing)</option>
                <option value="acme@corp.com">🏢 Customer (Acme Corp)</option>
                <option value="techstore@shop.com">🏪 Customer (Kochi Tech Store)</option>
              </select>
            </div>

            <div className="hidden md:flex items-center text-xs text-slate-600 space-x-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-[#714B67] flex items-center justify-center font-bold">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-semibold">{currentUser?.name}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-purple-700">
                  {currentUser?.role}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#714B67] text-white shadow-sm'
                    : tab.highlight
                    ? 'text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {tab.label}
                {tab.badge && (
                  <span className={`ml-2 px-1.5 py-0.2 text-[10px] font-bold rounded ${
                    isActive ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
