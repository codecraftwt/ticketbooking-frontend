import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Ticket, Search, ShieldCheck, Heart, Sparkles, UserCheck } from 'lucide-react';

export const GuestLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white font-['Plus_Jakarta_Sans']">
      {/* Top Notification Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100 px-4 py-2 text-xs text-center font-medium text-indigo-900 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Instant Seat Booking & Real-Time Availability with Stripe Secured Checkout</span>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-slate-200 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 text-white transform -rotate-12 group-hover:rotate-0 transition-transform" />
            </div>
            <div>
              <span className="text-xl font-bold font-['Outfit'] tracking-tight text-slate-900 block leading-tight">
                TicketCraft
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-bold text-indigo-600">
                Live Events & Cinema
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
            <Link
              to="/"
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                location.pathname === '/' || location.pathname === '/events'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Browse Events
            </Link>
            <Link
              to="/booking/lookup"
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                location.pathname === '/booking/lookup'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Find My Ticket
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/booking/lookup"
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
              title="Lookup Ticket"
            >
              <Search className="w-4 h-4" />
            </Link>
            <Link
              to="/admin/dashboard"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 text-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 font-['Outfit']">TicketCraft</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The premier real-time ticket booking platform for IMAX cinemas, stadium concerts, comedy showcases, and theatrical plays.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-['Outfit']">
                Experience
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Movies & IMAX</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Live Concerts</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Theatre & Plays</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Standup Comedy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-['Outfit']">
                Features
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stripe 3DS Security</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-600">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Real-Time Seat Hold</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-600">
                  <Ticket className="w-3.5 h-3.5 text-purple-600" />
                  <span>Zero-Login Checkout</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-['Outfit']">
                Administration
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Manage auditorium layouts, event catalog, and issue refunds directly.
              </p>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                Sign In to Admin
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© 2026 TicketCraft Platform. All rights reserved.</p>
            <p className="flex items-center gap-1 text-slate-500">
              Built with precision for performance, security, and elegance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
