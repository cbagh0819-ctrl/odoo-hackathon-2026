import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { UserCheck, FileText, Printer, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export default function CustomerPortalView({ currentUser }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [subs, invs] = await Promise.all([
        apiRequest('/subscriptions'),
        apiRequest('/billing/invoices')
      ]);
      setSubscriptions(subs);
      setInvoices(invs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      
      {/* Customer Header */}
      <div className="bg-gradient-to-r from-purple-900 to-[#714B67] text-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-200 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Customer Self-Service Portal</span>
            </div>
            <h1 className="text-2xl font-bold mt-1">
              Welcome, {currentUser?.name || 'Valued Customer'}
            </h1>
            <p className="text-xs text-purple-100 mt-1">
              Manage your software subscriptions, billing schedules, and access your invoice receipts.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-xs border border-white/20">
            <span className="text-purple-200 block">Logged In As</span>
            <span className="font-bold">{currentUser?.email}</span>
          </div>
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center">
          <UserCheck className="w-5 h-5 mr-2 text-[#714B67]" />
          My Active Subscriptions
        </h2>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No active subscriptions found for this account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map(sub => (
              <div key={sub.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">{sub.subscription_number}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                    {sub.status}
                  </span>
                </div>
                <div className="text-slate-600">
                  Payment Terms: <span className="font-medium text-slate-800">{sub.payment_terms}</span>
                </div>
                <div className="text-slate-600">
                  Next Scheduled Billing: <span className="font-bold text-purple-900">{sub.next_billing_date?.slice(0, 10)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  Total Lines: {sub.lines?.length || 1} product(s) configured
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#714B67]" />
            My Invoices & Receipts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View your billing history and download receipts directly without having to email support.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No invoices issued yet.
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">{inv.invoice_number}</td>
                    <td className="py-3 px-4">{inv.issue_date?.slice(0, 10)}</td>
                    <td className="py-3 px-4">{inv.due_date?.slice(0, 10)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{inv.total_amount?.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`/api/billing/invoices/${inv.id}/print`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#714B67] rounded font-semibold text-[11px]"
                      >
                        <Printer className="w-3 h-3 mr-1" />
                        Download PDF
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
