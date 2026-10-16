import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Film,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  Calendar,
  MapPin,
  Ticket,
  Loader2,
  X,
  Tv,
  CheckCircle2,
  Zap,
  Sliders,
  Eye,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button, PageHeader } from '../../components/ui';

export const AdminEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/events/${eventToDelete._id}`);
      if (res.data.success) {
        toast.success(`Event "${eventToDelete.title}" deleted successfully.`);
        setEvents((prev) => prev.filter((e) => e._id !== eventToDelete._id));
        if (selectedEvent?._id === eventToDelete._id) {
          setSelectedEvent(null);
        }
        setEventToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        badge="All Posted Events"
        badgeVariant="primary"
        title="Events & Productions"
        description="View all live events, click any event to inspect venue details & seat maps, or create a new event."
        actions={
          <Link to="/admin/events/new">
            <Button variant="primary" size="md" leftIcon={Plus}>
              Add Event
            </Button>
          </Link>
        }
      />

      {/* Events Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 font-medium">Loading events from MongoDB Atlas...</p>
        </div>
      ) : events.length === 0 ? (
        <Card className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">No Events Live Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Create your first event to provision its venue, auditorium seat map, and showtime in 1 simple step.
            </p>
          </div>
          <Link to="/admin/events/new">
            <Button variant="primary" size="lg" leftIcon={Plus}>
              Add First Event
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const venue = evt.primaryVenue;
            const hall = evt.primaryHall;
            const firstShow = evt.shows?.[0];
            const startDate = firstShow ? new Date(firstShow.startTime) : null;
            const minPrice = firstShow?.pricing?.length
              ? Math.min(...firstShow.pricing.map((p) => p.price))
              : 20;

            return (
              <Card
                key={evt._id}
                className="overflow-hidden flex flex-col group hover:border-slate-300 transition-all hover:shadow-md cursor-pointer"
                onClick={() => setSelectedEvent(evt)}
              >
                {/* Poster Header */}
                <div className="h-64 relative overflow-hidden bg-slate-100">
                  <img
                    src={
                      evt.posterImage ||
                      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  <div className="absolute top-3.5 left-3.5">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-xs">
                      {evt.category}
                    </Badge>
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-black/60 backdrop-blur-md">
                      Rated {evt.ageRating || 'PG-13'}
                    </span>
                  </div>

                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white">
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      <span>{evt.durationMinutes} mins</span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-emerald-500/90 text-white px-2 py-0.5 rounded-lg backdrop-blur-xs">
                      From ${minPrice}
                    </span>
                  </div>
                </div>

                {/* Event Summary Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-slate-900 text-base font-['Outfit'] group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{evt.genre}</p>

                    {venue && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {venue.name} {hall ? `• ${hall.name}` : ''}
                        </span>
                      </div>
                    )}

                    {startDate && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold pt-0.5">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
                        <span>
                          {startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      leftIcon={Eye}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(evt);
                      }}
                    >
                      View Details
                    </Button>

                    <Link
                      to={`/events/${evt.slug}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                      title="View on Public Store"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventToDelete(evt);
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Comprehensive Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-2xs">
                  <img
                    src={selectedEvent.posterImage || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{selectedEvent.category}</Badge>
                    <Badge variant="secondary">Rated {selectedEvent.ageRating || 'PG-13'}</Badge>
                  </div>
                  <h3 className="text-xl font-extrabold font-['Outfit'] text-slate-900 mt-1">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedEvent.genre} • {selectedEvent.durationMinutes} minutes
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Synopsis */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                About the Event
              </span>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {selectedEvent.description}
              </p>
            </div>

            {/* Venue & Auditorium Info */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Venue & Auditorium Details</span>
              </span>

              {selectedEvent.primaryVenue ? (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {selectedEvent.primaryVenue.name}
                    </h4>
                    <p className="text-slate-500 mt-0.5">
                      {selectedEvent.primaryVenue.address}, {selectedEvent.primaryVenue.city}
                    </p>
                    {selectedEvent.primaryHall && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-white">
                          {selectedEvent.primaryHall.name} ({selectedEvent.primaryHall.screenType})
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Seat Designer Launch Link */}
                  {selectedEvent.primaryHall && (
                    <Link
                      to={`/admin/halls/${selectedEvent.primaryHall._id}/layout`}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
                    >
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Customize Seat Map</span>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                  No venue linked yet.
                </p>
              )}
            </div>

            {/* Scheduled Showtimes */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Scheduled Showtimes & Pricing</span>
              </span>

              {selectedEvent.shows && selectedEvent.shows.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvent.shows.map((show) => {
                    const startDate = new Date(show.startTime);
                    const endDate = new Date(show.endTime);

                    return (
                      <div
                        key={show._id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {startDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {show.pricing?.map((p) => (
                            <span
                              key={p.tier}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono font-bold text-[11px]"
                            >
                              {p.tier}: ${p.price}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                  No upcoming showtimes scheduled.
                </p>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => setEventToDelete(selectedEvent)}
              >
                Delete Event
              </Button>

              <div className="flex items-center gap-2">
                <Link
                  to={`/events/${selectedEvent.slug}`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View on Public Store</span>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sleek In-App Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold font-['Outfit'] text-slate-900">
                Delete Event?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-slate-900">"{eventToDelete.title}"</span>?
                All scheduled showtimes, seat reservations, and holds will be removed.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="flex-1"
                disabled={deleting}
                onClick={() => setEventToDelete(null)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                size="md"
                className="flex-1"
                isLoading={deleting}
                disabled={deleting}
                leftIcon={Trash2}
                onClick={confirmDelete}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
