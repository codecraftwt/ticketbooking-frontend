import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Ticket,
  Search,
  X,
} from 'lucide-react';

export const GuestLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);

  useEffect(() => {
    setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (location.pathname === '/' || location.pathname === '/events') {
      if (val.trim()) {
        setSearchParams({ search: val.trim() });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (location.pathname === '/' || location.pathname === '/events') {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#381a02] text-stone-100 selection:bg-amber-600 selection:text-white font-['Plus_Jakarta_Sans']">
      {/* Main Header (BookMyShow layout: Logo | Search Bar | Sign In) */}
      <header className="sticky top-0 z-40 bg-[#2b1402]/95 backdrop-blur-md border-b border-amber-900/40 text-white transition-all shadow-sm">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 sm:gap-8">
          
          {/* 1. Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-[#fbc687] flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <Ticket className="w-5 h-5 text-[#341602] transform -rotate-12 group-hover:rotate-0 transition-transform" />
            </div>
            <div>
              <span className="text-xl font-black font-['Outfit'] tracking-tight block leading-tight text-white">
                TicketCraft
              </span>
              <span className="block text-[9px] uppercase tracking-widest font-extrabold text-amber-300">
                Official Box Office
              </span>
            </div>
          </Link>

          {/* 2. Middle: Search Bar (BookMyShow Style) */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center bg-[#210d01] border border-amber-900/60 rounded-xl focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <Search className="w-4 h-4 ml-3.5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for Movies, Events, Plays, Sports and Activities"
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-white placeholder-stone-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-1 mr-2 text-stone-400 hover:text-white rounded-md cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* 3. Right: Clean Sign In Button */}
          <div className="shrink-0 flex items-center">
            <Link
              to="/admin/login"
              className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-[#fbc687] hover:bg-[#fad3a2] active:bg-[#f6b76c] text-[#341602] transition-all shadow-md hover:scale-[1.02] cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Clean Standard Website Footer */}
      <footer className="mt-20 border-t border-amber-900/40 bg-[#240f01] text-stone-300 text-sm">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand & Bio */}
            <div className="space-y-3">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fbc687] flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-[#341602]" />
                </div>
                <span className="text-lg font-bold text-white font-['Outfit']">
                  TicketCraft
                </span>
              </Link>
              <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
                Official ticket booking platform for auditorium performances, concerts, theatrical plays, and cinema screenings.
              </p>
            </div>

            {/* Column 2: Experiences */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200/90 font-['Outfit']">
                Experiences
              </h4>
              <ul className="space-y-3.5 text-xs sm:text-sm text-stone-400">
                <li>
                  <Link to="/" className="block hover:text-amber-300 transition-colors">
                    Theatrical Plays & Dramas
                  </Link>
                </li>
                <li>
                  <Link to="/" className="block hover:text-amber-300 transition-colors">
                    Live Concerts & Tours
                  </Link>
                </li>
                <li>
                  <Link to="/" className="block hover:text-amber-300 transition-colors">
                    Cinema & Screenings
                  </Link>
                </li>
                <li>
                  <Link to="/" className="block hover:text-amber-300 transition-colors">
                    Standup Comedy Nights
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Help & Support */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200/90 font-['Outfit']">
                Help & Support
              </h4>
              <ul className="space-y-3.5 text-xs sm:text-sm text-stone-400">
                <li>
                  <Link to="/booking/lookup" className="block hover:text-amber-300 transition-colors">
                    Find My Ticket
                  </Link>
                </li>
                <li>
                  <Link to="/booking/lookup" className="block hover:text-amber-300 transition-colors">
                    Re-print Ticket Pass
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@ticketcraft.com" className="block hover:text-amber-300 transition-colors">
                    Customer Support
                  </a>
                </li>
                <li>
                  <Link to="/" className="block hover:text-amber-300 transition-colors">
                    Cancellation & Refunds
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Organizers */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200/90 font-['Outfit']">
                Organizers
              </h4>
              <ul className="space-y-3.5 text-xs sm:text-sm text-stone-400">
                <li>
                  <Link to="/admin/login" className="block hover:text-amber-300 transition-colors">
                    Organizer Portal
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="block hover:text-amber-300 transition-colors">
                    List Your Event
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="block hover:text-amber-300 transition-colors">
                    Auditorium Seat Designer
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="block hover:text-amber-300 transition-colors">
                    Ticket Verification Scanner
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-8 mt-10 border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
            <p>
              © 2026 <span className="font-semibold text-stone-300">TicketCraft</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-stone-400">
              <Link to="/" className="hover:text-stone-200 transition-colors">Privacy Policy</Link>
              <Link to="/" className="hover:text-stone-200 transition-colors">Terms of Service</Link>
              <Link to="/" className="hover:text-stone-200 transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
