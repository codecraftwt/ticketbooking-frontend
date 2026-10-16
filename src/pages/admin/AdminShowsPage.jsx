import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Building2,
  Ticket,
  Loader2,
  X,
  AlertTriangle,
  Ban,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clashError, setClashError] = useState('');

  // Schedule Form State
  const [form, setForm] = useState({
    eventId: '',
    venueId: '',
    hallId: '',
    date: '',
    startTime: '19:30',
    durationMinutes: 150,
    vipPrice: 40,
    premiumPrice: 28,
    standardPrice: 20,
    reclinerPrice: 50,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [showsRes, eventsRes, venuesRes] = await Promise.all([
        api.get('/admin/shows'),
        api.get('/admin/events'),
        api.get('/admin/venues'),
      ]);

      if (showsRes.data.success) setShows(showsRes.data.data);
      if (eventsRes.data.success) setEvents(eventsRes.data.data);
      if (venuesRes.data.success) setVenues(venuesRes.data.data);
    } catch (err) {
      toast.error('Failed to load shows data.');
    } finally {
      setLoading(false);
    }
  };

  const selectedVenue = venues.find((v) => v._id === form.venueId);

  const handleScheduleShow = async (e) => {
    e.preventDefault();
    setClashError('');

    if (!form.eventId || !form.venueId || !form.hallId || !form.date || !form.startTime) {
      toast.error('Please complete all scheduling fields.');
      return;
    }

    // Combine date and time
    const startIso = new Date(`${form.date}T${form.startTime}:00`).toISOString();
    const duration = parseInt(form.durationMinutes) || 120;
    const endIso = new Date(new Date(startIso).getTime() + duration * 60000).toISOString();

    const pricing = [
      { tier: 'VIP', price: parseFloat(form.vipPrice) || 40 },
      { tier: 'Premium', price: parseFloat(form.premiumPrice) || 28 },
      { tier: 'Standard', price: parseFloat(form.standardPrice) || 20 },
      { tier: 'Recliner', price: parseFloat(form.reclinerPrice) || 50 },
    ];

    setSubmitting(true);
    try {
      const res = await api.post('/admin/shows', {
        eventId: form.eventId,
        venueId: form.venueId,
        hallId: form.hallId,
        startTime: startIso,
        endTime: endIso,
        pricing,
      });

      if (res.data.success) {
        toast.success('Showtime scheduled successfully!');
        setIsModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setClashError(err.response.data.message || 'Auditorium collision conflict detected.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to schedule show.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelShow = async (showId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled show?')) return;

    try {
      const res = await api.delete(`/admin/shows/${showId}`);
      if (res.data.success) {
        toast.success('Showtime cancelled.');
        fetchInitialData();
      }
    } catch (err) {
      toast.error('Failed to cancel showtime.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Show Schedules & Collisions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Collision-detection scheduling engine across all multi-hall venues.
          </p>
        </div>
        <button
          onClick={() => {
            setClashError('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Showtime</span>
        </button>
      </div>

      {/* Shows List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500">Loading scheduled shows...</p>
        </div>
      ) : shows.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800">No Shows Scheduled</h3>
            <p className="text-xs text-slate-500 mt-1">Schedule your first showtime to make tickets available for booking.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Schedule Show
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-4">Event</th>
                  <th className="py-3.5">Venue & Auditorium</th>
                  <th className="py-3.5">Showtime</th>
                  <th className="py-3.5">Pricing Tiers</th>
                  <th className="py-3.5">Booked / Total</th>
                  <th className="py-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shows.map((s) => {
                  const startDate = new Date(s.startTime);
                  const endDate = new Date(s.endTime);
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 pl-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.eventId?.posterImage || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800'}
                            alt=""
                            className="w-8 h-10 object-cover rounded-md flex-shrink-0 bg-slate-100 border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{s.eventId?.title || 'Event'}</p>
                            <span className="text-[10px] text-slate-500">{s.eventId?.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-700">
                        <p className="font-semibold text-slate-900">{s.venueId?.name}</p>
                        <p className="text-[11px] text-indigo-600 font-medium">
                          {s.hallId?.name} ({s.hallId?.screenType})
                        </p>
                      </td>
                      <td className="py-3.5 text-slate-700">
                        <p className="font-semibold text-slate-900">
                          {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-1 text-[11px]">
                          {s.pricing?.map((p) => (
                            <span
                              key={p.tier}
                              className={`px-1.5 py-0.5 rounded font-mono font-medium ${
                                p.tier === 'VIP'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : p.tier === 'Premium'
                                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {p.tier}: ${p.price}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 font-mono font-medium text-slate-800">
                        {s.bookedSeatsCount || 0} / {s.totalSeats || 0}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        {s.status === 'Cancelled' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Cancelled
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCancelShow(s._id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Schedule Show */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Schedule Showtime</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {clashError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{clashError}</span>
              </div>
            )}

            <form onSubmit={handleScheduleShow} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Production / Event *</label>
                <select
                  value={form.eventId}
                  onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select an Event...</option>
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.title} ({e.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue Complex *</label>
                  <select
                    value={form.venueId}
                    onChange={(e) => setForm({ ...form, venueId: e.target.value, hallId: '' })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="">Select Venue...</option>
                    {venues.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name} ({v.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Auditorium / Screen *</label>
                  <select
                    value={form.hallId}
                    onChange={(e) => setForm({ ...form, hallId: e.target.value })}
                    required
                    disabled={!selectedVenue}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 disabled:opacity-50"
                  >
                    <option value="">Select Screen...</option>
                    {selectedVenue?.halls?.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.screenType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 120 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Tier Pricing Breakdown ($ USD)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="block text-[10px] text-amber-700 font-bold mb-0.5">VIP Tier</span>
                    <input
                      type="number"
                      value={form.vipPrice}
                      onChange={(e) => setForm({ ...form, vipPrice: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-purple-700 font-bold mb-0.5">Premium</span>
                    <input
                      type="number"
                      value={form.premiumPrice}
                      onChange={(e) => setForm({ ...form, premiumPrice: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-blue-700 font-bold mb-0.5">Standard</span>
                    <input
                      type="number"
                      value={form.standardPrice}
                      onChange={(e) => setForm({ ...form, standardPrice: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-700 font-bold mb-0.5">Recliner</span>
                    <input
                      type="number"
                      value={form.reclinerPrice}
                      onChange={(e) => setForm({ ...form, reclinerPrice: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Verify Collision & Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
