import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  RotateCcw,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, StatCard, Button, PageHeader, Badge } from '../../components/ui';

export const AdminReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/operations/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load revenue analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      toast.info('Generating CSV report...');
      const response = await api.get('/admin/operations/export-csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ticketcraft-financial-statement.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Financial report exported!');
    } catch (err) {
      toast.error('Failed to export CSV report.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Aggregating live transactions and financial analytics...</p>
      </div>
    );
  }

  const gross = analytics?.grossSales || 0;
  const refunded = analytics?.totalRefunded || 0;
  const net = analytics?.netRevenue || 0;
  const tickets = analytics?.ticketsSold || 0;
  const occupancy = analytics?.occupancyRate || '0%';
  const categoryTotals = analytics?.categoryTotals || {};

  const totalCatRevenue = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        badge="Audited Financial Ledger"
        badgeVariant="success"
        title="Revenue & Financial Reports"
        description="Verified Stripe settlement figures, occupancy metrics, and audit logs."
        actions={
          <Button variant="primary" size="md" icon={Download} onClick={handleDownloadCSV}>
            Export Financial Statement (CSV)
          </Button>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Gross Ticket Sales"
          value={`$${gross.toFixed(2)}`}
          icon={DollarSign}
          trend="Stripe Settled"
          trendLabel="all successful transactions"
          trendDirection="up"
          badgeColor="emerald"
        />
        <StatCard
          title="Total Refunds Issued"
          value={`$${refunded.toFixed(2)}`}
          icon={RotateCcw}
          trend="Restored"
          trendLabel="inventory returned to sales"
          trendDirection="down"
          badgeColor="rose"
        />
        <StatCard
          title="Net Settled Revenue"
          value={`$${net.toFixed(2)}`}
          icon={TrendingUp}
          trend="Net Balance"
          trendLabel="sales minus refunds"
          trendDirection="up"
          badgeColor="indigo"
        />
        <StatCard
          title="Tickets Confirmed"
          value={`${tickets} Passes`}
          icon={Users}
          trend={occupancy}
          trendLabel="overall occupancy"
          trendDirection="neutral"
          badgeColor="purple"
        />
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Experience Category</CardTitle>
            <CardDescription>Contribution to gross ticket sales across event categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'IMAX & Cinema (Movie)', key: 'Movie', color: 'bg-indigo-600' },
              { label: 'Live Concerts & Tours', key: 'Concert', color: 'bg-pink-600' },
              { label: 'Standup Comedy', key: 'Comedy', color: 'bg-amber-600' },
              { label: 'Sports Screenings', key: 'Sports', color: 'bg-emerald-600' },
            ].map((cat) => {
              const amount = categoryTotals[cat.key] || 0;
              const pct = Math.round((amount / totalCatRevenue) * 100);
              return (
                <div key={cat.key}>
                  <div className="flex justify-between text-xs mb-1.5 text-slate-600">
                    <span className="font-semibold text-slate-700">{cat.label}</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${amount.toFixed(2)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      style={{ width: `${Math.max(pct, 2)}%` }}
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Transactions List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Stripe Transactions</CardTitle>
              <CardDescription>Direct webhook verification feed</CardDescription>
            </div>
            <Badge variant="success">Verified Stripe</Badge>
          </CardHeader>

          <CardContent>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {analytics?.recentPayments?.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">No payment transactions recorded yet.</p>
              ) : (
                analytics?.recentPayments?.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="font-bold text-slate-900 truncate font-mono text-[11px]">
                        {p.stripePaymentIntentId}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {p.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-extrabold text-slate-900 text-sm">${(p.amount || 0).toFixed(2)}</p>
                      <Badge variant={p.status === 'succeeded' ? 'success' : 'danger'}>
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
