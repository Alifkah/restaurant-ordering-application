"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import {
  Home,
  UtensilsCrossed,
  QrCode,
  ShoppingBag,
  User,
  X,
  Check,
  MapPin,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { totalItems, setIsCartOpen, tableNumber, setTableNumber, setDiningOption, clearTable } = useCart();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableInput, setTableInput] = useState(tableNumber || "");

  // Hide on admin and kitchen pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/kitchen")) {
    return null;
  }

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (tableInput.trim()) {
      setTableNumber(tableInput.trim());
      setDiningOption("dine_in");
      setIsTableModalOpen(false);
    }
  };

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Menu",
      href: "/menu",
      icon: UtensilsCrossed,
      isActive: pathname.startsWith("/menu"),
    },
    {
      label: "Dine-In",
      isCustom: true,
      onClick: () => {
        setTableInput(tableNumber || "");
        setIsTableModalOpen(true);
      },
      icon: QrCode,
      highlight: true,
    },
    {
      label: "Basket",
      isCustom: true,
      onClick: () => setIsCartOpen(true),
      icon: ShoppingBag,
      badge: totalItems,
      isActive: pathname === "/cart",
    },
    {
      label: session?.user ? "Account" : "Sign In",
      href: session?.user ? "/login" : "/login",
      icon: User,
      isActive: pathname === "/login" || pathname === "/register",
    },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sand-300 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-pb"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item, idx) => {
            const Icon = item.icon;

            if (item.highlight) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.onClick}
                  className="flex flex-col items-center -mt-5 group focus:outline-none"
                  aria-label="Dine-in Table Selector"
                >
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-elevation-2 group-hover:scale-105 transition-transform border-4 border-[#F9F6F0]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-stone-800 mt-0.5">
                    {tableNumber ? `T-${tableNumber}` : "Dine-In"}
                  </span>
                </button>
              );
            }

            if (item.isCustom) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.onClick}
                  className="relative flex flex-col items-center py-1 px-3 text-stone-600 hover:text-primary transition-colors focus:outline-none"
                  aria-label={item.label}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 rounded-full bg-primary text-white text-[9px] font-extrabold flex items-center justify-center px-1 shadow-sm animate-scale-up">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium mt-1">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={idx}
                href={item.href!}
                className={`flex flex-col items-center py-1 px-3 transition-colors ${
                  item.isActive
                    ? "text-primary font-bold"
                    : "text-stone-600 hover:text-primary font-medium"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Table Number Quick Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in md:hidden">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-elevation-3 border border-sand-300 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-base text-stone-900">
                  Dine-In Table
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Enter your table number from the acrylic standee to order directly from your seat.
            </p>

            <form onSubmit={handleSaveTable} className="space-y-3">
              <input
                type="text"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
                placeholder="e.g. 04 or VIP-1"
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-button bg-sand-50 border border-sand-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-semibold text-stone-900 outline-none text-center"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-button bg-primary text-white font-semibold text-xs shadow-elevation-1 hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Table Number</span>
              </button>

              {tableNumber && (
                <button
                  type="button"
                  onClick={() => {
                    clearTable();
                    setDiningOption("takeaway");
                    setIsTableModalOpen(false);
                  }}
                  className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-medium"
                >
                  Switch to Takeaway Order
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
