"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  UtensilsCrossed,
  Plus,
  Search,
  QrCode,
  Printer,
  Edit3,
  Trash2,
  X,
  Check,
  RefreshCw,
  Loader2,
  Users,
  MapPin,
  AlertCircle,
  Copy,
  Wifi,
} from "lucide-react";

export interface AdminTable {
  id: string;
  tableNumber: string;
  qrCodeToken: string;
  zone: string;
  capacity: number;
  isActive: boolean;
  activeOrderCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface TablesClientProps {
  initialTables: AdminTable[];
}

export default function TablesClient({ initialTables }: TablesClientProps) {
  const [tables, setTables] = useState<AdminTable[]>(initialTables);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<AdminTable | null>(null);
  const [qrModalTable, setQrModalTable] = useState<AdminTable | null>(null);
  const [standeeTable, setStandeeTable] = useState<AdminTable | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tableNumber: "",
    zone: "Indoor Dining",
    capacity: 4,
    isActive: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Host origin for QR links
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/tables");
      const json = await res.json();
      if (res.ok && json.success) {
        setTables(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch tables:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtered List
  const filteredTables = useMemo(() => {
    return tables.filter((tbl) => {
      const matchSearch =
        tbl.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tbl.zone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchZone = zoneFilter === "all" || tbl.zone === zoneFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? tbl.isActive : !tbl.isActive);

      return matchSearch && matchZone && matchStatus;
    });
  }, [tables, searchQuery, zoneFilter, statusFilter]);

  // Unique Zones for filter tabs
  const uniqueZones = useMemo(() => {
    const zones = new Set(tables.map((t) => t.zone));
    return Array.from(zones);
  }, [tables]);

  // KPIs
  const totalCapacity = useMemo(
    () => tables.reduce((sum, t) => sum + (t.isActive ? t.capacity : 0), 0),
    [tables]
  );
  const activeTablesCount = useMemo(
    () => tables.filter((t) => t.isActive).length,
    [tables]
  );
  const occupiedCount = useMemo(
    () => tables.filter((t) => (t.activeOrderCount || 0) > 0).length,
    [tables]
  );

  // Handlers
  const handleOpenAdd = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: `T-0${tables.length + 1}`,
      zone: "Indoor Dining",
      capacity: 4,
      isActive: true,
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (tbl: AdminTable) => {
    setEditingTable(tbl);
    setFormData({
      tableNumber: tbl.tableNumber,
      zone: tbl.zone,
      capacity: tbl.capacity,
      isActive: tbl.isActive,
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      if (editingTable) {
        // Update
        const res = await fetch(`/api/admin/tables/${editingTable.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!res.ok) {
          setFormError(json.error?.message || "Failed to update table.");
          setFormSubmitting(false);
          return;
        }
      } else {
        // Create
        const res = await fetch("/api/admin/tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!res.ok) {
          setFormError(json.error?.message || "Failed to create table.");
          setFormSubmitting(false);
          return;
        }
      }

      setIsAddModalOpen(false);
      fetchTables();
    } catch (err) {
      console.error(err);
      setFormError("Network error. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (tbl: AdminTable) => {
    try {
      const res = await fetch(`/api/admin/tables/${tbl.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !tbl.isActive }),
      });
      if (res.ok) {
        fetchTables();
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tables/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteId(null);
        fetchTables();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const copyScanUrl = (token: string) => {
    const url = `${origin}/scan/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Tables & QR Ordering Suite
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Manage dining zones, table capacities, and generate ready-to-print Dine-in QR standees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTables}
            className="p-2.5 rounded-button bg-white border border-sand-300 hover:bg-sand-50 text-stone-700 shadow-sm transition-colors"
            title="Refresh tables"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-button bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-hover shadow-elevation-1 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Table</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card bg-white p-4 sm:p-5 rounded-card border border-sand-300 shadow-xs">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Tables
          </p>
          <p className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-900 mt-1">
            {tables.length}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Across all restaurant zones</p>
        </div>

        <div className="glass-card bg-white p-4 sm:p-5 rounded-card border border-sand-300 shadow-xs">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Active for Ordering
          </p>
          <p className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-600 mt-1">
            {activeTablesCount}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Ready for guests to scan</p>
        </div>

        <div className="glass-card bg-white p-4 sm:p-5 rounded-card border border-sand-300 shadow-xs">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Seating Capacity
          </p>
          <p className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-900 mt-1">
            {totalCapacity} <span className="text-sm font-normal text-stone-500">Guests</span>
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Active seating capacity</p>
        </div>

        <div className="glass-card bg-white p-4 sm:p-5 rounded-card border border-sand-300 shadow-xs">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Active Dine-In Orders
          </p>
          <p className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-600 mt-1">
            {occupiedCount} <span className="text-sm font-normal text-stone-500">Tables</span>
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Currently being served</p>
        </div>
      </div>

      {/* 3. Search & Zone Filter Bar */}
      <div className="glass-card bg-white p-4 rounded-card border border-sand-300 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table number, zone..."
              className="w-full pl-10 pr-4 py-2 rounded-button bg-sand-50/70 border border-sand-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-3 py-2 rounded-button bg-sand-50 border border-sand-300 text-xs font-semibold text-stone-800 outline-none"
            >
              <option value="all">All Dining Zones</option>
              {uniqueZones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-button bg-sand-50 border border-sand-300 text-xs font-semibold text-stone-800 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tables Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTables.length === 0 ? (
          <div className="col-span-full py-16 text-center glass-card bg-white rounded-card border border-sand-300 p-8 space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-heading font-bold text-base text-stone-800">
              No Restaurant Tables Found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No tables match your current filter criteria. Create a new table to start generating QR codes.
            </p>
          </div>
        ) : (
          filteredTables.map((tbl) => (
            <div
              key={tbl.id}
              className={`glass-card bg-white rounded-card border p-5 space-y-4 shadow-xs transition-all hover:shadow-elevation-1 ${
                tbl.isActive ? "border-sand-300" : "border-stone-300 opacity-60 bg-stone-50"
              }`}
            >
              {/* Card Top: Number, Status & Occupancy */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-xl text-stone-900">
                      Table #{tbl.tableNumber}
                    </span>
                    {(tbl.activeOrderCount || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-extrabold animate-pulse">
                        🔥 {tbl.activeOrderCount} Active Order
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{tbl.zone}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(tbl)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    tbl.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200"
                  }`}
                >
                  {tbl.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              {/* Card Info: Capacity & Token Preview */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-button bg-sand-50/70 border border-sand-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-stone-500" />
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Capacity</p>
                    <p className="font-semibold text-stone-800">{tbl.capacity} Guests</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-stone-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-stone-400 font-bold uppercase">QR Token</p>
                    <p className="font-mono text-stone-700 truncate text-[11px]">
                      {tbl.qrCodeToken.slice(0, 12)}...
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-sand-200 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQrModalTable(tbl)}
                    className="px-2.5 py-1.5 rounded-button bg-stone-900 text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-xs"
                    title="View QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>View QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStandeeTable(tbl)}
                    className="px-2.5 py-1.5 rounded-button bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Print Table Standee Card"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Standee</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(tbl)}
                    className="p-1.5 rounded-button text-stone-500 hover:text-stone-800 hover:bg-sand-100 transition-colors"
                    title="Edit Table"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(tbl.id)}
                    className="p-1.5 rounded-button text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Table"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. ADD / EDIT TABLE MODAL */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card w-full max-w-md border border-sand-300 shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <h2 className="font-heading font-extrabold text-lg text-stone-900">
                {editingTable ? `Edit Table #${editingTable.tableNumber}` : "Register New Table"}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-button text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-button bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Table Number *
                </label>
                <input
                  type="text"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  placeholder="e.g., T-01, VIP-02, Bar-04"
                  required
                  className="w-full p-2.5 rounded-button bg-sand-50/50 border border-sand-300 focus:border-primary text-sm text-stone-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Dining Zone *
                  </label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full p-2.5 rounded-button bg-sand-50/50 border border-sand-300 focus:border-primary text-xs font-semibold text-stone-900 outline-none"
                  >
                    <option value="Indoor Dining">Indoor Dining</option>
                    <option value="Outdoor Terrace">Outdoor Terrace</option>
                    <option value="VIP Private Dining">VIP Private Dining</option>
                    <option value="Cocktail Bar">Cocktail Bar</option>
                    <option value="Garden Lounge">Garden Lounge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })
                    }
                    className="w-full p-2.5 rounded-button bg-sand-50/50 border border-sand-300 focus:border-primary text-sm text-stone-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-sand-300 focus:ring-primary"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-stone-700 cursor-pointer">
                  Activate this table for QR Dine-In Ordering
                </label>
              </div>

              <div className="pt-3 flex gap-2.5 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-button bg-sand-100 hover:bg-sand-200 text-stone-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 py-2.5 rounded-button bg-primary text-white font-semibold text-xs hover:bg-primary-hover shadow-elevation-1 transition-all flex items-center justify-center gap-2"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingTable ? "Save Changes" : "Create Table"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. QR CODE INSPECTOR MODAL */}
      {/* ======================================================== */}
      {qrModalTable && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card w-full max-w-sm border border-sand-300 shadow-2xl p-6 space-y-5 animate-scale-up text-center">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <div className="text-left">
                <h3 className="font-heading font-extrabold text-base text-stone-900">
                  QR Code • Table #{qrModalTable.tableNumber}
                </h3>
                <p className="text-xs text-stone-500">{qrModalTable.zone}</p>
              </div>
              <button
                type="button"
                onClick={() => setQrModalTable(null)}
                className="p-1 rounded-button text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Crisp Vector QR Code Container */}
            <div className="p-5 bg-white border border-sand-300 rounded-card inline-block shadow-sm">
              <QRCodeSVG
                value={`${origin}/scan/${qrModalTable.qrCodeToken}`}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            {/* Direct Scan Link Box */}
            <div className="space-y-2 text-left">
              <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Direct Scan URL
              </label>
              <div className="flex items-center gap-2 p-2 rounded-button bg-sand-100 border border-sand-300 text-xs font-mono text-stone-700">
                <span className="truncate flex-1">
                  {origin}/scan/{qrModalTable.qrCodeToken}
                </span>
                <button
                  type="button"
                  onClick={() => copyScanUrl(qrModalTable.qrCodeToken)}
                  className="p-1 rounded bg-white hover:bg-sand-200 text-stone-800 transition-colors"
                  title="Copy Link"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStandeeTable(qrModalTable);
                  setQrModalTable(null);
                }}
                className="w-full py-2.5 rounded-button bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open Printable Standee</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. PRINTABLE TABLE STANDEE CARD MODAL (Print Template) */}
      {/* ======================================================== */}
      {standeeTable && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card w-full max-w-md border border-stone-300 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-up text-center">
            {/* Modal Controls (Hidden during print) */}
            <div className="flex items-center justify-between border-b border-sand-200 pb-3 print:hidden">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Print Standee Preview
              </span>
              <button
                type="button"
                onClick={() => setStandeeTable(null)}
                className="p-1 rounded-button text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STANDEE CARD CONTAINER (Formatted for Acrylic Table Card) */}
            <div
              id="standee-card-print"
              className="p-8 rounded-card border-4 border-double border-primary bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] text-stone-900 space-y-5 shadow-inner"
            >
              {/* Top Branding */}
              <div className="space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white mx-auto flex items-center justify-center shadow-md mb-2">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h2 className="font-heading font-extrabold text-xl tracking-tight uppercase text-stone-900">
                  Nusantara Artisan
                </h2>
                <p className="text-[11px] uppercase tracking-widest text-primary font-bold">
                  Kitchen & Lounge
                </p>
              </div>

              {/* Table Identity Header */}
              <div className="py-2.5 px-4 rounded-xl bg-stone-900 text-white inline-block shadow-md">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  {standeeTable.zone}
                </p>
                <p className="font-heading font-black text-2xl tracking-wider text-white">
                  TABLE #{standeeTable.tableNumber}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white border-2 border-stone-800 rounded-2xl inline-block shadow-md">
                <QRCodeSVG
                  value={`${origin}/scan/${standeeTable.qrCodeToken}`}
                  size={190}
                  level="H"
                  includeMargin
                />
              </div>

              {/* Instructions */}
              <div className="space-y-1 text-stone-700">
                <p className="font-heading font-bold text-sm text-stone-900">
                  Scan to Order & Pay at Your Table
                </p>
                <p className="text-xs text-stone-600 max-w-xs mx-auto">
                  Browse our artisan menu, customize your order, and pay instantly from your phone.
                </p>
              </div>

              {/* Wi-Fi & Hospitality Footer */}
              <div className="pt-3 border-t border-sand-300 flex items-center justify-center gap-3 text-[11px] text-stone-600 font-medium">
                <div className="flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-primary" />
                  <span>Wi-Fi: <strong>Nusantara-Guest</strong></span>
                </div>
                <span>•</span>
                <span>Pass: <strong>artisan88</strong></span>
              </div>
            </div>

            {/* Print Action Buttons (Hidden during print) */}
            <div className="flex gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-button bg-stone-900 text-white font-bold text-xs sm:text-sm hover:bg-stone-800 shadow-elevation-1 transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Standee Card</span>
              </button>
              <button
                type="button"
                onClick={() => setStandeeTable(null)}
                className="px-4 py-3 rounded-button bg-sand-100 text-stone-700 font-semibold text-xs hover:bg-sand-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteId && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card w-full max-w-sm border border-sand-300 shadow-2xl p-6 space-y-4 animate-scale-up text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900">
              Delete Restaurant Table?
            </h3>
            <p className="text-xs text-stone-600">
              Are you sure you want to remove this table? Any existing printed QR codes for this table will no longer be valid.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-button bg-sand-100 text-stone-700 font-semibold text-xs hover:bg-sand-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTable(deleteId)}
                className="flex-1 py-2 rounded-button bg-red-600 text-white font-semibold text-xs hover:bg-red-700 shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
