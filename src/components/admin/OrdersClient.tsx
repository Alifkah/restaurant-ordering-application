"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Printer,
  Eye,
  X,
  RefreshCw,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerId: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  customerNote?: string | null;
  createdAt: string;
  items?: Array<{
    id: string;
    productName: string;
    unitPriceMinor: number;
    quantity: number;
    lineTotalMinor: number;
    note?: string | null;
    options: Array<{ name: string; priceDeltaMinor: number }>;
  }>;
}

export default function OrdersClient() {
  const [ordersList, setOrdersList] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Drawer / Modals
  const [viewingOrder, setViewingOrder] = useState<OrderDetail | null>(null);
  const [kotOrder, setKotOrder] = useState<OrderDetail | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (res.ok && json.success) {
        setOrdersList(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchOrderDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        return json.data;
      }
    } catch {
      // fallback
    }
    return null;
  };

  const handleOpenDetail = async (order: OrderDetail) => {
    const full = await fetchOrderDetail(order.id);
    setViewingOrder(full || order);
  };

  const handleOpenKot = async (order: OrderDetail) => {
    const full = await fetchOrderDetail(order.id);
    setKotOrder(full || order);
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderDetail["status"]
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrdersList((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (viewingOrder?.id === orderId) {
          setViewingOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
        }
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = ordersList.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerNote && o.customerNote.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Order Lifecycle Management
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Master Order Queue
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Manage incoming guest transactions, kitchen states, item breakdowns, and print Kitchen Order Tickets (KOT).
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-button bg-white border border-sand-300 hover:bg-sand-50 text-stone-700 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card bg-white p-4 rounded-card border border-sand-300 shadow-elevation-1 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order # or table note..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-button bg-sand-50/60 border border-sand-300 focus:border-primary outline-none transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-button bg-sand-50/60 border border-sand-300 focus:border-primary outline-none transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-stone-500">
          Showing {filteredOrders.length} of {ordersList.length} Orders
        </span>
      </div>

      {/* Master Orders Table */}
      <div className="glass-card bg-white rounded-card border border-sand-300 shadow-elevation-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-stone-600 font-bold uppercase tracking-wider border-b border-sand-200">
              <tr>
                <th className="p-4">Order No.</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Dining Type</th>
                <th className="p-4">Total Due</th>
                <th className="p-4">Status Transition</th>
                <th className="p-4 text-center">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    Loading order queue...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No orders matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  let statusColor = "bg-amber-100 text-amber-800 border-amber-300";
                  if (ord.status === "confirmed") statusColor = "bg-blue-100 text-blue-800 border-blue-300";
                  if (ord.status === "preparing") statusColor = "bg-orange-100 text-orange-800 border-orange-300";
                  if (ord.status === "ready") statusColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
                  if (ord.status === "completed") statusColor = "bg-stone-100 text-stone-700 border-stone-300";
                  if (ord.status === "cancelled") statusColor = "bg-red-100 text-red-700 border-red-300";

                  const isTakeaway = ord.customerNote?.includes("[Bawa Pulang") || ord.customerNote?.includes("[Takeaway");

                  return (
                    <tr key={ord.id} className="hover:bg-sand-50/60 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-stone-900 block text-xs sm:text-sm">
                          {ord.orderNumber}
                        </span>
                        <span className="font-mono text-[10px] text-stone-400 truncate block max-w-[120px]">
                          ID: {ord.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="p-4 text-stone-500">
                        <span className="block font-medium text-stone-800">
                          {new Date(ord.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(ord.createdAt).toLocaleDateString("en-US")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                            isTakeaway
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {isTakeaway
                            ? "🛍️ Takeaway"
                            : ord.customerNote?.match(/Table [^\]]+/)?.[0] || ord.customerNote?.match(/Meja [^\]]+/)?.[0] || "🍽️ Dine-in"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-stone-900 text-xs sm:text-sm">
                        {formatCurrency(ord.totalMinor)}
                      </td>
                      <td className="p-4">
                        <select
                          disabled={updatingId === ord.id}
                          value={ord.status}
                          onChange={(e) =>
                            handleUpdateStatus(
                              ord.id,
                              e.target.value as OrderDetail["status"]
                            )
                          }
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${statusColor}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(ord)}
                            className="p-1.5 rounded bg-sand-100 hover:bg-sand-200 text-stone-700 transition-colors"
                            title="Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenKot(ord)}
                            className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                            title="Print Kitchen Ticket (KOT)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/orders/${ord.id}`}
                            target="_blank"
                            className="p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                            title="Live Customer Tracker"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-card w-full max-w-lg max-h-[85vh] overflow-y-auto border border-sand-300 shadow-elevation-3 p-6 space-y-5 animate-scale-up custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <div>
                <span className="text-[11px] text-stone-500 uppercase font-bold block">
                  Order Ticket Details
                </span>
                <h2 className="font-heading font-extrabold text-lg text-stone-900 font-mono">
                  {viewingOrder.orderNumber}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note */}
            {viewingOrder.customerNote && (
              <div className="p-3 rounded-card bg-sand-50 border border-sand-200 text-xs text-stone-700">
                <span className="font-bold text-stone-900">Instructions:</span>{" "}
                {viewingOrder.customerNote}
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Dishes Breakdown
              </h3>
              <div className="divide-y divide-sand-200 border-t border-b border-sand-200">
                {viewingOrder.items?.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-stone-900">
                        {item.quantity}x {item.productName}
                      </p>
                      {item.options?.length > 0 && (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {item.options.map((o) => o.name).join(", ")}
                        </p>
                      )}
                      {item.note && (
                        <p className="text-[11px] text-primary italic mt-0.5">
                          Note: &ldquo;{item.note}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-stone-800">
                      {formatCurrency(item.lineTotalMinor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatCurrency(viewingOrder.subtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Restaurant Tax (PB1 10%)</span>
                <span>{formatCurrency(viewingOrder.taxMinor)}</span>
              </div>
              <div className="pt-2 border-t border-sand-200 flex justify-between items-baseline font-bold text-sm">
                <span className="text-stone-900">Total Due</span>
                <span className="text-primary font-extrabold">
                  {formatCurrency(viewingOrder.totalMinor)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-sand-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setKotOrder(viewingOrder);
                  setViewingOrder(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-button bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print KOT Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 text-xs font-semibold rounded-button bg-sand-100 hover:bg-sand-200 text-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable KOT (Kitchen Order Ticket) Modal */}
      {kotOrder && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card w-full max-w-sm border border-stone-300 shadow-2xl p-6 space-y-4 animate-scale-up text-stone-900 font-mono text-xs">
            {/* Header Thermal receipt style */}
            <div className="text-center border-b-2 border-dashed border-stone-800 pb-3 space-y-1">
              <h2 className="font-heading font-extrabold text-base uppercase">
                NUSANTARA ARTISAN KITCHEN
              </h2>
              <p className="text-[10px] text-stone-500">*** KITCHEN ORDER TICKET (KOT) ***</p>
              <p className="font-bold text-sm text-stone-900 mt-1">
                {kotOrder.orderNumber}
              </p>
              <p className="text-[11px]">
                {new Date(kotOrder.createdAt).toLocaleString("en-US")}
              </p>
              <p className="font-bold uppercase text-xs pt-1">
                {kotOrder.customerNote?.match(/Table [^\]]+/)?.[0] || kotOrder.customerNote?.match(/Meja [^\]]+/)?.[0] ||
                  (kotOrder.customerNote?.includes("[Bawa Pulang") || kotOrder.customerNote?.includes("[Takeaway")
                    ? "TAKEAWAY"
                    : "DINE-IN")}
              </p>
            </div>

            {/* Note */}
            {kotOrder.customerNote && (
              <div className="bg-stone-100 p-2 text-[11px] font-sans border border-stone-300">
                <strong>NOTE:</strong> {kotOrder.customerNote}
              </div>
            )}

            {/* Items */}
            <div className="space-y-2 border-b-2 border-dashed border-stone-800 pb-3">
              {kotOrder.items?.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-sm">
                    <span>{item.quantity}x {item.productName}</span>
                  </div>
                  {item.options?.map((opt, i) => (
                    <p key={i} className="pl-4 text-[11px] text-stone-600">
                      + {opt.name}
                    </p>
                  ))}
                  {item.note && (
                    <p className="pl-4 text-[11px] italic font-sans">
                      &gt; &ldquo;{item.note}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center pt-1 text-[10px] text-stone-400">
              ================================
              <p className="pt-1">Please prepare and serve with care.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setKotOrder(null)}
                className="px-3 py-2 rounded bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
