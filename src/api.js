const API_BASE = '/api';

export async function checkServerHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchEvents(category = 'All', search = '') {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/events${query}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  const json = await res.json();
  return json.data;
}

export async function fetchEventDetails(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) throw new Error('Failed to fetch event details');
  const json = await res.json();
  return json.data;
}

export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Booking failed');
  }
  return json;
}

export async function fetchBookings() {
  const res = await fetch(`${API_BASE}/bookings`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  const json = await res.json();
  return json.data;
}
