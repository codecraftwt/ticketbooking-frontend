import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  Plus,
  MapPin,
  Layers,
  LayoutGrid,
  Trash2,
  Edit2,
  X,
  Loader2,
  Tv,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminVenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [selectedVenueForHall, setSelectedVenueForHall] = useState(null);

  // Venue form state
  const [venueForm, setVenueForm] = useState({
    name: '',
    city: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    image: '',
  });

  // Hall form state
  const [hallForm, setHallForm] = useState({
    name: '',
    screenType: 'IMAX',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/venues');
      if (res.data.success) {
        setVenues(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load venues.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    if (!venueForm.name || !venueForm.city || !venueForm.address) {
      toast.error('Please enter name, city, and address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/venues', venueForm);
      if (res.data.success) {
        toast.success('Venue created successfully!');
        setIsVenueModalOpen(false);
        setVenueForm({ name: '', city: '', address: '', contactPhone: '', contactEmail: '', image: '' });
        fetchVenues();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create venue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateHall = async (e) => {
    e.preventDefault();
    if (!selectedVenueForHall || !hallForm.name) {
      toast.error('Please provide auditorium name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/admin/venues/${selectedVenueForHall._id}/halls`, {
        name: hallForm.name,
        screenType: hallForm.screenType,
        rows: 8,
        cols: 12,
      });

      if (res.data.success) {
        toast.success(`Auditorium "${hallForm.name}" created!`);
        setIsHallModalOpen(false);
        setHallForm({ name: '', screenType: 'IMAX' });
        fetchVenues();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add auditorium.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVenue = async (venueId, venueName) => {
    if (!window.confirm(`Are you sure you want to delete "${venueName}" and all associated halls?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/venues/${venueId}`);
      if (res.data.success) {
        toast.success('Venue deleted.');
        setVenues(venues.filter((v) => v._id !== venueId));
      }
    } catch (err) {
      toast.error('Failed to delete venue.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Venues & Hall Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create complexes, auditoriums, and open the interactive visual seat-map editor.
          </p>
        </div>
        <button
          onClick={() => setIsVenueModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Venue</span>
        </button>
      </div>

      {/* Loading & Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500">Loading registered venues and auditoriums...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800">No Venues Registered Yet</h3>
            <p className="text-xs text-slate-500 mt-1">Click "Add New Venue" to create your first cinema or stadium.</p>
          </div>
          <button
            onClick={() => setIsVenueModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Create Venue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue._id}
              className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden flex flex-col group hover:border-slate-300 transition-all shadow-xs"
            >
              {/* Image Header */}
              <div className="h-44 relative overflow-hidden bg-slate-100">
                <img
                  src={venue.image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80'}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeleteVenue(venue._id, venue.name)}
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                    title="Delete Venue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                    {venue.city}
                  </span>
                  <h3 className="text-lg font-bold text-white font-['Outfit'] mt-1 leading-snug">
                    {venue.name}
                  </h3>
                </div>
              </div>

              {/* Venue Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{venue.address}</span>
                  </div>
                  {venue.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {venue.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200">
                          {a}
                        </span>
                      ))}
                      {venue.amenities.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{venue.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Halls List */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Halls / Screens ({venue.halls?.length || 0})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedVenueForHall(venue);
                        setIsHallModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Hall</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {venue.halls?.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2 text-center bg-slate-50 rounded-lg">
                        No auditoriums created. Click Add Hall.
                      </p>
                    ) : (
                      venue.halls?.map((h) => (
                        <div
                          key={h._id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="overflow-hidden pr-2">
                            <p className="text-xs font-semibold text-slate-900 truncate">{h.name}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span className="text-indigo-600 font-medium">{h.screenType}</span>
                              <span>•</span>
                              <span>{h.capacity} Seats</span>
                            </p>
                          </div>
                          <Link
                            to={`/admin/halls/${h._id}/layout`}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
                            title="Open Visual Seat Map Designer"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Design Seats</span>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Venue */}
      {isVenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Add New Venue Complex</h3>
              <button
                onClick={() => setIsVenueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  placeholder="e.g. Cineplex Grand IMAX"
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={venueForm.city}
                    onChange={(e) => setVenueForm({ ...venueForm, city: e.target.value })}
                    placeholder="e.g. Metro City"
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={venueForm.contactPhone}
                    onChange={(e) => setVenueForm({ ...venueForm, contactPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={venueForm.address}
                  onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                  placeholder="e.g. 100 Entertainment Blvd"
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={venueForm.image}
                  onChange={(e) => setVenueForm({ ...venueForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVenueModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Venue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Hall */}
      {isHallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Add New Auditorium</h3>
                <p className="text-[11px] text-slate-500">For venue: {selectedVenueForHall?.name}</p>
              </div>
              <button
                onClick={() => setIsHallModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHall} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Auditorium / Screen Name *</label>
                <input
                  type="text"
                  value={hallForm.name}
                  onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                  placeholder="e.g. Screen 3 (Dolby Atmos)"
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Auditorium Screen Format</label>
                <select
                  value={hallForm.screenType}
                  onChange={(e) => setHallForm({ ...hallForm, screenType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="IMAX">Laser IMAX Curved</option>
                  <option value="Dolby Cinema">Dolby Cinema Atmos</option>
                  <option value="Standard">Standard Cinema Screen</option>
                  <option value="Theatre Stage">Live Theatre Stage</option>
                  <option value="4DX">4DX Motion & Effects</option>
                  <option value="Open Air">Open Air Amphitheatre</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  A starter visual seating layout will be created which you can freely customize.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHallModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create & Launch Designer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
