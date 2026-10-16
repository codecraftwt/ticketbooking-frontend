import React from 'react';
import { Settings, Shield, Key, Bell, CreditCard, Save } from 'lucide-react';
import { toast } from 'sonner';

export const AdminSettingsPage = () => {
  const handleSave = () => {
    toast.success('System configurations saved successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Payment credentials, automated hold expiration policies, and administrator controls.
        </p>
      </div>

      <div className="space-y-6">
        {/* Stripe Gateway Settings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Stripe Payment Gateway</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stripe Secret Key</label>
              <input
                type="password"
                defaultValue="sk_test_51MockTicketStripeKeyForDevelopmentMode"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stripe Webhook Secret</label>
              <input
                type="password"
                defaultValue="whsec_MockWebhookSecretDevelopmentMode"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Seat Hold Concurrency Settings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Seat Hold Concurrency Rules</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temporary Hold Duration (Minutes)</label>
              <input
                type="number"
                defaultValue={5}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Holds will automatically expire in MongoDB Atlas and release seats over Socket.IO.
              </span>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Seats Per Transaction</label>
              <input
                type="number"
                defaultValue={8}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Prevents mass bot reservation attempts.
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save System Configurations</span>
        </button>
      </div>
    </div>
  );
};
