import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Timer,
  Ticket,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';

export const CheckoutPage = () => {
  const { holdId } = useParams();
  const navigate = useNavigate();

  const [hold, setHold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);

  // Guest details form
  const [guest, setGuest] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Card details (Stripe Test Sandbox)
  const [card, setCard] = useState({
    number: '',
    exp: '',
    cvc: '',
    zip: '',
  });

  const timerRef = useRef(null);

  useEffect(() => {
    fetchHold();
  }, [holdId]);

  useEffect(() => {
    if (secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleHoldExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsRemaining]);

  const handleHoldExpired = () => {
    toast.error('Your reservation hold has expired. Returning to seat selection.');
    if (hold?.showId?._id || hold?.showId) {
      navigate(`/shows/${hold.showId?._id || hold.showId}/seats`);
    } else {
      navigate('/');
    }
  };

  const fetchHold = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/public/holds/${holdId}`);
      if (res.data.success && res.data.data) {
        const h = res.data.data;
        setHold(h);
        setSecondsRemaining(h.secondsRemaining || 300);
      }
    } catch (err) {
      toast.error('Reservation hold not found or has expired.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to fill Stripe Test Sandbox details
  const fillTestCard = () => {
    setGuest({
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '+1 (555) 438-9201',
    });
    setCard({
      number: '4242 4242 4242 4242',
      exp: '12/28',
      cvc: '123',
      zip: '90210',
    });
    toast.success('Filled with Stripe Sandbox Test Credentials.');
  };

  const handlePay = async (e) => {
    e.preventDefault();

    if (!guest.name || !guest.email || !guest.phone) {
      toast.warning('Please complete all contact details.');
      return;
    }

    if (!card.number || !card.exp || !card.cvc) {
      toast.warning('Please complete your card payment information.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create Stripe PaymentIntent
      const intentRes = await api.post('/public/payments/create-intent', {
        holdId,
        reservationToken: hold.reservationToken,
        guestEmail: guest.email,
        guestName: guest.name,
      });

      if (!intentRes.data.success) {
        throw new Error(intentRes.data.message || 'Payment initiation failed.');
      }

      const { paymentIntentId, clientSecret } = intentRes.data.data;

      // 2. Confirm Payment & Generate Confirmed Booking
      const confirmRes = await api.post('/public/payments/confirm', {
        paymentIntentId,
        holdId,
        reservationToken: hold.reservationToken,
        guest,
      });

      if (confirmRes.data.success && confirmRes.data.data) {
        toast.success('Payment verified! Booking confirmed.');
        navigate(`/booking/confirmation/${confirmRes.data.data.bookingReference}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.message || err.message || 'Payment processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500">Securing checkout session...</p>
      </div>
    );
  }

  const facilityFee = (hold?.seatIds?.length || 1) * 1.5;
  const grandTotal = (hold?.totalAmount || 0) + facilityFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Countdown */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 animate-pulse">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-900">Checkout Session Reserved</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                Hold Active
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-0.5">
              Complete payment within {formatTimer(secondsRemaining)} to guarantee these tickets.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fillTestCard}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Fill Test Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Checkout Form (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handlePay} className="space-y-6">
            {/* Guest Contact Information */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-base font-bold font-['Outfit'] text-slate-900">Guest Information</h2>
              <p className="text-xs text-slate-500">
                Your tickets and admission QR code will be delivered to this email.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                    placeholder="e.g. Alex Rivera"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={guest.email}
                      onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                      placeholder="alex@example.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      value={guest.phone}
                      onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stripe Card Payment */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold font-['Outfit'] text-slate-900">Card Payment</h2>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Stripe 256-Bit SSL</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Card Number *</label>
                  <input
                    type="text"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                    placeholder="4242 •••• •••• 4242"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expires *</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={card.exp}
                      onChange={(e) => setCard({ ...card, exp: e.target.value })}
                      placeholder="MM/YY"
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CVC *</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                      placeholder="123"
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={card.zip}
                      onChange={(e) => setCard({ ...card, zip: e.target.value })}
                      placeholder="90210"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${grandTotal.toFixed(2)} USD</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-base font-['Outfit'] text-slate-900">Order Summary</h3>

            {/* Reserved Seats List */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block">Reserved Seats ({hold?.seatIds?.length || 0})</span>
              <div className="flex flex-wrap gap-1.5">
                {hold?.seatIds?.map((seatCode) => (
                  <span
                    key={seatCode}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-xs"
                  >
                    {seatCode}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between text-slate-600">
                <span>Seats Subtotal</span>
                <span className="font-semibold text-slate-900">${(hold?.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Facility & Booking Fee</span>
                <span className="font-semibold text-slate-900">${facilityFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount Due</span>
                <span className="text-emerald-700 font-mono text-base font-extrabold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Ticket Issuance</span>
              </div>
              <p>QR Admission pass will be generated instantly after payment verification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
