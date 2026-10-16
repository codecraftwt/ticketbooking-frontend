import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  Sparkles,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Star,
  Film,
  Music,
  Smile,
  Trophy,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { label: 'All Events', value: 'All', icon: Sparkles },
    { label: 'IMAX & Cinema', value: 'Movie', icon: Film },
    { label: 'Live Concerts', value: 'Concert', icon: Music },
    { label: 'Standup Comedy', value: 'Standup Comedy', icon: Smile },
    { label: 'Sports Screenings', value: 'Sports', icon: Trophy },
  ];

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, searchQuery]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/events', { params });
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Visual Seating • Zero Account Required</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-['Outfit'] tracking-tight text-slate-900 leading-tight">
            Reserve Seats In Seconds.{' '}
            <span className="text-indigo-600">
              Guaranteed by Stripe.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Pick your exact seats on interactive auditorium maps with instant 5-minute reservation holds, verified card checkout, and verifiable digital tickets.
          </p>

          {/* Search Bar */}
          <div className="pt-3 max-w-xl mx-auto">
            <div className="relative flex items-center bg-white border border-slate-300 rounded-2xl shadow-sm p-1.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Search className="w-5 h-5 ml-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, concert tours, comedians or venues..."
                className="w-full px-3 py-2 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex-shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-['Outfit'] text-slate-900">Upcoming Experiences</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore featured shows with real-time seat inventory</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {events.length} {events.length === 1 ? 'Event' : 'Events'} available
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500">Loading live shows...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-sm font-semibold text-slate-800">No events found matching your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing search filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="group rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md overflow-hidden flex flex-col transition-all duration-200"
              >
                {/* Poster Image */}
                <Link to={`/events/${evt.slug}`} className="h-60 relative overflow-hidden bg-slate-100 block">
                  <img
                    src={evt.poster}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 shadow-xs">
                      {evt.category}
                    </span>
                  </div>

                  {/* Rating Pill */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{evt.rating || '4.9'}</span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
                      From ${evt.price}
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <Link to={`/events/${evt.slug}`}>
                      <h3 className="font-bold text-base text-slate-900 font-['Outfit'] group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {evt.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate font-medium">{evt.venue}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.date} • {evt.time}</span>
                      </div>
                      <div className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {evt.availableSeatsCount} seats left
                      </div>
                    </div>
                  </div>

                  {/* Booking Action */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      to={`/events/${evt.slug}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>Showtimes</span>
                    </Link>
                    <Link
                      to={evt.nextShowId ? `/shows/${evt.nextShowId}/seats` : `/events/${evt.slug}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Book Seats</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
