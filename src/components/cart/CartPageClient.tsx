"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import MenuImage from "@/components/ui/MenuImage";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  UtensilsCrossed,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  Info,
} from "lucide-react";

export default function CartPageClient() {
  const { data: session } = useSession();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    formattedSubtotal,
    formattedTax,
    formattedTotal,
    diningOption,
    setDiningOption,
    tableNumber,
    setTableNumber,
    customerNote,
    setCustomerNote,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  const handleCreateOrder = async () => {
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg("Keranjang belanja Anda masih kosong.");
      return;
    }

    if (diningOption === "dine_in" && !tableNumber.trim()) {
      setErrorMsg("Silakan masukkan Nomor Meja untuk pesanan Makan di Tempat.");
      return;
    }

    setLoading(true);

    try {
      // Map cart items to API payload
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          optionIds: item.selectedOptions.map((o) => o.id),
          quantity: item.quantity,
          note: item.note || undefined,
        })),
        diningOption,
        tableNumber: diningOption === "dine_in" ? tableNumber.trim() : undefined,
        customerNote: customerNote.trim() || undefined,
        discountMinor: 0,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(
          json.error?.message ||
            "Gagal membuat pesanan. Periksa kembali pilihan menu Anda."
        );
        setLoading(false);
        return;
      }

      // Order created successfully!
      const orderData = json.data;

      // Initiate Stripe payment checkout session
      const paymentRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });

      const paymentJson = await paymentRes.json();

      // Clear local cart
      clearCart();

      if (paymentRes.ok && paymentJson.success && paymentJson.data?.url) {
        window.location.href = paymentJson.data.url;
        return;
      }

      // Fallback to local success view if URL is not returned
      setSuccessOrder({
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
      });
      setLoading(false);
    } catch (err) {
      console.error("Order creation failed:", err);
      setErrorMsg("Terjadi gangguan koneksi internet. Silakan coba lagi.");
      setLoading(false);
    }
  };

  // Success Modal View
  if (successOrder) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 glass-card bg-white rounded-card border border-sand-300 shadow-elevation-3 text-center space-y-6 animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
            Pesanan Berhasil Dibuat
          </span>
          <h2 className="font-heading text-2xl font-extrabold text-stone-900 mt-2">
            Terima Kasih atas Pesanan Anda!
          </h2>
          <p className="text-sm text-stone-600">
            Nomor Pesanan:{" "}
            <span className="font-bold text-stone-900 font-mono">
              {successOrder.orderNumber}
            </span>
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Pesanan Anda telah diteruskan ke stasiun dapur Nusantara Artisan Kitchen untuk segera dipersiapkan.
          </p>
        </div>

        <div className="pt-4 border-t border-sand-200 flex flex-col gap-2.5">
          <Link
            href="/menu"
            className="w-full py-3 rounded-button bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-hover transition-colors shadow-sm inline-flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Pesan Hidangan Lainnya</span>
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 rounded-button bg-sand-100 text-stone-700 font-medium text-xs hover:bg-sand-200 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Empty Cart View
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 text-center glass-card bg-white rounded-card border border-sand-300 shadow-elevation-1 space-y-6">
        <div className="w-20 h-20 rounded-full bg-sand-200 text-stone-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-stone-900">
            Keranjang Belanja Anda Kosong
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            Anda belum menambahkan hidangan ke dalam keranjang. Temukan ragam masakan nusantara favorit Anda di katalog menu kami.
          </p>
        </div>
        <Link
          href="/menu"
          className="px-6 py-3 rounded-button bg-primary text-white font-semibold text-xs sm:text-sm shadow-elevation-1 hover:bg-primary-hover transition-all inline-flex items-center gap-2"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Jelajahi Katalog Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lanjut Memilih Menu</span>
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900">
            Keranjang & Rincian Pesanan
          </h1>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-semibold p-2 rounded-button hover:bg-red-50 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Kosongkan</span>
        </button>
      </div>

      {/* Alert Error */}
      {errorMsg && (
        <div className="p-4 rounded-card bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Itemized List & Dining Preferences */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dining Option Card */}
          <div className="glass-card bg-white rounded-card p-5 border border-sand-300 shadow-elevation-1 space-y-4">
            <h2 className="font-heading font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              <span>Pilihan Tempat Bersantap</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDiningOption("dine_in")}
                className={`p-3.5 rounded-button border text-left transition-all ${
                  diningOption === "dine_in"
                    ? "bg-primary-50 border-primary shadow-sm"
                    : "bg-sand-50/60 border-sand-300 hover:border-sand-400"
                }`}
              >
                <span className="font-heading font-bold text-xs sm:text-sm text-stone-900 block">
                  🍽️ Makan di Tempat
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Dine-in di restoran
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDiningOption("takeaway")}
                className={`p-3.5 rounded-button border text-left transition-all ${
                  diningOption === "takeaway"
                    ? "bg-primary-50 border-primary shadow-sm"
                    : "bg-sand-50/60 border-sand-300 hover:border-sand-400"
                }`}
              >
                <span className="font-heading font-bold text-xs sm:text-sm text-stone-900 block">
                  🛍️ Bawa Pulang
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Takeaway / Kemasan khusus
                </span>
              </button>
            </div>

            {diningOption === "dine_in" && (
              <div className="pt-2 animate-fade-in">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Nomor Meja Restoran *
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Contoh: 12 atau VIP-01"
                  required
                  className="w-full p-2.5 rounded-button bg-sand-50/50 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                />
              </div>
            )}
          </div>

          {/* Itemized Basket */}
          <div className="glass-card bg-white rounded-card p-5 border border-sand-300 shadow-elevation-1 space-y-4">
            <h2 className="font-heading font-bold text-sm text-stone-900 uppercase tracking-wider">
              Daftar Hidangan ({items.length})
            </h2>

            <div className="divide-y divide-sand-200">
              {items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-sand-200 flex-shrink-0">
                    <MenuImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-bold text-sm sm:text-base text-stone-900 truncate">
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Options list */}
                    {item.selectedOptions.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selectedOptions.map((opt) => (
                          <p key={opt.id} className="text-xs text-stone-500">
                            • {opt.name}{" "}
                            {opt.priceDeltaMinor > 0 &&
                              `(+${formatCurrency(opt.priceDeltaMinor)})`}
                          </p>
                        ))}
                      </div>
                    )}

                    {item.note && (
                      <p className="text-xs text-primary italic mt-1">
                        Catatan: &ldquo;{item.note}&rdquo;
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-sm text-primary">
                        {formatCurrency(item.lineTotalMinor)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-sand-300 rounded-button bg-white shadow-sm overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-stone-600 hover:bg-sand-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-stone-600 hover:bg-sand-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Order Note */}
          <div className="glass-card bg-white rounded-card p-5 border border-sand-300 shadow-elevation-1 space-y-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Catatan Keseluruhan Pesanan
            </label>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Contoh: Tolong disajikan bersamaan, sendok garpu ekstra..."
              rows={2}
              className="w-full p-3 rounded-button bg-sand-50/60 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 outline-none resize-none transition-all"
            />
          </div>
        </div>

        {/* Right Column: Sticky Bill Summary & Checkout */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          <div className="glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-2 space-y-5">
            <h2 className="font-heading font-bold text-base text-stone-900 border-b border-sand-200 pb-3">
              Ringkasan Pembayaran
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                <span className="font-semibold text-stone-800">{formattedSubtotal}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span className="flex items-center gap-1">
                  <span>Pajak Restoran (PB1 10%)</span>
                </span>
                <span className="font-semibold text-stone-800">{formattedTax}</span>
              </div>

              <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline">
                <span className="font-heading font-bold text-base text-stone-900">
                  Total Akhir
                </span>
                <span className="font-heading font-extrabold text-xl text-primary">
                  {formattedTotal}
                </span>
              </div>
            </div>

            {/* User Session Info Pill */}
            {session?.user ? (
              <div className="p-3 rounded-button bg-sand-50 border border-sand-200 text-xs text-stone-700 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white font-bold text-[10px] flex items-center justify-center">
                  {session.user.name?.charAt(0) || "U"}
                </div>
                <div className="truncate">
                  <p className="font-semibold truncate">{session.user.name}</p>
                  <p className="text-[10px] text-stone-500 truncate">{session.user.email}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-button bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Memesan sebagai Tamu. Anda juga dapat{" "}
                  <Link href="/login" className="font-bold underline">
                    Masuk
                  </Link>{" "}
                  untuk menyimpan riwayat pesanan.
                </span>
              </div>
            )}

            {/* Primary Order CTA */}
            <button
              type="button"
              disabled={loading}
              onClick={handleCreateOrder}
              className="w-full py-3.5 px-4 rounded-button bg-primary text-white font-semibold text-sm shadow-elevation-1 hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Buat Pesanan • {formattedTotal}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Konfirmasi Dapur Realtime & Pembayaran Aman</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
