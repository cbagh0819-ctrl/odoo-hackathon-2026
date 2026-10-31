import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Layers, Plus, ArrowRight, PauseCircle, CheckCircle, XCircle, FileText } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center">
            <Layers className="w-6 h-6 mr-2 text-[#714B67]" />
            Subscription Lifecycle Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Stages: <span className="font-semibold text-slate-700">Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed / Paused</span>
          </p>
        </div>

        <button
          onClick={() => { setShowModal(true); loadModalData(); }}
          className="flex items-center px-4 py-2 bg-[#714B67] hover:bg-[#5c3c54] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Subscription
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === st 
                ? 'bg-[#714B67] text-white shadow-sm' 
                : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No subscriptions found for {filterStatus}.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {sub.subscription_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      User #{sub.customer_id}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      Plan #{sub.plan_id}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {sub.payment_terms}
                    </td>
                    <td className="py-3 px-4 font-medium text-purple-900">
                      {sub.next_billing_date?.slice(0, 10)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        sub.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                        sub.status === 'Quotation' ? 'bg-amber-100 text-amber-800' :
                        sub.status === 'Paused' ? 'bg-orange-100 text-orange-800' :
                        sub.status === 'Closed' ? 'bg-slate-200 text-slate-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {sub.status === 'Draft' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'Quotation')}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-medium text-[11px]"
                        >
                          Send Quote ➔
                        </button>
                      )}
                      {sub.status === 'Quotation' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'Confirmed')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-medium text-[11px]"
                        >
                          Confirm ➔
                        </button>
                      )}
                      {sub.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'Active')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-medium text-[11px]"
                        >
                          Activate ➔
                        </button>
                      )}
                      {sub.status === 'Active' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(sub.id, 'Paused')}
                            className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded font-medium text-[11px]"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => handleStatusChange(sub.id, 'Closed')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-[11px]"
                          >
                            Close
                          </button>
                        </>
                      )}
                      {sub.status === 'Paused' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'Active')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-medium text-[11px]"
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
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 text-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800">Create New Subscription / Quote</h2>
            <form onSubmit={handleCreateSubscription} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Customer</label>
                <select
                  className="w-full border border-slate-300 rounded p-2 text-xs"
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
                <label className="block text-slate-600 font-semibold mb-1">Plan</label>
                <select
                  className="w-full border border-slate-300 rounded p-2 text-xs"
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
                <label className="block text-slate-600 font-semibold mb-1">Payment Terms</label>
                <select
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  value={newSub.payment_terms}
                  onChange={e => setNewSub({ ...newSub, payment_terms: e.target.value })}
                >
                  <option value="Immediate Payment">Immediate Payment</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Discount Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ODOO2026 or FLAT500"
                  className="w-full border border-slate-300 rounded p-2 text-xs uppercase"
                  value={newSub.discount_code}
                  onChange={e => setNewSub({ ...newSub, discount_code: e.target.value })}
                />
              </div>

              {/* Product Line */}
              <div className="border-t border-slate-200 pt-2">
                <label className="block text-slate-600 font-semibold mb-1">Product Line</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      className="w-full border border-slate-300 rounded p-1.5 text-xs"
                      value={newSub.lines[0]?.product_id}
                      onChange={e => {
                        const sel = products.find(p => p.id === Number(e.target.value));
                        setNewSub({
                          ...newSub,
                          lines: [{
                            ...newSub.lines[0],
                            product_id: e.target.value,
                            unit_price: sel ? sel.sales_price : 0
                          }]
                        });
                      }}
                    >
                      {products.map(pr => (
                        <option key={pr.id} value={pr.id}>{pr.name} (₹{pr.sales_price})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="w-full border border-slate-300 rounded p-1.5 text-xs"
                      value={newSub.lines[0]?.quantity}
                      onChange={e => {
                        setNewSub({
                          ...newSub,
                          lines: [{ ...newSub.lines[0], quantity: e.target.value }]
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#714B67] text-white font-semibold rounded hover:bg-[#5c3c54]"
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
