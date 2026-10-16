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
        <p className="text-xs text-slate-500">Aggregating live transactions and financial analytics...</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Revenue & Financial Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified Stripe settlement figures, occupancy metrics, and audit logs.
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Financial Statement (CSV)</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Ticket Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-slate-900">
            ${gross.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All processed Stripe intents</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Refunds</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-rose-700">
            ${refunded.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">
            Reversed & restored to seats
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Settled Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-indigo-700">
            ${net.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">
            Gross ticket sales minus refunds
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Tickets Sold</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-['Outfit'] text-slate-900">
            {tickets} Passes
          </div>
          <div className="text-xs text-purple-700 font-semibold">
            Occupancy: {occupancy}
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Sales by Category</h2>
          <div className="space-y-3.5">
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
                    <span>{cat.label}</span>
                    <span className="font-semibold text-slate-900">
                      ${amount.toFixed(2)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(pct, 2)}%` }}
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Stripe Transactions</h2>
            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {analytics?.recentPayments?.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No payment transactions recorded yet.</p>
            ) : (
              analytics?.recentPayments?.map((p) => (
                <div
                  key={p._id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="overflow-hidden pr-2">
                    <p className="font-semibold text-slate-900 truncate font-mono">
                      {p.stripePaymentIntentId}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {p.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-900 font-mono">${(p.amount || 0).toFixed(2)}</p>
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        p.status === 'succeeded' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
