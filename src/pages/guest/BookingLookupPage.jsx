import React, { useState } from 'react';
import api from '../../services/api';
import { Search, Ticket, Mail, ShieldCheck, Download, Loader2, QrCode, Calendar, MapPin, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button, Input } from '../../components/ui';

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
        <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 items-center justify-center text-indigo-600 mb-2 shadow-2xs">
          <Ticket className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold font-['Outfit'] text-slate-900">Find My Ticket & QR Pass</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your unique booking reference (e.g. TKT-8841) to view digital ticket pass and admission QR code.
        </p>
      </div>

      {/* Lookup Card */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Booking Reference *"
              id="bookingRef"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. TKT-8841"
              required
              leftIcon={Ticket}
              className="font-mono uppercase"
            />

            <Input
              label="Email Address (Verification)"
              type="email"
              id="lookupEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              leftIcon={Mail}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
            leftIcon={Search}
          >
            Verify & View Ticket
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Need help finding reference? Check the confirmation email sent after Stripe checkout.</span>
        </div>
      </Card>

      {/* Ticket Result Display */}
      {booking && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
            <div>
              <Badge variant="success">
                {booking.status || 'CONFIRMED PASS'}
              </Badge>
              <h2 className="text-xl font-bold font-['Outfit'] text-slate-900 mt-2">
                {booking.eventTitle}
              </h2>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block font-medium">Booking Reference</span>
              <span className="text-lg font-mono font-bold text-indigo-600">{booking.bookingId || booking.bookingReference}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Guest Name</span>
              <span className="font-semibold text-slate-900 text-sm">{booking.customerName}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Email & Mobile</span>
              <span className="font-semibold text-slate-900">{booking.email} • {booking.phone}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Allocated Seats</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {booking.seats?.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Amount Paid (Stripe)</span>
              <span className="text-base font-bold text-emerald-700">${typeof booking.totalAmount === 'number' ? booking.totalAmount.toFixed(2) : booking.totalAmount}</span>
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={Printer}
            >
              Print Ticket Pass
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
