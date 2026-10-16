import React, { useState } from 'react';
import api from '../../services/api';
import { Search, Ticket, Mail, ShieldCheck, Download, Loader2, QrCode, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const BookingLookupPage = () => {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!reference.trim()) {
      toast.error('Please enter your booking reference.');
      return;
    }

    setLoading(true);
    setBooking(null);
    try {
      const res = await api.get(`/bookings/${encodeURIComponent(reference.trim())}`);
      if (res.data.success && res.data.data) {
        setBooking(res.data.data);
        toast.success('Ticket found successfully!');
      } else {
        toast.error('Booking reference not found.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to locate ticket with that reference.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-14 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 items-center justify-center text-indigo-600 mb-2">
          <Ticket className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold font-['Outfit'] text-slate-900">Find My Ticket & QR Pass</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your unique booking reference (e.g. TKT-8841) to view digital ticket pass and admission QR code.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Booking Reference
              </label>
              <div className="relative">
                <Ticket className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TKT-8841"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 uppercase font-mono focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address (Verification)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Locating Ticket Record...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Verify & View Ticket</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Need help finding reference? Check the confirmation email sent after Stripe checkout.</span>
        </div>
      </div>

      {/* Ticket Result Display */}
      {booking && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {booking.status || 'CONFIRMED PASS'}
              </span>
              <h2 className="text-xl font-bold font-['Outfit'] text-slate-900 mt-2">
                {booking.eventTitle}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Booking Reference</span>
              <span className="text-lg font-mono font-bold text-indigo-600">{booking.bookingId}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">Guest Name</span>
              <span className="font-semibold text-slate-900 text-sm">{booking.customerName}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block">Email & Mobile</span>
              <span className="font-semibold text-slate-900">{booking.email} • {booking.phone}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block">Allocated Seats</span>
              <div className="flex gap-1.5 pt-1">
                {booking.seats.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block">Amount Paid (Stripe)</span>
              <span className="text-base font-bold text-emerald-700">${booking.totalAmount}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5">
                <QrCode className="w-9 h-9 text-slate-800" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Digital Admission Pass</p>
                <p className="text-[11px] text-slate-500">Scan at entrance scanner on arrival.</p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Ticket PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
