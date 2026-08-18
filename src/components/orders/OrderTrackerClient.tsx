"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  Flame,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  Radio,
  Loader2,
  AlertCircle,
  Home,
  Check,
  Star,
} from "lucide-react";
import ReviewModal from "@/components/reviews/ReviewModal";

interface OrderTrackingItem {
  id: string;
  productId?: string;
  productName: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
  note?: string | null;
  options: Array<{ name: string; priceDeltaMinor: number }>;
}

interface OrderTrackingData {
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
  items: OrderTrackingItem[];
}

const STAGES = [
  { key: "pending", label: "Pesanan Diterima", desc: "Menunggu konfirmasi kasir", icon: Clock },
  { key: "confirmed", label: "Dikonfirmasi", desc: "Pembayaran terverifikasi", icon: ShieldCheck },
  { key: "preparing", label: "Sedang Dimasak", desc: "Diproses koki di dapur", icon: Flame },
  { key: "ready", label: "Siap Disajikan", desc: "Siap diantar atau diambil", icon: UtensilsCrossed },
  { key: "completed", label: "Selesai", desc: "Pesanan telah dinikmati", icon: CheckCircle2 },
];

export default function OrderTrackerClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<{
    productId: string;
    productName: string;
  } | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setOrder(json.data);
      } else {
        setError(json.error?.message || "Pesanan tidak ditemukan.");
      }
    } catch {
      setError("Gagal menghubungkan ke server restoran.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initial Fetch & SSE Listener
  useEffect(() => {
    fetchOrder();

    const eventSource = new EventSource(`/api/realtime/orders/${orderId}`);

    eventSource.addEventListener("connected", () => {
      setSseConnected(true);
    });

    eventSource.addEventListener("status_change", (e) => {
      try {
        const payload = JSON.parse(e.data);
        console.log("⚡ Order Status SSE Changed:", payload);
        if (payload.status) {
          setOrder((prev) => (prev ? { ...prev, status: payload.status } : prev));
        }
      } catch (err) {
        console.error("Error processing SSE message:", err);
      }
    });

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    // Periodic Polling Fallback every 6 seconds
    const pollInterval = setInterval(() => {
      fetchOrder();
    }, 6000);

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [orderId, fetchOrder]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card bg-white rounded-card border border-sand-300 text-center space-y-4 shadow-elevation-1">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm font-semibold text-stone-700">
          Memuat status live pesanan...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card bg-white rounded-card border border-red-200 text-center space-y-4 shadow-elevation-1">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-heading text-lg font-bold text-stone-900">
          Gagal Memuat Pelacakan
        </h2>
        <p className="text-xs text-stone-600">{error}</p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Kembali ke Menu</span>
        </Link>
      </div>
    );
  }

  // Calculate current stage index
  const stageKeys = ["pending", "confirmed", "preparing", "ready", "completed"];
  const currentStageIndex = stageKeys.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. Header Card */}
      <div className="glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-2 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">
              Live Order Tracker
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono">
              {order.orderNumber}
            </h1>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              sseConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{sseConnected ? "Terhubung Realtime" : "Menghubungkan..."}</span>
          </div>
        </div>

        {/* Customer Note & Dining Option */}
        {order.customerNote && (
          <div className="p-3 rounded-card bg-sand-50 border border-sand-200 text-xs text-stone-700">
            <span className="font-bold text-stone-900">Tempat / Instruksi:</span>{" "}
            {order.customerNote}
          </div>
        )}
      </div>

      {/* 2. Visual 5-Step Progress Stepper */}
      <div className="glass-card bg-white rounded-card p-6 sm:p-8 border border-sand-300 shadow-elevation-1 space-y-6">
        <h2 className="font-heading font-bold text-sm text-stone-900 uppercase tracking-wider border-b border-sand-200 pb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Status Proses Dapur</span>
        </h2>

        {isCancelled ? (
          <div className="p-4 rounded-card bg-red-50 border border-red-200 text-red-700 text-center space-y-1">
            <p className="font-bold text-sm">Pesanan Dibatalkan</p>
            <p className="text-xs">Pesanan ini telah dibatalkan oleh pihak restoran atau sistem.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="space-y-6">
              {STAGES.map((stage, idx) => {
                const IconComponent = stage.icon;
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                let iconStyles = "bg-sand-100 text-stone-400 border-sand-300";
                let textStyles = "text-stone-400";
                let titleStyles = "text-stone-500 font-semibold";

                if (isPassed) {
                  iconStyles = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
                  titleStyles = "text-stone-900 font-bold";
                  textStyles = "text-stone-500";
                } else if (isCurrent) {
                  iconStyles =
                    "bg-primary text-white border-primary shadow-elevation-1 ring-4 ring-primary/20 animate-pulse";
                  titleStyles = "text-primary font-extrabold";
                  textStyles = "text-stone-700 font-medium";
                }

                return (
                  <div key={stage.key} className="flex items-start gap-4 relative">
                    {/* Connecting Vertical Line */}
                    {idx < STAGES.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 h-10 -ml-[1px] transition-colors ${
                          idx < currentStageIndex ? "bg-emerald-600" : "bg-sand-300"
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all z-10 ${iconStyles}`}
                    >
                      {isPassed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="pt-1 min-w-0">
                      <h3 className={`text-sm ${titleStyles}`}>
                        {stage.label}
                        {isCurrent && (
                          <span className="ml-2 inline-block text-[10px] uppercase font-bold bg-primary-100 text-primary-900 px-2 py-0.5 rounded-full">
                            Aktif Sekarang
                          </span>
                        )}
                      </h3>
                      <p className={`text-xs mt-0.5 ${textStyles}`}>{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Itemized Receipt */}
      <div className="glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-1 space-y-4">
        <h2 className="font-heading font-bold text-sm text-stone-900 uppercase tracking-wider pb-3 border-b border-sand-200">
          Rincian Hidangan yang Dipesan
        </h2>

        <div className="divide-y divide-sand-200">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between gap-4">
              <div>
                <p className="font-heading font-bold text-xs sm:text-sm text-stone-900">
                  {item.quantity}x {item.productName}
                </p>
                {item.options.length > 0 && (
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {item.options.map((o) => o.name).join(", ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-[11px] text-primary italic mt-0.5">
                    Catatan: &ldquo;{item.note}&rdquo;
                  </p>
                )}
                {item.productId &&
                  (order.status === "ready" || order.status === "completed") && (
                    <button
                      type="button"
                      onClick={() =>
                        setReviewingItem({
                          productId: item.productId!,
                          productName: item.productName,
                        })
                      }
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-200 transition-colors"
                    >
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>Beri Ulasan Hidangan</span>
                    </button>
                  )}
              </div>
              <span className="font-bold text-xs sm:text-sm text-stone-800 flex-shrink-0">
                {formatCurrency(item.lineTotalMinor)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-sand-200 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotalMinor)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Pajak Restoran (PB1 10%)</span>
            <span>{formatCurrency(order.taxMinor)}</span>
          </div>
          <div className="pt-2 border-t border-sand-200 flex justify-between items-baseline font-bold">
            <span className="text-stone-900">Total Pembayaran</span>
            <span className="text-base sm:text-lg text-primary font-extrabold">
              {formatCurrency(order.totalMinor)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/menu"
          className="flex-1 py-3.5 rounded-button bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-hover transition-colors shadow-elevation-1 flex items-center justify-center gap-2"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Pesan Hidangan Lainnya</span>
        </Link>
        <Link
          href="/"
          className="py-3.5 px-6 rounded-button bg-white text-stone-800 font-semibold text-xs sm:text-sm border border-sand-300 hover:bg-sand-50 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Beranda</span>
        </Link>
      </div>

      {/* Review Modal */}
      {reviewingItem && (
        <ReviewModal
          isOpen={!!reviewingItem}
          onClose={() => setReviewingItem(null)}
          productId={reviewingItem.productId}
          productName={reviewingItem.productName}
          orderId={order.id}
        />
      )}
    </div>
  );
}
