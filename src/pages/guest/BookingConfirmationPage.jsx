import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CheckCircle2,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  Home,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Printer,
  Copy,
  Building2,
  User,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui';

export const BookingConfirmationPage = () => {
  const { reference } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [reference]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/${encodeURIComponent(reference)}`);
      if (res.data.success && res.data.data) {
        setBooking(res.data.data);
      }
    } catch (err) {
      toast.error('Unable to fetch booking confirmation.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    if (booking?.bookingReference || booking?.bookingId) {
      navigator.clipboard.writeText(booking.bookingReference || booking.bookingId);
      toast.success('Booking Reference copied to clipboard.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-amber-200">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs text-amber-200/70 font-medium">Loading verified ticket pass...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-900/60 flex items-center justify-center mx-auto text-amber-400">
          <Ticket className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-['Outfit'] text-white">Ticket Record Not Found</h2>
        <p className="text-xs text-stone-300">
          We could not locate this booking. Please verify the code or contact support.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#fbc687] text-[#341602] font-bold text-xs hover:bg-[#fed7aa] transition-all shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Return to Events</span>
        </Link>
      </div>
    );
  }

  const startDate = booking.startTime ? new Date(booking.startTime) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-['Plus_Jakarta_Sans'] text-stone-100">
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 items-center justify-center text-emerald-400 mb-2 shadow-lg">
          <CheckCircle2 className="w-8 h-8" strokeWidth={2.2} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-['Outfit'] text-white tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
          Your payment has been verified. Your official admission pass is ready.
        </p>
      </div>

      {/* Main Ticket Pass Card (High-Contrast for Screen & Printable) */}
      <div
        id="printable-ticket"
        className="rounded-3xl bg-white text-stone-900 border border-amber-900/30 shadow-2xl overflow-hidden relative"
      >
        {/* Color Gradient Strip */}
        <div className="h-3 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Pass Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Official Admission Pass
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-stone-900 mt-2.5">
                {booking.eventTitle}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {booking.venueName} • {booking.hallName} ({booking.screenType || 'Auditorium'})
                </span>
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Booking Reference
              </span>
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-xl font-mono font-extrabold text-amber-700 tracking-tight">
                  {booking.bookingReference || booking.bookingId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  title="Copy Reference"
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-xs">
            <div className="space-y-1">
              <span className="text-stone-500 block font-medium flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" /> Guest Name
              </span>
              <span className="font-bold text-stone-900 text-sm block">
                {booking.customerName}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 block font-medium flex items-center gap-1">
                <Mail className="w-3 h-3 text-stone-400" /> Email Address
              </span>
              <span className="font-bold text-stone-900 truncate block">
                {booking.email}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 block font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" /> Date & Time
              </span>
              <span className="font-bold text-stone-900 block">
                {startDate
                  ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Scheduled Showtime'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-stone-500 block font-medium">Total Paid</span>
              <span className="text-base font-black text-emerald-700 block font-mono">
                ${typeof booking.totalAmount === 'number' ? booking.totalAmount.toFixed(2) : booking.totalAmount} USD
              </span>
            </div>

            {/* Confirmed Seats Badge Row */}
            <div className="col-span-2 sm:col-span-4 pt-4 border-t border-stone-100 space-y-2">
              <span className="text-stone-600 block font-bold text-xs">
                Reserved Seats ({booking.seats?.length || 0}):
              </span>
              <div className="flex flex-wrap gap-2">
                {booking.seats?.map((seatCode) => (
                  <span
                    key={seatCode}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-mono font-black text-xs shadow-2xs"
                  >
                    {seatCode}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pass Footer */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Valid for entrance. Show this booking reference at the venue desk.</span>
            </div>
            <span className="font-mono text-[11px] text-stone-400">
              Generated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons in Proper Shapes */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrint}
          className="px-6 py-2.5 rounded-xl bg-[#fbc687] hover:bg-[#fad3a2] active:bg-[#f6b76c] text-[#341602] font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>

        <Link
          to="/booking/lookup"
          className="px-5 py-2.5 rounded-xl bg-[#321703] hover:bg-[#401f05] border border-amber-900/60 text-amber-200 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Ticket className="w-4 h-4 text-amber-400" />
          <span>Lookup Other Tickets</span>
        </Link>

        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 border border-white/10 text-stone-300 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};
