import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Ticket,
  Search,
  Filter,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  X,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  DollarSign,
  Trash2,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Film,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button, PageHeader } from '../../components/ui';

export const AdminBookingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEventId = searchParams.get('eventId');

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('by_event'); // 'by_event' | 'combined'

  // Event search & filter
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('All');

  // Booking search & filter
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Refund Modal State
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [refundNote, setRefundNote] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  // Clear / Purge All Bookings State
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purging, setPurging] = useState(false);

  // Initial data load: events and all bookings
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        api.get('/admin/events'),
        api.get('/admin/operations/bookings'),
      ]);

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data || []);
      }
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load events and bookings data.');
    } finally {
      setLoading(false);
    }
  };

  const reloadBookings = async () => {
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (bookingSearchTerm.trim()) params.search = bookingSearchTerm.trim();
      if (selectedEventId) params.eventId = selectedEventId;

      const res = await api.get('/admin/operations/bookings', { params });
      if (res.data.success) {
        setBookings(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to refresh bookings.');
    }
  };

  // Aggregated per-event booking statistics
  const eventStats = useMemo(() => {
    const stats = {};
    events.forEach((evt) => {
      stats[evt._id] = {
        bookingsCount: 0,
        ticketsCount: 0,
        revenue: 0,
      };
    });

    bookings.forEach((b) => {
      const eid = b.eventId?._id || b.eventId;
      if (eid && stats[eid]) {
        stats[eid].bookingsCount += 1;
        stats[eid].ticketsCount += b.seats?.length || 0;
        if (b.paymentStatus === 'PAID') {
          stats[eid].revenue += b.totalAmount || 0;
        }
      }
    });

    return stats;
  }, [events, bookings]);

  // Selected event object
  const activeEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return events.find((e) => e._id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Filtered list of events for the Event Selection View
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        !eventSearchTerm.trim() ||
        evt.title.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
        evt.primaryVenue?.name?.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
        evt.category?.toLowerCase().includes(eventSearchTerm.toLowerCase());

      const matchesCategory =
        eventCategoryFilter === 'All' || evt.category === eventCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [events, eventSearchTerm, eventCategoryFilter]);

  // Categories list from existing events
  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [events]);

  // Filtered bookings for the selected event (or global if combined view)
  const displayedBookings = useMemo(() => {
    let list = bookings;

    if (selectedEventId) {
      list = list.filter((b) => {
        const eid = b.eventId?._id || b.eventId;
        return eid === selectedEventId;
      });
    }

    if (statusFilter !== 'All') {
      list = list.filter((b) => b.bookingStatus === statusFilter);
    }

    if (bookingSearchTerm.trim()) {
      const q = bookingSearchTerm.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.bookingReference?.toLowerCase().includes(q) ||
          b.guest?.name?.toLowerCase().includes(q) ||
          b.guest?.email?.toLowerCase().includes(q) ||
          b.guest?.phone?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [bookings, selectedEventId, statusFilter, bookingSearchTerm]);

  const handleSelectEvent = (eventId) => {
    setSearchParams({ eventId });
    setBookingSearchTerm('');
    setStatusFilter('All');
  };

  const handleClearSelectedEvent = () => {
    setSearchParams({});
    setBookingSearchTerm('');
    setStatusFilter('All');
    setViewMode('by_event');
  };

  const handlePurgeBookings = async () => {
    setPurging(true);
    try {
      const res = await api.delete('/admin/operations/bookings/purge');
      if (res.data.success) {
        toast.success('All booking and sales test data has been cleared.');
        setShowPurgeModal(false);
        fetchInitialData();
      }
    } catch (err) {
      toast.error('Failed to clear bookings data.');
    } finally {
      setPurging(false);
    }
  };

  const handleDownloadCSV = async (eventId = null) => {
    try {
      const url = eventId
        ? `/admin/operations/export/bookings.csv?eventId=${eventId}`
        : `/admin/operations/export/bookings.csv`;
      const res = await api.get(url, {
        responseType: 'blob',
      });
      const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      const filename = eventId
        ? `event_bookings_${activeEvent?.slug || eventId}_${Date.now()}.csv`
        : `ticketcraft_all_bookings_${Date.now()}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Bookings CSV exported successfully.');
    } catch (err) {
      toast.error('Failed to generate bookings CSV export.');
    }
  };

  const handleExecuteRefund = async (e) => {
    e.preventDefault();
    if (!selectedBookingForRefund) return;

    setProcessingRefund(true);
    try {
      const res = await api.post(`/admin/operations/bookings/${selectedBookingForRefund._id}/refund`, {
        reason: refundReason,
        note: refundNote,
      });

      if (res.data.success) {
        toast.success(`Refund processed for ${selectedBookingForRefund.bookingReference}. Seats released.`);
        setSelectedBookingForRefund(null);
        setRefundNote('');
        fetchInitialData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund processing failed.');
    } finally {
      setProcessingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-medium">Loading events and reservations from database...</p>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: EVENT-SPECIFIC BOOKINGS VIEW (When an event is clicked)
  // =========================================================================
  if (selectedEventId && activeEvent) {
    const curStats = eventStats[activeEvent._id] || { bookingsCount: 0, ticketsCount: 0, revenue: 0 };
    const firstShow = activeEvent.shows?.[0];
    const showDate = firstShow ? new Date(firstShow.startTime) : null;

    return (
      <div className="space-y-8">
        {/* Back Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={handleClearSelectedEvent}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-bold transition-all shadow-2xs group cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 group-hover:text-indigo-600 transition-transform" />
            <span>Back to All Events</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={Download}
              onClick={() => handleDownloadCSV(activeEvent._id)}
            >
              Export Event CSV
            </Button>
            {bookings.length > 0 && (
              <Button
                variant="outline"
                size="md"
                leftIcon={Trash2}
                onClick={() => setShowPurgeModal(true)}
                className="text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              >
                Clear Bookings
              </Button>
            )}
          </div>
        </div>

        {/* Event Header Banner Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-2xs">
              <img
                src={
                  activeEvent.posterImage ||
                  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
                }
                alt={activeEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary">{activeEvent.category}</Badge>
                {activeEvent.ageRating && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Rated {activeEvent.ageRating}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit']">
                {activeEvent.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                {activeEvent.primaryVenue && (
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {activeEvent.primaryVenue.name}
                    {activeEvent.primaryHall ? ` • ${activeEvent.primaryHall.name}` : ''}
                  </span>
                )}
                {showDate && (
                  <span className="flex items-center gap-1 font-medium text-indigo-600">
                    <Calendar className="w-3.5 h-3.5" />
                    {showDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                    {showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reservations</p>
              <p className="text-lg font-extrabold text-slate-900 font-['Outfit'] mt-0.5">
                {curStats.bookingsCount}
              </p>
            </div>
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Tickets Sold</p>
              <p className="text-lg font-extrabold text-indigo-700 font-['Outfit'] mt-0.5">
                {curStats.ticketsCount}
              </p>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Revenue</p>
              <p className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
                ${curStats.revenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={bookingSearchTerm}
              onChange={(e) => setBookingSearchTerm(e.target.value)}
              placeholder="Search reference (TKT-...), guest name, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Status:</span>
            {['All', 'CONFIRMED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table for this Event */}
        <Card>
          {displayedBookings.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                <Ticket className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No reservations found for {activeEvent.title}</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {bookingSearchTerm || statusFilter !== 'All'
                  ? 'Try clearing your search query or status filter.'
                  : 'When customers reserve tickets for this event, their booking records will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6">Booking Ref</th>
                    <th className="py-3.5">Guest Details</th>
                    <th className="py-3.5">Allocated Seats</th>
                    <th className="py-3.5">Amount</th>
                    <th className="py-3.5">Payment</th>
                    <th className="py-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-4 pl-6 font-mono font-bold text-indigo-600">
                        <p>{b.bookingReference}</p>
                        <p className="text-[10px] text-slate-400 font-sans font-medium mt-0.5">
                          {new Date(b.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="py-4">
                        <p className="font-bold text-slate-900">{b.guest?.name || 'Guest'}</p>
                        <p className="text-[11px] text-slate-500">{b.guest?.email}</p>
                        <p className="text-[10px] text-slate-400">{b.guest?.phone}</p>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {b.seats?.map((s) => (
                            <span
                              key={s.seatId}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200"
                            >
                              {s.seatId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-900 text-sm">
                        ${(b.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-4">
                        <Badge variant={b.paymentStatus === 'REFUNDED' ? 'danger' : 'success'}>
                          {b.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PAID'}
                        </Badge>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        {b.bookingStatus === 'CANCELLED' || b.paymentStatus === 'REFUNDED' ? (
                          <span className="text-[11px] text-slate-400 italic font-medium">Refunded</span>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={RotateCcw}
                            onClick={() => setSelectedBookingForRefund(b)}
                            className="ml-auto"
                          >
                            Stripe Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Render Refund Modal */}
        {renderRefundModal()}
        {/* Render Purge Modal */}
        {renderPurgeModal()}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: GLOBAL COMBINED TABLE VIEW (If user toggled combined view)
  // =========================================================================
  if (viewMode === 'combined') {
    return (
      <div className="space-y-8">
        <PageHeader
          badge="Global Bookings View"
          badgeVariant="primary"
          title="All Customer Reservations"
          description="Unified view of all verified bookings across all events in your catalog."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                leftIcon={ArrowLeft}
                onClick={() => setViewMode('by_event')}
              >
                View by Event
              </Button>
              {bookings.length > 0 && (
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={Trash2}
                  onClick={() => setShowPurgeModal(true)}
                  className="text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                >
                  Clear All Bookings
                </Button>
              )}
              <Button variant="outline" size="md" icon={Download} onClick={() => handleDownloadCSV()}>
                Export CSV
              </Button>
            </div>
          }
        />

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={bookingSearchTerm}
              onChange={(e) => setBookingSearchTerm(e.target.value)}
              placeholder="Search reference (TKT-...), guest name, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Status:</span>
            {['All', 'CONFIRMED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Global Bookings Table */}
        <Card>
          {displayedBookings.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Ticket className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No bookings found</p>
              <p className="text-xs text-slate-500">Try adjusting your search criteria or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6">Booking Ref</th>
                    <th className="py-3.5">Guest Details</th>
                    <th className="py-3.5">Event & Auditorium</th>
                    <th className="py-3.5">Allocated Seats</th>
                    <th className="py-3.5">Amount</th>
                    <th className="py-3.5">Payment</th>
                    <th className="py-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-4 pl-6 font-mono font-bold text-indigo-600">
                        <p>{b.bookingReference}</p>
                        <p className="text-[10px] text-slate-400 font-sans font-medium mt-0.5">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4">
                        <p className="font-bold text-slate-900">{b.guest?.name || 'Guest'}</p>
                        <p className="text-[11px] text-slate-500">{b.guest?.email}</p>
                        <p className="text-[10px] text-slate-400">{b.guest?.phone}</p>
                      </td>
                      <td className="py-4 text-slate-700">
                        <p className="font-bold text-slate-900 line-clamp-1">{b.eventId?.title || 'Live Show'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {b.venueId?.name} • {b.hallId?.name}
                        </p>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {b.seats?.map((s) => (
                            <span
                              key={s.seatId}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200"
                            >
                              {s.seatId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-900 text-sm">
                        ${(b.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-4">
                        <Badge variant={b.paymentStatus === 'REFUNDED' ? 'danger' : 'success'}>
                          {b.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PAID'}
                        </Badge>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        {b.bookingStatus === 'CANCELLED' || b.paymentStatus === 'REFUNDED' ? (
                          <span className="text-[11px] text-slate-400 italic font-medium">Refunded</span>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={RotateCcw}
                            onClick={() => setSelectedBookingForRefund(b)}
                            className="ml-auto"
                          >
                            Stripe Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {renderRefundModal()}
        {renderPurgeModal()}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: EVENTS SELECTION GRID (Default view requested by user)
  // "First all event list, then user click on that event, then they see the booking list of that particular event"
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <PageHeader
        badge="Events & Reservations"
        badgeVariant="primary"
        title="Event Booking Records"
        description="Select any event below to inspect its verified guest bookings, seats, and issue refunds."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={Layers}
              onClick={() => setViewMode('combined')}
              title="View all bookings across all events in one combined list"
            >
              All Bookings Combined
            </Button>
            {bookings.length > 0 && (
              <Button
                variant="outline"
                size="md"
                leftIcon={Trash2}
                onClick={() => setShowPurgeModal(true)}
                className="text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              >
                Clear All Bookings
              </Button>
            )}
            <Button variant="outline" size="md" icon={Download} onClick={() => handleDownloadCSV()}>
              Export All CSV
            </Button>
          </div>
        }
      />

      {/* Event Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={eventSearchTerm}
            onChange={(e) => setEventSearchTerm(e.target.value)}
            placeholder="Search events by title, venue, or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setEventCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                eventCategoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Table */}
      {filteredEvents.length === 0 ? (
        <Card className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">No Events Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {eventSearchTerm || eventCategoryFilter !== 'All'
                ? 'No events matched your current search filters.'
                : 'Create an event first to start receiving ticket reservations and managing guest bookings.'}
            </p>
          </div>
          {events.length === 0 && (
            <Link to="/admin/events/new">
              <Button variant="primary" size="md">
                Create First Event
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 pl-6">Event Details</th>
                  <th className="py-3.5">Venue & Screen</th>
                  <th className="py-3.5">Show Date & Time</th>
                  <th className="py-3.5 text-center">Reservations</th>
                  <th className="py-3.5 text-center">Tickets Sold</th>
                  <th className="py-3.5">Gross Revenue</th>
                  <th className="py-3.5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => {
                  const stats = eventStats[evt._id] || { bookingsCount: 0, ticketsCount: 0, revenue: 0 };
                  const venue = evt.primaryVenue;
                  const hall = evt.primaryHall;
                  const firstShow = evt.shows?.[0];
                  const startDate = firstShow ? new Date(firstShow.startTime) : null;

                  return (
                    <tr
                      key={evt._id}
                      onClick={() => handleSelectEvent(evt._id)}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Event Details: Thumbnail + Title + Category + Duration */}
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-2xs group-hover:ring-2 ring-indigo-500/30 transition-all">
                            <img
                              src={
                                evt.posterImage ||
                                'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
                              }
                              alt={evt.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {evt.title}
                              </span>
                              <Badge variant="secondary" className="text-[10px] py-0 px-2 font-bold">
                                {evt.category}
                              </Badge>
                              {evt.ageRating && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  {evt.ageRating}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {evt.durationMinutes} mins
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Venue & Screen */}
                      <td className="py-4 text-slate-700">
                        <p className="font-bold text-slate-900">{venue?.name || 'Main Venue'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {hall ? hall.name : (venue?.city || 'Auditorium')}
                        </p>
                      </td>

                      {/* Show Date & Time */}
                      <td className="py-4">
                        {startDate ? (
                          <div>
                            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                              {startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-[11px] text-slate-500 pl-5 mt-0.5">
                              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Open Scheduling</span>
                        )}
                      </td>

                      {/* Reservations Count */}
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <Ticket className="w-3.5 h-3.5 text-slate-400" />
                          {stats.bookingsCount} {stats.bookingsCount === 1 ? 'Booking' : 'Bookings'}
                        </span>
                      </td>

                      {/* Tickets Sold */}
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          {stats.ticketsCount} {stats.ticketsCount === 1 ? 'Ticket' : 'Tickets'}
                        </span>
                      </td>

                      {/* Revenue */}
                      <td className="py-4 font-mono font-bold text-emerald-600 text-sm">
                        ${stats.revenue.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectEvent(evt._id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all shadow-2xs group/btn cursor-pointer"
                        >
                          <span>View Bookings</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {renderPurgeModal()}
    </div>
  );

  // Helper renderer: Stripe Refund Modal
  function renderRefundModal() {
    if (!selectedBookingForRefund) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Process Stripe Refund</h3>
            </div>
            <button
              onClick={() => setSelectedBookingForRefund(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Reference:</span>
              <span className="font-mono font-bold text-indigo-600">
                {selectedBookingForRefund.bookingReference}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Guest:</span>
              <span className="font-semibold text-slate-900">
                {selectedBookingForRefund.guest?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Seats To Release:</span>
              <span className="font-mono font-bold text-amber-700">
                {selectedBookingForRefund.seats?.map((s) => s.seatId).join(', ')}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold">
              <span className="text-slate-900">Refund Total:</span>
              <span className="text-emerald-700 font-mono">
                ${(selectedBookingForRefund.totalAmount || 0).toFixed(2)} USD
              </span>
            </div>
          </div>

          <form onSubmit={handleExecuteRefund} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Refund</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
              >
                <option value="requested_by_customer">Customer Requested Cancellation</option>
                <option value="duplicate">Duplicate Transaction</option>
                <option value="cancelled_event">Event / Show Rescheduled</option>
                <option value="other">Administrative Override</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Internal Note (Optional)</label>
              <textarea
                rows={2}
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                placeholder="Reasoning for audit trail..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Executing this refund will immediately reverse the Stripe charge and release held seats back to the public over Socket.IO.
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedBookingForRefund(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={processingRefund}
                loading={processingRefund}
              >
                Execute Stripe Refund
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Helper renderer: Clear/Purge All Bookings Modal
  function renderPurgeModal() {
    if (!showPurgeModal) return null;

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Clear All Test Bookings?</h3>
              <p className="text-xs text-slate-500">
                This will remove all booking records, reset sales metrics to $0, and release seats back to inventory.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Use this to clean test data before launching publicly. This action cannot be undone.
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowPurgeModal(false)}
              disabled={purging}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handlePurgeBookings}
              disabled={purging}
              loading={purging}
              leftIcon={Trash2}
            >
              Yes, Clear All Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }
};
