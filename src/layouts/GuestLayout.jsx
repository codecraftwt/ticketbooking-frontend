import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Ticket, ShieldCheck, Sparkles, UserCheck, ArrowRight, Film, Music, Theater, Mic, Lock, Zap } from 'lucide-react';

export const GuestLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white font-['Plus_Jakarta_Sans']">
      {/* Main Header / Navigation - Exact same deep indigo background as hero */}
      <header className={`sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 ${location.pathname === '/' ? 'border-b border-indigo-900/20' : 'border-b border-indigo-900/50'} text-white transition-all shadow-xs`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
              <Ticket className="w-5 h-5 text-white transform -rotate-12 group-hover:rotate-0 transition-transform" />
            </div>
            <div>
              <span
                style={{ color: '#ffffff' }}
                className="text-2xl font-black font-['Outfit'] tracking-tight block leading-tight text-white"
              >
                TicketCraft
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                Live Experiences & Cinema
              </span>
            </div>
          </Link>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Live Indicator Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span>Real-Time Booking</span>
            </div>

            {/* Admin Portal Button - Clean Indigo */}
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.02] cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-white" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Clean, Normal Colored Footer */}
      <footer className="mt-20 border-t border-indigo-900/50 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-300 text-sm relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            {/* Column 1: Brand & Tagline */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span
                    style={{ color: '#ffffff' }}
                    className="text-xl font-black text-white font-['Outfit'] block leading-none"
                  >
                    TicketCraft
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                    Live Booking Engine
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The premier real-time ticket booking platform for IMAX cinemas, stadium concerts, comedy showcases, and theatrical plays.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-indigo-400" /> Instant Seat Locks
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Stripe Verified
                </span>
              </div>
            </div>

            {/* Column 2: Experiences */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <h4
                  style={{ color: '#ffffff' }}
                  className="text-xs font-extrabold uppercase tracking-widest text-white font-['Outfit']"
                >
                  Experiences
                </h4>
              </div>
              <ul className="space-y-3 text-xs font-medium">
                <li>
                  <Link to="/" className="text-slate-300 hover:text-indigo-300 transition-colors flex items-center gap-2 group">
                    <Film className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    <span>Movies & IMAX Shows</span>
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-slate-300 hover:text-indigo-300 transition-colors flex items-center gap-2 group">
                    <Music className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    <span>Live Concerts & Stadium Tours</span>
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-slate-300 hover:text-indigo-300 transition-colors flex items-center gap-2 group">
                    <Theater className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    <span>Theatre & Broadway Plays</span>
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-slate-300 hover:text-indigo-300 transition-colors flex items-center gap-2 group">
                    <Mic className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    <span>Standup Comedy Nights</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Trust & Security */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <h4
                  style={{ color: '#ffffff' }}
                  className="text-xs font-extrabold uppercase tracking-widest text-white font-['Outfit']"
                >
                  Trust & Security
                </h4>
              </div>
              <ul className="space-y-3 text-xs font-medium">
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">Stripe 3DS Payments</span>
                    <span className="text-slate-400 text-[11px]">Bank-grade 256-bit encryption</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">Atomic Seat Hold</span>
                    <span className="text-slate-400 text-[11px]">Guaranteed no double-bookings</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <Lock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">Zero-Login Checkout</span>
                    <span className="text-slate-400 text-[11px]">Fast guest email delivery</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 4: Admin Console */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <h4
                  style={{ color: '#ffffff' }}
                  className="text-xs font-extrabold uppercase tracking-widest text-white font-['Outfit']"
                >
                  Organizer Console
                </h4>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-900/60 shadow-lg">
                <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
                  Manage auditorium seat tiers, publish events, monitor live ticket transactions, and reconcile payouts.
                </p>
                <Link
                  to="/admin/login"
                  className="inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.02]"
                >
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p className="flex items-center gap-1.5">
              <span>© 2026</span>
              <span className="font-bold text-white">TicketCraft</span>
              <span>Platform. All rights reserved.</span>
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
