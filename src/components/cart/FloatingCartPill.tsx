"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function FloatingCartPill() {
  const { totalItems, formattedSubtotal, setIsCartOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <aside aria-label="Dining Basket Summary" className="fixed bottom-6 right-6 z-40 animate-slide-up">
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="px-5 py-3 rounded-full bg-stone-900 text-white shadow-elevation-3 hover:bg-stone-800 transition-all flex items-center gap-3 border border-sand-300/30 group"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] flex items-center justify-center border-2 border-stone-900">
            {totalItems}
          </span>
        </div>

        <div className="text-left pr-1">
          <p className="text-[11px] text-stone-300 font-medium leading-none">
            Your Basket
          </p>
          <p className="font-heading font-bold text-sm text-white leading-tight mt-0.5">
            {formattedSubtotal}
          </p>
        </div>

        <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </aside>
  );
}
