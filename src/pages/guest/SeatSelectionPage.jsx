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
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button } from '../../components/ui';

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

    // Initialize direct Socket.IO connection to backend (avoids Vite WS proxy ECONNABORTED drops)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
    const socket = io(socketUrl, {
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
    toast.error('Your 5-minute seat reservation has expired. Seats returned to inventory.');
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

  // Available and General Admission checks
  const availableSeats = seats.filter((s) => !s.isBooked && !s.isHeld);
  const isGeneralAdmission =
    show?.seatingType === 'GeneralAdmission' ||
    (seats.length > 0 && seats.every((s) => s.row === 'GA'));

  // Quick ticket count helper for General Admission
  const setGATicketCount = (count) => {
    if (activeHold) {
      toast.info('Hold active. Complete checkout or release tickets to change quantity.');
      return;
    }
    const maxAllowed = Math.min(8, availableSeats.length);
    const targetCount = Math.max(0, Math.min(maxAllowed, count));
    const picked = availableSeats.slice(0, targetCount).map((s) => s.code);
    setSelectedSeatCodes(picked);
  };

  // Progress percentage (300 seconds / 5 minutes default)
  const timerPercentage = Math.round((secondsRemaining / 300) * 100);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Loading interactive auditorium seat map...</p>
      </div>
    );
  }

  const startDate = show?.startTime ? new Date(show.startTime) : null;
  const uniqueRows = [...new Set(seats.map((s) => s.row))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Active Hold Countdown Banner */}
      {activeHold && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 animate-pulse">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-amber-900">Seats Reserved Exclusively for You</span>
                <Badge variant="warning">Hold Active</Badge>
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleReleaseSeats}
              leftIcon={Unlock}
            >
              Release Seats
            </Button>
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
              <Badge variant="default">
                {show?.eventId?.category || show?.category || 'Feature'}
              </Badge>
              <span className="text-xs text-slate-500 font-medium">
                {show?.venueId?.name || show?.venue || 'Grand Theater'} • {show?.hallId?.name || 'Screen 1'}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900 mt-1">
              {show?.eventId?.title || show?.title || 'Interactive Seat Selection'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-right shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Showtime</span>
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
        {/* Seat Map / Ticket Selector Viewport (3 Columns) */}
        <Card className="lg:col-span-3 p-6 sm:p-10 flex flex-col items-center">
          {isGeneralAdmission ? (
            /* General Admission / Open Seating Ticket Selector */
            <div className="w-full max-w-md mx-auto py-4 text-center space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <Badge variant="success" className="px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>General Admission • Open Seating</span>
                </Badge>
                <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
                  Select Number of Persons
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This event features open admission without assigned seat numbers. Choose your ticket count below.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {availableSeats.length} Tickets Available
                  </span>
                </div>
              </div>

              {/* Stepper Card */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 max-w-sm mx-auto space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tickets / Persons
                  </span>
                  <span className="text-xs text-indigo-600 font-extrabold font-mono">
                    ${(seats[0]?.price || 20).toFixed(2)} / ticket
                  </span>
                </div>

                <div className="flex items-center justify-center gap-6 py-2">
                  <button
                    type="button"
                    onClick={() => setGATicketCount(selectedSeatCodes.length - 1)}
                    disabled={selectedSeatCodes.length <= 0 || !!activeHold}
                    className="w-12 h-12 rounded-2xl bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 text-slate-700 flex items-center justify-center font-bold shadow-2xs transition-all cursor-pointer"
                    title="Decrease ticket count"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <div className="w-24 text-center">
                    <span className="text-4xl font-extrabold font-mono text-slate-900 block">
                      {selectedSeatCodes.length}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {selectedSeatCodes.length === 1 ? 'Person' : 'Persons'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGATicketCount(selectedSeatCodes.length + 1)}
                    disabled={
                      selectedSeatCodes.length >= Math.min(8, availableSeats.length) || !!activeHold
                    }
                    className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                    title="Increase ticket count"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-400 font-medium">Quick Pick:</span>
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={num > availableSeats.length || !!activeHold}
                      onClick={() => setGATicketCount(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedSeatCodes.length === num
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-200/60 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {num} {num === 1 ? 'Person' : 'Persons'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Numbered Seat Map Viewport */
            <>
              {/* Screen / Stage Indicator */}
              <div className="w-full max-w-lg mb-12 text-center">
                <div className="h-2.5 w-full bg-gradient-to-r from-slate-200 via-indigo-300 to-slate-200 rounded-full shadow-inner mb-2" />
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
                                  ? 'bg-red-500 hover:bg-red-600 text-white border border-red-600 shadow-xs cursor-not-allowed font-extrabold'
                                  : seat.isHeld && !isSelected
                                  ? 'bg-amber-400 text-slate-950 border border-amber-500 cursor-not-allowed animate-pulse font-bold shadow-xs'
                                  : isLockedForMe
                                  ? 'bg-emerald-600 text-white shadow-md scale-105 border border-emerald-700 font-extrabold ring-2 ring-emerald-400/40'
                                  : isSelected
                                  ? 'bg-indigo-600 text-white shadow-md scale-105 border border-indigo-700 font-extrabold ring-2 ring-indigo-400/40'
                                  : seat.tier === 'VIP'
                                  ? 'bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 font-bold shadow-2xs'
                                  : seat.tier === 'Premium'
                                  ? 'bg-purple-200 hover:bg-purple-300 text-purple-950 border border-purple-400 font-bold shadow-2xs'
                                  : seat.tier === 'Recliner'
                                  ? 'bg-pink-200 hover:bg-pink-300 text-pink-950 border border-pink-400 font-bold shadow-2xs'
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-400 font-bold shadow-2xs'
                              }`}
                            >
                              {isLockedForMe ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : seat.isBooked ? (
                                <span>✕</span>
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
                  <div className="w-4 h-4 rounded-md bg-slate-200 border border-slate-400 shadow-2xs" />
                  <span className="font-semibold text-slate-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-amber-200 border border-amber-400 shadow-2xs" />
                  <span className="font-semibold text-slate-700">VIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-purple-200 border border-purple-400 shadow-2xs" />
                  <span className="font-semibold text-slate-700">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-indigo-600 border border-indigo-700 shadow-2xs" />
                  <span className="font-bold text-indigo-700">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-emerald-600 border border-emerald-700 shadow-2xs" />
                  <span className="font-bold text-emerald-700">Held by You</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-amber-400 border border-amber-500 shadow-2xs" />
                  <span className="font-semibold text-slate-700">Held by Others</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-red-500 border border-red-600 shadow-2xs text-white text-[8px] flex items-center justify-center font-bold">
                    ✕
                  </div>
                  <span className="font-bold text-red-600">Booked</span>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Order Summary & Checkout Trigger (1 Column) */}
        <Card className="p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold font-['Outfit'] text-slate-900">
                {isGeneralAdmission ? 'Ticket Summary' : 'Booking Summary'}
              </h2>
              <Badge variant="secondary">
                {selectedSeatCodes.length}{' '}
                {selectedSeatCodes.length === 1
                  ? isGeneralAdmission
                    ? 'Person'
                    : 'Seat'
                  : isGeneralAdmission
                  ? 'Persons'
                  : 'Seats'}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-indigo-600" />
                  <span>{isGeneralAdmission ? 'Selected Tickets' : 'Selected Seats'}</span>
                </span>
                {activeHold && (
                  <Badge variant="success" className="text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Locked
                  </Badge>
                )}
              </div>

              {selectedSeatObjects.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2">
                  {isGeneralAdmission
                    ? 'Choose number of persons above to proceed.'
                    : 'Click seats on the auditorium map to start booking.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSeatObjects.map((s) => (
                    <span
                      key={s.code}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold flex items-center gap-1"
                    >
                      <span>{isGeneralAdmission ? `Ticket #${s.num}` : s.code}</span>
                      <span className="text-[10px] text-indigo-500 font-normal">(${s.price})</span>
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
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Due</span>
                <span className="text-emerald-700 font-mono text-base font-extrabold">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Hold status info */}
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 flex items-start gap-2">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-600" />
              <span>
                {activeHold
                  ? `Tickets are temporarily locked for ${formatTimer(secondsRemaining)}. Complete payment before timer runs out.`
                  : 'Clicking lock temporarily reserves your tickets for 5 minutes during Stripe checkout.'}
              </span>
            </div>
          </div>

          {/* Action Button: Reserve Hold or Proceed to Stripe Checkout */}
          <div className="space-y-2 pt-4">
            {!activeHold ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleLockSeats}
                disabled={selectedSeatCodes.length === 0 || holding}
                isLoading={holding}
                leftIcon={Lock}
              >
                {isGeneralAdmission ? 'Lock Tickets for 5 Minutes' : 'Lock Seats for 5 Minutes'}
              </Button>
            ) : (
              <Button
                variant="success"
                size="lg"
                className="w-full"
                onClick={() => navigate(`/checkout/${activeHold.holdId}`)}
                leftIcon={ShieldCheck}
                rightIcon={ChevronRight}
              >
                Proceed to Checkout ({formatTimer(secondsRemaining)})
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
