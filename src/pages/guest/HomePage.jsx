import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  Ticket,
  Calendar,
  MapPin,
  Film,
  Loader2,
  Clock,
  Sparkles,
  Theater,
  Music,
  Mic,
} from 'lucide-react';

export const HomePage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

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

  const categories = [
    { label: 'All Experiences', value: 'All' },
    { label: 'Plays & Theatre', value: 'Theatre', icon: Theater },
    { label: 'Live Concerts', value: 'Concert', icon: Music },
    { label: 'Cinema & Movies', value: 'Cinema', icon: Film },
    { label: 'Comedy Nights', value: 'Comedy', icon: Mic },
  ];

  return (
    <div className="w-full text-stone-100 font-['Plus_Jakarta_Sans'] pt-6 pb-24">
      {/* Container with decreased side padding (max-w-[1440px]) */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Category Filter Pills (BookMyShow Style Sub-Nav) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none border-b border-amber-900/30">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#fbc687] text-[#341602] shadow-md'
                    : 'bg-[#2b1402] text-stone-300 hover:text-white hover:bg-[#3d1d03] border border-amber-900/40'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Heading & Counter */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Recommended Events & Live Shows'}
            </h1>
            <p className="text-xs text-stone-400 mt-1 font-medium">
              Real-time verified seat availability updated live
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2b1402] text-amber-300 border border-amber-900/50">
            {events.length} {events.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-xs text-stone-400 font-medium">Loading live experiences...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-[#2b1402]/90 rounded-2xl border border-amber-900/40 p-8 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-900/60 flex items-center justify-center mx-auto text-amber-400">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit']">No events found</h3>
            <p className="text-xs text-stone-400">
              {searchQuery
                ? `No experiences matched "${searchQuery}". Try different keywords.`
                : 'No experiences scheduled in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="group bg-[#2a1302]/90 rounded-2xl border border-amber-900/50 overflow-hidden shadow-lg hover:border-amber-700/80 transition-all duration-200 flex flex-col"
              >
                {/* Poster Image */}
                <Link to={`/events/${evt.slug}`} className="relative h-68 overflow-hidden bg-black block">
                  <img
                    src={evt.poster}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a1302] via-transparent to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/30">
                      {evt.category || 'Event'}
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1 rounded-xl bg-[#fbc687] text-[#341602] text-xs font-black shadow-md">
                      From ${evt.price}
                    </span>
                  </div>
                </Link>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <Link to={`/events/${evt.slug}`}>
                      <h3 className="font-extrabold text-base sm:text-lg text-white font-['Outfit'] group-hover:text-amber-300 transition-colors line-clamp-1">
                        {evt.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Metadata Rows with Real Lucide Icons */}
                  <div className="space-y-2 pt-3 border-t border-amber-900/40 text-xs">
                    <div className="flex items-center gap-2 text-stone-300 font-medium truncate">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
                        <span>{evt.date}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                        {evt.availableSeatsCount} seats open
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons in Proper Shapes */}
                  <div className="flex gap-2.5 pt-2">
                    <Link
                      to={`/events/${evt.slug}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#391a03] hover:bg-[#482405] border border-amber-900/50 text-amber-200 text-xs font-bold text-center transition-colors"
                    >
                      Details
                    </Link>
                    <Link
                      to={evt.nextShowId ? `/shows/${evt.nextShowId}/seats` : `/events/${evt.slug}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#fbc687] hover:bg-[#fad3a2] text-[#341602] font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Select Seats</span>
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
