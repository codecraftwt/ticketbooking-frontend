import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
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
  User,
  Mail,
  Phone,
  Calendar,
  KeyRound,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button, Input } from '../../components/ui';

// Singleton Stripe promise cache
let stripePromiseCache = null;
const getStripePromise = (publishableKey) => {
  if (
    !stripePromiseCache &&
    publishableKey &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('MockPublishableKey')
  ) {
    stripePromiseCache = loadStripe(publishableKey);
  }
  return stripePromiseCache;
};

const cardElementOptions = {
  style: {
    base: {
      fontSize: '14px',
      color: '#0f172a',
      fontFamily: 'Outfit, system-ui, sans-serif',
      fontWeight: '500',
      '::placeholder': {
        color: '#94a3b8',
      },
      iconColor: '#d97706',
    },
    invalid: {
      color: '#e11d48',
      iconColor: '#e11d48',
    },
  },
  hidePostalCode: false,
};

// =============================================================================
// SUBCOMPONENT: Official Stripe Elements Payment Form
// =============================================================================
const StripeElementsCheckoutForm = ({
  hold,
  guest,
  setGuest,
  grandTotal,
  onPaymentSuccess,
  holdId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const fillTestGuest = () => {
    setGuest({
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '+1 (555) 438-9201',
    });
    toast.success('Filled guest details. Use Stripe test card: 4242 4242 4242 4242');
  };

  const handleStripePay = async (e) => {
    e.preventDefault();

    if (!guest.name || !guest.email || !guest.phone) {
      toast.warning('Please complete all contact details.');
      return;
    }

    if (!stripe || !elements) {
      toast.error('Stripe has not initialized yet. Please wait a moment.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element unavailable.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create real Stripe PaymentIntent on backend
      const intentRes = await api.post('/public/payments/create-intent', {
        holdId,
        reservationToken: hold.reservationToken,
        guestEmail: guest.email,
        guestName: guest.name,
        guestPhone: guest.phone,
      });

      if (!intentRes.data.success) {
        throw new Error(intentRes.data.message || 'Payment initiation failed.');
      }

      const { clientSecret, paymentIntentId } = intentRes.data.data;

      // 2. Confirm card payment directly with Stripe 3DS
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message || 'Stripe card confirmation failed.');
      }

      if (
        result.paymentIntent &&
        (result.paymentIntent.status === 'succeeded' || result.paymentIntent.status === 'processing')
      ) {
        // 3. Confirm booking in MongoDB and generate digital ticket
        const confirmRes = await api.post('/public/payments/confirm', {
          paymentIntentId: result.paymentIntent.id,
          holdId,
          reservationToken: hold.reservationToken,
          guest,
        });

        if (confirmRes.data.success && confirmRes.data.data) {
          toast.success('Payment verified via Stripe! Booking confirmed.');
          onPaymentSuccess(confirmRes.data.data.bookingReference);
        } else {
          throw new Error(confirmRes.data.message || 'Booking finalization failed.');
        }
      }
    } catch (err) {
      console.error('Stripe payment error:', err);
      toast.error(err.response?.data?.message || err.message || 'Payment processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleStripePay} className="space-y-6">
      {/* Guest Contact Information */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h2 className="text-base font-bold font-['Outfit'] text-stone-900">Guest Information</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fillTestGuest}
            leftIcon={Sparkles}
            className="text-amber-700 hover:text-amber-800 text-xs font-semibold cursor-pointer"
          >
            Fill Demo Guest
          </Button>
        </div>
        <p className="text-xs text-stone-500">
          Your admission tickets and gate QR code will be delivered to this verified email.
        </p>

        <div className="space-y-4">
          <Input
            label="Full Legal Name *"
            id="guestName"
            value={guest.name}
            onChange={(e) => setGuest({ ...guest, name: e.target.value })}
            placeholder="e.g. Alex Rivera"
            required
            leftIcon={User}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              id="guestEmail"
              value={guest.email}
              onChange={(e) => setGuest({ ...guest, email: e.target.value })}
              placeholder="alex@example.com"
              required
              leftIcon={Mail}
            />

            <Input
              label="Mobile Phone *"
              type="tel"
              id="guestPhone"
              value={guest.phone}
              onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              required
              leftIcon={Phone}
            />
          </div>
        </div>
      </Card>

      {/* Official Stripe Card Element */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold font-['Outfit'] text-stone-900">Credit or Debit Card</h2>
          </div>
          <Badge variant="success" className="text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Stripe 256-Bit SSL</span>
          </Badge>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-stone-700">
            Card Details (Number, Expiration, CVC, ZIP) *
          </label>
          <div className="p-4 bg-white border border-stone-300 rounded-xl focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-2xs">
            <CardElement
              options={cardElementOptions}
              onReady={() => setCardReady(true)}
            />
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Test mode is enabled. Use test card <strong className="text-amber-800 font-mono">4242 4242 4242 4242</strong> with any future date & CVC.
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full text-sm font-black"
            isLoading={processing}
            disabled={processing || !stripe || !cardReady}
            leftIcon={Lock}
          >
            Pay ${grandTotal.toFixed(2)} USD Securely via Stripe
          </Button>
        </div>
      </Card>
    </form>
  );
};

// =============================================================================
// SUBCOMPONENT: Fallback Test Sandbox Payment Form (Before Live Keys Configured)
// =============================================================================
const SandboxCheckoutForm = ({
  hold,
  guest,
  setGuest,
  grandTotal,
  onPaymentSuccess,
  holdId,
}) => {
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState({
    number: '',
    exp: '',
    cvc: '',
    zip: '',
  });

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
      // 1. Create PaymentIntent
      const intentRes = await api.post('/public/payments/create-intent', {
        holdId,
        reservationToken: hold.reservationToken,
        guestEmail: guest.email,
        guestName: guest.name,
        guestPhone: guest.phone,
      });

      if (!intentRes.data.success) {
        throw new Error(intentRes.data.message || 'Payment initiation failed.');
      }

      const { paymentIntentId } = intentRes.data.data;

      // 2. Confirm Payment & Generate Confirmed Booking
      const confirmRes = await api.post('/public/payments/confirm', {
        paymentIntentId,
        holdId,
        reservationToken: hold.reservationToken,
        guest,
      });

      if (confirmRes.data.success && confirmRes.data.data) {
        toast.success('Payment verified! Booking confirmed.');
        onPaymentSuccess(confirmRes.data.data.bookingReference);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.message || err.message || 'Payment processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      {/* Guest Contact Information */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h2 className="text-base font-bold font-['Outfit'] text-stone-900">Guest Information</h2>
          <Badge variant="neutral">Step 1</Badge>
        </div>
        <p className="text-xs text-stone-500">
          Your admission tickets and gate QR code will be delivered to this verified email.
        </p>

        <div className="space-y-4">
          <Input
            label="Full Legal Name *"
            id="guestName"
            value={guest.name}
            onChange={(e) => setGuest({ ...guest, name: e.target.value })}
            placeholder="e.g. Alex Rivera"
            required
            leftIcon={User}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              id="guestEmail"
              value={guest.email}
              onChange={(e) => setGuest({ ...guest, email: e.target.value })}
              placeholder="alex@example.com"
              required
              leftIcon={Mail}
            />

            <Input
              label="Mobile Phone *"
              type="tel"
              id="guestPhone"
              value={guest.phone}
              onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              required
              leftIcon={Phone}
            />
          </div>
        </div>
      </Card>

      {/* Stripe Card Payment */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold font-['Outfit'] text-stone-900">Payment Details</h2>
          </div>
          <Badge variant="warning" className="text-[10px]">
            <span>Stripe Sandbox Mode</span>
          </Badge>
        </div>

        <div className="space-y-4">
          <Input
            label="Card Number *"
            id="cardNumber"
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
            placeholder="4242 •••• •••• 4242"
            required
            leftIcon={CreditCard}
            className="font-mono"
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Expires *"
              id="cardExp"
              maxLength={5}
              value={card.exp}
              onChange={(e) => setCard({ ...card, exp: e.target.value })}
              placeholder="MM/YY"
              required
              className="font-mono text-center"
            />

            <Input
              label="CVC *"
              id="cardCvc"
              type="password"
              maxLength={4}
              value={card.cvc}
              onChange={(e) => setCard({ ...card, cvc: e.target.value })}
              placeholder="123"
              required
              leftIcon={Lock}
              className="font-mono"
            />

            <Input
              label="Postal Code"
              id="cardZip"
              value={card.zip}
              onChange={(e) => setCard({ ...card, zip: e.target.value })}
              placeholder="90210"
              className="font-mono text-center"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full text-sm font-black"
            isLoading={processing}
            disabled={processing}
            leftIcon={Lock}
          >
            Pay ${grandTotal.toFixed(2)} USD Securely
          </Button>
        </div>
      </Card>
    </form>
  );
};

// =============================================================================
// MAIN COMPONENT: CheckoutPage
// =============================================================================
export const CheckoutPage = () => {
  const { holdId } = useParams();
  const navigate = useNavigate();

  const [hold, setHold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [stripeConfig, setStripeConfig] = useState({
    publishableKey: '',
    isConfigured: false,
  });

  // Guest details form
  const [guest, setGuest] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const timerRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
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

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [holdRes, configRes] = await Promise.allSettled([
        api.get(`/public/holds/${holdId}`),
        api.get('/public/payments/config'),
      ]);

      if (holdRes.status === 'fulfilled' && holdRes.value.data.success && holdRes.value.data.data) {
        const h = holdRes.value.data.data;
        setHold(h);
        setSecondsRemaining(h.secondsRemaining || 300);
      } else {
        toast.error('Reservation hold not found or has expired.');
        navigate('/');
        return;
      }

      if (configRes.status === 'fulfilled' && configRes.value.data.success) {
        const cfg = configRes.value.data.data;
        const pubKey = cfg.publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
        const isConfigured =
          pubKey.startsWith('pk_') && !pubKey.includes('MockPublishableKey');
        setStripeConfig({
          publishableKey: pubKey,
          isConfigured,
        });
      }
    } catch (err) {
      toast.error('Failed to prepare checkout.');
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

  const onPaymentSuccess = (bookingReference) => {
    navigate(`/booking/confirmation/${bookingReference}`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs text-amber-200/80 font-medium">Securing Stripe checkout session...</p>
      </div>
    );
  }

  const facilityFee = (hold?.seatIds?.length || 1) * 1.5;
  const grandTotal = (hold?.totalAmount || 0) + facilityFee;
  const stripePromise = stripeConfig.isConfigured
    ? getStripePromise(stripeConfig.publishableKey)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Countdown */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 animate-pulse">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-900">Checkout Session Reserved</span>
              <Badge variant="warning">Hold Active</Badge>
              {stripeConfig.isConfigured && (
                <Badge variant="success" className="text-[10px]">
                  Stripe Live Gateway
                </Badge>
              )}
            </div>
            <p className="text-xs text-amber-700 mt-0.5">
              Complete payment within {formatTimer(secondsRemaining)} to guarantee these tickets.
            </p>
          </div>
        </div>

        <Link
          to={hold?.showId?._id ? `/shows/${hold.showId._id}/seats` : '/'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Seats</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Checkout Form (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          {stripeConfig.isConfigured && stripePromise ? (
            <Elements stripe={stripePromise}>
              <StripeElementsCheckoutForm
                hold={hold}
                guest={guest}
                setGuest={setGuest}
                grandTotal={grandTotal}
                onPaymentSuccess={onPaymentSuccess}
                holdId={holdId}
              />
            </Elements>
          ) : (
            <SandboxCheckoutForm
              hold={hold}
              guest={guest}
              setGuest={setGuest}
              grandTotal={grandTotal}
              onPaymentSuccess={onPaymentSuccess}
              holdId={holdId}
            />
          )}
        </div>

        {/* Order Summary (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base font-['Outfit'] text-stone-900">Order Summary</h3>
              <Badge variant="neutral">{hold?.seatIds?.length || 0} Tickets</Badge>
            </div>

            {/* Reserved Seats List */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
              <span className="font-semibold text-stone-700 block">Reserved Seats / Passes</span>
              <div className="flex flex-wrap gap-1.5">
                {hold?.seatIds?.map((seatCode) => (
                  <span
                    key={seatCode}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold text-xs"
                  >
                    {seatCode}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between text-stone-600">
                <span>Seats Subtotal</span>
                <span className="font-semibold text-stone-900">${(hold?.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Facility & Booking Fee</span>
                <span className="font-semibold text-stone-900">${facilityFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-3 border-t border-stone-200">
                <span>Total Amount Due</span>
                <span className="text-emerald-700 font-mono text-base font-extrabold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Ticket Issuance</span>
              </div>
              <p>QR Admission pass and booking voucher will be generated instantly after payment verification.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
