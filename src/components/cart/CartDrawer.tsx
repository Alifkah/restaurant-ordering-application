"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import MenuImage from "@/components/ui/MenuImage";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    totalItems,
    formattedSubtotal,
  } = useCart();

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-elevation-3 flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-sand-300 flex items-center justify-between bg-sand-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-stone-900">
                  Dining Basket
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {totalItems} {totalItems === 1 ? "dish selected" : "dishes selected"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-button text-stone-400 hover:text-stone-700 hover:bg-sand-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body / Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-sand-200 text-stone-400 flex items-center justify-center mb-4">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-stone-800 mb-1">
                  Your Basket is Empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Select authentic specialties from our culinary catalog to begin your order.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-button bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-card border border-sand-200 bg-sand-50/40 flex gap-3.5 items-start"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand-200 flex-shrink-0">
                    <MenuImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-heading font-semibold text-sm text-stone-900 truncate">
                        {item.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options Snapshot */}
                    {item.selectedOptions.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selectedOptions.map((opt) => (
                          <p key={opt.id} className="text-[11px] text-stone-500 truncate">
                            • {opt.name}{" "}
                            {opt.priceDeltaMinor > 0 &&
                              `(+${formatCurrency(opt.priceDeltaMinor)})`}
                          </p>
                        ))}
                      </div>
                    )}

                    {item.note && (
                      <p className="text-[11px] text-primary/90 italic mt-1 truncate">
                        Note: &ldquo;{item.note}&rdquo;
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="font-semibold text-xs text-primary">
                        {formatCurrency(item.lineTotalMinor)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-sand-300 rounded-button bg-white overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:bg-sand-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:bg-sand-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-sand-300 bg-white space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600 font-medium">Subtotal</span>
                <span className="font-heading font-bold text-lg text-stone-900">
                  {formattedSubtotal}
                </span>
              </div>

              <p className="text-[11px] text-stone-500">
                Applicable restaurant tax (PB1 10%) will be calculated at checkout.
              </p>

              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3 rounded-button bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors shadow-elevation-1 flex items-center justify-center gap-2"
              >
                <span>Review Basket & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
