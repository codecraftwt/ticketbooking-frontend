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
  Building2,
  Info,
  Mail,
  Phone,
  ExternalLink,
  Lightbulb,
  Check,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

const getCleanPosterUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';
  if (url.includes('4027e8f7-32d5-4bbb-abe0-0485f7e5bcd1') && !url.includes('c_crop')) {
    return 'https://res.cloudinary.com/hxn9dbuhd/image/upload/c_crop,w_604,h_800,x_98,y_0/v1788614706/organizations/8/7/b/1/87b1bd06-30ef-40f7-a87a-d628cc954bde/4027e8f7-32d5-4bbb-abe0-0485f7e5bcd1.png';
  }
  return url;
};

export const EventDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShowId, setSelectedShowId] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-amber-200">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs text-amber-200/70 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-900/60 flex items-center justify-center mx-auto text-amber-400">
          <Ticket className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold font-['Outfit'] text-white">Event Not Found</h2>
        <p className="text-xs text-stone-300">
          The requested event could not be found or the link has expired.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fbc687] text-[#341602] font-bold text-xs hover:bg-[#fed7aa] transition-all shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Events</span>
        </Link>
      </div>
    );
  }

  const selectedShow = event.shows?.find((s) => s._id === selectedShowId) || event.shows?.[0];
  const startDate = selectedShow?.startTime ? new Date(selectedShow.startTime) : new Date();

  const monthShort = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayNum = startDate.getDate();
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const venueName = selectedShow?.venueId?.name || event.venue || 'Main Auditorium Hall';
  const venueLocation = selectedShow?.venueId?.city
    ? `${selectedShow.venueId.city}, ${selectedShow.venueId.state || 'TX'}`
    : 'Auditorium Arena';

  const minPrice = selectedShow?.pricing?.length
    ? Math.min(...selectedShow.pricing.map((p) => p.price))
    : event.price || 10;

  return (
    <div className="w-full text-stone-100 font-['Plus_Jakarta_Sans'] py-6 sm:py-8">
      {/* Proportionally balanced container (max-w-5xl matches Zeffy reference) */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 space-y-5">
        
        {/* Top Minimal Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200/80 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-amber-400" />
            <span>All Events</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success('Event link copied to clipboard');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-amber-200 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Main 2-Column Layout with proper proportions */}
        <div className="flex flex-col lg:flex-row gap-7 lg:gap-9 items-start">
          
          {/* ================= LEFT COLUMN (Compact & Balanced Poster) ================= */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-4">
            
            {/* Event Poster Card - perfectly fitted edge-to-edge */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-amber-900/40 w-full max-w-[320px] mx-auto lg:mx-0">
              <img
                src={getCleanPosterUrl(event.posterImage)}
                alt={event.title}
                className="w-full h-auto object-cover block"
              />
              
              {/* Category Badge overlay */}
              {event.category && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/30">
                    {event.category}
                  </span>
                </div>
              )}
            </div>

            {/* Hosted By Row */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 border border-amber-400/40 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="leading-snug truncate">
                <span className="text-[10px] text-amber-200/70 block font-medium">Hosted by</span>
                <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-white hover:text-amber-300 transition-colors cursor-pointer truncate">
                  <span className="truncate">{venueName}</span>
                  <ExternalLink className="w-3 h-3 text-amber-400/80 shrink-0" />
                </div>
              </div>
            </div>

            {/* About this Event */}
            <div className="pt-3 border-t border-amber-900/40 space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-200/80 font-['Outfit']">
                About this event
              </h3>
              <p
                className={`text-xs text-stone-300 leading-relaxed ${
                  showFullDescription ? '' : 'line-clamp-4'
                }`}
              >
                {event.description ||
                  'Join us for an unforgettable live performance. Book your verified admission tickets directly with instant seating allocation.'}
              </p>
              {event.description && event.description.length > 160 && (
                <button
                  type="button"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer pt-0.5"
                >
                  <span>{showFullDescription ? 'Show less' : 'More details'}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Event Meta Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {event.genre && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/40 text-amber-200 text-[11px] font-semibold">
                  {event.genre}
                </span>
              )}
              {event.durationMinutes && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/40 text-amber-200 text-[11px] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{event.durationMinutes} mins</span>
                </span>
              )}
              {event.ageRating && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/40 text-amber-200 text-[11px] font-semibold">
                  Rated {event.ageRating}
                </span>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Proper, Sleek Proportions) ================= */}
          <div className="flex-1 min-w-0 space-y-4">
            
            {/* Event Title - Scaled properly */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Outfit'] text-white tracking-tight leading-snug">
                {event.title}
              </h1>
            </div>

            {/* Date & Location Info Blocks - Compact & refined */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Date Box with Compact Calendar Tile */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#321703]/80 border border-amber-900/40 shadow-xs">
                <div className="w-10 h-11 rounded-lg bg-[#522906] border border-amber-800/60 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  <span className="text-[9px] font-black uppercase text-amber-200 tracking-wider bg-amber-900/60 w-full text-center py-0.5">
                    {monthShort}
                  </span>
                  <span className="text-sm font-black text-white leading-tight py-0.5">
                    {dayNum}
                  </span>
                </div>
                <div className="leading-snug truncate">
                  <span className="font-bold text-xs sm:text-sm text-white block truncate">
                    {formattedDate}
                  </span>
                  <span className="text-[11px] text-stone-300 font-medium block truncate">
                    {formattedTime}
                  </span>
                </div>
              </div>

              {/* Location Box with Compact MapPin */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#321703]/80 border border-amber-900/40 shadow-xs">
                <div className="w-10 h-11 rounded-lg bg-[#522906] border border-amber-800/60 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="leading-snug truncate">
                  <span className="font-bold text-xs sm:text-sm text-white block truncate">
                    {venueName}
                  </span>
                  <span className="text-[11px] text-stone-300 font-medium block truncate">
                    {venueLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Showtime Picker (if multiple shows exist) */}
            {event.shows && event.shows.length > 1 && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-200/80 block">
                  Select Showtime:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {event.shows.map((show) => {
                    const sDate = new Date(show.startTime);
                    const isSelected = selectedShowId === show._id;
                    return (
                      <button
                        key={show._id}
                        type="button"
                        onClick={() => setSelectedShowId(show._id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#5a2e07] border-amber-400 ring-2 ring-amber-400/30 text-white'
                            : 'bg-[#321703]/60 border-amber-900/40 text-stone-300 hover:bg-[#401f05]'
                        }`}
                      >
                        <div className="truncate">
                          <span className="font-bold text-xs block text-white">
                            {sDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] text-amber-300 truncate block">
                            {sDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} •{' '}
                            {show.hallId?.name || 'Screen 1'}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Admission / Ticket Card (Sleek & Proportional) */}
            <div className="rounded-xl border border-amber-900/50 bg-[#351802]/90 backdrop-blur-md p-4 sm:p-5 shadow-lg flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {selectedShow?.hallId?.name
                    ? `${selectedShow.hallId.name} • General Admission`
                    : 'General Admission'}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                    ${minPrice}
                  </span>
                  <span className="text-xs text-stone-300 font-medium">/ seat</span>
                </div>
              </div>

              {/* Proper Sized Gold Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedShow?._id) {
                    navigate(`/shows/${selectedShow._id}/seats`);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-[#fbc687] hover:bg-[#fad3a2] active:bg-[#f6b76c] text-[#341602] font-black text-xs sm:text-sm tracking-wide shadow-md transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Add +</span>
              </button>
            </div>

            {/* Essential Event & Booking Info */}
            <div className="rounded-xl border border-amber-900/40 bg-[#321703]/70 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-900/30">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-200/90 font-['Outfit']">
                  Important Event Guidelines
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Box Office
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Ticket className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">Instant Digital Pass</span>
                    <span className="text-[10px] text-stone-400">Official admission voucher with fast mobile check-in</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">Gate Opening</span>
                    <span className="text-[10px] text-stone-400">Doors open 30 minutes before showtime</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">Auditorium Hall</span>
                    <span className="text-[10px] text-stone-400">
                      {selectedShow?.hallId?.name || 'Screen 1'} • {selectedShow?.hallId?.screenType || 'Air-Conditioned'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">Easy Cancellation</span>
                    <span className="text-[10px] text-stone-400">Refundable up to 4 hours before showtime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* "Did you know?" Trust Card (Compact) */}
            <div className="rounded-xl bg-[#492606]/80 border border-amber-800/40 p-3.5 flex items-start gap-3 text-xs text-stone-200">
              <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong className="text-white">Did you know?</strong> We guarantee 100% verified official tickets directly with the venue so you experience zero booking fees and instant seating reservation.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
