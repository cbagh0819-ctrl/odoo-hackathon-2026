import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FinanceDashboard from './pages/FinanceDashboard';
import BillingDayView from './pages/BillingDayView';
import SubscriptionsView from './pages/SubscriptionsView';
import InvoicesView from './pages/InvoicesView';
import ProductsView from './pages/ProductsView';
import PlansAndRulesView from './pages/PlansAndRulesView';
import CustomerPortalView from './pages/CustomerPortalView';
import LiveStoreView from './pages/LiveStoreView';
import { apiRequest, setAuthToken, setCurrentUser, getCurrentUser } from './api';

export default function App() {
  const [currentUser, setUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('analytics');
  const [initialLoading, setInitialLoading] = useState(true);
  const [liveToast, setLiveToast] = useState(null);

  const handlePurchaseNotification = (order) => {
    setLiveToast(order);
    setTimeout(() => setLiveToast(null), 7000);
  };

  const switchUser = async (email) => {
    try {
      let password = 'Brightloop@2026';
      if (email.includes('@corp') || email.includes('@shop')) {
        password = 'Customer@2026';
      }

      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setAuthToken(res.access_token);
      setCurrentUser(res.user);
      setUser(res.user);

      if (res.user.role === 'customer') {
        setActiveTab('portal');
      } else if (activeTab === 'portal') {
        setActiveTab('analytics');
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      switchUser('admin@brightloop.com').finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, []);

  const tabTitles = {
    store: 'Live Storefront',
    analytics: 'Dashboard',
    billing_day: 'Billing Operations',
    subscriptions: 'Subscriptions',
    invoices: 'Invoices & Payments',
    products: 'Products & Catalog',
    plans_rules: 'Settings',
    portal: 'Customer Portal',
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080405] text-zinc-400 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span>INITIALIZING ODOO PERFUMES LUXURY SUITE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080405] text-[#f5f0ee] relative overflow-x-hidden selection:bg-red-600 selection:text-white">
      
      {/* Ambient Radial Glowing Orbs matching uploaded styles.css */}
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      <div className="shell">
        {/* Left Vertical Luxury Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onSwitchUser={switchUser}
        />

        {/* Main Content Area */}
        <main className="main-area">
          
          {/* Top Bar matching uploaded styles.css */}
          <header className="topbar">
            <div className="breadcrumb">
              <span>ODOO PERFUMES</span>
              <i>/</i>
              <strong id="crumbCurrent">{tabTitles[activeTab] || 'Dashboard'}</strong>
            </div>

            <div className="top-actions">
              <label className="search-wrap" aria-label="Search dashboard">
                <span>⌕</span>
                <input id="globalSearch" type="search" placeholder="Search anything..." autoComplete="off" />
                <kbd>⌘ K</kbd>
              </label>

              <button className="icon-button notification-button" id="notificationsButton" aria-label="Notifications">
                ♧<i></i>
              </button>

              <span className="top-divider"></span>

              <div className="persona-wrap">
                <span className="persona-label">ACTIVE PERSONA</span>
                <button 
                  className="persona-button"
                  onClick={() => switchUser(currentUser?.role === 'admin' ? 'staff@brightloop.com' : 'admin@brightloop.com')}
                >
                  <span>♛</span> {currentUser?.role === 'admin' ? 'Admin' : currentUser?.role || 'User'} <span className="chevron">⌄</span>
                </button>
              </div>
            </div>
          </header>

          {/* Real-time Purchase Alert Toast */}
          {liveToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#16070a] text-white p-4 rounded-xl shadow-2xl border border-red-600/60 backdrop-blur-xl flex items-center space-x-4 animate-slide-up max-w-sm">
              <span className="text-3xl">🎉</span>
              <div className="text-xs">
                <div className="font-bold text-red-400 font-mono uppercase tracking-wider text-[10px]">
                  Live Subscription Received
                </div>
                <div className="font-medium text-white mt-0.5">
                  <strong>{liveToast.customer}</strong> subscribed online
                </div>
                <div className="text-emerald-400 font-semibold font-mono mt-1">
                  +₹{liveToast.total_paid?.toFixed(2)} &bull; MRR & Dashboard Updated!
                </div>
              </div>
            </div>
          )}

          {/* Page Viewport */}
          <div style={{ padding: '34px clamp(20px, 3vw, 48px) 30px' }}>
            {activeTab === 'store' && <LiveStoreView onPurchaseSuccess={handlePurchaseNotification} />}
            {activeTab === 'analytics' && <FinanceDashboard setActiveTab={setActiveTab} />}
            {activeTab === 'billing_day' && <BillingDayView />}
            {activeTab === 'subscriptions' && <SubscriptionsView />}
            {activeTab === 'invoices' && <InvoicesView />}
            {activeTab === 'products' && <ProductsView />}
            {activeTab === 'plans_rules' && <PlansAndRulesView currentUser={currentUser} />}
            {activeTab === 'portal' && <CustomerPortalView currentUser={currentUser} />}
          </div>

        </main>
      </div>

    </div>
  );
}
