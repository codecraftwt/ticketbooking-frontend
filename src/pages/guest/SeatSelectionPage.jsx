import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../services/api';
import {
  ArrowLeft,
  Ticket,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
  Timer,
  Lock,
  Unlock,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export const SeatSelectionPage = () => {
  const { id } = useParams(); // Show ID
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Seat Selection State
  const [selectedSeatCodes, setSelectedSeatCodes] = useState([]);
  const [activeHold, setActiveHold] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [holding, setHolding] = useState(false);

  // Socket reference
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchShowData();

    // Initialize Socket.IO connection
    const socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('join_show', id);

    // Listen for real-time seat lock/release broadcasts from other guests
    socket.on('seats_updated', (update) => {
      if (update && update.seatIds && update.status) {
        setSeats((prevSeats) =>
          prevSeats.map((s) => {
            if (update.seatIds.includes(s.code)) {
              return {
                ...s,
                isBooked: update.status === 'BOOKED' || s.isBlocked,
                isHeld: update.status === 'HELD',
              };
            }
            return s;
          })
        );
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_show', id);
        socketRef.current.disconnect();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Countdown Timer Hook
  useEffect(() => {
    if (activeHold && secondsRemaining > 0) {
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
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeHold, secondsRemaining]);

  const handleHoldExpired = () => {
    toast.error('Your 5-minute seat reservation has expired. Seats have been returned to available inventory.');
    setActiveHold(null);
    setSelectedSeatCodes([]);
    fetchShowData();
  };

  const fetchShowData = async () => {
    try {
      const res = await api.get(`/shows/${id}`);
      if (res.data.success && res.data.data) {
        const s = res.data.data;
        setShow(s);

        // Map inventory into flat seats array
        const rawSeats = s.seats || s.inventory || [];
        if (rawSeats.length > 0) {
          const mapped = rawSeats.map((item) => ({
            code: item.seatId,
            row: item.rowLabel || item.row || item.seatId?.[0] || 'A',
            num: item.seatNumber || item.number || parseInt(item.seatId?.slice(1)) || 1,
            tier: item.tier || 'Standard',
            price: item.price || 20,
            isBooked: item.status === 'BOOKED' || item.isBlocked,
            isHeld: item.status === 'HELD',
            isAccessible: item.isAccessible,
          }));
          setSeats(mapped);
        } else {
          // Fallback mock grid
          const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
          const fallback = [];
          rows.forEach((r) => {
            for (let i = 1; i <= 10; i++) {
              const code = `${r}${i}`;
              fallback.push({
                code,
                row: r,
                num: i,
                tier: r === 'A' || r === 'B' ? 'VIP' : r === 'C' ? 'Premium' : 'Standard',
                price: r === 'A' || r === 'B' ? 40 : r === 'C' ? 30 : 20,
                isBooked: false,
                isHeld: false,
              });
            }
          });
          setSeats(fallback);
        }
      }
    } catch (err) {
      toast.error('Failed to load show seats.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Seat Selection
  const toggleSeat = (seat) => {
    if (seat.isBooked || (seat.isHeld && !selectedSeatCodes.includes(seat.code))) {
      return;
    }

    if (activeHold) {
      toast.info('You have an active hold. Complete checkout or release your seats to pick different ones.');
      return;
    }

    if (selectedSeatCodes.includes(seat.code)) {
      setSelectedSeatCodes(selectedSeatCodes.filter((c) => c !== seat.code));
    } else {
      if (selectedSeatCodes.length >= 8) {
        toast.warning('Maximum 8 tickets allowed per guest checkout.');
        return;
      }
      setSelectedSeatCodes([...selectedSeatCodes, seat.code]);
    }
  };

  // Lock Seats (5-Minute Hold)
  const handleLockSeats = async () => {
    if (selectedSeatCodes.length === 0) {
      toast.warning('Please click one or more seats first.');
      return;
    }

    setHolding(true);
    try {
      const res = await api.post('/public/holds', {
        showId: id,
        seatIds: selectedSeatCodes,
      });

      if (res.data.success && res.data.data) {
        const h = res.data.data;
        setActiveHold(h);
        setSecondsRemaining(h.secondsRemaining || 300);
        toast.success(`Seats locked for 5:00! Complete payment before expiry.`);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(err.response?.data?.message || 'One or more seats were just held by another guest.');
        fetchShowData();
      } else {
        toast.error(err.response?.data?.message || 'Failed to lock seats.');
      }
    } finally {
      setHolding(false);
    }
  };

  // Release Seats Early
  const handleReleaseSeats = async () => {
    if (!activeHold) return;

    try {
      await api.delete(`/public/holds/${activeHold.holdId}`, {
        data: { reservationToken: activeHold.reservationToken },
      });
      setActiveHold(null);
      setSecondsRemaining(0);
      setSelectedSeatCodes([]);
      toast.info('Seats released.');
      fetchShowData();
    } catch (err) {
      toast.error('Failed to release hold.');
    }
  };

  // Selected seats objects
  const selectedSeatObjects = seats.filter((s) => selectedSeatCodes.includes(s.code));
  const subtotalPrice = selectedSeatObjects.reduce((acc, curr) => acc + curr.price, 0);
  const facilityFee = selectedSeatObjects.length * 1.5;
  const totalPrice = subtotalPrice + facilityFee;

  // Format timer MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage (300 seconds default)
  const timerPercentage = Math.round((secondsRemaining / 300) * 100);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500">Loading interactive seat layout...</p>
      </div>
    );
  }

  const startDate = show?.startTime ? new Date(show.startTime) : null;
  const uniqueRows = [...new Set(seats.map((s) => s.row))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Active Hold Countdown Banner */}
      {activeHold && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 animate-pulse">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-amber-900">Seats Reserved Exclusively for You</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                  Live Hold Active
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                Complete your checkout before the timer expires to secure your tickets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block">
                Time Remaining
              </span>
              <span className="text-2xl font-mono font-extrabold text-amber-900 tracking-tight">
                {formatTimer(secondsRemaining)}
              </span>
            </div>
            <button
              onClick={handleReleaseSeats}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Release Seats</span>
            </button>
          </div>

          {/* Animated Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-200">
            <div
              style={{ width: `${timerPercentage}%` }}
              className="h-full bg-amber-500 transition-all duration-1000"
            />
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Event Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link
            to={show?.eventId?.slug ? `/events/${show.eventId.slug}` : '/'}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {show?.eventId?.category || show?.category || 'Feature'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {show?.venueId?.name || show?.venue || 'Grand IMAX'} • {show?.hallId?.name || 'Screen 1'}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900 mt-1">
              {show?.eventId?.title || show?.title || 'Live Experience'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-right shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Showtime</span>
            <span className="text-xs font-bold text-slate-900">
              {startDate
                ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : show?.date}{' '}
              •{' '}
              {startDate
                ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : show?.time}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Seat Canvas & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Seat Map Viewport (3 Columns) */}
        <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center">
          {/* Screen / Stage Indicator */}
          <div className="w-full max-w-lg mb-12 text-center">
            <div className="h-2 w-full bg-slate-300 rounded-full shadow-xs mb-2" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-mono">
              {show?.layout?.stage?.label || '70MM IMAX LASER CURVED SCREEN'}
            </span>
          </div>

          {/* Seat Grid */}
          <div className="w-full max-w-2xl space-y-3.5 overflow-x-auto pb-4">
            {uniqueRows.map((rowLetter) => {
              const rowSeats = seats.filter((s) => s.row === rowLetter);
              return (
                <div key={rowLetter} className="flex items-center justify-center gap-2 min-w-max">
                  <span className="w-6 text-xs font-bold font-mono text-slate-400 text-center">
                    {rowLetter}
                  </span>
                  <div className="flex gap-2">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeatCodes.includes(seat.code);
                      const isLockedForMe = isSelected && activeHold;

                      return (
                        <button
                          key={seat.code}
                          type="button"
                          onClick={() => toggleSeat(seat)}
                          disabled={seat.isBooked || (seat.isHeld && !isSelected)}
                          title={`${seat.code} • ${seat.tier} • $${seat.price}${
                            seat.isHeld ? ' (Held)' : seat.isBooked ? ' (Booked)' : ''
                          }`}
                          className={`w-9 h-9 rounded-xl text-xs font-semibold font-mono flex items-center justify-center transition-all cursor-pointer relative group ${
                            seat.isBooked
                              ? 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                              : seat.isHeld && !isSelected
                              ? 'bg-amber-100 text-amber-700 border border-amber-300 cursor-not-allowed animate-pulse'
                              : isLockedForMe
                              ? 'bg-emerald-600 text-white shadow-xs scale-105 border border-emerald-600 font-bold'
                              : isSelected
                              ? 'bg-indigo-600 text-white shadow-xs scale-105 border border-indigo-600 font-bold'
                              : seat.tier === 'VIP'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              : seat.tier === 'Premium'
                              ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isLockedForMe ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <span>{seat.num}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span className="w-6 text-xs font-bold font-mono text-slate-400 text-center">
                    {rowLetter}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Seat Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-10 pt-6 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-slate-100 border border-slate-300" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-indigo-600 border border-indigo-600" />
              <span className="font-medium text-slate-800">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-emerald-600 border border-emerald-600" />
              <span className="font-medium text-slate-800">Held by You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-amber-100 border border-amber-300" />
              <span>Held by Others</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-slate-200 border border-slate-300 line-through text-slate-400" />
              <span>Booked</span>
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout Trigger (1 Column) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-['Outfit'] text-slate-900">Booking Summary</h2>
              <span className="text-[11px] font-semibold text-slate-500">
                {selectedSeatCodes.length} {selectedSeatCodes.length === 1 ? 'Seat' : 'Seats'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-indigo-600" />
                  <span>Selected Seats</span>
                </span>
                {activeHold && (
                  <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>

              {selectedSeatObjects.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2">
                  Click seats on the auditorium map to start booking.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSeatObjects.map((s) => (
                    <span
                      key={s.code}
                      className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold flex items-center gap-1"
                    >
                      <span>{s.code}</span>
                      <span className="text-[10px] text-indigo-500">(${s.price})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service & Facility Fee</span>
                <span className="font-semibold text-slate-900">${facilityFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Due</span>
                <span className="text-emerald-700 font-mono text-base font-extrabold">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Hold status info */}
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 flex items-start gap-2">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-600" />
              <span>
                {activeHold
                  ? `Seats are temporarily locked for ${formatTimer(secondsRemaining)}. Complete payment before timer runs out.`
                  : 'Clicking "Reserve & Pay" atomically locks your seats for 5 minutes during Stripe checkout.'}
              </span>
            </div>
          </div>

          {/* Action Button: Reserve Hold or Proceed to Stripe Checkout */}
          <div className="space-y-2">
            {!activeHold ? (
              <button
                type="button"
                onClick={handleLockSeats}
                disabled={selectedSeatCodes.length === 0 || holding}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {holding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Locking Seats in Realtime...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Lock Seats for 5 Minutes</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/checkout/${activeHold.holdId}`)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Proceed to Stripe Checkout ({formatTimer(secondsRemaining)})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
