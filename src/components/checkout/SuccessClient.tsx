"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  UtensilsCrossed,
  ShieldCheck,
  CreditCard,
  ChefHat,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  customerNote?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    unitPriceMinor: number;
    quantity: number;
    lineTotalMinor: number;
    note?: string | null;
    options: Array<{
      id: string;
      name: string;
      priceDeltaMinor: number;
    }>;
  }>;
}

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const isDevMode = searchParams.get("is_dev_mode") === "true";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Parameter Order ID tidak ditemukan.");
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          setError(json.error?.message || "Gagal memuat rincian pesanan.");
        } else {
          setOrder(json.data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Gagal menghubungi server restoran.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card bg-white rounded-card border border-sand-300 shadow-elevation-2 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm font-semibold text-stone-700">
          Memverifikasi status pembayaran pesanan...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card bg-white rounded-card border border-red-200 shadow-elevation-2 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-heading text-lg font-bold text-stone-900">
          Informasi Pesanan Tidak Tersedia
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

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6">
      {/* Top Success Banner */}
      <div className="glass-card bg-white rounded-card p-6 sm:p-8 border border-emerald-200 shadow-elevation-2 text-center space-y-4 animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pembayaran Terkonfirmasi</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
            Pesanan Anda Sedang Disiapkan!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Dapur kami telah menerima pesanan Anda dan segera memulai proses memasak dengan bahan-bahan segar pilihan.
          </p>

          {isDevMode && (
            <div className="inline-block mt-2 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[11px] font-mono">
              Mode Pengembangan: Simulasi Pembayaran Berhasil
            </div>
          )}
        </div>

        {/* Order Meta Box */}
        <div className="p-4 rounded-card bg-sand-50 border border-sand-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
          <div>
            <span className="text-[11px] text-stone-500 block uppercase font-medium">
              Nomor Pesanan
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-stone-900">
              {order.orderNumber}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-500 block uppercase font-medium">
              Metode Pembayaran
            </span>
            <span className="font-semibold text-xs sm:text-sm text-stone-900 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>Stripe Online</span>
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] text-stone-500 block uppercase font-medium">
              Status Pesanan
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Dikonfirmasi Dapur</span>
            </span>
          </div>
        </div>

        {order.customerNote && (
          <div className="p-3 rounded-card bg-sand-100/60 text-left text-xs text-stone-700">
            <span className="font-bold text-stone-900">Instruksi:</span>{" "}
            {order.customerNote}
          </div>
        )}
      </div>

      {/* Itemized Receipt Card */}
      <div className="glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-1 space-y-4">
        <h2 className="font-heading font-bold text-sm text-stone-900 uppercase tracking-wider pb-3 border-b border-sand-200">
          Rincian Tagihan & Hidangan
        </h2>

        <div className="divide-y divide-sand-200">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between gap-4">
              <div className="min-w-0">
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
            <span className="text-stone-900">Total Pembayaran Lunas</span>
            <span className="text-base sm:text-lg text-primary font-extrabold">
              {formatCurrency(order.totalMinor)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/orders/${order.id}`}
          className="flex-1 py-3.5 rounded-button bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-hover transition-colors shadow-elevation-1 flex items-center justify-center gap-2"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Lacak Proses Memasak di Dapur</span>
        </Link>

        <Link
          href="/menu"
          className="py-3.5 px-6 rounded-button bg-white text-stone-800 font-semibold text-xs sm:text-sm border border-sand-300 hover:bg-sand-50 transition-colors flex items-center justify-center gap-2"
        >
          <span>Pesan Lagi</span>
        </Link>
      </div>
    </div>
  );
}
