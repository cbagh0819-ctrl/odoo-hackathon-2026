import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Layers, Plus, ArrowRight } from 'lucide-react';

export default function SubscriptionsView() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // New subscription modal
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [newSub, setNewSub] = useState({
    customer_id: '',
    plan_id: '',
    payment_terms: 'Immediate Payment',
    discount_code: '',
    lines: [{ product_id: '', quantity: 1, unit_price: 0, tax_rate: 18 }]
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'ALL' ? '/subscriptions' : `/subscriptions?status_filter=${filterStatus}`;
      const res = await apiRequest(url);
      setSubscriptions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [filterStatus]);

  const loadModalData = async () => {
    try {
      const [pl, cu, pr] = await Promise.all([
        apiRequest('/plans'),
        apiRequest('/auth/customers').catch(() => []),
        apiRequest('/products')
      ]);
      setPlans(pl);
      setCustomers(cu);
      setProducts(pr);
      if (pl.length > 0) setNewSub(prev => ({ ...prev, plan_id: pl[0].id }));
      if (cu.length > 0) setNewSub(prev => ({ ...prev, customer_id: cu[0].id }));
      if (pr.length > 0) setNewSub(prev => ({ 
        ...prev, 
        lines: [{ product_id: pr[0].id, quantity: 1, unit_price: pr[0].sales_price, tax_rate: 18 }] 
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (subId, nextStatus) => {
    try {
      await apiRequest(`/subscriptions/${subId}/status?new_status=${nextStatus}`, { method: 'POST' });
      fetchSubscriptions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          ...newSub,
          customer_id: Number(newSub.customer_id),
          plan_id: Number(newSub.plan_id),
          lines: newSub.lines.map(l => ({
            ...l,
            product_id: Number(l.product_id),
            quantity: Number(l.quantity),
            unit_price: Number(l.unit_price),
            tax_rate: Number(l.tax_rate)
          }))
        })
      });
      setShowModal(false);
      fetchSubscriptions();
    } catch (err) {
      alert(`Error creating subscription: ${err.message}`);
    }
  };

  const statuses = ['ALL', 'Draft', 'Quotation', 'Confirmed', 'Active', 'Paused', 'Closed'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/50 backdrop-blur-xl border border-red-950/60 p-6 rounded-2xl shadow-2xl">
        <div>
          <div className="tracking-[0.3em] text-[10px] font-mono text-zinc-400 uppercase mb-1">
            LIFECYCLE PIPELINE
          </div>
          <h1 className="text-2xl font-serif text-white font-medium flex items-center">
            <Layers className="w-5 h-5 mr-2.5 text-red-500" />
            Subscription Lifecycle Engine
          </h1>
        </div>

        <button
          onClick={() => { setShowModal(true); loadModalData(); }}
          className="flex items-center px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-xs font-semibold rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.25)] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Subscription
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-red-950/40 pb-2 overflow-x-auto text-xs font-mono">
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              filterStatus === st 
                ? 'bg-red-950 text-white border border-red-700/60 shadow-[0_0_10px_rgba(220,38,38,0.3)] font-semibold' 
                : 'text-zinc-400 bg-black/40 border border-red-950/40 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-red-950/20 border-b border-red-950/40 uppercase font-mono text-zinc-400 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Sub #</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Plan ID</th>
                <th className="py-3 px-4">Terms</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Pipeline Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/30">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-zinc-500 font-mono">
                    No subscriptions found for {filterStatus}.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {sub.subscription_number}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      User #{sub.customer_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      Plan #{sub.plan_id}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {sub.payment_terms}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-red-300">
                      {sub.next_billing_date?.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        sub.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        sub.status === 'Confirmed' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        sub.status === 'Quotation' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        sub.status === 'Paused' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                        sub.status === 'Closed' ? 'bg-zinc-800 text-zinc-400' :
                        'bg-zinc-900 text-zinc-400 border border-zinc-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 font-mono">
                      {sub.status === 'Draft' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'Quotation')}
                          className="px-2 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 rounded text-[11px]"
                        >
                          Send Quote ➔
                        </button>
                      )}
                      {sub.status === 'Quotation' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'Confirmed')}
                          className="px-2 py-1 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/60 rounded text-[11px]"
                        >
                          Confirm ➔
                        </button>
                      )}
                      {sub.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'Active')}
                          className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded text-[11px]"
                        >
                          Activate ➔
                        </button>
                      )}
                      {sub.status === 'Active' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(sub.id, 'Paused')}
                            className="px-2 py-1 bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-800/60 rounded text-[11px]"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => handleStatusChange(sub.id, 'Closed')}
                            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[11px]"
                          >
                            Close
                          </button>
                        </>
                      )}
                      {sub.status === 'Paused' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'Active')}
                          className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded text-[11px]"
                        >
                          Resume Active
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0305] border border-red-900/60 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <h2 className="text-base font-serif font-bold text-white">Create New Subscription / Quote</h2>
            <form onSubmit={handleCreateSubscription} className="space-y-3 font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Customer</label>
                <select
                  className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  value={newSub.customer_id}
                  onChange={e => setNewSub({ ...newSub, customer_id: e.target.value })}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Plan</label>
                <select
                  className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  value={newSub.plan_id}
                  onChange={e => setNewSub({ ...newSub, plan_id: e.target.value })}
                  required
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ₹{p.cost} ({p.billing_frequency})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Discount Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ODOO2026 or FLAT500"
                  className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white uppercase focus:outline-none focus:border-red-600"
                  value={newSub.discount_code}
                  onChange={e => setNewSub({ ...newSub, discount_code: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-red-950/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
