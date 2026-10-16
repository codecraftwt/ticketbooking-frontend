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
  Building2,
  Info,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button } from '../../components/ui';

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
        <p className="text-xs text-slate-500 font-medium">Loading experience details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
          <Film className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold font-['Outfit'] text-slate-900">Event Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested experience is either no longer showing or the link has expired.
        </p>
        <Link to="/" className="inline-block">
          <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
            Return to Discovery Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const selectedShow = event.shows?.find((s) => s._id === selectedShowId);

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Back Navigation */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Cinematic Hero Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 p-6 sm:p-10">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Event Poster with Glow */}
          <div className="w-48 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10 flex-shrink-0 bg-slate-800">
            <img
              src={event.posterImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Event Details Header */}
          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                {event.category || 'Concert'}
              </span>
              {event.genre && (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-300 border border-white/15">
                  {event.genre}
                </span>
              )}
              {event.durationMinutes && (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-300 border border-white/15 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{event.durationMinutes} mins</span>
                </span>
              )}
              {event.ageRating && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Rated {event.ageRating}
                </span>
              )}
            </div>

            <h1
              style={{ color: '#ffffff' }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Outfit'] tracking-tight text-white leading-tight drop-shadow-sm"
            >
              {event.title}
            </h1>

            {/* Quick Location & Venue */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-200 pt-1">
              {event.shows?.[0]?.venueId?.name && (
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>{event.shows[0].venueId.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Verified Tickets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Venue Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Event */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold font-['Outfit'] text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              <span>About the Event</span>
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2">
              {event.description}
            </div>
          </div>

          {/* Venue & Organizer Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Outfit'] text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Venue & Location Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium block">Auditorium / Venue</span>
                <span className="font-bold text-slate-900 text-sm">
                  {event.shows?.[0]?.venueId?.name || 'Main Event Hall'}
                </span>
                {event.shows?.[0]?.venueId?.city && (
                  <span className="text-slate-500 block">
                    {event.shows[0].venueId.city}, {event.shows[0].venueId.state}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium block">Hall & Projection</span>
                <span className="font-bold text-slate-900 text-sm">
                  {event.shows?.[0]?.hallId?.name || 'Screen 1'}
                </span>
                <span className="text-indigo-600 font-semibold block">
                  {event.shows?.[0]?.hallId?.screenType || 'Standard Digital'}
                </span>
              </div>
            </div>

            {/* Organizer Contact Row */}
            {(event.contactEmail || event.contactPhone) && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="font-medium text-slate-400">Organizer:</span>
                {event.contactEmail && (
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{event.contactEmail}</span>
                  </a>
                )}
                {event.contactPhone && (
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{event.contactPhone}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Clean Guarantee Note */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3 text-xs text-emerald-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Guaranteed Admission:</strong> Official digital tickets with instant seat hold. Free cancellation available up to 4 hours before showtime.
            </span>
          </div>
        </div>

        {/* Right Column: Showtime Selector & Booking CTA */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 font-['Outfit']">
                Available Showtimes
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {event.shows?.length || 0} Scheduled
              </span>
            </div>

            {event.shows?.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-slate-500 italic">
                  No showtimes currently scheduled. Please check back soon!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
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
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-slate-900">
                          {startDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          From ${minPrice}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-indigo-700">
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>{show.hallId?.name || 'Screen 1'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 font-semibold text-[10px] border border-slate-200">
                          {show.hallId?.screenType || 'Standard'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Select Seats CTA Button */}
            {selectedShow && (
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-600/20 cursor-pointer"
                onClick={() => navigate(`/shows/${selectedShow._id}/seats`)}
                leftIcon={Ticket}
                rightIcon={ChevronRight}
              >
                Select Seats on Map
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
