import React, { useState, useEffect } from 'react';
import { apiRequest, downloadInvoicePdf } from '../api';
import { UserCheck, FileText, Printer, ShieldCheck } from 'lucide-react';

export default function CustomerPortalView({ currentUser }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPdf = async (inv) => {
    setDownloadingId(inv.id);
    try {
      await downloadInvoicePdf(inv.id, inv.invoice_number);
    } catch (err) {
      console.error('Download error, using fallback:', err);
      window.open(`/api/billing/invoices/${inv.id}/pdf`, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

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
      <div className="bg-gradient-to-r from-red-950 via-[#26040a] to-black border border-red-900/60 p-6 rounded-2xl shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-red-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Customer Self-Service Portal</span>
            </div>
            <h1 className="text-2xl font-serif text-white font-medium mt-1">
              Welcome, {currentUser?.name || 'Valued Client'}
            </h1>
          </div>

          <div className="bg-black/60 border border-red-950/60 px-4 py-2 rounded-xl text-xs font-mono">
            <span className="text-zinc-500 block text-[10px]">LOGGED IN AS</span>
            <span className="font-bold text-white">{currentUser?.email}</span>
          </div>
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 p-6 rounded-2xl shadow-2xl">
        <h2 className="text-base font-serif font-bold text-white mb-4 flex items-center">
          <UserCheck className="w-5 h-5 mr-2 text-red-500" />
          My Active Subscriptions
        </h2>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500 font-mono">
            No active subscriptions found for this account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map(sub => (
              <div key={sub.id} className="p-4 border border-red-950/60 rounded-xl bg-black/40 text-xs space-y-2 font-mono">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{sub.subscription_number}</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold rounded-full text-[10px]">
                    {sub.status}
                  </span>
                </div>
                <div className="text-zinc-400">
                  Payment Terms: <span className="text-white font-medium">{sub.payment_terms}</span>
                </div>
                <div className="text-zinc-400">
                  Next Scheduled Billing: <span className="font-bold text-red-400">{sub.next_billing_date?.slice(0, 10)}</span>
                </div>
                <div className="pt-2 border-t border-red-950/40 text-[11px] text-zinc-500">
                  Configured Lines: {sub.lines?.length || 1} product(s)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices Section */}
      <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-red-950/40">
          <h2 className="text-base font-serif font-bold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-red-500" />
            My Invoices & Receipts
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-red-950/20 border-b border-red-950/40 uppercase font-mono text-zinc-400 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/30">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500 font-mono">
                    No invoices issued yet.
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">{inv.invoice_number}</td>
                    <td className="py-3 px-4 text-zinc-400">{inv.issue_date?.slice(0, 10)}</td>
                    <td className="py-3 px-4 text-zinc-400">{inv.due_date?.slice(0, 10)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">₹{inv.total_amount?.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDownloadPdf(inv)}
                        disabled={downloadingId === inv.id}
                        className="inline-flex items-center px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 rounded text-[11px] font-mono font-semibold transition cursor-pointer"
                        title="Download Real PDF Invoice"
                      >
                        <Printer className="w-3 h-3 mr-1" />
                        {downloadingId === inv.id ? 'Saving PDF...' : 'Download PDF'}
                      </button>
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
