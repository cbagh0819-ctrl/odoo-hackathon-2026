import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Tag, Percent, Calendar, Check } from 'lucide-react';

export default function PlansAndRulesView({ currentUser }) {
  const [plans, setPlans] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);

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
      <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 p-6 rounded-2xl shadow-2xl">
        <div className="tracking-[0.3em] text-[10px] font-mono text-zinc-400 uppercase mb-1">
          RECURRING CONFIGURATION
        </div>
        <h2 className="text-2xl font-serif text-white font-medium flex items-center mb-6">
          <Calendar className="w-5 h-5 mr-2.5 text-red-500" />
          Subscription Plans & Termination Rules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(p => (
            <div key={p.id} className="p-5 rounded-2xl border border-red-950/60 bg-black/40 flex flex-col justify-between hover:border-red-700/60 transition group">
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-serif font-bold text-white text-sm">{p.name}</span>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-red-950 text-red-300 border border-red-800/50 rounded">
                    {p.billing_frequency}
                  </span>
                </div>
                <div className="text-3xl font-serif font-extrabold text-white mt-3">
                  ₹{p.cost?.toFixed(2)}
                  <span className="text-xs font-mono font-normal text-zinc-400"> / {p.billing_frequency}</span>
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1.5">
                  Min Quantity: <span className="text-white font-bold">{p.min_quantity} seat(s)</span>
                </div>

                {/* Plan rules flags */}
                <div className="mt-4 pt-3 border-t border-red-950/40 space-y-1.5 text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center">
                    <Check className={`w-3.5 h-3.5 mr-1.5 ${p.auto_close_on_end ? 'text-red-400' : 'text-zinc-600'}`} />
                    <span>Auto-close on contract end: <strong className="text-zinc-300">{p.auto_close_on_end ? 'Yes' : 'No'}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-3.5 h-3.5 mr-1.5 ${p.allow_early_close ? 'text-red-400' : 'text-zinc-600'}`} />
                    <span>Allow early termination: <strong className="text-zinc-300">{p.allow_early_close ? 'Yes' : 'No'}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-3.5 h-3.5 mr-1.5 ${p.allow_pause ? 'text-red-400' : 'text-zinc-600'}`} />
                    <span>Allow customer to pause: <strong className="text-zinc-300">{p.allow_pause ? 'Yes' : 'No'}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Check className={`w-3.5 h-3.5 mr-1.5 ${p.allow_renew ? 'text-red-400' : 'text-zinc-600'}`} />
                    <span>Allow auto-renewal: <strong className="text-zinc-300">{p.allow_renew ? 'Yes' : 'No'}</strong></span>
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
        <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 p-6 rounded-2xl shadow-2xl">
          <h2 className="text-lg font-serif text-white font-medium flex items-center mb-1">
            <Percent className="w-4 h-4 mr-2 text-red-500" />
            Automatic Tax Rules
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Taxes calculated automatically from rules the admin has set.
          </p>

          <div className="space-y-3 font-mono">
            {taxes.map(t => (
              <div key={t.id} className="p-3.5 bg-black/40 border border-red-950/50 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-[10px] text-zinc-500">{t.is_default ? 'System Default' : 'Special Rate'}</div>
                </div>
                <div className="text-lg font-bold text-red-400">
                  {t.rate_percent}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount Rules */}
        <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 p-6 rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-serif text-white font-medium flex items-center">
              <Tag className="w-4 h-4 mr-2 text-emerald-400" />
              Admin Discount Engine
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
              Auto-Applied
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-4">
            Admin creates discounts with purchase limits. Applied automatically to upcoming invoices.
          </p>

          <div className="space-y-3 font-mono">
            {discounts.map(d => (
              <div key={d.id} className="p-3.5 bg-black/40 border border-red-950/50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{d.name}</span>
                  <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/60 font-bold">
                    {d.code}
                  </span>
                </div>
                <div className="text-zinc-300">
                  Discount: <strong className="text-emerald-400">{d.discount_type === 'percentage' ? `${d.value}% Off` : `₹${d.value} Flat Off`}</strong>
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between">
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
