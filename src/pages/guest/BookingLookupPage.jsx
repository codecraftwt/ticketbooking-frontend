import React, { useState } from 'react';
import api from '../../services/api';
import { Search, Ticket, Mail, ShieldCheck, Download, Loader2, Calendar, MapPin, Printer, ArrowRight, User } from 'lucide-react';
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-stone-100 font-['Plus_Jakarta_Sans']">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-[#522906] border border-amber-800/60 items-center justify-center text-amber-300 mb-1 shadow-md">
          <Ticket className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black font-['Outfit'] text-white">Find My Admission Ticket</h1>
        <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
          Enter your unique booking reference code to view and print your verified pass.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#321703]/90 border border-amber-900/60 shadow-xl space-y-4">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="bookingRef" className="text-xs font-bold text-amber-200">
                Booking Reference *
              </label>
              <div className="relative flex items-center">
                <Ticket className="w-4 h-4 text-stone-400 absolute left-3.5" />
                <input
                  id="bookingRef"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TKT-8841"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#230f01] border border-amber-900/70 text-white placeholder-stone-500 text-sm font-mono uppercase focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lookupEmail" className="text-xs font-bold text-amber-200">
                Email Address (Optional)
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5" />
                <input
                  id="lookupEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#230f01] border border-amber-900/70 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Proper Shaped Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#fbc687] hover:bg-[#fad3a2] active:bg-[#f6b76c] text-[#341602] font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : <Search className="w-4 h-4" />}
            <span>Find & Verify Ticket</span>
          </button>
        </form>

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-amber-200/70">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Need help? Check the confirmation email sent immediately after checkout.</span>
        </div>
      </div>

      {/* Ticket Result Display */}
      {booking && (
        <div className="rounded-3xl bg-white text-stone-900 border border-amber-900/30 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-3">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                {booking.status || 'CONFIRMED PASS'}
              </span>
              <h2 className="text-2xl font-black font-['Outfit'] text-stone-900 mt-2">
                {booking.eventTitle}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {booking.venueName} • {booking.hallName}
                </span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Reference
              </span>
              <span className="text-xl font-mono font-black text-amber-700">
                {booking.bookingReference || booking.bookingId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-stone-500 block font-medium">Guest Name</span>
              <span className="font-bold text-stone-900 text-sm block">
                {booking.customerName}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 block font-medium">Showtime</span>
              <span className="font-bold text-stone-900 block">
                {booking.startTime ? new Date(booking.startTime).toLocaleDateString() : 'Active'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 block font-medium">Total Paid</span>
              <span className="font-black text-emerald-700 text-base block font-mono">
                ${booking.totalAmount}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-4 pt-3 border-t border-stone-100 space-y-1.5">
              <span className="text-stone-500 block font-bold text-xs">Allocated Seats:</span>
              <div className="flex flex-wrap gap-1.5">
                {booking.seats?.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-mono font-black text-xs"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-[#fbc687] hover:bg-[#fad3a2] text-[#341602] font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ticket Pass</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
