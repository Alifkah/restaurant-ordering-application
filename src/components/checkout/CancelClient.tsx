"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Phone,
  Loader2,
} from "lucide-react";

export default function CancelClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const handleRetryPayment = async () => {
    if (!orderId) {
      window.location.href = "/cart";
      return;
    }

    setLoading(true);
    setRetryError(null);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data?.url) {
        window.location.href = json.data.url;
      } else {
        setRetryError(json.error?.message || "Gagal membuat sesi pembayaran baru.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Retry checkout failed:", err);
      setRetryError("Gagal menghubungi gateway pembayaran.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-12 glass-card bg-white rounded-card p-6 sm:p-8 border border-sand-300 shadow-elevation-2 text-center space-y-6 animate-scale-up">
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
          Pembayaran Belum Berhasil
        </span>
        <h1 className="font-heading text-2xl font-extrabold text-stone-900 mt-2">
          Transaksi Dibatalkan
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
          Proses pembayaran Stripe tidak diselesaikan atau dibatalkan. Kartu Anda tidak dikenakan biaya dan hidangan Anda tetap tersimpan.
        </p>
      </div>

      {retryError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-card text-xs">
          {retryError}
        </div>
      )}

      <div className="pt-2 flex flex-col gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={handleRetryPayment}
          className="w-full py-3.5 rounded-button bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-elevation-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyiapkan Pembayaran...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Coba Pembayaran Kembali</span>
            </>
          )}
        </button>

        <Link
          href="/cart"
          className="w-full py-3 rounded-button bg-sand-100 text-stone-800 font-semibold text-xs sm:text-sm hover:bg-sand-200 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Kembali ke Keranjang Belanja</span>
        </Link>
      </div>

      <div className="pt-4 border-t border-sand-200 text-stone-500 text-xs flex items-center justify-center gap-2">
        <Phone className="w-3.5 h-3.5 text-primary" />
        <span>Butuh bantuan? Hubungi kasir di +62 361 8499 123</span>
      </div>
    </div>
  );
}
