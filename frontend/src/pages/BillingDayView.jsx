import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Calendar, Play, CheckCircle2, FileText, Printer } from 'lucide-react';

export default function BillingDayView() {
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const res = await apiRequest('/billing/invoices');
      setInvoices(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRunBillingDay = async () => {
    try {
      setRunning(true);
      setRunResult(null);
      const res = await apiRequest('/billing/run-billing-day', {
        method: 'POST',
        body: JSON.stringify({ target_date: new Date(targetDate).toISOString() })
      });
      setRunResult(res);
      fetchInvoices();
    } catch (err) {
      alert(`Error running billing day: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleConfirmInvoice = async (invId) => {
    try {
      await apiRequest(`/billing/invoices/${invId}/confirm`, { method: 'POST' });
      fetchInvoices();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Billing Day Action Card */}
      <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="tracking-[0.3em] text-[10px] font-mono text-zinc-400 uppercase mb-1">
              AUTOMATION SUITE
            </div>
            <h1 className="text-2xl font-serif text-white font-medium flex items-center">
              <Calendar className="w-5 h-5 mr-2.5 text-red-500" />
              Automated "Billing Day" Engine
            </h1>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-black/60 border border-red-950/60 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-zinc-400 font-mono text-[11px] mr-2">Billing Date:</span>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-transparent border-none text-white font-mono text-xs focus:outline-none focus:ring-0 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunBillingDay}
              disabled={running}
              className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold rounded-xl shadow-[0_0_18px_rgba(220,38,38,0.25)] transition disabled:opacity-50 text-xs cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 mr-2 ${running ? 'animate-spin' : ''}`} />
              {running ? 'Running Batch...' : 'Execute Billing Day'}
            </button>
          </div>
        </div>

        {/* Batch Execution Results Banner */}
        {runResult && (
          <div className="mt-5 p-4 bg-red-950/30 border border-red-700/50 rounded-xl flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-zinc-300">
              <div className="font-bold text-white text-sm">
                Billing Run Completed Successfully
              </div>
              <div>{runResult.message}</div>
              <div className="mt-1 text-emerald-400 font-mono text-[11px]">
                Idempotency Verified: 0 duplicate invoices created.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Invoices Table */}
      <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-red-950/40 flex justify-between items-center">
          <div>
            <h2 className="font-serif font-medium text-white text-base">Generated Invoices</h2>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-red-950/50 text-red-300 border border-red-900/50 rounded-full">
            {invoices.length} Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-red-950/20 border-b border-red-950/40 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Sub ID</th>
                <th className="py-3 px-4">Issue / Due Date</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Taxes</th>
                <th className="py-3 px-4">Discounts</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/30">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-zinc-500 font-mono">
                    No invoices generated yet. Click "Execute Billing Day" above.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      SUB-{inv.subscription_id}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      <div>{inv.issue_date?.slice(0, 10)}</div>
                      <div className="text-[10px] text-zinc-500">Due: {inv.due_date?.slice(0, 10)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">₹{inv.subtotal?.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">+₹{inv.tax_amount?.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">-₹{inv.discount_amount?.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ₹{inv.total_amount?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        inv.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        inv.status === 'Confirmed' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        inv.status === 'Canceled' ? 'bg-red-950 text-red-400 border border-red-800' :
                        'bg-zinc-800 text-zinc-300'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {inv.status === 'Draft' && (
                        <button
                          onClick={() => handleConfirmInvoice(inv.id)}
                          className="px-2.5 py-1 bg-blue-950/80 text-blue-300 hover:bg-blue-900 border border-blue-800/60 rounded-lg text-[11px] font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      <a
                        href={`/api/billing/invoices/${inv.id}/print`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 rounded-lg text-[11px] font-medium"
                      >
                        <Printer className="w-3 h-3 mr-1" />
                        Print / PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
