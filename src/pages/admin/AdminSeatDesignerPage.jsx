import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Save,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  RotateCw,
  Plus,
  Trash2,
  Copy,
  Layers,
  Eye,
  CheckCircle2,
  Sliders,
  Tv,
  Accessibility,
  Ban,
  Loader2,
  Grid,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminSeatDesignerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hall, setHall] = useState(null);
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Canvas Viewport State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Selection & Tools
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'add-row' | 'preview'
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Add Row Drawer State
  const [newRowConfig, setNewRowConfig] = useState({
    rowLabel: 'I',
    seatsCount: 12,
    tier: 'Standard',
    curve: 10,
    seatSpacing: 52,
    yPosition: 520,
    middleAisleGap: true,
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    fetchHallDetails();
  }, [id]);

  const fetchHallDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/halls/${id}`);
      if (res.data.success && res.data.data) {
        setHall(res.data.data);
        const fetchedLayout = res.data.data.layout || createDefaultLayout(id);
        setLayout(fetchedLayout);
        pushHistory(fetchedLayout);
      }
    } catch (err) {
      toast.error('Failed to load auditorium layout.');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultLayout = (hallId) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats = [];
    rows.forEach((r, rIdx) => {
      const tier = rIdx < 2 ? 'VIP' : rIdx < 4 ? 'Premium' : 'Standard';
      for (let num = 1; num <= 10; num++) {
        seats.push({
          id: `${r}${num}`,
          rowLabel: r,
          seatNumber: num,
          tier,
          sectionId: 'main',
          x: 160 + num * 55,
          y: 150 + rIdx * 58,
          isAccessible: rIdx === 0 && (num === 1 || num === 10),
          isBlocked: false,
          isActive: true,
        });
      }
    });

    return {
      hallId,
      version: 1,
      gridDimensions: { width: 900, height: 600, rows: 6, cols: 10 },
      stage: { label: '70MM LASER IMAX CURVED SCREEN', curvature: 15, width: 600 },
      sections: [
        { id: 'vip', name: 'VIP Front Row', tier: 'VIP', defaultPrice: 45, color: '#f59e0b' },
        { id: 'premium', name: 'Premium Center', tier: 'Premium', defaultPrice: 32, color: '#8b5cf6' },
        { id: 'main', name: 'Standard Auditorium', tier: 'Standard', defaultPrice: 20, color: '#3b82f6' },
      ],
      seats,
    };
  };

  // History Undo / Redo
  const pushHistory = (newLayout) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(JSON.parse(JSON.stringify(newLayout)));
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setLayout(JSON.parse(JSON.stringify(prev)));
      toast.info('Undo change');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setLayout(JSON.parse(JSON.stringify(next)));
      toast.info('Redo change');
    }
  };

  // Canvas Pan Handlers
  const handleMouseDown = (e) => {
    if (e.target.id === 'canvas-background' || e.target.tagName === 'svg') {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Seat Click & Multi-Selection
  const handleSeatClick = (seatId, e) => {
    e.stopPropagation();
    if (e.shiftKey) {
      if (selectedSeatIds.includes(seatId)) {
        setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seatId));
      } else {
        setSelectedSeatIds([...selectedSeatIds, seatId]);
      }
    } else {
      setSelectedSeatIds([seatId]);
    }
  };

  // Update selected seats properties
  const updateSelectedSeats = (patch) => {
    if (!layout || selectedSeatIds.length === 0) return;

    const nextSeats = layout.seats.map((seat) => {
      if (selectedSeatIds.includes(seat.id)) {
        return { ...seat, ...patch };
      }
      return seat;
    });

    const nextLayout = { ...layout, seats: nextSeats };
    setLayout(nextLayout);
    pushHistory(nextLayout);
  };

  // Tier assignment
  const setTierForSelected = (tier) => {
    updateSelectedSeats({ tier });
    toast.success(`Assigned ${tier} tier to ${selectedSeatIds.length} seat(s).`);
  };

  // Toggle Accessible
  const toggleAccessibleForSelected = () => {
    if (selectedSeatIds.length === 0) return;
    const firstSelected = layout.seats.find((s) => s.id === selectedSeatIds[0]);
    const nextVal = !firstSelected?.isAccessible;
    updateSelectedSeats({ isAccessible: nextVal });
    toast.success(`Wheelchair access ${nextVal ? 'enabled' : 'disabled'}.`);
  };

  // Toggle Blocked
  const toggleBlockedForSelected = () => {
    if (selectedSeatIds.length === 0) return;
    const firstSelected = layout.seats.find((s) => s.id === selectedSeatIds[0]);
    const nextVal = !firstSelected?.isBlocked;
    updateSelectedSeats({ isBlocked: nextVal });
    toast.success(`Pillar obstruction ${nextVal ? 'blocked' : 'unblocked'}.`);
  };

  // Delete Selected Seats
  const deleteSelectedSeats = () => {
    if (selectedSeatIds.length === 0) return;
    const nextSeats = layout.seats.filter((s) => !selectedSeatIds.includes(s.id));
    const nextLayout = { ...layout, seats: nextSeats };
    setLayout(nextLayout);
    pushHistory(nextLayout);
    setSelectedSeatIds([]);
    toast.success(`Removed selected seat(s).`);
  };

  // Add Row Generator
  const handleAddRow = () => {
    const { rowLabel, seatsCount, tier, curve, seatSpacing, middleAisleGap } = newRowConfig;
    const label = rowLabel.trim().toUpperCase() || 'X';

    // Calculate start X and curved Y coordinates
    const startX = 160;
    const baseY = newRowConfig.yPosition || 500;
    const newSeats = [];

    const centerIndex = (seatsCount - 1) / 2;

    for (let i = 1; i <= seatsCount; i++) {
      let xOffset = (i - 1) * seatSpacing;
      if (middleAisleGap && i > seatsCount / 2) {
        xOffset += 30; // Walkway aisle gap
      }

      // Parabolic curve: delta from center squared
      const distFromCenter = Math.abs(i - 1 - centerIndex);
      const curvedY = baseY + Math.pow(distFromCenter / centerIndex, 2) * curve;

      newSeats.push({
        id: `${label}${i}`,
        rowLabel: label,
        seatNumber: i,
        tier,
        sectionId: 'main',
        x: startX + xOffset,
        y: Math.round(curvedY),
        isAccessible: false,
        isBlocked: false,
        isActive: true,
      });
    }

    const nextLayout = {
      ...layout,
      seats: [...layout.seats, ...newSeats],
    };

    setLayout(nextLayout);
    pushHistory(nextLayout);

    // Auto advance label for convenience: G -> H
    const nextChar = String.fromCharCode(label.charCodeAt(0) + 1);
    setNewRowConfig((prev) => ({
      ...prev,
      rowLabel: nextChar,
      yPosition: prev.yPosition + 58,
    }));

    toast.success(`Inserted row "${label}" with ${seatsCount} seats!`);
  };

  // Save or Publish Snapshot
  const handleSaveLayout = async (isPublish = false) => {
    setSaving(true);
    try {
      const endpoint = `/admin/halls/${id}/layout`;
      const res = await api.post(endpoint, {
        ...layout,
        isPublished: isPublish,
      });

      if (res.data.success) {
        toast.success(
          isPublish
            ? `Layout Published! Immutable snapshot v${layout.version} locked.`
            : 'Draft layout saved.'
        );
        if (isPublish) {
          fetchHallDetails();
        }
      }
    } catch (err) {
      toast.error('Failed to save layout.');
    } finally {
      setSaving(false);
    }
  };

  // Capacity Statistics
  const activeSeats = layout?.seats?.filter((s) => s.isActive && !s.isBlocked) || [];
  const vipCount = activeSeats.filter((s) => s.tier === 'VIP').length;
  const premiumCount = activeSeats.filter((s) => s.tier === 'Premium').length;
  const standardCount = activeSeats.filter((s) => s.tier === 'Standard').length;
  const accessibleCount = activeSeats.filter((s) => s.isAccessible).length;
  const blockedCount = layout?.seats?.filter((s) => s.isBlocked).length || 0;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500">Loading visual seat designer canvas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/venues"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {hall?.screenType}
              </span>
              <span className="text-xs text-slate-500 font-medium">{hall?.venueId?.name || 'Venue'}</span>
            </div>
            <h1 className="text-xl font-bold font-['Outfit'] text-slate-900">
              Visual Seat Designer: {hall?.name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTool('select')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTool === 'select' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Editor Canvas
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('preview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'preview' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Guest Preview</span>
            </button>
          </div>

          <button
            onClick={() => handleSaveLayout(false)}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSaveLayout(true)}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Publish Snapshot (v{layout?.version || 1})</span>
          </button>
        </div>
      </div>

      {/* Main Designer Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Visual Canvas (3 Columns) */}
        <div className="lg:col-span-3 rounded-2xl bg-slate-50 border border-slate-200/90 relative overflow-hidden flex flex-col h-[650px] select-none shadow-xs">
          {/* Canvas Floating Toolbar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.15, 2.0))}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.15, 0.5))}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 50, y: 30 });
              }}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas Statistics HUD */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{activeSeats.length} Active Capacity</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-semibold">{vipCount} VIP</span>
            <span className="text-slate-300">•</span>
            <span className="text-purple-700 font-semibold">{premiumCount} Prem</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-700 font-semibold">{standardCount} Std</span>
            {accessibleCount > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-cyan-700 font-semibold flex items-center gap-1">
                  <Accessibility className="w-3 h-3" />
                  {accessibleCount}
                </span>
              </>
            )}
          </div>

          {/* Interactive SVG Viewport */}
          <div
            ref={canvasRef}
            id="canvas-background"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <svg
              width="100%"
              height="100%"
              className="w-full h-full pointer-events-none"
            >
              <g
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                }}
              >
                {/* Curved Screen / Stage Marker */}
                <g className="pointer-events-auto">
                  <path
                    d={`M 140 60 Q ${140 + (layout?.stage?.width || 600) / 2} 30 ${140 + (layout?.stage?.width || 600)} 60`}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <text
                    x={140 + (layout?.stage?.width || 600) / 2}
                    y={90}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="11"
                    fontWeight="700"
                    letterSpacing="4"
                    className="font-mono"
                  >
                    {layout?.stage?.label || 'SCREEN / STAGE'}
                  </text>
                </g>

                {/* Seats Render */}
                {layout?.seats?.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat.id);
                  const isAccessible = seat.isAccessible;
                  const isBlocked = seat.isBlocked;

                  let fillColor = '#3b82f6'; // Standard
                  if (seat.tier === 'VIP') fillColor = '#f59e0b';
                  else if (seat.tier === 'Premium') fillColor = '#8b5cf6';
                  else if (seat.tier === 'Recliner') fillColor = '#10b981';
                  else if (seat.tier === 'Balcony') fillColor = '#f43f5e';

                  if (isBlocked) fillColor = '#e2e8f0';

                  return (
                    <g
                      key={seat.id}
                      transform={`translate(${seat.x}, ${seat.y})`}
                      onClick={(e) => handleSeatClick(seat.id, e)}
                      className="pointer-events-auto cursor-pointer group"
                    >
                      {/* Seat Body */}
                      <rect
                        x="-18"
                        y="-18"
                        width="36"
                        height="36"
                        rx="8"
                        fill={fillColor}
                        fillOpacity={isBlocked ? 0.6 : isSelected ? 1 : 0.9}
                        stroke={
                          isSelected
                            ? '#4f46e5'
                            : isAccessible
                            ? '#0284c7'
                            : isBlocked
                            ? '#94a3b8'
                            : 'rgba(0,0,0,0.1)'
                        }
                        strokeWidth={isSelected ? '3' : isAccessible ? '2' : '1'}
                        strokeDasharray={isBlocked ? '3 3' : 'none'}
                        className="transition-all duration-150 group-hover:scale-105"
                      />

                      {/* Seat Label */}
                      <text
                        x="0"
                        y={isAccessible ? -3 : 4}
                        textAnchor="middle"
                        fill={isBlocked ? '#64748b' : '#ffffff'}
                        fontSize="10"
                        fontWeight="700"
                        fontFamily="monospace"
                        pointerEvents="none"
                      >
                        {seat.seatNumber}
                      </text>

                      {/* Wheelchair icon marker */}
                      {isAccessible && (
                        <circle cx="0" cy="8" r="3" fill="#0284c7" pointerEvents="none" />
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Right Sidebar: Tools & Inspector (1 Column) */}
        <div className="space-y-4">
          {/* Selected Seats Inspector */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Seat Properties ({selectedSeatIds.length} Selected)
              </span>
              {selectedSeatIds.length > 0 && (
                <button
                  onClick={() => setSelectedSeatIds([])}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                >
                  Deselect All
                </button>
              )}
            </div>

            {selectedSeatIds.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3 text-center">
                Click any seat or hold Shift to multi-select seats on canvas.
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    Assign Tier Category
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['VIP', 'Premium', 'Standard', 'Recliner'].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setTierForSelected(tier)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 text-left transition-colors"
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={toggleAccessibleForSelected}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Accessibility className="w-3.5 h-3.5" />
                    <span>Wheelchair</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleBlockedForSelected}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Block / Pillar</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={deleteSelectedSeats}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Selected Seats</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Row Generator Drawer */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Add Curved Seating Row
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Row Label
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newRowConfig.rowLabel}
                    onChange={(e) =>
                      setNewRowConfig({ ...newRowConfig, rowLabel: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Seats Count
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={30}
                    value={newRowConfig.seatsCount}
                    onChange={(e) =>
                      setNewRowConfig({ ...newRowConfig, seatsCount: parseInt(e.target.value) || 12 })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Default Tier
                </label>
                <select
                  value={newRowConfig.tier}
                  onChange={(e) => setNewRowConfig({ ...newRowConfig, tier: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="VIP">VIP</option>
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Recliner">Recliner</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Row Curvature</span>
                  <span>{newRowConfig.curve}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={newRowConfig.curve}
                  onChange={(e) =>
                    setNewRowConfig({ ...newRowConfig, curve: parseInt(e.target.value) })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="middleAisle"
                  checked={newRowConfig.middleAisleGap}
                  onChange={(e) =>
                    setNewRowConfig({ ...newRowConfig, middleAisleGap: e.target.checked })
                  }
                  className="accent-indigo-600 rounded"
                />
                <label htmlFor="middleAisle" className="text-[11px] text-slate-600 cursor-pointer">
                  Include center walkway aisle gap
                </label>
              </div>

              <button
                type="button"
                onClick={handleAddRow}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Row Into Layout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
