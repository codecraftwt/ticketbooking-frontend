import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  Ticket,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Tv,
  Film,
} from 'lucide-react';
import { toast } from 'sonner';

export const EventDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShowId, setSelectedShowId] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${slug}`);
      if (res.data.success && res.data.data) {
        setEvent(res.data.data);
        if (res.data.data.shows?.length > 0) {
          setSelectedShowId(res.data.data.shows[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500">Loading experience details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-800">Event Not Found</p>
        <Link to="/" className="text-xs text-indigo-600 font-semibold hover:underline">
          Return to Events Catalog
        </Link>
      </div>
    );
  }

  const selectedShow = event.shows?.find((s) => s._id === selectedShowId);

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Header Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Poster Card */}
            <div className="w-36 sm:w-52 rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex-shrink-0 bg-slate-100">
              <img
                src={event.posterImage}
                alt={event.title}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {event.category}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Rated {event.ageRating}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.durationMinutes} mins</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
                {event.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {event.genre}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Synopsis & Policies (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synopsis */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold font-['Outfit'] text-slate-900">About the Event</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Cancellation Policy */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-emerald-900 block">Booking & Cancellation Policy</span>
              <span className="text-emerald-700 leading-relaxed">
                {event.cancellationPolicy || 'Free cancellation up to 4 hours before showtime. 100% refund processed back through Stripe.'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Showtime Selection & Booking CTA (1 col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 font-['Outfit']">Available Showtimes</h3>
              <span className="text-xs font-semibold text-indigo-600">
                {event.shows?.length || 0} Scheduled
              </span>
            </div>

            {event.shows?.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No active showtimes currently scheduled for this production. Please check back soon!
              </p>
            ) : (
              <div className="space-y-2.5">
                {event.shows?.map((show) => {
                  const startDate = new Date(show.startTime);
                  const isSelected = selectedShowId === show._id;
                  const minPrice = show.pricing?.length
                    ? Math.min(...show.pricing.map((p) => p.price))
                    : 20;

                  return (
                    <div
                      key={show._id}
                      onClick={() => setSelectedShowId(show._id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          From ${minPrice}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>{show.hallId?.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                          {show.hallId?.screenType || 'Standard'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Select Seats CTA */}
            {selectedShow && (
              <Link
                to={`/shows/${selectedShow._id}/seats`}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Select Seats on Interactive Map</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
