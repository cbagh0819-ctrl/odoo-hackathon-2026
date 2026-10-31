import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FinanceDashboard from './pages/FinanceDashboard';
import BillingDayView from './pages/BillingDayView';
import SubscriptionsView from './pages/SubscriptionsView';
import InvoicesView from './pages/InvoicesView';
import ProductsView from './pages/ProductsView';
import PlansAndRulesView from './pages/PlansAndRulesView';
import CustomerPortalView from './pages/CustomerPortalView';
import CosmeticsStorefront from './pages/CosmeticsStorefront';
import { apiRequest, setAuthToken, setCurrentUser, getCurrentUser } from './api';

export default function App() {
  const [currentUser, setUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('analytics');
  const [initialLoading, setInitialLoading] = useState(true);
  const [liveToast, setLiveToast] = useState(null);

  const handlePurchaseNotification = (order) => {
    setLiveToast(order);
    setTimeout(() => setLiveToast(null), 6000);
  };

  // Authenticate as a persona
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
    // Default sign in as Admin if no user is saved
    if (!currentUser) {
      switchUser('admin@brightloop.com').finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, []);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Brightloop ERP Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={switchUser}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Purchase Alert Toast */}
        {liveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-purple-500/50 flex items-center space-x-3 animate-slide-up max-w-sm">
            <span className="text-2xl">💄</span>
            <div className="text-xs">
              <div className="font-bold text-pink-300">Live Purchase Detected!</div>
              <div><strong>{liveToast.customer}</strong> just subscribed to <strong>{liveToast.product_name || 'Beauty Box'}</strong></div>
              <div className="text-emerald-400 font-semibold mt-0.5">+₹{liveToast.total_paid?.toFixed(2)} added to MRR</div>
            </div>
          </div>
        )}

        {activeTab === 'store' && <CosmeticsStorefront onPurchaseSuccess={handlePurchaseNotification} />}
        {activeTab === 'analytics' && <FinanceDashboard />}
        {activeTab === 'billing_day' && <BillingDayView />}
        {activeTab === 'subscriptions' && <SubscriptionsView />}
        {activeTab === 'invoices' && <InvoicesView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'plans_rules' && <PlansAndRulesView currentUser={currentUser} />}
        {activeTab === 'portal' && <CustomerPortalView currentUser={currentUser} />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Brightloop Software &bull; Odoo Hackathon 2026 Edition &bull; Sub-2s Response Guarantee &bull; Single-Branch Single-Contract Architecture
      </footer>
    </div>
  );
}
