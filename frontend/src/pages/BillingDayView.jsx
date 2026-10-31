import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Calendar, Play, CheckCircle2, ShieldAlert, FileText, Printer, CreditCard } from 'lucide-react';

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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-[#714B67]" />
              Automated "Billing Day" Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Per Brightloop specification: It's billing day, and subscriptions are due at once.
              Nobody types invoices by hand. Invoices are pre-filled with customer details, product lines,
              taxes, and automatic discounts with <strong>zero double-billing or skipped billing</strong>.
            </p>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-medium mr-2">Billing Date:</span>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleRunBillingDay}
              disabled={running}
              className="flex items-center justify-center px-5 py-2.5 bg-[#714B67] hover:bg-[#5a3b52] text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 text-sm cursor-pointer"
            >
              <Play className={`w-4 h-4 mr-2 ${running ? 'animate-spin' : ''}`} />
              {running ? 'Running Batch...' : 'Execute Billing Day'}
            </button>
          </div>
        </div>

        {/* Batch Execution Results Banner */}
        {runResult && (
          <div className="mt-5 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-[#714B67] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-700">
              <div className="font-bold text-[#714B67] text-sm">
                Billing Run Completed Successfully
              </div>
              <div>{runResult.message}</div>
              <div className="mt-1 text-slate-500 flex items-center gap-3">
                <span className="font-semibold text-emerald-700">
                  Idempotency Guarantee: Subscriptions due were processed; active ones already billed were not duplicated.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Invoices Generated from Subscriptions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft ➔ Confirmed ➔ Paid pipeline. Team can confirm, cancel, print, or record payments.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {invoices.length} Invoices Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
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
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No invoices found. Click "Execute Billing Day" above to generate recurring invoices.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      SUB-{inv.subscription_id}
                    </td>
                    <td className="py-3 px-4">
                      <div>{inv.issue_date?.slice(0, 10)}</div>
                      <div className="text-[10px] text-slate-400">Due: {inv.due_date?.slice(0, 10)}</div>
                    </td>
                    <td className="py-3 px-4">₹{inv.subtotal?.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-600">+₹{inv.tax_amount?.toFixed(2)}</td>
                    <td className="py-3 px-4 text-emerald-600">-₹{inv.discount_amount?.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{inv.total_amount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                        inv.status === 'Canceled' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {inv.status === 'Draft' && (
                        <button
                          onClick={() => handleConfirmInvoice(inv.id)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      <a
                        href={`/api/billing/invoices/${inv.id}/print`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
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
