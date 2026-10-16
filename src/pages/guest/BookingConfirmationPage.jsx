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
  QrCode,
  ArrowRight,
  Printer,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button } from '../../components/ui';

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Loading your verified digital ticket...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
          <Ticket className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold font-['Outfit'] text-slate-900">Ticket Record Not Found</h2>
        <p className="text-xs text-slate-500">
          We could not locate this booking. Please check your reference code or contact support.
        </p>
        <Link to="/" className="inline-block">
          <Button variant="outline" size="sm">
            Return to Events Home
          </Button>
        </Link>
      </div>
    );
  }

  const startDate = booking.startTime ? new Date(booking.startTime) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 items-center justify-center text-emerald-600 mb-2 shadow-2xs animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold font-['Outfit'] text-slate-900">
          Booking Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Your payment has been verified via Stripe. Your digital admission pass is ready.
        </p>
      </div>

      {/* Main Ticket Pass Card (Printable) */}
      <div
        id="printable-ticket"
        className="rounded-3xl bg-white border border-slate-200 shadow-md overflow-hidden relative"
      >
        {/* Color Gradient Strip */}
        <div className="h-2.5 w-full bg-gradient-to-r from-emerald-500 via-indigo-600 to-indigo-800" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Pass Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <Badge variant="success">
                {booking.status || 'CONFIRMED PASS'}
              </Badge>
              <h2 className="text-2xl font-bold font-['Outfit'] text-slate-900 mt-2">
                {booking.eventTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {booking.venueName} • {booking.hallName} ({booking.screenType || 'Auditorium'})
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Booking Reference
              </span>
              <div className="flex items-center gap-1.5 sm:justify-end">
                <span className="text-xl font-mono font-extrabold text-indigo-600 tracking-tight">
                  {booking.bookingReference || booking.bookingId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  title="Copy Reference"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid & Admission QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Left 2 Cols: Details */}
            <div className="sm:col-span-2 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Guest Name</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {booking.customerName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Email Address</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {booking.email}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Date & Showtime</span>
                <span className="font-semibold text-slate-900">
                  {startDate
                    ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Scheduled Showtime'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Amount Paid (Stripe)</span>
                <span className="text-base font-bold text-emerald-700">
                  ${typeof booking.totalAmount === 'number' ? booking.totalAmount.toFixed(2) : booking.totalAmount} USD
                </span>
              </div>

              <div className="col-span-2 pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-slate-500 block font-semibold">Confirmed Seat Allocations</span>
                <div className="flex flex-wrap gap-1.5">
                  {booking.seats?.map((seatCode) => (
                    <span
                      key={seatCode}
                      className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-extrabold text-xs"
                    >
                      {seatCode}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: QR Code */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              {booking.qrCode ? (
                <img
                  src={booking.qrCode}
                  alt="QR Pass"
                  className="w-36 h-36 rounded-xl bg-white p-2 shadow-2xs border border-slate-200"
                />
              ) : (
                <div className="w-36 h-36 rounded-xl bg-white flex items-center justify-center p-2 border border-slate-200">
                  <QrCode className="w-24 h-24 text-slate-800" />
                </div>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Gate Admission QR
              </span>
            </div>
          </div>

          {/* Footer of card */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Valid for entrance. Present this QR code on arrival at the gate scanner.</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {new Date(booking.date || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handlePrint}
          leftIcon={Printer}
        >
          Print / Save PDF Pass
        </Button>

        <Link to="/booking/lookup">
          <Button variant="outline" size="md">
            Find Other Tickets
          </Button>
        </Link>

        <Link to="/">
          <Button variant="ghost" size="md" leftIcon={Home}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
