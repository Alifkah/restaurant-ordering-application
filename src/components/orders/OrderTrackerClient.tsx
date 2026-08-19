"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  Printer,
  ChevronDown,
  ChevronUp,
  Receipt,
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
  { key: "pending", label: "Accepted", desc: "Order received & ticket queued", icon: Clock },
  { key: "confirmed", label: "Confirmed", desc: "Kitchen staff assigned", icon: ShieldCheck },
  { key: "preparing", label: "Preparing", desc: "Chef is crafting your meal", icon: Flame },
  { key: "ready", label: "Ready / Delivered", desc: "Freshly plated & served", icon: UtensilsCrossed },
];

export default function OrderTrackerClient({ orderId }: { orderId: string }) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<{
    productId: string;
    productName: string;
  } | null>(null);

  // Guest Account Conversion State
  const [claimEmail, setClaimEmail] = useState("");
  const [claimPassword, setClaimPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Accordion state
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setOrder(json.data);
      } else {
        setError(json.error?.message || "Order not found.");
      }
    } catch {
      setError("Failed to connect to restaurant server.");
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

  const handleClaimAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError(null);

    if (!claimEmail.trim() || !claimPassword.trim()) {
      setClaimError("Please provide both email and a password.");
      return;
    }

    if (claimPassword.length < 6) {
      setClaimError("Password must be at least 6 characters.");
      return;
    }

    setClaimLoading(true);

    try {
      const res = await fetch("/api/auth/claim-guest-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          email: claimEmail.trim(),
          password: claimPassword,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setClaimSuccess(true);
      } else {
        setClaimError(json.error?.message || "Failed to save account. Please try again.");
      }
    } catch {
      setClaimError("Connection error while saving account.");
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card bg-white rounded-card border border-sand-300 text-center space-y-4 shadow-elevation-1">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm font-semibold text-stone-700">
          Loading live kitchen progress...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card bg-white rounded-card border border-red-200 text-center space-y-4 shadow-elevation-1">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-heading text-lg font-bold text-stone-900">
          Failed to Load Tracker
        </h2>
        <p className="text-xs text-stone-600">{error}</p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Back to Menu</span>
        </Link>
      </div>
    );
  }

  // Calculate current stage index for 4-step stepper
  const stageKeys = ["pending", "confirmed", "preparing", "ready"];
  let currentStageIndex = stageKeys.indexOf(order.status);
  if (order.status === "completed") {
    currentStageIndex = 3;
  }
  const isCancelled = order.status === "cancelled";

  // Estimated arrival time string (~20 min from creation)
  const orderDate = new Date(order.createdAt);
  const estimatedDate = new Date(orderDate.getTime() + 20 * 60 * 1000);
  const estimatedTimeStr = estimatedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const serviceCharge = Math.round(order.subtotalMinor * 0.05);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 md:pb-6">
      {/* 1. Hero Header */}
      <div className="text-center space-y-1.5 pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Kitchen Feed</span>
        </span>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900">
          {order.status === "ready" || order.status === "completed"
            ? "Your meal is ready to enjoy!"
            : order.status === "preparing"
            ? "Preparing your meal"
            : "Order confirmed by kitchen"}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          Estimated arrival: <span className="font-bold text-stone-800">{estimatedTimeStr}</span> (~20 mins from order)
        </p>
      </div>

      {/* 2. Order Status Card */}
      <div className="glass-card bg-white rounded-2xl p-5 sm:p-7 border border-sand-300 shadow-elevation-2 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand-200 pb-4">
          <div>
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
              Reference
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-stone-900 font-mono">
              {order.orderNumber}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                order.status === "ready" || order.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : order.status === "cancelled"
                  ? "bg-red-50 text-red-700 border-red-300"
                  : "bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
              }`}
            >
              {order.status === "ready" || order.status === "completed"
                ? "DONE"
                : order.status === "cancelled"
                ? "CANCELLED"
                : "IN PROGRESS"}
            </span>

            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                sseConnected ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>{sseConnected ? "Live" : "Syncing"}</span>
            </div>
          </div>
        </div>

        {/* 4-Step Interactive Stepper */}
        {isCancelled ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-center space-y-1">
            <p className="font-bold text-sm">Order Cancelled</p>
            <p className="text-xs">This order was cancelled by restaurant management or customer service.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 relative text-center">
              {STAGES.map((stage, idx) => {
                const IconComponent = stage.icon;
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                let iconClass = "bg-sand-100 text-stone-400 border-sand-300";
                let textClass = "text-stone-400";
                let titleClass = "text-stone-500 font-semibold";

                if (isPassed) {
                  iconClass = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
                  titleClass = "text-stone-900 font-bold";
                  textClass = "text-stone-600";
                } else if (isCurrent) {
                  iconClass =
                    "bg-primary text-white border-primary shadow-elevation-1 ring-4 ring-primary/20 animate-pulse";
                  titleClass = "text-primary font-extrabold";
                  textClass = "text-stone-800 font-medium";
                }

                return (
                  <div key={stage.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all ${iconClass}`}
                    >
                      {isPassed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-[11px] sm:text-xs mt-2 block ${titleClass}`}>
                      {stage.label}
                    </span>
                    <span className={`hidden sm:block text-[10px] mt-0.5 leading-tight ${textClass}`}>
                      {stage.desc}
                    </span>
                  </div>
                );
              })}

              {/* Progress track bar across the 4 steps */}
              <div className="absolute top-5 sm:top-6 left-8 right-8 h-1 bg-sand-200 -z-0">
                <div
                  className="h-full bg-emerald-600 transition-all duration-700"
                  style={{
                    width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Customer Note / Table Banner */}
        {order.customerNote && (
          <div className="p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-700 flex items-start gap-2">
            <span className="font-bold text-stone-900 flex-shrink-0">Instructions:</span>
            <span>{order.customerNote}</span>
          </div>
        )}
      </div>

      {/* 3. Card "Save this order" (Guest Account Conversion) */}
      {!session?.user && (
        <div className="rounded-2xl p-5 sm:p-6 bg-[#FFF3ED] border border-[#FAD8C3] shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-stone-900">
                Save this order
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Set a password to create an account and easily reorder your favorites.
              </p>
            </div>
          </div>

          {claimSuccess ? (
            <div className="p-3.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
              <span>Account successfully saved! You can now sign in with your email and password.</span>
            </div>
          ) : (
            <form onSubmit={handleClaimAccount} className="space-y-3 pt-1">
              {claimError && (
                <div className="p-2.5 rounded-lg bg-red-100 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{claimError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="email"
                  value={claimEmail}
                  onChange={(e) => setClaimEmail(e.target.value)}
                  placeholder="Your Email Address"
                  required
                  className="w-full px-3.5 py-2.5 rounded-button bg-white border border-sand-300 text-xs text-stone-900 outline-none focus:border-primary"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={claimPassword}
                    onChange={(e) => setClaimPassword(e.target.value)}
                    placeholder="Create Password"
                    required
                    className="w-full px-3.5 py-2.5 pr-9 rounded-button bg-white border border-sand-300 text-xs text-stone-900 outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={claimLoading}
                className="w-full py-2.5 rounded-button bg-primary text-white font-bold text-xs shadow-sm hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {claimLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Account...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Save Account & Order</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 4. Order Details Accordion */}
      <div className="glass-card bg-white rounded-2xl border border-sand-300 shadow-elevation-1 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-sand-50/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold text-sm text-stone-900 uppercase tracking-wider">
              Order Details & Receipt ({order.items.length} {order.items.length === 1 ? "dish" : "dishes"})
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <span>{formatCurrency(order.totalMinor)}</span>
            {isAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isAccordionOpen && (
          <div className="p-5 pt-0 border-t border-sand-200/60 space-y-4">
            <div className="divide-y divide-sand-200">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 first:pt-3 last:pb-0 flex justify-between gap-4">
                  <div>
                    <p className="font-heading font-bold text-xs sm:text-sm text-stone-900">
                      {item.quantity}x {item.productName}
                    </p>
                    {item.options.length > 0 && (
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {item.options.map((o) => o.name).join(" • ")}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-[11px] text-primary italic mt-0.5">
                        Note: &ldquo;{item.note}&rdquo;
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
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors"
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Review Dish</span>
                        </button>
                      )}
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-stone-800 flex-shrink-0">
                    {formatCurrency(item.lineTotalMinor)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-sand-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Service Charge (5%)</span>
                <span>{formatCurrency(serviceCharge)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Restaurant Tax (PB1 10%)</span>
                <span>{formatCurrency(order.taxMinor)}</span>
              </div>
              <div className="pt-2 border-t border-sand-200 flex justify-between items-baseline font-bold">
                <span className="text-stone-900">Total Payment</span>
                <span className="text-base sm:text-lg text-primary font-extrabold">
                  {formatCurrency(order.totalMinor)}
                </span>
              </div>
            </div>

            {/* Print Receipt Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="text-xs text-stone-600 hover:text-stone-900 font-semibold inline-flex items-center gap-1.5 p-1.5 rounded hover:bg-sand-100 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-stone-500" />
                <span>View / Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Navigation Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/menu"
          className="flex-1 py-3.5 rounded-button bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-hover transition-colors shadow-elevation-1 flex items-center justify-center gap-2"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Order More Dishes</span>
        </Link>
        <Link
          href="/"
          className="py-3.5 px-6 rounded-button bg-white text-stone-800 font-semibold text-xs sm:text-sm border border-sand-300 hover:bg-sand-50 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
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
