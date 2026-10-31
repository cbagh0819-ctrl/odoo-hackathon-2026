import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Tag, Percent, Calendar, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export default function PlansAndRulesView({ currentUser }) {
  const [plans, setPlans] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, t, d] = await Promise.all([
        apiRequest('/plans'),
        apiRequest('/rules/taxes'),
        apiRequest('/rules/discounts')
      ]);
      setPlans(p);
      setTaxes(t);
      setDiscounts(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Plans Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center mb-1">
          <Calendar className="w-5 h-5 mr-2 text-[#714B67]" />
          Subscription Plans & Lifecycle Rules
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Per PDF: Admin decides what it costs, billing frequency (daily, weekly, monthly, yearly), minimum quantity, and termination rules (auto-close, early close, pause, renew).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(p => (
            <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-purple-100 text-[#714B67] rounded">
                    {p.billing_frequency}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2">
                  ₹{p.cost?.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500"> / {p.billing_frequency}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Min Quantity: <span className="font-semibold">{p.min_quantity} seat(s)</span>
                </div>

                {/* Plan rules flags */}
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center">
                    <Check className={`w-3.5 h-3.5 mr-1 ${p.auto_close_on_end ? 'text-purple-600' : 'text-slate-300'}`} />
                    <span>Auto-close on contract end: <strong>{p.auto_close_on_end ? 'Yes' : 'No'}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-3.5 h-3.5 mr-1 ${p.allow_early_close ? 'text-purple-600' : 'text-slate-300'}`} />
                    <span>Allow early termination: <strong>{p.allow_early_close ? 'Yes' : 'No'}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-3.5 h-3.5 mr-1 ${p.allow_pause ? 'text-purple-600' : 'text-slate-300'}`} />
                    <span>Allow customer to pause: <strong>{p.allow_pause ? 'Yes' : 'No'}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-3.5 h-3.5 mr-1 ${p.allow_renew ? 'text-purple-600' : 'text-slate-300'}`} />
                    <span>Allow auto-renewal: <strong>{p.allow_renew ? 'Yes' : 'No'}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Taxes & Discounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tax Rules */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 flex items-center mb-1">
            <Percent className="w-5 h-5 mr-2 text-[#714B67]" />
            Automatic Tax Rules
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Taxes are calculated automatically from rules the admin has set.
          </p>

          <div className="space-y-3">
            {taxes.map(t => (
              <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">{t.name}</div>
                  <div className="text-[10px] text-slate-500">{t.is_default ? 'Default System Tax' : 'Optional Rate'}</div>
                </div>
                <div className="text-base font-extrabold text-[#714B67]">
                  {t.rate_percent}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount Rules */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-base font-bold text-slate-800 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-emerald-600" />
              Admin Discount Engine
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
              Auto-Applying
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Per PDF: Only the admin creates discounts (fixed or percentage, min spend/quantity, usage limits). Applies to next invoice automatically.
          </p>

          <div className="space-y-3">
            {discounts.map(d => (
              <div key={d.id} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{d.name}</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                    {d.code}
                  </span>
                </div>
                <div className="text-slate-600">
                  Value: <strong className="text-emerald-700">{d.discount_type === 'percentage' ? `${d.value}% Off` : `₹${d.value} Flat Off`}</strong>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Min Spend: ₹{d.min_purchase} | Min Qty: {d.min_quantity}</span>
                  <span>Used: {d.times_used} / {d.max_usage} max</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
