"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChefHat,
  Clock,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  Flame,
  UtensilsCrossed,
  ShoppingBag,
  Home,
  Check,
  Radio,
} from "lucide-react";

export interface KitchenTicketItem {
  id: string;
  productName: string;
  quantity: number;
  note?: string | null;
  options: Array<{ name: string; priceDeltaMinor?: number }>;
}

export interface KitchenTicket {
  id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  customerNote?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: KitchenTicketItem[];
}

interface KitchenBoardClientProps {
  initialOrders: KitchenTicket[];
}

export default function KitchenBoardClient({ initialOrders }: KitchenBoardClientProps) {
  const [ordersList, setOrdersList] = useState<KitchenTicket[]>(initialOrders);
  const [filterType, setFilterType] = useState<"all" | "dine_in" | "takeaway">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Web Audio Context reference
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play crisp synthesized chime sound
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Pleasant 2-tone melodic chime (C6 -> G6)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      osc1.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + 0.15); // G6

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1046.5, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio playback not allowed yet:", e);
    }
  }, [soundEnabled]);

  // Live timer ticker every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch full orders from DB
  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (res.ok && json.success) {
        // Fetch detailed items for each order
        const detailedOrders: KitchenTicket[] = await Promise.all(
          json.data.map(async (ord: KitchenTicket) => {
            try {
              const detailRes = await fetch(`/api/orders/${ord.id}`);
              const detailJson = await detailRes.json();
              if (detailRes.ok && detailJson.success) {
                return detailJson.data;
              }
            } catch {
              // fallback
            }
            return ord;
          })
        );
        setOrdersList(detailedOrders);
      }
    } catch (err) {
      console.warn("Error refreshing kitchen orders:", err);
    }
  }, []);

  // SSE Stream Listener
  useEffect(() => {
    refreshOrders();

    const eventSource = new EventSource("/api/realtime/kitchen?dev_preview=true");

    eventSource.addEventListener("connected", () => {
      setSseConnected(true);
    });

    eventSource.addEventListener("kitchen_update", (e) => {
      try {
        const payload = JSON.parse(e.data);
        console.log("⚡ Kitchen SSE Event Received:", payload);

        // Play alert sound for new incoming order
        if (payload.status === "pending" || payload.status === "confirmed") {
          playChime();
        }

        // Re-fetch clean list to maintain full consistency
        refreshOrders();
      } catch (err) {
        console.error("Error processing SSE message:", err);
      }
    });

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [playChime, refreshOrders]);

  // Status transition handler
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: "preparing" | "ready" | "completed"
  ) => {
    setActionLoading(orderId);
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
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to calculate elapsed minutes and seconds
  const getElapsedTime = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((now - createdTime) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return { formatted, mins };
  };

  // Filter orders
  const filteredOrders = ordersList.filter((order) => {
    if (order.status === "completed" || order.status === "cancelled") return false;
    if (filterType === "all") return true;
    const isTakeaway = order.customerNote?.includes("[Bawa Pulang");
    if (filterType === "takeaway") return isTakeaway;
    if (filterType === "dine_in") return !isTakeaway;
    return true;
  });

  const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
  const confirmedOrders = filteredOrders.filter((o) => o.status === "confirmed");
  const preparingOrders = filteredOrders.filter((o) => o.status === "preparing");
  const readyOrders = filteredOrders.filter((o) => o.status === "ready");

  return (
    <div className="min-h-screen bg-[#12161A] text-stone-100 flex flex-col font-sans">
      {/* 1. Header Bar */}
      <header className="bg-[#181E24] border-b border-stone-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-base sm:text-lg text-white tracking-tight">
                Nusantara KDS
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-amber-400 border border-primary/30 uppercase">
                Kitchen Display
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Antrean Pesanan Realtime & Manajemen Dapur
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* SSE Live Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              sseConnected
                ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-400"
                : "bg-amber-950/70 border-amber-500/40 text-amber-400 animate-pulse"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{sseConnected ? "Live Connected" : "Connecting..."}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChime();
            }}
            className={`p-2 rounded-button border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? "bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700"
                : "bg-red-950/60 border-red-800/60 text-red-300 hover:bg-red-900/60"
            }`}
            title={soundEnabled ? "Audio Alert Aktif" : "Audio Mute"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">Mute</span>
              </>
            )}
          </button>

          {/* Filter Segmented Control */}
          <div className="flex bg-stone-900 border border-stone-700/80 rounded-button p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === "all"
                  ? "bg-primary text-white font-bold"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              Semua ({filteredOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("dine_in")}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === "dine_in"
                  ? "bg-primary text-white font-bold"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              🍽️ Dine-in
            </button>
            <button
              type="button"
              onClick={() => setFilterType("takeaway")}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === "takeaway"
                  ? "bg-primary text-white font-bold"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              🛍️ Takeaway
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={refreshOrders}
            className="p-2 rounded-button bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 transition-colors"
            title="Refresh Manual"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/"
            className="p-2 rounded-button bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 transition-colors"
            title="Ke Beranda"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 2. 4-Column Kanban Board */}
      <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 min-w-[1000px] h-full items-start">
          {/* Column 1: PENDING */}
          <KanbanColumn
            title="Pesanan Baru"
            subtitle="Menunggu Pembayaran / Konfirmasi"
            count={pendingOrders.length}
            badgeColor="bg-amber-500/20 text-amber-400 border-amber-500/30"
          >
            {pendingOrders.map((order) => (
              <KitchenTicketCard
                key={order.id}
                order={order}
                elapsed={getElapsedTime(order.createdAt)}
                actionLabel="Acknowledge & Masak"
                actionLoading={actionLoading === order.id}
                onAction={() => handleUpdateStatus(order.id, "preparing")}
              />
            ))}
          </KanbanColumn>

          {/* Column 2: CONFIRMED */}
          <KanbanColumn
            title="Dikonfirmasi"
            subtitle="Pembayaran Berhasil • Siap Dimasak"
            count={confirmedOrders.length}
            badgeColor="bg-blue-500/20 text-blue-400 border-blue-500/30"
          >
            {confirmedOrders.map((order) => (
              <KitchenTicketCard
                key={order.id}
                order={order}
                elapsed={getElapsedTime(order.createdAt)}
                actionLabel="Mulai Masak"
                actionColor="bg-primary hover:bg-primary-hover"
                actionIcon={<Flame className="w-4 h-4" />}
                actionLoading={actionLoading === order.id}
                onAction={() => handleUpdateStatus(order.id, "preparing")}
              />
            ))}
          </KanbanColumn>

          {/* Column 3: PREPARING */}
          <KanbanColumn
            title="Sedang Dimasak"
            subtitle="Proses di Stasiun Dapur"
            count={preparingOrders.length}
            badgeColor="bg-orange-500/20 text-orange-400 border-orange-500/30"
          >
            {preparingOrders.map((order) => (
              <KitchenTicketCard
                key={order.id}
                order={order}
                elapsed={getElapsedTime(order.createdAt)}
                actionLabel="Tandai Siap Saji"
                actionColor="bg-emerald-600 hover:bg-emerald-500"
                actionIcon={<CheckCircle2 className="w-4 h-4" />}
                actionLoading={actionLoading === order.id}
                onAction={() => handleUpdateStatus(order.id, "ready")}
              />
            ))}
          </KanbanColumn>

          {/* Column 4: READY */}
          <KanbanColumn
            title="Siap Disajikan"
            subtitle="Menunggu Antar / Pengambilan"
            count={readyOrders.length}
            badgeColor="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          >
            {readyOrders.map((order) => (
              <KitchenTicketCard
                key={order.id}
                order={order}
                elapsed={getElapsedTime(order.createdAt)}
                actionLabel="Selesaikan Pesanan"
                actionColor="bg-stone-700 hover:bg-stone-600 text-stone-200"
                actionIcon={<Check className="w-4 h-4" />}
                actionLoading={actionLoading === order.id}
                onAction={() => handleUpdateStatus(order.id, "completed")}
              />
            ))}
          </KanbanColumn>
        </div>
      </main>
    </div>
  );
}

/* Kanban Column Container */
function KanbanColumn({
  title,
  subtitle,
  count,
  badgeColor,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  badgeColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#181E24] rounded-card border border-stone-800 flex flex-col max-h-[calc(100vh-100px)] shadow-lg">
      <div className="p-4 border-b border-stone-800 flex items-center justify-between sticky top-0 bg-[#181E24] z-10 rounded-t-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-sm text-white tracking-wide">
              {title}
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-extrabold border ${badgeColor}`}
            >
              {count}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1 custom-scrollbar">
        {count === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            Tidak ada tiket pesanan
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/* Kitchen Ticket Card */
function KitchenTicketCard({
  order,
  elapsed,
  actionLabel,
  actionColor = "bg-primary hover:bg-primary-hover",
  actionIcon,
  actionLoading,
  onAction,
}: {
  order: KitchenTicket;
  elapsed: { formatted: string; mins: number };
  actionLabel: string;
  actionColor?: string;
  actionIcon?: React.ReactNode;
  actionLoading?: boolean;
  onAction: () => void;
}) {
  // Timer Alert Color: <10m Green, 10-20m Amber, >20m Red Urgent
  let timerBadge = "bg-emerald-950/80 text-emerald-400 border-emerald-700/60";
  if (elapsed.mins >= 20) {
    timerBadge = "bg-red-950 text-red-300 border-red-600 animate-pulse";
  } else if (elapsed.mins >= 10) {
    timerBadge = "bg-amber-950 text-amber-300 border-amber-600";
  }

  const isTakeaway = order.customerNote?.includes("[Bawa Pulang");

  return (
    <div className="bg-[#202730] rounded-card border border-stone-700/80 p-4 space-y-3.5 shadow-md hover:border-stone-500 transition-colors animate-fade-in">
      {/* Top Meta: Order # & Elapsed Timer */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-extrabold text-sm text-amber-400 tracking-wider">
          {order.orderNumber}
        </span>

        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${timerBadge}`}
          title="Waktu sejak pesanan masuk"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{elapsed.formatted}</span>
        </div>
      </div>

      {/* Dining Badge & Customer Note */}
      <div className="flex flex-wrap items-center gap-2">
        {isTakeaway ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>
              {order.customerNote?.match(/Meja [^\]]+/)?.[0] || "Makan di Tempat"}
            </span>
          </span>
        )}

        <span className="text-[11px] text-stone-400 font-mono">
          {new Date(order.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {order.customerNote && (
        <div className="p-2 rounded bg-[#161B21] border border-amber-500/30 text-[11px] text-amber-200">
          <span className="font-bold text-amber-400">Catatan:</span>{" "}
          {order.customerNote.replace(/\[[^\]]+\]\s*/g, "") || order.customerNote}
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2 border-t border-b border-stone-700/60 py-2.5">
        {order.items && order.items.length > 0 ? (
          order.items.map((item, idx) => (
            <div key={item.id || idx} className="text-xs space-y-1">
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-amber-400 font-bold font-mono text-xs border border-primary/30 flex-shrink-0">
                  {item.quantity}x
                </span>
                <span className="font-bold text-white leading-tight">
                  {item.productName}
                </span>
              </div>

              {item.options && item.options.length > 0 && (
                <div className="pl-7 flex flex-wrap gap-1">
                  {item.options.map((opt, i) => (
                    <span
                      key={i}
                      className="inline-block px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px] border border-stone-700"
                    >
                      {opt.name}
                    </span>
                  ))}
                </div>
              )}

              {item.note && (
                <p className="pl-7 text-[11px] text-amber-300/90 italic">
                  &ldquo;{item.note}&rdquo;
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-stone-400 italic">Rincian menu sedang dimuat...</p>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={actionLoading}
        onClick={onAction}
        className={`w-full py-2.5 px-3 rounded-button text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 ${actionColor}`}
      >
        {actionLoading ? (
          <span>Memproses...</span>
        ) : (
          <>
            {actionIcon}
            <span>{actionLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}
