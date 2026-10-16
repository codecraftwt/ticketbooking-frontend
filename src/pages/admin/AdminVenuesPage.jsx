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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, PageHeader } from '../../components/ui';

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
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        badge="Auditorium Infrastructure"
        badgeVariant="primary"
        title="Venues & Hall Management"
        description="Create complexes, auditoriums, and open the interactive visual seat-map editor."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsVenueModalOpen(true)}
          >
            Add New Venue
          </Button>
        }
      />

      {/* Loading & Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 font-medium">Loading registered venues and auditoriums...</p>
        </div>
      ) : venues.length === 0 ? (
        <Card className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">No Venues Registered Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click below to create your first cinema complex or stadium hall.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsVenueModalOpen(true)}
          >
            Create First Venue
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Card
              key={venue._id}
              className="overflow-hidden flex flex-col group hover:border-slate-300 transition-all hover:shadow-md"
            >
              {/* Image Header */}
              <div className="h-48 relative overflow-hidden bg-slate-100">
                <img
                  src={venue.image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80'}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeleteVenue(venue._id, venue.name)}
                    className="p-2 rounded-xl bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                    title="Delete Venue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-3.5 left-4 right-4">
                  <Badge variant="primary" className="shadow-xs mb-1">
                    {venue.city}
                  </Badge>
                  <h3 className="text-xl font-extrabold text-white font-['Outfit'] leading-snug drop-shadow-sm">
                    {venue.name}
                  </h3>
                </div>
              </div>

              {/* Venue Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1 font-medium">{venue.address}</span>
                  </div>
                  {venue.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {venue.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200">
                          {a}
                        </span>
                      ))}
                      {venue.amenities.length > 3 && (
                        <span className="text-[11px] text-slate-400 self-center font-semibold">
                          +{venue.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Halls List */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-['Outfit']">
                      Auditoriums ({venue.halls?.length || 0})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedVenueForHall(venue);
                        setIsHallModalOpen(true);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Hall</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {venue.halls?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No auditoriums created. Click "Add Hall".
                      </p>
                    ) : (
                      venue.halls?.map((h) => (
                        <div
                          key={h._id}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="overflow-hidden pr-2">
                            <p className="text-xs font-bold text-slate-900 truncate">{h.name}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="text-indigo-600 font-semibold">{h.screenType}</span>
                              <span>•</span>
                              <span>{h.capacity} Seats</span>
                            </p>
                          </div>
                          <Link
                            to={`/admin/halls/${h._id}/layout`}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-2xs"
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
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Add New Venue */}
      {isVenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Add New Venue Complex</h3>
              </div>
              <button
                onClick={() => setIsVenueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  placeholder="e.g. Cineplex Grand IMAX"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={venueForm.city}
                    onChange={(e) => setVenueForm({ ...venueForm, city: e.target.value })}
                    placeholder="e.g. Metro City"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={venueForm.contactPhone}
                    onChange={(e) => setVenueForm({ ...venueForm, contactPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={venueForm.address}
                  onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                  placeholder="e.g. 100 Entertainment Blvd"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={venueForm.image}
                  onChange={(e) => setVenueForm({ ...venueForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVenueModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  loading={submitting}
                >
                  Create Venue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Hall */}
      {isHallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Add New Auditorium</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">For venue: {selectedVenueForHall?.name}</p>
              </div>
              <button
                onClick={() => setIsHallModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHall} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Auditorium / Screen Name *</label>
                <input
                  type="text"
                  value={hallForm.name}
                  onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                  placeholder="e.g. Screen 3 (Dolby Atmos)"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Auditorium Screen Format</label>
                <select
                  value={hallForm.screenType}
                  onChange={(e) => setHallForm({ ...hallForm, screenType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                >
                  <option value="IMAX">Laser IMAX Curved</option>
                  <option value="Dolby Cinema">Dolby Cinema Atmos</option>
                  <option value="Standard">Standard Cinema Screen</option>
                  <option value="Theatre Stage">Live Theatre Stage</option>
                  <option value="4DX">4DX Motion & Effects</option>
                  <option value="Open Air">Open Air Amphitheatre</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1.5 block">
                  A starter visual seating layout will be created which you can freely customize.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsHallModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  loading={submitting}
                >
                  Create & Launch Designer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
