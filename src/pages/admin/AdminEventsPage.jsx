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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, PageHeader } from '../../components/ui';

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
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        badge="Live Catalog Production"
        badgeVariant="primary"
        title="Events Catalog & Productions"
        description="Manage movie screenings, theatre tours, and live stage events."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Publish New Event
          </Button>
        }
      />

      {/* Events Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 font-medium">Loading catalog from MongoDB Atlas...</p>
        </div>
      ) : events.length === 0 ? (
        <Card className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto text-pink-600 shadow-2xs">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">No Events Published</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first movie or show to begin scheduling showtimes.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Publish First Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((evt) => (
            <Card
              key={evt._id}
              className="overflow-hidden flex flex-col group hover:border-slate-300 transition-all hover:shadow-md"
            >
              <div className="h-72 relative overflow-hidden bg-slate-100">
                <img
                  src={evt.posterImage || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <Badge variant="neutral" className="bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-xs">
                    {evt.category}
                  </Badge>
                </div>
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeleteEvent(evt._id, evt.title)}
                    className="p-2 rounded-xl bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between">
                  <Badge variant="success" className="shadow-xs backdrop-blur-md">
                    {evt.status}
                  </Badge>
                  <span className="text-[11px] font-bold text-white bg-black/60 px-2.5 py-0.5 rounded-lg backdrop-blur-md">
                    Rated {evt.ageRating}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-base font-['Outfit'] line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{evt.genre}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{evt.durationMinutes} mins</span>
                    </div>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {evt.showsCount || 0} Shows
                    </span>
                  </div>

                  <Link
                    to={`/events/${evt.slug}`}
                    target="_blank"
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Public Page</span>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Publish Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
                  <Film className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Publish New Event</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Gladiator II: IMAX Special Screening"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
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
                  <label className="block font-bold text-slate-700 mb-1">Genre</label>
                  <input
                    type="text"
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    placeholder="e.g. Action / Adventure"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 120 })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age Rating</label>
                  <select
                    value={form.ageRating}
                    onChange={(e) => setForm({ ...form, ageRating: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
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
                <label className="block font-bold text-slate-700 mb-1">Custom Slug (Optional)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. gladiator-ii-imax (auto-generated if empty)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Poster Image URL</label>
                <input
                  type="text"
                  value={form.posterImage}
                  onChange={(e) => setForm({ ...form, posterImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed synopsis or event highlight..."
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  loading={submitting}
                >
                  Publish Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
