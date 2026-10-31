import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';
import LoginPage from './components/LoginPage';
import FinanceDashboard from './pages/FinanceDashboard';
import BillingDayView from './pages/BillingDayView';
import SubscriptionsView from './pages/SubscriptionsView';
import InvoicesView from './pages/InvoicesView';
import ProductsView from './pages/ProductsView';
import PlansAndRulesView from './pages/PlansAndRulesView';
import CustomerPortalView from './pages/CustomerPortalView';
import LiveStoreView from './pages/LiveStoreView';
import StaffManagementView from './pages/StaffManagementView';
import { apiRequest, setAuthToken, setCurrentUser, getCurrentUser, clearAuth } from './api';

export default function App() {
  const [currentUser, setUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('analytics');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [liveToast, setLiveToast] = useState(null);

  const handlePurchaseNotification = (order) => {
    setLiveToast(order);
    setTimeout(() => setLiveToast(null), 7000);
  };

  // Switch or authenticate user
  const handleUserLogin = async (loginId, password) => {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login_id: loginId, password: password })
      });

      setAuthToken(res.access_token);
      setCurrentUser(res.user);
      setUser(res.user);

      // Route by role
      if (res.user.role === 'customer') {
        setActiveTab('portal');
      } else {
        setActiveTab('analytics');
      }
    } catch (err) {
      console.error('Failed to authenticate:', err);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  const handleLoginSuccess = (user) => {
    setUser(user);
    if (user.role === 'customer') {
      setActiveTab('portal');
    } else {
      setActiveTab('analytics');
    }
  };

  // Adjust active tab if user role changes or doesn't have permission
  useEffect(() => {
    if (currentUser?.role === 'customer' && activeTab !== 'portal' && activeTab !== 'store') {
      setActiveTab('portal');
    }
    if (currentUser?.role === 'staff' && activeTab === 'staff_mgmt') {
      setActiveTab('analytics');
    }
  }, [currentUser, activeTab]);

  const tabTitles = {
    store: 'Live Perfume Store',
    analytics: 'Dashboard',
    billing_day: 'Billing Operations',
    subscriptions: 'Subscriptions',
    invoices: 'Invoices & Payments',
    products: 'Products & Catalog',
    staff_mgmt: 'Staff & Members',
    plans_rules: 'Settings',
    portal: 'Customer Portal',
  };

  // 1. Initial Luxury Loading Screen
  if (isAppLoading) {
    return <LoadingScreen onFinished={() => setIsAppLoading(false)} />;
  }

  // 2. Unauthenticated Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Authenticated Workspace
  return (
    <div className="min-h-screen bg-[#080405] text-[#f5f0ee] relative overflow-x-hidden selection:bg-red-600 selection:text-white">
      
      {/* Ambient Radial Glowing Orbs matching uploaded styles.css */}
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      <div className="shell">
        {/* Left Vertical Luxury Sidebar with Role Guard */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onSwitchUser={handleUserLogin}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="main-area">
          
          {/* Top Bar with Breadcrumbs & Role Indicator */}
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
                  onClick={() => {
                    if (currentUser?.role === 'admin') {
                      handleUserLogin('MEMBER1', '1234');
                    } else if (currentUser?.role === 'staff') {
                      handleUserLogin('CUSTOMER', '1234');
                    } else {
                      handleUserLogin('ADMIN', '1234');
                    }
                  }}
                  title="Click to quickly toggle persona"
                >
                  <span>{currentUser?.role === 'admin' ? '👑' : currentUser?.role === 'staff' ? '⚙️' : '🏢'}</span> 
                  <span className="capitalize">{currentUser?.username || currentUser?.role}</span> 
                  <span className="chevron">⌄</span>
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-xs text-zinc-500 hover:text-red-400 transition ml-1"
                title="Log out"
              >
                Log Out
              </button>
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

          {/* Page Viewport based on Role Permissions */}
          <div style={{ padding: '34px clamp(20px, 3vw, 48px) 30px' }}>
            {activeTab === 'store' && <LiveStoreView onPurchaseSuccess={handlePurchaseNotification} />}
            {activeTab === 'analytics' && currentUser?.role !== 'customer' && <FinanceDashboard setActiveTab={setActiveTab} />}
            {activeTab === 'billing_day' && currentUser?.role !== 'customer' && <BillingDayView />}
            {activeTab === 'subscriptions' && currentUser?.role !== 'customer' && <SubscriptionsView />}
            {activeTab === 'invoices' && currentUser?.role !== 'customer' && <InvoicesView />}
            {activeTab === 'products' && currentUser?.role !== 'customer' && <ProductsView />}
            {activeTab === 'staff_mgmt' && currentUser?.role === 'admin' && <StaffManagementView currentUser={currentUser} />}
            {activeTab === 'plans_rules' && currentUser?.role === 'admin' && <PlansAndRulesView currentUser={currentUser} />}
            {activeTab === 'portal' && <CustomerPortalView currentUser={currentUser} />}
          </div>

        </main>
      </div>

    </div>
  );
}
