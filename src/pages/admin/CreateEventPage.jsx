import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  ArrowRight,
  Film,
  MapPin,
  Calendar,
  Ticket,
  Sliders,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Loader2,
  Check,
  Tv,
  Layers,
  Eye,
  Zap,
  Info,
  Plus,
  Minus,
  Trash2,
  Crown,
  Wand2,
  Tag,
  Users,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Button, PageHeader } from '../../components/ui';

// Preset palette colors for custom tiers
const TIER_COLORS = [
  { color: '#0284c7', bgClass: 'bg-sky-500 hover:bg-sky-400 text-white', badgeClass: 'bg-sky-500 text-white' },
  { color: '#f59e0b', bgClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950', badgeClass: 'bg-amber-500 text-slate-950' },
  { color: '#8b5cf6', bgClass: 'bg-indigo-500 hover:bg-indigo-400 text-white', badgeClass: 'bg-indigo-500 text-white' },
  { color: '#ec4899', bgClass: 'bg-pink-500 hover:bg-pink-400 text-white', badgeClass: 'bg-pink-500 text-white' },
  { color: '#10b981', bgClass: 'bg-emerald-500 hover:bg-emerald-400 text-white', badgeClass: 'bg-emerald-500 text-white' },
  { color: '#f97316', bgClass: 'bg-orange-500 hover:bg-orange-400 text-white', badgeClass: 'bg-orange-500 text-white' },
];

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [publishedResult, setPublishedResult] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'Movie',
    genre: '',
    durationMinutes: 150,
    ageRating: 'PG-13',
    description: '',
    posterImage: '',
    venueName: 'Grand IMAX Arena',
    venueCity: 'New York',
    contactEmail: '',
    contactPhone: '',
    screenType: 'IMAX',
    hallName: 'Screen 1',
    date: new Date().toISOString().split('T')[0],
    startTime: '19:30',
    seatingType: 'NumberedSeats', // 'NumberedSeats' | 'GeneralAdmission'
    totalPersons: 200,
  });

  // 4 Default Tiers with customizable selection, name, price, and color
  const [tiers, setTiers] = useState([
    {
      id: 'standard',
      name: 'Standard',
      price: 20,
      isSelected: true,
      color: '#0284c7',
      bgClass: 'bg-sky-500 hover:bg-sky-400 text-white',
      badgeClass: 'bg-sky-500 text-white',
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 40,
      isSelected: true,
      color: '#f59e0b',
      bgClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
      badgeClass: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 30,
      isSelected: true,
      color: '#8b5cf6',
      bgClass: 'bg-indigo-500 hover:bg-indigo-400 text-white',
      badgeClass: 'bg-indigo-500 text-white',
    },
    {
      id: 'recliner',
      name: 'Recliner',
      price: 50,
      isSelected: true,
      color: '#ec4899',
      bgClass: 'bg-pink-500 hover:bg-pink-400 text-white',
      badgeClass: 'bg-pink-500 text-white',
    },
  ]);

  // Active tiers checked by user
  const activeTiers = tiers.filter((t) => t.isSelected);

  // User-defined rows & seating configuration (Step 2 - for Numbered Seats)
  const [rowsConfig, setRowsConfig] = useState([
    { rowLabel: 'A', tier: 'Recliner', seatCount: 12, disabledSeats: [] },
    { rowLabel: 'B', tier: 'VIP', seatCount: 12, disabledSeats: [] },
    { rowLabel: 'C', tier: 'VIP', seatCount: 12, disabledSeats: [] },
    { rowLabel: 'D', tier: 'Premium', seatCount: 12, disabledSeats: [] },
    { rowLabel: 'E', tier: 'Premium', seatCount: 12, disabledSeats: [] },
    { rowLabel: 'F', tier: 'Standard', seatCount: 12, disabledSeats: [] },
    { rowLabel: 'G', tier: 'Standard', seatCount: 12, disabledSeats: [] },
    { rowLabel: 'H', tier: 'Standard', seatCount: 12, disabledSeats: [] },
  ]);

  // Quick generator helper state
  const [quickRows, setQuickRows] = useState(8);
  const [quickSeats, setQuickSeats] = useState(12);

  const posterPresets = [
    { label: 'Sci-Fi / Space', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80' },
    { label: 'Concert / Live', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80' },
    { label: 'Cinema Hall', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80' },
    { label: 'Theatre Stage', url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80' },
  ];

  // Calculated Capacity & Stats
  const totalActiveSeats =
    form.seatingType === 'GeneralAdmission'
      ? Math.max(1, parseInt(form.totalPersons) || 100)
      : rowsConfig.reduce((acc, row) => {
          const disabledCount = row.disabledSeats ? row.disabledSeats.length : 0;
          return acc + Math.max(0, row.seatCount - disabledCount);
        }, 0);

  // Tier Management Handlers
  const toggleTierSelected = (tierId) => {
    const target = tiers.find((t) => t.id === tierId);
    if (target?.isSelected && activeTiers.length <= 1) {
      toast.error('At least one ticket category must be selected.');
      return;
    }

    const updated = tiers.map((t) =>
      t.id === tierId ? { ...t, isSelected: !t.isSelected } : t
    );
    setTiers(updated);

    // If a tier was deselected, re-assign rows that had that tier to an active one
    const newActive = updated.filter((t) => t.isSelected);
    if (target?.isSelected && newActive.length > 0) {
      const fallbackTierName = newActive[0].name;
      setRowsConfig((prev) =>
        prev.map((r) => (r.tier === target.name ? { ...r, tier: fallbackTierName } : r))
      );
    }
  };

  const updateTierName = (tierId, newName) => {
    const oldTier = tiers.find((t) => t.id === tierId);
    const updated = tiers.map((t) => (t.id === tierId ? { ...t, name: newName } : t));
    setTiers(updated);

    // Update row tier assignments if name changed
    if (oldTier && oldTier.name !== newName) {
      setRowsConfig((prev) =>
        prev.map((r) => (r.tier === oldTier.name ? { ...r, tier: newName } : r))
      );
    }
  };

  const updateTierPrice = (tierId, newPrice) => {
    const priceVal = Math.max(0, parseFloat(newPrice) || 0);
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, price: priceVal } : t))
    );
  };

  const addCustomTier = () => {
    const nextIdx = tiers.length;
    const colorPreset = TIER_COLORS[nextIdx % TIER_COLORS.length];
    const newTier = {
      id: `custom_${Date.now()}`,
      name: `Category ${nextIdx + 1}`,
      price: 25,
      isSelected: true,
      color: colorPreset.color,
      bgClass: colorPreset.bgClass,
      badgeClass: colorPreset.badgeClass,
    };
    setTiers([...tiers, newTier]);
    toast.success('Added new ticket category.');
  };

  const deleteTier = (tierId) => {
    if (tiers.length <= 1) {
      toast.error('Must maintain at least 1 ticket category.');
      return;
    }
    const toDelete = tiers.find((t) => t.id === tierId);
    const updated = tiers.filter((t) => t.id !== tierId);
    setTiers(updated);

    // Re-assign any row using the deleted tier
    const newActive = updated.filter((t) => t.isSelected);
    const fallbackTier = newActive[0]?.name || 'Standard';
    if (toDelete) {
      setRowsConfig((prev) =>
        prev.map((r) => (r.tier === toDelete.name ? { ...r, tier: fallbackTier } : r))
      );
    }
  };

  // Custom Row Manipulation Handlers
  const addRow = () => {
    const nextChar = String.fromCharCode(65 + rowsConfig.length);
    const defaultTier = activeTiers[activeTiers.length - 1]?.name || 'Standard';
    setRowsConfig([
      ...rowsConfig,
      { rowLabel: nextChar, tier: defaultTier, seatCount: 12, disabledSeats: [] },
    ]);
  };

  const deleteRow = (index) => {
    if (rowsConfig.length <= 1) {
      toast.error('Must have at least 1 row in the seating map.');
      return;
    }
    const updated = rowsConfig.filter((_, i) => i !== index);
    const resequenced = updated.map((r, i) => ({
      ...r,
      rowLabel: String.fromCharCode(65 + i),
    }));
    setRowsConfig(resequenced);
  };

  const updateRowTier = (index, tierName) => {
    const updated = [...rowsConfig];
    updated[index].tier = tierName;
    setRowsConfig(updated);
  };

  const updateRowSeatCount = (index, delta) => {
    const updated = [...rowsConfig];
    const newCount = Math.max(2, Math.min(24, updated[index].seatCount + delta));
    updated[index].seatCount = newCount;
    updated[index].disabledSeats = (updated[index].disabledSeats || []).filter((s) => s <= newCount);
    setRowsConfig(updated);
  };

  const toggleSeatDisabled = (rowIndex, seatNumber) => {
    const updated = [...rowsConfig];
    const currentDisabled = updated[rowIndex].disabledSeats || [];
    if (currentDisabled.includes(seatNumber)) {
      updated[rowIndex].disabledSeats = currentDisabled.filter((s) => s !== seatNumber);
    } else {
      updated[rowIndex].disabledSeats = [...currentDisabled, seatNumber];
    }
    setRowsConfig(updated);
  };

  const applyQuickSetup = () => {
    const rCount = Math.max(1, Math.min(16, quickRows));
    const sCount = Math.max(4, Math.min(24, quickSeats));
    const newRows = [];

    // Assign tiers evenly across generated rows based on active tiers
    for (let i = 0; i < rCount; i++) {
      const rowLabel = String.fromCharCode(65 + i);
      let tierName = activeTiers[activeTiers.length - 1]?.name || 'Standard';

      if (activeTiers.length >= 2) {
        const tierRatio = i / rCount;
        const tierIdx = Math.min(
          activeTiers.length - 1,
          Math.floor(tierRatio * activeTiers.length)
        );
        tierName = activeTiers[tierIdx].name;
      }

      newRows.push({ rowLabel, tier: tierName, seatCount: sCount, disabledSeats: [] });
    }
    setRowsConfig(newRows);
    toast.success(`Generated custom setup with ${rCount} rows and ${sCount} seats per row.`);
  };

  // Step Validation
  const validateStep1 = () => {
    if (!form.title.trim()) {
      toast.error('Please enter an event title.');
      return false;
    }
    if (!form.description.trim()) {
      toast.error('Please enter an event description.');
      return false;
    }
    if (!form.venueName.trim()) {
      toast.error('Please enter a venue name.');
      return false;
    }
    if (activeTiers.length === 0) {
      toast.error('Please select at least one ticket pricing category.');
      return false;
    }
    if (form.seatingType === 'GeneralAdmission') {
      const cap = parseInt(form.totalPersons);
      if (!cap || cap <= 0) {
        toast.error('Please enter a valid number of persons / capacity.');
        return false;
      }
    }
    return true;
  };

  const handleNextFromStep1 = (e) => {
    e?.preventDefault();
    if (validateStep1()) {
      const activeNames = activeTiers.map((t) => t.name);
      setRowsConfig((prev) =>
        prev.map((r) => (!activeNames.includes(r.tier) ? { ...r, tier: activeNames[0] } : r))
      );

      // If user selected General Admission (No seat map), advance directly to Step 3 Overview!
      if (form.seatingType === 'GeneralAdmission') {
        setStep(3);
      } else {
        setStep(2);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextToStep3 = () => {
    if (form.seatingType === 'NumberedSeats' && totalActiveSeats <= 0) {
      toast.error('Please ensure at least one active seat exists in your seat map.');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublish = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        genre: form.genre.trim() || form.category || 'General',
        durationMinutes: parseInt(form.durationMinutes) || 120,
        ageRating: form.ageRating,
        description: form.description.trim(),
        posterImage: form.posterImage.trim(),
        venueName: form.venueName.trim(),
        venueCity: form.venueCity.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        screenType: form.screenType || 'Standard',
        hallName: form.hallName.trim() || 'Main Hall',
        date: form.date,
        startTime: form.startTime,
        seatingType: form.seatingType,
        generalAdmissionCapacity: parseInt(form.totalPersons) || 100,
        pricing: activeTiers.map((t) => ({
          tier: t.name,
          price: parseFloat(t.price) || 20,
          color: t.color,
        })),
        rowsConfig: form.seatingType === 'GeneralAdmission' ? [] : rowsConfig,
      };

      const res = await api.post('/admin/events/quick-publish', payload);

      if (res.data.success) {
        toast.success(`🎉 Event "${form.title}" published! Live on public store.`);
        setPublishedResult(res.data.data);
      }
    } catch (err) {
      console.error('Publish error:', err);
      toast.error(err.response?.data?.message || 'Failed to publish event.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPublishedResult(null);
    setStep(1);
    setForm({
      title: '',
      category: 'Movie',
      genre: '',
      durationMinutes: 150,
      ageRating: 'PG-13',
      description: '',
      posterImage: '',
      venueName: 'Grand IMAX Arena',
      venueCity: 'New York',
      contactEmail: '',
      contactPhone: '',
      screenType: 'IMAX',
      hallName: 'Screen 1',
      date: new Date().toISOString().split('T')[0],
      startTime: '19:30',
      seatingType: 'NumberedSeats',
      totalPersons: 200,
    });
    setTiers([
      {
        id: 'standard',
        name: 'Standard',
        price: 20,
        isSelected: true,
        color: '#0284c7',
        bgClass: 'bg-sky-500 hover:bg-sky-400 text-white',
        badgeClass: 'bg-sky-500 text-white',
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 40,
        isSelected: true,
        color: '#f59e0b',
        bgClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
        badgeClass: 'bg-amber-500 text-slate-950',
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 30,
        isSelected: true,
        color: '#8b5cf6',
        bgClass: 'bg-indigo-500 hover:bg-indigo-400 text-white',
        badgeClass: 'bg-indigo-500 text-white',
      },
      {
        id: 'recliner',
        name: 'Recliner',
        price: 50,
        isSelected: true,
        color: '#ec4899',
        bgClass: 'bg-pink-500 hover:bg-pink-400 text-white',
        badgeClass: 'bg-pink-500 text-white',
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div>
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
        <PageHeader
          badge="Event Creator Wizard"
          badgeVariant="primary"
          title="Add New Event"
          description="Follow the simple process: fill details, set seating type, and launch your live event."
        />
      </div>

      {/* 3-Step Wizard Navigation Stepper */}
      {!publishedResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 Item */}
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-3 text-left transition-colors cursor-pointer ${
                step === 1 ? 'text-indigo-600 font-bold' : step > 1 ? 'text-emerald-600 font-semibold' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  step === 1
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : step > 1
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] uppercase tracking-wider block text-slate-400">Step 1</span>
                <span className="text-xs">Event & Seating Type</span>
              </div>
            </button>

            {/* Divider Line 1-2 */}
            <div className={`h-0.5 flex-1 mx-4 transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

            {/* Step 2 Item */}
            <button
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className={`flex items-center gap-3 text-left transition-colors cursor-pointer ${
                step === 2 ? 'text-indigo-600 font-bold' : step > 2 ? 'text-emerald-600 font-semibold' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  step === 2
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : step > 2
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] uppercase tracking-wider block text-slate-400">Step 2</span>
                <span className="text-xs">
                  {form.seatingType === 'GeneralAdmission' ? 'Seating Capacity' : 'Design Seat Map'}
                </span>
              </div>
            </button>

            {/* Divider Line 2-3 */}
            <div className={`h-0.5 flex-1 mx-4 transition-colors ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

            {/* Step 3 Item */}
            <button
              onClick={() => {
                if (validateStep1()) setStep(3);
              }}
              className={`flex items-center gap-3 text-left transition-colors cursor-pointer ${
                step === 3 ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  step === 3
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] uppercase tracking-wider block text-slate-400">Step 3</span>
                <span className="text-xs">Overview & Publish</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Celebratory Post-Publish Success Card */}
      {publishedResult ? (
        <Card className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <Badge variant="success">Event Published & Live</Badge>
            <h2 className="text-2xl font-extrabold font-['Outfit'] text-slate-900 mt-2">
              "{publishedResult.event?.title}" is Now Live!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your venue,{' '}
              {form.seatingType === 'GeneralAdmission' ? 'open seating capacity,' : 'auditorium seat map,'}{' '}
              and showtime schedule are active and ready for bookings.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Venue & Screen:</span>
              <span className="font-semibold text-slate-900">
                {publishedResult.venue?.name} • {publishedResult.hall?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Capacity:</span>
              <span className="font-semibold text-slate-900">
                {publishedResult.layout?.totalSeats || totalActiveSeats} Tickets Available (
                {form.seatingType === 'GeneralAdmission' ? 'General Admission' : `${rowsConfig.length} Rows`})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Showtime:</span>
              <span className="font-semibold text-slate-900">
                {new Date(publishedResult.show?.startTime).toLocaleDateString()} at{' '}
                {new Date(publishedResult.show?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              target="_blank"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Live on Public Store</span>
            </Link>

            <Link
              to="/admin/events"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              <span>Back to All Events</span>
            </Link>

            <button
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>+ Add Another Event</span>
            </button>
          </div>
        </Card>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* STEP 1: EVENT INFORMATION, SEATING TYPE & PRICING TIERS */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6 text-xs animate-in fade-in duration-200">
              {/* Event Basics */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                      1. Event & Production Details
                    </h3>
                    <p className="text-[11px] text-slate-500">Provide the title, genre, runtime, and synopsis.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Interstellar: 10th Anniversary Laser IMAX"
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="Movie">Movie Premiere</option>
                      <option value="Concert">Live Concert</option>
                      <option value="Comedy">Standup Comedy</option>
                      <option value="Theatre">Theatre Play</option>
                      <option value="Sports">Sports Screening</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={form.durationMinutes}
                      onChange={(e) =>
                        setForm({ ...form, durationMinutes: parseInt(e.target.value) || 120 })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age Rating</label>
                    <select
                      value={form.ageRating}
                      onChange={(e) => setForm({ ...form, ageRating: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer font-medium"
                    >
                      <option value="G">G - General</option>
                      <option value="PG">PG - Parental Guidance</option>
                      <option value="PG-13">PG-13 - Teens & Above</option>
                      <option value="R">R - Restricted (18+)</option>
                      <option value="UA">UA - Universal Adult</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Description & Synopsis *</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the production, plot, featured artists or special attractions..."
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none"
                  />
                </div>

                {/* Poster Image */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Poster Image URL</label>
                  <input
                    type="url"
                    value={form.posterImage}
                    onChange={(e) => setForm({ ...form, posterImage: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 mb-2"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400">Sample High-Res Postres:</span>
                    {posterPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setForm({ ...form, posterImage: preset.url })}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-[11px] font-medium transition-colors border border-slate-200 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* NEW SECTION: SEATING SETUP CHOICE (NUMBERED MAP VS GENERAL ADMISSION / CAPACITY) */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                      2. Seating Setup & Booking Mode
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Choose whether you want to design specific numbered seats or simply enter the number of persons.
                    </p>
                  </div>
                </div>

                {/* Two Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Numbered Seat Map */}
                  <div
                    onClick={() => setForm({ ...form, seatingType: 'NumberedSeats' })}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                      form.seatingType === 'NumberedSeats'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/15 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          Numbered Seat Map
                        </span>
                      </div>
                      {form.seatingType === 'NumberedSeats' && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Guests choose specific numbered seats (Rows A, B, C... VIP, Standard) on a visual interactive map.
                    </p>
                    <Badge variant={form.seatingType === 'NumberedSeats' ? 'primary' : 'secondary'} className="text-[10px]">
                      Interactive Map Designer (Step 2)
                    </Badge>
                  </div>

                  {/* Option 2: General Admission / Open Seating */}
                  <div
                    onClick={() => setForm({ ...form, seatingType: 'GeneralAdmission' })}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                      form.seatingType === 'GeneralAdmission'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/15 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          Open Seating / General Admission
                        </span>
                      </div>
                      {form.seatingType === 'GeneralAdmission' && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      No seat map needed. Simply set the total number of persons / capacity (for concerts, open halls, conferences).
                    </p>
                    <Badge variant={form.seatingType === 'GeneralAdmission' ? 'success' : 'secondary'} className="text-[10px]">
                      Quick Setup • No Map Required
                    </Badge>
                  </div>
                </div>

                {/* Conditional Input for General Admission (Number of Persons) */}
                {form.seatingType === 'GeneralAdmission' && (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label className="block font-bold text-emerald-950 text-xs">
                          Total Ticket Capacity (Number of Persons) *
                        </label>
                        <p className="text-[11px] text-emerald-700">
                          Total tickets available for sale without individual numbered seat assignments.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={5000}
                          value={form.totalPersons}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              totalPersons: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-32 px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-slate-900 font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <span className="font-bold text-emerald-900 text-xs">Persons</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Venue & Organizer Contact Details */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                      3. Venue & Organizer Contact Information
                    </h3>
                    <p className="text-[11px] text-slate-500">Specify the event venue location and organizer contact details.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Venue Complex Name *</label>
                    <input
                      type="text"
                      value={form.venueName}
                      onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                      placeholder="e.g. Grand IMAX Arena"
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City / Location</label>
                    <input
                      type="text"
                      value={form.venueCity}
                      onChange={(e) => setForm({ ...form, venueCity: e.target.value })}
                      placeholder="e.g. New York"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Organizer Contact Email & Contact Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Event Contact Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        placeholder="e.g. contact@eventorganizer.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Event Contact Number / Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={form.contactPhone}
                        onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                        placeholder="e.g. +1 (555) 019-2834"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Showtime & Dynamic Ticket Pricing Categories */}
              <Card className="p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                      4. Show Schedule & Ticket Pricing Tiers
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Pick the date/time and configure seating categories (Standard, VIP, Premium, Recliner, or custom).
                    </p>
                  </div>
                </div>

                {/* Show Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Show Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>

                {/* Seating Categories Manager Header */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ticket Categories & Tiers</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Check which categories to use for this event. Only checked categories will be displayed.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomTier}
                    leftIcon={Plus}
                  >
                    Add Category
                  </Button>
                </div>

                {/* Tiers List with Checkboxes, Name & Price Edits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tiers.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        t.isSelected
                          ? 'border-slate-300 bg-white shadow-2xs'
                          : 'border-slate-200/80 bg-slate-50/60 opacity-60'
                      }`}
                    >
                      {/* Checkbox & Color Indicator */}
                      <div className="flex items-center gap-2.5 flex-1">
                        <input
                          type="checkbox"
                          checked={t.isSelected}
                          onChange={() => toggleTierSelected(t.id)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: t.color }}
                        />
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => updateTierName(t.id, e.target.value)}
                          placeholder="Tier Name"
                          disabled={!t.isSelected}
                          className="w-full px-2 py-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none font-bold text-slate-900 text-xs"
                        />
                      </div>

                      {/* Price Input & Delete Button */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-slate-500 font-bold text-xs">$</span>
                        <input
                          type="number"
                          min={0}
                          value={t.price}
                          onChange={(e) => updateTierPrice(t.id, e.target.value)}
                          disabled={!t.isSelected}
                          className="w-16 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs text-center focus:outline-none focus:border-indigo-600 focus:bg-white"
                        />

                        {tiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteTier(t.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Bottom Step 1 Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <Link to="/admin/events">
                  <Button variant="outline" size="md">
                    Cancel
                  </Button>
                </Link>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleNextFromStep1}
                  rightIcon={ArrowRight}
                >
                  {form.seatingType === 'GeneralAdmission'
                    ? 'Next Step: Review & Publish'
                    : 'Next Step: Design Seat Map'}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: SEAT MAP DESIGNER (OR OPEN SEATING CONFIRMATION) */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6 text-xs animate-in fade-in duration-200">
              {form.seatingType === 'GeneralAdmission' ? (
                /* General Admission Active Card in Step 2 */
                <Card className="p-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <Users className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <Badge variant="success">Open Seating Mode Active</Badge>
                    <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit'] mt-2">
                      General Admission • {form.totalPersons} Tickets Capacity
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      You have selected Open Seating. Guests will purchase general admission tickets without specific numbered seat reservations. No seat map layout is required.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-left space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seating Type:</span>
                      <span className="font-bold text-slate-900">General Admission</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Capacity:</span>
                      <span className="font-bold text-slate-900">{form.totalPersons} Persons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Pricing:</span>
                      <span className="font-bold text-slate-900">
                        {activeTiers.map((t) => `${t.name}: $${t.price}`).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, seatingType: 'NumberedSeats' })}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Switch to Numbered Seat Map
                    </button>
                  </div>
                </Card>
              ) : (
                /* Numbered Seat Map Designer */
                <Card className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                          Define & Design Your Seat Map
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Assign rows to your selected categories ({activeTiers.map((t) => t.name).join(', ')}), adjust seats, and click seats to create aisle gaps.
                        </p>
                      </div>
                    </div>

                    {/* Add Row Button */}
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={addRow}
                      leftIcon={Plus}
                    >
                      Add New Row ({String.fromCharCode(65 + rowsConfig.length)})
                    </Button>
                  </div>

                  {/* Quick Batch Setup Toolbar */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <Wand2 className="w-4 h-4 text-indigo-600" />
                      <span>Quick Generator:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[11px]">Rows:</span>
                        <input
                          type="number"
                          min={1}
                          max={16}
                          value={quickRows}
                          onChange={(e) => setQuickRows(parseInt(e.target.value) || 6)}
                          className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[11px]">Seats / Row:</span>
                        <input
                          type="number"
                          min={4}
                          max={24}
                          value={quickSeats}
                          onChange={(e) => setQuickSeats(parseInt(e.target.value) || 12)}
                          className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={applyQuickSetup}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                      >
                        Generate Grid
                      </button>
                    </div>
                  </div>

                  {/* Row-by-Row Customizer Table */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {rowsConfig.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 flex flex-wrap items-center justify-between gap-3 transition-colors shadow-2xs"
                      >
                        {/* Row Label Badge */}
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                            {row.rowLabel}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">Row {row.rowLabel}</span>
                        </div>

                        {/* Dynamic Tier Selector (Showing ONLY Active Categories) */}
                        <div className="flex flex-wrap items-center gap-1">
                          {activeTiers.map((t) => {
                            const isCurrent = row.tier === t.name;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => updateRowTier(idx, t.name)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  isCurrent
                                    ? `${t.badgeClass} shadow-xs ring-1 ring-slate-400`
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: isCurrent ? '#fff' : t.color }}
                                />
                                <span>{t.name} (${t.price})</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Seat Count Controls */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-medium">Seats:</span>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateRowSeatCount(idx, -1)}
                              className="p-1 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center font-mono font-bold text-xs text-slate-900">
                              {row.seatCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateRowSeatCount(idx, 1)}
                              className="p-1 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Delete Row */}
                          <button
                            type="button"
                            onClick={() => deleteRow(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                            title="Delete this row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Real-Time Live Visual Seat Map Canvas */}
                  <div className="mt-4 rounded-2xl bg-slate-900 p-6 text-white overflow-hidden shadow-inner space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                      <div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider block">
                          Live Visual Map Preview
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {rowsConfig.length} Rows • {totalActiveSeats} Active Seats
                        </span>
                      </div>

                      {/* Interactive Dynamic Legend (ONLY Active Categories) */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        {activeTiers.map((t) => (
                          <div key={t.id} className="flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-md inline-block shadow-xs"
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="text-slate-300">
                              {t.name} (${t.price})
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-md border border-dashed border-slate-500 bg-slate-800 inline-block" />
                          <span className="text-slate-400">Aisle Space (Click seat to toggle)</span>
                        </div>
                      </div>
                    </div>

                    {/* Curved Screen Banner */}
                    <div className="relative mx-auto max-w-lg py-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-indigo-400 to-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                      <p className="text-[10px] uppercase font-bold text-slate-400 text-center tracking-widest mt-1.5">
                        {form.screenType} CURVED SCREEN / STAGE
                      </p>
                    </div>

                    {/* Grid Rows with Dynamic Colors & Click-to-Toggle Aisle Feature */}
                    <div className="space-y-2 py-2 max-w-2xl mx-auto overflow-x-auto pb-2">
                      {rowsConfig.map((row, rIdx) => {
                        const tierObj = activeTiers.find((t) => t.name === row.tier) || activeTiers[0];
                        const disabledList = row.disabledSeats || [];

                        return (
                          <div key={row.rowLabel} className="flex items-center justify-center gap-2">
                            {/* Left Row Label */}
                            <span className="w-5 text-center font-mono font-bold text-[11px] text-slate-400">
                              {row.rowLabel}
                            </span>

                            {/* Seats in Row */}
                            <div className="flex items-center gap-1.5">
                              {Array.from({ length: row.seatCount }).map((_, colIndex) => {
                                const seatNum = colIndex + 1;
                                const isDisabled = disabledList.includes(seatNum);

                                if (isDisabled) {
                                  return (
                                    <div
                                      key={seatNum}
                                      onClick={() => toggleSeatDisabled(rIdx, seatNum)}
                                      className="w-6 h-6 rounded-md border border-dashed border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-600 flex items-center justify-center font-mono text-[9px] cursor-pointer transition-colors"
                                      title={`Row ${row.rowLabel}, Seat ${seatNum} (Aisle Gap - Click to restore)`}
                                    >
                                      ·
                                    </div>
                                  );
                                }

                                const bgStyle = tierObj ? { backgroundColor: tierObj.color } : { backgroundColor: '#0284c7' };

                                return (
                                  <div
                                    key={seatNum}
                                    onClick={() => toggleSeatDisabled(rIdx, seatNum)}
                                    style={bgStyle}
                                    className="w-6 h-6 rounded-md text-white flex items-center justify-center font-mono text-[9px] font-bold transition-transform hover:scale-115 shadow-xs cursor-pointer select-none"
                                    title={`Row ${row.rowLabel}, Seat ${seatNum} (${row.tier} - Click to toggle aisle gap)`}
                                  >
                                    {seatNum}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Right Row Label */}
                            <span className="w-5 text-center font-mono font-bold text-[11px] text-slate-400">
                              {row.rowLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Informational Footer Note */}
                    <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span>
                          Tip: Click any seat to create walkway aisle gaps. Rows only use your active categories.
                        </span>
                      </div>
                      <span className="text-white font-mono font-bold">
                        {totalActiveSeats} Seats Active
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Step 2 Bottom Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setStep(1)}
                  leftIcon={ArrowLeft}
                >
                  Back to Event & Tiers
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleNextToStep3}
                  rightIcon={ArrowRight}
                >
                  Next Step: Review Overview
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: OVERVIEW & FINAL PUBLISH */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-6 text-xs animate-in fade-in duration-200">
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                      Step 3: Review Event Overview
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Check your event configuration, venue, active categories, and seating capacity before posting live.
                    </p>
                  </div>
                </div>

                {/* Event Card Preview */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
                  <div className="w-28 h-36 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300 shadow-xs">
                    <img
                      src={
                        form.posterImage ||
                        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={form.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary">{form.category}</Badge>
                      <Badge variant="secondary">Rated {form.ageRating}</Badge>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {form.durationMinutes} minutes
                      </span>
                      <Badge variant={form.seatingType === 'GeneralAdmission' ? 'success' : 'outline'}>
                        {form.seatingType === 'GeneralAdmission' ? 'Open Seating (No Map)' : 'Numbered Seats'}
                      </Badge>
                    </div>

                    <h2 className="text-lg font-extrabold text-slate-900 font-['Outfit']">
                      {form.title}
                    </h2>
                    {form.genre ? (
                      <p className="text-xs text-indigo-600 font-semibold">{form.genre}</p>
                    ) : null}

                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 bg-white p-3 rounded-xl border border-slate-200">
                      {form.description}
                    </p>
                  </div>
                </div>

                {/* Venue, Schedule & Custom Map Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Venue & Organizer Contact */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Venue & Contact</span>
                    </div>
                    <p className="font-extrabold text-slate-900 text-sm font-['Outfit']">
                      {form.venueName}
                    </p>
                    <p className="text-slate-600 text-[11px]">{form.venueCity}</p>
                    {(form.contactEmail || form.contactPhone) && (
                      <div className="text-[11px] text-slate-600 pt-1 space-y-0.5">
                        {form.contactEmail && (
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Mail className="w-3 h-3 text-indigo-500" />
                            <span className="truncate">{form.contactEmail}</span>
                          </div>
                        )}
                        {form.contactPhone && (
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Phone className="w-3 h-3 text-indigo-500" />
                            <span>{form.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Showtime Schedule */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Scheduled Showtime</span>
                    </div>
                    <p className="font-extrabold text-slate-900 text-sm font-['Outfit']">
                      {new Date(form.date + 'T12:00:00').toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-purple-700 font-bold text-xs">
                      Starting at {form.startTime}
                    </p>
                  </div>

                  {/* Active Pricing Tiers & Custom Capacity */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Capacity & Pricing Tiers</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {activeTiers.map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 font-mono font-bold text-[11px]"
                        >
                          {t.name}: ${t.price}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-600 text-[11px] pt-1">
                      {form.seatingType === 'GeneralAdmission' ? (
                        <>
                          Open Capacity: <span className="font-bold text-slate-900">{form.totalPersons} Persons</span>
                        </>
                      ) : (
                        <>
                          Auditorium Capacity: <span className="font-bold text-slate-900">{rowsConfig.length} Rows • {totalActiveSeats} Seats</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Final Confirmation Banner */}
                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-white">Ready to publish live?</h4>
                    <p className="text-xs text-slate-400">
                      Clicking "Publish Event" will create your venue,{' '}
                      {form.seatingType === 'GeneralAdmission'
                        ? `${form.totalPersons} open admission tickets,`
                        : 'custom seat map,'}{' '}
                      and show tickets on the live store.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    isLoading={submitting}
                    disabled={submitting}
                    onClick={handlePublish}
                    leftIcon={Zap}
                    className="flex-shrink-0"
                  >
                    🚀 Publish Event
                  </Button>
                </div>
              </Card>

              {/* Step 3 Bottom Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setStep(form.seatingType === 'GeneralAdmission' ? 1 : 2)}
                  leftIcon={ArrowLeft}
                >
                  {form.seatingType === 'GeneralAdmission' ? 'Back to Event Details' : 'Back to Seat Map'}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  isLoading={submitting}
                  disabled={submitting}
                  onClick={handlePublish}
                  leftIcon={Zap}
                >
                  🚀 Publish Event
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
