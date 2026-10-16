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
    <div className="space-y-8 pb-20">
      {/* Top Breadcrumb & Hero Header Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Events</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-8">
            {/* Cinematic Poster */}
            <div className="w-40 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex-shrink-0 bg-slate-100 relative group">
              <img
                src={event.posterImage}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Event Meta Details */}
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{event.category || 'Feature'}</Badge>
                <Badge variant="secondary">Rated {event.ageRating || 'PG-13'}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.durationMinutes} mins</span>
                </Badge>
                {event.featured && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Featured Premiere</span>
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
                {event.title}
              </h1>

              <p className="text-sm text-slate-600 font-medium">
                {event.genre}
              </p>

              {/* Quick Spec Highlights */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Now Booking Sessions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified 100% Refund Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Synopsis & Policies (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synopsis */}
          <Card className="p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold font-['Outfit'] text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              <span>About the Experience</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </Card>

          {/* Cancellation Policy Banner */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-emerald-900 block text-sm">Official Ticket Protection Guarantee</span>
              <p className="text-emerald-700 leading-relaxed">
                {event.cancellationPolicy ||
                  'Free cancellation up to 4 hours before showtime. 100% refund processed back automatically through Stripe directly to your payment method.'}
              </p>
            </div>
          </div>

          {/* Organizer Contact Info */}
          {(event.contactEmail || event.contactPhone) && (
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                Event Organizer Contact Info
              </h3>
              <div className="flex flex-wrap gap-4 text-xs">
                {event.contactEmail && (
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{event.contactEmail}</span>
                  </a>
                )}
                {event.contactPhone && (
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{event.contactPhone}</span>
                  </a>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Showtime Selection & Booking CTA (1 col) */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 font-['Outfit']">Available Showtimes</h3>
              <Badge variant="outline" className="font-semibold text-indigo-700 bg-indigo-50/50">
                {event.shows?.length || 0} Scheduled
              </Badge>
            </div>

            {event.shows?.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-slate-500 italic">
                  No active showtimes currently scheduled for this production. Please check back soon!
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
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/10 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">
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
                          <span className="font-semibold text-slate-900">
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>{show.hallId?.name || 'Screen 1'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
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
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-between"
                onClick={() => navigate(`/shows/${selectedShow._id}/seats`)}
                leftIcon={Ticket}
                rightIcon={ChevronRight}
              >
                Select Seats on Map
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
