import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FinanceDashboard from './pages/FinanceDashboard';
import BillingDayView from './pages/BillingDayView';
import SubscriptionsView from './pages/SubscriptionsView';
import InvoicesView from './pages/InvoicesView';
import ProductsView from './pages/ProductsView';
import PlansAndRulesView from './pages/PlansAndRulesView';
import CosmeticsStorefront from './pages/CosmeticsStorefront';
import CustomerPortalView from './pages/CustomerPortalView';
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
        setActiveTab('store');
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
    <div className="min-h-screen bg-[#070102] text-zinc-100 flex relative overflow-x-hidden">
      
      {/* Background Graphic & Crimson Atmospheric Glow */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-45 bg-cover bg-center"
        style={{ backgroundImage: `url('/dashboard_bg.png')` }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-t from-[#070102] via-[#070102]/60 to-transparent" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Left Vertical Luxury Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={switchUser}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 min-h-screen z-10 px-6 sm:px-10 py-6 overflow-y-auto">
        
        {/* Real-Time Toast Alert */}
        {liveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-black/90 text-white p-4 rounded-2xl shadow-2xl border border-red-600/60 backdrop-blur-xl flex items-center space-x-4 animate-slide-up max-w-sm">
            <span className="text-3xl">💄</span>
            <div className="text-xs">
              <div className="font-bold text-red-400 font-mono uppercase tracking-wider text-[10px]">
                Live Subscription Received
              </div>
              <div className="font-medium text-white mt-0.5">
                <strong>{liveToast.customer}</strong> ordered {liveToast.product_name}
              </div>
              <div className="text-emerald-400 font-semibold font-mono mt-1">
                +₹{liveToast.total_paid?.toFixed(2)} &bull; MRR Updated Live!
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <FinanceDashboard />}
        {activeTab === 'store' && <CosmeticsStorefront onPurchaseSuccess={handlePurchaseNotification} />}
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
