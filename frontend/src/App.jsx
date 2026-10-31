import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FinanceDashboard from './pages/FinanceDashboard';
import BillingDayView from './pages/BillingDayView';
import SubscriptionsView from './pages/SubscriptionsView';
import InvoicesView from './pages/InvoicesView';
import ProductsView from './pages/ProductsView';
import PlansAndRulesView from './pages/PlansAndRulesView';
import CustomerPortalView from './pages/CustomerPortalView';
import { apiRequest, setAuthToken, setCurrentUser, getCurrentUser } from './api';

export default function App() {
  const [currentUser, setUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('analytics');
  const [initialLoading, setInitialLoading] = useState(true);

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

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070102] text-zinc-400 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span>INITIALIZING BRIGHTLOOP LUXURY SUITE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070102] text-zinc-100 flex relative overflow-x-hidden selection:bg-red-600 selection:text-white">
      
      {/* Pure CSS Luxury Crimson Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/12 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-red-950/30 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-rose-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Left Vertical Luxury Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={switchUser}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 min-h-screen z-10 px-6 sm:px-10 py-6 overflow-y-auto">
        {activeTab === 'analytics' && <FinanceDashboard />}
        {activeTab === 'billing_day' && <BillingDayView />}
        {activeTab === 'subscriptions' && <SubscriptionsView />}
        {activeTab === 'invoices' && <InvoicesView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'plans_rules' && <PlansAndRulesView currentUser={currentUser} />}
        {activeTab === 'portal' && <CustomerPortalView currentUser={currentUser} />}
      </main>

    </div>
  );
}
