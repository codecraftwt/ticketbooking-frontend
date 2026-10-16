import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { GuestLayout } from './layouts/GuestLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { HomePage } from './pages/guest/HomePage';
import { EventDetailPage } from './pages/guest/EventDetailPage';
import { SeatSelectionPage } from './pages/guest/SeatSelectionPage';
import { CheckoutPage } from './pages/guest/CheckoutPage';
import { BookingConfirmationPage } from './pages/guest/BookingConfirmationPage';
import { BookingLookupPage } from './pages/guest/BookingLookupPage';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminVenuesPage } from './pages/admin/AdminVenuesPage';
import { AdminSeatDesignerPage } from './pages/admin/AdminSeatDesignerPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminShowsPage } from './pages/admin/AdminShowsPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors theme="light" closeButton />
      <BrowserRouter>
        <Routes>
          {/* Public Guest Routes */}
          <Route element={<GuestLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<HomePage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/shows/:id/seats" element={<SeatSelectionPage />} />
            <Route path="/checkout/:holdId" element={<CheckoutPage />} />
            <Route path="/booking/lookup" element={<BookingLookupPage />} />
            <Route path="/booking/confirmation/:reference" element={<BookingConfirmationPage />} />
          </Route>

          {/* Admin Login (Public) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="venues" element={<AdminVenuesPage />} />
            <Route path="halls/:id/layout" element={<AdminSeatDesignerPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="shows" element={<AdminShowsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
