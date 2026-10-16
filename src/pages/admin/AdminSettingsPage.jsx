import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Settings,
  Shield,
  Key,
  Bell,
  CreditCard,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button, PageHeader } from '../../components/ui';

export const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Stripe Keys
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  // Hold Settings
  const [holdDurationMinutes, setHoldDurationMinutes] = useState(5);
  const [maxSeatsPerTransaction, setMaxSeatsPerTransaction] = useState(8);

  useEffect(() => {
    fetchGatewaySettings();
  }, []);

  const fetchGatewaySettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/operations/settings/gateway');
      if (res.data.success && res.data.data) {
        setStripeSecretKey(res.data.data.stripeSecretKey || '');
        setStripePublishableKey(res.data.data.stripePublishableKey || '');
        setStripeWebhookSecret(res.data.data.stripeWebhookSecret || '');
        setIsConfigured(res.data.data.isConfigured || false);
      }
    } catch (err) {
      toast.error('Failed to load gateway settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/admin/operations/settings/gateway', {
        stripeSecretKey,
        stripePublishableKey,
        stripeWebhookSecret,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Stripe configuration saved successfully.');
        setIsConfigured(res.data.data.isConfigured || false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update gateway settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Loading system configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        badge="System Administration"
        badgeVariant="primary"
        title="Gateway & Platform Settings"
        description="Configure live or test Stripe API credentials, automated seat reservation policies, and security limits."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Stripe Gateway Settings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Stripe Payment Gateway
                </h2>
                <p className="text-xs text-slate-500">
                  Accept verified customer payments, process 3D-Secure cards, and issue single-click refunds.
                </p>
              </div>
            </div>

            <Badge variant={isConfigured ? 'success' : 'warning'}>
              {isConfigured ? 'Live Stripe Active' : 'Sandbox Test Mode'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  Stripe Secret Key (sk_test_... or sk_live_...) *
                </label>
                <a
                  href="https://dashboard.stripe.com/test/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1"
                >
                  <span>Open Stripe Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                placeholder="sk_test_51..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-xs shadow-2xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Used securely on the backend server to create PaymentIntents and process refunds.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Stripe Publishable Key (pk_test_... or pk_live_...) *
              </label>
              <input
                type="text"
                value={stripePublishableKey}
                onChange={(e) => setStripePublishableKey(e.target.value)}
                placeholder="pk_test_51..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-xs shadow-2xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Used on the frontend checkout page to securely mount Stripe Elements and tokenize cards.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Stripe Webhook Secret (whsec_...) (Optional)
              </label>
              <input
                type="text"
                value={stripeWebhookSecret}
                onChange={(e) => setStripeWebhookSecret(e.target.value)}
                placeholder="whsec_..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-xs shadow-2xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Webhook URL: <code className="text-indigo-600 font-mono">http://yourdomain.com/api/public/payments/webhook</code>
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>How Stripe Works Here</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              When valid Stripe keys are provided, the checkout will automatically initialize real Stripe Elements and verify payments via Stripe 3DS. If keys are omitted or set to demo mode, the app operates smoothly in sandbox mode.
            </p>
          </div>
        </div>

        {/* Seat Hold Concurrency Rules */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Seat Hold Concurrency Rules
              </h2>
              <p className="text-xs text-slate-500">
                Automated seat locks and anti-scalping reservation caps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Temporary Hold Duration (Minutes)
              </label>
              <input
                type="number"
                value={holdDurationMinutes}
                onChange={(e) => setHoldDurationMinutes(Number(e.target.value))}
                min={1}
                max={15}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Holds lock seats for 5 minutes before releasing back to the public over Socket.IO.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Max Seats Per Transaction
              </label>
              <input
                type="number"
                value={maxSeatsPerTransaction}
                onChange={(e) => setMaxSeatsPerTransaction(Number(e.target.value))}
                min={1}
                max={20}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Prevents mass bot reservation attempts.
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            disabled={saving}
            leftIcon={Save}
          >
            Save System Configurations
          </Button>
        </div>
      </form>
    </div>
  );
};
