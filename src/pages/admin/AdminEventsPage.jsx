import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Film,
  Plus,
  Clock,
  Tag,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'Movie',
    genre: '',
    durationMinutes: 120,
    ageRating: 'UA',
    posterImage: '',
    bannerImage: '',
    description: '',
    status: 'Published',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error('Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/events', form);
      if (res.data.success) {
        toast.success(`Event "${form.title}" published!`);
        setIsModalOpen(false);
        setForm({
          title: '',
          slug: '',
          category: 'Movie',
          genre: '',
          durationMinutes: 120,
          ageRating: 'UA',
          posterImage: '',
          bannerImage: '',
          description: '',
          status: 'Published',
        });
        fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;

    try {
      const res = await api.delete(`/admin/events/${id}`);
      if (res.data.success) {
        toast.success('Event deleted.');
        setEvents(events.filter((e) => e._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete event.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Events Catalog & Productions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage movie screenings, theatre tours, and live stage events.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Event</span>
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500">Loading catalog from MongoDB Atlas...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <Film className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800">No Events Published</h3>
            <p className="text-xs text-slate-500 mt-1">Create your first movie or show to begin scheduling showtimes.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Publish Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((evt) => (
            <div
              key={evt._id}
              className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden flex flex-col group hover:border-slate-300 transition-all shadow-xs"
            >
              <div className="h-64 relative overflow-hidden bg-slate-100">
                <img
                  src={evt.posterImage || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 shadow-xs">
                    {evt.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeleteEvent(evt._id, evt.title)}
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 backdrop-blur-md">
                    {evt.status}
                  </span>
                  <span className="text-[11px] font-semibold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-md">
                    Rated {evt.ageRating}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{evt.title}</h3>
                  <p className="text-xs text-slate-500">{evt.genre}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.durationMinutes} mins</span>
                    </div>
                    <span className="font-semibold text-indigo-600">
                      {evt.showsCount || 0} Shows
                    </span>
                  </div>

                  <Link
                    to={`/events/${evt.slug}`}
                    target="_blank"
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span>View Public Page</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Publish Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Publish New Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Gladiator II: IMAX Special Screening"
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Movie">Movie</option>
                    <option value="Concert">Concert</option>
                    <option value="Theatre">Theatre</option>
                    <option value="Comedy">Standup Comedy</option>
                    <option value="Sports">Sports Screening</option>
                    <option value="Function">Function</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Genre</label>
                  <input
                    type="text"
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    placeholder="e.g. Action / Adventure"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 120 })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age Rating</label>
                  <select
                    value={form.ageRating}
                    onChange={(e) => setForm({ ...form, ageRating: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="G">G - General</option>
                    <option value="PG">PG - Parental Guidance</option>
                    <option value="PG-13">PG-13</option>
                    <option value="UA">UA</option>
                    <option value="A">A - Adults Only</option>
                    <option value="R">R - Restricted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custom Slug (Optional)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. gladiator-ii-imax (auto-generated if empty)"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Poster Image URL</label>
                <input
                  type="text"
                  value={form.posterImage}
                  onChange={(e) => setForm({ ...form, posterImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed synopsis or event highlight..."
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none"
                />
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
                  <span>Publish Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
