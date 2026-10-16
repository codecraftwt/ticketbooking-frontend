import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  Ticket,
  Calendar,
  MapPin,
  Star,
  Film,
  Loader2,
} from 'lucide-react';

export const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [searchQuery]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
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
    <div className="space-y-12 pb-24">
      {/* Hero Section with Rich Colored Background */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white pt-16 pb-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/60 shadow-md">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h1
            style={{ color: '#ffffff' }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-['Outfit'] tracking-tight text-white leading-tight lg:whitespace-nowrap drop-shadow-sm"
          >
            Find Your Next Great Experience.{' '}
            <span className="text-indigo-400">
              Live & In Person.
            </span>
          </h1>

          {/* Search Bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white border border-white/20 rounded-2xl shadow-xl p-2 focus-within:ring-4 focus-within:ring-indigo-500/30 transition-all">
              <Search className="w-5 h-5 ml-3 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event title, artist, venue, or genre..."
                className="w-full px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition-all flex-shrink-0 cursor-pointer"
              >
                Explore
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Listing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              Featured Events
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Real-time seat availability updated live
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {events.length} {events.length === 1 ? 'Event Available' : 'Events Available'}
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500 font-medium">Loading live experiences...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
              <Film className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">No events match your search</h3>
            <p className="text-xs text-slate-500">Try switching categories or clearing your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col"
              >
                {/* Poster Image with Vibrant Overlays */}
                <Link to={`/events/${evt.slug}`} className="relative h-72 overflow-hidden bg-slate-100 block">
                  <img
                    src={evt.poster}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md text-indigo-700 shadow-sm border border-indigo-100">
                      {evt.category}
                    </span>
                  </div>

                  {/* Rating Pill */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{evt.rating || '4.9'}</span>
                  </div>

                  {/* Price Tag Over Image Bottom */}
                  <div className="absolute bottom-3.5 right-3.5">
                    <span className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold font-mono shadow-md">
                      From ${evt.price}
                    </span>
                  </div>
                </Link>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <Link to={`/events/${evt.slug}`}>
                      <h3 className="font-extrabold text-lg text-slate-900 font-['Outfit'] group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {evt.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                      <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.date}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {evt.availableSeatsCount} seats available
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 pt-2">
                    <Link
                      to={`/events/${evt.slug}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold text-center transition-colors"
                    >
                      Event Details
                    </Link>
                    <Link
                      to={evt.nextShowId ? `/shows/${evt.nextShowId}/seats` : `/events/${evt.slug}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
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
