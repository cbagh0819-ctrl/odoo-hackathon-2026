import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { FileText, Printer, DollarSign, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';

export default function InvoicesView() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-[#714B67]" />
            Invoices & Payment Reconciliation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Per PDF: Match payments to invoices with method, amount, date, and note. Chase overdue receivables.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-1.5 overflow-x-auto text-xs">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === f 
                  ? 'bg-[#714B67] text-white shadow-sm' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Tax / Disc</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Paid So Far</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No invoices matching filter.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const paidAmount = (inv.payments || []).reduce((acc, p) => acc + p.amount, 0);
                  const isPaid = inv.status === 'Paid';
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3 px-4">
                        User #{inv.customer_id}
                      </td>
                      <td className="py-3 px-4">
                        <div>Issue: {inv.issue_date?.slice(0, 10)}</div>
                        <div className="text-[10px] text-slate-400">Due: {inv.due_date?.slice(0, 10)}</div>
                      </td>
                      <td className="py-3 px-4">₹{inv.subtotal?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-[11px]">
                        <span className="text-slate-600">+₹{inv.tax_amount?.toFixed(2)}</span>
                        {inv.discount_amount > 0 && (
                          <span className="text-emerald-600 block">-₹{inv.discount_amount?.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{inv.total_amount?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">
                        ₹{paidAmount.toFixed(2)}
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
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {!isPaid && inv.status !== 'Canceled' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="inline-flex items-center px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]"
                          >
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            Record Pay
                          </button>
                        )}
                        <a
                          href={`/api/billing/invoices/${inv.id}/print`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-[11px]"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          Print
                        </a>
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
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center">
              <DollarSign className="w-5 h-5 text-emerald-600 mr-1.5" />
              Record Payment for {selectedInvoice.invoice_number}
            </h2>
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Amount to Record (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold text-slate-800"
                  value={paymentData.amount}
                  onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Payment Method</label>
                <select
                  className="w-full border border-slate-300 rounded p-2 text-xs"
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
                <label className="block text-slate-600 font-semibold mb-1">Transaction Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-984124 or Cheque #"
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  value={paymentData.reference_code}
                  onChange={e => setPaymentData({ ...paymentData, reference_code: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Payment Note / Bank Statement Note</label>
                <textarea
                  rows="2"
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  value={paymentData.note}
                  onChange={e => setPaymentData({ ...paymentData, note: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
                >
                  Save & Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
