import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Film,
  Ticket,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Venues & Halls', path: '/admin/venues', icon: Building2 },
    { label: 'Events Catalog', path: '/admin/events', icon: Film },
    { label: 'Show Schedules', path: '/admin/shows', icon: CalendarDays },
    { label: 'Bookings & Seats', path: '/admin/bookings', icon: Ticket },
    { label: 'Payments & Refunds', path: '/admin/payments', icon: CreditCard },
    { label: 'Revenue Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const renderNav = () => (
    <>
      {/* Brand */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-600/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 font-['Outfit'] block leading-tight">
              TicketCraft
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Admin Console
            </span>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Operations & Control
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Current Admin User Footnote */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/75 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs flex-shrink-0">
              {admin?.name ? admin.name[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {admin?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize font-medium">
                {admin?.role || 'superadmin'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans']">
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0 sticky top-0 h-screen z-30">
        {renderNav()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-xl">
            {renderNav()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold capitalize">
                {location.pathname.replace('/admin/', '').replace('/', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">View Public Site</span>
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
