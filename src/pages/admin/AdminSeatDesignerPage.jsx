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
  Minus,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from '../../components/ui';

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
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'preview'
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('inspector'); // 'inspector' | 'rows' | 'add-row'

  // Add Row Drawer State
  const [newRowConfig, setNewRowConfig] = useState({
    rowLabel: 'I',
    seatsCount: 12,
    tier: 'Standard',
    curve: 0,
    seatSpacing: 55,
    middleAisleGap: false,
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
        suggestNextRowConfig(fetchedLayout);
      }
    } catch (err) {
      toast.error('Failed to load auditorium layout.');
    } finally {
      setLoading(false);
    }
  };

  const suggestNextRowConfig = (currentLayout) => {
    if (!currentLayout || !currentLayout.seats || currentLayout.seats.length === 0) {
      setNewRowConfig((prev) => ({ ...prev, rowLabel: 'A' }));
      return;
    }

    const uniqueRows = [...new Set(currentLayout.seats.map((s) => s.rowLabel))].sort();
    const lastRow = uniqueRows[uniqueRows.length - 1];
    let nextLetter = 'A';
    if (lastRow) {
      nextLetter = String.fromCharCode(lastRow.charCodeAt(0) + 1);
    }

    // Determine default tier from recent rows
    const lastRowSeats = currentLayout.seats.filter((s) => s.rowLabel === lastRow);
    const lastTier = lastRowSeats[0]?.tier || 'Standard';

    setNewRowConfig((prev) => ({
      ...prev,
      rowLabel: nextLetter,
      seatsCount: lastRowSeats.length || 12,
      tier: lastTier,
    }));
  };

  const createDefaultLayout = (hallId) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seats = [];
    rows.forEach((r, rIdx) => {
      const tier = rIdx < 2 ? 'VIP' : rIdx < 4 ? 'Premium' : 'Standard';
      for (let num = 1; num <= 12; num++) {
        seats.push({
          id: `${r}${num}`,
          rowLabel: r,
          seatNumber: num,
          tier,
          sectionId: 'main',
          x: 140 + num * 55,
          y: 140 + rIdx * 60,
          isAccessible: rIdx === 0 && (num === 1 || num === 12),
          isBlocked: false,
          isActive: true,
        });
      }
    });

    return {
      hallId,
      version: 1,
      gridDimensions: { width: 950, height: 750, rows: 8, cols: 12 },
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
    setActiveTab('inspector');
  };

  // Select Entire Row
  const handleSelectEntireRow = (rowLabel) => {
    if (!layout || !layout.seats) return;
    const rowSeatIds = layout.seats.filter((s) => s.rowLabel === rowLabel).map((s) => s.id);
    setSelectedSeatIds(rowSeatIds);
    setActiveTab('inspector');
    toast.info(`Selected all ${rowSeatIds.length} seats in Row ${rowLabel}`);
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
    toast.success(`Removed ${selectedSeatIds.length} selected seat(s).`);
  };

  // ==========================================
  // ROW SPECIFIC ACTIONS (ADD / REDUCE / DELETE)
  // ==========================================

  // 1. Delete Entire Row
  const handleDeleteEntireRow = (rowLabel) => {
    if (!layout || !layout.seats) return;
    const rowSeatsCount = layout.seats.filter((s) => s.rowLabel === rowLabel).length;
    if (rowSeatsCount === 0) return;

    const nextSeats = layout.seats.filter((s) => s.rowLabel !== rowLabel);
    const nextLayout = { ...layout, seats: nextSeats };
    setLayout(nextLayout);
    pushHistory(nextLayout);
    setSelectedSeatIds((prev) => prev.filter((id) => !id.startsWith(rowLabel)));
    suggestNextRowConfig(nextLayout);
    toast.success(`Row "${rowLabel}" completely deleted (${rowSeatsCount} seats removed).`);
  };

  // 2. Add 1 Seat to specific row (appended at end)
  const handleAddSeatToRow = (rowLabel) => {
    if (!layout || !layout.seats) return;
    const rowSeats = layout.seats.filter((s) => s.rowLabel === rowLabel);
    if (rowSeats.length === 0) return;

    // Find highest seat number and position
    const sorted = [...rowSeats].sort((a, b) => a.seatNumber - b.seatNumber);
    const lastSeat = sorted[sorted.length - 1];
    const newNum = (lastSeat?.seatNumber || rowSeats.length) + 1;
    const spacing = 55;

    const newSeat = {
      id: `${rowLabel}${newNum}`,
      rowLabel,
      seatNumber: newNum,
      tier: lastSeat?.tier || 'Standard',
      sectionId: lastSeat?.sectionId || 'main',
      x: lastSeat ? lastSeat.x + spacing : 160,
      y: lastSeat ? lastSeat.y : 200,
      isAccessible: false,
      isBlocked: false,
      isActive: true,
    };

    const nextSeats = [...layout.seats, newSeat];
    const nextLayout = { ...layout, seats: nextSeats };
    setLayout(nextLayout);
    pushHistory(nextLayout);
    toast.success(`Added seat ${rowLabel}${newNum} to Row ${rowLabel}.`);
  };

  // 3. Remove 1 Seat from specific row (removed from end)
  const handleRemoveSeatFromRow = (rowLabel) => {
    if (!layout || !layout.seats) return;
    const rowSeats = layout.seats.filter((s) => s.rowLabel === rowLabel);
    if (rowSeats.length <= 1) {
      handleDeleteEntireRow(rowLabel);
      return;
    }

    const sorted = [...rowSeats].sort((a, b) => a.seatNumber - b.seatNumber);
    const seatToRemove = sorted[sorted.length - 1];

    const nextSeats = layout.seats.filter((s) => s.id !== seatToRemove.id);
    const nextLayout = { ...layout, seats: nextSeats };
    setLayout(nextLayout);
    pushHistory(nextLayout);
    setSelectedSeatIds((prev) => prev.filter((id) => id !== seatToRemove.id));
    toast.info(`Removed seat ${seatToRemove.id} from Row ${rowLabel}.`);
  };

  // 4. Change Tier for Entire Row
  const handleSetRowTier = (rowLabel, tier) => {
    if (!layout || !layout.seats) return;
    const nextSeats = layout.seats.map((s) => {
      if (s.rowLabel === rowLabel) {
        return { ...s, tier };
      }
      return s;
    });
    const nextLayout = { ...layout, seats: nextSeats };
    setLayout(nextLayout);
    pushHistory(nextLayout);
    toast.success(`Updated entire Row ${rowLabel} to ${tier} tier.`);
  };

  // 5. Add New Row Generator (Dynamically positioned and horizontally aligned with existing rows)
  const handleAddRow = () => {
    const { rowLabel, seatsCount, tier, curve, seatSpacing, middleAisleGap } = newRowConfig;
    const label = rowLabel.trim().toUpperCase() || 'X';

    // Check if row label already exists
    const existingWithLabel = layout.seats.filter((s) => s.rowLabel === label);
    if (existingWithLabel.length > 0) {
      toast.warning(`Row "${label}" already exists. Please choose a different row label or delete the existing row.`);
      return;
    }

    // Determine startX and spacing to guarantee 100% column alignment with existing rows
    let startX = 195;
    const spacing = seatSpacing || 55;

    if (layout?.seats && layout.seats.length > 0) {
      // Align with seat 1 of the first existing row
      const existingSeat1 = layout.seats.find((s) => s.seatNumber === 1);
      if (existingSeat1) {
        startX = existingSeat1.x;
      }
    }

    // Compute max Y coordinate of all existing seats to place safely below
    let baseY = 140;
    if (layout?.seats && layout.seats.length > 0) {
      const maxY = Math.max(...layout.seats.map((s) => s.y));
      baseY = maxY + 60; // Place 60px safely below the lowest existing row
    }

    const newSeats = [];
    const centerIndex = (seatsCount - 1) / 2;

    for (let i = 1; i <= seatsCount; i++) {
      let xOffset = (i - 1) * spacing;
      if (middleAisleGap && i > seatsCount / 2) {
        xOffset += 30; // Walkway aisle gap
      }

      // Parabolic curve: only if curve > 0
      const distFromCenter = Math.abs(i - 1 - centerIndex);
      const curvedY = baseY + (curve > 0 && centerIndex > 0 ? Math.pow(distFromCenter / centerIndex, 2) * curve : 0);

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
    suggestNextRowConfig(nextLayout);

    toast.success(`Inserted Row "${label}" with ${seatsCount} seats!`);
  };

  // 6. Re-align All Existing Rows into Flawless Columns
  const handleRealignAllRows = () => {
    if (!layout || !layout.seats || layout.seats.length === 0) return;

    const uniqueRowLabels = [...new Set(layout.seats.map((s) => s.rowLabel))].sort();
    const startX = 195;
    const startY = 140;
    const xSpacing = 55;
    const ySpacing = 60;

    const realignedSeats = [];

    uniqueRowLabels.forEach((rowLetter, rIdx) => {
      const rowSeats = layout.seats
        .filter((s) => s.rowLabel === rowLetter)
        .sort((a, b) => a.seatNumber - b.seatNumber);

      const rowY = startY + rIdx * ySpacing;

      rowSeats.forEach((seat, sIdx) => {
        realignedSeats.push({
          ...seat,
          seatNumber: sIdx + 1,
          id: `${rowLetter}${sIdx + 1}`,
          x: startX + sIdx * xSpacing,
          y: rowY,
        });
      });
    });

    const nextLayout = { ...layout, seats: realignedSeats };
    setLayout(nextLayout);
    pushHistory(nextLayout);
    toast.success('All rows and columns have been aligned into uniform grid!');
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

  // Group seats by row for inspector & canvas row headers
  const uniqueRows = layout?.seats
    ? [...new Set(layout.seats.map((s) => s.rowLabel))].sort()
    : [];

  // Calculate row positions for canvas labels
  const rowPositions = uniqueRows.map((r) => {
    const rSeats = layout.seats.filter((s) => s.rowLabel === r);
    const avgY = rSeats.reduce((acc, curr) => acc + curr.y, 0) / rSeats.length;
    const minX = Math.min(...rSeats.map((s) => s.x));
    const maxX = Math.max(...rSeats.map((s) => s.x));
    return {
      rowLabel: r,
      count: rSeats.length,
      tier: rSeats[0]?.tier || 'Standard',
      avgY,
      minX,
      maxX,
    };
  });

  // Selected seats information
  const selectedSeats = layout?.seats?.filter((s) => selectedSeatIds.includes(s.id)) || [];
  const selectedRowLabel = selectedSeats.length > 0 ? selectedSeats[0].rowLabel : null;

  // Capacity Statistics
  const activeSeats = layout?.seats?.filter((s) => s.isActive && !s.isBlocked) || [];
  const vipCount = activeSeats.filter((s) => s.tier === 'VIP').length;
  const premiumCount = activeSeats.filter((s) => s.tier === 'Premium').length;
  const standardCount = activeSeats.filter((s) => s.tier === 'Standard').length;
  const accessibleCount = activeSeats.filter((s) => s.isAccessible).length;

  // Compute maximum boundaries for SVG viewBox
  const maxCanvasY = layout?.seats && layout.seats.length > 0
    ? Math.max(750, Math.max(...layout.seats.map((s) => s.y)) + 120)
    : 750;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Loading visual seat designer canvas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/venues"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{hall?.screenType}</Badge>
              <span className="text-xs text-slate-500 font-semibold">{hall?.venueId?.name || 'Venue'}</span>
            </div>
            <h1 className="text-xl font-extrabold font-['Outfit'] text-slate-900 mt-1">
              Visual Seat Designer: {hall?.name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTool('select')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTool === 'select'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Editor Canvas
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('preview')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'preview'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Guest Preview</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="md"
            leftIcon={Save}
            disabled={saving}
            onClick={() => handleSaveLayout(false)}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={Sparkles}
            disabled={saving}
            isLoading={saving}
            onClick={() => handleSaveLayout(true)}
          >
            Publish Snapshot (v{layout?.version || 1})
          </Button>
        </div>
      </div>

      {/* Main Designer Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visual Canvas (3 Columns) */}
        <div className="lg:col-span-3 rounded-3xl bg-slate-50 border border-slate-200/90 relative overflow-hidden flex flex-col h-[700px] select-none shadow-xs">
          {/* Canvas Floating Toolbar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.15, 2.0))}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.15, 0.5))}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 50, y: 30 });
              }}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              onClick={handleRealignAllRows}
              className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Snap & Align All Rows into Uniform Columns"
            >
              <Grid className="w-4 h-4" />
              <span>Align Grid</span>
            </button>
          </div>

          {/* Canvas Statistics HUD */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
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
                  <Accessibility className="w-3.5 h-3.5" />
                  {accessibleCount} Wheelchair
                </span>
              </>
            )}
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">{uniqueRows.length} Total Rows</span>
          </div>

          {/* Interactive SVG Viewport */}
          <div
            ref={canvasRef}
            id="canvas-background"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing overflow-auto relative"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <svg
              width="100%"
              height={Math.max(700, maxCanvasY)}
              className="min-w-[1000px] w-full pointer-events-none"
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

                {/* Clickable Row Headers on Left & Right */}
                {rowPositions.map((r) => (
                  <g key={`header-${r.rowLabel}`} className="pointer-events-auto select-none">
                    {/* Left Row Pill Button */}
                    <g
                      transform={`translate(${r.minX - 50}, ${r.avgY})`}
                      onClick={() => handleSelectEntireRow(r.rowLabel)}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="-16"
                        y="-14"
                        width="32"
                        height="28"
                        rx="8"
                        fill="#f8fafc"
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                        className="group-hover:fill-indigo-50 group-hover:stroke-indigo-500 transition-colors"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#334155"
                        fontSize="11"
                        fontWeight="800"
                        fontFamily="monospace"
                        className="group-hover:fill-indigo-700"
                      >
                        {r.rowLabel}
                      </text>
                    </g>

                    {/* Right Row Pill Button */}
                    <g
                      transform={`translate(${r.maxX + 50}, ${r.avgY})`}
                      onClick={() => handleSelectEntireRow(r.rowLabel)}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="-16"
                        y="-14"
                        width="32"
                        height="28"
                        rx="8"
                        fill="#f8fafc"
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                        className="group-hover:fill-indigo-50 group-hover:stroke-indigo-500 transition-colors"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#334155"
                        fontSize="11"
                        fontWeight="800"
                        fontFamily="monospace"
                        className="group-hover:fill-indigo-700"
                      >
                        {r.rowLabel}
                      </text>
                    </g>
                  </g>
                ))}

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
          {/* Navigation Tabs for Right Panel */}
          <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('inspector')}
              className={`py-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === 'inspector' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seat Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rows')}
              className={`py-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === 'rows' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Row Manager
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add-row')}
              className={`py-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === 'add-row' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Add Row
            </button>
          </div>

          {/* TAB 1: Selected Seats Inspector */}
          {activeTab === 'inspector' && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Seat Properties ({selectedSeatIds.length} Selected)
                </span>
                {selectedSeatIds.length > 0 && (
                  <button
                    onClick={() => setSelectedSeatIds([])}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    Deselect All
                  </button>
                )}
              </div>

              {selectedSeatIds.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-slate-500 italic">
                    Click any seat, click a row letter `[A]`, or use the Row Manager to edit seats.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('rows')}
                    className="mt-2"
                  >
                    Open Row Manager
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Seat Quick Row Controls */}
                  {selectedRowLabel && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Row {selectedRowLabel} Controls
                        </span>
                        <Badge variant="outline">{selectedRowLabel}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSeatToRow(selectedRowLabel)}
                          leftIcon={Plus}
                        >
                          +1 Seat
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSeatFromRow(selectedRowLabel)}
                          leftIcon={Minus}
                        >
                          -1 Seat
                        </Button>
                      </div>

                      <div className="pt-1">
                        <Button
                          variant="danger"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDeleteEntireRow(selectedRowLabel)}
                          leftIcon={Trash2}
                        >
                          Delete Entire Row {selectedRowLabel}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Assign Tier Category */}
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
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 text-left transition-colors cursor-pointer"
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
                      className="flex-1 py-2 px-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Accessibility className="w-3.5 h-3.5" />
                      <span>Wheelchair</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleBlockedForSelected}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Block / Pillar</span>
                    </button>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={deleteSelectedSeats}
                    leftIcon={Trash2}
                  >
                    Remove Selected ({selectedSeatIds.length})
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* TAB 2: Row Manager (Add/Reduce Seats, Delete Entire Row, Change Row Tier) */}
          {activeTab === 'rows' && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Auditorium Rows ({uniqueRows.length})
                </span>
                <button
                  type="button"
                  onClick={handleRealignAllRows}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200"
                  title="Snap all rows and columns to uniform spacing"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Align All Rows</span>
                </button>
              </div>

              {uniqueRows.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No rows currently in layout. Use "+ Add Row" tab to insert one!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {uniqueRows.map((rowLetter) => {
                    const rowSeats = layout.seats.filter((s) => s.rowLabel === rowLetter);
                    const rowTier = rowSeats[0]?.tier || 'Standard';

                    return (
                      <div
                        key={rowLetter}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                              {rowLetter}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">
                                Row {rowLetter}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {rowSeats.length} Seats • {rowTier}
                              </span>
                            </div>
                          </div>

                          {/* Delete Entire Row Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteEntireRow(rowLetter)}
                            title={`Delete Row ${rowLetter}`}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Row Quick Action Toolbar: + Seat, - Seat, Select All */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddSeatToRow(rowLetter)}
                            className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                            title="Add 1 seat to row"
                          >
                            <Plus className="w-3 h-3 text-indigo-600" />
                            <span>+ Seat</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSeatFromRow(rowLetter)}
                            className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                            title="Remove last seat from row"
                          >
                            <Minus className="w-3 h-3 text-amber-600" />
                            <span>- Seat</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectEntireRow(rowLetter)}
                            className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                            title="Select all seats in row on canvas"
                          >
                            <CheckSquare className="w-3 h-3 text-emerald-600" />
                            <span>Select</span>
                          </button>
                        </div>

                        {/* Tier Selector for this entire row */}
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">Row Tier:</span>
                          <select
                            value={rowTier}
                            onChange={(e) => handleSetRowTier(rowLetter, e.target.value)}
                            className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer"
                          >
                            <option value="VIP">VIP</option>
                            <option value="Premium">Premium</option>
                            <option value="Standard">Standard</option>
                            <option value="Recliner">Recliner</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* TAB 3: Add Curved Seating Row Generator */}
          {activeTab === 'add-row' && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
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
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase focus:outline-none focus:border-indigo-600 font-bold"
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
                        setNewRowConfig({
                          ...newRowConfig,
                          seatsCount: parseInt(e.target.value) || 12,
                        })
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
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
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
                    className="accent-indigo-600 rounded cursor-pointer"
                  />
                  <label htmlFor="middleAisle" className="text-[11px] text-slate-600 cursor-pointer">
                    Include center walkway aisle gap
                  </label>
                </div>

                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-600" />
                  <span>
                    New row will be automatically positioned below the bottom row with generous spacing.
                  </span>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleAddRow}
                  leftIcon={Plus}
                >
                  Insert Row Into Layout
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
