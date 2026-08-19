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
  CreditCard,
  Zap,
  User,
} from "lucide-react";

export default function CartPageClient() {
  const { data: session } = useSession();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotalMinor,
    diningOption,
    setDiningOption,
    tableNumber,
    setTableNumber,
    tableId,
    tableZone,
    customerNote,
    setCustomerNote,
  } = useCart();

  // Guest Information state
  const [guestName, setGuestName] = useState(session?.user?.name || "");
  const [guestEmail, setGuestEmail] = useState(session?.user?.email || "");
  const [guestPhone, setGuestPhone] = useState("");

  // Card details state (visual representation)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  // Price calculations matching 5% service charge & 10% PB1
  const serviceChargeMinor = Math.round(subtotalMinor * 0.05);
  const calculatedTaxMinor = Math.round((subtotalMinor + serviceChargeMinor) * 0.1);
  const calculatedTotalMinor = subtotalMinor + serviceChargeMinor + calculatedTaxMinor;

  const handleCreateOrder = async () => {
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg("Your dining basket is currently empty.");
      return;
    }

    if (diningOption === "dine_in" && !tableNumber?.trim()) {
      setErrorMsg("Please enter your Table Number for Dine-In service.");
      return;
    }

    if (!session?.user && (!guestName.trim() || !guestEmail.trim())) {
      setErrorMsg("Please enter your Name and Email Address for order updates.");
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
        tableNumber: diningOption === "dine_in" && tableNumber ? tableNumber.trim() : undefined,
        tableId: diningOption === "dine_in" && tableId ? tableId : undefined,
        customerNote: customerNote.trim() || undefined,
        guestName: guestName.trim() || undefined,
        guestEmail: guestEmail.trim() || undefined,
        guestPhone: guestPhone.trim() ? `+62${guestPhone.replace(/^0+/, "")}` : undefined,
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
            "Failed to create order. Please review your basket selection."
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

      // Fallback to local success view if direct URL is not returned
      setSuccessOrder({
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
      });
      setLoading(false);
    } catch (err) {
      console.error("Order creation failed:", err);
      setErrorMsg("Network connection error. Please try again.");
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
            Order Placed Successfully
          </span>
          <h2 className="font-heading text-2xl font-extrabold text-stone-900 mt-2">
            Thank You for Dining with Us!
          </h2>
          <p className="text-sm text-stone-600">
            Order Reference:{" "}
            <span className="font-bold text-stone-900 font-mono">
              {successOrder.orderNumber}
            </span>
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Your ticket has been sent directly to the kitchen display board and preparation is starting shortly.
          </p>
        </div>

        <div className="pt-4 border-t border-sand-200 flex flex-col gap-2.5">
          <Link
            href={`/orders/${successOrder.orderId}`}
            className="w-full py-3 rounded-button bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-hover transition-colors shadow-sm inline-flex items-center justify-center gap-2"
          >
            <span>Track Kitchen Progress</span>
          </Link>
          <Link
            href="/menu"
            className="w-full py-2.5 rounded-button bg-sand-100 text-stone-700 font-medium text-xs hover:bg-sand-200 transition-colors"
          >
            Order More Dishes
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
            Your Dining Basket is Empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            You haven&apos;t selected any dishes yet. Discover your favorite archipelago flavors in our culinary catalog.
          </p>
        </div>
        <Link
          href="/menu"
          className="px-6 py-3 rounded-button bg-primary text-white font-semibold text-xs sm:text-sm shadow-elevation-1 hover:bg-primary-hover transition-all inline-flex items-center gap-2"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Explore Menu Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 lg:pb-0">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Menu Catalog</span>
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900">
            Checkout & Order Details
          </h1>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-semibold p-2 rounded-button hover:bg-red-50 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Basket</span>
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
        {/* Left Column: Guest Details & Your Order */}
        <div className="lg:col-span-7 space-y-6">
          {/* Segmented Switch: Sign In / Guest Checkout */}
          {!session?.user && (
            <div className="flex items-center p-1 rounded-xl bg-sand-200 border border-sand-300 max-w-sm">
              <Link
                href="/login?callbackUrl=/cart"
                className="flex-1 py-2 text-center text-xs font-semibold rounded-lg text-stone-600 hover:text-stone-900 transition-colors"
              >
                Sign In
              </Link>
              <span
                className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-primary text-white shadow-sm flex items-center justify-center gap-1 transition-all cursor-default"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Fast Guest Checkout</span>
              </span>
            </div>
          )}

          {/* Card 1: Guest Details */}
          <div className="glass-card bg-white rounded-card p-5 sm:p-6 border border-sand-300 shadow-elevation-1 space-y-4">
            <h2 className="font-heading font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Guest & Dining Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Raden Arya"
                  required
                  className="w-full px-3.5 py-2.5 rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-900 outline-none transition-all"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. arya@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-900 outline-none transition-all"
                />
              </div>

              {/* WhatsApp Number with +62 prefix pill */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-stone-700">
                  WhatsApp Number (for live order status)
                </label>
                <div className="flex rounded-button border border-sand-300 overflow-hidden bg-sand-50/70 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="px-3.5 py-2.5 bg-sand-200/80 border-r border-sand-300 text-stone-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 flex-shrink-0">
                    <span>🇮🇩</span>
                    <span>+62</span>
                  </div>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="812 3456 7890"
                    className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-stone-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dining Preference Pills */}
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-semibold text-stone-700">
                Dining Preference *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDiningOption("dine_in")}
                  className={`p-3 rounded-button border text-left transition-all ${
                    diningOption === "dine_in"
                      ? "bg-primary-50 border-primary text-primary font-bold shadow-xs"
                      : "bg-sand-50/60 border-sand-300 text-stone-700 hover:border-sand-400 font-medium"
                  }`}
                >
                  <span className="text-xs sm:text-sm block">
                    🍽️ Dine-In {tableNumber && `(Table ${tableNumber})`}
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal mt-0.5 block">
                    Served directly to your table
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDiningOption("takeaway")}
                  className={`p-3 rounded-button border text-left transition-all ${
                    diningOption === "takeaway"
                      ? "bg-primary-50 border-primary text-primary font-bold shadow-xs"
                      : "bg-sand-50/60 border-sand-300 text-stone-700 hover:border-sand-400 font-medium"
                  }`}
                >
                  <span className="text-xs sm:text-sm block">
                    🛍️ Takeaway
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal mt-0.5 block">
                    Packaged to-go / Pickup
                  </span>
                </button>
              </div>
            </div>

            {/* Table Number if Dine-In */}
            {diningOption === "dine_in" && (
              <div className="pt-1 animate-fade-in space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">
                    Table Number *
                  </label>
                  {tableZone && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      📍 {tableZone}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g., 08 or VIP-1"
                  required
                  className="w-full px-3.5 py-2.5 rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-900 outline-none transition-all"
                />
              </div>
            )}

            {/* Special Note textarea */}
            <div className="pt-1 space-y-1">
              <label className="block text-xs font-semibold text-stone-700">
                Special Requests / Kitchen Notes
              </label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Serve food together, no plastic cutlery, extra napkins..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-button bg-sand-50/70 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-900 outline-none resize-none transition-all"
              />
            </div>
          </div>

          {/* Card 2: Your Order */}
          <div className="glass-card bg-white rounded-card p-5 sm:p-6 border border-sand-300 shadow-elevation-1 space-y-4">
            <h2 className="font-heading font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>Your Order ({items.length} {items.length === 1 ? "dish" : "dishes"})</span>
              <span className="text-xs text-stone-500 font-medium">
                {items.reduce((s, i) => s + i.quantity, 0)} items total
              </span>
            </h2>

            <div className="divide-y divide-sand-200">
              {items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5 items-start">
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-sand-200 flex-shrink-0">
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
                        className="text-xs text-red-500 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Options / Variants */}
                    {item.selectedOptions.length > 0 && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.selectedOptions.map((o) => o.name).join(" • ")}
                      </p>
                    )}

                    {item.note && (
                      <p className="text-xs text-primary italic mt-0.5">
                        &ldquo;{item.note}&rdquo;
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-sm text-primary">
                        {formatCurrency(item.lineTotalMinor)}
                      </span>

                      {/* Mini Quantity Stepper */}
                      <div className="flex items-center border border-sand-300 rounded-lg bg-sand-50 shadow-xs overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-stone-600 hover:bg-sand-200 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-stone-600 hover:bg-sand-200 transition-colors"
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
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          <div className="glass-card bg-white rounded-card p-6 border border-sand-300 shadow-elevation-2 space-y-5">
            <h2 className="font-heading font-bold text-base text-stone-900 border-b border-sand-200 pb-3">
              Order Summary
            </h2>

            {/* Pricing Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">
                  {formatCurrency(subtotalMinor)}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Service Charge (5%)</span>
                <span className="font-semibold text-stone-800">
                  {formatCurrency(serviceChargeMinor)}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Restaurant Tax (PB1 10%)</span>
                <span className="font-semibold text-stone-800">
                  {formatCurrency(calculatedTaxMinor)}
                </span>
              </div>

              <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline">
                <span className="font-heading font-bold text-base text-stone-900">
                  Total Due
                </span>
                <span className="font-heading font-extrabold text-xl text-primary">
                  {formatCurrency(calculatedTotalMinor)}
                </span>
              </div>
            </div>

            {/* Simulated Stripe Card Element */}
            <div className="p-4 rounded-xl bg-sand-50/90 border border-sand-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Stripe Secure Payment</span>
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-stone-500">
                  <span className="px-1.5 py-0.5 bg-white rounded border border-sand-300">VISA</span>
                  <span className="px-1.5 py-0.5 bg-white rounded border border-sand-300">MC</span>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card Number •••• •••• •••• ••••"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-sand-300 text-xs text-stone-900 placeholder:text-stone-400 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM / YY"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-300 text-xs text-stone-900 placeholder:text-stone-400 outline-none"
                  />
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="CVC"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-300 text-xs text-stone-900 placeholder:text-stone-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Primary Order CTA */}
            <button
              type="button"
              disabled={loading}
              onClick={handleCreateOrder}
              className="w-full py-3.5 px-4 rounded-button bg-primary text-white font-bold text-sm shadow-elevation-1 hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {formatCurrency(calculatedTotalMinor)} with Stripe 🔒</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>No registration required • SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-sand-300 p-3.5 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-stone-500 font-bold uppercase block">
            TOTAL DUE
          </span>
          <span className="font-heading font-extrabold text-base text-primary">
            {formatCurrency(calculatedTotalMinor)}
          </span>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleCreateOrder}
          className="py-2.5 px-5 rounded-button bg-primary text-white font-bold text-xs shadow-elevation-1 hover:bg-primary-hover active:scale-95 disabled:opacity-60 transition-all flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Pay with Stripe</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
