import React, { useState, useEffect } from 'react';
import { apiRequest, downloadInvoicePdf } from '../api';
import { FileText, Printer, DollarSign, Download } from 'lucide-react';

export default function InvoicesView() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPdf = async (inv) => {
    setDownloadingId(inv.id);
    try {
      await downloadInvoicePdf(inv.id, inv.invoice_number);
    } catch (err) {
      console.error('Download failed, using fallback:', err);
      window.open(`/api/billing/invoices/${inv.id}/pdf`, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  // Record Payment Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'Bank Transfer',
    note: '',
    reference_code: ''
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let url = '/billing/invoices';
      if (filter === 'OVERDUE') {
        url += '?overdue_only=true';
      } else if (filter !== 'ALL') {
        url += `?status_filter=${filter}`;
      }
      const res = await apiRequest(url);
      setInvoices(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    const paidSoFar = (inv.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const remaining = Math.max(0, inv.total_amount - paidSoFar);
    setPaymentData({
      amount: remaining,
      payment_method: 'Bank Transfer',
      note: 'Payment received via bank statement reconciliation',
      reference_code: `REF-${Date.now().toString().slice(-6)}`
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await apiRequest(`/payments/invoices/${selectedInvoice.id}`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(paymentData.amount),
          payment_method: paymentData.payment_method,
          note: paymentData.note,
          reference_code: paymentData.reference_code
        })
      });
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      alert(`Payment error: ${err.message}`);
    }
  };

  const filters = ['ALL', 'Draft', 'Confirmed', 'Paid', 'OVERDUE', 'Canceled'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/50 backdrop-blur-xl border border-red-950/60 p-6 rounded-2xl shadow-2xl">
        <div>
          <div className="tracking-[0.3em] text-[10px] font-mono text-zinc-400 uppercase mb-1">
            REVENUE LEDGER
          </div>
          <h1 className="text-2xl font-serif text-white font-medium flex items-center">
            <FileText className="w-5 h-5 mr-2.5 text-red-500" />
            Invoices & Payment Reconciliation
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-1.5 overflow-x-auto text-xs font-mono">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === f 
                  ? 'bg-red-950 text-white border border-red-700/60 shadow-[0_0_10px_rgba(220,38,38,0.3)] font-semibold' 
                  : 'bg-black/40 border border-red-950/40 text-zinc-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-red-950/20 border-b border-red-950/40 uppercase font-mono text-zinc-400 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Tax / Disc</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/30">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-zinc-500 font-mono">
                    No invoices matching filter.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const paidAmount = (inv.payments || []).reduce((acc, p) => acc + p.amount, 0);
                  const isPaid = inv.status === 'Paid';
                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        User #{inv.customer_id}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        <div>Issue: {inv.issue_date?.slice(0, 10)}</div>
                        <div className="text-[10px] text-zinc-500">Due: {inv.due_date?.slice(0, 10)}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">₹{inv.subtotal?.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="text-zinc-400">+₹{inv.tax_amount?.toFixed(2)}</span>
                        {inv.discount_amount > 0 && (
                          <span className="text-emerald-400 block">-₹{inv.discount_amount?.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ₹{inv.total_amount?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        ₹{paidAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          inv.status === 'Confirmed' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                          inv.status === 'Canceled' ? 'bg-red-950 text-red-400 border border-red-800' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 font-mono">
                        {!isPaid && inv.status !== 'Canceled' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="inline-flex items-center px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded text-[11px] font-semibold"
                          >
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPdf(inv)}
                          disabled={downloadingId === inv.id}
                          className="inline-flex items-center px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 rounded text-[11px] font-medium transition cursor-pointer"
                          title="Download Real PDF Invoice"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          {downloadingId === inv.id ? 'Saving PDF...' : 'Print'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0305] border border-red-900/60 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4 font-mono">
            <h2 className="text-base font-serif font-bold text-white flex items-center">
              <DollarSign className="w-4 h-4 text-emerald-400 mr-1.5" />
              Record Payment ({selectedInvoice.invoice_number})
            </h2>
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Amount to Record (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                  value={paymentData.amount}
                  onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Payment Method</label>
                <select
                  className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  value={paymentData.payment_method}
                  onChange={e => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-984124"
                  className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  value={paymentData.reference_code}
                  onChange={e => setPaymentData({ ...paymentData, reference_code: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-red-950/40">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500"
                >
                  Save & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
