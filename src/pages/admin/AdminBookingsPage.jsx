import React, { useState, useEffect } from 'react';
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
  QrCode,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, PageHeader, Input } from '../../components/ui';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Refund Modal State
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [refundNote, setRefundNote] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/admin/operations/bookings', { params });
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await api.get('/admin/operations/export/bookings.csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticketcraft_bookings_${Date.now()}.csv`);
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
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund processing failed.');
    } finally {
      setProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <PageHeader
        badge="Stripe Gateway Operations"
        badgeVariant="primary"
        title="Guest Reservations & Passes"
        description="View verified ticket sales, inspect customer details, and issue single-click refunds."
        actions={
          <Button variant="outline" size="md" icon={Download} onClick={handleDownloadCSV}>
            Export CSV
          </Button>
        }
      />

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference (TKT-...), guest name, or email..."
            className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all shadow-2xs"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Filter
          </button>
        </form>

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

      {/* Bookings Table Card */}
      <Card>
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500 font-medium">Loading bookings from MongoDB Atlas...</p>
          </div>
        ) : bookings.length === 0 ? (
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
                {bookings.map((b) => (
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

      {/* Modal: Process Stripe Refund */}
      {selectedBookingForRefund && (
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
      )}
    </div>
  );
};
