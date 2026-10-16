import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, ShieldCheck, CheckCircle2, RotateCcw, Loader2, ArrowUpRight, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, StatCard, Badge, PageHeader } from '../../components/ui';

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
        <p className="text-xs text-slate-500 font-medium">Loading Stripe payment transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Stripe Payment Gateway"
        badgeVariant="primary"
        title="Payments & Stripe Settlements"
        description="Direct verification of Stripe PaymentIntents, webhook receipts, and executed refunds."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Settled Through Stripe"
          value={`$${summary.gross.toFixed(2)}`}
          icon={CheckCircle2}
          trend="Live Intents"
          trendLabel="verified customer charges"
          trendDirection="up"
          badgeColor="emerald"
        />
        <StatCard
          title="Refunds Issued"
          value={`$${summary.refunded.toFixed(2)}`}
          icon={RotateCcw}
          trend="Reversed"
          trendLabel="restored to seat inventory"
          trendDirection="down"
          badgeColor="rose"
        />
        <StatCard
          title="Net Settled Balance"
          value={`$${summary.net.toFixed(2)}`}
          icon={DollarSign}
          trend="Sandbox"
          trendLabel="current net settlement"
          trendDirection="up"
          badgeColor="indigo"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <CardTitle>Stripe Payment Intents Audit Log</CardTitle>
            <CardDescription>Real-time audit log of captured and refunded intents</CardDescription>
          </div>
          <Badge variant="neutral">{payments.length} Transactions</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 pl-6">Payment Intent ID</th>
                  <th className="py-3.5">Event</th>
                  <th className="py-3.5">Method</th>
                  <th className="py-3.5">Amount</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 pr-6 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      No payment intent records found.
                    </td>
                  </tr>
                ) : (
                  payments.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-4 pl-6 font-mono font-medium text-slate-700">
                        <p className="text-indigo-600 font-bold">{tx.stripePaymentIntentId}</p>
                      </td>
                      <td className="py-4 font-bold text-slate-900">
                        {tx.bookingId?.eventId?.title || 'Live Experience'}
                      </td>
                      <td className="py-4 text-slate-600 uppercase font-mono text-[11px]">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-900 text-sm">
                        ${(tx.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-4">
                        <Badge variant={tx.status === 'succeeded' ? 'success' : 'danger'}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-6 text-right text-slate-400 font-medium">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
