import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, ShieldCheck, CheckCircle2, RotateCcw, Loader2, ArrowUpRight, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ gross: 0, refunded: 0, net: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/operations/analytics');
      if (res.data.success && res.data.data) {
        setPayments(res.data.data.recentPayments || []);
        setSummary({
          gross: res.data.data.grossSales || 0,
          refunded: res.data.data.totalRefunded || 0,
          net: res.data.data.netRevenue || 0,
        });
      }
    } catch (err) {
      toast.error('Failed to load payment logs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500">Loading Stripe payment transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Payments & Stripe Gateway</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Direct verification of Stripe PaymentIntents, webhook receipts, and executed refunds.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled Through Stripe</p>
          <p className="text-3xl font-bold font-['Outfit'] text-slate-900">${summary.gross.toFixed(2)}</p>
          <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Stripe signatures</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Refunds Issued</p>
          <p className="text-3xl font-bold font-['Outfit'] text-rose-700">${summary.refunded.toFixed(2)}</p>
          <p className="text-xs text-slate-500 pt-1">Restored to available seats</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Settled Balance</p>
          <p className="text-3xl font-bold font-['Outfit'] text-indigo-700">${summary.net.toFixed(2)}</p>
          <p className="text-xs text-slate-500 pt-1">Stripe Sandbox Test Mode</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between font-semibold text-sm text-slate-900">
          <span>Stripe Payment Intents Audit Log</span>
          <span className="text-xs text-slate-500">{payments.length} Transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 pl-4">Payment Intent ID</th>
                <th className="py-3.5">Event</th>
                <th className="py-3.5">Method</th>
                <th className="py-3.5">Amount</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 pr-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No payment intent records found.
                  </td>
                </tr>
              ) : (
                payments.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 pl-4 font-mono font-medium text-slate-700">
                      <p className="text-indigo-600 font-bold">{tx.stripePaymentIntentId}</p>
                    </td>
                    <td className="py-3.5 font-medium text-slate-900">
                      {tx.bookingId?.eventId?.title || 'Live Experience'}
                    </td>
                    <td className="py-3.5 text-slate-600 uppercase font-mono text-[11px]">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-slate-900 text-sm">
                      ${(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          tx.status === 'succeeded'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right text-slate-500">
                      {new Date(tx.createdAt).toLocaleString()}
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
};
